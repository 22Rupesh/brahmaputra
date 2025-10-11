import React, { useState } from 'react';
import Modal from './Modal';

interface ActivityLoggerProps {
    onLogActivity: (activityType: 'siteVisit' | 'reportSubmission') => void;
}

const ActivityLogger: React.FC<ActivityLoggerProps> = ({ onLogActivity }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'siteVisit' | 'reportSubmission' | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const openModal = (type: 'siteVisit' | 'reportSubmission') => {
        setModalType(type);
        setModalOpen(true);
    };

    const handleConfirm = () => {
        if (!modalType) return;
        
        setIsLoading(true);
        // Simulate a network request
        setTimeout(() => {
            onLogActivity(modalType);
            setIsLoading(false);
            setModalOpen(false);
        }, 500);
    };

    const modalTitle = modalType === 'siteVisit' ? "Log New Site Visit" : "Log Report Submission";
    const modalContent = modalType === 'siteVisit' 
        ? "Are you sure you want to log a new site visit? This will be added to your daily performance record."
        : "Are you sure you want to log a new report submission? This will count towards your monthly target.";

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-brand-dark mb-4">Log Daily Activity</h3>
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => openModal('siteVisit')}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-md transition-colors text-center"
                >
                    Log Site Visit
                </button>
                <button
                    onClick={() => openModal('reportSubmission')}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-md transition-colors text-center"
                >
                    Submit Report
                </button>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={modalTitle}>
                <p className="text-gray-600">{modalContent}</p>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={() => setModalOpen(false)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="bg-brand-accent hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm disabled:bg-gray-400"
                    >
                        {isLoading ? 'Logging...' : 'Confirm'}
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default ActivityLogger;
