import React, { createContext, useState, useEffect } from 'react';

export const InventoryContext = createContext();

const initialCategories = [
  { id: 1, name: "Laboratory Glassware", description: "Beakers, flasks, test tubes, and other essential borosilicate glass items for general lab use.", status: "Active", itemCount: 1240 },
  { id: 2, name: "Chemical Reagents", description: "High-purity solvents, acids, bases, and specialized compounds for synthesis and analysis.", status: "Active", itemCount: 856 },
  { id: 3, name: "Measuring Instruments", description: "Precision scales, pipettes, burettes, and thermometers for accurate volume and mass measurement.", status: "In Use", itemCount: 312 },
  { id: 4, name: "Safety Gear", description: "Personal protective equipment including goggles, gloves, lab coats, and respirators.", status: "Active", itemCount: 1105 },
  { id: 5, name: "Obsolete Equipment", description: "Outdated or unrepairable machinery pending final disposal or recycling processing.", status: "Archived", itemCount: 42 }
];

const initialInventory = [
  {
    id: 1,
    name: "ErgoPulse Mouse G2",
    sku: "EP-G2-8821",
    category: "Electronics",
    batchNumber: "#B-4491-X",
    quantity: 142,
    costPrice: 24.50,
    sellingPrice: 59.99,
    threshold: 20,
    expiryDate: "2028-07-06",
    expiryStatus: "Safe",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCKKNCnw9qkkyxfECc9CYOFvOU6ObWuzQOWWHmWr8CEJC9CB4pRwCVFPer_O7FOPjqd1TOUtXDMiY8M0hG-oYn-X2lVOuIVf406IcLuEjYkJCCY6BT2U7dP_YVbBp7HqxEuLfRbyHkpqAMNFZiNrqIgv6V2ILyPtLCVWpuaVUtWVk3l6rxKNqxk6P8-qQQxA8C535MJFfwC2SF0q4W5ws2bE3QCl4Bv9C9qqJx-CK91T1eEq_UgA0U0"
  },
  {
    id: 2,
    name: "Artisan Cocoa Bar 70%",
    sku: "AC-70-112",
    category: "Gourmet Foods",
    batchNumber: "#B-2023-EXP",
    quantity: 12,
    costPrice: 2.10,
    sellingPrice: 8.50,
    threshold: 15,
    expiryDate: "2026-07-13", // Expiring soon in a week relative to local time 2026-07-06
    expiryStatus: "Expiring in 7 days",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKQffIc4_3G1ZCzSQ3N6PS8dKTjSB9uyKvewD-hy6nzIWxE-hY3PVewA1xkoXBpdkgvMrSW5BDCnwGXFpRIumboM_VKLi2oo7x3ezggG_TckQkBFIF7ckb5DJQP_SDcTFSaqfO1-NSWz0YV-o67Qck-rvw_XZ3EGZKz4-gKKCVF59aGh3JVQSKhthM9QsVf6OkrSRMk6I4qX2R-7tfBUF1IVQdQCrl4LMLL16zuHoXxZivvuLI3MFh"
  },
  {
    id: 3,
    name: "Velvet Glow Lamp",
    sku: "VG-L-505",
    category: "Furniture",
    batchNumber: "#B-9981-L",
    quantity: 45,
    costPrice: 112.00,
    sellingPrice: 289.00,
    threshold: 5,
    expiryDate: "",
    expiryStatus: "Safe",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDcQXdFwHJVMKTik3PScSIVfKkV-l3Q2T1EDXWLX7MUuwPXOWzagNPZVl4RDWfmPsDvRs1E0otLEoTr8E5jYH5dRXYclG9YPpSbxZSMQaQmXN22Vl_9MwzTYQvmRLxWPRzXM87QN5NsfihjP9xxr1ZZiMckQn5aZ6uaYIMJa8QhxiAev3xSo3fBV04c6TpPKZEmt9mxqy1QsPKP737n3X__hCb_OSzpVH0Nji-X_7lEV80WyN6s5idl"
  },
  {
    id: 4,
    name: "Premium Leather Tote",
    sku: "BAG-LTH-001",
    category: "Accessories",
    batchNumber: "#B-BAG-101",
    quantity: 45,
    costPrice: 45.00,
    sellingPrice: 120.00,
    threshold: 10,
    expiryDate: "",
    expiryStatus: "Safe",
    image: ""
  },
  {
    id: 5,
    name: "Ceramic V60 Dripper",
    sku: "COF-EQP-042",
    category: "Coffee Gear",
    batchNumber: "#B-COF-042",
    quantity: 5,
    costPrice: 15.00,
    sellingPrice: 35.00,
    threshold: 10,
    expiryDate: "",
    expiryStatus: "Safe",
    image: ""
  },
  {
    id: 6,
    name: "Organic Matcha Tin",
    sku: "TEA-ORG-009",
    category: "Pantry",
    batchNumber: "#B-TEA-009",
    quantity: 120,
    costPrice: 8.00,
    sellingPrice: 19.99,
    threshold: 20,
    expiryDate: "2026-08-01", // Expiring in 30 days
    expiryStatus: "Expiring in 30 days",
    image: ""
  }
];

export const InventoryProvider = ({ children }) => {
  const [categories, setCategories] = useState(() => {
    const local = localStorage.getItem('categories');
    return local ? JSON.parse(local) : initialCategories;
  });

  const [inventoryItems, setInventoryItems] = useState(() => {
    const local = localStorage.getItem('inventoryItems');
    return local ? JSON.parse(local) : initialInventory;
  });

  const [notifications, setNotifications] = useState([]);
  const [logs, setLogs] = useState([
    { id: 1, action: "Stock deduction", item: "Ceramic V60 Dripper", details: "Deducted 2 units due to invoice #INV-2026-004", timestamp: "2026-07-06T14:32:00" },
    { id: 2, action: "Item initialization", item: "ErgoPulse Mouse G2", details: "Created new batch record #B-4491-X", timestamp: "2026-07-06T10:15:00" },
    { id: 3, action: "Category creation", item: "Safety Gear", details: "Added active classification category", timestamp: "2026-07-04T11:20:00" }
  ]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('inventoryItems', JSON.stringify(inventoryItems));
  }, [inventoryItems]);

  // Recalculate expiry status and low stock notifications dynamically
  useEffect(() => {
    const newNotifications = [];
    const today = new Date("2026-07-06T12:00:00"); // Base target local time in standard format

    inventoryItems.forEach(item => {
      // 1. Stock Status Notification
      if (item.quantity < item.threshold) {
        let severity = "Warning";
        if (item.quantity === 0) {
          severity = "Critical";
        } else if (item.quantity < (item.threshold * 0.5)) {
          severity = "High";
        }
        newNotifications.push({
          id: `low-${item.id}`,
          itemId: item.id,
          itemName: item.name,
          sku: item.sku,
          type: "LOW_STOCK",
          severity: severity,
          message: `${item.name} is running low! Current Qty: ${item.quantity} (Threshold: ${item.threshold})`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }

      // 2. Expiry Status Notification
      if (item.expiryDate) {
        const exp = new Date(item.expiryDate);
        const timeDiff = exp.getTime() - today.getTime();
        const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (diffDays <= 0) {
          newNotifications.push({
            id: `exp-${item.id}`,
            itemId: item.id,
            itemName: item.name,
            sku: item.sku,
            type: "EXPIRED",
            severity: "Critical",
            message: `${item.name} (Batch: ${item.batchNumber}) has expired!`,
            isRead: false,
            createdAt: new Date().toISOString()
          });
        } else if (diffDays <= 7) {
          newNotifications.push({
            id: `exp-${item.id}`,
            itemId: item.id,
            itemName: item.name,
            sku: item.sku,
            type: "EXPIRING_SOON",
            severity: "High",
            message: `${item.name} (Batch: ${item.batchNumber}) expires in ${diffDays} days!`,
            isRead: false,
            createdAt: new Date().toISOString()
          });
        } else if (diffDays <= 30) {
          newNotifications.push({
            id: `exp-${item.id}`,
            itemId: item.id,
            itemName: item.name,
            sku: item.sku,
            type: "EXPIRING_SOON",
            severity: "Warning",
            message: `${item.name} (Batch: ${item.batchNumber}) expires in ${diffDays} days.`,
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }
      }
    });

    setNotifications(newNotifications);
  }, [inventoryItems]);

  const computeExpiryStatus = (expiryDateString) => {
    if (!expiryDateString) return "Safe";
    const today = new Date("2026-07-06T12:00:00");
    const exp = new Date(expiryDateString);
    const timeDiff = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (diffDays <= 0) return "Expired";
    if (diffDays <= 7) return "Expiring in 7 days";
    if (diffDays <= 30) return "Expiring in 30 days";
    return "Safe";
  };

  // CRUD for Categories
  const addCategory = (name, description) => {
    // Check uniqueness
    if (categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
      throw new Error("Category name must be unique.");
    }
    const newCat = {
      id: Date.now(),
      name,
      description,
      status: "Active",
      itemCount: 0
    };
    setCategories([...categories, newCat]);
    
    // Add to activity log
    setLogs(prev => [
      { id: Date.now(), action: "Category creation", item: name, details: "Added new category classification", timestamp: new Date().toISOString() },
      ...prev
    ]);
  };

  const deleteCategory = (id) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;
    
    // Check if category is referenced by any inventory items
    const isReferenced = inventoryItems.some(item => item.category.toLowerCase() === category.name.toLowerCase());
    if (isReferenced) {
      throw new Error(`Cannot delete category "${category.name}" because it contains items in the inventory. Please reassign or delete the items first.`);
    }

    setCategories(categories.filter(cat => cat.id !== id));
    
    // Add to activity log
    setLogs(prev => [
      { id: Date.now(), action: "Category deletion", item: category.name, details: "Removed category classification", timestamp: new Date().toISOString() },
      ...prev
    ]);
  };

  const updateCategory = (id, updatedFields) => {
    setCategories(categories.map(cat => {
      if (cat.id === id) {
        const updated = { ...cat, ...updatedFields };
        if (updatedFields.name && updatedFields.name !== cat.name) {
          // Verify name unique
          if (categories.some(c => c.id !== id && c.name.toLowerCase() === updatedFields.name.toLowerCase())) {
            throw new Error("Category name must be unique.");
          }
        }
        return updated;
      }
      return cat;
    }));
  };

  // CRUD for Inventory
  const addInventoryItem = (item) => {
    // Unique check protocol FR-INV-2: uniqueness key = (item_name, category, batch_number, expiry_date)
    // If exact match exists, we can merge quantities or alert. SRS says: "If an item with the same name arrives with a different expiry date or batch number, the system MUST create a new, separate inventory record, never merging quantities."
    // If it has identical name, category, batch, and expiry, we merge quantities!
    const exactMatchIndex = inventoryItems.findIndex(existing => 
      existing.name.toLowerCase() === item.name.toLowerCase() &&
      existing.category.toLowerCase() === item.category.toLowerCase() &&
      existing.batchNumber.toLowerCase() === item.batchNumber.toLowerCase() &&
      (existing.expiryDate || "") === (item.expiryDate || "")
    );

    if (exactMatchIndex !== -1) {
      // Merge quantity
      setInventoryItems(prev => prev.map((ex, idx) => {
        if (idx === exactMatchIndex) {
          return {
            ...ex,
            quantity: ex.quantity + Number(item.quantity),
            costPrice: item.costPrice,
            sellingPrice: item.sellingPrice
          };
        }
        return ex;
      }));

      setLogs(prev => [
        { id: Date.now(), action: "Stock update (merged)", item: item.name, details: `Merged ${item.quantity} units into existing Batch: ${item.batchNumber}`, timestamp: new Date().toISOString() },
        ...prev
      ]);
    } else {
      // Add as separate SKU-Record
      const skuSuffix = Math.floor(1000 + Math.random() * 9000);
      const sku = item.sku || `${item.name.substring(0, 3).toUpperCase()}-${item.category.substring(0, 3).toUpperCase()}-${skuSuffix}`;
      
      const newItem = {
        ...item,
        id: Date.now(),
        sku: sku,
        quantity: Number(item.quantity),
        costPrice: Number(item.costPrice),
        sellingPrice: Number(item.sellingPrice),
        threshold: Number(item.threshold),
        expiryStatus: computeExpiryStatus(item.expiryDate)
      };

      setInventoryItems(prev => [newItem, ...prev]);

      // Update category itemCount
      setCategories(prevCats => prevCats.map(cat => {
        if (cat.name.toLowerCase() === item.category.toLowerCase()) {
          return { ...cat, itemCount: cat.itemCount + 1 };
        }
        return cat;
      }));

      setLogs(prev => [
        { id: Date.now(), action: "Item initialization", item: item.name, details: `Created new batch record ${sku} (Batch: ${item.batchNumber})`, timestamp: new Date().toISOString() },
        ...prev
      ]);
    }
  };

  const deleteInventoryItem = (id) => {
    const item = inventoryItems.find(i => i.id === id);
    if (!item) return;

    setInventoryItems(prev => prev.filter(i => i.id !== id));

    // Update category itemCount
    setCategories(prevCats => prevCats.map(cat => {
      if (cat.name.toLowerCase() === item.category.toLowerCase()) {
        return { ...cat, itemCount: Math.max(0, cat.itemCount - 1) };
      }
      return cat;
    }));

    setLogs(prev => [
      { id: Date.now(), action: "Item removal", item: item.name, details: `Deleted batch record (SKU: ${item.sku})`, timestamp: new Date().toISOString() },
      ...prev
    ]);
  };

  const updateInventoryItem = (id, updatedFields) => {
    const originalItem = inventoryItems.find(i => i.id === id);
    if (!originalItem) return;

    setInventoryItems(prev => prev.map(item => {
      if (item.id === id) {
        const merged = { ...item, ...updatedFields };
        merged.quantity = Number(merged.quantity);
        merged.costPrice = Number(merged.costPrice);
        merged.sellingPrice = Number(merged.sellingPrice);
        merged.threshold = Number(merged.threshold);
        merged.expiryStatus = computeExpiryStatus(merged.expiryDate);
        return merged;
      }
      return item;
    }));

    // Update category count if category changes
    if (updatedFields.category && updatedFields.category !== originalItem.category) {
      setCategories(prevCats => prevCats.map(cat => {
        let count = cat.itemCount;
        if (cat.name.toLowerCase() === originalItem.category.toLowerCase()) {
          count = Math.max(0, count - 1);
        }
        if (cat.name.toLowerCase() === updatedFields.category.toLowerCase()) {
          count = count + 1;
        }
        return { ...cat, itemCount: count };
      }));
    }

    setLogs(prev => [
      { id: Date.now(), action: "Item update", item: originalItem.name, details: `Updated details for SKU: ${originalItem.sku}`, timestamp: new Date().toISOString() },
      ...prev
    ]);
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id) return { ...n, isRead: true };
      return n;
    }));
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
      markNotificationRead
    }}>
      {children}
    </InventoryContext.Provider>
  );
};
