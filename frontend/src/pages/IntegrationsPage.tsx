import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  logo: string;
  popular?: boolean;
}

const mockIntegrations: Integration[] = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Connect your Salesforce CRM to automate sales workflows and data synchronization.',
    category: 'CRM',
    logo: '🔷',
    popular: true,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Integrate with Slack for real-time notifications and team collaboration.',
    category: 'Communication',
    logo: '💬',
    popular: true,
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Sync issues and automate project management workflows with Jira.',
    category: 'Project Management',
    logo: '📋',
    popular: true,
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Connect GitHub repositories for automated code deployment and issue tracking.',
    category: 'Development',
    logo: '🐙',
    popular: true,
  },
  {
    id: 'aws',
    name: 'AWS',
    description: 'Integrate with Amazon Web Services for cloud infrastructure automation.',
    category: 'Cloud',
    logo: '☁️',
  },
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    description: 'Connect Google Workspace apps for document management and collaboration.',
    category: 'Productivity',
    logo: '📧',
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    description: 'Integrate with Microsoft 365 for Office apps and Teams collaboration.',
    category: 'Productivity',
    logo: '📊',
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    description: 'Automate customer support workflows with Zendesk integration.',
    category: 'Support',
    logo: '🎧',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Process payments and manage subscriptions with Stripe integration.',
    category: 'Finance',
    logo: '💳',
  },
];

export const IntegrationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(mockIntegrations.map(i => i.category)))];

  const filteredIntegrations = mockIntegrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Integrations</h1>
        <p className="text-gray-600">Connect your favorite tools and services to automate workflows</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-brand-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map(integration => (
          <div
            key={integration.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{integration.logo}</div>
              {integration.popular && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  Popular
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{integration.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{integration.category}</span>
              <button className="text-sm font-medium text-brand-primary hover:text-brand-dark">
                Connect →
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No integrations found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}; 