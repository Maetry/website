"use client"
import React, { useState } from "react";

interface BentoBoxProps {
  icon: string;
  title: string;
  problems: string[];
  solutions: string[];
  benefits: string[];
  size?: 'small' | 'medium' | 'large' | 'wide';
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
}

const BentoBox: React.FC<BentoBoxProps> = ({
  icon,
  title,
  problems,
  solutions,
  benefits,
  size = 'medium',
  color = 'blue'
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-1 row-span-2',
    large: 'col-span-1 row-span-3',
    wide: 'col-span-2 row-span-1'
  };

  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700',
    green: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700',
    orange: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700',
    red: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700',
    indigo: 'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-700'
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${colorClasses[color]}
        border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 ease-in-out
        hover:scale-105 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-white/10
        ${isHovered ? 'transform scale-105 shadow-xl' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-full flex flex-col">
        {/* Icon */}
        <div className="flex items-center justify-center mb-4">
          <div className="text-4xl">{icon}</div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          {title}
        </h3>

        {/* Content */}
        <div className="flex-1 space-y-3">
          {/* Problems */}
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-red-600 dark:text-red-400">
              Проблемы:
            </h4>
            <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
              {problems.map((problem, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  {problem}
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Решения:
            </h4>
            <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
              {solutions.map((solution, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  {solution}
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-green-600 dark:text-green-400">
              Преимущества:
            </h4>
            <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BentoBox;
