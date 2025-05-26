import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SystemMetric {
  timestamp: string;
  value: number;
}

interface SystemHealth {
  cpu: SystemMetric[];
  memory: SystemMetric[];
  diskIO: SystemMetric[];
  activeUsers: SystemMetric[];
}

interface Transaction {
  id: string;
  type: string;
  status: 'Completed' | 'Processing' | 'Failed';
  timestamp: string;
  amount: number;
  department: string;
}

// Mock data generator functions
const generateTimeSeriesData = (hours: number, baseValue: number, variance: number): SystemMetric[] => {
  return Array.from({ length: hours }, (_, i) => ({
    timestamp: new Date(Date.now() - (hours - i) * 3600000).toISOString(),
    value: baseValue + Math.random() * variance - variance / 2
  }));
};

const generateTransactions = (count: number): Transaction[] => {
  const types = ['Invoice', 'Payment', 'Journal Entry', 'Purchase Order'];
  const departments = ['Finance', 'HR', 'Operations', 'IT', 'Sales'];
  const statuses: ('Completed' | 'Processing' | 'Failed')[] = ['Completed', 'Processing', 'Failed'];

  return Array.from({ length: count }, (_, i) => ({
    id: `TXN-${Math.random().toString(36).substr(2, 9)}`,
    type: types[Math.floor(Math.random() * types.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    amount: Math.round(Math.random() * 100000),
    department: departments[Math.floor(Math.random() * departments.length)]
  }));
};

export function OracleOnPremPage() {
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<keyof SystemHealth>('cpu');
  const [error, setError] = useState<string | null>(null);

  const fetchSystemHealth = async () => {
    try {
      setSystemHealth({
        cpu: generateTimeSeriesData(24, 45, 20),
        memory: generateTimeSeriesData(24, 65, 15),
        diskIO: generateTimeSeriesData(24, 250, 100),
        activeUsers: generateTimeSeriesData(24, 1200, 400)
      });
    } catch (err) {
      setError('Failed to fetch system health data');
    }
  };

  const fetchTransactions = async () => {
    try {
      setTransactions(generateTransactions(10));
    } catch (err) {
      setError('Failed to fetch transaction data');
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await Promise.all([
        fetchSystemHealth(),
        fetchTransactions()
      ]);
      setLoading(false);
    };

    initialize();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-64 bg-gray-100 rounded-lg"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const metricLabels: Record<keyof SystemHealth, string> = {
    cpu: 'CPU Usage (%)',
    memory: 'Memory Usage (%)',
    diskIO: 'Disk I/O (IOPS)',
    activeUsers: 'Active Users'
  };

  const getMetricColor = (metric: keyof SystemHealth): string => {
    const colors: Record<keyof SystemHealth, string> = {
      cpu: '#184A45',
      memory: '#16a34a',
      diskIO: '#9333ea',
      activeUsers: '#ea580c'
    };
    return colors[metric];
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Oracle On-Prem Integration</h1>
        <p className="text-gray-600">Monitor and manage your Oracle ERP system integration</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">System Health</h2>
          <div className="flex gap-2">
            {(Object.keys(metricLabels) as Array<keyof SystemHealth>).map(metric => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  selectedMetric === metric
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-white'
                }`}
              >
                {metricLabels[metric]}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={systemHealth?.[selectedMetric]}
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
                formatter={(value: number) => [
                  selectedMetric === 'diskIO'
                    ? `${value.toFixed(0)} IOPS`
                    : selectedMetric === 'activeUsers'
                    ? value.toFixed(0)
                    : `${value.toFixed(1)}%`,
                  metricLabels[selectedMetric]
                ]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={getMetricColor(selectedMetric)}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map(transaction => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      transaction.status === 'Completed' ? 'bg-red-100 text-red-800' :
                      transaction.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 