/**
 * Zomato Clone - User Service
 * Port: 3001
 * Responsibilities: User auth, profiles, addresses
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.USER_SERVICE_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data store
const users = new Map();
const sessions = new Map();

// Seed a demo user
const demoUserId = uuidv4();
users.set(demoUserId, {
  id: demoUserId,
  fullName: 'John Doe',
  email: 'john@example.com',
  phone: '9876543210',
  avatar: '👤',
  createdAt: new Date().toISOString(),
  addresses: [
    {
      id: 'addr-1',
      label: 'Home',
      street: '123 Main Street',
      city: 'Mumbai',
      zipCode: '400001',
      isDefault: true,
    },
    {
      id: 'addr-2',
      label: 'Work',
      street: '456 Business Park',
      city: 'Mumbai',
      zipCode: '400051',
      isDefault: false,
    },
  ],
});

// ============ HEALTH CHECK ============
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'user-service', timestamp: new Date().toISOString() });
});

// ============ AUTHENTICATION ============

// Register
app.post('/api/users/register', (req, res) => {
  const { fullName, email, phone, password } = req.body;

  if (!fullName || !email || !phone || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const existingUser = Array.from(users.values()).find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  const userId = uuidv4();
  const user = {
    id: userId,
    fullName,
    email,
    phone,
    avatar: '👤',
    createdAt: new Date().toISOString(),
    addresses: [],
  };

  users.set(userId, user);
  
  const token = uuidv4();
  sessions.set(token, { userId, createdAt: new Date().toISOString() });

  res.status(201).json({
    message: 'User registered successfully',
    user: { id: user.id, fullName: user.fullName, email: user.email, phone: user.phone, avatar: user.avatar },
    token,
  });
});

// Login
app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = Array.from(users.values()).find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = uuidv4();
  sessions.set(token, { userId: user.id, createdAt: new Date().toISOString() });

  res.json({
    message: 'Login successful',
    user: { id: user.id, fullName: user.fullName, email: user.email, phone: user.phone, avatar: user.avatar },
    token,
  });
});

// Logout
app.post('/api/users/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    sessions.delete(token);
  }
  res.json({ message: 'Logged out successfully' });
});

// ============ USER PROFILE ============

// Get current user
app.get('/api/users/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const session = sessions.get(token);

  if (!session) {
    // Return demo user for unauthenticated requests
    const demoUser = users.get(demoUserId);
    return res.json({
      id: demoUser.id,
      fullName: demoUser.fullName,
      email: demoUser.email,
      phone: demoUser.phone,
      avatar: demoUser.avatar,
      addresses: demoUser.addresses,
    });
  }

  const user = users.get(session.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    addresses: user.addresses,
  });
});

// Update profile
app.put('/api/users/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const session = sessions.get(token);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = users.get(session.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { fullName, phone, avatar } = req.body;
  if (fullName) user.fullName = fullName;
  if (phone) user.phone = phone;
  if (avatar) user.avatar = avatar;

  res.json({
    message: 'Profile updated',
    user: { id: user.id, fullName: user.fullName, email: user.email, phone: user.phone, avatar: user.avatar },
  });
});

// ============ ADDRESSES ============

// Get all addresses
app.get('/api/users/me/addresses', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const session = sessions.get(token);
  const userId = session ? session.userId : demoUserId;
  
  const user = users.get(userId);
  res.json(user?.addresses || []);
});

// Add address
app.post('/api/users/me/addresses', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const session = sessions.get(token);
  const userId = session ? session.userId : demoUserId;
  
  const user = users.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { label, street, city, zipCode, isDefault } = req.body;
  
  if (!label || !street || !city || !zipCode) {
    return res.status(400).json({ error: 'Label, street, city, and zipCode are required' });
  }

  if (isDefault) {
    user.addresses.forEach(addr => addr.isDefault = false);
  }

  const newAddress = {
    id: `addr-${uuidv4()}`,
    label,
    street,
    city,
    zipCode,
    isDefault: isDefault || false,
  };

  user.addresses.push(newAddress);
  res.status(201).json({ message: 'Address added', address: newAddress });
});

// Update address
app.put('/api/users/me/addresses/:addressId', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const session = sessions.get(token);
  const userId = session ? session.userId : demoUserId;
  
  const user = users.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const address = user.addresses.find(a => a.id === req.params.addressId);
  if (!address) {
    return res.status(404).json({ error: 'Address not found' });
  }

  const { label, street, city, zipCode, isDefault } = req.body;
  
  if (isDefault) {
    user.addresses.forEach(addr => addr.isDefault = false);
  }

  if (label) address.label = label;
  if (street) address.street = street;
  if (city) address.city = city;
  if (zipCode) address.zipCode = zipCode;
  if (isDefault !== undefined) address.isDefault = isDefault;

  res.json({ message: 'Address updated', address });
});

// Delete address
app.delete('/api/users/me/addresses/:addressId', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const session = sessions.get(token);
  const userId = session ? session.userId : demoUserId;
  
  const user = users.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const index = user.addresses.findIndex(a => a.id === req.params.addressId);
  if (index === -1) {
    return res.status(404).json({ error: 'Address not found' });
  }

  user.addresses.splice(index, 1);
  res.json({ message: 'Address deleted' });
});

// ============ START SERVER ============

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Service running on port ${PORT}`);
});

// app.listen(PORT, () => {
//   console.log(`🚀 User Service running on http://localhost:${PORT}`);
//   console.log(`   Health: http://localhost:${PORT}/health`);
// });

module.exports = app;
