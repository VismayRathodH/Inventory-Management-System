import React, { useContext } from 'react';
import { InventoryContext } from '../context/InventoryContext';

const Dashboard = ({ setCurrentView }) => {
  const { inventoryItems, notifications, categories, logs } = useContext(InventoryContext);

  // Compute metrics dynamically
  const totalStockVolume = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = inventoryItems.filter(item => item.quantity < item.threshold).length;
  
  const expiringSoonCount = inventoryItems.filter(item => {
    if (!item.expiryDate) return false;
    const today = new Date("2026-07-06T12:00:00");
    const exp = new Date(item.expiryDate);
    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
    return diffDays > 0 && diffDays <= 30;
  }).length;

  // Recent inventory items (limit to 4)
  const recentItems = inventoryItems.slice(0, 4);

  return (
    <div className="space-y-gutter animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div className="mb-gutter">
        <h2 className="text-headline-lg font-headline-lg text-on-background mb-2">Items Overview</h2>
        <p className="text-body-md font-body-md text-secondary">Manage your entire inventory lifecycle from a single view.</p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* Metrics Row (Top) */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-gutter">
          
          {/* Metric 1 */}
          <div className="glass-panel p-glass-padding rounded-xl flex flex-col justify-between h-32 hover:scale-[1.01] transition-transform">
            <div className="flex items-center justify-between text-secondary">
              <span className="text-label-md font-label-md">Total Stock Volume</span>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>inventory</span>
            </div>
            <div className="text-display-lg font-display-lg text-primary">{totalStockVolume.toLocaleString()}</div>
          </div>
          
          {/* Metric 2 */}
          <div className="glass-panel p-glass-padding rounded-xl flex flex-col justify-between h-32 hover:scale-[1.01] transition-transform">
            <div className="flex items-center justify-between text-secondary">
              <span className="text-label-md font-label-md">Low Stock Alerts</span>
              <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            </div>
            <div className="text-display-lg font-display-lg text-error">{lowStockCount}</div>
          </div>
          
          {/* Metric 3 */}
          <div className="glass-panel p-glass-padding rounded-xl flex flex-col justify-between h-32 hover:scale-[1.01] transition-transform">
            <div className="flex items-center justify-between text-secondary">
              <span className="text-label-md font-label-md">Expiring Soon (30d)</span>
              <span className="material-symbols-outlined text-surface-tint" style={{ fontVariationSettings: "'FILL' 1" }}>event_busy</span>
            </div>
            <div className="text-display-lg font-display-lg text-surface-tint">{expiringSoonCount}</div>
          </div>
        </div>

        {/* Inventory Management (Main Table) - 8 Cols */}
        <div className="lg:col-span-8 glass-panel p-glass-padding rounded-xl flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-headline-md font-headline-md text-on-surface">Recent Inventory</h3>
            <button 
              onClick={() => setCurrentView('inventory')}
              className="text-label-md font-label-md text-primary-container hover:text-primary transition-colors flex items-center gap-1"
            >
              View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          
          <div className="overflow-auto flex-1 rounded-lg border border-white/40 glass-card-inner custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-high/60 sticky top-0 backdrop-blur-md z-10 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider border-b border-white/40">
                <tr>
                  <th className="p-3 font-semibold">SKU / Item</th>
                  <th className="p-3 font-semibold">Category</th>
                  <th className="p-3 font-semibold">Qty</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-body-md font-body-md divide-y divide-white/20">
                {recentItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-secondary">
                      No inventory items found. Add your first item!
                    </td>
                  </tr>
                ) : (
                  recentItems.map((item) => {
                    const isLowStock = item.quantity < item.threshold;
                    return (
                      <tr key={item.id} className="hover:bg-white/30 dark:hover:bg-white/5 transition-colors">
                        <td className="p-3">
                          <div className="font-medium text-on-surface">{item.name}</div>
                          <div className="text-label-sm text-secondary">{item.sku}</div>
                        </td>
                        <td className="p-3 text-secondary">{item.category}</td>
                        <td className="p-3 font-semibold">{item.quantity}</td>
                        <td className="p-3">
                          {isLowStock ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-primary-container/20 text-primary-container border border-primary-container/30">
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-[#4ade80]/20 text-[#166534] border border-[#4ade80]/30">
                              In Stock
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => setCurrentView('inventory')}
                            className="text-secondary hover:text-primary transition-colors p-1"
                            title="Edit Item"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Panel (Categories & Activity Feed) - 4 Cols */}
        <div className="lg:col-span-4 flex flex-col gap-gutter h-[500px]">
          
          {/* Categories Widget */}
          <div className="glass-panel p-glass-padding rounded-xl flex-1 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-headline-md font-headline-md text-on-surface">Categories</h3>
              <button 
                onClick={() => setCurrentView('categories')}
                className="text-label-sm font-label-sm text-primary-container hover:text-primary transition-colors"
              >
                View
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
              {categories.slice(0, 3).map(cat => (
                <div key={cat.id} className="p-3 rounded-lg border border-white/40 glass-card-inner flex justify-between items-center">
                  <div>
                    <h4 className="text-label-md font-bold text-on-surface">{cat.name}</h4>
                    <p className="text-label-sm text-secondary line-clamp-1">{cat.description}</p>
                  </div>
                  <span className="bg-primary-container/20 text-primary-container px-2 py-0.5 rounded text-[11px] font-bold">
                    {cat.itemCount} items
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log Widget */}
          <div className="glass-panel p-glass-padding rounded-xl flex-1 flex flex-col overflow-hidden">
            <h3 className="text-headline-md font-headline-md text-on-surface mb-3">Recent Logs</h3>
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
              {logs.slice(0, 3).map(log => (
                <div key={log.id} className="text-label-sm border-b border-white/20 pb-2 last:border-0">
                  <div className="flex justify-between font-bold text-primary">
                    <span>{log.action}</span>
                    <span className="text-[10px] text-secondary font-normal">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-on-surface-variant font-medium mt-0.5">{log.item}: {log.details}</p>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
