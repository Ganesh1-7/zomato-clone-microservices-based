# Zomato Clone (Microservices) — Production-Grade Setup

A food-delivery web application inspired by Zomato, implemented as a microservices architecture:

- **Frontend** (React + Vite) served via **nginx**
- **API Gateway** (nginx) routing requests to backend services
- Backend microservices (Node.js): **user**, **restaurant**, **order**, **payment**, **delivery**
- **Kubernetes** deployments with **ingress**
- **Observability**: **Prometheus**, **Grafana**, **Loki**, and **Promtail**

---

## Architecture

```
Browser
  |
  |  HTTP (zomato.local)
  v
Ingress (nginx) ──> Frontend (nginx)
                       |
                       | /api/*
                       v
                 API Gateway (nginx)
                       |
   -------------------------------------------------
   |        |           |           |           |
   v        v           v           v           v
User   Restaurant   Order      Delivery     Payment
Service Service      Service     Service     Service
```

---

## Prerequisites

### Local development

- Node.js **18+**
- npm

### Docker / Container registry

- Docker Engine
- A Docker registry (script uses **Docker Hub**)

### Kubernetes deployment

- `kubectl`
- An ingress controller (the manifests assume **nginx ingress**)
- (Optional) For monitoring to work well: enough cluster resources for Prometheus/Grafana/Loki

---

## Repository Layout

- `frontend/` — React application + nginx containerization (`frontend/Dockerfile`)
- `backend/` — Node.js microservices
  - `backend/services/*/` — individual service code + Dockerfile
- `k8s/` — Kubernetes manifests
  - `namespace.yaml`
  - `frontend.yaml`
  - `gateway.yaml` + `gateway-configmap.yaml`
  - `user-service.yaml`, `restaurant-service.yaml`, `order-service.yaml`, `payment-service.yaml`, `delivery-service.yaml`
  - `ingress-resources.yaml` (frontend ingress at `zomato.local`)
  - `monitoring/monitoring-namespace.yaml`, `monitoring/monitoring-stack.yaml`
  - `monitoring/promtail.yaml` (log shipping to Loki)

- `build-and-push-to-dockerhub.sh` — builds and pushes images to Docker Hub

---

## Local Setup (Frontend + Microservices)

### 1) Frontend

```bash
cd frontend
npm install
npm run dev
```

### 2) Backend microservices

Each service can be started independently (see `backend/package.json` scripts), for example:

```bash
cd backend/services/user-service
npm install
npm start
```

> Note: The exact start scripts are defined in `backend/package.json`.

---

## Docker Build + Push (Docker Hub)

The script builds backend service images using each service Dockerfile and pushes them to Docker Hub.

### Build & push

```bash
./build-and-push-to-dockerhub.sh
```

### What it does

- Builds:
  - `ganesh1702/restaurant-service:latest`
  - `ganesh1702/order-service:latest`
  - `ganesh1702/payment-service:latest`
  - `ganesh1702/delivery-service:latest`
- Pushes each `:latest` tag to Docker Hub

> **Important:** Kubernetes manifests reference `ganesh1702/<service>:latest` image tags.

---

## Kubernetes Deployment

### 1) Create namespaces

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/monitoring/monitoring-namespace.yaml
```

### 2) Deploy monitoring stack (Prometheus/Grafana/Loki)

```bash
kubectl apply -f k8s/monitoring/all.yaml
kubectl apply -f k8s/monitoring/promtail.yaml
```

### 3) Deploy backend services

```bash
kubectl apply -f k8s/user-service.yaml
kubectl apply -f k8s/restaurant-service.yaml
kubectl apply -f k8s/order-service.yaml
kubectl apply -f k8s/payment-service.yaml
kubectl apply -f k8s/delivery-service.yaml
```

### 4) Deploy gateway + frontend

```bash
kubectl apply -f k8s/gateway-configmap.yaml
kubectl apply -f k8s/gateway.yaml
kubectl apply -f k8s/frontend.yaml
```

### 5) Deploy ingress

```bash
kubectl apply -f k8s/ingress-resources.yaml
```

### 6) Access the application

The ingress is configured for host:

- `http://zomato.local/`

If your environment doesn’t already resolve `zomato.local`, add an entry to your local hosts file pointing to your ingress/load balancer IP.

---

## Networking & Ports

### NodePort Services (manifests)

- **Gateway**: NodePort `30080` → service `gateway` on port `80`
- **Frontend**: NodePort `30081` → service `frontend` on port `80`
- **Prometheus**: NodePort `30090`
- **Grafana**: NodePort `30091`

### Gateway health endpoint

- `GET /health` on the **gateway** returns:
  - `{"status":"UP","service":"api-gateway"}`

---

## Observability

### Loki + Promtail

- `promtail.yaml` ships pod logs from the `zomato` namespace to Loki at:
  - `http://loki.monitoring:3100/loki/api/v1/push`

### Grafana

Grafana is deployed with admin credentials:

- Username: `admin`
- Password: `admin`

### Dashboards

No dashboards are included in manifests; configure Grafana to query Loki/Prometheus depending on your logging/metrics needs.

---

## API Routing (Gateway)

The gateway nginx config routes these paths:

- `/api/users/` → `user-service`
- `/api/restaurants/` → `restaurant-service`
- `/api/cuisines` → `restaurant-service`
- `/api/categories` → `restaurant-service`
- `/api/cart/` → `order-service`
- `/api/orders/` and `/api/orders` → `order-service`
- `/api/deliveries/` and `/api/tracking/` → `delivery-service`
- `/api/payments/` and `/api/payments` → `payment-service`

---

## Security Notes (Production Readiness)

- Kubernetes probes are defined for every service (`/health`).
- Gateway includes:
  - DNS resolver (`resolve`) to prevent upstream resolution issues.
  - retry/timeouts for upstream calls.
  - CORS headers for browser compatibility.

Recommended improvements for production:

- Replace hardcoded Grafana admin credentials with Kubernetes secrets.
- Configure TLS termination at ingress.
- Use image tags with immutable versions (instead of `:latest`).
- Enable resource autoscaling (HPA) per service.

---

## License

MIT

