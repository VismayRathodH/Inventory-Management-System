import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InventoryContext } from '../context/InventoryContext';

const BundlesManagement = () => {
  const { packs, inventoryItems, addPack, updatePack, deletePack, addPackToCart, triggerAlert, groupInventoryItemsByName } = useContext(InventoryContext);
  const navigate = useNavigate();

  const totalAvailablePacks = packs.filter(p => p.status === 'In Stock').length;
  const fulfillmentRating = packs.length > 0 ? Math.round((totalAvailablePacks / packs.length) * 100) : 0;
  const efficiencyMsg = packs.length > 0 
    ? `Currently ${totalAvailablePacks} of ${packs.length} bundles are in stock and ready for immediate dispatch.` 
    : "Create your first pack bundle to monitor fulfillment readiness.";

  const packsAddedThisMonth = packs.filter(p => {
    if (p.id && p.id.startsWith('pack-')) {
      const ts = parseInt(p.id.split('-')[1]);
      if (!isNaN(ts)) {
        return (Date.now() - ts) < (30 * 24 * 3600 * 1000);
      }
    }
    return false;
  }).length;

  const [showModal, setShowModal] = useState(false);
  const [editingPackId, setEditingPackId] = useState(null);
  const [packToDelete, setPackToDelete] = useState(null);
  const [packName, setPackName] = useState('');
  const [packDescription, setPackDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('clean_hands');
  const [selectedItems, setSelectedItems] = useState([]); // Array of { item, qty }
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Add Item to currently drafting pack
  const handleAddItemToDraft = (item) => {
    const existing = selectedItems.find(i => i.item.id === item.id);
    if (existing) {
      setSelectedItems(prev => prev.map(i => i.item.id === item.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setSelectedItems(prev => [...prev, { item, qty: 1 }]);
    }
    setItemSearchQuery('');
    setShowItemDropdown(false);
  };

  const handleUpdateDraftQty = (itemId, delta) => {
    setSelectedItems(prev => 
      prev.map(i => {
        if (i.item.id === itemId) {
          const newQty = i.qty + delta;
          return newQty > 0 ? { ...i, qty: newQty } : null;
        }
        return i;
      }).filter(Boolean)
    );
  };

  const handleRemoveDraftItem = (itemId) => {
    setSelectedItems(prev => prev.filter(i => i.item.id !== itemId));
  };

  // Calculate estimated pack value based on item sell prices
  const estimatedValue = selectedItems.reduce((sum, itemRow) => {
    return sum + itemRow.item.sellingPrice * itemRow.qty;
  }, 0);

  const handleCreateOrUpdatePack = async (e) => {
    e.preventDefault();
    if (!packName.trim() || selectedItems.length === 0) {
      triggerAlert("Please provide a pack name and select at least one item.", "Validation Error");
      return;
    }

    const payload = {
      name: packName.trim(),
      description: packDescription.trim() || 'Custom inventory bundle pack.',
      icon: selectedIcon,
      items: selectedItems.map(row => {
        const earliestBatchId = row.item.batches && row.item.batches.length > 0 ? row.item.batches[0].id : row.item.id;
        return {
          inventory_item_id: earliestBatchId,
          qty: row.qty
        };
      })
    };

    try {
      if (editingPackId) {
        await updatePack(editingPackId, payload);
        triggerToast(`Pack "${payload.name}" updated successfully!`);
      } else {
        await addPack(payload);
        triggerToast(`Pack "${payload.name}" created successfully!`);
      }
      
      // Reset draft fields
      setPackName('');
      setPackDescription('');
      setSelectedIcon('clean_hands');
      setSelectedItems([]);
      setEditingPackId(null);
      setShowModal(false);
    } catch (err) {
      triggerAlert(err.message, "Error");
    }
  };

  const handleEditClick = (pack) => {
    setEditingPackId(pack.id);
    setPackName(pack.name);
    setPackDescription(pack.description);
    setSelectedIcon(pack.icon || 'clean_hands');
    
    // Map existing items to selectedItems structure
    const groupedItems = groupInventoryItemsByName(inventoryItems);
    const mappedItems = pack.items.map(packItem => {
      const match = groupedItems.find(inv => inv.name.toLowerCase() === packItem.name.toLowerCase());
      // In a robust system, backend should return the ID, which it now does as inventory_item_id
      const actualItem = match || { id: packItem.inventory_item_id, name: packItem.name, sellingPrice: 0, sku: 'N/A', batches: [{id: packItem.inventory_item_id}] };
      return { item: actualItem, qty: packItem.qty };
    });
    setSelectedItems(mappedItems);
    setShowModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!packToDelete) return;
    try {
      await deletePack(packToDelete.id);
      triggerToast(`Pack "${packToDelete.name}" deleted successfully.`);
      setPackToDelete(null);
    } catch (err) {
      triggerAlert(err.message, "Deletion Failed");
    }
  };

  // Filter items in modal search
  const filteredSearchItems = groupInventoryItemsByName(inventoryItems).filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
                          (item.sku && item.sku.toLowerCase().includes(itemSearchQuery.toLowerCase()));
    const alreadySelected = selectedItems.some(i => i.item.name.toLowerCase() === item.name.toLowerCase());
    return matchesSearch && !alreadySelected;
  });

  const handleAddPackToBill = (pack) => {
    addPackToCart(pack, navigate);
    triggerToast(`Added "${pack.name}" to sales bill.`);
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

      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h2 className="text-display-lg font-display-lg text-on-background">Packs &amp; Bundles</h2>
          <p className="text-on-surface-variant font-body-lg">Manage multi-item inventory sets and bulk logistics.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={() => {
              setEditingPackId(null);
              setPackName('');
              setPackDescription('');
              setSelectedIcon('clean_hands');
              setSelectedItems([]);
              setShowModal(true);
            }}
            className="w-full sm:w-auto bg-primary text-white text-label-md px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined">inventory_2</span>
            Create New Pack
          </button>
        </div>
      </div>

      {/* Bento Grid Analytics */}
      <div className="grid grid-cols-12 gap-gutter mb-gutter">
        <div className="col-span-12 md:col-span-8 glass-panel rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between overflow-hidden relative group bg-white/20 dark:bg-white/5">
          <div className="z-10 w-full sm:w-1/2 mb-4 sm:mb-0">
            <p className="text-on-surface-variant font-label-sm uppercase tracking-widest mb-1">Fulfillment Rating</p>
            <h3 className="font-display-lg text-display-lg text-primary mb-2 font-bold">{fulfillmentRating}%</h3>
            <p className="text-on-surface-variant text-label-sm">{efficiencyMsg}</p>
          </div>
          <div className="w-full sm:w-48 h-24 z-10">
            <div className="flex items-end gap-2 h-full justify-center sm:justify-end">
              <div className="w-8 bg-primary/20 h-[30%] rounded-t-lg"></div>
              <div className="w-8 bg-primary/30 h-[50%] rounded-t-lg"></div>
              <div className="w-8 bg-primary/40 h-[40%] rounded-t-lg"></div>
              <div className="w-8 bg-primary/60 h-[70%] rounded-t-lg"></div>
              <div className="w-8 bg-primary/80 h-[90%] rounded-t-lg"></div>
              <div className="w-8 bg-primary h-[85%] rounded-t-lg"></div>
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 glass-panel rounded-3xl p-8 bg-tertiary-container/10 border-tertiary-container/20 flex flex-col justify-center">
          <p className="text-on-tertiary-container font-label-sm uppercase tracking-widest mb-1">Active Bundles</p>
          <h3 className="font-display-lg text-display-lg text-tertiary mb-2 font-bold">{packs.length}</h3>
          <div className="flex items-center gap-1 text-on-tertiary-container text-label-md">
            <span className="material-symbols-outlined text-green-600 text-sm font-bold">trending_up</span>
            <span className="font-semibold">{packsAddedThisMonth > 0 ? `+${packsAddedThisMonth} created this month` : 'No new bundles this month'}</span>
          </div>
        </div>
      </div>

      {/* Packs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {packs.map(pack => (
          <div key={pack.id} className="glass-card rounded-3xl p-6 flex flex-col justify-between hover:scale-[1.01] hover:shadow-lg transition-all bg-white/20 dark:bg-white/5 border border-white/60 dark:border-white/10">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {pack.icon || 'package_2'}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                  pack.status === 'Low Stock' 
                    ? 'bg-primary-container/20 text-on-primary-fixed-variant' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {pack.status || 'In Stock'}
                </span>
              </div>
              <h4 className="font-headline-md text-headline-md text-on-surface font-bold mb-1">{pack.name}</h4>
              <p className="text-on-surface-variant text-label-sm mb-6 min-h-[40px]">{pack.description}</p>
              
              <div className="space-y-3 mb-8">
                {pack.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-white/40 pb-2 text-label-md text-on-surface">
                    <span className="text-on-surface-variant truncate pr-2">{item.name}</span>
                    <span className="font-bold text-primary shrink-0">x{item.qty}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => handleAddPackToCart(pack)}
                className="flex-1 py-3 rounded-xl font-label-md text-label-md bg-primary text-white flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-primary/10"
              >
                <span className="material-symbols-outlined text-lg">receipt_long</span>
                Add to Bill
              </button>
              <button 
                onClick={() => handleEditClick(pack)}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20 transition-colors text-on-surface"
                title="Edit Bundle"
              >
                <span className="material-symbols-outlined">edit</span>
              </button>
              <button 
                onClick={() => setPackToDelete(pack)}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-error/10 hover:bg-error/20 text-error transition-colors"
                title="Delete Bundle"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Bundle Pack Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-background/25 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
          <div className="glass-panel-high w-full max-w-4xl max-h-[92vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-[zoomIn_0.2s_ease-out] bg-white/95 dark:bg-zinc-900/95 border border-white/80">
            {/* Modal Header */}
            <div className="p-8 border-b border-white/40 flex justify-between items-center bg-white/20">
              <div>
                <h3 className="font-headline-lg text-headline-lg text-primary font-bold">{editingPackId ? 'Edit Pack' : 'Create New Pack'}</h3>
                <p className="text-on-surface-variant text-label-sm">Select inventory items and define quantities.</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-full hover:bg-error/10 text-error flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 flex flex-col md:flex-row gap-8 custom-scrollbar">
              {/* Left Column: Form details */}
              <div className="flex-1 space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Pack Name *</label>
                  <input 
                    type="text"
                    value={packName}
                    onChange={(e) => setPackName(e.target.value)}
                    placeholder="e.g. Hygiene Pack"
                    className="w-full bg-white/20 border-b-2 border-primary-container focus:ring-0 text-headline-md py-2 outline-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Description</label>
                  <textarea 
                    value={packDescription}
                    onChange={(e) => setPackDescription(e.target.value)}
                    placeholder="e.g. Standard quarterly office sanitization set."
                    rows="2"
                    className="w-full bg-white/20 border border-white/40 rounded-xl p-3 text-body-md outline-none focus:border-primary-container"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Selected Items *</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={itemSearchQuery}
                        onChange={(e) => { setItemSearchQuery(e.target.value); setShowItemDropdown(true); }}
                        onFocus={() => setShowItemDropdown(true)}
                        placeholder="Search & Add Item..." 
                        className="bg-white/30 dark:bg-white/5 border border-white/40 rounded-lg text-label-sm px-3 py-1 outline-none text-on-surface placeholder:text-secondary text-xs"
                      />
                      {showItemDropdown && itemSearchQuery && (
                        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-zinc-800 border border-white/40 shadow-xl rounded-xl w-64 max-h-48 overflow-y-auto z-50 custom-scrollbar">
                          {filteredSearchItems.length === 0 ? (
                            <p className="p-3 text-xs text-secondary text-center">No matching items</p>
                          ) : (
                            filteredSearchItems.map(item => (
                              <div 
                                key={item.id}
                                onClick={() => handleAddItemToDraft(item)}
                                className="p-2 hover:bg-primary/10 cursor-pointer text-xs flex justify-between items-center text-on-surface"
                              >
                                <span className="font-medium truncate pr-2">{item.name}</span>
                                <span className="opacity-60 font-mono text-[10px] shrink-0">${item.sellingPrice.toFixed(2)}</span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 min-h-[120px] max-h-60 overflow-y-auto custom-scrollbar pr-1">
                    {selectedItems.length === 0 ? (
                      <div className="border border-dashed border-white/40 rounded-2xl p-6 flex flex-col items-center justify-center opacity-40 text-on-surface">
                        <span className="material-symbols-outlined text-3xl">shopping_cart</span>
                        <p className="text-xs font-semibold mt-1">No items added to draft yet</p>
                      </div>
                    ) : (
                      selectedItems.map(row => (
                        <div key={row.item.id} className="flex items-center gap-4 bg-white/40 dark:bg-white/5 border border-white/20 p-3 rounded-2xl justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-label-md truncate text-on-surface">{row.item.name}</p>
                            <p className="text-[10px] text-on-surface-variant font-mono">
                              SKU: {row.item.sku} • Unit: ${row.item.sellingPrice.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <button 
                              type="button" 
                              onClick={() => handleUpdateDraftQty(row.item.id, -1)}
                              className="w-8 h-8 rounded-full border border-white/60 flex items-center justify-center hover:bg-white/40 text-on-surface transition-colors"
                            >
                              -
                            </button>
                            <span className="font-bold w-6 text-center text-on-surface text-label-md">{row.qty}</span>
                            <button 
                              type="button" 
                              onClick={() => handleUpdateDraftQty(row.item.id, 1)}
                              className="w-8 h-8 rounded-full border border-white/60 flex items-center justify-center hover:bg-white/40 text-on-surface transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleRemoveDraftItem(row.item.id)}
                            className="text-error/60 hover:text-error transition-colors pl-2"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Icon Selection & Estimate card */}
              <div className="w-full md:w-80 flex flex-col justify-between">
                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-3 block">Representing Icon</label>
                  <div className="grid grid-cols-4 gap-3 bg-white/40 dark:bg-white/5 border border-white/20 p-3 rounded-2xl mb-6">
                    {['clean_hands', 'laptop_mac', 'restaurant', 'vaccines', 'local_shipping', 'desktop_windows', 'coffee', 'medical_services'].map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setSelectedIcon(icon)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                          selectedIcon === icon 
                            ? 'bg-primary text-white shadow-md' 
                            : 'hover:bg-white/40 dark:hover:bg-white/10 text-on-surface-variant'
                        }`}
                      >
                        <span className="material-symbols-outlined">{icon}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-primary/5 rounded-3xl p-6 border border-primary/20">
                  <p className="text-label-sm text-on-surface-variant uppercase tracking-widest mb-2">Estimated Value</p>
                  <div className="flex justify-between items-end">
                    <span className="font-display-lg text-display-lg text-primary font-bold">${estimatedValue.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] mt-2 text-on-surface-variant italic">Calculated based on current unit retail prices</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 bg-white/40 dark:bg-white/5 border-t border-white/40 flex justify-end gap-4">
              <button 
                type="button"
                className="px-8 py-3 rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
                onClick={() => setShowModal(false)}
              >
                Discard Draft
              </button>
              <button 
                onClick={handleCreateOrUpdatePack}
                className="bg-primary text-white px-10 py-3 rounded-xl font-bold font-label-md text-label-md shadow-lg hover:shadow-primary/20 active:scale-95 transition-all"
              >
                {editingPackId ? 'Save Changes' : 'Create Pack'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {packToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-container-padding-mobile">
          <div className="absolute inset-0 bg-on-background/25 backdrop-blur-md" onClick={() => setPackToDelete(null)}></div>
          <div className="glass-panel-high w-full max-w-md rounded-3xl overflow-hidden relative flex flex-col animate-[zoomIn_0.2s_ease-out]">
            <div className="p-6 border-b border-white/60 dark:border-white/10 flex items-center gap-3 bg-error/10">
              <span className="material-symbols-outlined text-error">warning</span>
              <h2 className="text-headline-sm font-bold text-error">Confirm Deletion</h2>
            </div>
            <div className="p-6">
              <p className="text-body-md text-on-surface">Are you sure you want to delete bundle "<span className="font-bold">{packToDelete.name}</span>"?</p>
              <p className="text-label-sm text-on-surface-variant mt-2">This action cannot be undone.</p>
            </div>
            <div className="p-6 bg-white/10 border-t border-white/60 dark:border-white/10 flex justify-end gap-3">
              <button 
                onClick={() => setPackToDelete(null)}
                className="px-6 py-2 text-on-surface-variant font-bold hover:bg-white/40 dark:hover:bg-white/10 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
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

export default BundlesManagement;
