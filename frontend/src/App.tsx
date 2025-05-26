import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import './App.css';

import {Layout} from './components/Layout';
import { HomeIcon, TableCellsIcon, CogIcon, UserGroupIcon, DocumentChartBarIcon, BuildingOfficeIcon, ArrowTrendingUpIcon, PresentationChartLineIcon, CircleStackIcon, BoltIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

// Mock data for sub-navigation items
import mockData from './data/mockData.json';

// Page Components
import { AccountsPayablePage } from './pages/AccountsPayablePage';
import { AccountsReceivablePage } from './pages/AccountsReceivablePage';
import { PayrollPage } from './pages/PayrollPage';
import { EntitlementsPage } from './pages/EntitlementsPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import ManageIntegrationsPage from './pages/ManageIntegrationsPage';
import ManageConnectionsPage from './pages/ManageConnectionsPage';
import { AOPPage } from './pages/AOPPage';
import AOPRunPage from './pages/AOPRunPage';
import { AOPBuilderPage } from './pages/AOPBuilderPage';
import { OracleOnPremPage } from './pages/OracleOnPremPage';
import { OrbitAnalyticsPage } from './pages/OrbitAnalyticsPage';
import { PowerBIDashboardsPage } from './pages/PowerBIDashboardsPage';
import AgentsPage from './pages/AgentsPage';
import { HomePage } from './pages/HomePage';

function PlaceholderPage({ title }: { title: string }) {
  return <div className="p-8"><h1 className="text-3xl font-bold text-gray-800">{title}</h1></div>;
}

const navItems = [
  {
    name: 'AOPS', 
    icon: BoltIcon, 
    subItems: [
      { name: 'AOPS Builder', href: '/aop' }, 
      { name: 'Run History', href: '/aop/run' },
      { name: 'Saved Agents', href: '/agents' },
    ],
  },
];

export function App() {
  const location = useLocation();

  return (
    <Layout>
  
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/accounts-payable" element={<AccountsPayablePage mockData={mockData} />} />
        <Route path="/accounts-receivable" element={<AccountsReceivablePage mockData={mockData} />} />
        <Route path="/payroll" element={<PayrollPage mockData={mockData} />} />
        <Route path="/entitlements" element={<EntitlementsPage mockData={mockData} />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/integrations/manage" element={<ManageIntegrationsPage />} />
        <Route path="/connections/manage" element={<ManageConnectionsPage />} />
        <Route path="/aop" element={<AOPPage />} />
        <Route path="/aop/run" element={<AOPRunPage />} />
        <Route path="/aop/builder" element={<AOPBuilderPage />} />
        <Route path="/data-sources/oracle-on-prem" element={<OracleOnPremPage />} />
        <Route path="/data-sources/orbit-analytics" element={<OrbitAnalyticsPage />} />
        <Route path="/data-sources/powerbi-dashboards" element={<PowerBIDashboardsPage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}