import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType }) => {
  const isIncrease = changeType === 'increase';
  return (
    <div className="bg-white p-5 rounded-lg shadow-lg border border-gray-200">
      <h3 className="text-sm font-medium text-brand-light truncate">{title}</h3>
      <div className="mt-2 flex items-baseline space-x-2">
        <p className="text-3xl font-bold text-brand-dark">{value}</p>
        {change && (
          <div className={`flex items-center text-sm font-semibold ${isIncrease ? 'text-green-500' : 'text-red-500'}`}>
            {isIncrease ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            )}
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
