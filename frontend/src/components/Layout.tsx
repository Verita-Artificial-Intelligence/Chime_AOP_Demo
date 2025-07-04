import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  BoltIcon,
  CircleStackIcon,
  CogIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import content from "../config/content";

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
  { name: "Home", href: "/", icon: HomeIcon },
  {
    name: content.platformName,
    icon: BoltIcon,
    subItems: [
      { name: "Workflow Templates", href: "/workflow/templates" },
      { name: "Upload SOP", href: "/workflow/sop-to-workflow" },
      { name: "Active Workflows", href: "/workflow/active-runs" },
      { name: "Workflow History", href: "/workflow/run" },
    ],
  },
  { name: "Integrations", href: "/integrations", icon: CircleStackIcon },
  { name: "Security", href: "/security", icon: CogIcon },
];

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-brand-background">
      <aside className="w-64 bg-brand-primaryLight border-r border-brand-sidebarBorder flex flex-col">
        <div className="p-4 border-b border-brand-sidebarBorder">
          <Link to="/">
            <h1 className="text-2xl font-bold text-gradient hover:opacity-80 transition-opacity">
              Verita AI
            </h1>
          </Link>
        </div>
        <nav className="mt-4 flex-grow overflow-y-auto">
          {navItems.map((item) => (
            <div key={item.name} className="px-2 mb-1">
              {item.subItems ? (
                <details
                  className="group"
                  open={
                    item.subItems.some(
                      (sub) =>
                        location.pathname === sub.href ||
                        location.pathname.startsWith(sub.href + "/")
                    ) ||
                    item.subItems.some(
                      (sub) => sub.href && location.pathname.includes(sub.href)
                    )
                  }
                >
                  <summary
                    className={`flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 rounded-md cursor-pointer hover:bg-white hover:text-brand-primary transition-all hover:shadow-sm ${
                      item.subItems.some(
                        (sub) =>
                          location.pathname === sub.href ||
                          location.pathname.startsWith(sub.href + "/")
                      )
                        ? "bg-white text-brand-primary shadow-sm"
                        : ""
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
                          className={`block px-4 py-2 text-sm rounded-md transition-all hover:bg-white hover:text-brand-primary hover:shadow-sm ${
                            location.pathname === subItem.href
                              ? "font-semibold text-brand-primary bg-white shadow-sm"
                              : "text-gray-700"
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
                  className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all hover:bg-white hover:text-brand-primary hover:shadow-sm ${
                    location.pathname === item.href
                      ? "text-brand-primary bg-white font-semibold shadow-sm"
                      : "text-gray-700"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
        <div className="mt-auto">
          <div className="p-4 border-t border-brand-sidebarBorder">
            <button className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 rounded-md hover:bg-white hover:text-brand-primary hover:shadow-sm transition-all mb-2">
              <CogIcon className="w-5 h-5 mr-3" />
              Settings
            </button>
            <button className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 rounded-md hover:bg-white hover:text-brand-primary hover:shadow-sm transition-all">
              <UserCircleIcon className="w-5 h-5 mr-3" />
              Account
            </button>
          </div>
          <div className="p-4 border-t border-brand-sidebarBorder">
            <p className="text-xs text-brand-muted">{content.footerText}</p>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden overflow-y-auto dashboard-gradient-bg flex items-center justify-center">
        {children}
      </main>
    </div>
  );
};
