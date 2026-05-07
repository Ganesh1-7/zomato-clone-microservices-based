/**
 * Zomato Clone - Delivery Service
 * Port: 3004
 * Responsibilities: Delivery tracking, driver assignment, ETA
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const client = require('prom-client');
// createRequestIdMiddleware import removed (logging/logger module missing in this repo)


const app = express();
const PORT = process.env.DELIVERY_SERVICE_PORT || 3000;

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

const deliveriesCreatedTotal = new client.Counter({
  name: 'deliveries_created_total',
  help: 'Total number of deliveries created',
  registers: [register],
});

const deliveriesCompletedTotal = new client.Counter({
  name: 'deliveries_completed_total',
  help: 'Total number of deliveries completed',
  registers: [register],
});

// Metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    httpRequestsTotal.inc({ method: req.method, route, status: res.statusCode, service: 'delivery-service' });
    httpRequestDuration.observe({ method: req.method, route, status: res.statusCode, service: 'delivery-service' }, duration);
  });
  next();
});

// Middleware
app.use(cors());
app.use(express.json());






// In-memory data stores
const deliveries = new Map();
const drivers = new Map();

// Seed demo drivers
const driversList = [
  { id: 'drv-1', name: 'Ramesh Kumar', phone: '9876543211', rating: 4.8, totalDeliveries: 1240, vehicle: 'Bike', status: 'available' },
  { id: 'drv-2', name: 'Suresh Singh', phone: '9876543212', rating: 4.6, totalDeliveries: 890, vehicle: 'Scooter', status: 'available' },
  { id: 'drv-3', name: 'Priya Sharma', phone: '9876543213', rating: 4.9, totalDeliveries: 1560, vehicle: 'Bike', status: 'available' },
  { id: 'drv-4', name: 'Amit Patel', phone: '9876543214', rating: 4.5, totalDeliveries: 670, vehicle: 'Scooter', status: 'on_delivery' },
];

driversList.forEach(d => drivers.set(d.id, d));

// Seed a demo delivery
const demoDeliveryId = 'dlv-' + uuidv4();
deliveries.set(demoDeliveryId, {
  id: demoDeliveryId,
  orderId: 'order-demo-1',
  driverId: 'drv-1',
  status: 'delivered',
  pickupTime: new Date(Date.now() - 86400000 * 2 + 20 * 60000).toISOString(),
  deliveryTime: new Date(Date.now() - 86400000 * 2 + 45 * 60000).toISOString(),
  estimatedDeliveryTime: new Date(Date.now() - 86400000 * 2 + 45 * 60000).toISOString(),
  currentLocation: { lat: 19.0760, lng: 72.8777 },
  trackingUpdates: [
    { status: 'confirmed', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), message: 'Order confirmed' },
    { status: 'preparing', timestamp: new Date(Date.now() - 86400000 * 2 + 5 * 60000).toISOString(), message: 'Restaurant is preparing your order' },
    { status: 'ready', timestamp: new Date(Date.now() - 86400000 * 2 + 15 * 60000).toISOString(), message: 'Order is ready for pickup' },
    { status: 'out_for_delivery', timestamp: new Date(Date.now() - 86400000 * 2 + 20 * 60000).toISOString(), message: 'Driver is on the way' },
    { status: 'delivered', timestamp: new Date(Date.now() - 86400000 * 2 + 45 * 60000).toISOString(), message: 'Order delivered successfully' },
  ],
});

// ============ METRICS ENDPOINT ============
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// ============ HEALTH CHECK ============
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'delivery-service', timestamp: new Date().toISOString() });
});

// ============ DRIVERS ============

// Get all drivers
app.get('/api/drivers', (req, res) => {
  const { status } = req.query;
  let result = Array.from(drivers.values());

  if (status) {
    result = result.filter(d => d.status === status);
  }

  res.json(result);
});

// Get driver by ID
app.get('/api/drivers/:driverId', (req, res) => {
  const driver = drivers.get(req.params.driverId);

  if (!driver) {
    return res.status(404).json({ error: 'Driver not found' });
  }

  res.json(driver);
});

// ============ DELIVERIES ============

// Get all deliveries
app.get('/api/deliveries', (req, res) => {
  const { orderId, status } = req.query;
  let result = Array.from(deliveries.values());

  if (orderId) {
    result = result.filter(d => d.orderId === orderId);
  }
  if (status) {
    result = result.filter(d => d.status === status);
  }

  res.json({
    count: result.length,
    deliveries: result,
  });
});

// Get delivery by ID
app.get('/api/deliveries/:deliveryId', (req, res) => {
  const delivery = deliveries.get(req.params.deliveryId);

  if (!delivery) {
    return res.status(404).json({ error: 'Delivery not found' });
  }

  const driver = drivers.get(delivery.driverId);
  res.json({
    ...delivery,
    driver: driver ? { id: driver.id, name: driver.name, phone: driver.phone, rating: driver.rating, vehicle: driver.vehicle } : null,
  });
});

// Create delivery (called by order service)
app.post('/api/deliveries', (req, res) => {
  const { orderId, restaurantAddress, deliveryAddress, estimatedTimeMinutes } = req.body;

  if (!orderId || !deliveryAddress) {
    return res.status(400).json({ error: 'orderId and deliveryAddress are required' });
  }

  // Find available driver
  const availableDrivers = Array.from(drivers.values()).filter(d => d.status === 'available');
  const driver = availableDrivers.length > 0
    ? availableDrivers[Math.floor(Math.random() * availableDrivers.length)]
    : null;

  if (driver) {
    driver.status = 'on_delivery';
    driver.totalDeliveries += 1;
  }

  const deliveryId = 'dlv-' + uuidv4();
  const estimatedDeliveryTime = new Date(Date.now() + (estimatedTimeMinutes || 45) * 60000).toISOString();

  const delivery = {
    id: deliveryId,
    orderId,
    driverId: driver ? driver.id : null,
    status: 'confirmed',
    restaurantAddress,
    deliveryAddress,
    estimatedDeliveryTime,
    currentLocation: { lat: 19.0760, lng: 72.8777 },
    trackingUpdates: [
      { status: 'confirmed', timestamp: new Date().toISOString(), message: 'Order confirmed' },
    ],
  };

  deliveries.set(deliveryId, delivery);
  deliveriesCreatedTotal.inc();

  res.status(201).json({
    message: 'Delivery created',
    delivery: {
      ...delivery,
      driver: driver ? { id: driver.id, name: driver.name, phone: driver.phone, rating: driver.rating, vehicle: driver.vehicle } : null,
    },
  });
});

// Update delivery status
app.patch('/api/deliveries/:deliveryId/status', (req, res) => {
  const { status, location, message } = req.body;
  const validStatuses = ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const delivery = deliveries.get(req.params.deliveryId);
  if (!delivery) {
    return res.status(404).json({ error: 'Delivery not found' });
  }

  delivery.status = status;
  delivery.trackingUpdates.push({
    status,
    timestamp: new Date().toISOString(),
    message: message || `Status updated to ${status}`,
  });

  if (location) {
    delivery.currentLocation = location;
  }

  if (status === 'out_for_delivery') {
    delivery.pickupTime = new Date().toISOString();
  }

  if (status === 'delivered') {
    delivery.deliveryTime = new Date().toISOString();
    deliveriesCompletedTotal.inc();

    // Free up driver
    if (delivery.driverId) {
      const driver = drivers.get(delivery.driverId);
      if (driver) driver.status = 'available';
    }
  }

  res.json({ message: 'Status updated', delivery });
});

// Update driver location (for live tracking)
app.patch('/api/deliveries/:deliveryId/location', (req, res) => {
  const { lat, lng } = req.body;

  const delivery = deliveries.get(req.params.deliveryId);
  if (!delivery) {
    return res.status(404).json({ error: 'Delivery not found' });
  }

  delivery.currentLocation = { lat, lng };
  res.json({ message: 'Location updated', location: delivery.currentLocation });
});

// ============ TRACKING ============

// Get live tracking for an order
app.get('/api/tracking/:orderId', (req, res) => {
  const delivery = Array.from(deliveries.values()).find(d => d.orderId === req.params.orderId);

  if (!delivery) {
    return res.status(404).json({ error: 'Tracking not found for this order' });
  }

  const driver = drivers.get(delivery.driverId);

  res.json({
    orderId: req.params.orderId,
    deliveryId: delivery.id,
    status: delivery.status,
    currentLocation: delivery.currentLocation,
    estimatedDeliveryTime: delivery.estimatedDeliveryTime,
    trackingUpdates: delivery.trackingUpdates,
    driver: driver ? { id: driver.id, name: driver.name, phone: driver.phone, rating: driver.rating, vehicle: driver.vehicle } : null,
  });
});

// ============ ETA CALCULATION ============

app.post('/api/deliveries/estimate', (req, res) => {
  const { restaurantLocation, deliveryLocation } = req.body;

  // Simple mock ETA calculation
  const baseTime = 30; // minutes
  const randomVariation = Math.floor(Math.random() * 20) - 5; // -5 to +15 minutes

  const estimatedMinutes = baseTime + randomVariation;

  res.json({
    estimatedMinutes,
    estimatedTime: new Date(Date.now() + estimatedMinutes * 60000).toISOString(),
    baseTime,
    distance: '2.5 km', // Mock distance
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




