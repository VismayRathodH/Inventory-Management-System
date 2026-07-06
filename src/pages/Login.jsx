import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      onLogin();
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
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Admin Console</p>
        </div>

        {/* Glass Card */}
        <div className="glass-panel rounded-xl p-8 md:p-10 relative overflow-hidden">
          {/* Subtle top shine effect */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
          
          <h2 className="font-headline-md text-headline-md mb-6 text-on-surface">Sign In</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant block" htmlFor="email">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">mail</span>
                <input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@stockglass.com" 
                  required 
                  className="input-glass w-full py-3 pl-10 pr-4 font-body-md text-body-md text-on-surface placeholder-on-surface-variant/50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-label-md text-on-surface-variant block" htmlFor="password">Password</label>
                <a className="font-label-sm text-label-sm text-primary hover:text-surface-tint transition-colors" href="#forgot">Forgot password?</a>
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
                className="w-full bg-primary-container hover:bg-surface-tint text-white font-label-md text-label-md py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex justify-center items-center gap-2 transform hover:-translate-y-0.5"
              >
                Sign In
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                Secure access for authorized personnel only.
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;
