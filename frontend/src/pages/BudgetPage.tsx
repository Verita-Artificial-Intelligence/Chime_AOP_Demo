import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { IntegrationModal } from '../components/IntegrationModal';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface BudgetPageProps {
  mockData: any;
}

export function BudgetPage({ mockData }: BudgetPageProps) {
  const [integrationModal, setIntegrationModal] = React.useState<{ open: boolean; type: 'orbit' | 'powerbi' | 'oracle' | null }>({ open: false, type: null });
  const { budgetForecastData, budgetAllocations } = mockData;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Budget</h1>
        <p className="text-gray-600">Manage and monitor your budget allocations and forecasts</p>
      </div>
      <div className="mb-section">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="card">
            <div className="font-semibold text-brand-dark mb-2 font-sans">Budget Summary</div>
            <div className="text-2xl font-bold text-brand mb-1 font-sans">$1.2B</div>
            <div className="text-brand-light text-sm font-sans">YTD Spend: $450.0M</div>
            <div className="text-red-500 font-semibold mt-2 font-sans">+2.3%</div>
            <div className="text-brand-light text-xs font-sans">Fiscal Year 2025</div>
          </div>
          <div className="card font-sans">
            <div className="font-semibold text-brand-dark mb-2">Budget Allocations</div>
            <div className="space-y-3">
              {budgetAllocations.map((alloc: any) => (
                <div key={alloc.department}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{alloc.department}</span>
                    <span className="font-semibold">${(alloc.amount/1e6).toFixed(1)}M ({alloc.percent}%)</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2.5">
                    <div className="bg-brand h-2.5 rounded-full" style={{ width: `${alloc.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="font-semibold text-brand-dark mb-2 font-sans">AI Insights</div>
            <div className="text-brand-light text-sm mb-4 font-sans">Based on current spending patterns, the Investment department is projected to be 5% under budget by year end. Consider reallocating funds to Technology initiatives.</div>
          </div>
        </div>

        <div className="card mb-10 overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
          <div className="font-semibold text-lg text-brand-dark mb-4 font-sans">Budget Items</div>
          <table className="min-w-full text-sm font-sans">
            <thead>
              <tr className="text-left text-brand-dark border-b border-gray-200 bg-gray-50 font-sans">
                <th className="py-2 px-4 font-semibold">Department</th>
                <th className="py-2 px-4 font-semibold">Category</th>
                <th className="py-2 px-4 font-semibold">Description</th>
                <th className="py-2 px-4 font-semibold">Amount</th>
                <th className="py-2 px-4 font-semibold">Period</th>
                <th className="py-2 px-4 font-semibold">Status</th>
                <th className="py-2 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { dept: 'Investment', cat: 'Investment', desc: 'Staff Salaries', amt: '$250.0K', period: 'Q2', status: 'Approved' },
                { dept: 'Technology', cat: 'Technology', desc: 'Infrastructure Upgrade', amt: '$180.0K', period: 'Q2', status: 'Approved' },
                { dept: 'Operations', cat: 'Operations', desc: 'Office Supplies', amt: '$15.0K', period: 'Q2', status: 'Approved' },
                { dept: 'Marketing', cat: 'Marketing', desc: 'Digital Campaign', amt: '$75.0K', period: 'Q2', status: 'Approved' },
              ].map((row, i) => (
                <tr key={row.desc} className={
                  `${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors border-b border-gray-100`
                }>
                  <td className="py-2 px-4 font-medium text-brand-dark align-middle">{row.dept}</td>
                  <td className="py-2 px-4 align-middle">{row.cat}</td>
                  <td className="py-2 px-4 align-middle">{row.desc}</td>
                  <td className="py-2 px-4 align-middle">{row.amt}</td>
                  <td className="py-2 px-4 align-middle">{row.period}</td>
                  <td className="py-2 px-4 align-middle"><span className="text-red-500 font-semibold">{row.status}</span></td>
                  <td className="py-2 px-4 align-middle">
                    <button className="btn-secondary mr-2 px-3 py-1 text-sm">Edit</button>
                    <button className="btn-danger px-3 py-1 text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card flex items-center justify-center text-brand-light min-h-[120px] font-sans">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={budgetForecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={v => `$${(v/1e6).toFixed(1)}M`} />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="planned" stroke="#2563eb" name="Planned Spend" strokeWidth={2} />
                <Line type="monotone" dataKey="actual" stroke="#10b981" name="Actual Spend" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="card font-sans">
            <div className="font-semibold text-brand-dark mb-2 font-sans">Integration Status</div>
            <ul className="space-y-2 font-sans">
              <li className="flex items-center justify-between font-sans">
                <div className="flex items-center gap-2">
                  <span>Oracle On-Prem</span>
                  <button onClick={() => setIntegrationModal({ open: true, type: 'oracle' })} className="text-brand hover:text-brand-dark">
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-red-500 font-semibold font-sans">Connected</span>
              </li>
              <li className="flex items-center justify-between font-sans">
                <div className="flex items-center gap-2">
                  <span>Orbit Analytics</span>
                  <button onClick={() => setIntegrationModal({ open: true, type: 'orbit' })} className="text-brand hover:text-brand-dark">
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-red-500 font-semibold font-sans">Connected</span>
              </li>
              <li className="flex items-center justify-between font-sans">
                <div className="flex items-center gap-2">
                  <span>PowerBI Dashboards</span>
                  <button onClick={() => setIntegrationModal({ open: true, type: 'powerbi' })} className="text-brand hover:text-brand-dark">
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-red-500 font-semibold font-sans">Connected</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <IntegrationModal open={integrationModal.open} type={integrationModal.type} onClose={() => setIntegrationModal({ open: false, type: null })} />
    </div>
  );
} 