import React, { useState } from 'react';
import api from '../api/axios';

const Login = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState('admin'); // 'admin' or 'worker'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (email && password) {
      setLoading(true);
      try {
        const response = await api.post('/auth/login/', {
          email: email,
          password: password
        });
        localStorage.setItem('token', response.data.token);
        if (response.data.user) {
          localStorage.setItem('userData', JSON.stringify(response.data.user));
        }
        onLogin(response.data.role);
      } catch (err) {
        setError(err.response?.data?.error || 'Invalid credentials or server error.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-container-padding-mobile md:p-container-padding-desktop transition-colors duration-300 relative w-full overflow-hidden">
      
      {/* Ambient Dynamic Background */}
      <div className="ambient-bg">
        <div className="ambient-blob blob-1"></div>
        <div className="ambient-blob blob-2"></div>
      </div>

      {/* Login Box */}
      <main className="w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="font-display-lg text-display-lg text-primary tracking-tight flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
            StockGlass
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
            {activeTab === 'worker' ? 'Worker Station' : 'Admin Console'}
          </p>
        </div>

        {/* Glass Card */}
        <div className="glass-panel rounded-xl p-8 md:p-10 relative overflow-hidden">
          {/* Subtle top shine effect */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
          
          {/* Tab Switcher */}
          <div className="flex bg-white/20 dark:bg-white/5 rounded-xl p-1 mb-6 border border-white/40 dark:border-white/10 relative z-10">
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setError('');
                setEmail('');
                setPassword('');
              }}
              className={`flex-1 py-2 text-center text-label-md font-bold rounded-lg transition-all ${
                activeTab === 'admin'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-primary dark:hover:text-primary-container'
              }`}
            >
              Admin Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('worker');
                setError('');
                setEmail('worker@stockglass.com');
                setPassword('worker123');
              }}
              className={`flex-1 py-2 text-center text-label-md font-bold rounded-lg transition-all ${
                activeTab === 'worker'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-primary dark:hover:text-primary-container'
              }`}
            >
              Worker Sign In
            </button>
          </div>

          <h2 className="font-headline-md text-headline-md mb-4 text-on-surface">
            {activeTab === 'worker' ? 'Worker Sign In' : 'Sign In'}
          </h2>
          
          {error && (
            <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">error</span>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant block" htmlFor="email">
                {activeTab === 'worker' ? 'Worker ID / Email' : 'Email Address'}
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">mail</span>
                <input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeTab === 'worker' ? 'worker@stockglass.com' : 'admin@stockglass.com'} 
                  required 
                  className="input-glass w-full py-3 pl-10 pr-4 font-body-md text-body-md text-on-surface placeholder-on-surface-variant/50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-label-md text-on-surface-variant block" htmlFor="password">Password</label>
                {activeTab === 'admin' && (
                  <a className="font-label-sm text-label-sm text-primary hover:text-surface-tint transition-colors" href="#forgot">Forgot password?</a>
                )}
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">lock</span>
                <input 
                  id="password" 
                  name="password" 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required 
                  className="input-glass w-full py-3 pl-10 pr-10 font-body-md text-body-md text-on-surface placeholder-on-surface-variant/50"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary-container hover:bg-surface-tint text-white font-label-md text-label-md py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex justify-center items-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:-translate-y-0 disabled:cursor-not-allowed"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
              </button>
            </div>
            
            <div className="mt-6 text-center">
              {activeTab === 'worker' ? (
                <p className="font-body-md text-body-md text-primary font-bold text-xs bg-primary/5 p-2.5 rounded-lg border border-primary/25">
                  Demo Worker Credentials Pre-filled. Click Sign In to open Worker Dashboard.
                </p>
              ) : (
                <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                  Secure access for authorized personnel only.
                </p>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;
