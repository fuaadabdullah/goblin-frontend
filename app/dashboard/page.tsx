"use client";

import React, { useState } from 'react';
import { DashboardSkeleton } from '@/components/LoadingSkeleton';
import { UsageStats } from '@/components/dashboard/UsageStats';
import { ProviderHealth } from '@/components/dashboard/ProviderHealth';
import { Button } from '@/components/ui';
import { RefreshCw } from 'lucide-react';

/**
 * Dashboard Page - Next.js App Router
 * Simplified version using existing components
 */
export default function DashboardPage() {
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">System Overview & Status</p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Usage Statistics */}
        <UsageStats />

        {/* Provider Health */}
        <ProviderHealth />

        {/* Quick Links Card */}
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/providers"
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium block"
            >
              Manage Providers
            </a>
            <a
              href="/logs"
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center font-medium block"
            >
              View Logs
            </a>
            <a
              href="/sandbox"
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center font-medium block"
            >
              Sandbox Jobs
            </a>
            <a
              href="/settings"
              className="px-4 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors text-center font-medium block"
            >
              Settings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
