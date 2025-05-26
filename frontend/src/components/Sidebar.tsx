import React, { useState } from 'react';
import {
  HomeIcon,
  CreditCardIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  CubeIcon,
  UserIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChartBarIcon,
  Squares2X2Icon,
  EllipsisHorizontalIcon,
  ClockIcon,
  BoltIcon,
  CircleStackIcon,
  PresentationChartLineIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';

const nav = [
  {
    section: 'Back Office',
    items: [
      { name: 'Budget', route: '/budget', icon: HomeIcon },
      { name: 'Accounts Payable', route: '/accounts-payable', icon: CreditCardIcon },
      { name: 'Accounts Receivable', route: '/accounts-receivable', icon: CreditCardIcon },
      { name: 'Payroll', route: '/payroll', icon: UserGroupIcon },
      { name: 'Entitlements', route: '/entitlements', icon: Cog6ToothIcon },
    ],
  },
  {
    section: 'Integrations',
    items: [
      { name: 'Overview', route: '/integrations', icon: LinkIcon },
      { name: 'Oracle On-Prem', route: '/oracle-on-prem', icon: CircleStackIcon },
      { name: 'Orbit Analytics', route: '/orbit-analytics', icon: ChartBarIcon },
      { name: 'PowerBI Dashboards', route: '/powerbi-dashboards', icon: PresentationChartLineIcon },
      { name: 'Manage Connections', route: '/manage-connections', icon: LinkIcon },
    ],
  },
  {
    section: 'AI Agent',
    items: [
      { name: 'Agents', route: '/agents', icon: BoltIcon },
      { name: 'Agent Builder', route: '/ai-agent', icon: BoltIcon },
    ],
  },
];

const Sidebar = () => {
  const [productsOpen, setProductsOpen] = useState(false);
  const location = useLocation();
  return (
    <div>
    <aside className="w-56 fixed h-screen bg-brand-sidebar border-r border-brand-sidebarBorder flex flex-col font-sans">
      {/* Top Brand/Account Section */}
      <div className="flex items-center gap-2 h-14 px-4 border-b border-brand-sidebarBorder">
        <div className="w-7 h-7 bg-brand-primary/10 rounded flex items-center justify-center">
          <HomeIcon className="w-5 h-5 text-brand-primary" />
        </div>
        <span className="font-semibold text-brand-heading text-sm tracking-tight">Woodside Capital Partners</span>
      </div>
      {/* Main Navigation */}
      <nav className="flex-1 px-2 py-2 min-h-0">
        {nav.map((section, idx) => (
          <div key={section.section} className={idx > 0 ? 'mt-6' : ''}>
            <h2 className="px-3 text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">
              {section.section}
            </h2>
            <ul className="space-y-0.5">
              {section.items.map(item => {
                const isActive = location.pathname === item.route;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.route}
                      className={`group flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                        ${isActive
                          ? 'text-brand-primary'
                          : 'text-brand-muted hover:text-brand-heading'}
                      `}
                      style={{ background: 'none' }}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 transition-colors
                          ${isActive
                            ? 'text-brand-primary'
                            : 'text-brand-muted group-hover:text-brand-heading'}
                        `}
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-brand-sidebarBorder">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-brand-primary/10 rounded-full flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-brand-primary" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-brand-heading">John Doe</p>
            <p className="text-xs text-brand-muted">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
    <div className='w-56  h-screen'></div>

    </div>

  );
};

export default Sidebar; 