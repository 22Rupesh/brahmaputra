import React, { useState } from 'react';
// @ts-ignore
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../types';
import Modal from './Modal';

interface PerformanceChartProps {
    data: ChartDataPoint[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-brand-dark">Monthly Performance Trend (Last 6 Months)</h3>
        <div className="flex items-center space-x-4">
           <div className="flex items-center space-x-2 text-sm text-brand-light cursor-pointer group">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <div className="relative">
                <span>How score is calculated:</span>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 bg-brand-dark text-white text-xs rounded py-1 px-2">
                    Click to view data & evidence
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-brand-dark hover:bg-brand-medium text-white font-bold py-2 px-4 rounded-md text-sm transition-colors">
              Raw Data & Audit
            </button>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#718096' }} axisLine={false} tickLine={false} />
            <YAxis unit="%" tick={{ fill: '#718096' }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#4a5568" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Raw Performance Data">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Month</th>
                <th scope="col" className="px-6 py-3">Performance Score (%)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((dataPoint, index) => (
                <tr key={index} className="bg-white border-b">
                  <td className="px-6 py-4 font-medium text-gray-900">{dataPoint.name}</td>
                  <td className="px-6 py-4">{dataPoint.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
};

export default PerformanceChart;