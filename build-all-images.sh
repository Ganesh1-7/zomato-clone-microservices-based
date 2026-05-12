#!/bin/bash
set -euo pipefail

# Builds docker images for all microservices under backend/services.
# Usage:
#   bash build-all-images.sh
# Optional:
#   SERVICE_TAG=latest bash build-all-images.sh

ROOT_DIR="$(pwd)"
TAG="${SERVICE_TAG:-latest}"

BACKEND_DIR="${ROOT_DIR}/backend"
SERVICES_DIR="${BACKEND_DIR}/services"

if [[ ! -d "${SERVICES_DIR}" ]]; then
  echo "Services directory not found: ${SERVICES_DIR}" >&2
  exit 1
fi

services=(
  user-service
  restaurant-service
  order-service
  payment-service
  delivery-service
  frontend
)


for svc in "${services[@]}"; do
  if [[ "${svc}" == "frontend" ]]; then
    svc_dir="${ROOT_DIR}/frontend"
    dockerfile="${svc_dir}/Dockerfile"
  else
    svc_dir="${SERVICES_DIR}/${svc}"
    dockerfile="${svc_dir}/Dockerfile"
  fi

  if [[ ! -f "${dockerfile}" ]]; then
    echo "Skipping ${svc}: Dockerfile not found at ${dockerfile}" >&2
    continue
  fi

  image_name="zomato-${svc}:${TAG}"
  echo "Building ${image_name} from ${svc_dir}..."

  docker build -t "${image_name}" "${svc_dir}"

done

echo "Done. Built images:" 
for svc in "${services[@]}"; do
  echo " - zomato-${svc}:${TAG}"
  docker push ganesh1702/${svc}:${TAG}
done

