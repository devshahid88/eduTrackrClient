import React from 'react';
import PropTypes from 'prop-types';
import { MdArrowUpward, MdArrowDownward } from 'react-icons/md';

const StatsCard = ({ title, value, trend, trendValue, icon: Icon }) => {
  const isPositive = trend === 'up';
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-gray-600 text-sm">{title}</span>
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
            <Icon className={`w-5 h-5 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          {trendValue && (
            <div className="flex items-center mt-2">
              {isPositive ? (
                <MdArrowUpward className="w-4 h-4 text-green-500" />
              ) : (
                <MdArrowDownward className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm ml-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  trend: PropTypes.oneOf(['up', 'down']),
  trendValue: PropTypes.string,
  icon: PropTypes.elementType
};

export default StatsCard; 