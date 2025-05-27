import React from 'react';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, className = '' }) => (
  <div className={`bg-brand-card border border-brand-border rounded-lg p-4 flex items-center gap-4 ${className}`}>
    {icon && <div className="text-2xl text-brand-primary">{icon}</div>}
    <div>
      <div className="text-sm text-brand-muted opacity-70">{label}</div>
      <div className="font-bold text-xl text-brand-heading">{value}</div>
    </div>
  </div>
);

export default StatCard; 