import React, { useContext, useState, useEffect } from 'react';
import { InventoryContext } from '../context/InventoryContext';

const InventoryList = ({ setCurrentView }) => {
  const { inventoryItems, categories, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useContext(InventoryContext);

  // Filter and view states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // All, Critical, Archived
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Name (A-Z)');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal forms state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // Null for adding, item object for editing
  const [successMsg, setSuccessMsg] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null);

  // Form inputs
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formQty, setFormQty] = useState('');
  const [formThreshold, setFormThreshold] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formSell, setFormSell] = useState('');
  const [formBatch, setFormBatch] = useState('');
  const [formExpiry, setFormExpiry] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formError, setFormError] = useState('');

  // Handle edit fill
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.categoryId ? item.categoryId.toString() : '');
    setFormQty(item.quantity.toString());
    setFormThreshold(item.threshold.toString());
    setFormCost(item.costPrice.toString());
    setFormSell(item.sellingPrice.toString());
    setFormBatch(item.batchNumber);
    setFormExpiry(item.expiryDate || '');
    setFormImage(item.image || '');
    setFormError('');
    setModalOpen(true);
  };

  // Removed handleOpenAdd as we now navigate to the Add Item page

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formName || !formCategory || !formQty || !formCost || !formSell || !formBatch) {
      setFormError('Please fill in all required fields (*).');
      return;
    }

    const payload = {
      name: formName,
      category: formCategory,
      quantity: Number(formQty),
      costPrice: Number(formCost),
      sellingPrice: Number(formSell),
      threshold: Number(formThreshold),
      batchNumber: formBatch,
      expiryDate: formExpiry || null,
      image: formImage
    };

    try {
      if (editingItem) {
        await updateInventoryItem(editingItem.id, payload);
        setSuccessMsg(`"${formName}" updated successfully.`);
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        await addInventoryItem(payload);
      }
      handleCloseModal();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDelete = (id, name) => {
    setItemToDelete({ id, name });
  };

  // 1. Apply Search and Tab Filters
  let filteredItems = inventoryItems.filter(item => {
    // Search query
    const matchSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;

    // Quick filters: All, Critical, Archived
    if (activeTab === 'Critical') {
      return item.quantity < item.threshold;
    }
    if (activeTab === 'Archived') {
      return item.quantity === 0;
    }
    return true; // All
  });

  // 2. Apply Category Dropdown Filter
  if (selectedCategory !== 'All') {
    filteredItems = filteredItems.filter(item => item.category.toLowerCase() === selectedCategory.toLowerCase());
  }

  // 3. Apply Sorting
  filteredItems.sort((a, b) => {
    if (sortBy === 'Name (A-Z)') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'Qty (High-Low)') {
      return b.quantity - a.quantity;
    }
    if (sortBy === 'Price') {
      return b.sellingPrice - a.sellingPrice;
    }
    if (sortBy === 'Expiry') {
      if (!a.expiryDate) return 1;
      if (!b.expiryDate) return -1;
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    }
    return 0;
  });

  // 4. Pagination math
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  // Dynamic quick metrics
  const totalSKUs = inventoryItems.length;
  const totalVol = inventoryItems.reduce((acc, i) => acc + i.quantity, 0);
  const criticalItems = inventoryItems.filter(i => i.quantity < i.threshold).length;
  const expiredItems = inventoryItems.filter(i => i.expiryStatus === 'Expired').length;

  // Expiry styling selector
  const getExpiryStyle = (status, date) => {
    if (!date) return { color: 'opacity-40', text: 'N/A', dot: 'bg-on-surface-variant opacity-40' };
    if (status === 'Expired') return { color: 'text-error font-bold', text: 'Expired', dot: 'bg-error shadow-[0_0_8px_rgba(186,26,26,0.5)]' };
    if (status === 'Expiring in 7 days') return { color: 'text-primary font-bold', text: 'Expires soon', dot: 'bg-primary shadow-[0_0_8px_rgba(255,109,31,0.5)]' };
    if (status === 'Expiring in 30 days') return { color: 'text-tertiary font-medium', text: 'Expiring 30d', dot: 'bg-tertiary shadow-[0_0_8px_rgba(0,101,145,0.5)]' };
    
    // Parse nice date
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return { 
      color: 'text-on-surface-variant', 
      text: `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`, 
      dot: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' 
    };
  };

  return (
    <div className="space-y-gutter animate-[fadeIn_0.3s_ease-out] relative">
      
      {successMsg && (
        <div className="absolute top-0 right-0 z-50 bg-[#4ade80]/10 border border-[#4ade80]/30 text-[#166534] dark:text-[#4ade80] p-4 rounded-lg flex items-center gap-2 shadow-lg mb-4">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Header and Quick Navigation */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-headline-lg font-headline-lg text-on-background mb-2">Inventory Management</h2>
          <p className="text-body-md font-body-md text-on-surface-variant">Configure product details and monitor storage items.</p>
        </div>
        <div className="flex items-center gap-3 text-label-md font-label-md">
          <span onClick={() => setCurrentView('dashboard')} className="text-secondary cursor-pointer hover:text-primary transition-colors">Dashboard</span>
          <span className="material-symbols-outlined text-secondary text-sm">chevron_right</span>
          <span className="text-primary font-bold">Inventory</span>
        </div>
      </div>

      {/* Dynamic Summary Cards (Original empty containers styled dynamically) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-6">
        <div className="glass-panel p-4 rounded-xl flex flex-col justify-between h-24">
          <span className="text-label-sm font-label-sm text-secondary uppercase">Active SKUs</span>
          <span className="text-headline-md font-bold text-primary">{totalSKUs} records</span>
        </div>
        <div className="glass-panel p-4 rounded-xl flex flex-col justify-between h-24">
          <span className="text-label-sm font-label-sm text-secondary uppercase">Stock Volume</span>
          <span className="text-headline-md font-bold text-on-surface">{totalVol.toLocaleString()} units</span>
        </div>
        <div className="glass-panel p-4 rounded-xl flex flex-col justify-between h-24">
          <span className="text-label-sm font-label-sm text-secondary uppercase">Low Stock</span>
          <span className={`text-headline-md font-bold ${criticalItems > 0 ? 'text-primary-container' : 'text-on-surface'}`}>{criticalItems} alerts</span>
        </div>
        <div className="glass-panel p-4 rounded-xl flex flex-col justify-between h-24">
          <span className="text-label-sm font-label-sm text-secondary uppercase">Expired</span>
          <span className={`text-headline-md font-bold ${expiredItems > 0 ? 'text-error' : 'text-on-surface'}`}>{expiredItems} batches</span>
        </div>
      </div>

      {/* Main List Section */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-sm flex flex-col">
        
        {/* Filters Header */}
        <div className="p-6 bg-white/20 dark:bg-white/5 border-b border-white/60 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-headline-md font-headline-md text-primary hidden md:block">Live Inventory</h2>
            
            {/* Local Search Bar */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">search</span>
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input pl-10 pr-4 py-2 rounded-lg text-body-md font-body-md text-on-surface placeholder:text-secondary focus:ring-2 focus:ring-primary/50 w-[180px] sm:w-[240px] transition-all" 
                placeholder="Search..." 
                type="text"
              />
            </div>

            {/* Quick stock warning tabs */}
            <div className="hidden lg:flex items-center bg-surface-container-highest/50 rounded-lg p-1">
              {['All', 'Critical', 'Archived'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-1.5 text-label-md rounded-md transition-all ${
                    activeTab === tab 
                      ? 'bg-white dark:bg-inverse-surface dark:text-inverse-on-surface shadow-sm font-bold' 
                      : 'text-on-surface-variant hover:bg-white/40 dark:hover:bg-white/10 transition-colors'
                  }`}
                >
                  {tab === 'All' ? 'All Stock' : tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Category Dropdown Filter */}
            <select 
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white/30 dark:bg-white/5 border-none rounded-lg text-label-md focus:ring-primary cursor-pointer text-on-surface py-2 pr-8 pl-3"
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>

            {/* Sort Selector */}
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/30 dark:bg-white/5 border-none rounded-lg text-label-md focus:ring-primary cursor-pointer text-on-surface py-2 pr-8 pl-3"
            >
              <option>Sort: Name (A-Z)</option>
              <option>Sort: Qty (High-Low)</option>
              <option>Sort: Price</option>
              <option>Sort: Expiry</option>
            </select>

            {/* Initialize Item Trigger */}
            <button 
              onClick={() => setCurrentView('add_item')}
              className="p-2 glass-panel rounded-lg hover:bg-white/60 dark:hover:bg-white/10 transition-colors flex items-center justify-center text-primary"
              title="Initialize New Item"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white/40 dark:bg-white/5 text-on-surface-variant text-label-md border-b border-white/60 dark:border-white/10">
                <th className="px-6 py-4 font-semibold">Item Name</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Batch No.</th>
                <th className="px-6 py-4 font-semibold text-center">Quantity</th>
                <th className="px-6 py-4 font-semibold">Cost / Selling</th>
                <th className="px-6 py-4 font-semibold">Expiry Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-secondary">
                    No matching inventory items found.
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => {
                  const isLow = item.quantity < item.threshold;
                  const expDetails = getExpiryStyle(item.expiryStatus, item.expiryDate);

                  return (
                    <tr key={item.id} className={`hover:bg-white/30 dark:hover:bg-white/5 transition-colors group ${isLow ? 'bg-error-container/5' : ''}`}>
                      {/* Name with Image Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container border border-white/60 dark:border-white/10 flex items-center justify-center">
                            {item.image ? (
                              <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
                            ) : (
                              <span className="material-symbols-outlined text-secondary opacity-60">image</span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-on-surface">{item.name}</p>
                            <p className="text-label-sm opacity-60">SKU: {item.sku}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category badge */}
                      <td className="px-6 py-4">
                        <span className="bg-tertiary/10 text-tertiary px-3 py-1 rounded-full text-label-sm font-semibold">
                          {item.category}
                        </span>
                      </td>

                      {/* Batch number */}
                      <td className="px-6 py-4 font-mono text-label-sm">{item.batchNumber}</td>

                      {/* Quantity */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`text-body-md font-bold ${isLow ? 'text-error' : 'text-on-surface'}`}>{item.quantity}</span>
                          {isLow ? (
                            <span className="text-[10px] text-error font-extrabold uppercase">Low Stock</span>
                          ) : (
                            <span className="text-[10px] text-on-surface-variant opacity-60 font-bold uppercase">Threshold: {item.threshold}</span>
                          )}
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-on-surface font-bold">${item.costPrice.toFixed(2)}</span>
                          <span className="text-label-sm opacity-60">Sell: ${item.sellingPrice.toFixed(2)}</span>
                        </div>
                      </td>

                      {/* Expiry */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${expDetails.dot}`}></div>
                          <span className={`text-label-sm ${expDetails.color}`}>{expDetails.text}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button 
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 hover:text-primary transition-colors text-secondary dark:text-secondary-fixed-dim"
                            title="Edit Record"
                          >
                            <span className="material-symbols-outlined text-md">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-2 hover:text-error transition-colors text-secondary dark:text-secondary-fixed-dim"
                            title="Delete Record"
                          >
                            <span className="material-symbols-outlined text-md">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-6 bg-white/20 dark:bg-white/5 border-t border-white/60 dark:border-white/10 flex items-center justify-between">
          <span className="text-label-sm opacity-60">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
          </span>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/40 dark:hover:bg-white/10 transition-colors disabled:opacity-40"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-all ${
                  currentPage === page 
                    ? 'bg-primary text-on-primary shadow-sm' 
                    : 'hover:bg-white/40 dark:hover:bg-white/10'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/40 dark:hover:bg-white/10 transition-colors disabled:opacity-40"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal - Initialize New Item (Form) */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-container-padding-mobile">
          {/* Backdrop Overlay */}
          <div className="absolute inset-0 bg-on-background/25 backdrop-blur-md" onClick={handleCloseModal}></div>
          
          {/* Modal Container */}
          <div className="glass-panel-high w-full max-w-4xl max-h-[92vh] rounded-3xl overflow-hidden relative flex flex-col animate-[zoomIn_0.2s_ease-out]">
            <div className="p-8 border-b border-white/60 dark:border-white/10 flex items-center justify-between bg-white/20">
              <div>
                <h2 className="text-headline-md font-headline-md text-primary">
                  {editingItem ? 'Edit Inventory Record' : 'Initialize New Item'}
                </h2>
                <p className="text-label-sm text-on-surface-variant">Configure product details and warehouse allocation.</p>
              </div>
              <button 
                onClick={handleCloseModal}
                className="w-10 h-10 flex items-center justify-center hover:bg-error/10 rounded-full text-error transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Protocol hint banner */}
            <div className="bg-primary/5 px-8 py-3 flex items-center gap-3 border-b border-primary/10">
              <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
              <p className="text-[11px] font-bold text-primary uppercase tracking-tight">System Protocol FR-INV-2: Unique Batch or Expiry dates will auto-generate independent inventory records.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8 custom-scrollbar">
              {formError && (
                <div className="col-span-full bg-error/10 border border-error/25 text-error p-3 rounded-lg text-label-sm font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {formError}
                </div>
              )}

              {/* Left Column */}
              <div className="space-y-6">
                {/* Item Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-semibold text-on-surface-variant">Item Name *</label>
                  <input 
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. ErgoPulse Mouse G2" 
                    required 
                    type="text" 
                    className="glass-input p-3 text-body-md"
                  />
                </div>

                {/* Grid Category & Quantity */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-label-md font-semibold text-on-surface-variant">Category *</label>
                    <select 
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      required
                      className="glass-input p-3 text-body-md appearance-none bg-transparent"
                    >
                      <option disabled value="">Select...</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-label-md font-semibold text-on-surface-variant">Quantity *</label>
                    <input 
                      value={formQty}
                      onChange={(e) => setFormQty(e.target.value)}
                      placeholder="0" 
                      min="0"
                      required 
                      type="number" 
                      className="glass-input p-3 text-body-md"
                    />
                  </div>
                </div>

                {/* Grid Cost & Selling */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-label-md font-semibold text-on-surface-variant">Cost Price ($) *</label>
                    <input 
                      value={formCost}
                      onChange={(e) => setFormCost(e.target.value)}
                      placeholder="0.00" 
                      min="0"
                      step="0.01"
                      required 
                      type="number" 
                      className="glass-input p-3 text-body-md"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-label-md font-semibold text-on-surface-variant">Selling Price ($) *</label>
                    <input 
                      value={formSell}
                      onChange={(e) => setFormSell(e.target.value)}
                      placeholder="0.00" 
                      min="0"
                      step="0.01"
                      required 
                      type="number" 
                      className="glass-input p-3 text-body-md"
                    />
                  </div>
                </div>

                {/* Threshold */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-semibold text-on-surface-variant">Low Stock Threshold *</label>
                  <input 
                    value={formThreshold}
                    onChange={(e) => setFormThreshold(e.target.value)}
                    placeholder="5" 
                    min="0"
                    required 
                    type="number" 
                    className="glass-input p-3 text-body-md"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Batch Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-semibold text-on-surface-variant">Batch Number *</label>
                  <input 
                    value={formBatch}
                    onChange={(e) => setFormBatch(e.target.value)}
                    placeholder="e.g. B-2024-001" 
                    required 
                    type="text" 
                    className="glass-input p-3 text-body-md"
                  />
                </div>

                {/* Expiry Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-semibold text-on-surface-variant">Expiry Date</label>
                  <input 
                    value={formExpiry}
                    onChange={(e) => setFormExpiry(e.target.value)}
                    type="date" 
                    className="glass-input p-3 text-body-md"
                  />
                </div>

                {/* Product Image URL */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-semibold text-on-surface-variant">Product Image URL</label>
                  <input 
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://example.com/image.png" 
                    type="text" 
                    className="glass-input p-3 text-body-md"
                  />
                </div>

                {/* Drag and Drop Visual Mockup */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-md font-semibold text-on-surface-variant opacity-60">Upload Image File</label>
                  <div className="border-2 border-dashed border-white/60 dark:border-white/10 rounded-2xl h-28 flex flex-col items-center justify-center gap-1 hover:bg-white/10 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                    <span className="material-symbols-outlined text-2xl opacity-40 group-hover:text-primary transition-all">cloud_upload</span>
                    <span className="text-label-sm opacity-60">Mock upload (drag files here)</span>
                  </div>
                </div>
              </div>
              
              {/* Footer actions */}
              <div className="col-span-full border-t border-white/60 dark:border-white/10 pt-6 flex justify-end gap-4 bg-white/10 -m-8 p-8 mt-2">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-8 py-3 text-on-surface-variant font-bold hover:bg-white/40 dark:hover:bg-white/10 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-10 py-3 bg-primary text-on-primary font-bold rounded-xl shadow-lg hover:shadow-primary/30 hover:translate-y-[-2px] active:translate-y-[1px] transition-all"
                >
                  {editingItem ? 'Save Changes' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-container-padding-mobile">
          <div className="absolute inset-0 bg-on-background/25 backdrop-blur-md" onClick={() => setItemToDelete(null)}></div>
          <div className="glass-panel-high w-full max-w-md rounded-3xl overflow-hidden relative flex flex-col animate-[zoomIn_0.2s_ease-out]">
            <div className="p-6 border-b border-white/60 dark:border-white/10 flex items-center gap-3 bg-error/10">
              <span className="material-symbols-outlined text-error">warning</span>
              <h2 className="text-headline-sm font-bold text-error">Confirm Deletion</h2>
            </div>
            <div className="p-6">
              <p className="text-body-md text-on-surface">Are you sure you want to delete batch record for "<span className="font-bold">{itemToDelete.name}</span>"?</p>
              <p className="text-label-sm text-on-surface-variant mt-2">This action cannot be undone.</p>
            </div>
            <div className="p-6 bg-white/10 border-t border-white/60 dark:border-white/10 flex justify-end gap-3">
              <button 
                onClick={() => setItemToDelete(null)}
                className="px-6 py-2 text-on-surface-variant font-bold hover:bg-white/40 dark:hover:bg-white/10 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  try {
                    await deleteInventoryItem(itemToDelete.id);
                    setItemToDelete(null);
                  } catch (err) {
                    alert(err.message);
                  }
                }}
                className="px-6 py-2 bg-error text-white font-bold rounded-xl shadow-lg hover:shadow-error/30 hover:translate-y-[-2px] active:translate-y-[1px] transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryList;
