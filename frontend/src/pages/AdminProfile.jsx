import React, { useState, useRef, useContext } from 'react';
import { InventoryContext } from '../context/InventoryContext';

const AdminProfile = () => {
  const { triggerAlert } = useContext(InventoryContext);

  // Admin Profile State
  const [profile, setProfile] = useState({
    name: 'Alex Sterling',
    role: 'System Administrator & Lead Operations',
    loginId: 'AST-992-LG',
    authorityLevel: 'Tier 1 Restricted',
    email: 'a.sterling@stockglass.io',
    facility: 'Central Hub - Sector G',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTXQVHiaX0Q8zCa8-2SXA3vEwnDD40HhVESrYFgasSxMmdZpI0hq67hBbHBH7K6T_TgVt45-OSB5oAUm-fDio9AMMBTcODKjKsThPgs0uWOzSeT20eirtGKcl0LahEOc3IuxES3kH9qmjFIZMxLHEZfai105bwnPtGwk3XR4jHfA6q3GxwqzFQrWwhJLubMnZFCU0HMEVuSmMr7FiBbh0zvrH9LMHj_jhZ_iwRiOrSCRaXBQuOjGTj'
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ ...profile });

  // Worker List State
  const [workers, setWorkers] = useState([
    {
      id: '#WK-4401',
      name: 'Jordan Hayes',
      role: 'Shift Supervisor',
      status: 'Active',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpEW1mZZs9BxQ-ukMTr2hLBeyhal7rP0iZubdDQAM8ZftPNksGIc_u22POog7p9ST_yFocNCg_AWpPDFK9SPHg0Zg7jmJyaZUiaJP5r9NVzWCET_UGxRSJzKPYnwXP70KwMFezY0Vs_PZXB_QmhaHWB37Wf8KRqAHwaLSARQsc_EpYAqlH0w9h_LT12zTFv2FfOONLAZ0xVY2bmBSm9DXwWJ2uTKlPrbFyeqB4pXELkfE6cmmOKRtT'
    },
    {
      id: '#WK-4402',
      name: 'Sarah Chen',
      role: 'Inventory Auditor',
      status: 'Active',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhqsWGwLOApEgsxPzESkB8fOphze0NpcynQRjXG5VUV9ahUGakrHXQsWZWhkRxUwESjIqDsuQmtTFTRQVZLKQ1lBj4KJdhbDU8S8pYIQz722gnJ3bsKtEHNVVy3_RtnJ9c9znkUL_Ed4krzAdoOBeq4rJ-PGEES_2DMjCkzN3_Oq-4amN9cjZyqn54m0ywKYVTqhXYlgP2jrJcUU777UDNmHkAktw3DIrbLGi_-1ksWRG1UcdwTYnJ'
    },
    {
      id: '#WK-4398',
      name: 'Marcus Vane',
      role: 'Stock Handler',
      status: 'Break',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3vi8s8oLnj7F_6a1LPuxyp3XJdA2_jpFbLFDkrl4kAb65_LUIBdQohn4Vvn2EZWpI3Q5Yaw33BcxjFxa_2maZs-lmxiwNdHx8YkCmURl7S1pztxLDCq3vDZTMoEkGsNpy4E1RgMQzHJRNdzoSdsvRnx6flKM99cOpawd2y59crXWFMswEfj29XfiGGBg9jze7BZXnjs4Lv2MM2EUzxNeRSLgfIVGFmjiv4rqqpjAX8s1uTNKWJqoe'
    },
    {
      id: '#WK-4405',
      name: 'Elena Rodriguez',
      role: 'Packing Lead',
      status: 'Offline',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWK-g0F-YPijWnAQ6hkxTUtMrEfSZ4o5HESo_S0Wpyt9k_2y7fAHPNMk_iFw8G95h6wcRhJy8mr8zLUNpZNI3IdS2lpQaJSnp1cEGbjtzodfVvxePQKeMdWhjtE1yBa5GLY_u1vmeN9OVu3uou281OrLRlFM7jwYy22ZROG-8OCK2XhpwtErSVU3a_voGGjJ-CWstafUATLglOVm-GA9Nqc7NSLuQyQWi9--wMzUUAZUVZaroxvAv0'
    }
  ]);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWorker, setNewWorker] = useState({
    name: '',
    loginId: '',
    password: '',
    authority: 'Analytics', // Sales, Inventory, Analytics
    manualMode: false,
    permissions: {
      salesTerminal: false,
      inventoryManagement: false,
      notifications: false,
      billingExport: false,
      categories: false
    }
  });

  // Action Menu State (for updating worker status or deleting)
  const [activeMenuWorkerId, setActiveMenuWorkerId] = useState(null);

  // File Input Ref
  const fileInputRef = useRef(null);

  // Edit Profile Profile Picture Upload
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
    triggerAlert('Administrator profile updated successfully.', 'Success');
  };

  // Add Worker Handler
  const handleAddWorkerSubmit = (e) => {
    e.preventDefault();
    if (!newWorker.name || !newWorker.loginId) {
      triggerAlert('Please provide at least a worker name and login ID.', 'Validation Error');
      return;
    }

    const roleMap = {
      Sales: 'Sales Operator',
      Inventory: 'Inventory Controller',
      Analytics: 'Analytics Operator'
    };

    const workerObj = {
      id: `#WK-${newWorker.loginId.replace(/[^0-9]/g, '') || Math.floor(1000 + Math.random() * 9000)}`,
      name: newWorker.name,
      role: roleMap[newWorker.authority] || 'Operator',
      status: 'Active',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBrqqfLDuDuqEHZvcnUYe0jGzS6CIK5tfW-QddwYHGonfEYY1bPj_czYd0uH66EuZB2b2j9EJUBylHbNoeee1MAvKViIRSa0vjuab9_SL19I-6y1-SlkPDvVsOTUDaWcqjh5GECxBTQKuyv8MPytliOrWdKwqt_afHX7acGCAMslx31akYdqqGG6scXQRuREVklqwfdS46sDNwIfum3dA9gd1UgfLLMI4ijP2u3w3mQFZ0Qhtncp9u'
    };

    setWorkers((prev) => [...prev, workerObj]);
    setShowAddModal(false);
    // Reset Form
    setNewWorker({
      name: '',
      loginId: '',
      password: '',
      authority: 'Analytics',
      manualMode: false,
      permissions: {
        salesTerminal: false,
        inventoryManagement: false,
        notifications: false,
        billingExport: false,
        categories: false
      }
    });
    triggerAlert(`New worker "${workerObj.name}" added successfully to the shift monitor.`, 'Worker Added');
  };

  // Worker Actions
  const handleStatusChange = (id, newStatus) => {
    setWorkers((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: newStatus } : w))
    );
    setActiveMenuWorkerId(null);
  };

  const handleDeleteWorker = (id) => {
    const deleted = workers.find((w) => w.id === id);
    setWorkers((prev) => prev.filter((w) => w.id !== id));
    setActiveMenuWorkerId(null);
    if (deleted) {
      triggerAlert(`Worker "${deleted.name}" has been removed from the session list.`, 'Worker Removed');
    }
  };

  // Capacity calculation (e.g. out of 16 limit)
  const activeWorkersCount = workers.filter((w) => w.status === 'Active').length;
  const capacityPercent = Math.min(Math.round((activeWorkersCount / 16) * 100), 100);

  const handleGlobalAllocation = () => {
    triggerAlert(
      'Global task allocation triggered. Pending sales and warehouse picking tasks have been distributed to all active worker devices.',
      'Allocation Completed'
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-[fadeIn_0.3s_ease-out]">
      {/* Header Section: Admin Profile */}
      <section className="glass-card rounded-[2rem] p-8 flex flex-col md:flex-row gap-10 items-start relative dark:bg-zinc-900/30 border border-white/60 dark:border-white/10 shadow-sm">
        <div className="relative group self-center md:self-start">
          <div className="w-48 h-48 rounded-[2.5rem] overflow-hidden border-4 border-white/60 dark:border-zinc-800 shadow-lg relative bg-surface-container">
            <img
              className="w-full h-full object-cover"
              alt="Admin Profile"
              src={profile.avatar}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button
                type="button"
                className="p-2 bg-white rounded-full text-primary hover:scale-110 transition-transform shadow-md"
                onClick={() => fileInputRef.current.click()}
              >
                <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
              </button>
              <button
                type="button"
                className="p-2 bg-error-container text-on-error-container rounded-full hover:scale-110 transition-transform shadow-md"
                onClick={() => setProfile((prev) => ({ ...prev, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIrlEtfHq-B8pGZvaflp2wkzWZoz-byXCuTsK3jJrYlTdZhC_5OTTj7Wwfqeq6miirvuZUAxqgTBppTRcheHil05H3hkJYT3kfxsL7KbokFGXItB5uFH3ikgRjwkGkMToxRqXNTDIOorduofdxtkI9it3FLi6vQyI5aQodh8aZRoEfUssRqEh66WCBjHz8INSOGdljessgq4P-6vj21lACBmlfC4DKj98o_LDP-ly3fyqyT3qxPSvC' }))}
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
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
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => fileInputRef.current.click()}
              className="text-label-sm font-label-sm bg-white/40 dark:bg-white/5 dark:text-white px-3 py-1 rounded-full border border-white/60 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
            >
              Add Photo
            </button>
            <button
              onClick={() => setProfile((prev) => ({ ...prev, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIrlEtfHq-B8pGZvaflp2wkzWZoz-byXCuTsK3jJrYlTdZhC_5OTTj7Wwfqeq6miirvuZUAxqgTBppTRcheHil05H3hkJYT3kfxsL7KbokFGXItB5uFH3ikgRjwkGkMToxRqXNTDIOorduofdxtkI9it3FLi6vQyI5aQodh8aZRoEfUssRqEh66WCBjHz8INSOGdljessgq4P-6vj21lACBmlfC4DKj98o_LDP-ly3fyqyT3qxPSvC' }))}
              className="text-label-sm font-label-sm text-error/80 px-3 py-1 rounded-full border border-white/60 dark:border-white/10 hover:bg-error-container hover:text-on-error-container transition-colors"
            >
              Remove
            </button>
          </div>
        </div>

        <div className="flex-1 w-full space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-white leading-tight">
                {profile.name}
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-zinc-400">
                {profile.role}
              </p>
            </div>
            {isEditingProfile ? (
              <div className="flex gap-2">
                <button
                  onClick={handleEditProfileSave}
                  className="flex items-center gap-2 bg-primary text-white border border-primary/20 px-4 py-2 rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  Save
                </button>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="flex items-center gap-2 bg-white/20 dark:bg-white/5 border border-white/60 dark:border-white/10 px-4 py-2 rounded-xl font-bold dark:text-white hover:bg-white/40 dark:hover:bg-white/10 transition-all"
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
                className="flex items-center gap-2 bg-white/40 dark:bg-white/5 border border-white/80 dark:border-white/10 px-6 py-2 rounded-xl text-primary dark:text-primary-container font-bold hover:bg-white/60 dark:hover:bg-white/10 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">edit</span>
                Edit Details
              </button>
            )}
          </div>

          {isEditingProfile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-zinc-400 opacity-60">Full Name</label>
                <input
                  type="text"
                  className="w-full bg-white/40 dark:bg-zinc-800 border border-white/60 dark:border-white/10 rounded-xl px-3 py-2 text-on-surface dark:text-white focus:ring-0 focus:border-primary"
                  value={editedProfile.name}
                  onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-zinc-400 opacity-60">Role Title</label>
                <input
                  type="text"
                  className="w-full bg-white/40 dark:bg-zinc-800 border border-white/60 dark:border-white/10 rounded-xl px-3 py-2 text-on-surface dark:text-white focus:ring-0 focus:border-primary"
                  value={editedProfile.role}
                  onChange={(e) => setEditedProfile({ ...editedProfile, role: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-zinc-400 opacity-60">Login ID</label>
                <input
                  type="text"
                  className="w-full bg-white/40 dark:bg-zinc-800 border border-white/60 dark:border-white/10 rounded-xl px-3 py-2 text-on-surface dark:text-white focus:ring-0 focus:border-primary"
                  value={editedProfile.loginId}
                  onChange={(e) => setEditedProfile({ ...editedProfile, loginId: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-zinc-400 opacity-60">Authority Level</label>
                <input
                  type="text"
                  className="w-full bg-white/40 dark:bg-zinc-800 border border-white/60 dark:border-white/10 rounded-xl px-3 py-2 text-on-surface dark:text-white focus:ring-0 focus:border-primary"
                  value={editedProfile.authorityLevel}
                  onChange={(e) => setEditedProfile({ ...editedProfile, authorityLevel: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-zinc-400 opacity-60">Primary Email</label>
                <input
                  type="email"
                  className="w-full bg-white/40 dark:bg-zinc-800 border border-white/60 dark:border-white/10 rounded-xl px-3 py-2 text-on-surface dark:text-white focus:ring-0 focus:border-primary"
                  value={editedProfile.email}
                  onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-zinc-400 opacity-60">Assigned Facility</label>
                <input
                  type="text"
                  className="w-full bg-white/40 dark:bg-zinc-800 border border-white/60 dark:border-white/10 rounded-xl px-3 py-2 text-on-surface dark:text-white focus:ring-0 focus:border-primary"
                  value={editedProfile.facility}
                  onChange={(e) => setEditedProfile({ ...editedProfile, facility: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-zinc-400 opacity-60">Login ID</label>
                <p className="font-headline-md text-headline-md border-b-2 border-white/25 dark:border-zinc-800 pb-1">{profile.loginId}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-zinc-400 opacity-60">Authority Level</label>
                <p className="font-headline-md text-headline-md border-b-2 border-white/25 dark:border-zinc-800 pb-1">{profile.authorityLevel}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-zinc-400 opacity-60">Primary Email</label>
                <p className="font-body-lg text-body-lg border-b-2 border-white/25 dark:border-zinc-800 pb-1">{profile.email}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-zinc-400 opacity-60">Assigned Facility</label>
                <p className="font-body-lg text-body-lg border-b-2 border-white/25 dark:border-zinc-800 pb-1">{profile.facility}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Bento Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Live Worker Status Monitor */}
        <div className="lg:col-span-2 glass-card rounded-[2rem] p-glass-padding overflow-hidden flex flex-col h-[600px] relative dark:bg-zinc-900/30 border border-white/60 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white">Live Worker Status</h3>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 text-label-md font-label-md"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Add Member
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-white/40 dark:border-zinc-800">
                  <th className="pb-4 font-label-md text-label-md text-on-surface-variant dark:text-zinc-400">Worker</th>
                  <th className="pb-4 font-label-md text-label-md text-on-surface-variant dark:text-zinc-400">Role</th>
                  <th className="pb-4 font-label-md text-label-md text-on-surface-variant dark:text-zinc-400">ID</th>
                  <th className="pb-4 font-label-md text-label-md text-on-surface-variant dark:text-zinc-400">Status</th>
                  <th className="pb-4 font-label-md text-label-md text-on-surface-variant dark:text-zinc-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20 dark:divide-zinc-800">
                {workers.map((worker) => (
                  <tr key={worker.id} className="group hover:bg-white/10 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-variant border border-white/40 dark:border-zinc-700 overflow-hidden">
                        <img
                          className="w-full h-full object-cover"
                          alt={worker.name}
                          src={worker.avatar}
                        />
                      </div>
                      <span className="font-bold text-on-surface dark:text-white">{worker.name}</span>
                    </td>
                    <td className="py-4 text-on-surface-variant dark:text-zinc-400">{worker.role}</td>
                    <td className="py-4 font-mono text-sm text-on-surface-variant dark:text-zinc-500">{worker.id}</td>
                    <td className="py-4">
                      {worker.status === 'Active' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-bold border border-green-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Active
                        </span>
                      )}
                      {worker.status === 'Break' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/20 text-primary-container text-xs font-bold border border-primary-container/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                          Break
                        </span>
                      )}
                      {worker.status === 'Offline' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container dark:bg-zinc-800 text-on-secondary-container dark:text-zinc-400 text-xs font-bold border border-white/40 dark:border-zinc-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          Offline
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-right relative">
                      <button
                        onClick={() => setActiveMenuWorkerId(activeMenuWorkerId === worker.id ? null : worker.id)}
                        className="p-2 hover:bg-white/40 dark:hover:bg-white/10 rounded-lg text-on-surface-variant dark:text-zinc-400"
                      >
                        <span className="material-symbols-outlined">more_horiz</span>
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuWorkerId === worker.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActiveMenuWorkerId(null)}
                          ></div>
                          <div className="absolute right-0 mt-1 w-44 rounded-xl shadow-lg bg-white dark:bg-zinc-800 border border-white/60 dark:border-zinc-700 z-20 overflow-hidden text-left py-1 text-sm">
                            <div className="px-3 py-1 text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest border-b border-white/20 dark:border-zinc-700">
                              Change Status
                            </div>
                            <button
                              onClick={() => handleStatusChange(worker.id, 'Active')}
                              className="w-full px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-on-surface dark:text-zinc-200 flex items-center gap-2"
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Active
                            </button>
                            <button
                              onClick={() => handleStatusChange(worker.id, 'Break')}
                              className="w-full px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-on-surface dark:text-zinc-200 flex items-center gap-2"
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Break
                            </button>
                            <button
                              onClick={() => handleStatusChange(worker.id, 'Offline')}
                              className="w-full px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-on-surface dark:text-zinc-200 flex items-center gap-2"
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-zinc-400"></span> Offline
                            </button>
                            <div className="border-t border-white/20 dark:border-zinc-700 my-1"></div>
                            <button
                              onClick={() => handleDeleteWorker(worker.id)}
                              className="w-full px-4 py-2 hover:bg-error-container/20 text-error flex items-center gap-2 font-bold"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Metrics & Quick Actions */}
        <div className="flex flex-col gap-gutter">
          {/* Metrics Card */}
          <div className="glass-card rounded-[2rem] p-glass-padding flex-1 flex flex-col justify-between dark:bg-zinc-900/30 border border-white/60 dark:border-white/10 shadow-sm animate-[fadeIn_0.4s_ease-out]">
            <h4 className="font-label-md text-label-md text-on-surface-variant dark:text-zinc-400 uppercase tracking-widest mb-4">
              Worker Metrics
            </h4>
            <div className="space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-display-lg font-display-lg text-primary">{activeWorkersCount}</p>
                  <p className="font-label-md text-label-md text-on-surface-variant dark:text-zinc-400">On-Shift Now</p>
                </div>
                <div className="w-24 h-12 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/25">
                  <span className="text-primary font-bold text-sm">+{workers.length - 4} Added</span>
                </div>
              </div>
              <div className="h-2 bg-white/40 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-container rounded-full shadow-[0_0_8px_rgba(255,109,31,0.5)] transition-all duration-500"
                  style={{ width: `${capacityPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs font-bold text-on-surface-variant dark:text-zinc-400">
                <span>Capacity: {capacityPercent}%</span>
                <span>Limit: 16 Workers</span>
              </div>
            </div>
          </div>

          {/* Quick Task Card */}
          <div className="glass-card rounded-[2rem] p-glass-padding flex-1 bg-gradient-to-br from-surface-container-high/40 to-primary-container/10 border border-primary-container/20 shadow-sm flex flex-col justify-between animate-[fadeIn_0.5s_ease-out]">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary-container text-[28px]">bolt</span>
                <h4 className="font-headline-md text-headline-md text-on-surface dark:text-white">Quick Assign</h4>
              </div>
              <p className="text-sm text-on-surface-variant dark:text-zinc-300 leading-relaxed mb-6">
                Directly allocate bulk tasks to all active workers in Sector G.
              </p>
            </div>
            <button
              onClick={handleGlobalAllocation}
              className="w-full py-4 bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 dark:text-white text-primary border border-primary/25 font-bold rounded-2xl transition-all shadow-sm active:scale-[0.98]"
            >
              Initialize Global Allocation
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Add Worker */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          ></div>
          <div className="glass-panel-high w-full max-w-lg rounded-[2rem] p-8 space-y-6 transition-transform duration-200 scale-100 bg-white/95 dark:bg-zinc-900/95 border border-white/80 dark:border-white/10 shadow-2xl relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-white">Add New Worker</h2>
                <p className="text-on-surface-variant dark:text-zinc-400 opacity-70">Configure identity and system permissions</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-on-surface-variant dark:text-zinc-400 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form className="space-y-6" onSubmit={handleAddWorkerSubmit}>
              <div className="space-y-2">
                <label className="text-label-md font-label-md text-on-surface-variant dark:text-zinc-300">Worker Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-zinc-400">
                    person
                  </span>
                  <input
                    className="w-full bg-white/40 dark:bg-zinc-800 border border-white/60 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:ring-0 focus:border-primary-container text-on-surface dark:text-white"
                    placeholder="Full Name"
                    type="text"
                    required
                    value={newWorker.name}
                    onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-label-md font-label-md text-on-surface-variant dark:text-zinc-300">Login ID</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-zinc-400">
                      fingerprint
                    </span>
                    <input
                      className="w-full bg-white/40 dark:bg-zinc-800 border border-white/60 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:ring-0 focus:border-primary-container text-on-surface dark:text-white"
                      placeholder="SG_XXX"
                      type="text"
                      required
                      value={newWorker.loginId}
                      onChange={(e) => setNewWorker({ ...newWorker, loginId: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-label-md font-label-md text-on-surface-variant dark:text-zinc-300">Password</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-zinc-400">
                      lock
                    </span>
                    <input
                      className="w-full bg-white/40 dark:bg-zinc-800 border border-white/60 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:ring-0 focus:border-primary-container text-on-surface dark:text-white"
                      placeholder="********"
                      type="password"
                      value={newWorker.password}
                      onChange={(e) => setNewWorker({ ...newWorker, password: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-label-md font-label-md text-on-surface-variant dark:text-zinc-300">Authority Level</label>
                  <button
                    className="text-xs text-primary dark:text-primary-container flex items-center gap-1 hover:underline"
                    type="button"
                    onClick={() => triggerAlert('Sales role has POS permissions, Inventory role can update stock batches, Analytics provides revenue summaries.', 'Role Info')}
                  >
                    <span className="material-symbols-outlined text-sm">info</span> Role Guidelines
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {['Sales', 'Inventory', 'Analytics'].map((role) => {
                    const isSelected = newWorker.authority === role;
                    let iconName = 'analytics';
                    if (role === 'Sales') iconName = 'shopping_cart';
                    if (role === 'Inventory') iconName = 'inventory_2';
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setNewWorker({ ...newWorker, authority: role })}
                        className={`flex flex-col items-center gap-2 p-3 border rounded-2xl transition-all duration-200 ${
                          isSelected
                            ? 'bg-primary-container/20 border-2 border-primary-container text-primary'
                            : 'bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 text-on-surface dark:text-white'
                        }`}
                      >
                        <span className={`material-symbols-outlined ${isSelected ? 'text-primary' : 'text-on-surface-variant dark:text-zinc-400'}`}>{iconName}</span>
                        <span className="text-xs font-bold">{role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-label-md font-label-md text-on-surface-variant dark:text-zinc-300">Manual Authority</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase opacity-60 text-on-surface-variant dark:text-zinc-400">
                      Enable Manual Mode
                    </span>
                    <button
                      type="button"
                      onClick={() => setNewWorker((prev) => ({ ...prev, manualMode: !prev.manualMode }))}
                      className={`w-10 h-5 rounded-full relative cursor-pointer border transition-colors ${
                        newWorker.manualMode
                          ? 'bg-primary border-primary'
                          : 'bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-3.5 h-3.5 bg-white dark:bg-zinc-800 rounded-full transition-transform ${
                          newWorker.manualMode ? 'right-0.5' : 'left-0.5'
                        }`}
                      ></div>
                    </button>
                  </div>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 transition-opacity duration-200 ${newWorker.manualMode ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                  {[
                    { id: 'salesTerminal', label: 'Sales Terminal' },
                    { id: 'inventoryManagement', label: 'Inventory Management' },
                    { id: 'notifications', label: 'Notifications' },
                    { id: 'billingExport', label: 'Billing & Export' },
                    { id: 'categories', label: 'Categories' }
                  ].map((perm) => (
                    <label
                      key={perm.id}
                      className="flex items-center gap-3 p-3 bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-xl cursor-pointer hover:bg-white/60 dark:hover:bg-white/10 text-on-surface dark:text-white text-xs font-bold"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-white/60 text-primary focus:ring-0 bg-transparent"
                        checked={newWorker.permissions[perm.id]}
                        onChange={(e) =>
                          setNewWorker((prev) => ({
                            ...prev,
                            permissions: {
                              ...prev.permissions,
                              [perm.id]: e.target.checked
                            }
                          }))
                        }
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  className="flex-1 py-3 border border-white/60 dark:border-white/10 rounded-2xl font-bold hover:bg-white/40 dark:hover:bg-white/5 dark:text-white transition-all text-sm active:scale-95"
                  onClick={() => setShowAddModal(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    const randomId = Math.floor(1000 + Math.random() * 9000);
                    setNewWorker((prev) => ({ ...prev, loginId: `SG-${randomId}` }));
                    triggerAlert(`Generated temporary login ID: SG-${randomId}. Authority levels applied.`, 'Role Generated');
                  }}
                  className="flex-1 py-3 border border-primary-container/30 text-primary dark:text-primary-container font-bold rounded-2xl hover:bg-primary-container/10 transition-all flex items-center justify-center gap-2 text-sm active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">key</span> Assign Role
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary-container text-white font-bold rounded-2xl shadow-lg shadow-primary-container/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
