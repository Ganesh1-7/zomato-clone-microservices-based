# Project Summary

## Zomato Clone - Full Stack Food Delivery App

This project is a complete full-stack food delivery application clone inspired by Zomato/Swiggy.

### Frontend (React + Vite)
- Modern React 19 with TypeScript
- Responsive design with Tailwind CSS
- Client-side routing with React Router
- Component-based architecture
- Features: restaurant listing, search/filter, cart, checkout

### Backend (Node.js Microservices)
- 4 independent microservices
- REST API design
- API Gateway pattern with Nginx
- Docker containerization
- Health checks and monitoring

### Service Communication
```
Frontend (Port 5173)
    |
    V
Nginx Gateway (Port 80)
    |
    |--> User Service (3001)
    |--> Restaurant Service (3002)
    |--> Order Service (3003)
    |--> Delivery Service (3004)
```

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Gateway | Nginx |
| Container | Docker, Docker Compose |
| Data | In-memory (extensible to MongoDB/PostgreSQL) |

### Features
- Restaurant browsing with filters
- Menu viewing by category
- Shopping cart with quantity management
- Checkout with address & payment
- Order tracking simulation
- Delivery driver assignment
- User authentication
- Address management

