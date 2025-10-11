import React from 'react';
import { UserProfile } from '../types';
import { DEFAULT_AVATAR_URL } from '../constants';

interface HeaderProps {
    currentUser: UserProfile;
    viewedUser: UserProfile;
    setViewedUser: (user: UserProfile) => void;
    allUsers: UserProfile[];
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, viewedUser, setViewedUser, allUsers, onLogout }) => {

  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUserId = parseInt(event.target.value, 10);
    const selectedUser = allUsers.find(user => user.id === selectedUserId);
    if (selectedUser) {
        setViewedUser(selectedUser);
    }
  };

  const canViewOthers = currentUser.title.includes('(Admin)') || currentUser.title.includes('(Staff)');
  
  return (
    <header className="h-20 bg-white border-b border-brand-border flex-shrink-0 flex items-center justify-between px-8">
      <div className="flex items-center space-x-4">
        <h2 className="text-2xl font-semibold text-brand-dark hidden sm:block">Productivity</h2>
         {canViewOthers && (
            <div className="flex items-center space-x-2">
                <label htmlFor="user-select" className="text-sm font-medium text-gray-700">Viewing For:</label>
                <select 
                    id="user-select" 
                    value={viewedUser.id} 
                    onChange={handleUserChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent sm:text-sm rounded-md"
                >
                    {allUsers.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                </select>
            </div>
         )}
      </div>
      <div className="flex items-center space-x-6">
        <div className="text-right">
          <p className="font-semibold text-brand-dark">{currentUser.name}</p>
          <p className="text-sm text-brand-light">{currentUser.title}</p>
        </div>
        <img
          className="w-12 h-12 rounded-full object-cover bg-gray-200 p-1"
          src={DEFAULT_AVATAR_URL}
          alt="User Icon"
        />
        <button onClick={onLogout} className="text-sm font-medium text-brand-light hover:text-brand-dark" title="Logout">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
