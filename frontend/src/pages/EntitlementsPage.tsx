import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface EntitlementsPageProps {
  mockData: any;
}

export function EntitlementsPage({ mockData }: EntitlementsPageProps) {
  const { entitlementsTableData, entitlementsByType } = mockData;
  const totalEntitlements = entitlementsTableData.reduce((sum: number, row: any) => sum + row.balance, 0);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-brand-dark">Employee Entitlements</h1>
      <p className="text-brand-light mb-6 text-lg">Track employee leave, benefits, and entitlements</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="card">
          <div className="font-semibold text-brand-dark mb-2">Total Entitlements</div>
          <div className="text-2xl font-bold text-brand mb-1">{totalEntitlements.toLocaleString()} days</div>
          <div className="text-brand-light text-sm">Across {entitlementsTableData.length} employees</div>
        </div>
        <div className="card col-span-2">
          <div className="font-semibold text-brand-dark mb-2">Entitlements by Type</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={entitlementsByType}>
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#10b981" name="Total Days" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card mb-10 overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
        <div className="font-semibold text-lg text-brand-dark mb-4">Employee Entitlements</div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-brand-heading border-b border-gray-200 bg-gray-50">
              <th className="py-2 px-4 font-semibold">Employee</th>
              <th className="py-2 px-4 font-semibold">Type</th>
              <th className="py-2 px-4 font-semibold">Balance</th>
              <th className="py-2 px-4 font-semibold">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {entitlementsTableData.map((row: any, i: number) => (
              <tr key={row.employee + row.type} className={
                `${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors border-b border-gray-100`
              }>
                <td className="py-2 px-4 font-medium text-brand-heading align-middle">{row.employee}</td>
                <td className="py-2 px-4 align-middle">{row.type}</td>
                <td className="py-2 px-4 align-middle">{row.balance}</td>
                <td className="py-2 px-4 align-middle">{row.lastUpdated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 