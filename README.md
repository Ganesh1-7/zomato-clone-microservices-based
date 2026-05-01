# Zomato Clone — Production Ready

A modern, production-grade food delivery application built with React 19, TypeScript, Vite, and Tailwind CSS. Features restaurant browsing, menu exploration, cart management, checkout flow, and a comprehensive design system. The backend is built as independent Node.js microservices with an nginx API gateway. Includes full observability with Prometheus, Grafana, Loki, and Node Exporter.

---

## Features

- **Restaurant Discovery** — Browse restaurants with ratings, delivery times, and discounts
- **Advanced Search & Filters** — Real-time search with debounce, cuisine filtering, rating filters, and sorting
- **Menu Browsing** — Categorized menu items with quantity selectors
- **Shopping Cart** — Multi-restaurant cart with persistent localStorage, quantity management, and order summary
- **Checkout Flow** — Form validation with input masking, toast notifications, and order confirmation
- **Responsive Design** — Mobile-first with hamburger menu, sticky header, and adaptive layouts
- **Accessibility** — ARIA labels, skip links, focus-visible states, screen-reader support
- **Error Resilience** — ErrorBoundary for crash recovery, 404 page, loading skeletons
- **PWA Ready** — Web manifest, theme color, responsive meta tags
- **Observability** — Prometheus metrics, Grafana dashboards, Loki log aggregation, Node Exporter host metrics

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| Routing | React Router DOM 7 |
| Icons | React Icons |
| Linting | ESLint 10 + typescript-eslint |
| Formatting | Prettier |
| Testing | Vitest |
| Container | Docker + nginx |
| Metrics | Prometheus + prom-client |
| Dashboards | Grafana |
| Logs | Loki + Promtail |
| Host Metrics | Node Exporter |

---

## Project Structure

```
zomato-microservices/
├── frontend/                   # React 19 + Vite frontend application
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── data/               # Mock data & local fallback
│   │   ├── services/           # API services & health checks
│   │   ├── types/              # TypeScript declarations
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/                 # Static assets
│   ├── Dockerfile              # Frontend Docker image
│   ├── nginx.conf              # Frontend nginx config
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                    # Node.js microservices
│   ├── gateway/
│   │   └── nginx.conf          # API Gateway config
│   ├── services/
│   │   ├── user-service/       # User management (port 3001)
│   │   ├── restaurant-service/ # Restaurant data (port 3002)
│   │   ├── order-service/      # Order processing (port 3003)
│   │   ├── delivery-service/   # Delivery tracking (port 3004)
│   │   └── payment-service/    # Payment processing (port 3005)
│   ├── config/
│   ├── docs/
│   ├── docker-compose.yml      # Backend-only orchestration
│   └── package.json
│
├── monitoring/                 # Observability stack
│   ├── prometheus/
│   │   └── prometheus.yml      # Scrape configs for all services
│   ├── grafana/
│   │   ├── dashboards/
│   │   │   └── microservices-dashboard.json
│   │   └── provisioning/
│   │       ├── datasources/
│   │       └── dashboards/
│   ├── loki/
│   │   └── loki.yml            # Log storage config
│   └── promtail/
│       └── promtail.yml        # Docker log shipper config
│
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD
│
├── docker-compose.yml          # Full stack orchestration (root)
├── .gitignore
└── README.md
```

---

## Quick Start

### Prerequisites
- Node.js 20+
- npm 10+
- Docker & Docker Compose (for full stack)

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Type check
npm run typecheck

# Lint code
npm run lint

# Run tests
npm run test

# Build for production
npm run build

# Preview production build
npm run preview
```

Frontend will be available at `http://localhost:5173`.

### Backend Development

```bash
cd backend

# Install all microservice dependencies
npm run install:all

# Start all services locally
npm run dev

# Start services with Docker (backend only, no monitoring)
npm run docker:build
npm run docker:up

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available:
- User Service: `http://localhost:3001`
- Restaurant Service: `http://localhost:3002`
- Order Service: `http://localhost:3003`
- Delivery Service: `http://localhost:3004`
- Payment Service: `http://localhost:3005`
- API Gateway: `http://localhost:8080`

---

## Production Deployment

### Frontend Docker

```bash
cd frontend

# Build image
docker build -t zomato-frontend:latest .

# Run container
docker run -p 8080:80 zomato-frontend:latest
```

Frontend will be available at `http://localhost:8080`.

### Backend Services with Docker Compose

```bash
cd backend

# Build and start all services (no monitoring)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Full Stack with Docker Compose (Root)

```bash
# From the project root — start everything including monitoring
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Complete stack will be available at `http://localhost` (frontend) and `http://localhost:8080` (API gateway).

---

## 🚀 Observability & Monitoring

The application ships with a complete observability stack:

| Tool | URL | Default Credentials | Purpose |
|------|-----|---------------------|---------|
| **Grafana** | http://localhost:3000 | `admin` / `admin` | Dashboards & visualization |
| **Prometheus** | http://localhost:9090 | — | Metrics collection & querying |
| **Loki** | http://localhost:3100 | — | Log aggregation & storage |
| **Node Exporter** | http://localhost:9100 | — | Host system metrics (CPU, memory, disk, network) |

### Dashboards Available

Grafana comes pre-loaded with the **Zomato Clone — Microservices Overview** dashboard, which includes:

- **Service Health Status** — 6 real-time status tiles for all microservices + Node Exporter
- **Request Rate (req/s)** — HTTP traffic across all services
- **Success Rate (%)** — 1xx-4xx vs 5xx error rates
- **Request Latency** — p50 and p95 duration histograms
- **Memory Usage (App)** — Node.js process memory per service
- **Host CPU Usage** — System CPU utilization from Node Exporter
- **Host Memory Usage** — System memory utilization from Node Exporter
- **Host Disk Usage** — Root filesystem utilization from Node Exporter
- **Host Network I/O** — Receive/transmit bytes from Node Exporter
- **Error Logs Stream** — Live error log tail from all containers (via Loki)

### Application Metrics Exposed

Each microservice exposes default Node.js + custom application metrics on `/metrics`:

| Metric | Type | Description |
|--------|------|-------------|
| `http_requests_total` | Counter | Total requests by method, route, status, service |
| `http_request_duration_seconds` | Histogram | Request latency distribution (11 buckets) |
| `orders_created_total` | Counter | Order placements (order-service) |
| `orders_cancelled_total` | Counter | Order cancellations (order-service) |
| `restaurant_searches_total` | Counter | Search & filter queries (restaurant-service) |
| `deliveries_created_total` | Counter | Delivery creations (delivery-service) |
| `deliveries_completed_total` | Counter | Deliveries completed (delivery-service) |
| `payments_processed_total` | Counter | Payments by status & method (payment-service) |
| `payments_refunded_total` | Counter | Refunds processed (payment-service) |
| `process_resident_memory_bytes` | Gauge | Node.js memory usage |
| `nodejs_eventloop_lag_seconds` | Gauge | Event loop lag |

### Host System Metrics (Node Exporter)

Node Exporter exposes hardware and OS metrics from the underlying host:

| Metric | Type | Description |
|--------|------|-------------|
| `node_cpu_seconds_total` | Counter | CPU time per mode (idle, user, system, etc.) |
| `node_memory_MemTotal_bytes` | Gauge | Total system memory |
| `node_memory_MemAvailable_bytes` | Gauge | Available system memory |
| `node_filesystem_size_bytes` | Gauge | Filesystem total size |
| `node_filesystem_avail_bytes` | Gauge | Filesystem available space |
| `node_network_receive_bytes_total` | Counter | Network bytes received per interface |
| `node_network_transmit_bytes_total` | Counter | Network bytes transmitted per interface |
| `node_load1` | Gauge | 1-minute load average |
| `node_load5` | Gauge | 5-minute load average |
| `node_load15` | Gauge | 15-minute load average |

### Logs

All container logs are automatically collected by **Promtail** and shipped to **Loki**. No application code changes needed. The nginx gateway outputs structured JSON logs. Query logs in Grafana's Explore view using LogQL:

```logql
{job="docker-logs"} |= "ERROR"
{container_name="order-service"} |= "cart"
```

---

## Service Ports

| Service | Host Port | Container Port | Notes |
|---------|-----------|----------------|-------|
| Frontend | `80` | `80` | nginx serving built React app |
| API Gateway | `8080` | `80` | nginx reverse proxy to services |
| User Service | `3001` | `3000` | Internal microservice |
| Restaurant Service | `3002` | `3000` | Internal microservice |
| Order Service | `3003` | `3000` | Internal microservice |
| Delivery Service | `3004` | `3000` | Internal microservice |
| Payment Service | `3005` | `3000` | Internal microservice |
| **Grafana** | **`3000`** | `3000` | **Observability dashboards** |
| **Prometheus** | **`9090`** | `9090` | **Metrics database** |
| **Loki** | **`3100`** | `3100` | **Log storage** |
| **Node Exporter** | **`9100`** | `9100` | **Host system metrics** |

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|----------|-------------|
| `VITE_USER_SERVICE_URL` | User Service base URL |
| `VITE_RESTAURANT_SERVICE_URL` | Restaurant Service base URL |
| `VITE_ORDER_SERVICE_URL` | Order Service base URL |
| `VITE_DELIVERY_SERVICE_URL` | Delivery Service base URL |
| `VITE_PAYMENT_SERVICE_URL` | Payment Service base URL |
| `VITE_APP_ENV` | Environment name |

---

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push/PR:

1. TypeScript type checking
2. ESLint validation
3. Unit tests (Vitest)
4. Production build
5. Docker image build (main branch only)

---

## Design System

The app uses a comprehensive CSS custom property design system in `index.css`:

- **Colors**: Primary orange, semantic greens/reds, full neutral scale
- **Shadows**: 6-level shadow system for depth
- **Spacing**: Consistent 8px-based spacing scale
- **Typography**: System font stack with fluid sizing
- **Animations**: Fade, slide, bounce, float, shimmer keyframes
- **Components**: Buttons, cards, inputs, badges, quantity selectors

---

## Performance Optimizations

- **Code Splitting**: Route-based lazy loading with React.lazy + Suspense
- **Chunking**: Vendor, router, and icons split into separate chunks
- **Memoization**: useMemo for cart totals, useCallback for event handlers
- **Debounced Search**: 300ms debounce on search input
- **CSS Optimization**: Terser minification, CSS minify in production
- **Asset Caching**: 1-year cache headers for static assets via nginx

---

## Accessibility (a11y)

- Skip-to-content link for keyboard navigation
- ARIA labels on all interactive elements
- Focus-visible states with custom outline styles
- Semantic HTML (header, main, footer, nav, button)
- Role attributes for landmarks and alerts
- Color contrast compliant with WCAG AA

---

## Kubernetes Deployment

All Kubernetes manifests are located in the `k8s/` directory.

### Prerequisites

- Kubernetes cluster (minikube, kind, Docker Desktop, or cloud)
- kubectl configured
- Ingress controller installed (NGINX Ingress Controller recommended)

### Quick Start

1. **Build images** (or use your CI/CD pipeline):

```bash
docker build -t zomato/user-service:latest ./backend/services/user-service
docker build -t zomato/restaurant-service:latest ./backend/services/restaurant-service
docker build -t zomato/order-service:latest ./backend/services/order-service
docker build -t zomato/delivery-service:latest ./backend/services/delivery-service
docker build -t zomato/payment-service:latest ./backend/services/payment-service
docker build -t zomato/frontend:latest ./frontend
```

2. **Load images into cluster** (for local clusters):

```bash
# minikube
minikube image load zomato/user-service:latest
# ... repeat for all images

# kind
kind load docker-image zomato/user-service:latest
# ... repeat for all images
```

3. **Deploy**:

```bash
kubectl apply -f k8s/
```

4. **Verify**:

```bash
kubectl get all -n zomato-app
```

5. **Access**:

Get the ingress IP and add host entries:

```bash
kubectl get ingress -n zomato-app
```

Add to your hosts file:
```
<INGRESS_IP>  zomato.local
<INGRESS_IP>  grafana.zomato.local
<INGRESS_IP>  prometheus.zomato.local
```

- Application: http://zomato.local
- Grafana: http://grafana.zomato.local (admin / admin)
- Prometheus: http://prometheus.zomato.local

For detailed instructions, see [k8s/README.md](k8s/README.md).

---

## License

MIT — Open source for educational and commercial use.
