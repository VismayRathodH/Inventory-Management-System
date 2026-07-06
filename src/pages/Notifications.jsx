import React, { useContext, useState } from 'react';
import { InventoryContext } from '../context/InventoryContext';

const Notifications = ({ setCurrentView }) => {
  const { notifications, logs, markNotificationRead } = useContext(InventoryContext);
  const [filterType, setFilterType] = useState('ALL'); // ALL, LOW_STOCK, EXPIRY

  // Categorize notifications
  const unreadAlerts = notifications.filter(n => !n.isRead);
  
  const lowStockAlerts = unreadAlerts.filter(n => n.type === 'LOW_STOCK');
  const expiredAlerts = unreadAlerts.filter(n => n.type === 'EXPIRED');
  const expiring7Days = unreadAlerts.filter(n => n.type === 'EXPIRING_SOON' && n.severity === 'High');
  const expiring30Days = unreadAlerts.filter(n => n.type === 'EXPIRING_SOON' && n.severity === 'Warning');

  const filteredNotifications = unreadAlerts.filter(n => {
    if (filterType === 'LOW_STOCK') return n.type === 'LOW_STOCK';
    if (filterType === 'EXPIRY') return n.type === 'EXPIRED' || n.type === 'EXPIRING_SOON';
    return true;
  });

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'Critical':
        return {
          bg: 'bg-error/10 border-error/20 text-error',
          icon: 'cancel',
          iconColor: 'text-error'
        };
      case 'High':
        return {
          bg: 'bg-primary-container/10 border-primary-container/20 text-primary-container',
          icon: 'warning',
          iconColor: 'text-primary-container'
        };
      default:
        return {
          bg: 'bg-tertiary-container/15 border-tertiary-container/25 text-tertiary',
          icon: 'info',
          iconColor: 'text-tertiary'
        };
    }
  };

  return (
    <div className="space-y-gutter animate-[fadeIn_0.3s_ease-out]">
      {/* Header and Breadcrumbs */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-headline-lg font-headline-lg text-on-background mb-2">Notification Center</h2>
          <p className="text-body-md font-body-md text-on-surface-variant">Review low-stock alerts, product expiry notifications, and activity logs.</p>
        </div>
        <div className="flex items-center gap-3 text-label-md font-label-md">
          <span onClick={() => setCurrentView('dashboard')} className="text-secondary cursor-pointer hover:text-primary transition-colors">Dashboard</span>
          <span className="material-symbols-outlined text-secondary text-sm">chevron_right</span>
          <span className="text-primary font-bold">Notifications</span>
        </div>
      </div>

      {/* Grid of Monitors (Low Stock + Expiry) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left main: Alerts list */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Expiry buckets */}
          <div className="glass-card rounded-xl p-glass-padding">
            <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>event_busy</span>
              Expiry Monitor
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Expired */}
              <div className="bg-error/5 border border-error/20 rounded-lg p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="text-label-sm font-label-sm text-error uppercase tracking-wide">Expired</span>
                  <span className="material-symbols-outlined text-error opacity-50">cancel</span>
                </div>
                <span className="text-display-lg font-display-lg text-error">{expiredAlerts.length}</span>
                <span className="text-label-sm font-label-sm text-on-surface-variant mt-auto pt-2 border-t border-error/10">Requires immediate disposal</span>
              </div>
              
              {/* 7 Days */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="text-label-sm font-label-sm text-primary uppercase tracking-wide">In 7 Days</span>
                  <span className="material-symbols-outlined text-primary opacity-50">update</span>
                </div>
                <span className="text-display-lg font-display-lg text-primary">{expiring7Days.length}</span>
                <span className="text-label-sm font-label-sm text-on-surface-variant mt-auto pt-2 border-t border-primary/10">Discount or promote soon</span>
              </div>
              
              {/* 30 Days */}
              <div className="bg-tertiary/5 border border-tertiary/20 rounded-lg p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="text-label-sm font-label-sm text-tertiary uppercase tracking-wide">In 30 Days</span>
                  <span className="material-symbols-outlined text-tertiary opacity-50">calendar_month</span>
                </div>
                <span className="text-display-lg font-display-lg text-tertiary">{expiring30Days.length}</span>
                <span className="text-label-sm font-label-sm text-on-surface-variant mt-auto pt-2 border-t border-tertiary/10">Standard monitoring</span>
              </div>
            </div>
          </div>

          {/* Active Alerts List */}
          <div className="glass-card rounded-xl flex flex-col h-full min-h-[400px]">
            {/* Header / Tabs */}
            <div className="glass-header p-4 border-b border-white/40 flex justify-between items-center z-10">
              <div className="flex items-center gap-4">
                <h3 className="text-headline-md font-headline-md text-on-surface">Active Alerts</h3>
                <div className="flex bg-surface-container-highest/40 rounded-lg p-0.5">
                  <button 
                    onClick={() => setFilterType('ALL')}
                    className={`px-3 py-1 rounded text-label-sm transition-all ${filterType === 'ALL' ? 'bg-white dark:bg-inverse-surface dark:text-inverse-on-surface font-semibold shadow-sm' : 'text-secondary'}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setFilterType('LOW_STOCK')}
                    className={`px-3 py-1 rounded text-label-sm transition-all ${filterType === 'LOW_STOCK' ? 'bg-white dark:bg-inverse-surface dark:text-inverse-on-surface font-semibold shadow-sm' : 'text-secondary'}`}
                  >
                    Stock
                  </button>
                  <button 
                    onClick={() => setFilterType('EXPIRY')}
                    className={`px-3 py-1 rounded text-label-sm transition-all ${filterType === 'EXPIRY' ? 'bg-white dark:bg-inverse-surface dark:text-inverse-on-surface font-semibold shadow-sm' : 'text-secondary'}`}
                  >
                    Expiry
                  </button>
                </div>
              </div>
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-label-sm font-label-sm">
                {unreadAlerts.length} Action Needed
              </span>
            </div>

            {/* List Body */}
            <div className="p-4 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="py-12 text-center text-secondary">
                  No unread notifications at this time. All clear!
                </div>
              ) : (
                filteredNotifications.map((notif) => {
                  const style = getSeverityStyle(notif.severity);
                  return (
                    <div key={notif.id} className={`p-4 rounded-xl border flex justify-between items-start gap-4 transition-all hover:scale-[1.005] ${style.bg}`}>
                      <div className="flex items-start gap-3">
                        <span className={`material-symbols-outlined text-2xl ${style.iconColor}`}>{style.icon}</span>
                        <div>
                          <p className="font-semibold text-on-surface leading-tight">{notif.message}</p>
                          <div className="flex gap-4 mt-2 text-label-sm opacity-70 font-medium">
                            <span>SKU: {notif.sku}</span>
                            <span>Type: {notif.type.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => markNotificationRead(notif.id)}
                        className="text-label-sm font-bold text-primary hover:underline"
                        title="Mark as Read"
                      >
                        Dismiss
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right side: System Logs */}
        <div className="lg:col-span-4 flex flex-col h-full">
          <div className="glass-panel p-glass-padding rounded-xl flex-1 flex flex-col h-[500px] lg:h-full overflow-hidden">
            <h3 className="text-headline-md font-headline-md text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">history</span>
              System Logs
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1">
              {logs.length === 0 ? (
                <p className="text-secondary text-center py-6">No historical records found.</p>
              ) : (
                logs.map((log) => {
                  const isCreated = log.action.toLowerCase().includes('creation') || log.action.toLowerCase().includes('initialization');
                  const isDeleted = log.action.toLowerCase().includes('deletion') || log.action.toLowerCase().includes('removal');

                  return (
                    <div key={log.id} className="text-label-sm border-b border-white/20 dark:border-white/5 pb-3 last:border-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`font-bold uppercase tracking-wider px-2 py-0.5 rounded text-[10px] ${
                          isCreated 
                            ? 'bg-[#4ade80]/20 text-[#166534] dark:text-[#4ade80]' 
                            : isDeleted 
                              ? 'bg-error/20 text-error' 
                              : 'bg-tertiary-container/30 text-tertiary'
                        }`}>
                          {log.action}
                        </span>
                        <span className="text-[10px] text-secondary font-normal">
                          {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="font-bold text-on-surface mt-1">{log.item}</p>
                      <p className="text-on-surface-variant text-[11px] mt-0.5">{log.details}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
