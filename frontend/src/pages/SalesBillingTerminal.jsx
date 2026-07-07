import React, { useContext, useState } from 'react';
import { InventoryContext } from '../context/InventoryContext';

const SalesBillingTerminal = ({ setCurrentView }) => {
  const { 
    inventoryItems, 
    categories, 
    cart, 
    addToCart, 
    updateCartQty, 
    removeFromCart, 
    clearCart, 
    addInvoice, 
    updateInventoryItem,
    packs,
    addPackToCart
  } = useContext(InventoryContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [toastMessage, setToastMessage] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [lastInvoice, setLastInvoice] = useState(null);

  // Filter items and bundles based on search and category
  const filteredItems = [
    ...inventoryItems.map(item => ({ ...item, isBundle: false })),
    ...packs.map(pack => ({ ...pack, isBundle: true, category: 'Bundles', sellingPrice: 0 }))
  ].filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.batchNumber && item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const subtotal = cart.reduce((acc, item) => acc + item.sellingPrice * item.qty, 0);
  const tax = subtotal * (taxPercentage / 100);
  const grandTotal = subtotal + tax;

  const triggerToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const handleFinalizeBill = async () => {
    if (cart.length === 0) return;

    try {
      // 1. Update quantities in inventory database via updateInventoryItem context calls
      for (const cartItem of cart) {
        const originalItem = inventoryItems.find(item => item.id === cartItem.id);
        if (originalItem) {
          // If virtual item, we don't have it in DB, skip PATCH
          if (typeof originalItem.id === 'string' && originalItem.id.startsWith('virtual')) continue;
          
          const newQty = Math.max(0, originalItem.quantity - cartItem.qty);
          await updateInventoryItem(originalItem.id, { quantity: newQty });
        }
      }

      // 2. Generate Invoice details
      const invoiceId = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
      const finalInvoice = {
        id: invoiceId,
        customerName: customerName.trim() || 'Walk-in Customer',
        customerEmail: customerEmail.trim() || 'customer@stockglass.com',
        issuedDate: new Date().toISOString().split('T')[0],
        status: 'PAID',
        paymentMethod: 'CASH',
        notes: '',
        totalQuantity: cart.reduce((acc, item) => acc + item.qty, 0),
        taxPercentage: taxPercentage,
        taxAmount: tax,
        subtotal: subtotal,
        amount: grandTotal,
        items: cart.map(i => ({ name: i.name, qty: i.qty, price: i.sellingPrice }))
      };

      // 3. Add to Invoices context state
      addInvoice(finalInvoice);
      setLastInvoice(finalInvoice);
      setShowInvoiceModal(true);

      // 4. Trigger Toast and Clear states
      triggerToast(`Successfully finalized invoice ${invoiceId}!`);
      clearCart();
      setCustomerName('');
      setCustomerEmail('');
    } catch (err) {
      alert(`Error finalizing order: ${err.message}`);
    }
  };

  const handleSaveDraft = () => {
    if (cart.length === 0) return;
    triggerToast("Order draft saved locally.");
  };

  return (
    <div className="flex flex-col xl:flex-row gap-gutter h-[calc(100vh-10rem)] animate-[fadeIn_0.3s_ease-out]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-inverse-surface text-inverse-on-surface px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 transition-all duration-300 z-[100] animate-bounce">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <span className="font-label-md text-label-md">{toastMessage}</span>
        </div>
      )}

      {/* Item Selection Panel */}
      <div className="flex-[1.6] flex flex-col gap-6 overflow-hidden h-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-headline-lg font-headline-lg text-primary">Sales Terminal</h2>
            <p className="text-on-surface-variant font-body-md">Real-time inventory synchronization active</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 sm:w-60">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-sm">search</span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search item, SKU, batch..." 
                className="w-full pl-9 pr-3 py-2 bg-white/30 dark:bg-white/5 border-none rounded-lg text-label-md text-on-surface focus:ring-primary focus:ring-2 placeholder:text-secondary"
              />
            </div>
            
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white/30 dark:bg-white/5 border-none rounded-lg text-label-md focus:ring-primary cursor-pointer text-on-surface py-2 pr-8 pl-3"
            >
              <option value="All">All Categories</option>
              <option value="Bundles">Bundles</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="p-2 glass-panel rounded-lg hover:bg-white/60 dark:hover:bg-white/10 transition-colors flex items-center justify-center text-primary"
              title="Reset Filters"
            >
              <span className="material-symbols-outlined">sync</span>
            </button>
          </div>
        </div>

        {/* Live Grid of Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4">
          {filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-secondary py-12">
              <span className="material-symbols-outlined text-5xl opacity-40">inventory_2</span>
              <p className="mt-2 text-label-md">No items found matching the filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredItems.map(item => {
                const inCart = cart.find(i => i.id === item.id);
                const currentQtyInCart = inCart ? inCart.qty : 0;
                const remainingStock = item.quantity - currentQtyInCart;
                const isOutOfStock = remainingStock <= 0;
                const isLowStock = item.quantity > 0 && item.quantity < item.threshold;

                return (
                  <div 
                    key={item.id}
                    onClick={() => { 
                      if (!isOutOfStock) {
                        if (item.isBundle) {
                          addPackToCart(item);
                        } else {
                          addToCart(item, 1); 
                        }
                      }
                    }}
                    className={`glass-panel p-4 rounded-xl flex flex-col gap-3 group cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all ${
                      isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="aspect-square rounded-lg overflow-hidden relative bg-surface-container">
                      {item.isBundle ? (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                          <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {item.icon || 'package_2'}
                          </span>
                        </div>
                      ) : item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-5xl text-secondary opacity-40">image</span>
                        </div>
                      )}
                      
                      <span className={`absolute top-2 right-2 px-2 py-1 rounded-full font-label-sm text-label-sm backdrop-blur-md ${
                        isOutOfStock 
                          ? 'bg-error/20 text-error' 
                          : isLowStock 
                            ? 'bg-primary-container/20 text-on-primary-fixed-variant' 
                            : 'bg-green-500/20 text-green-700'
                      }`}>
                        {item.isBundle ? 'Bundle' : (item.quantity === 0 
                          ? 'Out of stock' 
                          : `${remainingStock} remaining`)}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-label-md text-on-surface line-clamp-1">{item.name}</h3>
                        <p className="text-[11px] text-on-surface-variant font-mono">
                          {item.isBundle ? `Bundle (${item.items?.length || 0} items)` : (item.batchNumber ? `Batch: ${item.batchNumber}` : `SKU: ${item.sku}`)}
                        </p>
                      </div>
                      <div className="mt-2 flex justify-between items-end">
                        <span className="font-bold text-primary text-label-md">{item.isBundle ? 'Included Items' : `$${item.sellingPrice.toFixed(2)}`}</span>
                        {!isOutOfStock && (
                          <span className="material-symbols-outlined text-primary-container opacity-0 group-hover:opacity-100 transition-opacity">
                            add_circle
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart & Billing Panel */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full">
        <div className="glass-panel rounded-2xl flex-1 flex flex-col overflow-hidden shadow-xl border-white/85 bg-white/20 dark:bg-white/5">
          {/* Header */}
          <div className="p-6 border-b border-white/20 flex justify-between items-center bg-white/30 dark:bg-white/5">
            <div>
              <h2 className="font-headline-md text-headline-md leading-tight text-on-surface">Order Details</h2>
              <p className="text-on-surface-variant text-label-sm">Active Bill Terminal</p>
            </div>
            {cart.length > 0 && (
              <button 
                onClick={clearCart}
                className="p-2 glass-card rounded-lg text-error hover:bg-error/10 hover:text-error transition-colors"
                title="Clear Cart"
              >
                <span className="material-symbols-outlined">delete_sweep</span>
              </button>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-40 text-on-surface">
                <span className="material-symbols-outlined text-6xl">shopping_bag</span>
                <p className="mt-4 font-label-md">No items in terminal cart</p>
              </div>
            ) : (
              cart.map((item, index) => (
                <div key={item.id} className="cart-item glass-card p-4 rounded-xl flex items-center justify-between gap-4 transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-on-surface truncate text-label-md">{item.name}</h4>
                      <span className="font-bold text-primary text-label-md shrink-0">
                        ${(item.sellingPrice * item.qty).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      Unit: ${item.sellingPrice.toFixed(2)} • Batch: {item.batchNumber || 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-white/30 dark:bg-white/10 rounded-full px-2 py-1 select-none shrink-0 border border-white/20">
                    <button 
                      onClick={() => updateCartQty(item.id, -1)}
                      className="w-6 h-6 flex items-center justify-center hover:text-primary transition-colors text-on-surface"
                    >
                      <span className="material-symbols-outlined text-[18px]">remove</span>
                    </button>
                    <span className="font-label-md w-5 text-center text-on-surface">{item.qty}</span>
                    <button 
                      onClick={() => updateCartQty(item.id, 1)}
                      className="w-6 h-6 flex items-center justify-center hover:text-primary transition-colors text-on-surface"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Customer Metadata Fields */}
          {cart.length > 0 && (
            <div className="px-6 py-4 border-t border-white/20 bg-white/10 space-y-3">
              <p className="text-[11px] font-bold text-primary uppercase tracking-wider">Customer Details (Optional)</p>
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer Name"
                  className="w-full bg-white/20 border-b border-white/40 focus:border-primary focus:ring-0 rounded p-2 text-label-md outline-none"
                />
                <input 
                  type="email" 
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Customer Email"
                  className="w-full bg-white/20 border-b border-white/40 focus:border-primary focus:ring-0 rounded p-2 text-label-md outline-none"
                />
              </div>
            </div>
          )}

          {/* Pricing calculations */}
          <div className="p-6 bg-white/30 dark:bg-white/5 border-t border-white/20 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-on-surface-variant text-label-md">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-on-surface-variant text-label-md">
                <span>Tax Percentage (%)</span>
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={taxPercentage}
                  onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
                  className="w-20 bg-white/20 border-b border-white/40 focus:border-primary focus:ring-0 rounded p-1 text-right outline-none"
                />
              </div>
              <div className="flex justify-between text-on-surface-variant text-label-md">
                <span>Tax Amount</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/40">
                <span className="font-bold text-label-md text-on-surface">Grand Total</span>
                <span className="font-display-lg text-primary text-2xl font-bold">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={handleSaveDraft}
                disabled={cart.length === 0}
                className="px-4 py-3 glass-card rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-white/40 dark:hover:bg-white/10 transition-colors disabled:opacity-40 disabled:pointer-events-none text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">receipt</span> Save Draft
              </button>
              <button 
                onClick={handleFinalizeBill}
                disabled={cart.length === 0}
                className="px-4 py-3 bg-primary text-white rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                Finalize Bill <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Details Success Modal */}
      {showInvoiceModal && lastInvoice && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-background/25 backdrop-blur-md" onClick={() => setShowInvoiceModal(false)}></div>
          <div className="glass-panel-high w-full max-w-lg rounded-3xl overflow-hidden relative flex flex-col p-6 animate-in zoom-in duration-200 bg-white/95 dark:bg-zinc-900/95 border border-white/80">
            <div className="flex justify-between items-center pb-4 border-b border-white/40 mb-4">
              <div>
                <h3 className="font-headline-md text-headline-md font-bold text-primary">Invoice Finalized</h3>
                <p className="text-on-surface-variant text-[11px] font-mono">Invoice Ref: #{lastInvoice.id}</p>
              </div>
              <button 
                onClick={() => setShowInvoiceModal(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-error/15 text-error rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-label-md">
                <span className="text-on-surface-variant">Customer:</span>
                <span className="font-bold text-on-surface">{lastInvoice.customerName}</span>
              </div>
              <div className="flex justify-between text-label-md">
                <span className="text-on-surface-variant">Email:</span>
                <span className="text-on-surface font-mono">{lastInvoice.customerEmail}</span>
              </div>
              <div className="flex justify-between text-label-md">
                <span className="text-on-surface-variant">Date:</span>
                <span className="text-on-surface font-mono">{lastInvoice.issuedDate}</span>
              </div>
              
              <div className="border-t border-dashed border-white/40 pt-4">
                <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-2">Receipt Details</p>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {lastInvoice.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-label-md">
                      <span className="text-on-surface truncate">{it.name} <span className="opacity-60 text-xs">x{it.qty}</span></span>
                      <span className="font-semibold text-on-surface">${(it.price * it.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-white/20 pt-4 mt-4 text-label-sm space-y-1">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal:</span>
                  <span>${lastInvoice.subtotal?.toFixed(2) || (lastInvoice.amount - (lastInvoice.taxAmount || 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Tax ({lastInvoice.taxPercentage}%):</span>
                  <span>${lastInvoice.taxAmount?.toFixed(2) || '0.00'}</span>
                </div>
              </div>

              <div className="border-t border-white/40 pt-4 flex justify-between items-baseline mt-2">
                <span className="font-bold text-label-md text-on-surface">Total Paid:</span>
                <span className="font-display-lg text-primary text-xl font-bold">${lastInvoice.amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => {
                  alert(`Receipt ${lastInvoice.id} sent to print spool.`);
                  setShowInvoiceModal(false);
                }}
                className="px-5 py-2.5 rounded-xl border border-white/60 hover:bg-white/40 dark:hover:bg-white/10 text-on-surface font-semibold text-label-sm flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">print</span> Print Receipt
              </button>
              <button 
                onClick={() => setShowInvoiceModal(false)}
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

export default SalesBillingTerminal;
