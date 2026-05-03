#!/usr/bin/env bash
# AWS Kubernetes Deployment Script

set -e

echo \"=== Zomato Clone AWS K8s Deployment ===\"

# Check kubectl context
kubectl config current-context || echo \"No context set, configure kubeconfig\"

# Create namespaces
echo \"Creating namespaces...\"
kubectl apply -f k8s/namespace/zomato-namespace.yaml
kubectl apply -f k8s/deployment/ingress-nginx.yaml  # includes ingress-nginx ns

# Wait for ingress controller
echo \"Waiting for ingress-nginx...\"
kubectl rollout status deployment/ingress-nginx-controller -n ingress-nginx --timeout=300s

# Deploy ingress
kubectl apply -f k8s/deployment/zomato-ingress.yaml -n zomato

# Deploy services
for yaml in frontend gateway user-service restaurant-service order-service payment-service delivery-service; do
  echo \"Deploying $yaml...\"
  kubectl apply -f k8s/deployment/${yaml}.yaml -n zomato
done

# Wait all ready
echo \"Waiting for deployments...\"
kubectl rollout status deployment --namespace=zomato --timeout=300s

echo \"=== Deployment Complete ===\"

echo \"Get LoadBalancer:\"
kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

echo \"Update DNS for zomato.local api.zomato.local to that IP/DNS\"
echo \"kubectl get all -n zomato\"

