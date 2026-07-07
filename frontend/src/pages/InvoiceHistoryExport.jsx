import React, { useContext, useState } from 'react';
import { InventoryContext } from '../context/InventoryContext';

const InvoiceHistoryExport = ({ setCurrentView }) => {
  const { invoices, triggerAlert } = useContext(InventoryContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Paid, Pending, Overdue
  const [sortOrder, setSortOrder] = useState('Recent First'); // Recent First, Oldest First, Amount (High-Low)
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const itemsPerPage = 8;

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Filter invoices
  let filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort invoices
  filteredInvoices.sort((a, b) => {
    if (sortOrder === 'Recent First') {
      return new Date(b.issuedDate) - new Date(a.issuedDate);
    }
    if (sortOrder === 'Oldest First') {
      return new Date(a.issuedDate) - new Date(b.issuedDate);
    }
    if (sortOrder === 'Amount (High-Low)') {
      return b.amount - a.amount;
    }
    return 0;
  });

  // Pagination math
  const totalInvoices = filteredInvoices.length;
  const totalPages = Math.ceil(totalInvoices / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);

  // Dynamic stats
  const totalReceivables = invoices
    .filter(i => i.status === 'PAID')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingCount = invoices.filter(i => i.status === 'PENDING').length;

  const handleExportCsv = () => {
    if (filteredInvoices.length === 0) {
      triggerAlert("No invoice records to export.", "Export Failed");
      return;
    }

    const headers = ['Invoice ID', 'Customer Name', 'Customer Email', 'Issued Date', 'Status', 'Amount ($)'];
    const rows = invoices.map(inv => [
      inv.id,
      `"${inv.customerName.replace(/"/g, '""')}"`,
      inv.customerEmail,
      inv.issuedDate,
      inv.status,
      inv.amount.toFixed(2)
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `StockGlass_Invoices_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast("Generating CSV spreadsheet download...");
  };

  return (
    <div className="space-y-gutter animate-[fadeIn_0.3s_ease-out]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-inverse-surface text-inverse-on-surface px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 transition-all duration-300 z-[100] animate-bounce">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <span className="font-label-md text-label-md">{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant/65 font-label-sm text-label-sm mb-2">
            <span onClick={() => setCurrentView('dashboard')} className="cursor-pointer hover:text-primary transition-colors">Dashboard</span>
            <span className="material-symbols-outlined text-[12px] opacity-70">chevron_right</span>
            <span className="text-primary font-bold">Export History</span>
          </nav>
          <h2 className="text-display-lg font-display-lg text-on-surface tracking-tight font-bold">Invoice History</h2>
          <p className="text-on-surface-variant font-body-md">Manage, filter, and bulk-export your recent financial transactions.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={handleExportCsv}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-label-md text-label-md shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
            Export to CSV
          </button>
        </div>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-gutter">
        <div className="glass-panel p-glass-padding rounded-3xl flex flex-col justify-center min-h-[112px] bg-white/20 dark:bg-white/5">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-1">Total Receivables</span>
          <div className="flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-primary font-bold">${totalReceivables.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-green-600 font-label-sm text-label-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> 12%
            </span>
          </div>
        </div>
        <div className="glass-panel p-glass-padding rounded-3xl flex flex-col justify-center min-h-[112px] border-l-4 border-l-primary/45 bg-white/20 dark:bg-white/5">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-1">Pending Invoices</span>
          <div className="flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-on-surface font-bold">{pendingCount}</span>
            <span className="text-on-surface-variant/60 font-label-sm text-label-sm">Active bills</span>
          </div>
        </div>
        <div className="glass-panel p-glass-padding rounded-3xl flex flex-col justify-center min-h-[112px] bg-white/20 dark:bg-white/5">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-1">Avg. Payment Time</span>
          <div className="flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-on-surface font-bold">4.2</span>
            <span className="text-on-surface-variant/60 font-label-sm text-label-sm">Business days</span>
          </div>
        </div>
      </div>

      {/* Table Filters Bar */}
      <div className="glass-card mb-gutter rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between bg-white/20 dark:bg-white/5 border border-white/60 dark:border-white/10">
        <div className="flex flex-wrap gap-4 items-center flex-1 min-w-[280px]">
          {/* Customer Search */}
          <div className="relative flex-1 max-w-sm min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-sm">search</span>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Filter by customer name, email or ID..."
              className="w-full pl-9 pr-3 py-2 bg-white/30 dark:bg-white/5 border-none rounded-lg text-label-md text-on-surface focus:ring-primary focus:ring-2 placeholder:text-secondary"
            />
          </div>

          {/* Status filter */}
          <select 
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-white/30 dark:bg-white/5 border-none rounded-lg text-label-md focus:ring-primary cursor-pointer text-on-surface py-2 pr-8 pl-3"
          >
            <option value="All">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Sort order filter */}
          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-white/30 dark:bg-white/5 border-none rounded-lg text-label-md focus:ring-primary cursor-pointer text-on-surface py-2 pr-8 pl-3"
          >
            <option>Recent First</option>
            <option>Oldest First</option>
            <option>Amount (High-Low)</option>
          </select>
        </div>
        <div className="text-label-sm font-semibold text-on-surface-variant">
          Showing {totalInvoices} Invoices
        </div>
      </div>

      {/* Invoices High-Translucency Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl bg-white/20 dark:bg-white/5 border border-white/60 dark:border-white/10 flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="glass-header border-b border-white/20">
              <tr className="text-on-surface-variant text-label-md">
                <th className="p-6 font-semibold">Invoice ID</th>
                <th className="p-6 font-semibold">Customer</th>
                <th className="p-6 font-semibold">Issued Date</th>
                <th className="p-6 font-semibold">Status</th>
                <th className="p-6 font-semibold">Amount</th>
                <th className="p-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/15 text-body-md text-on-surface">
              {currentInvoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-secondary">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                currentInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/10 transition-colors group">
                    <td className="p-6 font-bold text-label-md">#{inv.id}</td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {inv.customerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-label-md truncate">{inv.customerName}</span>
                          <span className="text-[11px] text-on-surface-variant truncate font-mono">{inv.customerEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-on-surface-variant font-mono">{inv.issuedDate}</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-label-sm font-semibold border ${
                        inv.status === 'PAID'
                          ? 'bg-green-500/10 text-green-700 border-green-500/20'
                          : inv.status === 'PENDING'
                            ? 'bg-primary-container/10 text-primary-container border-primary-container/20'
                            : 'bg-error/10 text-error border-error/20'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-6 font-bold text-primary">${inv.amount.toFixed(2)}</td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerAlert(`Sent print spool command for Invoice #${inv.id}`, "Print Spool");
                          }}
                          className="p-2 hover:bg-white/10 dark:hover:bg-white/5 rounded-lg text-on-surface-variant transition-colors"
                          title="Print Receipt"
                        >
                          <span className="material-symbols-outlined text-sm">print</span>
                        </button>
                        <button 
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-2 hover:bg-white/30 dark:hover:bg-white/10 rounded-lg text-on-surface-variant hover:text-primary transition-all"
                          title="View Details"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-6 bg-white/20 dark:bg-white/5 border-t border-white/20 flex justify-between items-center">
          <span className="text-label-sm text-on-surface-variant opacity-60">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/60 hover:bg-white/40 transition-colors disabled:opacity-30"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-all ${
                  currentPage === page 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'border border-white/60 hover:bg-white/40 text-on-surface'
                }`}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/60 hover:bg-white/40 transition-colors disabled:opacity-30"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Details Dialog Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-background/25 backdrop-blur-md" onClick={() => setSelectedInvoice(null)}></div>
          <div className="glass-panel-high w-full max-w-lg rounded-3xl overflow-hidden relative flex flex-col p-6 animate-in zoom-in duration-200 bg-white/95 dark:bg-zinc-900/95 border border-white/80">
            <div className="flex justify-between items-center pb-4 border-b border-white/40 mb-4">
              <div>
                <h3 className="font-headline-md text-headline-md font-bold text-primary">Invoice Details</h3>
                <p className="text-on-surface-variant text-[11px] font-mono">Invoice Reference ID: #{selectedInvoice.id}</p>
              </div>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="w-8 h-8 flex items-center justify-center hover:bg-error/15 text-error rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-label-md">
                <span className="text-on-surface-variant">Customer:</span>
                <span className="font-bold text-on-surface">{selectedInvoice.customerName}</span>
              </div>
              <div className="flex justify-between text-label-md">
                <span className="text-on-surface-variant">Email:</span>
                <span className="text-on-surface font-mono">{selectedInvoice.customerEmail}</span>
              </div>
              <div className="flex justify-between text-label-md">
                <span className="text-on-surface-variant">Date Issued:</span>
                <span className="text-on-surface font-mono">{selectedInvoice.issuedDate}</span>
              </div>
              <div className="flex justify-between text-label-md">
                <span className="text-on-surface-variant">Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  selectedInvoice.status === 'PAID'
                    ? 'bg-green-100 text-green-700'
                    : selectedInvoice.status === 'PENDING'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-red-100 text-red-700'
                }`}>{selectedInvoice.status}</span>
              </div>
              
              <div className="border-t border-dashed border-white/40 pt-4">
                <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-2">Itemized List</p>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {selectedInvoice.items ? (
                    selectedInvoice.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-label-md">
                        <span className="text-on-surface truncate pr-2">
                          {it.name} <span className="opacity-60 text-xs">x{it.qty}</span>
                        </span>
                        <span className="font-semibold text-on-surface">${(it.price * it.qty).toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-secondary italic">No item list stored for this historical record.</p>
                  )}
                </div>
              </div>

              <div className="border-t border-white/40 pt-4 flex justify-between items-baseline">
                <span className="font-bold text-label-md text-on-surface">Total Amount:</span>
                <span className="font-display-lg text-primary text-xl font-bold">${selectedInvoice.amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => {
                  triggerAlert(`Receipt sent to print spool.`, "Print Spool");
                  setSelectedInvoice(null);
                }}
                className="px-5 py-2.5 rounded-xl border border-white/60 hover:bg-white/40 dark:hover:bg-white/10 text-on-surface font-semibold text-label-sm flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">print</span> Print/PDF
              </button>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="px-6 py-2.5 bg-primary text-white font-semibold text-label-sm rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md shadow-primary/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceHistoryExport;
