import React from 'react';
import { ShieldCheckIcon, KeyIcon, LockClosedIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export const SecurityPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Security & OAuth</h1>
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
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Google OAuth 2.0</h3>
                  <p className="text-sm text-gray-600">Enable Google sign-in for users</p>
                </div>
                <button className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-dark">
                  Configure
                </button>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Microsoft Azure AD</h3>
                  <p className="text-sm text-gray-600">Enterprise authentication via Azure</p>
                </div>
                <button className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-dark">
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
              <select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
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
            <button className="w-full mt-4 px-4 py-2 border border-brand-primary text-brand-primary rounded-md hover:bg-brand-light">
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
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Production API Key</p>
                  <p className="text-sm text-gray-600">sk_prod_****4a2f</p>
                </div>
                <button className="text-sm text-red-600 hover:text-red-700">Revoke</button>
              </div>
            </div>
            <button className="w-full px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-dark">
              Generate New API Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 