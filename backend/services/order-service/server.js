/**
 * Zomato Clone - Order Service
 * Port: 3003
 * Responsibilities: Orders, cart, checkout, order history
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const client = require('prom-client');
const { createRequestIdMiddleware } = require('../../logging/logger');

const app = express();
const PORT = process.env.ORDER_SERVICE_PORT || 3000;

// ============ PROMETHEUS METRICS ============
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status', 'service'],
  registers: [register],
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status', 'service'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

const ordersCreatedTotal = new client.Counter({
  name: 'orders_created_total',
  help: 'Total number of orders created',
  registers: [register],
});

const ordersCancelledTotal = new client.Counter({
  name: 'orders_cancelled_total',
  help: 'Total number of orders cancelled',
  registers: [register],
});

// Metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    httpRequestsTotal.inc({ method: req.method, route, status: res.statusCode, service: 'order-service' });
    httpRequestDuration.observe({ method: req.method, route, status: res.statusCode, service: 'order-service' }, duration);
  });
  next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(createRequestIdMiddleware());


// In-memory data stores
const orders = new Map();
const carts = new Map();

// Seed a demo order
const demoOrderId = 'order-' + uuidv4();
orders.set(demoOrderId, {
  id: demoOrderId,
  userId: 'demo-user',
  items: [
    { id: 101, name: 'Margherita Pizza', price: 299, quantity: 2, restaurantId: 1, restaurantName: 'Pizza Palace', image: '🍕' },
    { id: 103, name: 'Garlic Bread', price: 149, quantity: 1, restaurantId: 1, restaurantName: 'Pizza Palace', image: '🥖' },
  ],
  subtotal: 747,
  deliveryFee: 50,
  tax: 75,
  total: 872,
  status: 'delivered',
  paymentStatus: 'paid',
  deliveryAddress: {
    label: 'Home',
    street: '123 Main Street',
    city: 'Mumbai',
    zipCode: '400001',
  },
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  deliveredAt: new Date(Date.now() - 86400000).toISOString(),
});

// ============ METRICS ENDPOINT ============
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// ============ HEALTH CHECK ============
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'order-service', timestamp: new Date().toISOString() });
});

// ============ CART ============

// Get cart
app.get('/api/cart', (req, res) => {
  const userId = req.headers['x-user-id'] || 'demo-user';
  const cart = carts.get(userId) || { items: [], updatedAt: null };
  res.json(cart);
});

// Add to cart
app.post('/api/cart/items', (req, res) => {
  const userId = req.headers['x-user-id'] || 'demo-user';
  const { itemId, name, price, quantity, restaurantId, restaurantName, image } = req.body;

  if (!itemId || !name || !price || !quantity || !restaurantId) {
    return res.status(400).json({ error: 'Missing required item fields' });
  }

  let cart = carts.get(userId);
  if (!cart) {
    cart = { items: [], updatedAt: new Date().toISOString() };
    carts.set(userId, cart);
  }

  const existingItem = cart.items.find(i => i.id === itemId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ id: itemId, name, price, quantity, restaurantId, restaurantName, image });
  }

  cart.updatedAt = new Date().toISOString();
  res.status(201).json(cart);
});

// Update cart item quantity
app.put('/api/cart/items/:itemId', (req, res) => {
  const userId = req.headers['x-user-id'] || 'demo-user';
  const { quantity } = req.body;

  const cart = carts.get(userId);
  if (!cart) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  const item = cart.items.find(i => i.id === parseInt(req.params.itemId));
  if (!item) {
    return res.status(404).json({ error: 'Item not found in cart' });
  }

  if (quantity <= 0) {
    cart.items = cart.items.filter(i => i.id !== parseInt(req.params.itemId));
  } else {
    item.quantity = quantity;
  }

  cart.updatedAt = new Date().toISOString();
  res.json(cart);
});

// Remove from cart
app.delete('/api/cart/items/:itemId', (req, res) => {
  const userId = req.headers['x-user-id'] || 'demo-user';

  const cart = carts.get(userId);
  if (!cart) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  cart.items = cart.items.filter(i => i.id !== parseInt(req.params.itemId));
  cart.updatedAt = new Date().toISOString();
  res.json(cart);
});

// Clear cart
app.delete('/api/cart', (req, res) => {
  const userId = req.headers['x-user-id'] || 'demo-user';
  carts.delete(userId);
  res.json({ message: 'Cart cleared' });
});

// ============ ORDERS ============

// Get all orders for user
app.get('/api/orders', (req, res) => {
  const userId = req.headers['x-user-id'] || 'demo-user';
  const userOrders = Array.from(orders.values()).filter(o => o.userId === userId);

  res.json({
    count: userOrders.length,
    orders: userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  });
});

// Get order by ID
app.get('/api/orders/:orderId', (req, res) => {
  const order = orders.get(req.params.orderId);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json(order);
});

// Create order (checkout)
app.post('/api/orders', (req, res) => {
  const userId = req.headers['x-user-id'] || 'demo-user';
  const { items, deliveryAddress, paymentMethod } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items are required' });
  }

  if (!deliveryAddress) {
    return res.status(400).json({ error: 'Delivery address is required' });
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 50;
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + deliveryFee + tax;

  const orderId = 'order-' + uuidv4();
  const order = {
    id: orderId,
    userId,
    items,
    subtotal,
    deliveryFee,
    tax,
    total,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: paymentMethod || 'card',
    deliveryAddress,
    createdAt: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 45 * 60000).toISOString(),
  };

  orders.set(orderId, order);
  ordersCreatedTotal.inc();

  // Clear cart after order
  carts.delete(userId);

  res.status(201).json({
    message: 'Order placed successfully',
    order,
  });
});

// Cancel order
app.patch('/api/orders/:orderId/cancel', (req, res) => {
  const order = orders.get(req.params.orderId);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.status === 'delivered' || order.status === 'cancelled') {
    return res.status(400).json({ error: 'Cannot cancel this order' });
  }

  order.status = 'cancelled';
  order.cancelledAt = new Date().toISOString();
  ordersCancelledTotal.inc();

  res.json({ message: 'Order cancelled', order });
});

// Update order status (internal/delivery service)
app.patch('/api/orders/:orderId/status', (req, res) => {
  const { status } = req.body;
  const validStatuses = ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const order = orders.get(req.params.orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.status = status;
  if (status === 'delivered') {
    order.deliveredAt = new Date().toISOString();
  }

  res.json({ message: 'Status updated', order });
});

// ============ ORDER STATS ============

app.get('/api/orders/stats/summary', (req, res) => {
  const userId = req.headers['x-user-id'] || 'demo-user';
  const userOrders = Array.from(orders.values()).filter(o => o.userId === userId);

  const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = userOrders.length;
  const deliveredOrders = userOrders.filter(o => o.status === 'delivered').length;

  res.json({
    totalSpent,
    totalOrders,
    deliveredOrders,
    pendingOrders: totalOrders - deliveredOrders,
  });
});

// Error handler (must be after routes)
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
  });
});

// ============ START SERVER ============

app.listen(PORT, "0.0.0.0", () => {});

module.exports = app;


