import React, { useState, useContext } from 'react';
import { InventoryContext } from '../context/InventoryContext';

const AddCategory = ({ setCurrentView }) => {
  const { addCategory } = useContext(InventoryContext);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Category name is required.');
      return;
    }

    try {
      addCategory(name.trim(), description.trim());
      setCurrentView('categories');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-[fadeIn_0.3s_ease-out]">
      {/* Back button and title */}
      <div className="mb-8 flex items-center gap-2">
        <button 
          onClick={() => setCurrentView('categories')}
          className="text-secondary hover:text-primary transition-colors flex items-center"
          title="Back to Categories"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <h2 className="text-headline-md font-headline-md text-on-surface">Add Category</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Main form */}
        <div className="lg:col-span-2">
          <div className="glass-panel rounded-xl p-glass-padding">
            <h3 className="text-headline-lg-mobile font-headline-lg-mobile mb-6 text-on-surface">Create New Category</h3>
            
            {errorMsg && (
              <div className="mb-4 bg-error/10 border border-error/30 text-error p-3 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                <span className="text-label-sm font-semibold">{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Name */}
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-2" htmlFor="categoryName">
                  Category Name <span className="text-primary ml-1" title="Required">*</span>
                </label>
                <input 
                  id="categoryName" 
                  name="categoryName" 
                  type="text" 
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="e.g., Electronics" 
                  required 
                  className="w-full px-4 py-3 glass-input rounded-t-md text-body-md text-on-surface"
                />
                <p className="text-label-sm font-label-sm text-secondary mt-1 ml-1">Must be unique across the inventory classifications.</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-2" htmlFor="description">
                  Description <span className="text-secondary font-normal">(Optional)</span>
                </label>
                <textarea 
                  id="description" 
                  name="description" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter category description..." 
                  rows="4" 
                  className="w-full px-4 py-3 glass-input rounded-t-md text-body-md text-on-surface resize-none"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 flex justify-end gap-4 border-t border-white/30">
                <button 
                  onClick={() => setCurrentView('categories')}
                  type="button" 
                  className="px-6 py-2.5 rounded-lg btn-ghost font-label-md text-label-md"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 rounded-lg btn-primary font-label-md text-label-md shadow-sm"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Side Tip Info */}
        <div className="lg:col-span-1 space-y-gutter">
          <div className="glass-panel p-glass-padding rounded-xl text-on-surface-variant">
            <h4 className="text-label-md font-bold mb-2 flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-[18px]">info</span>
              Naming Protocols
            </h4>
            <ul className="text-label-sm space-y-2 list-disc list-inside">
              <li>Category names are case-insensitive unique tags.</li>
              <li>Keep it descriptive for clear logistics groupings.</li>
              <li>Adding descriptive metadata helps cashiers search items by section during billing transactions.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCategory;
