
import { useState, useEffect } from "react";
import { restaurants as localRestaurants, type Restaurant } from "../data/mockData";
import { RestaurantCard } from "./RestaurantCard";
import { FaFilter } from "react-icons/fa";
import { fetchRestaurants } from "../services/api";
import { useToast } from "../hooks/useToast";

interface RestaurantListProps {
  searchQuery?: string;
}

export function RestaurantList({ searchQuery = "" }: RestaurantListProps) {
  const [selectedCuisine, setSelectedCuisine] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("rating");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<"api" | "local">("local");
  const { addToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchRestaurants({
      search: searchQuery || undefined,
      cuisine: selectedCuisine || undefined,
      minRating: selectedRating || undefined,
      sortBy: sortBy || undefined,
    }).then((result) => {
      if (cancelled) return;
      setRestaurants(result.data);
      setDataSource(result.source);
      if (result.source === "local" && result.reason) {
        addToast(result.reason, "info");
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [searchQuery, selectedCuisine, selectedRating, sortBy, addToast]);

  const cuisines = Array.from(
    new Set(localRestaurants.flatMap((r) => r.cuisine.split(", ")))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters Section */}
        <div className="filter-section-compact">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <FaFilter size={12} /> Filters & Sort
            </h2>
            <span className="text-xs text-gray-500">
              {restaurants.length} results
              {dataSource === "local" && (
                <span className="ml-1 text-orange-600 font-medium">(Offline)</span>
              )}
            </span>
          </div>

          <div className="filter-grid-compact">
            {/* Cuisine Filter */}
            <div className="filter-group-compact">
              <label htmlFor="cuisine">Cuisine</label>
              <select
                id="cuisine"
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
              >
                <option value="">All</option>
                {cuisines.map((cuisine) => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div className="filter-group-compact">
              <label htmlFor="rating">Rating</label>
              <select
                id="rating"
                value={selectedRating}
                onChange={(e) => setSelectedRating(Number(e.target.value))}
              >
                <option value="0">All</option>
                <option value="4">4.0+</option>
                <option value="4.5">4.5+</option>
                <option value="4.7">4.7+</option>
              </select>
            </div>

            {/* Sort */}
            <div className="filter-group-compact">
              <label htmlFor="sort">Sort By</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="rating">Rating</option>
                <option value="delivery">Delivery</option>
                <option value="discount">Discount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="spinner" role="status" aria-label="Loading restaurants">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}

        {/* Restaurants Grid */}
        {!loading && restaurants.length > 0 ? (
          <div className="restaurant-grid">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        ) : !loading && (
          <div className="empty-state">
            <p className="empty-state-title">No restaurants found</p>
            <p className="empty-state-message">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
