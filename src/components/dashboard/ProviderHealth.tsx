// app/components/dashboard/ProviderHealth.tsx
'use client';

import React, { useEffect, useState } from 'react';

interface ProviderData {
  id: string;
  name: string;
  status: string;
  latency: number;
  uptime: number;
  errorRate: number;
  totalRequests: number;
  successRate: number;
  lastError: string | null;
  models: string[];
}

interface ProviderHealthData {
  providers: ProviderData[];
  overallHealth: string;
  totalActiveProviders: number;
  averageLatency: number;
  totalErrors: number;
  lastHealthCheck: string;
}

export const ProviderHealth: React.FC = () => {
  const [providerData, setProviderData] = useState<ProviderHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        const response = await fetch('/api/analytics/providers');
        if (!response.ok) {
          throw new Error('Failed to fetch provider data');
        }
        const data = await response.json();
        setProviderData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProviderData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'text-green-600 bg-green-50';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50';
      case 'unhealthy':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return '🟢';
      case 'degraded':
        return '🟡';
      case 'unhealthy':
        return '🔴';
      default:
        return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !providerData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center text-red-600">
          <p className="text-lg font-medium">Failed to load provider health data</p>
          <p className="text-sm text-gray-500 mt-1">
            {error || 'Unable to fetch data'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Provider Health</h2>
        <div className="text-sm text-gray-500">
          Real-time status monitoring
        </div>
      </div>

      <div className="space-y-4">
        {providerData.providers.map((provider) => (
          <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-lg">
                {getStatusIcon(provider.status)}
              </span>
              <div>
                <div className="font-medium text-gray-900">{provider.name}</div>
                <div className="text-sm text-gray-500">{provider.id}</div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(provider.status)}`}>
                  {provider.status}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {provider.latency}ms latency
                </div>
              </div>

              <div className="text-right text-sm">
                <div className="text-gray-900">
                  {provider.errorRate.toFixed(1)}% error rate
                </div>
                <div className="text-gray-500">
                  {provider.uptime.toFixed(1)}% uptime
                </div>
              </div>
            </div>
          </div>
        ))}

        {providerData.providers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No providers configured
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {providerData.totalActiveProviders}
            </div>
            <div className="text-sm text-gray-500">Total Providers</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {providerData.providers.filter(p => p.status === 'healthy').length}
            </div>
            <div className="text-sm text-gray-500">Healthy</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {providerData.providers.filter(p => p.status === 'degraded').length}
            </div>
            <div className="text-sm text-gray-500">Degraded</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {providerData.providers.filter(p => p.status === 'unhealthy').length}
            </div>
            <div className="text-sm text-gray-500">Unhealthy</div>
          </div>
        </div>
      </div>
    </div>
  );
};
