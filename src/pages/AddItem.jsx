import React, { useState, useContext, useEffect } from 'react';
import { InventoryContext } from '../context/InventoryContext';

const AddItem = ({ setCurrentView }) => {
  const { categories, addInventoryItem } = useContext(InventoryContext);
  
  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [threshold, setThreshold] = useState('10');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [image, setImage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-fill category selection if available
  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].name);
    }
  }, [categories, category]);

  // Auto-fill batch number initially
  useEffect(() => {
    setBatchNumber(`BATCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim() || !category || !quantity || !costPrice || !sellingPrice || !batchNumber.trim()) {
      setErrorMsg('Please fill in all required fields (*).');
      return;
    }

    const payload = {
      name: name.trim(),
      category: category,
      quantity: Number(quantity),
      costPrice: Number(costPrice),
      sellingPrice: Number(sellingPrice),
      threshold: Number(threshold),
      batchNumber: batchNumber.trim(),
      expiryDate: expiryDate,
      image: image.trim()
    };

    try {
      addInventoryItem(payload);
      setCurrentView('inventory');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-[fadeIn_0.3s_ease-out]">
      {/* Header and Breadcrumbs */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-headline-lg font-headline-lg text-on-background mb-2">New Inventory Item</h2>
          <p className="text-body-md font-body-md text-on-surface-variant">Enter details to add a new product to your inventory tracking.</p>
        </div>
        <div className="flex items-center gap-3 text-label-md font-label-md">
          <span onClick={() => setCurrentView('inventory')} className="text-secondary cursor-pointer hover:text-primary transition-colors">Inventory</span>
          <span className="material-symbols-outlined text-secondary text-sm">chevron_right</span>
          <span className="text-primary font-bold">Add Item</span>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 bg-error/10 border border-error/25 text-error p-4 rounded-lg flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Form Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left Column (Main Form) */}
        <div className="lg:col-span-8 space-y-gutter">
          {/* Basic Info Panel */}
          <div className="glass-panel rounded-xl p-glass-padding">
            <h3 className="text-headline-md font-headline-md text-on-background mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span> 
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Item Name */}
              <div className="md:col-span-2">
                <label className="block text-label-md font-label-md text-on-surface-variant mb-2" htmlFor="itemName">Item Name *</label>
                <input 
                  id="itemName"
                  name="itemName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Organic Arabica Coffee Beans"
                  required
                  className="glass-input w-full text-body-md font-body-md text-on-background py-2 px-3 placeholder-on-surface-variant/50"
                />
              </div>

              {/* Category */}
              <div className="md:col-span-2">
                <label className="block text-label-md font-label-md text-on-surface-variant mb-2" htmlFor="category">Category *</label>
                <select 
                  id="category"
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="glass-input w-full text-body-md font-body-md text-on-background py-2 px-3 appearance-none bg-transparent"
                >
                  <option disabled value="">Select a category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing & Stock Panel */}
          <div className="glass-panel rounded-xl p-glass-padding">
            <h3 className="text-headline-md font-headline-md text-on-background mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">payments</span> 
              Pricing &amp; Stock
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quantity */}
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-2" htmlFor="quantity">Quantity *</label>
                <input 
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  required
                  className="glass-input w-full text-body-md font-body-md text-on-background py-2 px-3"
                />
              </div>

              {/* Threshold */}
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-2" htmlFor="threshold">Threshold Quantity *</label>
                <input 
                  id="threshold"
                  name="threshold"
                  type="number"
                  min="0"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  placeholder="10"
                  required
                  className="glass-input w-full text-body-md font-body-md text-on-background py-2 px-3"
                />
                <p className="text-label-sm font-label-sm text-secondary mt-1">Alerts triggered below this level.</p>
              </div>

              {/* Cost Price */}
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-2" htmlFor="costPrice">Cost Price *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant/70">$</span>
                  <input 
                    id="costPrice"
                    name="costPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="0.00"
                    required
                    className="glass-input w-full text-body-md font-body-md text-on-background py-2 pl-8 pr-3"
                  />
                </div>
              </div>

              {/* Selling Price */}
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-2" htmlFor="sellingPrice">Selling Price *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant/70">$</span>
                  <input 
                    id="sellingPrice"
                    name="sellingPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="0.00"
                    required
                    className="glass-input w-full text-body-md font-body-md text-on-background py-2 pl-8 pr-3"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar Panels) */}
        <div className="lg:col-span-4 space-y-gutter">
          {/* Image URL Input Panel (enhanced) */}
          <div className="glass-panel rounded-xl p-glass-padding flex flex-col gap-4">
            <h3 className="text-headline-md font-headline-md text-on-background flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">image</span> 
              Product Image
            </h3>
            
            <div className="flex flex-col gap-2">
              <label className="block text-label-md font-label-md text-on-surface-variant" htmlFor="imageUrl">Image URL</label>
              <input 
                id="imageUrl"
                name="imageUrl"
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/image.png"
                className="glass-input w-full text-body-md font-body-md text-on-background py-2 px-3"
              />
            </div>
            
            <div className="border-2 border-dashed border-outline-variant/60 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-3xl text-primary opacity-60">add_photo_alternate</span>
              <p className="text-label-sm font-label-sm text-on-surface-variant mt-2">Mock file upload (drag items here)</p>
            </div>
          </div>

          {/* Batch Details Panel */}
          <div className="glass-panel rounded-xl p-glass-padding">
            <h3 className="text-headline-md font-headline-md text-on-background mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">tag</span> 
              Batch Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-2" htmlFor="batchNumber">Batch Number *</label>
                <input 
                  id="batchNumber"
                  name="batchNumber"
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g., BATCH-2026-XYZ"
                  required
                  className="glass-input w-full text-body-md font-body-md text-on-background py-2 px-3"
                />
              </div>

              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-2" htmlFor="expiryDate">Expiry Date</label>
                <input 
                  id="expiryDate"
                  name="expiryDate"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="glass-input w-full text-body-md font-body-md text-on-background py-2 px-3"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="lg:col-span-12 mt-4 flex justify-end gap-4 border-t border-white/20 pt-6">
          <button 
            type="button"
            onClick={() => setCurrentView('inventory')}
            className="px-6 py-3 rounded-lg text-label-md font-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors border border-outline-variant/30 glass-panel"
          >
            Cancel
          </button>
          
          <button 
            type="submit"
            className="px-8 py-3 rounded-lg bg-primary-container text-white text-label-md font-label-md shadow-md hover:bg-primary transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-primary/50"
          >
            Add Record
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddItem;
