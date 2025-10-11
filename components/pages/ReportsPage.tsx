import React, { useState, useMemo } from 'react';
import { UserProfile, Report } from '../../types';
import { supabase } from '../../lib/supabaseClient';

interface ReportsPageProps {
  viewedUser: UserProfile;
  initialReports: Report[];
  refreshReports: () => void;
  onDeleteReport: (reportId: number) => Promise<void>;
}

const reportTypes = {
  Admin: ['Overall Performance', 'Department Productivity Analysis', 'Organizational Audit Log'],
  Staff: ['Project Summary', 'Team Performance Report', 'Budget Adherence Report'],
  User: ['My Monthly Performance', 'My Task Completion Report', 'My KPI Breakdown'],
};

const ReportsPage: React.FC<ReportsPageProps> = ({ viewedUser, initialReports, refreshReports, onDeleteReport }) => {
  
  const getRole = (title: string) => {
    if (title.includes('(Admin)')) return 'Admin';
    if (title.includes('(Staff)')) return 'Staff';
    return 'User';
  }

  const userRole = getRole(viewedUser.title);
  const isAdmin = userRole === 'Admin';
  
  const availableReportTypes = useMemo(() => reportTypes[userRole], [userRole]);
  const [reportType, setReportType] = useState(availableReportTypes[0]);
  
  const visibleReports = useMemo(() => {
    if (isAdmin) return initialReports;
    return initialReports.filter(r => r.generatedById === viewedUser.id);
  }, [initialReports, isAdmin, viewedUser.id]);


  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    const newReport = {
        name: `${reportType} - ${new Date().toLocaleDateString('en-CA')}`,
        date: new Date().toISOString(),
        format: 'PDF',
        generated_by_id: viewedUser.id,
    };
    
    const { error } = await supabase.from('reports').insert([newReport]).select();

    if (error) {
        alert("Failed to generate report: " + error.message);
    } else {
        // Await the refresh to ensure data is current before alerting the user
        await refreshReports();
        alert('Report generated successfully and list updated!');
    }
  };

  const handleDownload = (reportName: string) => {
    alert(`Downloading "${reportName}"... This is a simulated download.`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-brand-dark">Reports for {viewedUser.name}</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-brand-dark mb-4">Generate New Report</h3>
        <form onSubmit={handleGenerateReport} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="report-type" className="block text-sm font-medium text-gray-700">Report Type</label>
            <select 
              id="report-type" 
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm rounded-md"
            >
              {availableReportTypes.map(type => <option key={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="date-range" className="block text-sm font-medium text-gray-700">Date Range</label>
            <input type="date" id="date-range" defaultValue={new Date().toLocaleDateString('en-CA')} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm rounded-md"/>
          </div>
          <button type="submit" className="bg-brand-accent hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm w-full md:w-auto">
            Generate
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-brand-dark mb-4">Recently Generated Reports</h3>
        <ul className="space-y-3">
          {visibleReports.map((report) => (
            <li key={report.id} className="flex justify-between items-center p-3 rounded-md border hover:bg-gray-50">
              <div>
                <p className="font-semibold text-brand-dark">{report.name}</p>
                <p className="text-sm text-brand-light">Generated on {new Date(report.date).toLocaleDateString()}</p>
              </div>
              <div className="space-x-3">
                <button onClick={() => handleDownload(report.name)} className="text-sm font-medium text-blue-600 hover:underline">
                  Download ({report.format})
                </button>
                {isAdmin && (
                    <button onClick={() => onDeleteReport(report.id)} className="text-sm font-medium text-red-600 hover:underline">
                        Delete
                    </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ReportsPage;