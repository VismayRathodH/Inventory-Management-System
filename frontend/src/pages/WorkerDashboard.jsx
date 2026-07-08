import React, { useState, useContext } from 'react';
import { InventoryContext } from '../context/InventoryContext';

const WorkerDashboard = () => {
  const { triggerAlert, packs, pendingOrders, createPendingOrder, updatePendingOrderStatus, inventoryItems } = useContext(InventoryContext);

  // Worker Profile State derived from localStorage
  const [profile] = useState(() => {
    const saved = localStorage.getItem('userData');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        return {
          name: u.first_name || u.last_name ? `${u.first_name} ${u.last_name}`.trim() : u.username,
        };
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
    return { name: 'Worker' };
  });

  // Modal and new order state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customer: '',
    status: 'Queued'
  });
  const [orderItems, setOrderItems] = useState([{ item_id: '', quantity: 1 }]);

  // Selected Bundle Details Modal State
  const [selectedBundle, setSelectedBundle] = useState(null);

  const handleProcessOrder = async (orderId) => {
    const order = pendingOrders.find(o => o.id === orderId);
    if (!order) return;

    let nextStatus = order.status;
    if (order.status === 'Queued') {
      nextStatus = 'Picking';
    } else if (order.status === 'Picking') {
      nextStatus = 'Ready';
    } else if (order.status === 'Ready') {
      nextStatus = 'Shipped';
    }
    
    try {
      await updatePendingOrderStatus(order.internal_id, nextStatus);
      if (nextStatus === 'Picking') triggerAlert(`Order ${orderId} status changed to Picking. Prepare items.`, 'Order Processing');
      if (nextStatus === 'Ready') triggerAlert(`Order ${orderId} status changed to Ready. Items packaged.`, 'Order Packaged');
      if (nextStatus === 'Shipped') triggerAlert(`Order ${orderId} has been Shipped and logged.`, 'Order Shipped');
    } catch (err) {
      triggerAlert('Failed to update order status', 'Error');
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!newOrder.customer) {
      triggerAlert('Please enter customer name.', 'Error');
      return;
    }
    
    const itemsString = orderItems
      .filter(oi => oi.item_id && oi.quantity > 0)
      .map(oi => {
        const invItem = inventoryItems.find(i => i.id.toString() === oi.item_id);
        return invItem ? `${oi.quantity}x ${invItem.name}` : '';
      })
      .filter(Boolean)
      .join(', ');

    if (!itemsString) {
      triggerAlert('Please select at least one valid item from inventory.', 'Error');
      return;
    }

    const orderId = `#SG-${Math.floor(9000 + Math.random() * 999)}`;
    try {
      await createPendingOrder({
        id: orderId,
        customer: newOrder.customer,
        items: itemsString,
        status: newOrder.status
      });
      setShowOrderModal(false);
      setNewOrder({ customer: '', status: 'Queued' });
      setOrderItems([{ item_id: '', quantity: 1 }]);
      triggerAlert(`Order ${orderId} added to the floor queue.`, 'Order Queued');
    } catch (err) {
      triggerAlert('Failed to create pending order', 'Error');
    }
  };

  const visibleOrders = (pendingOrders || []).filter(o => o.status !== 'Shipped');

  // Map context packs to visual bundles list
  const mappedPacks = packs ? packs.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description || 'Custom Pack Bundle',
    itemsCount: p.items.reduce((acc, curr) => acc + curr.qty, 0),
    status: p.status || 'READY',
    image: p.icon || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoITYPCj98Ir8wuFpIuWNp1XEFqml0bZHzOXuk0v2GljfL-Tsd9u2WuCY_pM6REWyDCfh7tMOaBcjiUUnvfAyRLNaJ1PNesAzHlfPUt0BAo3YSBFk8vp6hXgLP8DEytemiDzzrS4A9JjjHTADuNh0PMOHlP3uUacMxJn10OH5QvutSdFEpVeaVM0lrgPHPKD_Ka1GyzifBFcwqr7gjrN913IROyNSF3cdVzhyqyK25IDqd5kQV7aSX',
    itemsList: p.items.map(i => ({ name: i.name, qty: i.qty }))
  })) : [];

  return (
    <div className="max-w-[1200px] mx-auto pb-20 animate-[fadeIn_0.3s_ease-out]">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2C211A] mb-3 font-display">
          Worker Profile
        </h1>
        <p className="text-lg text-[#5D554D] font-medium">
          Welcome back, {profile.name}. Your allocated modules are active for this session.
        </p>
      </div>

      {/* Pending Sales Orders */}
      <div className="bg-[#FCFBFA] rounded-[32px] p-8 md:p-10 mb-12 shadow-sm border border-[#F0EBE1]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold text-[#2C211A] font-serif">Pending Sales Orders</h2>
          <button
            onClick={() => setShowOrderModal(true)}
            className="bg-gradient-to-b from-[#F37B30] to-[#E35D11] text-white px-8 py-3 rounded-full font-bold text-sm shadow-[0_4px_12px_rgba(227,93,17,0.3)] hover:scale-105 transition-transform"
          >
            Create New Order
          </button>
        </div>
        
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="text-[11px] font-bold text-[#8C847A] tracking-[0.15em] uppercase border-b border-[#F0EBE1]">
                <th className="pb-4 pr-6">Order ID</th>
                <th className="pb-4 pr-6">Customer</th>
                <th className="pb-4 pr-6">Items</th>
                <th className="pb-4 pr-6">Status</th>
                <th className="pb-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE1]/50">
              {visibleOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-[#8C847A] font-medium italic">
                    No pending orders active in this session.
                  </td>
                </tr>
              ) : (
                visibleOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-[#F5F2E9]/50 transition-colors">
                    <td className="py-5 pr-6 font-bold text-[#C25827]">{order.id}</td>
                    <td className="py-5 pr-6 text-[#2C211A] font-medium">{order.customer}</td>
                    <td className="py-5 pr-6 text-[#5D554D]">{order.items}</td>
                    <td className="py-5 pr-6">
                      {order.status === 'Picking' && (
                        <span className="bg-[#FCE6D5] text-[#D8682F] px-4 py-1.5 rounded-full text-xs font-bold inline-block text-center min-w-[75px]">
                          Picking
                        </span>
                      )}
                      {order.status === 'Queued' && (
                        <span className="bg-[#D4EEF3] text-[#1B7E90] px-4 py-1.5 rounded-full text-xs font-bold inline-block text-center min-w-[75px]">
                          Queued
                        </span>
                      )}
                      {order.status === 'Ready' && (
                        <span className="bg-[#D0EFD2] text-[#2F853D] px-4 py-1.5 rounded-full text-xs font-bold inline-block text-center min-w-[75px]">
                          Ready
                        </span>
                      )}
                    </td>
                    <td className="py-5 text-right">
                      <button
                        onClick={() => handleProcessOrder(order.id)}
                        className="text-[#C25827] font-bold text-sm hover:underline"
                      >
                        {order.status === 'Queued' && 'Process'}
                        {order.status === 'Picking' && 'Process'}
                        {order.status === 'Ready' && 'Ship'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Bundles */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#2C211A] font-serif mb-1">Inventory Bundles</h2>
            <p className="text-[#5D554D] font-medium text-[15px]">Allocated items for current picking wave.</p>
          </div>
          <div className="flex gap-4 self-end sm:self-center">
            <button className="text-[#5D554D] hover:text-[#2C211A] transition-colors">
              <span className="material-symbols-outlined text-[28px]">filter_list</span>
            </button>
            <button className="text-[#5D554D] hover:text-[#2C211A] transition-colors">
              <span className="material-symbols-outlined text-[28px]">sort</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {mappedPacks.length === 0 && (
            <div className="col-span-1 sm:col-span-2 glass-panel bg-[#FCFBFA] border border-[#F0EBE1] rounded-[24px] p-8 text-center text-[#8C847A] font-medium">
              No custom bundles allocated to this session.
            </div>
          )}
          
          {mappedPacks.map((bundle) => (
            <div
              key={bundle.id}
              onClick={() => setSelectedBundle(bundle)}
              className="bg-white border border-[#F0EBE1] p-5 rounded-[28px] flex flex-col gap-4 hover:shadow-lg transition-all cursor-pointer shadow-sm group"
            >
              <div className="h-44 rounded-[20px] overflow-hidden bg-[#F5F2E9] relative">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt={bundle.name}
                  src={bundle.image}
                />
              </div>
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-[#2C211A] text-lg font-serif truncate max-w-[150px]">
                    {bundle.name}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-[6px] text-[9px] font-bold tracking-widest uppercase ${
                      bundle.status === 'READY'
                        ? 'bg-[#D0EFD2] text-[#2F853D]'
                        : 'bg-[#FCE6D5] text-[#D8682F]'
                    }`}
                  >
                    {bundle.status}
                  </span>
                </div>
                <p className="text-[#8C847A] text-xs font-medium">
                  {bundle.itemsCount} Items • {bundle.description}
                </p>
              </div>
            </div>
          ))}

          {/* Admin Restricted Module Card (Matching Mockup exactly) */}
          <div className="col-span-1 glass-panel rounded-[28px] flex flex-col items-center justify-center border border-dashed border-[#D2CDC6] bg-transparent py-10 px-6 h-full min-h-[260px] opacity-60 pointer-events-none">
            <span className="material-symbols-outlined text-4xl text-[#B3ACA2] mb-3">lock</span>
            <p className="text-[#A39D93] text-sm font-bold italic text-center max-w-[150px] leading-snug">
              Admin Restricted Module
            </p>
          </div>
        </div>
      </div>

      {/* Floating Action Button (Matches Mockup Bottom Right) */}
      <button
        onClick={() => setShowOrderModal(true)}
        className="fixed bottom-12 right-12 w-16 h-16 bg-[#B64A1B] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 hover:shadow-[#B64A1B]/40 transition-all z-40"
      >
        <span className="material-symbols-outlined text-[28px]">shopping_cart</span>
      </button>

      {/* Modals remain structurally similar but simplified styling */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#2C211A]/20 backdrop-blur-sm" onClick={() => setShowOrderModal(false)}></div>
          <div className="bg-white w-full max-w-md rounded-[32px] p-8 md:p-10 shadow-2xl relative z-10 border border-[#F0EBE1]">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold text-[#2C211A] font-serif">Create Pending Order</h2>
                <p className="text-[#8C847A] text-sm mt-1">Add a new customer picking task to queue</p>
              </div>
              <button onClick={() => setShowOrderModal(false)} className="text-[#8C847A] hover:text-[#2C211A] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="space-y-6" onSubmit={handleCreateOrder}>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#5D554D]">Customer Name</label>
                <input
                  className="w-full bg-[#F5F2E9]/50 border border-[#EBE4D5] rounded-xl py-3 px-4 focus:ring-1 focus:ring-[#B64A1B] outline-none text-[#2C211A]"
                  placeholder="e.g. Acme Corporation"
                  type="text"
                  required
                  value={newOrder.customer}
                  onChange={(e) => setNewOrder({ ...newOrder, customer: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#5D554D]">Order Items</label>
                <div className="space-y-3">
                  {orderItems.map((oi, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <select
                        className="flex-1 bg-[#F5F2E9]/50 border border-[#EBE4D5] rounded-xl py-3 px-4 focus:ring-1 focus:ring-[#B64A1B] outline-none text-[#2C211A]"
                        value={oi.item_id}
                        required
                        onChange={(e) => {
                          const newItems = [...orderItems];
                          newItems[index].item_id = e.target.value;
                          setOrderItems(newItems);
                        }}
                      >
                        <option value="">Select an Item...</option>
                        {inventoryItems && inventoryItems.map(item => (
                          <option key={item.id} value={item.id.toString()}>{item.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        required
                        className="w-20 bg-[#F5F2E9]/50 border border-[#EBE4D5] rounded-xl py-3 px-4 focus:ring-1 focus:ring-[#B64A1B] outline-none text-[#2C211A]"
                        value={oi.quantity}
                        onChange={(e) => {
                          const newItems = [...orderItems];
                          newItems[index].quantity = parseInt(e.target.value, 10) || 1;
                          setOrderItems(newItems);
                        }}
                      />
                      {orderItems.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => {
                            const newItems = orderItems.filter((_, i) => i !== index);
                            setOrderItems(newItems);
                          }}
                          className="text-[#C25827] p-2 hover:bg-[#FCE6D5] rounded-full transition-colors flex shrink-0"
                        >
                          <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    type="button" 
                    onClick={() => setOrderItems([...orderItems, { item_id: '', quantity: 1 }])}
                    className="text-sm text-[#B64A1B] font-bold hover:underline flex items-center gap-1 mt-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Add Another Item
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#5D554D]">Initial Status</label>
                <select
                  className="w-full bg-[#F5F2E9]/50 border border-[#EBE4D5] rounded-xl py-3 px-4 focus:ring-1 focus:ring-[#B64A1B] outline-none text-[#2C211A]"
                  value={newOrder.status}
                  onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
                >
                  <option value="Queued">Queued</option>
                  <option value="Picking">Picking</option>
                  <option value="Ready">Ready</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowOrderModal(false)} className="flex-1 py-3.5 border border-[#D2CDC6] text-[#5D554D] rounded-full font-bold hover:bg-[#F5F2E9] transition-all text-sm">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3.5 bg-gradient-to-b from-[#F37B30] to-[#E35D11] text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all text-sm">
                  Queue Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedBundle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#2C211A]/20 backdrop-blur-sm" onClick={() => setSelectedBundle(null)}></div>
          <div className="bg-white w-full max-w-md rounded-[32px] p-8 md:p-10 shadow-2xl relative z-10 border border-[#F0EBE1]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#2C211A] font-serif">{selectedBundle.name}</h2>
                <p className="text-[#8C847A] text-sm mt-1">Allocated wave picking item details</p>
              </div>
              <button onClick={() => setSelectedBundle(null)} className="text-[#8C847A] hover:text-[#2C211A] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-5">
              <div className="h-48 rounded-[20px] overflow-hidden bg-[#F5F2E9]">
                <img className="w-full h-full object-cover" alt={selectedBundle.name} src={selectedBundle.image} />
              </div>
              <div className="border-t border-[#F0EBE1] pt-5">
                <h4 className="text-[11px] font-bold text-[#8C847A] uppercase tracking-widest mb-3">Items to Pick</h4>
                <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                  {selectedBundle.itemsList ? (
                    selectedBundle.itemsList.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-[#FCFBFA] border border-[#F0EBE1] rounded-xl px-5 py-3">
                        <span className="font-bold text-[#2C211A] text-sm">{item.name}</span>
                        <span className="bg-[#F5F2E9] text-[#B64A1B] px-3 py-1 rounded-[6px] text-xs font-bold font-mono">
                          QTY: {item.qty}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-[#8C847A]">No items.</div>
                  )}
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-[#F0EBE1] mt-6">
              <button
                onClick={() => {
                  triggerAlert(`Wave picking initialized for "${selectedBundle.name}".`, 'Picking Dispatch');
                  setSelectedBundle(null);
                }}
                className="w-full py-4 bg-[#B64A1B] text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span className="material-symbols-outlined text-[20px]">barcode_scanner</span>
                Dispatch Picking Wave
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default WorkerDashboard;
