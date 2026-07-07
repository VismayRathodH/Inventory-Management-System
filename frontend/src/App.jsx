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

  // Derive currentView from location pathname for legacy components
  const currentPath = location.pathname.substring(1);
  const currentView = currentPath || (role === 'worker' ? 'worker_dashboard' : 'dashboard');

  const setCurrentView = (view) => {
    navigate(`/${view}`);
  };

  const handleLogin = (userRole) => {
    const finalRole = userRole || 'admin';
    setIsLoggedIn(true);
    setRole(finalRole);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', finalRole);
    if (finalRole === 'worker') {
      navigate('/worker_dashboard');
    } else {
      navigate('/dashboard');
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
      role={role}
    >
      <Routes>
        {role === 'worker' ? (
          <>
            <Route path="/worker_dashboard" element={<WorkerDashboard setCurrentView={setCurrentView} />} />
            <Route path="/sales" element={<SalesBillingTerminal setCurrentView={setCurrentView} />} />
            <Route path="/bundles" element={<BundlesManagement setCurrentView={setCurrentView} />} />
            <Route path="*" element={<Navigate to="/worker_dashboard" replace />} />
          </>
        ) : (
          <>
            <Route path="/dashboard" element={<Dashboard setCurrentView={setCurrentView} />} />
            <Route path="/categories" element={<CategoryList setCurrentView={setCurrentView} />} />
            <Route path="/add_category" element={<AddCategory setCurrentView={setCurrentView} />} />
            <Route path="/inventory" element={<InventoryList setCurrentView={setCurrentView} />} />
            <Route path="/add_item" element={<AddItem setCurrentView={setCurrentView} />} />
            <Route path="/notifications" element={<Notifications setCurrentView={setCurrentView} />} />
            <Route path="/sales" element={<SalesBillingTerminal setCurrentView={setCurrentView} />} />
            <Route path="/bundles" element={<BundlesManagement setCurrentView={setCurrentView} />} />
            <Route path="/analytics" element={<AdvancedAnalytics setCurrentView={setCurrentView} />} />
            <Route path="/export" element={<InvoiceHistoryExport setCurrentView={setCurrentView} />} />
            <Route path="/admin_profile" element={<AdminProfile setCurrentView={setCurrentView} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
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
