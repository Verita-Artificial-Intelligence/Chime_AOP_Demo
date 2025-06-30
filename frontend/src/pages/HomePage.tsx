import React from "react";
import { Link } from "react-router-dom";
import {
  TableCellsIcon,
  ArrowRightIcon,
  DocumentArrowUpIcon,
  PlayCircleIcon,
  ClockIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";
import content from "../config/content";

const quickAccessItems = [
  {
    name: "Workflow Templates",
    href: "/workflow/templates",
    description: "Browse pre-built automation templates for common workflows.",
    icon: TableCellsIcon,
  },
  {
    name: "Workflow Chat",
    href: "/workflow/builder",
    description:
      "Use a chat interface to guide you through building a workflow.",
    icon: ChatBubbleBottomCenterTextIcon,
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
    <div className="p-6 md:p-8">
      <div className="bg-brand-card p-8 rounded-xl border border-brand-border mb-8">
        <h1 className="text-4xl font-bold text-brand-dark mb-3">
          {content.welcomeMessage}
        </h1>
        <p className="text-lg text-brand-dark">
          Streamline your operations with powerful automation tools. Build,
          manage, and monitor your automated workflows here.
        </p>
      </div>

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
