import React, { useState } from 'react';

interface Connection {
  id: string;
  name: string;
  status: 'Connected' | 'Disconnected';
  endpoint: string;
  lastConnected: string;
  username: string;
}

const mockConnections: Connection[] = [
  {
    id: 'oracle-on-prem',
    name: 'Oracle On-Prem',
    status: 'Connected',
    endpoint: 'https://oracle.example.com/api',
    lastConnected: '2024-06-01 15:30',
    username: 'oracle_admin',
  },
  {
    id: 'orbit-analytics',
    name: 'Orbit Analytics',
    status: 'Disconnected',
    endpoint: 'https://orbit.example.com/api',
    lastConnected: '2024-05-30 12:10',
    username: 'orbit_user',
  },
  {
    id: 'powerbi-dashboards',
    name: 'PowerBI Dashboards',
    status: 'Connected',
    endpoint: 'https://powerbi.microsoft.com/api',
    lastConnected: '2024-06-01 14:45',
    username: 'powerbi_admin',
  },
];

export default function ManageConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>(mockConnections);
  const [editing, setEditing] = useState<null | Connection>(null);
  const [form, setForm] = useState<Partial<Connection>>({});
  const [saving, setSaving] = useState(false);

  const openEdit = (conn: Connection) => {
    setEditing(conn);
    setForm(conn);
  };

  const closeEdit = () => {
    setEditing(null);
    setForm({});
    setSaving(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setConnections(connections.map(c => c.id === editing?.id ? { ...c, ...form } as Connection : c));
      closeEdit();
    }, 800); // mock save delay
  };

  return (
    <div className="max-w-3xl mx-auto py-8 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-brand-dark">Manage Connections</h1>
      <div className="space-y-4">
        {connections.map(conn => (
          <div key={conn.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold text-lg text-brand-dark">{conn.name}</div>
              <div className="text-brand-light text-sm mb-1">Endpoint: {conn.endpoint}</div>
              <div className="text-brand-light text-sm mb-1">Username: {conn.username}</div>
              <div className="text-brand-light text-sm mb-1">Last Connected: {conn.lastConnected}</div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${conn.status === 'Connected' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{conn.status}</span>
            </div>
            <button
              className="btn-primary"
              onClick={() => openEdit(conn)}
            >
              Edit
            </button>
          </div>
        ))}
      </div>
      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative font-sans">
            <button type="button" onClick={closeEdit} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl">×</button>
            <h2 className="text-2xl font-bold mb-4 text-brand-dark">Edit Connection</h2>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-brand-dark">Endpoint</label>
              <input
                type="text"
                name="endpoint"
                value={form.endpoint || ''}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-brand-dark">Username</label>
              <input
                type="text"
                name="username"
                value={form.username || ''}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-brand-dark">Status</label>
              <select
                name="status"
                value={form.status || 'Connected'}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="Connected">Connected</option>
                <option value="Disconnected">Disconnected</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="btn-primary disabled:opacity-50"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 