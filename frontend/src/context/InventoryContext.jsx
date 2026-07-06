import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
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

  const refreshAll = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    setLoading(true);
    await Promise.all([fetchCategories(), fetchInventory(), fetchNotifications()]);
    setLoading(false);
  }, [fetchCategories, fetchInventory, fetchNotifications]);

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
      refreshAll
    }}>
      {children}
    </InventoryContext.Provider>
  );
};
