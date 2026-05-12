import { lazy, Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toast } from './components/Toast';
import { useToast } from './hooks/useToast';
import { Cart, CartItem as CartItemType } from './components/Cart';
import { type MenuItem } from './types/restaurant';


import './App.css';


const RestaurantList = lazy(() => import('./components/RestaurantList').then(m => ({ default: m.RestaurantList })));
const RestaurantDetails = lazy(() => import('./components/RestaurantDetails').then(m => ({ default: m.RestaurantDetails })));
const Checkout = lazy(() => import('./components/Checkout').then(m => ({ default: m.Checkout })));
const Login = lazy(() => import('./components/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./components/Register').then(m => ({ default: m.Register })));
const ApiStatus = lazy(() => import('./components/ApiStatus').then(m => ({ default: m.ApiStatus })));
const NotFound = lazy(() => import('./components/NotFound').then(m => ({ default: m.NotFound })));

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="spinner" role="status" aria-label="Loading page">
      <span className="sr-only">Loading...</span>
    </div>
  </div>
);

function App() {
  const [cartItems, setCartItems] = useState<CartItemType[]>(() => {
    try {
      const saved = localStorage.getItem('zomatoCart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [sortBy, setSortBy] = useState('rating');
  const { toasts, addToast, removeToast } = useToast();

  const [cuisines, setCuisines] = useState<string[]>([]);

  useEffect(() => {
    // Cuisines should come from restaurant-service in real deployments.
    // For now, keep it empty until API-driven values are wired in.
    setCuisines([]);
  }, []);


  useEffect(() => {
    try {
      localStorage.setItem('zomatoCart', JSON.stringify(cartItems));
    } catch {
      addToast('Failed to save cart', 'error');
    }
  }, [cartItems, addToast]);

  const handleAddToCart = useCallback(
    (item: MenuItem, quantity: number, restaurantId: number) => {
      // restaurantName must be provided by the caller to avoid mockData usage.
      const restaurantName = '';


      setCartItems((prev) => {
        const existingItem = prev.find((cartItem) => cartItem.id === item.id);

        if (existingItem) {
          return prev.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + quantity }
              : cartItem
          );
        }
        return [
          ...prev,
          {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity,
            restaurantId,
            restaurantName,

            image: item.image,
          },
        ];
      });
      addToast(`${item.name} added to cart!`, 'success');
    },
    [addToast]
  );

  const handleRemoveFromCart = useCallback((itemId: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const handleUpdateQuantity = useCallback((itemId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(itemId);
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
      );
    }
  }, [handleRemoveFromCart]);

  const handleOrderConfirm = useCallback(() => {
    setCartItems([]);
    addToast('Order placed successfully!', 'success');
  }, [addToast]);

  const cartTotal = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = cartItems.length > 0 ? 50 : 0;
    const tax = Math.round(subtotal * 0.1);
    return subtotal + deliveryFee + tax;
  }, [cartItems]);

  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div className="min-h-screen bg-gray-100 flex flex-col">
          <Header
            cartCount={cartItems.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCuisine={selectedCuisine}
            onCuisineChange={setSelectedCuisine}
            selectedRating={selectedRating}
            onRatingChange={setSelectedRating}
            sortBy={sortBy}
            onSortChange={setSortBy}
            cuisines={cuisines}
          />

          <main id="main-content" className="flex-1">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<RestaurantList searchQuery={searchQuery} selectedCuisine={selectedCuisine} selectedRating={selectedRating} sortBy={sortBy} />} />
                <Route
                  path="/restaurant/:id"
                  element={<RestaurantDetails onAddToCart={handleAddToCart} />}
                />
                <Route
                  path="/cart"
                  element={
                    <Cart
                      items={cartItems}
                      onRemoveItem={handleRemoveFromCart}
                      onUpdateQuantity={handleUpdateQuantity}
                    />
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <Checkout
                      cartItems={cartItems}
                      total={cartTotal}
                      onOrderConfirm={handleOrderConfirm}
                      onError={addToast}
                    />
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/api-status" element={<ApiStatus />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>

          <Footer />
        </div>

        <Toast toasts={toasts} onRemove={removeToast} />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
