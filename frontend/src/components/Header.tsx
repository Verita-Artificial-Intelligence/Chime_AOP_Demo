import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const nav = [
  { name: 'Dashboard', route: '/budget' },
  { name: 'Integrations', route: '/integrations' },
  { name: 'AI Agent', route: '/ai-agent' },
];

const Header = () => {
  const location = useLocation();
  return (
    <header className="w-full border-b border-brand-border px-layout h-14 flex flex-col md:flex-row items-start md:items-center justify-between bg-transparent">
      <div className="flex items-center gap-4 mb-4 md:mb-0">
        <span className="text-2xl font-bold text-brand-heading tracking-tight font-sans">Woodside Capital Partners</span>
      </div>
      <nav className="flex gap-8">
        {nav.map((item) => (
          <Link
            key={item.name}
            to={item.route}
            className={`font-medium px-2 py-1 rounded transition-colors text-brand-heading text-base font-sans ${
              location.pathname === item.route
                ? 'underline underline-offset-8 decoration-2 text-brand-primary'
                : 'hover:text-brand-primary'
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </header>
  );
};

export default Header; 