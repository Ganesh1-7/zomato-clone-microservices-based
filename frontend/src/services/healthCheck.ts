import axios from 'axios';

const SERVICE_URLS = {
  user: 'http://localhost:3001',
  restaurant: 'http://localhost:3002',
  order: 'http://localhost:3003',
  delivery: 'http://localhost:3004',
  payment: 'http://localhost:3005',
};

export interface HealthStatus {
  service: string;
  url: string;
  status: 'UP' | 'DOWN';
  responseTime?: number;
  error?: string;
}

export async function checkHealth(): Promise<HealthStatus[]> {
  const checks = Object.entries(SERVICE_URLS).map(async ([name, url]) => {
    const start = Date.now();
    try {
      const response = await axios.get(`${url}/health`, { timeout: 3000 });
      const status: 'UP' | 'DOWN' = response.data?.status === 'UP' ? 'UP' : 'DOWN';
      return {
        service: name,
        url,
        status,
        responseTime: Date.now() - start,
      };
    } catch (err: any) {
      return {
        service: name,
        url,
        status: 'DOWN' as const,
        error: err?.message || 'Connection failed',
      };
    }
  });

  return Promise.all(checks);
}
