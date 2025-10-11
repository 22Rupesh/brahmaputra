
import React from 'react';
import { UserProfile } from '../types';
import { UserNavItems, StaffNavItems, AdminNavItems, BottomNavItems } from '../constants';

interface SidebarProps {
  user: UserProfile;
  currentPage: string;
  onNavigate: (page: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, currentPage, onNavigate, isSidebarOpen, toggleSidebar }) => {

  const getNavItems = () => {
    if (user.title.includes('(Admin)')) return AdminNavItems;
    if (user.title.includes('(Staff)')) return StaffNavItems;
    return UserNavItems;
  };

  const navItems = getNavItems();

  const handleNavigation = (page: string) => {
    onNavigate(page);
    // Close sidebar on navigation in mobile view
    if (isSidebarOpen) {
      toggleSidebar();
    }
  }

  const NavLink: React.FC<{ name: string; page: string; icon: React.ReactElement }> = ({ name, page, icon }) => {
    const isActive = currentPage === page;
    return (
      <button
        onClick={() => handleNavigation(page)}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-brand-accent text-white shadow-lg'
            : 'text-brand-light hover:bg-brand-medium hover:text-white'
        }`}
      >
        {icon}
        <span className="font-medium">{name}</span>
      </button>
    );
  };

  return (
    <>
      <aside className={`w-64 bg-brand-dark flex-shrink-0 flex flex-col p-4 text-white fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="text-center py-4 mb-4">
          <h1 className="text-2xl font-bold tracking-wider">BRAHMAPUTRA</h1>
          <p className="text-xs text-brand-light">PRODUCTIVITY SUITE</p>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map(item => (
            <NavLink key={item.name} {...item} />
          ))}
        </nav>
        <div className="space-y-2 border-t border-gray-700 pt-4">
          {BottomNavItems.map(item => (
            <NavLink key={item.name} {...item} />
          ))}
        </div>
      </aside>
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
