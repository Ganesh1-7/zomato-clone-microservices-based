import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeartbeat, FaArrowLeft, FaRedo, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { checkHealth, type HealthStatus } from '../services/healthCheck';

export function ApiStatus() {
  const [status, setStatus] = useState<HealthStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const runCheck = async () => {
    setLoading(true);
    const results = await checkHealth();
    setStatus(results);
    setLoading(false);
  };

  useEffect(() => {
    runCheck();
  }, []);

  const allUp = status.length > 0 && status.every((s) => s.status === 'UP');
  const upCount = status.filter((s) => s.status === 'UP').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-orange-600 font-semibold mb-6 hover:underline"
        >
          <FaArrowLeft /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <FaHeartbeat className="text-orange-500 text-3xl" />
          <h1 className="text-3xl font-bold text-gray-800">API Status</h1>
        </div>

        {loading ? (
          <div className="min-h-[30vh] flex items-center justify-center">
            <div className="spinner" role="status">
              <span className="sr-only">Checking services...</span>
            </div>
          </div>
        ) : (
          <>
            <div
              className={
                'rounded-xl p-4 mb-8 flex items-center gap-3 border ' +
                (allUp
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800')
              }
            >
              {allUp ? (
                <FaCheckCircle className="text-green-600 text-xl" />
              ) : (
                <FaTimesCircle className="text-red-600 text-xl" />
              )}
              <div>
                <p className="font-bold text-lg">
                  {allUp ? 'All Systems Operational' : 'Some Services Unavailable'}
                </p>
                <p className="text-sm">
                  {upCount} of {status.length} services are up
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {status.map((svc) => (
                <div
                  key={svc.service}
                  className={
                    'rounded-xl border p-5 flex items-center justify-between ' +
                    (svc.status === 'UP'
                      ? 'bg-white border-green-200'
                      : 'bg-white border-red-200')
                  }
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={
                        'w-4 h-4 rounded-full ' +
                        (svc.status === 'UP' ? 'bg-green-500' : 'bg-red-500')
                      }
                    />
                    <div>
                      <p className="font-bold text-gray-800 capitalize text-lg">
                        {svc.service}
                      </p>
                      <p className="text-sm text-gray-500 font-mono">{svc.url}</p>
                      {svc.error && (
                        <p className="text-sm text-red-600 mt-1">{svc.error}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {svc.status === 'UP' ? (
                      <span className="inline-flex items-center gap-2 text-green-700 font-semibold">
                        <FaCheckCircle />
                        UP
                        {svc.responseTime !== undefined && (
                          <span className="text-sm font-normal text-gray-500">
                            {svc.responseTime}ms
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-red-700 font-semibold">
                        <FaTimesCircle />
                        DOWN
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={runCheck} className="btn-primary flex items-center gap-2">
              <FaRedo /> Refresh Status
            </button>
          </>
        )}
      </div>
    </div>
  );
}

