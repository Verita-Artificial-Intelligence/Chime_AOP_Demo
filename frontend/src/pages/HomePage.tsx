import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TableCellsIcon,
  DocumentArrowUpIcon,
  PlayCircleIcon,
  ClockIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import content from "../config/content";
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
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Optionally, you can filter quickAccessItems based on searchQuery here

  return (
    <div className="dashboard-gradient-bg min-h-screen flex flex-col items-center">
      <div className="w-full max-w-6xl mx-auto mt-10 flex flex-col items-center">
        <div className="text-center w-full mb-8">
          <div className="text-gray-400 text-lg font-bold tracking-widest mb-2 uppercase">
            {/* Use content.clientName or a dynamic username if available */}
            GOOD MORNING, {content.clientName.toUpperCase()}
          </div>
          <h1 className="text-5xl font-extrabold text-black mb-4">
            {/* Use content.welcomeMessage or a static string */}
            What will you build today?
          </h1>
          <div className="flex justify-center gap-2 mb-6">
            <button className="px-6 py-2 rounded-md font-medium text-sm bg-gray-900 text-white hover:bg-gray-800 transition">
              Verita AI
            </button>
            <button
              className="px-6 py-2 rounded-md font-medium text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition"
              onClick={() => navigate("/workflow/templates")}
            >
              Explore Templates
            </button>
            <button
              className="px-6 py-2 rounded-md font-medium text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition"
              onClick={() => navigate("/workflow/active-runs")}
            >
              Your Workflows
            </button>
          </div>
          <div className="flex justify-center w-full mb-2">
            <div className="relative w-full max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search for files, plugins, and creators"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 text-base"
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white rounded-full p-2 hover:bg-gray-800 transition"
                onClick={() => alert(`Search for: ${searchQuery}`)}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 10.5a7.5 7.5 0 0013.65 6.15z"
                  />
                </svg>
              </button>
            </div>
          </div>
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
