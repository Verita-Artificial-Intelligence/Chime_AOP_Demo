import React from 'react';
import { Link } from 'react-router-dom';
import { BoltIcon, TableCellsIcon, CircleStackIcon, CpuChipIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const quickAccessItems = [
  {
    name: 'Build an AOP (Legacy)',
    href: '/aop',
    description: 'Manually configure a new Automated Operation Procedure.',
    icon: BoltIcon,
  },
  {
    name: 'AOP Chat Builder',
    href: '/aop/builder',
    description: 'Use a chat interface to guide you through building an AOP.',
    icon: BoltIcon, // Consider a different icon if you have one for chat/AI
  },
  {
    name: 'View Run History',
    href: '/aop/run',
    description: 'Check the status and history of your AOP executions.',
    icon: CircleStackIcon, 
  },
  {
    name: 'Manage Saved Agents',
    href: '/agents',
    description: 'View and manage your saved AOP configurations.',
    icon: CpuChipIcon, 
  },
  {
    name: 'Financial Operations',
    href: '/accounts-payable', // Or a general finance dashboard if you create one
    description: 'Access tools for accounts payable, receivable, and payroll.',
    icon: TableCellsIcon,
  },
  {
    name: 'Explore Integrations',
    href: '/integrations',
    description: 'Browse and manage connections to various data sources and services.',
    icon: CircleStackIcon, 
  },
];

export function HomePage() {
  return (
    <div className="p-6 md:p-8">
      <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
        <h1 className="text-4xl font-bold text-red-600 mb-3">Welcome to the Chime AOPS Platform!</h1>
        <p className="text-lg text-gray-700 mb-6">
          Streamline your operations with powerful automation tools. Build, manage, and monitor your Automated Operation Procedures (AOPs) all in one place.
        </p>
        <p className="text-gray-600">
          Use the sidebar to navigate or select one of the quick access options below to get started.
        </p>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Quick Access</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickAccessItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 group border border-gray-200 hover:border-red-500"
          >
            <div className="flex items-center mb-3">
              <item.icon className="w-8 h-8 text-red-500 mr-4 flex-shrink-0" />
              <h3 className="text-xl font-semibold text-gray-800 group-hover:text-red-600">{item.name}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">{item.description}</p>
            <div className="flex items-center text-sm text-red-600 group-hover:underline">
              Go to {item.name}
              <ArrowRightIcon className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 