"use client"
import React from "react";


import BentoBox from './BentoBox';

interface Feature {
  icon: string;
  title: string;
  problems: string[];
  solutions: string[];
  benefits: string[];
  size?: 'small' | 'medium' | 'large' | 'wide';
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
}

interface BentoGridProps {
  features: Feature[];
  title?: string;
  subtitle?: string;
  showInfo?: boolean;
}

const BentoGrid: React.FC<BentoGridProps> = ({ 
  features, 
  title = "Возможности Maetry",
  subtitle = "Каждый блок показывает проблему, решение и ценность для салона красоты",
  showInfo = true
}) => {
  return (
    <div className="w-full px-[3.5%]">
      <div className="max-w-7xl mx-auto">
        {/* Grid Title */}
        <div className="text-center mb-12">
          <h2 className="text-[2rem] md:text-[3rem] xl:text-[4rem] font-bold mb-6 text-gray-900 dark:text-white">
            {title.includes('Maetry') ? (
              <>
                {title.split(' Maetry')[0]} <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Maetry</span>
              </>
            ) : (
              title
            )}
          </h2>
          <p className="text-[1.2rem] md:text-[1.5rem] text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[200px]">
          {features.map((feature, index) => (
            <BentoBox
              key={index}
              icon={feature.icon}
              title={feature.title}
              problems={feature.problems}
              solutions={feature.solutions}
              benefits={feature.benefits}
              size={feature.size}
              color={feature.color}
            />
          ))}
        </div>

        {/* Grid Info */}
        {showInfo && (
          <div className="text-center mt-12">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Интерактивная сетка возможностей • Наведите курсор для анимации
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BentoGrid;
