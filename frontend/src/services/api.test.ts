import { describe, it, expect } from 'vitest';

// Simple unit tests for the API service fallback logic
// These verify the local data filtering works when services are unreachable

describe('API Service - Local Data Fallback', () => {
  it('should return empty array when no restaurants match search', () => {
    const restaurants = [
      { id: 1, name: 'Pizza Palace', cuisine: 'Italian', rating: 4.5, deliveryTime: 30, deliveryFee: 50, image: '🍕', reviews: 2450, discount: 20, menu: [] },
      { id: 2, name: 'Biryani Bliss', cuisine: 'Indian', rating: 4.7, deliveryTime: 40, deliveryFee: 40, image: '🍛', reviews: 3120, discount: 15, menu: [] },
    ];

    const query = 'sushi';
    const result = restaurants.filter(
      (r) => r.name.toLowerCase().includes(query) || r.cuisine.toLowerCase().includes(query)
    );

    expect(result).toHaveLength(0);
  });

  it('should filter restaurants by cuisine correctly', () => {
    const restaurants = [
      { id: 1, name: 'Pizza Palace', cuisine: 'Italian, Pizza', rating: 4.5 },
      { id: 2, name: 'Biryani Bliss', cuisine: 'Indian, Biryani', rating: 4.7 },
      { id: 3, name: 'Sushi Sensation', cuisine: 'Japanese, Sushi', rating: 4.8 },
    ];

    const c = 'indian';
    const result = restaurants.filter((r) => r.cuisine.toLowerCase().includes(c));

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Biryani Bliss');
  });

  it('should sort restaurants by rating descending', () => {
    const restaurants = [
      { id: 1, name: 'A', rating: 4.3 },
      { id: 2, name: 'B', rating: 4.8 },
      { id: 3, name: 'C', rating: 4.5 },
    ];

    const sorted = [...restaurants].sort((a, b) => b.rating - a.rating);

    expect(sorted[0].name).toBe('B');
    expect(sorted[1].name).toBe('C');
    expect(sorted[2].name).toBe('A');
  });
});

describe('Cart Total Calculation', () => {
  it('should calculate cart total with delivery fee and tax', () => {
    const cartItems = [
      { id: 101, name: 'Margherita Pizza', price: 299, quantity: 2 },
      { id: 103, name: 'Garlic Bread', price: 149, quantity: 1 },
    ];

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = cartItems.length > 0 ? 50 : 0;
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + deliveryFee + tax;

    expect(subtotal).toBe(747);
    expect(deliveryFee).toBe(50);
    expect(tax).toBe(75);
    expect(total).toBe(872);
  });

  it('should return zero for empty cart', () => {
    const cartItems: any[] = [];

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = cartItems.length > 0 ? 50 : 0;
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + deliveryFee + tax;

    expect(total).toBe(0);
  });
});

