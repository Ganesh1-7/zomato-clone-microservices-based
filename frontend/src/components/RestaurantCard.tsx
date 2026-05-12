import { Link } from "react-router-dom";
import type { Restaurant } from "../types/restaurant";

import { FaStar, FaClock } from "react-icons/fa";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link to={`/restaurant/${restaurant.id}`} className="no-underline">
      <div className="restaurant-card">
        <div className="restaurant-card-image">
          {restaurant.image}
          {restaurant.discount && (
            <div className="discount-badge">
              {restaurant.discount}% OFF
            </div>
          )}
        </div>

        <div className="restaurant-card-content">
          <h3 className="restaurant-card-title">
            {restaurant.name}
          </h3>

          <p className="restaurant-card-cuisine">{restaurant.cuisine}</p>

          <div className="restaurant-card-meta">
            <div className="restaurant-card-rating">
              <FaStar className="star" />
              <span className="value">{restaurant.rating}</span>
              <span className="reviews">({restaurant.reviews})</span>
            </div>

            <div className="restaurant-card-delivery">
              <FaClock size={14} />
              <span>{restaurant.deliveryTime}m</span>
            </div>
          </div>

          <div className="restaurant-card-fee">
            Delivery: ₹{restaurant.deliveryFee}
          </div>
        </div>
      </div>
    </Link>
  );
}
