import React from "react";
import { Link } from "react-router-dom";
import {
  BoltIcon,
  TableCellsIcon,
  CircleStackIcon,
  CpuChipIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const quickAccessItems = [
  {
    name: "Build an AOP (Legacy)",
    href: "/aop",
    description: "Manually configure a new Automated Operation Procedure.",
    icon: BoltIcon,
  },
  {
    name: "AOP Chat Builder",
    href: "/aop/builder",
    description: "Use a chat interface to guide you through building an AOP.",
    icon: BoltIcon, // Consider a different icon if you have one for chat/AI
  },
  {
    name: "View Run History",
    href: "/aop/run",
    description: "Check the status and history of your AOP executions.",
    icon: CircleStackIcon,
  },
  {
    name: "Manage Saved Agents",
    href: "/agents",
    description: "View and manage your saved AOP configurations.",
    icon: CpuChipIcon,
  },
  {
    name: "Explore Integrations",
    href: "/integrations",
    description:
      "Browse and manage connections to various data sources and services.",
    icon: CircleStackIcon,
  },
];

export function HomePage() {
  return (
    <div className="p-6 md:p-8">
      <div className="bg-brand-card p-8 rounded-xl border border-brand-border mb-8">
        <h1 className="text-4xl font-bold text-brand-dark mb-3">
          Welcome to the Chime AOPS Platform
        </h1>
        <p className="text-lg text-brand-dark mb-6">
          Streamline your operations with powerful automation tools. Build,
          manage, and monitor your Automated Operation Procedures (AOPs) all in
          one place.
        </p>
        <p className="text-brand-muted">
          Use the sidebar to navigate or select one of the quick access options
          below to get started.
        </p>
      </div>

      <h2 className="text-2xl font-semibold text-brand-dark mb-6">
        Quick Access
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickAccessItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="block p-6 bg-brand-card rounded-lg transition-all duration-200 group border border-brand-border hover:bg-brand-light hover:border-brand-primary"
          >
            <div className="flex items-center mb-3">
              <item.icon className="w-8 h-8 text-brand-primary mr-4 flex-shrink-0" />
              <h3 className="text-xl font-semibold text-brand-dark group-hover:text-brand-primary">
                {item.name}
              </h3>
            </div>
            <p className="text-sm text-brand-muted mb-4">{item.description}</p>
            <div className="flex items-center text-sm text-brand-dark group-hover:text-brand-primary group-hover:underline">
              Go to {item.name}
              <ArrowRightIcon className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
