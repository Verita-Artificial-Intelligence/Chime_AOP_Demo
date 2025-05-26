import React from 'react';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, className = '' }) => (
  <div className={`bg-gray-900 border border-gray-700 rounded-lg p-4 flex items-center gap-4 ${className}`}>
    {icon && <div className="text-2xl text-brand">{icon}</div>}
    <div>
      <div className="text-sm text-gray-400">{label}</div>
      <div className="font-bold text-xl text-white">{value}</div>
    </div>
  </div>
);

export default StatCard; 