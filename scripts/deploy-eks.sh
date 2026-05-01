#!/bin/bash
# EKS Deployment Script for Zomato Clone
# This script deploys the application to Amazon EKS

set -e

# ============ CONFIGURATION ============
# Update these values for your environment
AWS_REGION="ap-south-1"
EKS_CLUSTER="zomato-cluster"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
NAMESPACE="zomato"
IMAGE_TAG="latest"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============ FUNCTIONS ============
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============ PRE-CHECKS ============
log_info "Running pre-checks..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    log_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    log_error "kubectl is not installed. Please install it first."
    exit 1
fi

# Check if eksctl is installed
if ! command -v eksctl &> /dev/null; then
    log_warn "eksctl is not installed. Installing..."
    brew install weaveworks/tap/eksctl
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    log_error "AWS credentials not configured. Run 'aws configure' first."
    exit 1
fi

log_info "Pre-checks passed!"

# ============ CREATE EKS CLUSTER (if not exists) ============
log_info "Checking if EKS cluster exists..."

if ! aws eks describe-cluster --name $EKS_CLUSTER --region $AWS_REGION &> /dev/null; then
    log_info "Creating EKS cluster..."
    eksctl create cluster \
        --name $EKS_CLUSTER \
        --region $AWS_REGION \
        --nodegroup-name standard-nodes \
        --node-type t3.medium \
        --nodes-min 2 \
        --nodes-max 10 \
        --nodes 3 \
        --managed
else
    log_info "EKS cluster already exists."
fi

# ============ UPDATE KUBECONFIG ============
log_info "Updating kubeconfig..."
aws eks update-kubeconfig --name $EKS_CLUSTER --region $AWS_REGION

# ============ CREATE NAMESPACE ============
log_info "Creating namespace..."
kubectl apply -f k8s/namespace/

# ============ CREATE ECR REPOSITORIES ============
log_info "Ensuring ECR repositories exist..."
aws ecr create-repository --repository-name frontend --region $AWS_REGION || true
aws ecr create-repository --repository-name gateway --region $AWS_REGION || true
aws ecr create-repository --repository-name user-service --region $AWS_REGION || true
aws ecr create-repository --repository-name restaurant-service --region $AWS_REGION || true
aws ecr create-repository --repository-name order-service --region $AWS_REGION || true
aws ecr create-repository --repository-name payment-service --region $AWS_REGION || true
aws ecr create-repository --repository-name delivery-service --region $AWS_REGION || true

# ============ BUILD AND PUSH IMAGES ============
log_info "Building and pushing Docker images to ECR..."

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stin $ECR_REGISTRY

# Build and push frontend
log_info "Building frontend image..."
docker build -t $ECR_REGISTRY/frontend:$IMAGE_TAG ./frontend
docker push $ECR_REGISTRY/frontend:$IMAGE_TAG

# Build and push gateway
log_info "Building gateway image..."
docker build -t $ECR_REGISTRY/gateway:$IMAGE_TAG ./backend/gateway
docker push $ECR_REGISTRY/gateway:$IMAGE_TAG

# Build and push backend services
for service in user-service restaurant-service order-service payment-service delivery-service; do
    log_info "Building $service image..."
    docker build -t $ECR_REGISTRY/$service:$IMAGE_TAG ./backend/services/$service
    docker push $ECR_REGISTRY/$service:$IMAGE_TAG
done

# ============ UPDATE DEPLOYMENT FILES ============
log_info "Updating deployment files with ECR image paths..."

# Use sed to update image paths in deployment files
sed -i "s|image: ganesh1702/frontend:*|image: $ECR_REGISTRY/frontend:${IMAGE_TAG}|g" k8s/deployment/frontend.yaml
sed -i "s|image: ganesh1702/gateway:*|image: $ECR_REGISTRY/gateway:${IMAGE_TAG}|g" k8s/deployment/gateway.yaml
sed -i "s|image: ganesh1702/user-service:*|image: $ECR_REGISTRY/user-service:${IMAGE_TAG}|g" k8s/deployment/user-service.yaml
sed -i "s|image: ganesh1702/restaurant-service:*|image: $ECR_REGISTRY/restaurant-service:${IMAGE_TAG}|g" k8s/deployment/restaurant-service.yaml
sed -i "s|image: ganesh1702/order-service:*|image: $ECR_REGISTRY/order-service:${IMAGE_TAG}|g" k8s/deployment/order-service.yaml
sed -i "s|image: ganesh1702/payment-service:*|image: $ECR_REGISTRY/payment-service:${IMAGE_TAG}|g" k8s/deployment/payment-service.yaml
sed -i "s|image: ganesh1702/delivery-service:*|image: $ECR_REGISTRY/delivery-service:${IMAGE_TAG}|g" k8s/deployment/delivery-service.yaml

# ============ DEPLOY TO EKS ============
log_info "Deploying Kubernetes resources..."

# Apply ConfigMaps
kubectl apply -f k8s/configmap/

# Apply Services
kubectl apply -f k8s/services/

# Apply Deployments
kubectl apply -f k8s/deployment/

# Apply Ingress (using AWS ALB)
kubectl apply -f k8s/ingress/zomato-ingress-aws-alb.yaml

# Apply PDB (and HPA - co-located in deployment files)
kubectl apply -f k8s/deployment/pod-disruption-budget.yaml

# ============ VERIFY DEPLOYMENT ============
log_info "Verifying deployment..."

# Wait for deployments to be ready
log_info "Waiting for frontend deployment..."
kubectl rollout status deployment/frontend --timeout=300s

log_info "Waiting for gateway deployment..."
kubectl rollout status deployment/gateway --timeout=300s

log_info "Waiting for user-service deployment..."
kubectl rollout status deployment/user-service --timeout=300s

log_info "Waiting for restaurant-service deployment..."
kubectl rollout status deployment/restaurant-service --timeout=300s

log_info "Waiting for order-service deployment..."
kubectl rollout status deployment/order-service --timeout=300s

log_info "Waiting for payment-service deployment..."
kubectl rollout status deployment/payment-service --timeout=300s

log_info "Waiting for delivery-service deployment..."
kubectl rollout status deployment/delivery-service --timeout=300s

# ============ DISPLAY STATUS ============
log_info "Deployment complete!"

echo ""
echo "=============== STATUS ==============="
echo ""
kubectl get pods -n $NAMESPACE -o wide
echo ""
kubectl get svc -n $NAMESPACE
echo ""
kubectl get ingress -n $NAMESPACE
echo ""
kubectl get hpa -n $NAMESPACE
echo ""

log_info "To access the application:"
log_info "1. Configure your domain DNS to point to the ALB DNS name"
log_info "2. Get ALB DNS name: kubectl get ingress -n $NAMESPACE"
log_info "3. Update the host configuration in zomato-ingress-aws-alb.yaml with your domain"
