import { useNavigate } from 'react-router-dom';
import { FaHome, FaSearch } from 'react-icons/fa';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6 animate-float">🍕</div>
        <h1 className="text-6xl font-extrabold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
          Oops! The page you're looking for seems to have been eaten. Let's get you back to
          delicious food.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate('/')} className="btn-primary">
            <FaHome /> Back to Home
          </button>
          <button onClick={() => navigate(-1)} className="btn-outline">
            <FaSearch /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

