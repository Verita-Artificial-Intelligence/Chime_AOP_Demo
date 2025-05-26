import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, TableCellsIcon, BoltIcon, CircleStackIcon, CpuChipIcon, CogIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

interface NavItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  subItems?: NavSubItem[];
}

interface NavSubItem {
  name: string;
  href: string;
  dataKey?: string; // Optional: for specific data loading if needed
}

const navItems: NavItem[] = [
  { name: 'Home', href: '/', icon: HomeIcon }, 
  {
    name: 'AOPS', 
    icon: BoltIcon, 
    subItems: [
      { name: 'AOPS Builder Agent', href: '/aop/builder' },
      { name: 'Run History', href: '/aop/run' },
      { name: 'Saved Agents', href: '/agents' },
    ],
  },
  {
    name: 'Integrations',
    icon: CircleStackIcon, // Changed from CogIcon to avoid repetition, CircleStack is more data/integration like
    subItems: [
      { name: 'Browse Integrations', href: '/integrations' },
      { name: 'Manage Integrations', href: '/integrations/manage' }, 
      { name: 'Manage Connections', href: '/connections/manage' }, 
    ],
  },
  {
    name: 'Data Sources',
    icon: CpuChipIcon,
    subItems: [
      { name: 'Oracle On-Prem', href: '/data-sources/oracle-on-prem' },
      { name: 'Orbit Analytics', href: '/data-sources/orbit-analytics' },
      { name: 'PowerBI Dashboards', href: '/data-sources/powerbi-dashboards' },
    ],
  },
  // Example of a top-level settings link if needed, otherwise keep it under a sub-menu
  // { name: 'Platform Settings', href: '/settings', icon: CogIcon }, 
];

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Link to="/">
            <h1 className="text-2xl font-bold text-red-600 hover:text-red-700 transition-colors">Chime AOPS</h1> 
          </Link>
        </div>
        <nav className="mt-4 flex-grow overflow-y-auto">
          {navItems.map((item) => (
            <div key={item.name} className="px-2 mb-1">
              {item.subItems ? (
                <details 
                  className="group"
                  open={item.subItems.some(sub => location.pathname === sub.href || location.pathname.startsWith(sub.href + '/')) || item.subItems.some(sub => sub.href && location.pathname.includes(sub.href))}
                >
                  <summary 
                    className={`flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
                      item.subItems.some(sub => location.pathname === sub.href || location.pathname.startsWith(sub.href + '/')) ? 'bg-gray-100 text-red-600' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronDownIcon className="w-4 h-4 transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <ul className="pl-5 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.href}
                          className={`block px-4 py-2 text-sm rounded-md transition-colors hover:bg-red-50 hover:text-red-600 ${
                            location.pathname === subItem.href ? 'font-semibold text-red-600 bg-red-50' : 'text-gray-600'
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : (
                <Link
                  to={item.href!}
                  className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors hover:bg-gray-100 ${
                    location.pathname === item.href ? 'text-red-600 bg-gray-100 font-semibold' : 'text-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">© 2025 Chime AOPS</p>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}; 