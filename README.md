# Zomato Clone — Production Ready

A modern, production-grade food delivery application built with React 19, TypeScript, Vite, and Tailwind CSS. Features restaurant browsing, menu exploration, cart management, checkout flow, and a comprehensive design system. The backend is built as independent Node.js microservices with an nginx API gateway.

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
│   ├── docker-compose.yml      # Backend services orchestration
│   └── package.json
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

# Start services with Docker
npm run docker:build
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
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

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Full Stack with Docker Compose (Root)

```bash
# From the project root
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Complete stack will be available at `http://localhost` (frontend) and `http://localhost:8080` (API gateway).

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

## License

MIT — Open source for educational and commercial use.

