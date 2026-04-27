/**
 * Zomato Clone - Payment Service
 * Port: 3005
 * Responsibilities: Payment processing, transactions, refunds
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PAYMENT_SERVICE_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data store
const transactions = new Map();

// Seed a demo transaction
const demoTransactionId = 'txn-' + uuidv4();
transactions.set(demoTransactionId, {
  id: demoTransactionId,
  orderId: 'order-demo-1',
  userId: 'demo-user',
  amount: 872,
  currency: 'INR',
  status: 'completed',
  method: 'card',
  cardLastFour: '4242',
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  completedAt: new Date(Date.now() - 86400000 * 2 + 60000).toISOString(),
});

// ============ HEALTH CHECK ============
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'payment-service', timestamp: new Date().toISOString() });
});

// ============ PAYMENT METHODS ============

// Get available payment methods
app.get('/api/payments/methods', (req, res) => {
  res.json([
    { id: 'card', name: 'Credit/Debit Card', icon: '💳', enabled: true },
    { id: 'upi', name: 'UPI', icon: '📱', enabled: true },
    { id: 'cod', name: 'Cash on Delivery', icon: '💵', enabled: true },
    { id: 'wallet', name: 'Wallet', icon: '👛', enabled: false },
  ]);
});

// ============ PAYMENT PROCESSING ============

// Process a new payment
app.post('/api/payments', (req, res) => {
  const { orderId, userId, amount, currency, method, paymentDetails } = req.body;

  if (!orderId || !amount || !method) {
    return res.status(400).json({ error: 'orderId, amount, and method are required' });
  }

  // Simulate payment processing
  const isSuccess = Math.random() > 0.05; // 95% success rate

  const transactionId = 'txn-' + uuidv4();
  const transaction = {
    id: transactionId,
    orderId,
    userId: userId || 'demo-user',
    amount,
    currency: currency || 'INR',
    status: isSuccess ? 'completed' : 'failed',
    method,
    cardLastFour: paymentDetails?.cardNumber ? paymentDetails.cardNumber.slice(-4) : null,
    upiId: paymentDetails?.upiId || null,
    failureReason: isSuccess ? null : 'Payment declined by bank',
    createdAt: new Date().toISOString(),
    completedAt: isSuccess ? new Date().toISOString() : null,
  };

  transactions.set(transactionId, transaction);

  if (isSuccess) {
    res.status(201).json({
      message: 'Payment processed successfully',
      transaction: {
        id: transaction.id,
        orderId: transaction.orderId,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        method: transaction.method,
        completedAt: transaction.completedAt,
      },
    });
  } else {
    res.status(402).json({
      error: 'Payment failed',
      reason: transaction.failureReason,
      transaction: {
        id: transaction.id,
        orderId: transaction.orderId,
        status: transaction.status,
      },
    });
  }
});

// Get transaction by ID
app.get('/api/payments/:transactionId', (req, res) => {
  const transaction = transactions.get(req.params.transactionId);

  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  res.json(transaction);
});

// Get all transactions for a user
app.get('/api/payments', (req, res) => {
  const userId = req.headers['x-user-id'] || 'demo-user';
  const userTransactions = Array.from(transactions.values())
    .filter(t => t.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    count: userTransactions.length,
    transactions: userTransactions,
  });
});

// Refund a transaction
app.post('/api/payments/:transactionId/refund', (req, res) => {
  const transaction = transactions.get(req.params.transactionId);

  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  if (transaction.status !== 'completed') {
    return res.status(400).json({ error: 'Only completed transactions can be refunded' });
  }

  transaction.status = 'refunded';
  transaction.refundedAt = new Date().toISOString();

  res.json({
    message: 'Refund processed successfully',
    transaction: {
      id: transaction.id,
      orderId: transaction.orderId,
      status: transaction.status,
      refundedAt: transaction.refundedAt,
    },
  });
});

// ============ START SERVER ============

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Service running on port ${PORT}`);
});

module.exports = app;

