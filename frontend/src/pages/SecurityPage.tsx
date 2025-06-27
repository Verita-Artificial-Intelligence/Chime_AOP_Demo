import React, { useState } from 'react';
import { ShieldCheckIcon, KeyIcon, LockClosedIcon, UserGroupIcon, XMarkIcon, ClipboardIcon } from '@heroicons/react/24/outline';

export const SecurityPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<{title: string; content: React.ReactNode} | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const openModal = (title: string, content: React.ReactNode) => {
    setModalContent({ title, content });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalContent(null);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const generateNewAPIKey = () => {
    const newKey = `sk_prod_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const content = (
      <div className="space-y-4">
        <p className="text-gray-600">Your new API key has been generated:</p>
        <div className="bg-gray-50 p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <code className="text-sm font-mono">{newKey}</code>
            <button
              onClick={() => handleCopyKey(newKey)}
              className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors"
              title="Copy to clipboard"
            >
              <ClipboardIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        {copiedKey && <p className="text-green-600 text-sm">✓ Copied to clipboard!</p>}
        <p className="text-red-600 text-sm">⚠️ Save this key now. You won't be able to see it again.</p>
      </div>
    );
    openModal('New API Key Generated', content);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Security</h1>
        <p className="text-gray-600">Manage security settings and OAuth configurations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OAuth Providers */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <KeyIcon className="h-6 w-6 text-brand-primary mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">OAuth Providers</h2>
          </div>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:border-brand-primary transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img 
                    src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/google.svg" 
                    alt="Google logo"
                    className="w-6 h-6 mr-3"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">Google OAuth 2.0</h3>
                    <p className="text-sm text-gray-600">Enable Google sign-in for users</p>
                  </div>
                </div>
                <button 
                  onClick={() => openModal('Configure Google OAuth', (
                    <div className="space-y-4">
                      <p className="text-gray-600">Configure Google OAuth 2.0 integration for secure user authentication.</p>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Client ID</label>
                          <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" placeholder="Enter Google Client ID" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Client Secret</label>
                          <input type="password" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" placeholder="Enter Google Client Secret" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Redirect URI</label>
                          <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" value="https://your-app.com/auth/google/callback" readOnly />
                        </div>
                      </div>
                    </div>
                  ))}
                  className="px-4 py-2 bg-brand-primary text-brand-dark rounded-md hover:bg-brand-hover font-semibold transition-colors"
                >
                  Configure
                </button>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 hover:border-brand-primary transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img 
                    src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/microsoft.svg" 
                    alt="Microsoft logo"
                    className="w-6 h-6 mr-3"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">Microsoft Azure AD</h3>
                    <p className="text-sm text-gray-600">Enterprise authentication via Azure</p>
                  </div>
                </div>
                <button 
                  onClick={() => openModal('Configure Microsoft Azure AD', (
                    <div className="space-y-4">
                      <p className="text-gray-600">Configure Microsoft Azure AD integration for enterprise authentication.</p>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Application ID</label>
                          <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" placeholder="Enter Azure Application ID" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Tenant ID</label>
                          <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" placeholder="Enter Azure Tenant ID" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Client Secret</label>
                          <input type="password" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" placeholder="Enter Client Secret" />
                        </div>
                      </div>
                    </div>
                  ))}
                  className="px-4 py-2 bg-brand-primary text-brand-dark rounded-md hover:bg-brand-hover font-semibold transition-colors"
                >
                  Configure
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <ShieldCheckIcon className="h-6 w-6 text-brand-primary mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600">Require 2FA for all users</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h3 className="font-medium text-gray-900">Session Timeout</h3>
                <p className="text-sm text-gray-600">Auto-logout after inactivity</p>
              </div>
              <select className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>2 hours</option>
                <option>4 hours</option>
              </select>
            </div>
          </div>
        </div>

        {/* Access Control */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <UserGroupIcon className="h-6 w-6 text-brand-primary mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Access Control</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Admin Users</span>
              <span className="font-medium">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Standard Users</span>
              <span className="font-medium">24</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Read-Only Users</span>
              <span className="font-medium">15</span>
            </div>
            <button 
              onClick={() => openModal('User Role Management', (
                <div className="space-y-4">
                  <p className="text-gray-600">Manage user roles and permissions across the platform.</p>
                  <div className="space-y-3">
                    {[
                      { role: 'Admin', users: 3, permissions: 'Full access to all features' },
                      { role: 'Standard', users: 24, permissions: 'Create and manage workflows' },
                      { role: 'Read-Only', users: 15, permissions: 'View workflows and reports only' }
                    ].map(item => (
                      <div key={item.role} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{item.role}</h4>
                            <p className="text-sm text-gray-600">{item.permissions}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{item.users} users</p>
                            <button className="text-sm text-brand-primary hover:text-brand-dark">Edit</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full px-4 py-2 bg-brand-primary text-brand-dark rounded-md hover:bg-brand-hover font-semibold">
                    Add New Role
                  </button>
                </div>
              ))}
              className="w-full mt-4 px-4 py-2 border border-brand-primary text-brand-primary rounded-md hover:bg-brand-light transition-colors"
            >
              Manage Roles
            </button>
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <LockClosedIcon className="h-6 w-6 text-brand-primary mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">API Keys</h2>
          </div>
          <div className="space-y-3">
            <div className="border border-gray-200 rounded-lg p-3 hover:border-brand-primary transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Production API Key</p>
                  <p className="text-sm text-gray-600">sk_prod_****4a2f</p>
                  <p className="text-xs text-gray-500">Created: Nov 15, 2024</p>
                </div>
                <button 
                  onClick={() => openModal('Revoke API Key', (
                    <div className="space-y-4">
                      <p className="text-gray-600">Are you sure you want to revoke this API key?</p>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-800 text-sm">⚠️ This action cannot be undone. Any applications using this key will lose access immediately.</p>
                      </div>
                      <div className="flex space-x-3">
                        <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold">
                          Revoke Key
                        </button>
                        <button 
                          onClick={closeModal}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                  className="text-sm text-red-600 hover:text-red-700 transition-colors"
                >
                  Revoke
                </button>
              </div>
            </div>
            <button 
              onClick={generateNewAPIKey}
              className="w-full px-4 py-2 bg-brand-primary text-brand-dark rounded-md hover:bg-brand-hover font-semibold transition-colors"
            >
              Generate New API Key
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && modalContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pr-8">
              {modalContent.title}
            </h3>
            
            <div className="mb-6">
              {modalContent.content}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {modalContent.title !== 'New API Key Generated' && modalContent.title !== 'Revoke API Key' && (
                <button className="px-4 py-2 bg-brand-primary text-brand-dark rounded-md hover:bg-brand-hover font-semibold transition-colors">
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 