import React, { useState, useMemo } from 'react';
import { UserProfile, Broadcast, AttendanceRecord, Alert } from '../../types';
import StatCard from '../StatCard';
import ScoreGauge from '../ScoreGauge';
import PerformanceChart from '../PerformanceChart';
import KpiTable from '../KpiTable';
import ContributionGraph from '../ContributionGraph';
import ActivityLogger from '../ActivityLogger';

interface IndividualDashboardProps {
  viewedUser: UserProfile;
  allBroadcasts: Broadcast[];
  allAttendance: AttendanceRecord[];
  allAlerts: Alert[];
  onLogActivity: (activityType: 'siteVisit' | 'reportSubmission') => void;
  onMarkAttendance: (coords: { latitude: number, longitude: number }) => Promise<void>;
}

const getSeverityStyles = (type: Alert['type']) => {
    switch (type) {
        case 'error': return { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-800', icon: 'M12 8v4m0 4h.01' };
        case 'warning': return { border: 'border-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-800', icon: 'M12 9v2m0 4h.01' };
        case 'success': return { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-800', icon: 'M5 13l4 4L19 7' };
        case 'info':
        default: return { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-800', icon: 'M13 16h-1v-4h-1m1-4h.01' };
    }
}

const Icon = ({ path, className }: { path: string, className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 flex-shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
)

const IndividualDashboard: React.FC<IndividualDashboardProps> = ({ viewedUser, allBroadcasts, allAttendance, allAlerts, onLogActivity, onMarkAttendance }) => {
  const [dismissedBroadcasts, setDismissedBroadcasts] = useState<number[]>(() => JSON.parse(localStorage.getItem('dismissedBroadcasts') || '[]'));
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>(() => JSON.parse(localStorage.getItem('dismissedAlerts') || '[]'));

  const handleDismissBroadcast = (id: number) => {
    const newDismissed = [...dismissedBroadcasts, id];
    setDismissedBroadcasts(newDismissed);
    localStorage.setItem('dismissedBroadcasts', JSON.stringify(newDismissed));
  };
  
  const handleDismissAlert = (id: number) => {
    const newDismissed = [...dismissedAlerts, id];
    setDismissedAlerts(newDismissed);
    localStorage.setItem('dismissedAlerts', JSON.stringify(newDismissed));
  };

  const visibleBroadcasts = useMemo(() => {
    return allBroadcasts
      .filter(b => b.targetAudience.includes(viewedUser.id) && !dismissedBroadcasts.includes(b.id))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allBroadcasts, viewedUser.id, dismissedBroadcasts]);
  
  const visibleAlerts = useMemo(() => {
    return allAlerts
      .filter(a => a.userId === viewedUser.id && !dismissedAlerts.includes(a.id))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allAlerts, viewedUser.id, dismissedAlerts]);

  const hasMarkedAttendanceToday = useMemo(() => {
    const today = new Date().toLocaleDateString('en-CA');
    return allAttendance.some(a => a.userId === viewedUser.id && new Date(a.createdAt).toLocaleDateString('en-CA') === today);
  }, [allAttendance, viewedUser.id]);
  
  const handleMarkAttendanceClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onMarkAttendance({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          alert(`Geolocation Error: ${error.message}. Please enable location services in your browser and try again.`);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Alerts Section */}
      {visibleAlerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-brand-dark">Alerts for You</h3>
          {visibleAlerts.map(alert => {
            const styles = getSeverityStyles(alert.type);
            return (
              <div key={alert.id} className={`p-4 border-l-4 rounded-md ${styles.border} ${styles.bg} relative`}>
                <button onClick={() => handleDismissAlert(alert.id)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">&times;</button>
                <div className="flex items-start space-x-3">
                    <Icon path={styles.icon} className={styles.text} />
                    <div className="flex-1">
                        <p className={`font-bold ${styles.text}`}>{alert.title}</p>
                        <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                        {alert.suggestion && <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-100 rounded-md"><strong>Suggestion:</strong> {alert.suggestion}</p>}
                    </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      {/* Broadcasts Section */}
      {visibleBroadcasts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-brand-dark">Broadcasts for You</h3>
          {visibleBroadcasts.map(b => (
            <div key={b.id} className="bg-brand-accent-light border-l-4 border-brand-accent text-brand-dark p-4 rounded-md relative">
              <button onClick={() => handleDismissBroadcast(b.id)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">&times;</button>
              <h4 className="font-bold">{b.title}</h4>
              <p className="text-sm mt-1">{b.message}</p>
            </div>
          ))}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Overall Score" value={`${viewedUser.score}/100`} change="+3" changeType="increase" />
        <StatCard title="Tasks Completed" value={(viewedUser.tasks || []).filter(t => t.status === 'Completed').length} />
        <StatCard title="Pending Tasks" value={(viewedUser.tasks || []).filter(t => t.status === 'Pending').length} />
        <StatCard title="Division Rank" value={`3rd`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <ScoreGauge score={viewedUser.score} />
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <PerformanceChart data={viewedUser.performance_data} />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <ContributionGraph activityData={viewedUser.activityLog} title="My Activity" />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <KpiTable
          quantitativeKpis={viewedUser.quantitativeKpis}
          qualitativeKpis={viewedUser.qualitativeKpis}
        />
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-brand-dark mb-4">Daily Check-in</h3>
            <button
                onClick={handleMarkAttendanceClick}
                disabled={hasMarkedAttendanceToday}
                className="w-full bg-brand-accent hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {hasMarkedAttendanceToday ? `✔️ Attendance Marked for Today` : 'Mark Attendance with Geolocation'}
            </button>
            {hasMarkedAttendanceToday && <p className="text-xs text-center text-gray-500 mt-2">You can mark your attendance again tomorrow.</p>}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-brand-dark mb-4">My Tasks</h3>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
                {(viewedUser.tasks || []).map(task => (
                    <li key={task.id} className="flex justify-between items-center p-2 border rounded-md">
                        <div>
                            <p className="font-medium text-gray-800">{task.name}</p>
                            <p className="text-xs text-gray-500">{task.projectName} - Due: {task.dueDate}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${task.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {task.status}
                        </span>
                    </li>
                ))}
                {(viewedUser.tasks || []).length === 0 && <p className="text-sm text-gray-500 text-center py-4">No tasks assigned.</p>}
            </ul>
          </div>
       </div>
    </div>
  );
};

export default IndividualDashboard;