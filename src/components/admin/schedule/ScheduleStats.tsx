import React from 'react';
import { Calendar, Users, BookOpen, Building } from 'lucide-react';
import { ScheduleStatsProps } from '../../../types/components/admin';

const ScheduleStats: React.FC<ScheduleStatsProps> = ({ 
  stats, 
  departments, 
  courses, 
  className = '' 
}) => {
  const statItems = [
    {
      title: 'Total Classes',
      value: stats.totalClasses,
      subtitle: 'Scheduled this week',
      icon: Calendar,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Active Departments',
      value: stats.activeDepartments,
      subtitle: `of ${departments.length} total`,
      icon: Building,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-600'
    },
    {
      title: 'Active Courses',
      value: stats.activeCourses,
      subtitle: `of ${courses.length} total`,
      icon: BookOpen,
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-800',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Active Teachers',
      value: stats.activeTeachers,
      subtitle: 'Currently teaching',
      icon: Users,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-800',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className={`${item.bgColor} p-4 rounded-lg border ${item.borderColor}`}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={`w-5 h-5 ${item.iconColor}`} />
              <span className={`text-2xl font-bold ${item.textColor}`}>
                {item.value}
              </span>
            </div>
            <p className={`text-sm font-medium ${item.iconColor}`}>
              {item.title}
            </p>
            <p className={`text-xs ${item.textColor} mt-1`}>
              {item.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default ScheduleStats;
