import React, { useState } from 'react';

const Navbar = ({ currentView, setCurrentView, mobileOpen, setMobileOpen }) => {

  return (
    <header className="fixed top-0 right-0 w-full md:w-[calc(100%-280px)] h-16 flex justify-between items-center px-container-padding-mobile md:px-container-padding-desktop z-40 backdrop-blur-[12px] border-b border-white/60 dark:border-white/10 bg-surface-container-lowest/40 transition-all duration-300">
      
      {/* Mobile Hamburger & Logo */}
      <div className="flex items-center">
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-secondary dark:text-secondary-fixed-dim hover:text-primary transition-colors mr-2 rounded-full hover:bg-white/20"
          aria-label="Open Sidebar"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="md:hidden font-headline-md font-bold text-primary dark:text-primary-container text-[20px] mr-2">StockGlass</span>
      </div>

      <div className="flex-1 relative transition-all duration-300"></div>

      {/* Trailing Actions */}
      <div className="flex items-center gap-2 md:gap-4 ml-4">
        
        {/* User Profile Avatar */}
        <div className="h-8 w-px bg-white/60 dark:bg-white/10 hidden sm:block"></div>
        <div 
          onClick={() => setCurrentView('admin_profile')}
          title="View Admin Profile"
          className="w-8 h-8 rounded-full overflow-hidden border border-white/60 dark:border-white/20 shadow-sm cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
        >
          <img 
            alt="User avatar" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIrlEtfHq-B8pGZvaflp2wkzWZoz-byXCuTsK3jJrYlTdZhC_5OTTj7Wwfqeq6miirvuZUAxqgTBppTRcheHil05H3hkJYT3kfxsL7KbokFGXItB5uFH3ikgRjwkGkMToxRqXNTDIOorduofdxtkI9it3FLi6vQyI5aQodh8aZRoEfUssRqEh66WCBjHz8INSOGdljessgq4P-6vj21lACBmlfC4DKj98o_LDP-ly3fyqyT3qxPSvC"
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;

