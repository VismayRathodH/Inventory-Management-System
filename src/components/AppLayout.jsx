import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AppLayout = ({ currentView, setCurrentView, searchQuery, setSearchQuery, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen relative flex">
      {/* Decorative Background Blobs */}
      <div className="fixed inset-0 z-[-1] pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-primary-fixed-dim dark:bg-primary-container/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-tertiary-fixed-dim dark:bg-tertiary-container/10 blur-[100px] opacity-60"></div>
      </div>

      {/* Sidebar Navigation */}
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col md:ml-[280px] min-h-screen">
        
        {/* Top Navbar */}
        <Navbar 
          currentView={currentView}
          setCurrentView={setCurrentView}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Content Canvas */}
        <main className="flex-1 pt-20 pb-12 px-container-padding-mobile md:px-container-padding-desktop">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
