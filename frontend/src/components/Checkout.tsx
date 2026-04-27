import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { CartItem } from "./Cart";
import { createOrder } from "../services/api";

interface CheckoutProps {
  cartItems: CartItem[];
  total: number;
  onOrderConfirm: () => void;
  onError: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function Checkout({ cartItems, total, onOrderConfirm, onError }: CheckoutProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let sanitized = value;

    if (name === 'phone') {
      sanitized = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'cardNumber') {
      sanitized = value.replace(/\D/g, '').slice(0, 16);
    } else if (name === 'cvv') {
      sanitized = value.replace(/\D/g, '').slice(0, 3);
    } else if (name === 'expiryDate') {
      sanitized = value
        .replace(/\D/g, '')
        .slice(0, 4)
        .replace(/(\d{2})(\d)/, '$1/$2');
    }

    setFormData((prev) => ({
      ...prev,
      [name]: sanitized,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.zipCode ||
      !formData.cardNumber ||
      !formData.expiryDate ||
      !formData.cvv
    ) {
      onError('Please fill in all fields', 'error');
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      onError('Please enter a valid 10-digit phone number', 'error');
      return;
    }

    if (!/^\d{16}$/.test(formData.cardNumber)) {
      onError('Please enter a valid 16-digit card number', 'error');
      return;
    }

    if (!/^\d{3}$/.test(formData.cvv)) {
      onError('Please enter a valid 3-digit CVV', 'error');
      return;
    }

    setPlacingOrder(true);

    const payload = {
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        restaurantId: item.restaurantId,
        restaurantName: item.restaurantName,
        image: item.image,
      })),
      deliveryAddress: {
        label: 'Home',
        street: formData.address,
        city: formData.city,
        zipCode: formData.zipCode,
      },
      paymentMethod: 'card',
    };

    const result = await createOrder(payload);

    if (result.success) {
      onError('Order placed successfully!', 'success');
    } else {
      onError(`Order service unreachable: ${result.reason}. Order saved locally.`, 'error');
    }

    setOrderPlaced(true);
    onOrderConfirm();
    setPlacingOrder(false);

    setTimeout(() => {
      navigate("/");
    }, 3000);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="order-confirmation card max-w-md w-full">
          <FaCheckCircle className="confirmation-icon" />
          <h1 className="confirmation-title">Order Confirmed!</h1>
          <p className="confirmation-message">
            Your order has been placed successfully. You will receive it within 30-45 minutes.
          </p>
          <p className="text-2xl font-bold text-orange-600 mb-6">
            Total: ₹{total.toLocaleString()}
          </p>
          <p className="confirmation-redirect mb-6">
            Redirecting to home page in 3 seconds...
          </p>
          <button
            onClick={() => navigate("/")}
            className="btn-primary w-full"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="empty-state min-h-screen">
        <p className="empty-state-title">Your cart is empty</p>
        <button
          onClick={() => navigate("/")}
          className="btn-primary mt-6"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 50;
  const tax = Math.round(subtotal * 0.1);
  const orderTotal = subtotal + deliveryFee + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="checkout-container">
        <button
          onClick={() => navigate("/cart")}
          className="back-button"
        >
          <FaArrowLeft /> Back to Cart
        </button>

        <h1 className="text-4xl font-bold text-gray-800 mb-8">Checkout</h1>

        <div className="checkout-layout">
          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Delivery Address */}
            <div className="form-section">
              <h2 className="form-section-title">Delivery Address</h2>

              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">Street Address</label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  placeholder="123 Main St"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    placeholder="New York"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="zipCode">ZIP Code</label>
                  <input
                    id="zipCode"
                    type="text"
                    name="zipCode"
                    placeholder="10001"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="form-section">
              <h2 className="form-section-title">Payment Information</h2>

              <div className="form-group">
                <label htmlFor="cardNumber">Card Number</label>
                <input
                  id="cardNumber"
                  type="text"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  required
                  maxLength={16}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expiryDate">Expiry Date</label>
                  <input
                    id="expiryDate"
                    type="text"
                    name="expiryDate"
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cvv">CVV</label>
                  <input
                    id="cvv"
                    type="text"
                    name="cvv"
                    placeholder="123"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    required
                    maxLength={3}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={placingOrder}
              className={`btn-primary w-full py-4 text-lg ${placingOrder ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {placingOrder ? 'Placing Order...' : `Place Order - ₹${orderTotal.toLocaleString()}`}
            </button>
          </form>

          {/* Order Summary */}
          <div className="cart-summary">
            <h2 className="summary-title">Order Summary</h2>

            <div className="space-y-2 mb-6 max-h-80 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-gray-700 py-2 border-b border-gray-200">
                  <span className="text-sm">
                    {item.name} <span className="text-gray-500">× {item.quantity}</span>
                  </span>
                  <span className="font-semibold text-gray-800">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>

              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>

              <div className="summary-row">
                <span>Tax (10%)</span>
                <span>₹{tax}</span>
              </div>

              <div className="summary-row total">
                <span>Total</span>
                <span className="text-orange-600">₹{orderTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
