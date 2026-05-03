#!/usr/bin/env bash
# Deploy script for Minikube

set -e

echo "=== Zomato Clone Minikube Deployment ==="

# Check if minikube is running
if ! minikube status &>/dev/null; then
    echo "Starting Minikube..."
    minikube start --memory=4096 --cpus=2
fi

# Disable minikube's built-in ingress addon to use custom deployment instead
echo "Disabling minikube ingress addon (using custom deployment)..."
minikube addons disable ingress || true

# Build and load Docker images into Minikube
echo "Building Docker images..."
cd "$(dirname "$0")/../backend"

echo "Building gateway image..."
docker build -t ganesh1702/gateway:latest ./gateway

echo "Building user-service image..."
docker build -t ganesh1702/user-service:latest ./services/user-service

echo "Building restaurant-service image..."
docker build -t ganesh1702/restaurant-service:latest ./services/restaurant-service

echo "Building order-service image..."
docker build -t ganesh1702/order-service:latest ./services/order-service

echo "Building payment-service image..."
docker build -t ganesh1702/payment-service:latest ./services/payment-service

echo "Building delivery-service image..."
docker build -t ganesh1702/delivery-service:latest ./services/delivery-service

echo "Building frontend image..."
cd ../frontend
docker build -t ganesh1702/frontend:latest .

# Save images before switching to minikube docker
echo "Preparing images for Minikube..."
IMAGES="gateway user-service restaurant-service order-service payment-service delivery-service frontend"
for image in $IMAGES; do
    echo "Saving ganesh1702/$image:latest..."
    docker save ganesh1702/$image:latest -o /tmp/$image.tar
done

# Load images into minikube
echo "Loading images into Minikube..."
eval $(minikube docker-env)
for image in $IMAGES; do
    echo "Loading ganesh1702/$image:latest..."
    minikube image load /tmp/$image.tar
    rm -f /tmp/$image.tar
done

# Apply Kubernetes manifests (skip ingress-nginx.yaml when using minikube addon)
echo "Deploying to Kubernetes..."
cd "$(dirname "$0")/../k8s/deployment"

# Clean up existing ingress-nginx resources to avoid selector immutability error
echo "Cleaning up existing ingress-nginx resources..."
kubectl delete deployment ingress-nginx-controller -n ingress-nginx --ignore-not-found=true 2>/dev/null || true
kubectl delete service ingress-nginx-controller -n ingress-nginx --ignore-not-found=true 2>/dev/null || true
kubectl delete deployment ingress-nginx -n kube-system --ignore-not-found=true 2>/dev/null || true
kubectl delete deployment ingress-nginx -n ingress-nginx --ignore-not-found=true 2>/dev/null || true
kubectl delete ingressclass nginx --ignore-not-found=true 2>/dev/null || true
kubectl delete clusterrole ingress-nginx --ignore-not-found=true 2>/dev/null || true
kubectl delete clusterrolebinding ingress-nginx --ignore-not-found=true 2>/dev/null || true
kubectl delete validatingwebhookconfiguration ingress-nginx-admission --ignore-not-found=true 2>/dev/null || true

# Create namespace first
echo "Creating zomato namespace..."
kubectl create namespace zomato --dry-run=client -o yaml | kubectl apply -f -

# Create namespace and ingress controller
kubectl apply -f ingress-nginx.yaml

# Restart the ingress controller to pick up new args (especially --enable-admission-webhooks)
echo "Restarting ingress controller to apply new configuration..."
kubectl rollout restart deployment/ingress-nginx-controller -n ingress-nginx

# Wait for ingress controller to be ready (increased timeout)
echo "Waiting for ingress controller..."
sleep 60  # Allow more time for webhook to start
kubectl rollout status deployment/ingress-nginx-controller -n ingress-nginx --timeout=180s

# Wait for webhook to be ready
echo "Waiting for admission webhook to be ready..."
for i in {1..12}; do
    if kubectl get pods -n ingress-nginx -l app.kubernetes.io/component=controller -o jsonpath='{.items[0].status.conditions[?(@.type=="Ready")].status}' 2>/dev/null | grep -q "True"; then
        break
    fi
    echo "Waiting for webhook... ($i/12)"
    sleep 5
done

# Delete the validating webhook if it exists (to allow ingress creation)
# This is needed because the webhook may not be running when ingress is created
echo "Deleting ingress-nginx-admission webhook (if exists)..."
kubectl delete ValidatingWebhookConfiguration ingress-nginx-admission --ignore-not-found=true || true

# Create ingress 
echo "Creating ingress..."
kubectl apply -f zomato-ingress.yaml || true

# Deploy services
kubectl apply -f gateway.yaml
kubectl apply -f user-service.yaml
kubectl apply -f restaurant-service.yaml
kubectl apply -f order-service.yaml
kubectl apply -f payment-service.yaml
kubectl apply -f delivery-service.yaml
kubectl apply -f frontend.yaml

# Wait for all deployments to be ready
echo "Waiting for all deployments..."
for service in gateway user-service restaurant-service order-service payment-service delivery-service frontend; do
    kubectl rollout status deployment/$service -n zomato --timeout=120s || true
done

echo "=== Deployment Complete ==="
echo ""
echo "Add the following to your /etc/hosts file:"
echo "$(minikube ip) zomato.local api.zomato.local"
echo ""
echo "Access the application at:"
echo "  http://zomato.local:30080"
echo "  http://api.zomato.local:30080"
echo ""
echo "To view pods: kubectl get pods -n zomato"
echo "To view services: kubectl get svc -n zomato"
echo "To delete everything: kubectl delete namespace zomato ingress-nginx"
