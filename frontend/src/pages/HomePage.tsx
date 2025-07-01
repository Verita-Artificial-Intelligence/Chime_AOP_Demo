import React from "react";
import { Link } from "react-router-dom";
import {
  TableCellsIcon,
  ArrowRightIcon,
  DocumentArrowUpIcon,
  PlayCircleIcon,
  ClockIcon,
  ChatBubbleBottomCenterTextIcon,
  ChevronRightIcon,
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
    <div className="max-w-7xl mx-auto">
      <div className="bg-brand-card p-8 rounded-xl border border-brand-border mb-10 shadow-sm">
        <h1 className="text-4xl font-bold text-brand-heading mb-3">
          {content.welcomeMessage}
        </h1>
        <p className="text-lg text-brand-text">
          Streamline your operations with powerful automation tools. Build,
          manage, and monitor your automated workflows here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickAccessItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="block p-6 bg-brand-card rounded-xl transition-all duration-200 group border border-brand-border hover:border-brand-primary hover:shadow-lg"
          >
            <div className="flex items-start">
              <item.icon className="w-8 h-8 text-brand-primary mr-4 flex-shrink-0" />
              <div className="flex-grow">
                <h3 className="text-xl font-semibold text-brand-heading group-hover:text-brand-primary transition-colors">
                  {item.name}
                </h3>
                <p className="text-sm text-brand-muted mb-4">
                  {item.description}
                </p>
                <div className="inline-flex items-center text-sm text-brand-primary font-medium">
                  <span>Get Started</span>
                  <ChevronRightIcon className="h-4 w-4 ml-1" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
