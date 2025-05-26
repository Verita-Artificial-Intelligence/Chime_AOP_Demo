import React from 'react';

interface IntegrationModalProps {
  open: boolean;
  type: 'orbit' | 'powerbi' | 'oracle' | null;
  onClose: () => void;
}

interface IntegrationData {
  name: string;
  status: string;
  lastSync: string;
  chart: { label: string; value: number }[];
  description: string;
}

const integrationMockData: Record<string, IntegrationData> = {
  powerbi: {
    name: 'PowerBI Dashboards',
    status: 'Connected',
    lastSync: '2024-06-01 14:23',
    chart: [
      { label: 'Q1', value: 120 },
      { label: 'Q2', value: 150 },
      { label: 'Q3', value: 170 },
      { label: 'Q4', value: 140 },
    ],
    description: 'Business performance metrics from PowerBI.'
  },
  orbit: {
    name: 'Orbit Analytics',
    status: 'Connected',
    lastSync: '2024-06-01 13:45',
    chart: [
      { label: 'Jan', value: 80 },
      { label: 'Feb', value: 95 },
      { label: 'Mar', value: 110 },
      { label: 'Apr', value: 105 },
    ],
    description: 'Vendor invoice and payment analytics from Orbit.'
  }
};

export function IntegrationModal({ open, onClose, type }: IntegrationModalProps) {
  if (!open || !type) return null;
  const data = integrationMockData[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl">×</button>
        <h2 className="text-2xl font-bold mb-2 text-gray-900">{data.name}</h2>
        <div className="mb-2 text-sm text-gray-500">{data.description}</div>
        <div className="mb-4 flex items-center gap-4">
          <span className="font-semibold">Status:</span>
          <span className="text-red-600 font-bold">{data.status}</span>
          <span className="ml-auto text-xs text-gray-400">Last Sync: {data.lastSync}</span>
        </div>
        <div className="mb-4">
          <div className="font-semibold mb-1 text-gray-700">Sample Data</div>
          <div className="w-full h-32 flex items-end gap-2">
            {data.chart.map((d) => (
              <div key={d.label} className="flex flex-col items-center w-1/4">
                <div style={{ height: `${d.value}px` }} className="w-6 bg-blue-500 rounded-t"></div>
                <span className="text-xs mt-1 text-gray-600">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Close</button>
        </div>
      </div>
    </div>
  );
} 