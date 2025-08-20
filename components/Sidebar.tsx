
import React from 'react';
import { View } from '../types';
import { UserIcon } from './icons/UserIcon';
import { InboxIcon } from './icons/InboxIcon';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li
    onClick={onClick}
    className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-all duration-200 ${
      isActive ? 'bg-primary text-gray-900 font-semibold' : 'hover:bg-surface'
    }`}
  >
    {icon}
    <span className="ml-4 text-sm">{label}</span>
  </li>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  return (
    <aside className="w-64 bg-surface text-text-primary p-4 flex flex-col border-r border-gray-700">
      <div className="flex items-center mb-10">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-bold text-gray-900 text-xl">
          Y
        </div>
        <h1 className="text-xl font-bold ml-3">Yellow AI</h1>
      </div>
      <nav>
        <ul>
          <NavItem
            icon={<UserIcon className="w-5 h-5" />}
            label="User Management"
            isActive={currentView === View.Users}
            onClick={() => setCurrentView(View.Users)}
          />
          <NavItem
            icon={<InboxIcon className="w-5 h-5" />}
            label="Inbox"
            isActive={currentView === View.Inbox}
            onClick={() => setCurrentView(View.Inbox)}
          />
        </ul>
      </nav>
      <div className="mt-auto p-4 bg-gray-900 rounded-lg">
          <p className="text-sm text-text-secondary">© 2024 Yellow AI Corp.</p>
          <p className="text-xs text-gray-500 mt-1">All rights reserved.</p>
      </div>
    </aside>
  );
};
