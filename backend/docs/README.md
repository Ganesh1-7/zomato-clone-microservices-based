# Zomato Clone - Microservices Backend

A complete microservices backend for the Zomato Clone food delivery application.

## Architecture

```
┌─────────────────────────────────────┐
│           API Gateway (Nginx)        │
│                Port 80               │
└──────────┬────────────┬─────────────┘
           │            │
    ┌──────▼──────┐    ┌▼─────────────┐
    │  User Svc   │    │ Restaurant   │
    │   :3001     │    │   Svc :3002  │
    └─────────────┘    └──────────────┘
    ┌─────────────┐    ┌──────────────┐
    │  Order Svc  │    │  Delivery    │
    │   :3003     │    │   Svc :3004  │
    └─────────────┘    └──────────────┘
```

## Services

| Service | Port | Responsibility |
|---------|------|----------------|
| User Service | 3001 | Authentication, profiles, addresses |
| Restaurant Service | 3002 | Restaurants, menus, cuisines, search |
| Order Service | 3003 | Cart, checkout, orders, history |
| Delivery Service | 3004 | Drivers, tracking, ETA, live location |

## Quick Start

```bash
# Install dependencies
npm install

# Start all services locally
npm run dev

# Or with Docker
docker-compose up --build
```

## API Endpoints

### User Service (`/api/users/`)
- `POST /register` - Create account
- `POST /login` - Authenticate
- `POST /logout` - End session
- `GET /me` - Get profile
- `PUT /me` - Update profile
- `GET /me/addresses` - List addresses
- `POST /me/addresses` - Add address
- `PUT /me/addresses/:id` - Update address
- `DELETE /me/addresses/:id` - Remove address

### Restaurant Service (`/api/restaurants/`)
- `GET /` - List restaurants (with search, filter, sort)
- `GET /:id` - Get restaurant details
- `GET /:id/menu` - Get menu
- `GET /:id/menu/:itemId` - Get menu item
- `GET /api/cuisines` - List cuisines
- `GET /api/categories` - List categories

### Order Service (`/api/orders/`, `/api/cart/`)
- `GET /api/cart` - Get cart
- `POST /api/cart/items` - Add item
- `PUT /api/cart/items/:id` - Update quantity
- `DELETE /api/cart/items/:id` - Remove item
- `DELETE /api/cart` - Clear cart
- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order
- `POST /api/orders` - Place order
- `PATCH /api/orders/:id/cancel` - Cancel order

### Delivery Service (`/api/deliveries/`, `/api/tracking/`)
- `GET /api/drivers` - List drivers
- `GET /api/deliveries` - List deliveries
- `POST /api/deliveries` - Create delivery
- `GET /api/tracking/:orderId` - Track order
- `PATCH /api/deliveries/:id/status` - Update status

## Frontend Integration

The services expose REST APIs that the React frontend can consume via the API Gateway at `http://localhost`.

## License

MIT
