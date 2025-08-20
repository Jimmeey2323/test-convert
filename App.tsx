
import React, { useState } from 'react';
import UserManagementView from './components/views/UserManagementView';
import InboxView from './components/views/InboxView';
import { Sidebar } from './components/Sidebar';
import { View } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Users);

  const renderView = () => {
    switch (currentView) {
      case View.Users:
        return <UserManagementView />;
      case View.Inbox:
        return <InboxView />;
      default:
        return <UserManagementView />;
    }
  };

  return (
    <div className="flex h-screen bg-background font-sans">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 overflow-y-auto">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
