
import React from 'react';
import { UserProfile, AttendanceRecord } from '../../types';

interface AttendancePageProps {
  allAttendance: AttendanceRecord[];
  allUsers: UserProfile[];
}

const AttendancePage: React.FC<AttendancePageProps> = ({ allAttendance, allUsers }) => {
    
  const getUserNameById = (userId: number) => {
    return allUsers.find(u => u.id === userId)?.name || 'Unknown User';
  };

  const sortedAttendance = [...allAttendance].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-brand-dark">Attendance Log</h2>
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">User</th>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">Time</th>
                <th scope="col" className="px-6 py-3">Location</th>
              </tr>
            </thead>
            <tbody>
              {sortedAttendance.map((record) => (
                <tr key={record.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {getUserNameById(record.userId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(record.createdAt).toLocaleDateString('en-CA')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(record.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      href={`https://www.google.com/maps?q=${record.latitude},${record.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      View on Map
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sortedAttendance.length === 0 && (
            <p className="text-center text-gray-500 py-8">No attendance records found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
