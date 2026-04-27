import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaTrash, FaShoppingCart } from "react-icons/fa";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  restaurantId: number;
  restaurantName: string;
  image: string;
}

interface CartProps {
  items: CartItem[];
  onRemoveItem: (itemId: number) => void;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
}

export function Cart({ items, onRemoveItem, onUpdateQuantity }: CartProps) {
  const navigate = useNavigate();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = items.length > 0 ? 50 : 0;
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + deliveryFee + tax;

  const groupedByRestaurant = items.reduce(
    (acc, item) => {
      if (!acc[item.restaurantId]) {
        acc[item.restaurantId] = {
          name: item.restaurantName,
          items: [],
        };
      }
      acc[item.restaurantId].items.push(item);
      return acc;
    },
    {} as Record<string, { name: string; items: CartItem[] }>
  );

  if (items.length === 0) {
    return (
      <div className="empty-state min-h-screen">
        <div className="empty-state-icon">🛒</div>
        <p className="empty-state-title">Your cart is empty</p>
        <p className="empty-state-message">Add some delicious food to get started!</p>
        <button
          onClick={() => navigate("/")}
          className="btn-primary"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="cart-container">
        {/* Header */}
        <button
          onClick={() => navigate("/")}
          className="back-button"
        >
          <FaArrowLeft /> Back to Restaurants
        </button>

        <h1 className="text-4xl font-bold text-gray-800 mb-8">Your Cart</h1>

        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items">
            {Object.entries(groupedByRestaurant).map(([restaurantId, group]) => (
              <div key={restaurantId} className="restaurant-group">
                <h2 className="restaurant-group-title">
                  {group.name}
                </h2>

                <div>
                  {group.items.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-image">
                        {item.image}
                      </div>

                      <div className="cart-item-details flex-1">
                        <div className="cart-item-name">{item.name}</div>
                        <div className="cart-item-price">₹{item.price}</div>
                        <div className="cart-item-controls">
                          <button
                            onClick={() =>
                              onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
                            }
                            className="quantity-btn"
                          >
                            −
                          </button>

                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              onUpdateQuantity(item.id, Math.max(1, Number(e.target.value)))
                            }
                            className="w-12 text-center border border-gray-300 rounded py-1 quantity-display"
                          />

                          <button
                            onClick={() =>
                              onUpdateQuantity(item.id, item.quantity + 1)
                            }
                            className="quantity-btn"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="text-right min-w-max ml-4">
                        <p className="font-bold text-gray-800">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:scale-110 transition ml-4 shrink-0"
                        title="Remove item"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="cart-summary">
            <h2 className="summary-title">Order Summary</h2>

            <div className="space-y-3 mb-6">
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
                <span className="text-orange-600">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="checkout-btn"
            >
              <FaShoppingCart /> Proceed to Checkout
            </button>

            <button
              onClick={() => navigate("/")}
              className="btn-outline w-full mt-3"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
