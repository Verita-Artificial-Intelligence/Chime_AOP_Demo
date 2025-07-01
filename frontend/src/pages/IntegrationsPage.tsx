import React, { useState } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  logoUrl: string;
  connected?: boolean;
}

const mockIntegrations: Integration[] = [
  {
    id: "salesforce",
    name: "Salesforce",
    description:
      "Connect your Salesforce CRM to automate sales workflows and data synchronization.",
    category: "CRM",
    logoUrl:
      "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/salesforce.svg",
    connected: false,
  },
  {
    id: "slack",
    name: "Slack",
    description:
      "Integrate with Slack for real-time notifications and team collaboration.",
    category: "Communication",
    logoUrl:
      "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/slack.svg",
    connected: true,
  },
  {
    id: "jira",
    name: "Jira",
    description:
      "Sync issues and automate project management workflows with Jira.",
    category: "Project Management",
    logoUrl:
      "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/jira.svg",
    connected: false,
  },
  {
    id: "google-workspace",
    name: "Google Workspace",
    description:
      "Connect Google Workspace apps for document management and collaboration.",
    category: "Productivity",
    logoUrl:
      "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/google.svg",
    connected: true,
  },
  {
    id: "microsoft-365",
    name: "Microsoft 365",
    description:
      "Integrate with Microsoft 365 for Office apps and Teams collaboration.",
    category: "Productivity",
    logoUrl:
      "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/microsoft.svg",
    connected: false,
  },
  {
    id: "zendesk",
    name: "Zendesk",
    description:
      "Automate customer support workflows with Zendesk integration.",
    category: "Support",
    logoUrl:
      "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/zendesk.svg",
    connected: false,
  },
  {
    id: "stripe",
    name: "Stripe",
    description:
      "Process payments and manage subscriptions with Stripe integration.",
    category: "Finance",
    logoUrl:
      "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/stripe.svg",
    connected: false,
  },
  {
    id: "github",
    name: "GitHub",
    description: "Automate your development workflows with GitHub integration.",
    category: "Development",
    logoUrl:
      "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/github.svg",
    connected: false,
  },
  {
    id: "shopify",
    name: "Shopify",
    description: "Connect your Shopify store for e-commerce automation.",
    category: "E-commerce",
    logoUrl:
      "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/shopify.svg",
    connected: false,
  },
];

export const IntegrationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);
  const [showModal, setShowModal] = useState(false);

  const categories = [
    "All",
    ...Array.from(new Set(mockIntegrations.map((i) => i.category))),
  ];

  const filteredIntegrations = mockIntegrations.filter((integration) => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleConnectClick = (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedIntegration(null);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-brand-heading mb-2">
          Integrations
        </h1>
        <p className="text-brand-muted">
          Connect your favorite tools and services to automate workflows
        </p>
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
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-brand-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration) => (
          <div
            key={integration.id}
            className="bg-white rounded-xl border border-brand-border p-6 hover:shadow-lg hover:border-brand-primary transition-all duration-200 group relative"
          >
            {integration.connected && (
              <div className="absolute top-4 right-4">
                <div className="relative">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="black"
                      strokeWidth="2"
                      fill="black"
                    />
                    <path
                      d="M8 12l3 3 5-6"
                      stroke="#ADFF02"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-lg group-hover:bg-brand-primaryLight transition-colors">
                <img
                  src={integration.logoUrl}
                  alt={`${integration.name} logo`}
                  className="w-8 h-8 object-contain"
                  style={{ filter: "grayscale(100%)" }}
                  onLoad={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.filter = "none";
                  }}
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-brand-heading mb-2 group-hover:text-brand-primary transition-colors">
              {integration.name}
            </h3>

            <p className="text-sm text-brand-muted mb-4 line-clamp-3">
              {integration.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-brand-muted px-2 py-1 bg-gray-100 rounded-full">
                {integration.category}
              </span>
              <button
                onClick={() => handleConnectClick(integration)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  integration.connected
                    ? "bg-brand-success text-black hover:bg-brand-successDark"
                    : "bg-brand-primary text-white hover:bg-brand-primaryDark"
                }`}
              >
                {integration.connected ? "Connected" : "Connect"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-brand-muted">
            No integrations found matching your criteria.
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            <div className="flex items-center mb-4">
              <div className="w-12 h-12 flex items-center justify-center bg-brand-primaryLight rounded-lg mr-4">
                <img
                  src={selectedIntegration.logoUrl}
                  alt={`${selectedIntegration.name} logo`}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-brand-heading">
                  {selectedIntegration.connected ? "Manage" : "Connect to"}{" "}
                  {selectedIntegration.name}
                </h3>
                <p className="text-sm text-brand-muted">
                  {selectedIntegration.category}
                </p>
              </div>
            </div>

            <p className="text-brand-muted mb-6">
              {selectedIntegration.connected
                ? `You are currently connected to ${selectedIntegration.name}. Manage your integration settings below.`
                : `Connect your ${selectedIntegration.name} account to enable automation workflows.`}
            </p>

            <div className="space-y-3">
              {selectedIntegration.connected ? (
                <>
                  <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                    View Connection Details
                  </button>
                  <button className="w-full px-4 py-2 bg-brand-danger text-white rounded-md hover:bg-brand-dangerDark transition-colors">
                    Disconnect
                  </button>
                </>
              ) : (
                <>
                  <button className="w-full px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primaryDark transition-colors font-semibold">
                    Authorize Connection
                  </button>
                  <button
                    onClick={closeModal}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
