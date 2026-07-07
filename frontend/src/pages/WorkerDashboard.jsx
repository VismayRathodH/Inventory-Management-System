import React, { useState, useEffect, useContext } from 'react';
import { InventoryContext } from '../context/InventoryContext';

const WorkerDashboard = () => {
  const { triggerAlert, packs } = useContext(InventoryContext);

  // Worker Profile State
  const [profile, setProfile] = useState({
    name: 'Marcus Chen',
    role: 'Floor Manager',
    loginId: 'MC-4409-WK',
    authorityLevel: 'Shift Floor Access',
    email: 'm.chen@stockglass.io',
    facility: 'Central Hub - Sector G',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBrqqfLDuDuqEHZvcnUYe0jGzS6CIK5tfW-QddwYHGonfEYY1bPj_czYd0uH66EuZB2b2j9EJUBylHbNoeee1MAvKViIRSa0vjuab9_SL19I-6y1-SlkPDvVsOTUDaWcqjh5GECxBTQKuyv8MPytliOrWdKwqt_afHX7acGCAMslx31akYdqqGG6scXQRuREVklqwfdS46sDNwIfum3dA9gd1UgfLLMI4ijP2u3w3mQFZ0Qhtncp9u'
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ ...profile });
  const fileInputRef = React.useRef(null);

  const handlePfpChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfile((prev) => ({ ...prev, avatar: event.target.result }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleEditProfileSave = () => {
    setProfile(editedProfile);
    setIsEditingProfile(false);
    triggerAlert('Worker profile updated successfully.', 'Success');
  };

  // Session elapsed timer state
  const [elapsedSeconds, setElapsedSeconds] = useState(4830); // starts around 1h 20m for look & feel
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Orders State
  const [orders, setOrders] = useState([
    { id: '#SG-9921', customer: 'Luxe Interiors Ltd.', items: '12x Glass Vases', status: 'Picking' },
    { id: '#SG-9922', customer: 'Nordic Designs', items: '5x Minimalist Mirrors', status: 'Queued' },
    { id: '#SG-9925', customer: 'Urban Loft Co.', items: '24x Crystal tumblers', status: 'Ready' }
  ]);

  // Modal and new order state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customer: '',
    items: '',
    status: 'Queued'
  });

  // Selected Bundle Details Modal State
  const [selectedBundle, setSelectedBundle] = useState(null);

  // Orders process flow: Queued -> Picking -> Ready -> Shipped
  const handleProcessOrder = (orderId) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          let nextStatus = order.status;
          if (order.status === 'Queued') {
            nextStatus = 'Picking';
            triggerAlert(`Order ${orderId} status changed to Picking. Prepare items.`, 'Order Processing');
          } else if (order.status === 'Picking') {
            nextStatus = 'Ready';
            triggerAlert(`Order ${orderId} status changed to Ready. Items packaged.`, 'Order Packaged');
          } else if (order.status === 'Ready') {
            nextStatus = 'Shipped';
            triggerAlert(`Order ${orderId} has been Shipped and logged.`, 'Order Shipped');
          }
          return { ...order, status: nextStatus };
        }
        return order;
      }).filter((order) => order.status !== 'Shipped') // remove shipped orders from active list
    );
  };

  const handleCreateOrder = (e) => {
    e.preventDefault();
    if (!newOrder.customer || !newOrder.items) {
      triggerAlert('Please enter both customer name and items.', 'Error');
      return;
    }
    const orderId = `#SG-${Math.floor(9000 + Math.random() * 999)}`;
    const created = {
      id: orderId,
      customer: newOrder.customer,
      items: newOrder.items,
      status: newOrder.status
    };
    setOrders((prev) => [created, ...prev]);
    setShowOrderModal(false);
    setNewOrder({ customer: '', items: '', status: 'Queued' });
    triggerAlert(`Order ${orderId} added to the floor queue.`, 'Order Queued');
  };

  // Static mock bundles combined with context bundles (packs)
  const defaultBundles = [
    {
      id: 'BNDL-Spring-24',
      name: 'BNDL-Spring-24',
      description: 'Glassware Set',
      itemsCount: 8,
      status: 'READY',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoITYPCj98Ir8wuFpIuWNp1XEFqml0bZHzOXuk0v2GljfL-Tsd9u2WuCY_pM6REWyDCfh7tMOaBcjiUUnvfAyRLNaJ1PNesAzHlfPUt0BAo3YSBFk8vp6hXgLP8DEytemiDzzrS4A9JjjHTADuNh0PMOHlP3uUacMxJn10OH5QvutSdFEpVeaVM0lrgPHPKD_Ka1GyzifBFcwqr7gjrN913IROyNSF3cdVzhyqyK25IDqd5kQV7aSX',
      itemsList: [
        { name: 'Tall Glass Vase', qty: 2 },
        { name: 'Crystal Tumbler', qty: 4 },
        { name: 'Glass Serving Bowl', qty: 2 }
      ]
    },
    {
      id: 'BNDL-Office-A',
      name: 'BNDL-Office-A',
      description: 'Desk Accessories',
      itemsCount: 12,
      status: 'IN PROGRESS',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2zLEXG7fnNXUeFQzzSjCnp95jTJIRqxvSZB6bMEznid9XD2h4Pn57ZgXRjK335FW2i5kP6BswGd9qDg3oDF09COxy36wbr_IzCXM36IN1PcMEsFYpEEJN02VVV2oj8mx6F5XMhUV0Ltz4KMBoZL5mXGk4t_U8qUWx-Q90UdT8i1xtq6P6sVh2R0TTCXAoZU-cRsg0KntrXrItdznrhrmUnurngqS7uSFpnUCH7521tU00oDlnJ0C1',
      itemsList: [
        { name: 'Glass Pen Holder', qty: 3 },
        { name: 'Refractive Paperweight', qty: 2 },
        { name: 'Frosted Glass Tray', qty: 7 }
      ]
    }
  ];

  // Map context packs if available to append to visual bundles list
  const mappedPacks = packs ? packs.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description || 'Custom Pack Bundle',
    itemsCount: p.items.reduce((acc, curr) => acc + curr.qty, 0),
    status: p.status || 'READY',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoITYPCj98Ir8wuFpIuWNp1XEFqml0bZHzOXuk0v2GljfL-Tsd9u2WuCY_pM6REWyDCfh7tMOaBcjiUUnvfAyRLNaJ1PNesAzHlfPUt0BAo3YSBFk8vp6hXgLP8DEytemiDzzrS4A9JjjHTADuNh0PMOHlP3uUacMxJn10OH5QvutSdFEpVeaVM0lrgPHPKD_Ka1GyzifBFcwqr7gjrN913IROyNSF3cdVzhyqyK25IDqd5kQV7aSX', // fallback image
    itemsList: p.items.map(i => ({ name: i.name, qty: i.qty }))
  })) : [];

  const allBundles = [...defaultBundles, ...mappedPacks];

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      {/* Hero Header */}
      <div className="mb-10">
        <h1 className="font-display-lg text-display-lg text-on-surface dark:text-white tracking-tight">Worker Dashboard</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-zinc-400 mt-2">
          Welcome back, {profile.name}. Your allocated modules are active for this session.
        </p>
      </div>

      {/* Worker Profile Card */}
      <section className="glass-card rounded-[2rem] p-8 flex flex-col md:flex-row gap-8 items-start relative dark:bg-zinc-900/30 border border-white/60 dark:border-white/10 shadow-sm">
        <div className="relative group self-center md:self-start">
          <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-white/60 dark:border-zinc-800 shadow-lg relative bg-surface-container">
            <img
              className="w-full h-full object-cover"
              alt="Worker Profile"
              src={profile.avatar}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                className="p-2 bg-white rounded-full text-primary hover:scale-110 transition-transform shadow-md"
                onClick={() => fileInputRef.current.click()}
              >
                <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
              </button>
            </div>
          </div>
          <input
            className="hidden"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePfpChange}
          />
        </div>

        <div className="flex-1 w-full space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-on-surface dark:text-white leading-tight">
                {profile.name}
              </h2>
              <p className="text-body-md text-on-surface-variant dark:text-zinc-400">
                {profile.role}
              </p>
            </div>
            {isEditingProfile ? (
              <div className="flex gap-2">
                <button
                  onClick={handleEditProfileSave}
                  className="flex items-center gap-2 bg-primary text-white border border-primary/20 px-4 py-2 rounded-xl font-bold hover:shadow-lg transition-all text-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Save
                </button>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="flex items-center gap-2 bg-white/20 dark:bg-white/5 border border-white/60 dark:border-white/10 px-4 py-2 rounded-xl font-bold dark:text-white hover:bg-white/40 dark:hover:bg-white/10 transition-all text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setEditedProfile({ ...profile });
                  setIsEditingProfile(true);
                }}
                className="flex items-center gap-2 bg-white/40 dark:bg-white/5 border border-white/80 dark:border-white/10 px-4 py-2 rounded-xl text-primary dark:text-primary-container font-bold hover:bg-white/60 dark:hover:bg-white/10 transition-all text-sm"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Edit Profile
              </button>
            )}
          </div>

          {isEditingProfile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-zinc-400 opacity-60">Full Name</label>
                <input
                  type="text"
                  className="w-full bg-white/40 dark:bg-zinc-800 border border-white/60 dark:border-white/10 rounded-xl px-3 py-1.5 text-on-surface dark:text-white focus:ring-0 focus:border-primary text-sm"
                  value={editedProfile.name}
                  onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-zinc-400 opacity-60">Email</label>
                <input
                  type="email"
                  className="w-full bg-white/40 dark:bg-zinc-800 border border-white/60 dark:border-white/10 rounded-xl px-3 py-1.5 text-on-surface dark:text-white focus:ring-0 focus:border-primary text-sm"
                  value={editedProfile.email}
                  onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-zinc-400 opacity-60">Assigned Facility</label>
                <input
                  type="text"
                  className="w-full bg-white/40 dark:bg-zinc-800 border border-white/60 dark:border-white/10 rounded-xl px-3 py-1.5 text-on-surface dark:text-white focus:ring-0 focus:border-primary text-sm"
                  value={editedProfile.facility}
                  onChange={(e) => setEditedProfile({ ...editedProfile, facility: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant dark:text-zinc-500 block">Login ID</label>
                <span className="font-semibold text-sm text-on-surface dark:text-white">{profile.loginId}</span>
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant dark:text-zinc-500 block">Authority Level</label>
                <span className="font-semibold text-sm text-on-surface dark:text-white">{profile.authorityLevel}</span>
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant dark:text-zinc-500 block">Email</label>
                <span className="font-semibold text-sm text-on-surface dark:text-white">{profile.email}</span>
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant dark:text-zinc-500 block">Assigned Facility</label>
                <span className="font-semibold text-sm text-on-surface dark:text-white">{profile.facility}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Bento Grid Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Active Tasks Card (Sales Focus) */}
        <div className="lg:col-span-8 glass-panel p-glass-padding rounded-3xl min-h-[400px] flex flex-col dark:bg-zinc-900/30 border border-white/60 dark:border-white/10 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="font-headline-md text-headline-md text-on-surface dark:text-white">Pending Sales Orders</h2>
            <button
              onClick={() => setShowOrderModal(true)}
              className="bg-primary-container text-white dark:text-on-primary-container px-6 py-2.5 rounded-full font-label-md text-label-md font-bold shadow-lg hover:scale-105 transition-transform"
            >
              Create New Order
            </button>
          </div>
          <div className="flex-1 overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/40 dark:border-zinc-800 font-label-md text-label-md text-on-surface-variant dark:text-zinc-400 uppercase tracking-widest">
                  <th className="pb-4 font-semibold">Order ID</th>
                  <th className="pb-4 font-semibold">Customer</th>
                  <th className="pb-4 font-semibold">Items</th>
                  <th className="pb-4 font-semibold">Status</th>
                  <th className="pb-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20 dark:divide-zinc-800">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-on-surface-variant dark:text-zinc-500 font-medium">
                      No pending sales orders in floor queue.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="group hover:bg-white/10 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 font-bold text-primary dark:text-primary-container">{order.id}</td>
                      <td className="py-4 text-on-surface dark:text-white">{order.customer}</td>
                      <td className="py-4 text-on-surface-variant dark:text-zinc-400">{order.items}</td>
                      <td className="py-4">
                        {order.status === 'Picking' && (
                          <span className="bg-[#FF6D1F]/20 text-[#FF6D1F] px-3 py-1 rounded-full font-label-sm text-label-sm font-bold border border-[#FF6D1F]/30">
                            Picking
                          </span>
                        )}
                        {order.status === 'Queued' && (
                          <span className="bg-tertiary-container/20 text-tertiary px-3 py-1 rounded-full font-label-sm text-label-sm font-bold border border-tertiary-container/30">
                            Queued
                          </span>
                        )}
                        {order.status === 'Ready' && (
                          <span className="bg-[#4CAF50]/20 text-[#4CAF50] px-3 py-1 rounded-full font-label-sm text-label-sm font-bold border border-[#4CAF50]/30">
                            Ready
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleProcessOrder(order.id)}
                          className="text-primary dark:text-primary-container hover:underline font-bold text-sm"
                        >
                          {order.status === 'Queued' && 'Process'}
                          {order.status === 'Picking' && 'Complete Pack'}
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

        {/* Session Stats (Worker Specific) */}
        <div className="lg:col-span-4 flex flex-col gap-gutter">
          {/* Active Timer Card */}
          <div className="glass-card rounded-[2rem] p-glass-padding dark:bg-zinc-900/30 border border-white/60 dark:border-white/10 shadow-sm flex flex-col justify-between h-48 animate-[fadeIn_0.4s_ease-out]">
            <div className="flex justify-between items-center text-on-surface-variant dark:text-zinc-400">
              <span className="font-label-md text-label-md uppercase tracking-widest">Active Session Duration</span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
            </div>
            <div className="text-display-lg font-display-lg text-primary select-all font-mono leading-none tracking-tight">
              {formatElapsed(elapsedSeconds)}
            </div>
            <div className="text-xs text-on-surface-variant dark:text-zinc-400 font-medium">
              Floor Manager Chen logged in at 08:30 AM
            </div>
          </div>

          {/* Activity Metrics Card */}
          <div className="glass-card rounded-[2rem] p-glass-padding dark:bg-zinc-900/30 border border-white/60 dark:border-white/10 shadow-sm flex flex-col justify-between h-48 animate-[fadeIn_0.5s_ease-out]">
            <h3 className="font-label-md text-label-md text-on-surface-variant dark:text-zinc-400 uppercase tracking-widest">Shift Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold text-on-surface dark:text-white">18</p>
                <p className="text-xs text-on-surface-variant dark:text-zinc-500 font-medium">Orders Handled</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#4CAF50]">99.4%</p>
                <p className="text-xs text-on-surface-variant dark:text-zinc-500 font-medium">Accuracy Rate</p>
              </div>
            </div>
            <div className="h-1 bg-white/40 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-[90%] rounded-full shadow-[0_0_8px_rgba(76,175,80,0.5)]"></div>
            </div>
          </div>
        </div>

        {/* Bundle Management (Secondary Allowed View) */}
        <div className="lg:col-span-12 glass-panel p-glass-padding rounded-3xl dark:bg-zinc-900/30 border border-white/60 dark:border-white/10 shadow-sm animate-[fadeIn_0.6s_ease-out]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface dark:text-white">Inventory Bundles</h2>
              <p className="font-body-md text-on-surface-variant dark:text-zinc-400">Allocated items for current picking wave.</p>
            </div>
            <div className="flex gap-2 self-end sm:self-center">
              <button
                onClick={() => triggerAlert('Filtering packages by picking wave status.', 'Filters')}
                className="p-2 glass-panel rounded-lg hover:bg-white/40 dark:hover:bg-white/10 text-on-surface dark:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">filter_list</span>
              </button>
              <button
                onClick={() => triggerAlert('Sorting packages alphabetically.', 'Sorting')}
                className="p-2 glass-panel rounded-lg hover:bg-white/40 dark:hover:bg-white/10 text-on-surface dark:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">sort</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {allBundles.map((bundle) => (
              <div
                key={bundle.id}
                onClick={() => setSelectedBundle(bundle)}
                className="bg-white/20 dark:bg-white/5 border border-white/60 dark:border-zinc-800 p-4 rounded-2xl flex flex-col gap-3 hover:bg-white/30 dark:hover:bg-white/10 transition-all cursor-pointer shadow-sm group"
              >
                <div className="h-32 rounded-xl overflow-hidden mb-2 bg-surface-container relative">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    alt={bundle.name}
                    src={bundle.image}
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="flex justify-between items-start">
                  <span className="font-label-md text-label-md font-bold text-on-surface dark:text-white truncate max-w-[120px]">
                    {bundle.name}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      bundle.status === 'READY'
                        ? 'bg-[#4CAF50]/20 text-[#4CAF50]'
                        : 'bg-primary/20 text-primary'
                    }`}
                  >
                    {bundle.status}
                  </span>
                </div>
                <p className="text-label-sm text-on-surface-variant dark:text-zinc-400">
                  {bundle.itemsCount} Items • {bundle.description}
                </p>
              </div>
            ))}

            {/* Placeholder for restricted content visualization */}
            <div className="col-span-1 sm:col-span-2 glass-panel rounded-2xl flex flex-col items-center justify-center border-dashed border-2 border-white/40 dark:border-zinc-700 bg-white/5 py-8 px-4 h-full min-h-[220px]">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/20 dark:text-zinc-600/40">lock</span>
              <p className="text-label-md text-on-surface-variant/40 dark:text-zinc-500 mt-2 font-bold italic">
                Admin Restricted Module
              </p>
              <p className="text-[10px] text-on-surface-variant/30 dark:text-zinc-600 text-center max-w-[180px] mt-1 font-medium">
                Analytics and inventory pricing configuration are restricted to shift admins.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button (Task Focused) */}
      <button
        onClick={() => setShowOrderModal(true)}
        title="Quick Order Creation"
        className="fixed bottom-10 right-10 w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 hover:shadow-primary/40 transition-all z-40 animate-[bounce_2s_infinite]"
      >
        <span className="material-symbols-outlined text-3xl">add_shopping_cart</span>
      </button>

      {/* Modal: Create Pending Order */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowOrderModal(false)}
          ></div>
          <div className="glass-panel-high w-full max-w-md rounded-[2rem] p-8 space-y-6 bg-white/95 dark:bg-zinc-900/95 border border-white/80 dark:border-white/10 shadow-2xl relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-white">Create Pending Order</h2>
                <p className="text-on-surface-variant dark:text-zinc-400 opacity-70">Add a new customer picking task to queue</p>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-on-surface-variant dark:text-zinc-400 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="space-y-6" onSubmit={handleCreateOrder}>
              <div className="space-y-2">
                <label className="text-label-md font-label-md text-on-surface-variant dark:text-zinc-300">Customer Name</label>
                <input
                  className="w-full bg-white/40 dark:bg-zinc-800 border border-white/60 dark:border-white/10 rounded-2xl py-3 px-4 focus:ring-0 focus:border-primary-container text-on-surface dark:text-white"
                  placeholder="e.g. Acme Corporation"
                  type="text"
                  required
                  value={newOrder.customer}
                  onChange={(e) => setNewOrder({ ...newOrder, customer: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-label-md font-label-md text-on-surface-variant dark:text-zinc-300">Items (Description)</label>
                <input
                  className="w-full bg-white/40 dark:bg-zinc-800 border border-white/60 dark:border-white/10 rounded-2xl py-3 px-4 focus:ring-0 focus:border-primary-container text-on-surface dark:text-white"
                  placeholder="e.g. 10x Mirror Vases"
                  type="text"
                  required
                  value={newOrder.items}
                  onChange={(e) => setNewOrder({ ...newOrder, items: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-label-md font-label-md text-on-surface-variant dark:text-zinc-300">Initial Status</label>
                <select
                  className="w-full bg-white/40 dark:bg-zinc-800 border border-white/60 dark:border-white/10 rounded-2xl py-3 px-4 focus:ring-0 focus:border-primary-container text-on-surface dark:text-white"
                  value={newOrder.status}
                  onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
                >
                  <option value="Queued" className="text-on-surface bg-background">Queued</option>
                  <option value="Picking" className="text-on-surface bg-background">Picking</option>
                  <option value="Ready" className="text-on-surface bg-background">Ready</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 py-3 border border-white/60 dark:border-white/10 rounded-2xl font-bold hover:bg-white/40 dark:hover:bg-white/5 dark:text-white transition-all text-sm active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg hover:bg-primary-container transition-all text-sm active:scale-95"
                >
                  Queue Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bundle Item Details */}
      {selectedBundle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedBundle(null)}
          ></div>
          <div className="glass-panel-high w-full max-w-md rounded-[2rem] p-8 space-y-6 bg-white/95 dark:bg-zinc-900/95 border border-white/80 dark:border-white/10 shadow-2xl relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-white">{selectedBundle.name}</h2>
                <p className="text-on-surface-variant dark:text-zinc-400 opacity-70">Allocated wave picking item details</p>
              </div>
              <button
                onClick={() => setSelectedBundle(null)}
                className="text-on-surface-variant dark:text-zinc-400 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div className="h-40 rounded-2xl overflow-hidden bg-surface-container border border-white/40">
                <img
                  className="w-full h-full object-cover"
                  alt={selectedBundle.name}
                  src={selectedBundle.image}
                />
              </div>
              <div className="border-t border-white/20 dark:border-zinc-800 pt-4">
                <h4 className="text-label-md font-bold text-on-surface dark:text-white uppercase tracking-wider mb-2">Items to Pick:</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                  {selectedBundle.itemsList ? (
                    selectedBundle.itemsList.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white/20 dark:bg-white/5 border border-white/40 dark:border-zinc-800 rounded-xl px-4 py-2.5">
                        <span className="font-medium text-on-surface dark:text-white text-sm">{item.name}</span>
                        <span className="bg-primary/10 text-primary dark:text-primary-container px-2 py-0.5 rounded text-xs font-bold font-mono">
                          QTY: {item.qty}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-on-surface-variant">No item list defined for this bundle.</div>
                  )}
                </div>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  triggerAlert(`Wave picking initialized for bundle "${selectedBundle.name}". Instructions sent to barcode terminals.`, 'Picking Dispatch');
                  setSelectedBundle(null);
                }}
                className="w-full py-3.5 bg-primary text-white font-bold rounded-2xl shadow-lg hover:bg-primary-container transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">barcode_scanner</span>
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
