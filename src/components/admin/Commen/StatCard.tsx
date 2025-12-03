import React from 'react';
import { StatCardProps } from '../../../types/components/admin';

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  iconColor, 
  value, 
  label, 
  trend, 
  trendValue, 
  gradient,
  className = '' 
}) => {
  const iconColors: Record<string, string> = {
    blue: "text-blue-600",
    purple: "text-purple-600",
    teal: "text-teal-600",
    amber: "text-amber-600",
    green: "text-green-600",
    red: "text-red-600",
    gray: "text-gray-600",
    default: "text-gray-600"
  };
  
  const trendIcons: Record<string, string> = {
    up: "ti-arrow-up",
    down: "ti-arrow-down",
    neutral: "ti-minus"
  };
  
  const trendColors: Record<string, string> = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-gray-600"
  };

  const safeIconColor = iconColors[iconColor] || iconColors.default;
  const safeTrendIcon = trendIcons[trend] || trendIcons.neutral;
  const safeTrendColor = trendColors[trend] || trendColors.neutral;
  
  return (
    <div className={`bg-gradient-to-br ${gradient} p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl bg-opacity-20 ${safeIconColor} bg-current`}>
          <i className={`ti ti-${icon} text-2xl`} />
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-600">{label}</div>
        </div>
      </div>
      <div className={`flex items-center gap-2 mt-4 ${safeTrendColor}`}>
        <i className={`ti ${safeTrendIcon} text-lg`} />
        <span className="text-sm font-medium">{trendValue}</span>
      </div>
    </div>
  );
};

export default StatCard;
