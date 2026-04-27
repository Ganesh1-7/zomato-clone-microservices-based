
import axios from 'axios';
import { restaurants as localRestaurants, type Restaurant } from '../data/mockData';

const getEnv = (key: string, fallback: string): string => {
  try {
    return (import.meta as any).env?.[key] || fallback;
  } catch {
    return fallback;
  }
};

// Service endpoints (direct access since gateway is commented out in docker-compose)
const API_BASE_URLS = {
  user: getEnv('VITE_USER_SERVICE_URL', 'http://localhost:3001'),
  restaurant: getEnv('VITE_RESTAURANT_SERVICE_URL', 'http://localhost:3002'),
  order: getEnv('VITE_ORDER_SERVICE_URL', 'http://localhost:3003'),
  delivery: getEnv('VITE_DELIVERY_SERVICE_URL', 'http://localhost:3004'),
};

export interface FetchResult<T> {
  data: T;
  source: 'api' | 'local';
  reason?: string;
}

const restaurantApi = axios.create({
  baseURL: API_BASE_URLS.restaurant,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

const orderApi = axios.create({
  baseURL: API_BASE_URLS.order,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

// ==================== RESTAURANT SERVICE ====================

interface GetRestaurantsParams {
  search?: string;
  cuisine?: string;
  minRating?: number;
  sortBy?: string;
}

export async function fetchRestaurants(params: GetRestaurantsParams = {}): Promise<FetchResult<Restaurant[]>> {
  try {
    const response = await restaurantApi.get('/api/restaurants', { params });
    // API returns { count, restaurants } where restaurants is summary without menu
    // For RestaurantList we need the summary fields; for details we fetch separately
    const apiRestaurants: Restaurant[] = response.data.restaurants.map((r: any) => ({
      ...r,
      menu: [], // menu not returned by list endpoint
    }));
    return { data: apiRestaurants, source: 'api' };
  } catch (err: any) {
    const reason = err?.response?.status
      ? `Restaurant service returned ${err.response.status}. Using local data.`
      : `Restaurant service unreachable (${err?.message || 'Network Error'}). Using local data.`;

    // Apply same filters locally
    let result = [...localRestaurants];
    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(r => r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q));
    }
    if (params.cuisine) {
      const c = params.cuisine.toLowerCase();
      result = result.filter(r => r.cuisine.toLowerCase().includes(c));
    }
    if (params.minRating) {
      result = result.filter(r => r.rating >= params.minRating!);
    }
    if (params.sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (params.sortBy === 'delivery') {
      result.sort((a, b) => a.deliveryTime - b.deliveryTime);
    } else if (params.sortBy === 'discount') {
      result.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    }
    return { data: result, source: 'local', reason };
  }
}

export async function fetchRestaurantById(id: number): Promise<FetchResult<Restaurant | undefined>> {
  try {
    const response = await restaurantApi.get(`/api/restaurants/${id}`);
    return { data: response.data as Restaurant, source: 'api' };
  } catch (err: any) {
    const reason = err?.response?.status
      ? `Restaurant service returned ${err.response.status}. Using local data.`
      : `Restaurant service unreachable (${err?.message || 'Network Error'}). Using local data.`;
    const local = localRestaurants.find(r => r.id === id);
    return { data: local, source: 'local', reason };
  }
}

// ==================== ORDER SERVICE ====================

export interface OrderPayload {
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    restaurantId: number;
    restaurantName: string;
    image: string;
  }>;
  deliveryAddress: {
    label: string;
    street: string;
    city: string;
    zipCode: string;
  };
  paymentMethod?: string;
}

export async function createOrder(payload: OrderPayload): Promise<{ success: true; order: any } | { success: false; reason: string }> {
  try {
    const response = await orderApi.post('/api/orders', payload);
    return { success: true, order: response.data.order };
  } catch (err: any) {
    const reason = err?.response?.data?.error || err?.message || 'Order service unavailable';
    return { success: false, reason };
  }
}

