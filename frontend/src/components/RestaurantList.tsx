import { useState, useEffect } from "react";
import { type Restaurant } from "../types/restaurant";

import { RestaurantCard } from "./RestaurantCard";
import { fetchRestaurants } from "../services/api";
import { useToast } from "../hooks/useToast";

interface RestaurantListProps {
  searchQuery?: string;
  selectedCuisine?: string;
  selectedRating?: number;
  sortBy?: string;
}

export function RestaurantList({
  searchQuery = "",
  selectedCuisine = "",
  selectedRating = 0,
  sortBy = "rating",
}: RestaurantListProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<"api" | "local">("local");
  const { addToast } = useToast();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErrorMessage(null);

    fetchRestaurants({
      search: searchQuery || undefined,
      cuisine: selectedCuisine || undefined,
      minRating: selectedRating || undefined,
      sortBy: sortBy || undefined,
    })
      .then((result) => {
        if (cancelled) return;
        setRestaurants(result.data);
        setDataSource(result.source);
        if (result.source === "local" && result.reason) {
          addToast(result.reason, "info");
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Restaurant service unavailable";
        setErrorMessage(message ?? "Restaurant service unavailable");
        setLoading(false);
      });


    return () => {
      cancelled = true;
    };
  }, [searchQuery, selectedCuisine, selectedRating, sortBy, addToast]);


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            Restaurants
          </h2>
          <span className="text-sm text-gray-500">
            {restaurants.length} results
            {dataSource === "local" && (
              <span className="ml-1 text-orange-600 font-medium">(Offline)</span>
            )}
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="spinner" role="status" aria-label="Loading restaurants">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && errorMessage ? (
          <div className="empty-state">
            <p className="empty-state-title">Unable to reach restaurant service</p>
            <p className="empty-state-message">{errorMessage}</p>
            <button
              className="btn-primary mt-4"
              onClick={() => {
                setErrorMessage(null);
                setLoading(true);
              }}
            >
              Retry
            </button>
          </div>
        ) : null}

        {/* Restaurants Grid */}
        {!loading && !errorMessage && restaurants.length > 0 ? (
          <div className="restaurant-grid">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        ) : !loading && !errorMessage ? (
          <div className="empty-state">
            <p className="empty-state-title">No restaurants found</p>
            <p className="empty-state-message">Try adjusting your filters</p>
          </div>
        ) : null}

      </div>
    </div>
  );
}
