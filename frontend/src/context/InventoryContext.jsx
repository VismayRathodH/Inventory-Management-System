import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const InventoryContext = createContext();

const defaultInvoices = [];
const defaultPacks = [];

export const InventoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [packs, setPacks] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [logs, setLogs] = useState(() => {
    const savedLogs = localStorage.getItem('inventory_logs');
    return savedLogs ? JSON.parse(savedLogs) : [];
  });

  // Save logs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('inventory_logs', JSON.stringify(logs));
  }, [logs]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalAlert, setGlobalAlert] = useState(null);

  const triggerAlert = (message, title = "Notice") => {
    setGlobalAlert({ message, title });
  };

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/categories/');
      setCategories(response.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  }, []);

  const fetchInventory = useCallback(async () => {
    try {
      const response = await api.get('/inventory/');
      const mapped = response.data.map(item => ({
        id: item.id,
        name: item.item_name,
        category: item.category_name,
        categoryId: item.category,
        quantity: item.quantity,
        costPrice: parseFloat(item.cost_price),
        sellingPrice: parseFloat(item.selling_price),
        threshold: item.threshold_quantity,
        image: item.image,
        expiryDate: item.expiry_date,
        batchNumber: item.batch_number,
        sku: item.batch_number || `SKU-${item.id}`,
        expiryStatus: item.expiryStatus,
        createdDate: item.created_date,
        lastUpdated: item.last_updated
      }));
      setInventoryItems(mapped);
    } catch (err) {
      console.error("Failed to fetch inventory", err);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/notifications/');
      const mapped = response.data.map(n => ({
        id: n.id,
        itemId: n.inventory_item,
        itemName: n.item_name,
        type: n.type,
        severity: n.severity,
        message: `${n.item_name} - ${n.type.replace('_', ' ')}`,
        isRead: n.is_read,
        createdAt: n.created_at
      }));
      setNotifications(mapped);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  }, []);

  const fetchPacks = useCallback(async () => {
    try {
      const response = await api.get('/bundles/');
      // Map API bundles to local packs format
      const mapped = response.data.map(b => ({
        id: b.id.toString(), // frontend expects string in some places
        name: b.name,
        description: b.description,
        icon: b.icon,
        status: b.status,
        items: b.items.map(i => ({
          name: i.name,
          inventory_item_id: i.inventory_item_id,
          qty: i.quantity
        }))
      }));
      setPacks(mapped);
    } catch (err) {
      console.error("Failed to fetch packs", err);
    }
  }, []);

  const fetchInvoices = useCallback(async () => {
    try {
      const response = await api.get('/sales/');
      const mapped = response.data.map(s => ({
        id: s.invoice_number,
        customerName: s.customer_name,
        customerEmail: s.customer_email,
        issuedDate: new Date(s.created_at).toISOString().split('T')[0],
        status: s.payment_status,
        paymentMethod: s.payment_method,
        notes: s.notes,
        totalQuantity: s.total_quantity,
        taxPercentage: parseFloat(s.tax_percentage),
        taxAmount: parseFloat(s.tax_amount),
        subtotal: parseFloat(s.subtotal),
        amount: parseFloat(s.grand_total), // backwards compatibility for amount
        items: s.items.map(i => ({ name: i.item_name, qty: i.quantity, price: parseFloat(i.price) }))
      }));
      setInvoices(mapped);
    } catch (err) {
      console.error("Failed to fetch invoices", err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    setLoading(true);
    await Promise.all([fetchCategories(), fetchInventory(), fetchNotifications(), fetchPacks(), fetchInvoices()]);
    setLoading(false);
  }, [fetchCategories, fetchInventory, fetchNotifications, fetchPacks, fetchInvoices]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // CRUD for Categories
  const addCategory = async (name, description) => {
    try {
      await api.post('/categories/', { name, description });
      await fetchCategories();
      setLogs(prev => [{ id: Date.now(), action: "Category creation", item: name, details: "Added new category", timestamp: new Date().toISOString() }, ...prev]);
    } catch (err) {
      if (err.response?.data?.name) {
        throw new Error(err.response.data.name[0]);
      }
      throw new Error("Failed to create category");
    }
  };

  const deleteCategory = async (id) => {
    try {
      await api.delete(`/categories/${id}/`);
      await fetchCategories();
      setLogs(prev => [{ id: Date.now(), action: "Category deletion", item: `ID ${id}`, details: "Removed category", timestamp: new Date().toISOString() }, ...prev]);
    } catch (err) {
      if (err.response?.data?.error) {
        throw new Error(err.response.data.error);
      }
      throw new Error("Failed to delete category");
    }
  };

  const updateCategory = async (id, updatedFields) => {
    try {
      await api.patch(`/categories/${id}/`, updatedFields);
      await fetchCategories();
    } catch (err) {
      if (err.response?.data?.name) {
        throw new Error(err.response.data.name[0]);
      }
      throw new Error("Failed to update category");
    }
  };

  // CRUD for Inventory
  const addInventoryItem = async (item) => {
    try {
      // Backend handles merging vs new record based on unique constraints!
      // But wait, our API doesn't auto-merge. The frontend logic was merging in memory. 
      // We will attempt to create. If it fails due to unique constraint, we can inform the user.
      await api.post('/inventory/', {
        item_name: item.name,
        category: parseInt(item.category),
        quantity: item.quantity,
        cost_price: item.costPrice,
        selling_price: item.sellingPrice,
        threshold_quantity: item.threshold,
        batch_number: item.batchNumber || null,
        expiry_date: item.expiryDate || null,
        image: item.image || ''
      });
      await fetchInventory();
      await fetchCategories();
      await fetchNotifications();
      setLogs(prev => [{ id: Date.now(), action: "Item added", item: item.name, details: "Added new item to inventory", timestamp: new Date().toISOString() }, ...prev]);
    } catch (err) {
      if (err.response?.data?.non_field_errors) {
        throw new Error("An item with this batch/expiry already exists. Cannot merge.");
      }
      throw new Error("Failed to add inventory item.");
    }
  };

  const deleteInventoryItem = async (id) => {
    try {
      await api.delete(`/inventory/${id}/`);
      await fetchInventory();
      await fetchCategories();
      await fetchNotifications();
    } catch (err) {
      throw new Error("Failed to delete inventory item.");
    }
  };

  const updateInventoryItem = async (id, updatedFields) => {
    try {
      const payload = {};
      if (updatedFields.name) payload.item_name = updatedFields.name;
      if (updatedFields.category) payload.category = parseInt(updatedFields.category);
      if (updatedFields.quantity !== undefined) payload.quantity = updatedFields.quantity;
      if (updatedFields.costPrice !== undefined) payload.cost_price = updatedFields.costPrice;
      if (updatedFields.sellingPrice !== undefined) payload.selling_price = updatedFields.sellingPrice;
      if (updatedFields.threshold !== undefined) payload.threshold_quantity = updatedFields.threshold;
      if (updatedFields.batchNumber !== undefined) payload.batch_number = updatedFields.batchNumber;
      if (updatedFields.expiryDate !== undefined) payload.expiry_date = updatedFields.expiryDate;
      if (updatedFields.image !== undefined) payload.image = updatedFields.image;

      await api.patch(`/inventory/${id}/`, payload);
      await fetchInventory();
      await fetchCategories();
      await fetchNotifications();
    } catch (err) {
      throw new Error("Failed to update item");
    }
  };

  const [cart, setCart] = useState([]);

  const addToCart = (item, qty = 1) => {
    setCart(prevCart => {
      const existing = prevCart.find(i => i.id === item.id);
      if (existing) {
        const newQty = existing.qty + qty;
        if (newQty > item.quantity) {
          triggerAlert(`Maximum quantity validation: Stock limit reached for "${item.name}".`, "Validation Failed");
          return prevCart;
        }
        return prevCart.map(i => i.id === item.id ? { ...i, qty: newQty } : i);
      } else {
        if (qty > item.quantity) {
          triggerAlert(`Maximum quantity validation: Stock limit reached for "${item.name}".`, "Validation Failed");
          return prevCart;
        }
        return [...prevCart, { ...item, qty }];
      }
    });
  };

  const updateCartQty = (itemId, delta) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === itemId) {
          const newQty = item.qty + delta;
          if (newQty <= 0) {
            return null;
          }
          if (newQty > item.quantity) {
            triggerAlert(`Quantity validation error: Exceeds available stock of ${item.quantity} for "${item.name}".`, "Validation Failed");
            return item;
          }
          return { ...item, qty: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const addInvoice = async (invoice) => {
    try {
      await api.post('/sales/', {
        invoice_number: invoice.id,
        customer_name: invoice.customerName,
        customer_email: invoice.customerEmail,
        total_quantity: invoice.totalQuantity,
        tax_percentage: invoice.taxPercentage,
        tax_amount: invoice.taxAmount,
        subtotal: invoice.subtotal,
        grand_total: invoice.amount,
        payment_status: invoice.status || 'PAID',
        payment_method: invoice.paymentMethod || 'CASH',
        notes: invoice.notes || '',
        items: invoice.items.map(i => ({
          item_name: i.name,
          quantity: i.qty,
          price: i.price
        }))
      });
      await fetchInvoices();
      setLogs(prev => [
        {
          id: Date.now(),
          action: "Invoice Created",
          item: invoice.id,
          details: `Finalized bill for ${invoice.customerName} - Total: $${invoice.amount.toFixed(2)}`,
          timestamp: new Date().toISOString()
        },
        ...prev
      ]);
    } catch (err) {
      throw new Error("Failed to create sale invoice");
    }
  };

  const addPack = async (pack) => {
    try {
      await api.post('/bundles/', {
        name: pack.name,
        description: pack.description,
        icon: pack.icon,
        items: pack.items.map(i => ({
          inventory_item_id: i.inventory_item_id,
          quantity: i.qty
        }))
      });
      await fetchPacks();
      setLogs(prev => [
        {
          id: Date.now(),
          action: "Pack Created",
          item: pack.name,
          details: `Created new pack with ${pack.items.length} items`,
          timestamp: new Date().toISOString()
        },
        ...prev
      ]);
    } catch (err) {
      if (err.response?.data?.name) {
        throw new Error(err.response.data.name[0]);
      }
      throw new Error("Failed to create bundle");
    }
  };

  const updatePack = async (id, updatedPack) => {
    try {
      await api.patch(`/bundles/${id}/`, {
        name: updatedPack.name,
        description: updatedPack.description,
        icon: updatedPack.icon,
        items: updatedPack.items.map(i => ({
          inventory_item_id: i.inventory_item_id,
          quantity: i.qty
        }))
      });
      await fetchPacks();
    } catch (err) {
      throw new Error("Failed to update bundle");
    }
  };

  const deletePack = async (id) => {
    try {
      await api.delete(`/bundles/${id}/`);
      await fetchPacks();
    } catch (err) {
      throw new Error("Failed to delete bundle");
    }
  };

  const addPackToCart = (pack, navigate) => {
    // 1. Validation pass: verify all items have sufficient stock
    for (const packItem of pack.items) {
      const match = inventoryItems.find(invItem => invItem.id === packItem.inventory_item_id || invItem.name.toLowerCase() === packItem.name.toLowerCase());
      if (match) {
        const existing = cart.find(i => i.id === match.id);
        const currentQty = existing ? existing.qty : 0;
        const finalQty = currentQty + packItem.qty;
        if (finalQty > match.quantity) {
          triggerAlert(`Validation Failed: Insufficient stock for "${match.name}". Required: ${finalQty}, Available: ${match.quantity}.`, "Validation Failed");
          return; // Reject entire bundle
        }
      } else {
        // If it's a virtual item from legacy, we just skip strict validation since we don't know real stock
      }
    }

    // 2. Execution pass: all items valid, add them
    let addedAny = false;
    pack.items.forEach(packItem => {
      const match = inventoryItems.find(invItem => invItem.id === packItem.inventory_item_id || invItem.name.toLowerCase() === packItem.name.toLowerCase());
      if (match) {
        setCart(prevCart => {
          const existing = prevCart.find(i => i.id === match.id);
          const currentQty = existing ? existing.qty : 0;
          const finalQty = currentQty + packItem.qty;
          if (existing) {
            return prevCart.map(i => i.id === match.id ? { ...i, qty: finalQty } : i);
          } else {
            return [...prevCart, { ...match, qty: packItem.qty }];
          }
        });
        addedAny = true;
      } else {
        // Fallback: search by SKU or just use generic item
        const genericItem = {
          id: `virtual-${Date.now()}-${Math.random()}`,
          name: packItem.name,
          sku: `V-SKU`,
          sellingPrice: 10.00,
          quantity: 100,
          category: 'General',
          batchNumber: 'B-VIRTUAL'
        };
        setCart(prevCart => [...prevCart, { ...genericItem, qty: packItem.qty }]);
        addedAny = true;
      }
    });

    if (addedAny && navigate) {
      navigate('/sales');
    }
  };

  return (
    <InventoryContext.Provider value={{
      categories,
      inventoryItems,
      notifications,
      logs,
      addCategory,
      deleteCategory,
      updateCategory,
      addInventoryItem,
      deleteInventoryItem,
      updateInventoryItem,
      loading,
      refreshAll,
      cart,
      invoices,
      packs,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCart,
      addInvoice,
      addPack,
      updatePack,
      deletePack,
      addPackToCart,
      triggerAlert
    }}>
      {children}
      
      {/* Global Alert Modal */}
      {globalAlert && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-background/25 backdrop-blur-md" onClick={() => setGlobalAlert(null)}></div>
          <div className="glass-panel-high w-full max-w-sm rounded-3xl overflow-hidden relative flex flex-col animate-[zoomIn_0.2s_ease-out] bg-white/95 dark:bg-zinc-900/95 border border-white/80 shadow-2xl">
            <div className="p-6 border-b border-white/60 dark:border-white/10 flex items-center gap-3 bg-primary/10">
              <span className="material-symbols-outlined text-primary">info</span>
              <h2 className="text-headline-sm font-bold text-primary">{globalAlert.title}</h2>
            </div>
            <div className="p-6">
              <p className="text-body-md text-on-surface">{globalAlert.message}</p>
            </div>
            <div className="p-6 bg-white/10 border-t border-white/60 dark:border-white/10 flex justify-end">
              <button 
                onClick={() => setGlobalAlert(null)}
                className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </InventoryContext.Provider>
  );
};
