"use client"
import React from "react";

import { useTranslations } from 'next-intl';

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
  const t = useTranslations('ambassador.labels');

  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-1 row-span-2',
    large: 'col-span-2 row-span-2',
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

  const iconColorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    purple: 'text-purple-600 dark:text-purple-400',
    orange: 'text-orange-600 dark:text-orange-400',
    red: 'text-red-600 dark:text-red-400',
    indigo: 'text-indigo-600 dark:text-indigo-400'
  };

  return (
    <div className={`
      ${sizeClasses[size]} 
      ${colorClasses[color]}
      rounded-2xl p-6 border-2 
      hover:shadow-xl hover:scale-[1.02] 
      transition-all duration-300 ease-out
      backdrop-blur-sm
    `}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`
          text-3xl p-3 rounded-xl 
          bg-white/50 dark:bg-gray-800/50 
          ${iconColorClasses[color]}
        `}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>

      {/* Content based on size */}
      {size === 'small' && (
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2 text-sm">
              {t('problem')}
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
              {problems[0]}
            </p>
          </div>
        </div>
      )}

      {size === 'medium' && (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2 text-sm">
              {t('problem')}
            </h4>
            <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
              {problems.slice(0, 2).map((problem, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-1 h-1 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <span>{problem}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2 text-sm">
              {t('solution')}
            </h4>
            <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
              {solutions.slice(0, 2).map((solution, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-1 h-1 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <span>{solution}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {(size === 'large' || size === 'wide') && (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-red-600 dark:text-red-400 mb-3 text-sm">
              {t('problem')}
            </h4>
            <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
              {problems.map((problem, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>{problem}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-green-600 dark:text-green-400 mb-3 text-sm">
              {t('solution')}
            </h4>
            <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
              {solutions.map((solution, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>{solution}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-3 text-sm">
              {t('benefit')}
            </h4>
            <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default BentoBox;
