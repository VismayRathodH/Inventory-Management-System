import { useState } from 'react';
import { InventoryProvider } from './context/InventoryContext';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CategoryList from './pages/CategoryList';
import AddCategory from './pages/AddCategory';
import InventoryList from './pages/InventoryList';
import AddItem from './pages/AddItem';
import Notifications from './pages/Notifications';

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [currentView, setCurrentView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  if (!isLoggedIn) {
    return (
      <Login 
        onLogin={handleLogin} 
      />
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard setCurrentView={setCurrentView} />;
      case 'categories':
        return <CategoryList setCurrentView={setCurrentView} searchQuery={searchQuery} />;
      case 'add_category':
        return <AddCategory setCurrentView={setCurrentView} />;
      case 'inventory':
        return <InventoryList setCurrentView={setCurrentView} searchQuery={searchQuery} />;
      case 'add_item':
        return <AddItem setCurrentView={setCurrentView} />;
      case 'notifications':
        return <Notifications setCurrentView={setCurrentView} />;
      default:
        return <Dashboard setCurrentView={setCurrentView} />;
    }
  };

  return (
    <AppLayout
      currentView={currentView}
      setCurrentView={setCurrentView}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      {renderView()}
    </AppLayout>
  );
}

function App() {
  return (
    <InventoryProvider>
      <AppContent />
    </InventoryProvider>
  );
}

export default App;
