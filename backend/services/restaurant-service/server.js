/**
 * Zomato Clone - Restaurant Service
 * Port: 3002
 * Responsibilities: Restaurants, menus, cuisines, search, filters
 */

const express = require('express');
const cors = require('cors');
const client = require('prom-client');
const {
  createRequestIdMiddleware,
} = require('../../logging/logger');

const app = express();
const PORT = process.env.RESTAURANT_SERVICE_PORT || 3000;

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

const restaurantSearchesTotal = new client.Counter({
  name: 'restaurant_searches_total',
  help: 'Total number of restaurant searches',
  registers: [register],
});

// Metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    httpRequestsTotal.inc({ method: req.method, route, status: res.statusCode, service: 'restaurant-service' });
    httpRequestDuration.observe({ method: req.method, route, status: res.statusCode, service: 'restaurant-service' }, duration);
  });
  next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(createRequestIdMiddleware());


// ============ DATA STORE ============

const restaurants = [
  {
    id: 1,
    name: 'Pizza Palace',
    cuisine: 'Italian, Pizza',
    rating: 4.5,
    deliveryTime: 30,
    deliveryFee: 50,
    image: '🍕',
    reviews: 2450,
    discount: 20,
    menu: [
      { id: 101, name: 'Margherita Pizza', description: 'Fresh mozzarella, tomato, basil', price: 299, image: '🍕', category: 'Pizza' },
      { id: 102, name: 'Pepperoni Pizza', description: 'Loaded with pepperoni', price: 349, image: '🍕', category: 'Pizza' },
      { id: 103, name: 'Garlic Bread', description: 'Crispy garlic bread', price: 149, image: '🥖', category: 'Sides' },
      { id: 104, name: 'Coca Cola 250ml', description: 'Cold beverage', price: 50, image: '🥤', category: 'Beverages' },
    ],
  },
  {
    id: 2,
    name: 'Biryani Bliss',
    cuisine: 'Indian, Biryani',
    rating: 4.7,
    deliveryTime: 40,
    deliveryFee: 40,
    image: '🍛',
    reviews: 3120,
    discount: 15,
    menu: [
      { id: 201, name: 'Hyderabadi Biryani', description: 'Authentic Hyderabad biryani', price: 399, image: '🍛', category: 'Biryani' },
      { id: 202, name: 'Chicken Biryani', description: 'Spiced chicken biryani', price: 349, image: '🍛', category: 'Biryani' },
      { id: 203, name: 'Mutton Biryani', description: 'Premium mutton biryani', price: 449, image: '🍛', category: 'Biryani' },
      { id: 204, name: 'Raita', description: 'Yogurt based side dish', price: 79, image: '🥛', category: 'Sides' },
      { id: 205, name: 'Mango Lassi', description: 'Refreshing mango lassi', price: 99, image: '🥤', category: 'Beverages' },
    ],
  },
  {
    id: 3,
    name: 'Burger Heaven',
    cuisine: 'American, Burgers',
    rating: 4.3,
    deliveryTime: 25,
    deliveryFee: 60,
    image: '🍔',
    reviews: 1890,
    discount: 25,
    menu: [
      { id: 301, name: 'Classic Burger', description: 'Beef patty with cheese', price: 249, image: '🍔', category: 'Burgers' },
      { id: 302, name: 'Chicken Burger', description: 'Crispy chicken patty', price: 229, image: '🍔', category: 'Burgers' },
      { id: 303, name: 'Veggie Burger', description: 'Plant-based patty', price: 199, image: '🌱', category: 'Burgers' },
      { id: 304, name: 'French Fries', description: 'Golden crispy fries', price: 99, image: '🍟', category: 'Sides' },
      { id: 305, name: 'Milkshake', description: 'Vanilla/Chocolate', price: 129, image: '🥤', category: 'Beverages' },
    ],
  },
  {
    id: 4,
    name: 'Sushi Sensation',
    cuisine: 'Japanese, Sushi',
    rating: 4.8,
    deliveryTime: 35,
    deliveryFee: 80,
    image: '🍣',
    reviews: 2100,
    menu: [
      { id: 401, name: 'California Roll', description: 'Crab, avocado, cucumber', price: 399, image: '🍣', category: 'Sushi' },
      { id: 402, name: 'Salmon Nigiri', description: 'Fresh salmon', price: 449, image: '🍣', category: 'Sushi' },
      { id: 403, name: 'Vegetable Roll', description: 'Cucumber, avocado', price: 299, image: '🍣', category: 'Sushi' },
      { id: 404, name: 'Miso Soup', description: 'Traditional miso soup', price: 149, image: '🍲', category: 'Soups' },
      { id: 405, name: 'Green Tea', description: 'Hot green tea', price: 79, image: '🍵', category: 'Beverages' },
    ],
  },
  {
    id: 5,
    name: 'Thali Express',
    cuisine: 'Indian, North Indian',
    rating: 4.4,
    deliveryTime: 45,
    deliveryFee: 35,
    image: '🍽️',
    reviews: 1650,
    discount: 10,
    menu: [
      { id: 501, name: 'Butter Chicken Thali', description: 'Butter chicken with rice', price: 349, image: '🍽️', category: 'Thali' },
      { id: 502, name: 'Paneer Tikka Thali', description: 'Paneer tikka with naan', price: 329, image: '🍽️', category: 'Thali' },
      { id: 503, name: 'Dal Makhani', description: 'Creamy lentil curry', price: 199, image: '🍲', category: 'Curries' },
      { id: 504, name: 'Naan', description: 'Butter naan', price: 49, image: '🥖', category: 'Breads' },
      { id: 505, name: 'Gulab Jamun', description: 'Sweet Indian dessert', price: 89, image: '🍮', category: 'Desserts' },
    ],
  },
  {
    id: 6,
    name: 'Pasta Paradise',
    cuisine: 'Italian, Pasta',
    rating: 4.6,
    deliveryTime: 32,
    deliveryFee: 55,
    image: '🍝',
    reviews: 2200,
    menu: [
      { id: 601, name: 'Spaghetti Carbonara', description: 'Classic carbonara', price: 349, image: '🍝', category: 'Pasta' },
      { id: 602, name: 'Fettuccine Alfredo', description: 'Creamy alfredo sauce', price: 329, image: '🍝', category: 'Pasta' },
      { id: 603, name: 'Penne Arrabbiata', description: 'Spicy tomato pasta', price: 299, image: '🍝', category: 'Pasta' },
      { id: 604, name: 'Caesar Salad', description: 'Fresh caesar salad', price: 199, image: '🥗', category: 'Salads' },
      { id: 605, name: 'Tiramisu', description: 'Classic tiramisu', price: 149, image: '🍰', category: 'Desserts' },
    ],
  },
];

// ============ METRICS ENDPOINT ============
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// ============ HEALTH CHECK ============
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'restaurant-service', timestamp: new Date().toISOString() });
});

// ============ RESTAURANTS ============

// Get all restaurants with search/filter/sort
app.get('/api/restaurants', (req, res) => {
  const { search, cuisine, minRating, sortBy } = req.query;

  let result = [...restaurants];

  if (search || cuisine || minRating) {
    restaurantSearchesTotal.inc();
  }

  // Search
  if (search) {
    const query = String(search).toLowerCase();
    result = result.filter(r =>
      r.name.toLowerCase().includes(query) ||
      r.cuisine.toLowerCase().includes(query)
    );
  }

  // Cuisine filter
  if (cuisine) {
    const c = String(cuisine).toLowerCase();
    result = result.filter(r => r.cuisine.toLowerCase().includes(c));
  }

  // Rating filter
  if (minRating) {
    const min = parseFloat(String(minRating));
    result = result.filter(r => r.rating >= min);
  }

  // Sorting
  if (sortBy === 'rating') {
    result.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'delivery') {
    result.sort((a, b) => a.deliveryTime - b.deliveryTime);
  } else if (sortBy === 'discount') {
    result.sort((a, b) => (b.discount || 0) - (a.discount || 0));
  }

  res.json({
    count: result.length,
    restaurants: result.map(r => ({
      id: r.id,
      name: r.name,
      cuisine: r.cuisine,
      rating: r.rating,
      deliveryTime: r.deliveryTime,
      deliveryFee: r.deliveryFee,
      image: r.image,
      reviews: r.reviews,
      discount: r.discount,
    })),
  });
});

// Get restaurant by ID
app.get('/api/restaurants/:id', (req, res) => {
  const restaurant = restaurants.find(r => r.id === parseInt(req.params.id));

  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }

  res.json(restaurant);
});

// Get restaurant menu
app.get('/api/restaurants/:id/menu', (req, res) => {
  const restaurant = restaurants.find(r => r.id === parseInt(req.params.id));

  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }

  const { category } = req.query;
  let menu = restaurant.menu;

  if (category) {
    menu = menu.filter(m => m.category === category);
  }

  res.json({
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    categories: [...new Set(restaurant.menu.map(m => m.category))],
    menu,
  });
});

// Get menu item by ID
app.get('/api/restaurants/:restaurantId/menu/:itemId', (req, res) => {
  const restaurant = restaurants.find(r => r.id === parseInt(req.params.restaurantId));

  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }

  const item = restaurant.menu.find(m => m.id === parseInt(req.params.itemId));

  if (!item) {
    return res.status(404).json({ error: 'Menu item not found' });
  }

  res.json(item);
});

// ============ CUISINES ============

// Get all available cuisines
app.get('/api/cuisines', (req, res) => {
  const allCuisines = restaurants.flatMap(r => r.cuisine.split(', '));
  const uniqueCuisines = [...new Set(allCuisines)];
  res.json(uniqueCuisines);
});

// ============ CATEGORIES ============

// Get all menu categories
app.get('/api/categories', (req, res) => {
  const allCategories = restaurants.flatMap(r => r.menu.map(m => m.category));
  const uniqueCategories = [...new Set(allCategories)];
  res.json(uniqueCategories);
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

