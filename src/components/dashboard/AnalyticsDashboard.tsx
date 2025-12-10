'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProposalAnalytics } from '@/lib/analytics/queries';

export default function AnalyticsDashboard({ userId }: { userId: string }) {
  const [analytics, setAnalytics] = useState<ProposalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await fetch(`/api/analytics?userId=${userId}`);
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      loadAnalytics();
    }
  }, [userId]);

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  if (!analytics) {
    return <div>Failed to load analytics</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.total_proposals}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Signed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {analytics.signed_proposals}
          </div>
          <p className="text-xs text-gray-600">
            {analytics.win_rate.toFixed(1)}% win rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${analytics.total_value.toLocaleString()}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Signed Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            ${analytics.signed_value.toLocaleString()}
          </div>
          <p className="text-xs text-gray-600">
            Avg: ${analytics.average_value.toFixed(0)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
