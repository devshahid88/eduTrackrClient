import React from 'react';
import PropTypes from 'prop-types';

const StatsCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
      <div className="mt-4">
        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color.split(' ')[0]} transition-all duration-500`}
            style={{ width: `${Math.min((value / 100) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
};

export default StatsCard; 