import React from 'react';

const Sidebar = ({ currentView, setCurrentView, mobileOpen, setMobileOpen, handleLogout, role }) => {
  const rawMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', allowedRoles: ['admin'] },
    { id: 'categories', label: 'Categories', icon: 'category', allowedRoles: ['admin'] },
    { id: 'inventory', label: 'Inventory', icon: 'inventory_2', allowedRoles: ['admin'] },
    { id: 'notifications', label: 'Notifications', icon: 'notifications', allowedRoles: ['admin'] },
    { id: 'sales', label: 'Sales', icon: 'shopping_cart', allowedRoles: ['admin', 'worker'] },
    { id: 'bundles', label: 'Bundles', icon: 'package_2', allowedRoles: ['admin', 'worker'] },
    { id: 'analytics', label: 'Analytics', icon: 'leaderboard', allowedRoles: ['admin'] },
    { id: 'export', label: 'Export', icon: 'ios_share', allowedRoles: ['admin'] },
    { id: 'admin_profile', label: 'Admin Profile', icon: 'admin_panel_settings', allowedRoles: ['admin'] },
    { id: 'worker_dashboard', label: 'Worker Dashboard', icon: 'engineering', allowedRoles: ['worker'] }
  ];

  const menuItems = rawMenuItems.filter(item => item.allowedRoles.includes(role || 'admin'));

  const handleNavClick = (viewId) => {
    setCurrentView(viewId);
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  const navClass = "fixed left-0 top-0 h-full w-[280px] flex flex-col p-unit backdrop-blur-[12px] border-r border-white/60 dark:border-white/10 shadow-sm bg-surface-container-low/60 z-50 transition-all duration-300";

  const renderContent = () => (
    <>
      {/* Brand Header */}
      <div className="px-4 py-6 mb-6">
        <h1 className="text-headline-md font-headline-md font-bold text-primary dark:text-primary-container">StockGlass</h1>
        <p className="text-label-sm font-label-sm text-secondary dark:text-secondary-fixed-dim mt-1">Admin Console</p>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-1">
        {menuItems.map((item) => {
          const isActive = currentView === item.id || 
            (item.id === 'categories' && currentView === 'add_category') ||
            (item.id === 'inventory' && currentView === 'add_item');
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-primary text-on-primary shadow-sm transform scale-[0.98]"
                  : "text-on-surface-variant hover:bg-white/20 hover:backdrop-blur-xl hover:text-primary dark:hover:text-primary-container"
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
              <span className="text-label-md font-label-md">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Add Item Bottom Trigger */}
      <div className="mt-auto p-4 border-t border-white/30 flex flex-col gap-2">
        {role !== 'worker' && (
          <button 
            onClick={() => handleNavClick('add_item')}
            className="w-full bg-primary-container text-white dark:text-on-primary-container font-label-md text-label-md py-3 rounded-lg shadow-md hover:bg-primary transition-colors flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="material-symbols-outlined">add</span>
            Add Item
          </button>
        )}
        <button 
          onClick={handleLogout}
          className="w-full text-error font-label-md text-label-md py-2 rounded-lg hover:bg-error-container/20 transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Drawer (Only shows when mobileOpen is true) */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-on-background/20 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setMobileOpen(false)}
          ></div>
          
          {/* Drawer Body */}
          <nav className="relative flex flex-col w-[280px] h-full p-unit bg-surface-container-low/90 backdrop-blur-xl border-r border-white/60 dark:border-white/10 shadow-lg animate-[slideIn_0.2s_ease-out]">
            {renderContent()}
          </nav>
        </div>
      )}

      {/* Desktop Sidebar (hidden on mobile) */}
      <nav className={`hidden md:flex ${navClass}`}>
        {renderContent()}
      </nav>
    </>
  );
};

export default Sidebar;
