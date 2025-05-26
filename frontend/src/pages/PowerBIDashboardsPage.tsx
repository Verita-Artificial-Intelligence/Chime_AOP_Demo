import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface DashboardMetric {
  timestamp: string;
  value: number;
}

interface DashboardUsage {
  name: string;
  views: number;
  uniqueUsers: number;
  refreshCount: number;
  averageLoadTime: number;
  lastRefresh: string;
  status: 'Active' | 'Scheduled' | 'Failed';
}

interface DatasetMetrics {
  name: string;
  size: number;
  rowCount: number;
  refreshTime: number;
  queryPerformance: number;
  lastUpdate: string;
}

// Mock data generator functions
const generateTimeSeriesData = (hours: number, baseValue: number, variance: number): DashboardMetric[] => {
  return Array.from({ length: hours }, (_, i) => ({
    timestamp: new Date(Date.now() - (hours - i) * 3600000).toISOString(),
    value: baseValue + Math.random() * variance - variance / 2
  }));
};

const generateDashboardUsage = (): DashboardUsage[] => {
  const dashboards = [
    'Financial Overview',
    'Sales Performance',
    'Operational Metrics',
    'HR Analytics',
    'Marketing Campaign',
    'Executive Summary'
  ];

  return dashboards.map(name => ({
    name,
    views: Math.round(100 + Math.random() * 900),
    uniqueUsers: Math.round(20 + Math.random() * 80),
    refreshCount: Math.round(5 + Math.random() * 15),
    averageLoadTime: Math.round(10 + Math.random() * 40) / 10,
    lastRefresh: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    status: Math.random() > 0.9 ? 'Failed' : Math.random() > 0.5 ? 'Active' : 'Scheduled'
  }));
};

const generateDatasetMetrics = (): DatasetMetrics[] => {
  const datasets = [
    'Financial Data',
    'Sales Transactions',
    'Customer Data',
    'Product Catalog',
    'Employee Records',
    'Marketing Data'
  ];

  return datasets.map(name => ({
    name,
    size: Math.round(100 + Math.random() * 900),
    rowCount: Math.round(10000 + Math.random() * 990000),
    refreshTime: Math.round(20 + Math.random() * 180),
    queryPerformance: Math.round(80 + Math.random() * 20),
    lastUpdate: new Date(Date.now() - Math.random() * 86400000).toISOString()
  }));
};

export function PowerBIDashboardsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userActivity, setUserActivity] = useState<DashboardMetric[]>([]);
  const [dashboardUsage, setDashboardUsage] = useState<DashboardUsage[]>([]);
  const [datasetMetrics, setDatasetMetrics] = useState<DatasetMetrics[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setUserActivity(generateTimeSeriesData(24, 50, 30));
      setDashboardUsage(generateDashboardUsage());
      setDatasetMetrics(generateDatasetMetrics());
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchDashboardData();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData().then(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-64 bg-gray-100 rounded-lg"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-64 bg-gray-100 rounded-lg"></div>
          <div className="h-64 bg-gray-100 rounded-lg"></div>
        </div>
        <div className="h-96 bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PowerBI Dashboards</h1>
          <p className="text-gray-600">Monitor and manage your PowerBI dashboard performance</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">User Activity (24h)</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={userActivity}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
                formatter={(value: number) => [value, 'Active Users']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#184A45"
                fill="#A3B9A7"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dashboard Performance</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboardUsage}
                margin={{ top: 20, right: 50, left: 50, bottom: 90 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis yAxisId="left" orientation="left" stroke="#184A45" />
                <YAxis yAxisId="right" orientation="right" stroke="#16a34a" />
                <Tooltip />
                <Legend wrapperStyle={{ paddingTop: "45px" }} />
                <Bar yAxisId="left" dataKey="views" name="Views" fill="#184A45" />
                <Bar yAxisId="right" dataKey="uniqueUsers" name="Unique Users" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dataset Performance</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={datasetMetrics}
                margin={{ top: 20, right: 50, left: 50, bottom: 90 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend wrapperStyle={{ paddingTop: "45px" }} />
                <Line type="monotone" dataKey="queryPerformance" name="Query Performance" stroke="#184A45" />
                <Line type="monotone" dataKey="refreshTime" name="Refresh Time (s)" stroke="#dc2626" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Dashboard Details</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dashboard</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Load Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Refresh</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardUsage.map(dashboard => (
                <tr key={dashboard.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dashboard.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dashboard.views.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dashboard.uniqueUsers}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dashboard.averageLoadTime}s</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(dashboard.lastRefresh).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      dashboard.status === 'Active' ? 'bg-red-100 text-red-800' :
                      dashboard.status === 'Failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {dashboard.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 