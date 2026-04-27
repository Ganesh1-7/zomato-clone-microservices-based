# Local Setup Guide

## Prerequisites Installation

### Node.js
Download and install from https://nodejs.org/ (v18+ recommended)

Verify:
```bash
node --version  # v18.x.x or higher
npm --version   # 9.x.x or higher
```

### Docker (Optional)
Download Docker Desktop from https://www.docker.com/products/docker-desktop

Verify:
```bash
docker --version
docker-compose --version
```

## Project Setup

### 1. Navigate to services directory
```bash
cd "New folder"
```

### 2. Install dependencies
```bash
npm install
```

This installs:
- express (web framework)
- cors (cross-origin support)
- uuid (unique IDs)
- dotenv (environment variables)

### 3. Environment Configuration
```bash
cp .env.example .env
# Edit .env if needed (default ports work fine)
```

### 4. Start Services

#### Method A: Individual Terminals (for debugging)
```bash
# Terminal 1
node user-service-server.js

# Terminal 2
node restaurant-service-server.js

# Terminal 3
node order-service-server.js

# Terminal 4
node delivery-service-server.js
```

#### Method B: Single Command
```bash
npm run dev
# Uses npm-run-all to start all services in parallel
```

#### Method C: Docker
```bash
docker-compose up --build
```

### 5. Verify Services

Open browser or use curl:
```bash
# User Service
curl http://localhost:3001/health

# Restaurant Service
curl http://localhost:3002/api/restaurants

# Order Service
curl http://localhost:3003/api/orders

# Delivery Service
curl http://localhost:3004/api/drivers
```

### 6. Frontend Integration

In your frontend code, set API base URL:
```javascript
// For local development (individual services)
const API_BASE = 'http://localhost:3001'; // user service
const RESTAURANT_API = 'http://localhost:3002'; // restaurant service

// Or with Docker gateway
const API_BASE = 'http://localhost'; // all services via nginx
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Change port in .env or kill existing process |
| CORS errors | Ensure cors middleware is loaded (already configured) |
| Module not found | Run `npm install` again |
| Docker build fails | Ensure Docker daemon is running |

## Development Tips

- Each service is independent - modify one without affecting others
- Services communicate via HTTP - no shared state
- In-memory data resets on restart - perfect for development
- Use Postman/Insomnia for API testing

