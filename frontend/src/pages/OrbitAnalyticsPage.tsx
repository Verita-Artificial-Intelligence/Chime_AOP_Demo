import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsMetric {
  timestamp: string;
  value: number;
}

interface DepartmentSpend {
  department: string;
  spend: number;
  percentage: number;
}

interface VendorAnalytics {
  vendor: string;
  invoices: number;
  totalSpend: number;
  averageProcessingTime: number;
  paymentStatus: {
    onTime: number;
    late: number;
    pending: number;
  };
}

// Mock data generator functions
const generateTimeSeriesData = (days: number, baseValue: number, variance: number): AnalyticsMetric[] => {
  return Array.from({ length: days }, (_, i) => ({
    timestamp: new Date(Date.now() - (days - i) * 86400000).toISOString(),
    value: baseValue + Math.random() * variance - variance / 2
  }));
};

const generateDepartmentSpend = (): DepartmentSpend[] => {
  const departments = ['Finance', 'IT', 'Operations', 'HR', 'Marketing', 'Sales'];
  const total = 1000000;
  let remaining = total;
  
  return departments.map((dept, index) => {
    const isLast = index === departments.length - 1;
    const spend = isLast ? remaining : Math.round(Math.random() * (remaining * 0.4));
    remaining -= spend;
    return {
      department: dept,
      spend,
      percentage: (spend / total) * 100
    };
  });
};

const generateVendorAnalytics = (count: number): VendorAnalytics[] => {
  const vendors = [
    'Tech Solutions Inc.',
    'Global Services Ltd.',
    'Office Supplies Co.',
    'Consulting Partners',
    'Equipment Providers',
    'Software Solutions'
  ];

  return Array.from({ length: count }, (_, i) => ({
    vendor: vendors[i % vendors.length],
    invoices: Math.round(50 + Math.random() * 150),
    totalSpend: Math.round(100000 + Math.random() * 900000),
    averageProcessingTime: Math.round(2 + Math.random() * 5),
    paymentStatus: {
      onTime: Math.round(60 + Math.random() * 30),
      late: Math.round(5 + Math.random() * 15),
      pending: Math.round(5 + Math.random() * 10)
    }
  }));
};

const COLORS = ['#184A45', '#16a34a', '#9333ea', '#ea580c', '#0891b2', '#be123c'];

export function OrbitAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dailySpend, setDailySpend] = useState<AnalyticsMetric[]>([]);
  const [departmentSpend, setDepartmentSpend] = useState<DepartmentSpend[]>([]);
  const [vendorAnalytics, setVendorAnalytics] = useState<VendorAnalytics[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setDailySpend(generateTimeSeriesData(30, 50000, 20000));
      setDepartmentSpend(generateDepartmentSpend());
      setVendorAnalytics(generateVendorAnalytics(6));
      setError(null);
    } catch (err) {
      setError('Failed to fetch analytics data');
    }
  };

  useEffect(() => {
    fetchAnalytics().then(() => setLoading(false));
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Orbit Analytics</h1>
        <p className="text-gray-600">Vendor payments and spend analytics dashboard</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Spend Trend</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dailySpend}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
              />
              <YAxis
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                labelFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spend']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#184A45"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Department Spend Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 50, left: 50, bottom: 20 }}>
                <Pie
                  data={departmentSpend}
                  dataKey="spend"
                  nameKey="department"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ department, percentage }) => `${department} (${percentage.toFixed(1)}%)`}
                >
                  {departmentSpend.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Status by Vendor</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={vendorAnalytics}
                margin={{ top: 20, right: 50, left: 50, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="vendor" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend wrapperStyle={{ paddingTop: "45px" }} />
                <Bar dataKey="paymentStatus.onTime" name="On Time" stackId="a" fill="#16a34a" />
                <Bar dataKey="paymentStatus.late" name="Late" stackId="a" fill="#dc2626" />
                <Bar dataKey="paymentStatus.pending" name="Pending" stackId="a" fill="#eab308" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Vendor Analytics</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoices</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spend</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Processing Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendorAnalytics.map(vendor => (
                <tr key={vendor.vendor} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vendor.vendor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.invoices}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${vendor.totalSpend.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.averageProcessingTime} days</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        {vendor.paymentStatus.onTime} On Time
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        {vendor.paymentStatus.late} Late
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        {vendor.paymentStatus.pending} Pending
                      </span>
                    </div>
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