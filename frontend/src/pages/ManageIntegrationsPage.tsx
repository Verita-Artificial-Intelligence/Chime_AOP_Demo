// ManageIntegrationsPage: Allows adding/removing integrations using localStorage and mock data
import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';

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

const ALL_INTEGRATIONS: Integration[] = [
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
  },
  {
    id: 'excel',
    name: 'Excel',
    description: 'Microsoft Excel data source for importing and analyzing spreadsheets',
    status: 'Connected',
    lastSync: '2024-03-21 14:00',
    healthScore: 90,
    metrics: [
      { label: 'Imported Sheets', value: 12, change: 9.1 },
      { label: 'Rows Processed', value: 15000, change: 12.5 },
      { label: 'Sync Time (ms)', value: 200, change: -10.0 }
    ]
  }
];

const LOCAL_STORAGE_KEY = 'integrations';

function getStoredIntegrations(): Integration[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) return ALL_INTEGRATIONS;
  try {
    return JSON.parse(data);
  } catch {
    return ALL_INTEGRATIONS;
  }
}

function setStoredIntegrations(integrations: Integration[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(integrations));
}

export default function ManageIntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string>('');

  useEffect(() => {
    setIntegrations(getStoredIntegrations());
  }, []);

  const handleRemove = (id: string) => {
    const updated = integrations.filter(i => i.id !== id);
    setIntegrations(updated);
    setStoredIntegrations(updated);
  };

  const handleAdd = () => {
    if (!selectedIntegrationId) return;
    const toAdd = ALL_INTEGRATIONS.find(i => i.id === selectedIntegrationId);
    if (!toAdd || integrations.some(i => i.id === toAdd.id)) return;
    const updated = [...integrations, toAdd];
    setIntegrations(updated);
    setStoredIntegrations(updated);
    setModalOpen(false);
    setSelectedIntegrationId('');
  };

  const availableToAdd = ALL_INTEGRATIONS.filter(i => !integrations.some(j => j.id === i.id));

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Manage Integrations</h1>
      <button
        className="mb-6 px-4 py-2 bg-brand text-white rounded hover:bg-brand-dark transition"
        onClick={() => setModalOpen(true)}
        disabled={availableToAdd.length === 0}
      >
        Add Integration
      </button>
      <div className="space-y-4">
        {integrations.length === 0 && <div className="text-gray-500">No integrations added.</div>}
        {integrations.map(integration => (
          <div key={integration.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold text-lg">{integration.name}</div>
              <div className="text-gray-500 text-sm">{integration.description}</div>
            </div>
            <button
              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
              onClick={() => handleRemove(integration.id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Integration">
        <div className="mb-4">
          <label className="block mb-2 font-medium">Select Integration</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedIntegrationId}
            onChange={e => setSelectedIntegrationId(e.target.value)}
          >
            <option value="">-- Select --</option>
            {availableToAdd.map(i => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end">
          <button
            className="px-4 py-2 bg-brand text-white rounded hover:bg-brand-dark transition disabled:opacity-50"
            onClick={handleAdd}
            disabled={!selectedIntegrationId}
          >
            Add
          </button>
        </div>
      </Modal>
    </div>
  );
} 