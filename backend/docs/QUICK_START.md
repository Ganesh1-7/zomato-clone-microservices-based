# Quick Start Guide

## Prerequisites
- Node.js 18+
- Docker & Docker Compose (optional)

## Option 1: Local Development (No Docker)

```bash
cd "New folder"
npm install

# Terminal 1 - User Service
npm run start:user

# Terminal 2 - Restaurant Service
npm run start:restaurant

# Terminal 3 - Order Service
npm run start:order

# Terminal 4 - Delivery Service
npm run start:delivery
```

Or start all at once:
```bash
npm run dev
```

Services will be available at:
- User: http://localhost:3001
- Restaurant: http://localhost:3002
- Order: http://localhost:3003
- Delivery: http://localhost:3004

## Option 2: Docker (Recommended)

```bash
cd "New folder"
docker-compose up --build
```

All services + Nginx gateway will start. Access via:
- API Gateway: http://localhost
- Individual services: http://localhost:3001-3004

## Verify Installation

```bash
# Health checks
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health

# Test restaurant API
curl http://localhost:3002/api/restaurants

# Test with gateway (Docker)
curl http://localhost/api/restaurants
```

## Frontend Connection

Update your frontend API base URL to:
- Local dev: `http://localhost:3001` (or respective port)
- With Docker gateway: `http://localhost`

