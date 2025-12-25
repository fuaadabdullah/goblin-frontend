// app/api/analytics/providers/route.ts
import { NextResponse } from 'next/server';
import { db } from '../../../lib/services/database';

export async function GET() {
  try {
    const providerHealthData = await db.getProviderHealth();

    if (!providerHealthData) {
      // Return mock data if database is not available
      const mockProviderData = {
        providers: [
          {
            id: 'openai',
            name: 'OpenAI',
            status: 'healthy',
            latency: 1.2,
            uptime: 99.8,
            errorRate: 0.2,
            totalRequests: 8920,
            successRate: 99.8,
            lastError: null,
            models: ['gpt-4', 'gpt-3.5-turbo'],
          },
          {
            id: 'anthropic',
            name: 'Anthropic',
            status: 'healthy',
            latency: 1.8,
            uptime: 99.9,
            errorRate: 0.1,
            totalRequests: 4567,
            successRate: 99.9,
            lastError: null,
            models: ['claude-3-opus', 'claude-3-sonnet'],
          },
          {
            id: 'google',
            name: 'Google',
            status: 'degraded',
            latency: 2.5,
            uptime: 97.2,
            errorRate: 2.8,
            totalRequests: 1933,
            successRate: 97.2,
            lastError: 'Rate limit exceeded',
            models: ['gemini-pro'],
          },
        ],
        overallHealth: 'healthy',
        totalActiveProviders: 3,
        averageLatency: 1.83,
        totalErrors: 54,
        lastHealthCheck: new Date().toISOString(),
      };

      return NextResponse.json(mockProviderData);
    }

    // Transform the data to match the expected format
    const providers = providerHealthData.map(provider => ({
      id: provider.provider_id,
      name: provider.provider_id.charAt(0).toUpperCase() + provider.provider_id.slice(1), // Simple name formatting
      status: provider.status,
      latency: provider.latency_ms || 0,
      uptime: provider.uptime_percentage || 0,
      errorRate: provider.error_rate || 0,
      totalRequests: 0, // TODO: Calculate from usage logs
      successRate: 100 - (provider.error_rate || 0),
      lastError: null, // TODO: Get from error logs
      models: [], // TODO: Get from provider configuration
    }));

    const totalActiveProviders = providers.length;
    const averageLatency = providers.length > 0
      ? providers.reduce((sum, p) => sum + p.latency, 0) / providers.length
      : 0;
    const totalErrors = providers.reduce((sum, p) => sum + (p.errorRate * p.totalRequests / 100), 0);

    // Determine overall health
    const healthyCount = providers.filter(p => p.status === 'healthy').length;
    const overallHealth = healthyCount === providers.length ? 'healthy' :
                         healthyCount > 0 ? 'degraded' : 'unhealthy';

    const providerData = {
      providers,
      overallHealth,
      totalActiveProviders,
      averageLatency,
      totalErrors: Math.round(totalErrors),
      lastHealthCheck: new Date().toISOString(),
    };

    return NextResponse.json(providerData);

  } catch (error) {
    console.error('Analytics providers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
