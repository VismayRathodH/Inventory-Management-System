import React, { useContext, useState } from 'react';
import { InventoryContext } from '../context/InventoryContext';

const CategoryList = ({ setCurrentView }) => {
  const { categories, deleteCategory, inventoryItems } = useContext(InventoryContext);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null);

  // No local search filter needed here anymore
  const filteredCategories = categories;

  // Compute metric parameters
  const totalCategoriesCount = categories.length;
  
  // Find category with highest item count (using real-time inventory items calculation if available, or static itemCount)
  const mostPopulatedCat = categories.reduce((max, cat) => {
    // calculate actual count dynamically from inventory
    const count = inventoryItems.filter(item => item.category.toLowerCase() === cat.name.toLowerCase()).length;
    const maxCount = inventoryItems.filter(item => item.category.toLowerCase() === (max ? max.name.toLowerCase() : '')).length;
    return count > maxCount ? cat : max;
  }, categories[0] || null);

  const mostPopulatedCount = mostPopulatedCat 
    ? inventoryItems.filter(item => item.category.toLowerCase() === mostPopulatedCat.name.toLowerCase()).reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  const handleDelete = (id, name) => {
    setItemToDelete({ id, name });
  };

  return (
    <div className="space-y-gutter animate-[fadeIn_0.3s_ease-out]">
      {/* Messages */}
      {errorMsg && (
        <div className="bg-error/10 border border-error/30 text-error p-4 rounded-lg flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="bg-[#4ade80]/10 border border-[#4ade80]/30 text-[#166534] dark:text-[#4ade80] p-4 rounded-lg flex items-center gap-2">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-8">
        <div>
          <h2 className="text-headline-lg font-headline-lg text-on-background mb-2 tracking-tight">Category Management</h2>
          <p className="text-body-md font-body-md text-on-surface-variant">Organize and manage inventory classifications.</p>
        </div>
        <button 
          onClick={() => setCurrentView('add_category')}
          className="flex items-center justify-center gap-2 bg-primary-container text-white px-6 py-3 rounded-lg font-label-md text-label-md hover:bg-[#e65a12] transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Create Category
        </button>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass-panel p-glass-padding rounded-xl flex items-center justify-between">
          <div>
            <p className="text-label-md font-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Total Categories</p>
            <p className="text-display-lg font-display-lg text-primary">{totalCategoriesCount}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container">
            <span className="material-symbols-outlined text-[28px]">category</span>
          </div>
        </div>

        <div className="glass-panel p-glass-padding rounded-xl flex items-center justify-between">
          <div>
            <p className="text-label-md font-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Most Populated</p>
            <p className="text-headline-md font-headline-md text-on-background line-clamp-1">
              {mostPopulatedCat ? mostPopulatedCat.name : 'N/A'}
            </p>
            <p className="text-label-sm font-label-sm text-primary mt-1">
              {mostPopulatedCount.toLocaleString()} units
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-tertiary-container/20 flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined text-[28px]">leaderboard</span>
          </div>
        </div>

        <div className="glass-panel p-glass-padding rounded-xl flex items-center justify-between">
          <div>
            <p className="text-label-md font-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Newly Added</p>
            <p className="text-headline-md font-headline-md text-on-background line-clamp-1">
              {categories[categories.length - 1]?.name || 'N/A'}
            </p>
            <p className="text-label-sm font-label-sm text-on-surface-variant mt-1">Ready for assignment</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface">
            <span className="material-symbols-outlined text-[28px]">new_releases</span>
          </div>
        </div>
      </div>

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full glass-panel p-8 text-center text-secondary">
            No categories match your search.
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const count = inventoryItems.filter(item => item.category.toLowerCase() === cat.name.toLowerCase()).length;
            const badgeColor = cat.status === 'Archived' 
              ? 'bg-surface-container-high text-on-surface-variant'
              : cat.status === 'In Use' 
                ? 'bg-primary-fixed text-on-primary-fixed-variant'
                : 'bg-tertiary-fixed text-on-tertiary-fixed-variant';

            return (
              <div 
                key={cat.id} 
                className={`glass-panel rounded-xl p-6 relative group hover:shadow-lg transition-all duration-300 ${
                  cat.status === 'Archived' ? 'opacity-70' : ''
                }`}
              >
                {/* Float Hover Actions */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="w-8 h-8 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center text-on-surface-variant hover:text-error transition-colors shadow-sm"
                    title="Delete Category"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>

                <div className="mb-4">
                  <div className={`inline-block px-3 py-1 rounded-full text-label-sm font-label-sm mb-3 ${badgeColor}`}>
                    {cat.status}
                  </div>
                  <h3 className="text-headline-md font-headline-md text-on-background mb-1">{cat.name}</h3>
                  <p className="text-body-md font-body-md text-on-surface-variant line-clamp-2">{cat.description || 'No description provided.'}</p>
                </div>

                <div className="pt-4 border-t border-white/40 flex justify-between items-center">
                  <span className="text-label-md font-label-md text-on-surface-variant">Total SKU Batches</span>
                  <span className="text-body-lg font-body-lg font-bold text-primary">{count}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between py-4 border-t border-outline-variant/30 mt-auto">
        <p className="text-body-md font-body-md text-on-surface-variant">
          Showing 1 to {filteredCategories.length} of {filteredCategories.length} categories
        </p>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg text-on-surface-variant hover:bg-white/40 transition-colors disabled:opacity-50" disabled>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="w-8 h-8 rounded-lg bg-primary text-white font-label-md text-label-md flex items-center justify-center shadow-sm">1</button>
          <button className="p-2 rounded-lg text-on-surface-variant hover:bg-white/40 transition-colors" disabled>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

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
              <p className="text-body-md text-on-surface">Are you sure you want to delete category "<span className="font-bold">{itemToDelete.name}</span>"?</p>
              <p className="text-label-sm text-on-surface-variant mt-2">This action cannot be undone. You can only delete categories that contain no active inventory items.</p>
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
                    await deleteCategory(itemToDelete.id);
                    setItemToDelete(null);
                  } catch (err) {
                    setItemToDelete(null);
                    setErrorMsg(err.message);
                    setTimeout(() => setErrorMsg(''), 5000);
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

export default CategoryList;
