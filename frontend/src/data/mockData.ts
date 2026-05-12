export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: number;
  deliveryFee: number;
  image: string;
  reviews: number;
  discount?: number;
  menu: MenuItem[];
}

// Intentionally empty: UI must come from restaurant-service.
export const restaurants: Restaurant[] = [];

