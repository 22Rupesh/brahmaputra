
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface LoginPageProps {
    onLogin: (user: UserProfile) => void;
    allUsers: UserProfile[];
    onSwitchToSignup: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, allUsers, onSwitchToSignup }) => {
    const [selectedUserId, setSelectedUserId] = useState<string>(allUsers.length > 0 ? allUsers[0].id.toString() : '');

     React.useEffect(() => {
        if (allUsers.length > 0 && !selectedUserId) {
            setSelectedUserId(allUsers[0].id.toString());
        }
    }, [allUsers, selectedUserId]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserId) {
            alert("No user selected. Please register a user first if none exist.");
            return;
        }
        const user = allUsers.find(u => u.id === parseInt(selectedUserId, 10));
        if (user) {
            onLogin(user);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-brand-bg">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-brand-dark">Brahmaputra</h1>
                    <p className="mt-2 text-brand-light">Productivity Suite Login</p>
                </div>
                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="user-select" className="block text-sm font-medium text-gray-700">
                            Select Your Profile to Login
                        </label>
                        <select
                            id="user-select"
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm rounded-md"
                        >
                            {allUsers.length === 0 && <option>Loading users...</option>}
                            {allUsers.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name} - {user.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={allUsers.length === 0}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-accent hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-colors disabled:bg-gray-400"
                        >
                            Login
                        </button>
                    </div>
                </form>
                <p className="text-center text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button onClick={onSwitchToSignup} className="font-medium text-brand-accent hover:underline focus:outline-none">
                    Sign Up
                  </button>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
