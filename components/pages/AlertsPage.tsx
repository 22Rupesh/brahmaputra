import React, { useState, useMemo } from 'react';
import { UserProfile, Alert } from '../../types';
import Modal from '../Modal';

interface AlertsPageProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  allAlerts: Alert[];
  onCreateAlert: (alertData: Omit<Alert, 'id' | 'createdAt'>, sendEmail: boolean) => Promise<void>;
  onDeleteAlert: (alertId: number) => Promise<void>;
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

const AlertsPage: React.FC<AlertsPageProps> = ({ currentUser, allUsers, allAlerts, onCreateAlert, onDeleteAlert }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [newAlert, setNewAlert] = useState<Omit<Alert, 'id' | 'createdAt'>>({
        userId: 0,
        type: 'info',
        title: '',
        message: '',
        suggestion: '',
    });
    const [sendEmail, setSendEmail] = useState(true);

    const isAdmin = currentUser.title.includes('(Admin)');

    const openCreateModal = () => {
        setNewAlert({ userId: allUsers.find(u => !u.title.includes('(Admin)'))?.id || 0, type: 'info', title: '', message: '', suggestion: '' });
        setSendEmail(true);
        setModalOpen(true);
    };

    const handleFieldChange = (field: keyof typeof newAlert, value: any) => {
        setNewAlert(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAlert.userId || !newAlert.title || !newAlert.message) {
            alert('Please select a user and fill in the title and message.');
            return;
        }
        await onCreateAlert(newAlert, sendEmail);
        setModalOpen(false);
    };

    const getUserNameById = (id: number) => {
        return allUsers.find(u => u.id === id)?.name || 'Unknown User';
    };

    if (!isAdmin) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <h2 className="text-xl font-bold text-brand-dark">Access Denied</h2>
                <p className="text-gray-600 mt-2">You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-brand-dark">Manage & Send Alerts</h2>
                 <button onClick={openCreateModal} className="bg-brand-accent hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
                    Create New Alert
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                 <h3 className="text-lg font-bold text-brand-dark mb-4">Alert History</h3>
                {allAlerts.map(alert => {
                    const styles = getSeverityStyles(alert.type);
                    return (
                        <div key={alert.id} className={`p-4 border-l-4 rounded-md ${styles.border} ${styles.bg} relative group`}>
                            <button
                                onClick={() => onDeleteAlert(alert.id)}
                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete Alert"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <div className="flex items-start space-x-3">
                                <Icon path={styles.icon} className={styles.text} />
                                <div className="flex-1">
                                    <p className={`font-bold ${styles.text}`}>{alert.title}</p>
                                    <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                                    {alert.suggestion && <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-100 rounded-md"><strong>Suggestion:</strong> {alert.suggestion}</p>}
                                    <p className="text-xs text-gray-500 mt-3 pt-2 border-t">
                                        Sent to <strong>{getUserNameById(alert.userId)}</strong> on {new Date(alert.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                })}
                {allAlerts.length === 0 && <p className="text-center text-gray-500 py-8">No alerts have been sent yet.</p>}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Create and Send Alert">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Recipient</label>
                            <select
                                value={newAlert.userId}
                                onChange={e => handleFieldChange('userId', parseInt(e.target.value, 10))}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                            >
                                {allUsers.filter(u => !u.title.includes('(Admin)')).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Alert Type</label>
                            <select
                                value={newAlert.type}
                                onChange={e => handleFieldChange('type', e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                            >
                                <option value="info">Info (Blue)</option>
                                <option value="success">Success (Green)</option>
                                <option value="warning">Warning (Yellow)</option>
                                <option value="error">Error / Critical (Red)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            value={newAlert.title}
                            onChange={e => handleFieldChange('title', e.target.value)}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Message</label>
                        <textarea
                            rows={4}
                            value={newAlert.message}
                            onChange={e => handleFieldChange('message', e.target.value)}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Suggestion (Optional)</label>
                        <textarea
                            rows={2}
                            value={newAlert.suggestion || ''}
                            onChange={e => handleFieldChange('suggestion', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                        ></textarea>
                    </div>
                     <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="sendEmail"
                                name="sendEmail"
                                type="checkbox"
                                checked={sendEmail}
                                onChange={e => setSendEmail(e.target.checked)}
                                className="focus:ring-brand-accent h-4 w-4 text-brand-accent border-gray-300 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="sendEmail" className="font-medium text-gray-700">Send email notification</label>
                            <p className="text-gray-500">Also send a copy of this alert to the user's email address.</p>
                        </div>
                    </div>
                    <div className="text-right mt-6">
                        <button type="submit" className="bg-brand-accent hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
                          Send Alert
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AlertsPage;