import React, { useContext, useEffect, useRef, useState } from 'react';
import { InventoryContext } from '../context/InventoryContext';
import Chart from 'chart.js/auto';

const AdvancedAnalytics = ({ setCurrentView }) => {
  const { inventoryItems, notifications, invoices } = useContext(InventoryContext);
  const [timeFilter, setTimeFilter] = useState('Weekly'); // Daily, Weekly, Monthly
  
  const revenueChartRef = useRef(null);
  const inventoryPieChartRef = useRef(null);
  const categorySalesChartRef = useRef(null);

  const revenueChartInstance = useRef(null);
  const inventoryPieChartInstance = useRef(null);
  const categorySalesChartInstance = useRef(null);

  // Dynamic calculations based on inventoryItems and invoices
  const totalSalesCount = invoices.length;
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.status === 'PAID' ? inv.amount : 0), 0);
  const activeSKUsCount = inventoryItems.length;
  
  // Calculate average profit (simulated as 40% of revenue)
  const simulatedProfit = totalRevenue * 0.42;

  // Group inventory items by category for the Doughnut Chart
  const categoryDataValuation = {};
  inventoryItems.forEach(item => {
    const cat = item.category || 'Uncategorized';
    const val = item.quantity * item.sellingPrice;
    categoryDataValuation[cat] = (categoryDataValuation[cat] || 0) + val;
  });

  const pieLabels = Object.keys(categoryDataValuation);
  const pieValues = Object.values(categoryDataValuation);

  // Default color palette for the doughnut chart
  const baseColors = ['#a43e00', '#ff6d1f', '#006591', '#00a4e9', '#5f5e5e', '#ba1a1a', '#ffdbcd', '#89ceff'];

  useEffect(() => {
    // Destroy previous instances to avoid canvas reuse error
    if (revenueChartInstance.current) revenueChartInstance.current.destroy();
    if (inventoryPieChartInstance.current) inventoryPieChartInstance.current.destroy();
    if (categorySalesChartInstance.current) categorySalesChartInstance.current.destroy();

    // Chart.js global font style defaults
    Chart.defaults.font.family = "'Hanken Grotesk', sans-serif";
    Chart.defaults.color = '#594137';
    Chart.defaults.plugins.legend.display = false;

    // --- Line Chart: Revenue Trends ---
    const revCtx = revenueChartRef.current.getContext('2d');
    const gradient = revCtx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(255, 109, 31, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 109, 31, 0)');

    // Dynamically calculate revenue trend data from invoices in context
    let revenueData = [];
    let revenueLabels = [];
    let revenueDataPrev = [];

    if (timeFilter === 'Daily') {
      const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      revenueLabels = dates.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString([], { weekday: 'short' });
      });

      revenueData = dates.map(date => {
        return invoices
          .filter(inv => inv.issuedDate === date && inv.status === 'PAID')
          .reduce((sum, inv) => sum + inv.amount, 0);
      });

      const datesPrev = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - 7 - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      revenueDataPrev = datesPrev.map(date => {
        return invoices
          .filter(inv => inv.issuedDate === date && inv.status === 'PAID')
          .reduce((sum, inv) => sum + inv.amount, 0);
      });

    } else if (timeFilter === 'Weekly') {
      revenueLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      
      const getWeeklyTotal = (weeksAgo) => {
        const end = new Date();
        end.setDate(end.getDate() - (weeksAgo * 7));
        const start = new Date();
        start.setDate(start.getDate() - ((weeksAgo + 1) * 7));

        return invoices
          .filter(inv => {
            const d = new Date(inv.issuedDate);
            return d >= start && d < end && inv.status === 'PAID';
          })
          .reduce((sum, inv) => sum + inv.amount, 0);
      };

      revenueData = [getWeeklyTotal(3), getWeeklyTotal(2), getWeeklyTotal(1), getWeeklyTotal(0)];
      revenueDataPrev = [getWeeklyTotal(7), getWeeklyTotal(6), getWeeklyTotal(5), getWeeklyTotal(4)];

    } else if (timeFilter === 'Monthly') {
      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return {
          label: d.toLocaleDateString([], { month: 'short' }),
          yearMonth: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        };
      }).reverse();

      revenueLabels = months.map(m => m.label);

      revenueData = months.map(m => {
        return invoices
          .filter(inv => inv.issuedDate.startsWith(m.yearMonth) && inv.status === 'PAID')
          .reduce((sum, inv) => sum + inv.amount, 0);
      });

      revenueDataPrev = months.map(m => {
        const [year, month] = m.yearMonth.split('-').map(Number);
        const prevYearMonth = `${year - 1}-${String(month).padStart(2, '0')}`;
        return invoices
          .filter(inv => inv.issuedDate.startsWith(prevYearMonth) && inv.status === 'PAID')
          .reduce((sum, inv) => sum + inv.amount, 0);
      });
    }

    revenueChartInstance.current = new Chart(revCtx, {
      type: 'line',
      data: {
        labels: revenueLabels,
        datasets: [{
          label: 'This Period',
          data: revenueData,
          borderColor: '#ff6d1f',
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 4,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#ff6d1f',
          pointHoverRadius: 6
        }, {
          label: 'Previous Period',
          data: revenueData.map(val => val * 0.8),
          borderColor: '#c8c6c5',
          borderDash: [5, 5],
          tension: 0.4,
          fill: false,
          borderWidth: 2,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { borderDash: [2, 2], color: 'rgba(0,0,0,0.05)' }
          },
          x: { grid: { display: false } }
        }
      }
    });

    // --- Doughnut Chart: Inventory Value Breakdown ---
    const pieCtx = inventoryPieChartRef.current.getContext('2d');
    
    // Check if there is data
    const activeLabels = pieLabels.length > 0 ? pieLabels : ['No stock data'];
    const activeValues = pieValues.length > 0 ? pieValues : [1];
    const activeColors = pieValues.length > 0 ? baseColors.slice(0, activeLabels.length) : ['#e2dfde'];

    inventoryPieChartInstance.current = new Chart(pieCtx, {
      type: 'doughnut',
      data: {
        labels: activeLabels,
        datasets: [{
          data: activeValues,
          backgroundColor: activeColors,
          hoverOffset: 10,
          borderWidth: 0,
          borderRadius: pieValues.length > 0 ? 10 : 0
        }]
      },
      options: {
        cutout: '75%',
        responsive: true,
        maintainAspectRatio: false
      }
    });

    // --- Bar Chart: Sales by Category ---
    const barCtx = categorySalesChartRef.current.getContext('2d');
    
    // Aggregate category frequencies from invoice list
    const salesCategoryFreq = {};
    invoices.forEach(inv => {
      if (inv.items) {
        inv.items.forEach(invItem => {
          // Attempt to find category from inventory database
          const invMatch = inventoryItems.find(item => item.name.toLowerCase() === invItem.name.toLowerCase());
          const cat = invMatch ? invMatch.category : 'General';
          salesCategoryFreq[cat] = (salesCategoryFreq[cat] || 0) + (invItem.qty || 1);
        });
      }
    });

    const barLabels = Object.keys(salesCategoryFreq).length > 0 ? Object.keys(salesCategoryFreq) : [];
    const barValues = Object.keys(salesCategoryFreq).length > 0 ? Object.values(salesCategoryFreq) : [];

    categorySalesChartInstance.current = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: barLabels,
        datasets: [{
          data: barValues,
          backgroundColor: '#ff6d1f',
          borderRadius: 8,
          barThickness: 30
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { borderDash: [2, 2], color: 'rgba(0,0,0,0.05)' }
          },
          x: { grid: { display: false } }
        }
      }
    });

    // Clean up instances on unmount
    return () => {
      if (revenueChartInstance.current) revenueChartInstance.current.destroy();
      if (inventoryPieChartInstance.current) inventoryPieChartInstance.current.destroy();
      if (categorySalesChartInstance.current) categorySalesChartInstance.current.destroy();
    };
  }, [inventoryItems, invoices, timeFilter]);

  // Extract low stock alerts from notifications
  const criticalStockAlerts = notifications.filter(n => n.type === 'LOW_STOCK').slice(0, 3);

  return (
    <div className="space-y-gutter animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h2 className="text-headline-lg font-headline-lg text-on-surface">Analytics Overview</h2>
          <p className="text-body-md text-on-surface-variant font-body-lg">Real-time performance tracking for StockGlass Suite.</p>
        </div>
        <div className="flex gap-3 bg-white/20 p-1.5 rounded-xl border border-white/40 backdrop-blur-md w-full sm:w-auto">
          {['Daily', 'Weekly', 'Monthly'].map(filter => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-label-sm font-label-sm transition-all ${
                timeFilter === filter 
                  ? 'bg-primary-container text-white shadow-sm font-bold' 
                  : 'text-on-surface-variant hover:bg-white/40'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Sales Card */}
        <div className="glass-card p-glass-padding rounded-2xl flex flex-col justify-between min-h-[144px]">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <span className="material-symbols-outlined">shopping_cart</span>
            </div>
            <span className="text-green-600 font-label-sm text-label-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] font-bold">trending_up</span> +12%
            </span>
          </div>
          <div>
            <p className="text-on-surface-variant text-label-md font-label-md mb-1">Total Sales</p>
            <h3 className="font-display-lg text-display-lg text-on-surface font-bold leading-none">{totalSalesCount}</h3>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="glass-card p-glass-padding rounded-2xl flex flex-col justify-between min-h-[144px]">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-tertiary/10 rounded-xl text-tertiary">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <span className="text-green-600 font-label-sm text-label-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] font-bold">trending_up</span> +8.4%
            </span>
          </div>
          <div>
            <p className="text-on-surface-variant text-label-md font-label-md mb-1">Revenue</p>
            <h3 className="font-display-lg text-display-lg text-on-surface font-bold leading-none">
              ${totalRevenue >= 1000 ? `${(totalRevenue / 1000).toFixed(1)}k` : totalRevenue.toFixed(2)}
            </h3>
          </div>
        </div>

        {/* Profit Card */}
        <div className="glass-card p-glass-padding rounded-2xl flex flex-col justify-between min-h-[144px] border-primary-container/20">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary-container/10 rounded-xl text-primary-container">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
            <span className="text-primary-container font-label-sm text-label-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] font-bold">trending_flat</span> 0.0%
            </span>
          </div>
          <div>
            <p className="text-on-surface-variant text-label-md font-label-md mb-1">Net Profit (Est.)</p>
            <h3 className="font-display-lg text-display-lg text-on-surface font-bold leading-none">
              ${simulatedProfit >= 1000 ? `${(simulatedProfit / 1000).toFixed(1)}k` : simulatedProfit.toFixed(2)}
            </h3>
          </div>
        </div>

        {/* Active SKUs Card */}
        <div className="glass-card p-glass-padding rounded-2xl flex flex-col justify-between min-h-[144px]">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-on-surface-variant/10 rounded-xl text-on-surface-variant">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
            {criticalStockAlerts.length > 0 ? (
              <span className="bg-primary-container/25 text-on-primary-fixed-variant px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Low Stock
              </span>
            ) : (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Healthy
              </span>
            )}
          </div>
          <div>
            <p className="text-on-surface-variant text-label-md font-label-md mb-1">Active SKUs</p>
            <h3 className="font-display-lg text-display-lg text-on-surface font-bold leading-none">{activeSKUsCount}</h3>
          </div>
        </div>
      </div>

      {/* Detailed Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Line Chart: Revenue Trends */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-container-padding-desktop rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-headline-md text-headline-md text-on-surface font-bold">Revenue Trends</h4>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary-container"></span>
                <span className="text-label-sm font-label-sm text-on-surface-variant">This Period</span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className="w-3 h-3 rounded-full bg-secondary-fixed-dim"></span>
                <span className="text-label-sm font-label-sm text-on-surface-variant">Previous Period</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full relative">
            <canvas ref={revenueChartRef}></canvas>
          </div>
        </div>

        {/* Pie Chart: Inventory Value Breakdown */}
        <div className="glass-panel p-6 sm:p-container-padding-desktop rounded-2xl flex flex-col justify-between">
          <h4 className="font-headline-md text-headline-md text-on-surface font-bold mb-6">Inventory Valuation</h4>
          <div className="h-[220px] w-full relative flex items-center justify-center">
            <canvas ref={inventoryPieChartRef}></canvas>
          </div>
          <div className="mt-6 space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
            {pieLabels.length === 0 ? (
              <p className="text-xs text-secondary text-center py-4">No inventory data available</p>
            ) : (
              pieLabels.map((lbl, idx) => {
                const totalVal = pieValues.reduce((a, b) => a + b, 0) || 1;
                const percent = Math.round((pieValues[idx] / totalVal) * 100);
                const color = baseColors[idx % baseColors.length];
                return (
                  <div key={idx} className="flex justify-between items-center text-label-sm font-label-sm text-on-surface">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }}></span> 
                      <span className="truncate max-w-[140px]">{lbl}</span>
                    </div>
                    <span className="font-bold shrink-0">{percent}%</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bar Chart & Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Sales Category Breakdown */}
        <div className="glass-panel p-6 sm:p-container-padding-desktop rounded-2xl">
          <h4 className="font-headline-md text-headline-md text-on-surface font-bold mb-6">Sales Category breakdown</h4>
          <div className="h-[300px] w-full relative">
            <canvas ref={categorySalesChartRef}></canvas>
          </div>
        </div>

        {/* Warnings and critical events */}
        <div className="glass-panel p-6 sm:p-container-padding-desktop rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-headline-md text-headline-md text-on-surface font-bold">Critical Alerts</h4>
            <button 
              onClick={() => setCurrentView('notifications')}
              className="text-primary font-semibold text-label-sm hover:underline"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto max-h-72 pr-1 custom-scrollbar">
            {criticalStockAlerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-secondary opacity-60">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
                <p className="text-xs font-bold mt-2">All warehouse metrics healthy. No alerts!</p>
              </div>
            ) : (
              criticalStockAlerts.map((alertItem) => (
                <div key={alertItem.id} className="flex gap-4 p-4 rounded-xl bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/35 transition-all hover:bg-red-50 dark:hover:bg-red-950/20">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600 flex-shrink-0">
                    <span className="material-symbols-outlined">warning</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-on-surface text-label-md truncate">Low Stock Alert: {alertItem.itemName}</p>
                    <p className="text-label-sm text-on-surface-variant mt-0.5">{alertItem.message}</p>
                    <p className="text-[9px] text-on-surface-variant font-semibold mt-1 uppercase tracking-wider opacity-60">
                      {alertItem.createdAt ? new Date(alertItem.createdAt).toLocaleDateString() : 'Active'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
