import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  BoltIcon,
  CircleStackIcon,
  CogIcon,
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
      { name: "AOP Builder", href: "/aop/builder" },
      { name: "AOP Templates", href: "/aop/templates" },
      { name: "AOP Run History", href: "/aop/run" },
      { name: "Active Runs", href: "/aop/active-runs" },
      { name: "SOP to AOP", href: "/aop/sop-to-aop" },
    ],
  },
  { name: "Integrations", href: "/integrations", icon: CircleStackIcon },
  { name: "Security & OAuth", href: "/security", icon: CogIcon },
];

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-brand-background">
      <aside className="w-64 bg-brand-sidebar border-r border-brand-sidebarBorder flex flex-col">
        <div className="p-4 border-b border-brand-sidebarBorder">
          <Link to="/">
            <h1 className="text-2xl font-bold text-brand-dark hover:text-brand-primary transition-colors">
              {content.clientName} {content.platformName}
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
                    className={`flex items-center justify-between px-4 py-2.5 text-sm font-medium text-brand-dark rounded-md cursor-pointer hover:bg-brand-light transition-colors ${
                      item.subItems.some(
                        (sub) =>
                          location.pathname === sub.href ||
                          location.pathname.startsWith(sub.href + "/")
                      )
                        ? "bg-brand-light text-brand-primary"
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
                          className={`block px-4 py-2 text-sm rounded-md transition-colors hover:bg-brand-light hover:text-brand-primary ${
                            location.pathname === subItem.href
                              ? "font-semibold text-brand-primary bg-brand-light"
                              : "text-brand-dark"
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
                  className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors hover:bg-brand-light ${
                    location.pathname === item.href
                      ? "text-brand-primary bg-brand-light font-semibold"
                      : "text-brand-dark"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-brand-sidebarBorder">
          <p className="text-xs text-brand-muted opacity-70">
            {content.footerText}
          </p>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-card p-6 md:p-8">
        {children}
      </main>
    </div>
  );
};
