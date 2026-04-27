import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { type Restaurant, type MenuItem } from "../data/mockData";
import { fetchRestaurantById } from "../services/api";
import { useToast } from "../hooks/useToast";
import { FaStar, FaClock, FaArrowLeft, FaShoppingCart } from "react-icons/fa";

interface RestaurantDetailsProps {
  onAddToCart: (item: MenuItem, quantity: number, restaurantId: number) => void;
}

export function RestaurantDetails({ onAddToCart }: RestaurantDetailsProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const numericId = Number(id);
  const [restaurant, setRestaurant] = useState<Restaurant | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<"api" | "local">("local");
  const { addToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchRestaurantById(numericId).then((result) => {
      if (cancelled) return;
      setRestaurant(result.data);
      setDataSource(result.source);
      if (result.source === "local" && result.reason) {
        addToast(result.reason, "info");
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [numericId, addToast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="spinner" role="status" aria-label="Loading restaurant details">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="empty-state min-h-screen">
        <p className="empty-state-title">Restaurant not found</p>
        <button
          onClick={() => navigate("/")}
          className="btn-primary mt-4"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const categories = Array.from(new Set(restaurant.menu.map((item) => item.category)));
  const filteredMenu =
    selectedCategory === ""
      ? restaurant.menu
      : restaurant.menu.filter((item) => item.category === selectedCategory);

  const handleQuantityChange = (itemId: number, quantity: number) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(0, quantity),
    }));
  };

  const handleAddToCart = (item: MenuItem) => {
    const quantity = quantities[item.id] || 1;
    if (quantity > 0) {
      onAddToCart(item, quantity, restaurant.id);
      setQuantities((prev) => ({
        ...prev,
        [item.id]: 0,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant Header */}
      <div className="restaurant-header">
        <div className="restaurant-header-content">
          <button
            onClick={() => navigate("/")}
            className="back-button"
          >
            <FaArrowLeft /> Back to Restaurants
          </button>

          <div className="restaurant-hero">
            <div className="restaurant-emoji">{restaurant.image}</div>

            <div className="restaurant-info">
              <h1>{restaurant.name}</h1>

              <p className="restaurant-cuisine">{restaurant.cuisine}</p>

              <div className="restaurant-stats">
                <div className="stat">
                  <FaStar className="text-yellow-400 text-lg" />
                  <div>
                    <span className="stat-value">{restaurant.rating}</span>
                    <span className="stat-label"> ({restaurant.reviews} reviews)</span>
                  </div>
                </div>

                <div className="stat">
                  <FaClock className="text-gray-600 text-lg" />
                  <div>
                    <span className="stat-value">{restaurant.deliveryTime}</span>
                    <span className="stat-label"> mins</span>
                  </div>
                </div>

                <div className="stat">
                  <span className="stat-label">Delivery fee</span>
                  <span className="stat-value">₹{restaurant.deliveryFee}</span>
                </div>
              </div>

              {restaurant.discount && (
                <div className="badge badge-success">
                  {restaurant.discount}% OFF Available
                </div>
              )}
              {dataSource === "local" && (
                <div className="badge badge-warning mt-2">
                  Offline Mode — Using local data
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="menu-container">
        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Menu</h2>

          <div className="menu-categories">
            <button
              onClick={() => setSelectedCategory("")}
              className={`category-btn ${selectedCategory === "" ? "active" : ""}`}
            >
              All Items
            </button>

            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`category-btn ${selectedCategory === category ? "active" : ""}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="menu-items">
          {filteredMenu.map((item) => (
            <div key={item.id} className="menu-item-card">
              <div className="menu-item-image">
                {item.image}
              </div>

              <div className="menu-item-content">
                <h3 className="menu-item-name">{item.name}</h3>

                <p className="menu-item-description">
                  {item.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className="menu-item-price">₹{item.price}</span>
                  <span className="text-xs badge badge-warning">
                    {item.category}
                  </span>
                </div>

                <div className="menu-item-controls">
                  <div className="quantity-selector">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, (quantities[item.id] || 0) - 1)
                      }
                      className="quantity-btn"
                    >
                      −
                    </button>

                    <span className="quantity-display">
                      {quantities[item.id] || 0}
                    </span>

                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, (quantities[item.id] || 0) + 1)
                      }
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={!quantities[item.id] || quantities[item.id] === 0}
                  className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition mt-4 ${
                    quantities[item.id] && quantities[item.id] > 0
                      ? "bg-orange-500 text-white hover:bg-orange-600 hover:shadow-lg"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <FaShoppingCart /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
