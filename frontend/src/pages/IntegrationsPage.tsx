import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'Connected' | 'Disconnected' | 'Error';
  lastSync: string;
  healthScore: number;
  metrics: {
    label: string;
    value: number;
    change: number;
  }[];
}

const mockIntegrations: Integration[] = [
  {
    id: 'oracle-on-prem',
    name: 'Oracle On-Prem',
    description: 'Enterprise resource planning and financial management system',
    status: 'Connected',
    lastSync: '2024-03-21 15:30',
    healthScore: 98,
    metrics: [
      { label: 'Active Users', value: 1250, change: 5.2 },
      { label: 'Daily Transactions', value: 45000, change: 12.3 },
      { label: 'Response Time (ms)', value: 120, change: -8.5 }
    ]
  },
  {
    id: 'orbit-analytics',
    name: 'Orbit Analytics',
    description: 'Advanced analytics and business intelligence platform',
    status: 'Connected',
    lastSync: '2024-03-21 15:45',
    healthScore: 95,
    metrics: [
      { label: 'Reports Generated', value: 850, change: 15.7 },
      { label: 'Data Points Processed', value: 2500000, change: 25.4 },
      { label: 'Query Time (ms)', value: 85, change: -15.2 }
    ]
  },
  {
    id: 'powerbi-dashboards',
    name: 'PowerBI Dashboards',
    description: 'Interactive data visualization and reporting',
    status: 'Connected',
    lastSync: '2024-03-21 15:15',
    healthScore: 92,
    metrics: [
      { label: 'Active Dashboards', value: 45, change: 8.9 },
      { label: 'Daily Views', value: 3200, change: 18.6 },
      { label: 'Refresh Time (min)', value: 5, change: -25.0 }
    ]
  }
];

export function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Remove artificial delay
    setIntegrations(mockIntegrations);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-100 p-6 rounded-lg">
            <div className="h-4 bg-white rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-white rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Integrations</h1>
        <p className="text-gray-600">Manage and monitor your enterprise system integrations</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {integrations.map(integration => (
          <Link
            key={integration.id}
            to={`/${integration.id}`}
            className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">{integration.name}</h2>
                  <p className="text-gray-600">{integration.description}</p>
                </div>
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    integration.status === 'Connected' ? 'bg-red-100 text-red-800' :
                    integration.status === 'Error' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {integration.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                {integration.metrics.map((metric, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {metric.label.includes('Time') ? `${metric.value}${metric.label.includes('ms') ? 'ms' : 'min'}` :
                       metric.value >= 1000000 ? `${(metric.value / 1000000).toFixed(1)}M` :
                       metric.value >= 1000 ? `${(metric.value / 1000).toFixed(1)}K` :
                       metric.value}
                    </div>
                    <div className={`text-sm ${metric.change > 0 ? 'text-red-600' : 'text-red-600'}`}>
                      {metric.change > 0 ? '↑' : '↓'} {Math.abs(metric.change)}%
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>Last synced: {integration.lastSync}</div>
                <div className="flex items-center">
                  <span className="mr-2">Health Score:</span>
                  <div className="w-24 h-2 bg-white rounded-full">
                    <div
                      className={`h-2 rounded-full ${
                        integration.healthScore >= 95 ? 'bg-red-500' :
                        integration.healthScore >= 80 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${integration.healthScore}%` }}
                    ></div>
                  </div>
                  <span className="ml-2">{integration.healthScore}%</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 