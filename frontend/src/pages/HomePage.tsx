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

// Simplified card styling - removed gradients for cleaner design
const cardStyles = [
  { backgroundColor: "#ffffff", borderColor: "#e5e7eb" },
  { backgroundColor: "#f9fafb", borderColor: "#d1d5db" },
  { backgroundColor: "#ffffff", borderColor: "#e5e7eb" },
  { backgroundColor: "#f9fafb", borderColor: "#d1d5db" },
];

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
            <button className="px-4 py-1.5 rounded-full font-semibold text-base border transition bg-black text-white shadow">
              Verita AI
            </button>
            <button
              className="px-4 py-1.5 rounded-full font-semibold text-base border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition"
              onClick={() => navigate("/workflow/templates")}
            >
              Explore Templates
            </button>
            <button
              className="px-4 py-1.5 rounded-full font-semibold text-base border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition"
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
                className="w-full px-5 py-3 border border-gray-300 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-black text-base"
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white rounded-full p-2 hover:bg-gray-800 transition"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          {quickAccessItems.map((item, idx) => (
            <Link
              key={item.name}
              to={item.href}
              style={cardStyles[idx % cardStyles.length]}
              className="quick-access-card relative z-10 flex flex-col items-center justify-between w-[260px] h-[340px] rounded-xl p-8 border shadow-sm overflow-hidden transition-all duration-200 group hover:shadow-md hover:border-brand-primary"
            >
              <div className="flex flex-col items-center mb-4">
                <item.icon className="w-8 h-8 text-brand-primary mb-2" />
                <h3 className="text-xl font-semibold text-brand-heading text-center group-hover:text-brand-primary transition-colors">
                  {item.name}
                </h3>
              </div>
              <p className="text-sm text-brand-muted mb-4 text-center flex-grow">
                {item.description}
              </p>
              <div className="inline-flex items-center text-sm text-brand-primary font-medium mt-auto">
                <span>Get Started</span>
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
