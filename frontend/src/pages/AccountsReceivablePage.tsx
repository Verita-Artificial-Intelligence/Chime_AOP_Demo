import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface AccountsReceivablePageProps {
  mockData: any;
}

export function AccountsReceivablePage({ mockData }: AccountsReceivablePageProps) {
  const { receivablesTableData, receivablesByMonth } = mockData;
  const totalOutstanding = receivablesTableData.reduce((sum: number, row: any) => sum + row.amount, 0);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-brand-dark">Accounts Receivable</h1>
      <p className="text-brand-light mb-6 text-lg">Track incoming payments and customer invoices</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="card">
          <div className="font-semibold text-brand-dark mb-2">Outstanding Receivables</div>
          <div className="text-2xl font-bold text-brand mb-1">${totalOutstanding.toLocaleString()}</div>
          <div className="text-brand-light text-sm">Across {receivablesTableData.length} customer invoices</div>
        </div>
        <div className="card col-span-2">
          <div className="font-semibold text-brand-dark mb-2">Receivables by Due Month</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={receivablesByMonth}>
              <XAxis dataKey="month" />
              <YAxis tickFormatter={v => `$${(v/1e3).toFixed(0)}K`} />
              <Tooltip formatter={v => `$${v.toLocaleString()}`} />
              <Bar dataKey="amount" fill="#10b981" name="Amount Due" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card mb-10 overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
        <div className="font-semibold text-lg text-brand-dark mb-4">Customer Invoices</div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-brand-dark border-b border-gray-200 bg-gray-50">
              <th className="py-2 px-4 font-semibold">Customer</th>
              <th className="py-2 px-4 font-semibold">Invoice #</th>
              <th className="py-2 px-4 font-semibold">Amount</th>
              <th className="py-2 px-4 font-semibold">Due Date</th>
              <th className="py-2 px-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {receivablesTableData.map((row: any, i: number) => (
              <tr key={row.invoice} className={
                `${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors border-b border-gray-100`
              }>
                <td className="py-2 px-4 font-medium text-brand-dark align-middle">{row.customer}</td>
                <td className="py-2 px-4 align-middle">{row.invoice}</td>
                <td className="py-2 px-4 align-middle">${row.amount.toLocaleString()}</td>
                <td className="py-2 px-4 align-middle">{row.dueDate}</td>
                <td className="py-2 px-4 align-middle">
                  <span className={
                    row.status === 'Overdue' ? 'text-red-500 font-semibold' :
                    row.status === 'Due Soon' ? 'text-yellow-500 font-semibold' :
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