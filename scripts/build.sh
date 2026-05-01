#!/bin/bash

set -e

REGISTRY="ganesh1702"

# Build and push all services
SERVICES=(
  "frontend:frontend"
  "backend/gateway:gateway"
  "backend/services/user-service:user-service"
  "backend/services/restaurant-service:restaurant-service"
  "backend/services/order-service:order-service"
  "backend/services/payment-service:payment-service"
  "backend/services/delivery-service:delivery-service"
)

for item in "${SERVICES[@]}"; do
  IFS=':' read -r path name <<< "$item"
echo "Building $name..."
  docker build -t ${REGISTRY}/${name}:latest ${path}
  # docker push ${REGISTRY}/${name}:latest
done

echo "All images built and pushed successfully."