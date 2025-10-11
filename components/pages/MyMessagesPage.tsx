import React, { useMemo } from 'react';
import { UserProfile, Alert, Broadcast } from '../../types';

interface MyMessagesPageProps {
  currentUser: UserProfile;
  allAlerts: Alert[];
  allBroadcasts: Broadcast[];
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

const MyMessagesPage: React.FC<MyMessagesPageProps> = ({ currentUser, allAlerts, allBroadcasts }) => {

  const combinedMessages = useMemo(() => {
    const userAlerts = allAlerts
      .filter(a => a.userId === currentUser.id)
      .map(a => ({ ...a, messageType: 'Alert' as const, date: new Date(a.createdAt) }));

    const userBroadcasts = allBroadcasts
      .filter(b => b.targetAudience.includes(currentUser.id))
      .map(b => ({ ...b, messageType: 'Broadcast' as const, date: new Date(b.createdAt) }));

    return [...userAlerts, ...userBroadcasts].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [allAlerts, allBroadcasts, currentUser.id]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-brand-dark">My Messages</h2>
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-lg font-bold text-brand-dark mb-4">Inbox</h3>
        <div className="space-y-4">
          {combinedMessages.map(item => {
            if (item.messageType === 'Alert') {
              const alert = item as Alert & { messageType: 'Alert' };
              const styles = getSeverityStyles(alert.type);
              return (
                <div key={`alert-${alert.id}`} className={`p-4 border-l-4 rounded-md ${styles.border} ${styles.bg}`}>
                  <div className="flex items-start space-x-3">
                    <Icon path={styles.icon} className={styles.text} />
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline">
                          <p className={`font-bold ${styles.text}`}>High-Priority Alert: {alert.title}</p>
                          <span className="text-xs text-gray-500">{new Date(alert.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                      {alert.suggestion && <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-100 rounded-md"><strong>Suggestion:</strong> {alert.suggestion}</p>}
                    </div>
                  </div>
                </div>
              );
            } else {
              const broadcast = item as Broadcast & { messageType: 'Broadcast' };
              return (
                <div key={`broadcast-${broadcast.id}`} className="p-4 border-l-4 rounded-md border-gray-400 bg-gray-50">
                   <div className="flex items-start space-x-3">
                    <Icon path="M11 5.882V4a2 2 0 012-2h2a2 2 0 012 2v1.882M11 5.882a2 2 0 00-1.882 1.118l-1.414 2.828a2 2 0 00.118 1.882l1.414 2.828a2 2 0 001.882 1.118V18a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2.118a2 2 0 00-1.882-1.118l-1.414-2.828a2 2 0 00.118-1.882l1.414-2.828A2 2 0 005 5.882H4a2 2 0 00-2 2v.118" className="text-gray-500" />
                    <div className="flex-1">
                       <div className="flex justify-between items-baseline">
                          <p className="font-bold text-gray-800">Broadcast: {broadcast.title}</p>
                          <span className="text-xs text-gray-500">{new Date(broadcast.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{broadcast.message}</p>
                    </div>
                  </div>
                </div>
              );
            }
          })}
          {combinedMessages.length === 0 && (
            <p className="text-center text-gray-500 py-12">Your message inbox is empty.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyMessagesPage;
