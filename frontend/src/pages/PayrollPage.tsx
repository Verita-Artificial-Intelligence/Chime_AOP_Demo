import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface PayrollPageProps {
  mockData: any;
}

export function PayrollPage({ mockData }: PayrollPageProps) {
  const { payrollRuns, payrollByMonth } = mockData;
  const totalPayroll = payrollRuns.reduce((sum: number, run: any) => sum + run.amount, 0);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-brand-dark">Payroll</h1>
      <p className="text-brand-light mb-6 text-lg">Manage payroll cycles, employee payments, and compliance</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="card">
          <div className="font-semibold text-brand-dark mb-2">Total Payroll</div>
          <div className="text-2xl font-bold text-brand mb-1">${totalPayroll.toLocaleString()}</div>
          <div className="text-brand-light text-sm">Across {payrollRuns.length} payroll runs</div>
        </div>
        <div className="card col-span-2">
          <div className="font-semibold text-brand-dark mb-2">Payroll by Month</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={payrollByMonth}>
              <XAxis dataKey="month" />
              <YAxis tickFormatter={v => `$${(v/1e3).toFixed(0)}K`} />
              <Tooltip formatter={v => `$${v.toLocaleString()}`} />
              <Bar dataKey="amount" fill="#6366f1" name="Payroll" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card mb-10 overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
        <div className="font-semibold text-lg text-brand-dark mb-4">Recent Payroll Runs</div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-brand-dark border-b border-gray-200 bg-gray-50">
              <th className="py-2 px-4 font-semibold">Run ID</th>
              <th className="py-2 px-4 font-semibold">Date</th>
              <th className="py-2 px-4 font-semibold">Employees</th>
              <th className="py-2 px-4 font-semibold">Amount</th>
              <th className="py-2 px-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {payrollRuns.map((row: any, i: number) => (
              <tr key={row.id} className={
                `${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors border-b border-gray-100`
              }>
                <td className="py-2 px-4 font-medium text-brand-dark align-middle">{row.id}</td>
                <td className="py-2 px-4 align-middle">{row.date}</td>
                <td className="py-2 px-4 align-middle">{row.employees}</td>
                <td className="py-2 px-4 align-middle">${row.amount.toLocaleString()}</td>
                <td className="py-2 px-4 align-middle">
                  <span className={
                    row.status === 'Failed' ? 'text-red-500 font-semibold' :
                    row.status === 'Pending' ? 'text-yellow-500 font-semibold' :
                    'text-red-500 font-semibold'
                  }>{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 