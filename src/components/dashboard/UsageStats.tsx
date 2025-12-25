// components/dashboard/UsageStats.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { formatNumber, formatCurrency } from '../../lib/utils/index';
import { TrendingUp, MessageSquare, DollarSign, Clock } from 'lucide-react';
import { clsx } from 'clsx';

interface UsageStatsProps {
  className?: string;
}

interface UsageData {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  averageResponseTime: number;
  requestsByDay: Array<{
    date: string;
    requests: number;
    tokens: number;
    cost: number;
  }>;
}

export function UsageStats({ className }: UsageStatsProps) {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        const response = await fetch('/api/analytics/usage');
        if (!response.ok) {
          throw new Error('Failed to fetch usage data');
        }
        const data = await response.json();
        setUsageData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();
  }, []);

  const stats = useMemo(() => {
    if (!usageData) return null;

    // Calculate changes compared to previous period (simplified - using last 7 days vs previous 7 days)
    const currentPeriod = usageData.requestsByDay.slice(-7);
    const previousPeriod = usageData.requestsByDay.slice(-14, -7);

    const currentTotal = currentPeriod.reduce((sum, day) => sum + day.requests, 0);
    const previousTotal = previousPeriod.reduce((sum, day) => sum + day.requests, 0);

    const currentTokens = currentPeriod.reduce((sum, day) => sum + day.tokens, 0);
    const previousTokens = previousPeriod.reduce((sum, day) => sum + day.tokens, 0);

    const currentCost = currentPeriod.reduce((sum, day) => sum + day.cost, 0);
    const previousCost = previousPeriod.reduce((sum, day) => sum + day.cost, 0);

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      totalMessages: {
        value: usageData.totalRequests,
        change: calculateChange(currentTotal, previousTotal),
      },
      totalTokens: {
        value: usageData.totalTokens,
        change: calculateChange(currentTokens, previousTokens),
      },
      totalCost: {
        value: usageData.totalCost,
        change: calculateChange(currentCost, previousCost),
      },
      avgResponseTime: {
        value: usageData.averageResponseTime * 1000, // Convert to ms
        change: 0, // TODO: Calculate from historical data
      },
    };
  }, [usageData]);

  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    format = (v: number) => v.toString(),
    color = 'blue'
  }: {
    title: string;
    value: number;
    change: number;
    icon: React.ComponentType<{ className?: string }>;
    format?: (value: number) => string;
    color?: 'blue' | 'green' | 'yellow' | 'red';
  }) => {
    const colorClasses = {
      blue: 'text-blue-600 bg-blue-50',
      green: 'text-green-600 bg-green-50',
      yellow: 'text-yellow-600 bg-yellow-50',
      red: 'text-red-600 bg-red-50',
    };

    return (
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {format(value)}
            </p>
          </div>
          <div className={clsx('p-3 rounded-full', colorClasses[color])}>
            <Icon className="w-6 h-6" />
          </div>
        </div>

        {change !== 0 && (
          <div className="flex items-center mt-4">
            <TrendingUp
              className={clsx(
                'w-4 h-4 mr-1',
                change > 0 ? 'text-green-500' : 'text-red-500'
              )}
            />
            <span
              className={clsx(
                'text-sm font-medium',
                change > 0 ? 'text-green-600' : 'text-red-600'
              )}
            >
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={clsx('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-6 shadow-sm animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={clsx('bg-white rounded-lg border p-6 shadow-sm', className)}>
        <div className="text-center text-red-600">
          <p className="text-lg font-medium">Failed to load usage statistics</p>
          <p className="text-sm text-gray-500 mt-1">
            {error || 'Unable to fetch data'}
          </p>
        </div>
      </div>
    );
  }

    return (
      <div className={clsx('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
      <StatCard
        title="Total Messages"
        value={stats.totalMessages.value}
        change={stats.totalMessages.change}
        icon={MessageSquare}
        format={formatNumber}
        color="blue"
      />

      <StatCard
        title="Total Tokens"
        value={stats.totalTokens.value}
        change={stats.totalTokens.change}
        icon={TrendingUp}
        format={formatNumber}
        color="green"
      />

      <StatCard
        title="Total Cost"
        value={stats.totalCost.value}
        change={stats.totalCost.change}
        icon={DollarSign}
        format={(v) => formatCurrency(v, 'USD')}
        color="yellow"
      />

      <StatCard
        title="Avg Response Time"
        value={stats.avgResponseTime.value}
        change={stats.avgResponseTime.change}
        icon={Clock}
        format={(v) => `${v.toFixed(1)}ms`}
        color="red"
      />
    </div>
  );
}
