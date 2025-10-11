import React from 'react';
import { ActivityLogEntry } from '../types';

interface ContributionGraphProps {
  activityData: ActivityLogEntry[];
  title: string;
}

const ContributionGraph: React.FC<ContributionGraphProps> = ({ activityData = [], title }) => {
  const today = new Date();
  const year = today.getFullYear();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const activityMap = new Map<string, number>((activityData || []).map(item => [item.date, item.count]));
  const totalSubmissions = Array.from(activityMap.values()).reduce((sum, count) => sum + count, 0);

  const getCalendarData = () => {
    const dates = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };
  
  const calendarDates = getCalendarData();
  const firstDayOfMonth = calendarDates.map(d => d.getDate() === 1 ? d.getMonth() : -1);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-200 dark:bg-gray-700';
    if (count > 0) return 'bg-green-500';
    return 'bg-gray-200 dark:bg-gray-700';
  };

  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-brand-dark">{title}: {totalSubmissions} submissions in current year</h3>
            <div className="flex items-center space-x-2">
                 <button className="p-1 rounded-full bg-gray-200 hover:bg-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                 </button>
                 <select className="text-sm border-gray-300 rounded-md shadow-sm focus:border-brand-accent focus:ring-brand-accent">
                    <option>Current</option>
                 </select>
                 <button className="p-1 rounded-full bg-gray-200 hover:bg-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                 </button>
                 <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                 </button>
            </div>
        </div>
      <div className="flex overflow-x-auto pb-4">
        {monthNames.map((month, monthIndex) => (
          <div key={month} className="text-center mr-2">
            <p className="text-xs text-gray-500 mb-1">{month}</p>
            <div className="grid grid-flow-col grid-rows-7 gap-1">
              {calendarDates.filter(d => d.getMonth() === monthIndex).map(date => {
                const dateString = date.toISOString().split('T')[0];
                const count = activityMap.get(dateString) || 0;
                return (
                  <div
                    key={dateString}
                    className={`w-4 h-4 rounded-sm ${getColor(count)}`}
                    title={`${count} contributions on ${date.toDateString()}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContributionGraph;