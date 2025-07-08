import React from "react";
import { Link } from "react-router-dom";
import {
  TableCellsIcon,
  DocumentArrowUpIcon,
  PlayCircleIcon,
  ClockIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import "../index.css";

// Clean white card style - no gradients needed

const quickAccessItems = [
  {
    name: "Workflow Templates",
    href: "/workflow/templates",
    description: "Browse pre-built automation templates for common workflows.",
    icon: TableCellsIcon,
  },
  {
    name: "Upload SOP",
    href: "/workflow/sop-to-workflow",
    description:
      "Convert your SOPs and screen recordings into automated workflows.",
    icon: DocumentArrowUpIcon,
  },
  {
    name: "Active Workflows",
    href: "/workflow/active-runs",
    description: "Check the status and history of your workflow executions.",
    icon: PlayCircleIcon,
  },
  {
    name: "Workflow History",
    href: "/workflow/run",
    description: "View and analyze past workflow runs and performance metrics.",
    icon: ClockIcon,
  },
];

export function HomePage() {
  return (
    <div className="dashboard-gradient-bg min-h-screen flex flex-col items-center">
      <div className="w-full max-w-6xl mx-auto mt-10 flex flex-col items-center">
        <div className="text-center w-full mb-8">
          <div className="text-gray-400 text-lg font-bold tracking-widest mb-2 uppercase">
            GOOD MORNING, NICHOLAS
          </div>
          <h1 className="text-5xl font-extrabold text-black mb-4">
            What will you build today?
          </h1>
        </div>
      </div>
      <div className="w-full max-w-6xl mx-auto mt-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickAccessItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="flex flex-col bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-start mb-4">
                <item.icon className="w-6 h-6 text-brand-iconGreen mr-3 flex-shrink-0" />
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {item.description}
                  </p>
                  <div className="inline-flex items-center text-sm text-gray-700 font-medium group-hover:text-gray-900">
                    <span>Go to {item.name}</span>
                    <ChevronRightIcon className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
