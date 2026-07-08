import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { InventoryProvider } from './context/InventoryContext';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CategoryList from './pages/CategoryList';
import AddCategory from './pages/AddCategory';
import InventoryList from './pages/InventoryList';
import AddItem from './pages/AddItem';
import Notifications from './pages/Notifications';
import SalesBillingTerminal from './pages/SalesBillingTerminal';
import BundlesManagement from './pages/BundlesManagement';
import AdvancedAnalytics from './pages/AdvancedAnalytics';
import InvoiceHistoryExport from './pages/InvoiceHistoryExport';
import AdminProfile from './pages/AdminProfile';
import WorkerDashboard from './pages/WorkerDashboard';

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [role, setRole] = useState(() => {
    return localStorage.getItem('userRole') || 'admin';
  });

  const location = useLocation();
  const navigate = useNavigate();

  const getRoleCategory = (rawRole) => {
    const r = (rawRole || '').toLowerCase();
    if (r.includes('admin') || r.includes('lead operations')) return 'admin';
    if (r.includes('sales')) return 'sales';
    if (r.includes('inventory')) return 'inventory';
    if (r.includes('analytics')) return 'analytics';
    return 'worker';
  };

  const roleCategory = getRoleCategory(role);

  // Derive currentView from location pathname for legacy components
  const currentPath = location.pathname.substring(1);
  const currentView = currentPath || (roleCategory === 'admin' ? 'dashboard' : 'worker_dashboard');

  const setCurrentView = (view) => {
    navigate(`/${view}`);
  };

  const handleLogin = (userRole) => {
    const finalRole = userRole || 'admin';
    setIsLoggedIn(true);
    setRole(finalRole);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', finalRole);
    const rc = getRoleCategory(finalRole);
    if (rc === 'admin') {
      navigate('/dashboard');
    } else {
      navigate('/worker_dashboard');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    navigate('/');
  };

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="*" element={<Login onLogin={handleLogin} />} />
      </Routes>
    );
  }

  return (
    <AppLayout
      currentView={currentView}
      setCurrentView={setCurrentView}
      handleLogout={handleLogout}
      role={roleCategory}
    >
      <Routes>
        {['admin', 'analytics'].includes(roleCategory) && (
          <Route path="/dashboard" element={<Dashboard setCurrentView={setCurrentView} />} />
        )}
        {['sales', 'inventory', 'analytics', 'worker'].includes(roleCategory) && (
          <Route path="/worker_dashboard" element={<WorkerDashboard setCurrentView={setCurrentView} />} />
        )}
        {['admin', 'sales'].includes(roleCategory) && (
          <>
            <Route path="/sales" element={<SalesBillingTerminal setCurrentView={setCurrentView} />} />
            <Route path="/bundles" element={<BundlesManagement setCurrentView={setCurrentView} />} />
          </>
        )}
        {['admin', 'inventory'].includes(roleCategory) && (
          <>
            <Route path="/categories" element={<CategoryList setCurrentView={setCurrentView} />} />
            <Route path="/add_category" element={<AddCategory setCurrentView={setCurrentView} />} />
            <Route path="/add_item" element={<AddItem setCurrentView={setCurrentView} />} />
          </>
        )}
        {['admin', 'sales', 'inventory'].includes(roleCategory) && (
          <Route path="/inventory" element={<InventoryList setCurrentView={setCurrentView} roleCategory={roleCategory} />} />
        )}
        {['admin', 'analytics'].includes(roleCategory) && (
          <>
            <Route path="/notifications" element={<Notifications setCurrentView={setCurrentView} />} />
            <Route path="/analytics" element={<AdvancedAnalytics setCurrentView={setCurrentView} />} />
          </>
        )}
        {['admin'].includes(roleCategory) && (
          <>
            <Route path="/export" element={<InvoiceHistoryExport setCurrentView={setCurrentView} />} />
            <Route path="/admin_profile" element={<AdminProfile setCurrentView={setCurrentView} />} />
          </>
        )}
        <Route path="*" element={<Navigate to={roleCategory === 'admin' ? "/dashboard" : "/worker_dashboard"} replace />} />
      </Routes>
    </AppLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <InventoryProvider>
        <AppContent />
      </InventoryProvider>
    </BrowserRouter>
  );
}

export default App;
