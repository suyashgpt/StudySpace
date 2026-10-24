import React from 'react';
import {
  Menu,
  Search,
  ChevronDown,
  Building2,
  LogOut,
} from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
  adminEmail?: string;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onMenuClick,
  adminEmail = 'concierge@studyspace.edu',
  onSignOut,
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-xs">
      {/* Left: Mobile hamburger & Location Selector */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Location Selector Pill */}
        <button
          type="button"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
        >
          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Quiet Pods · Central Campus</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
        </button>
      </div>

      {/* Middle: Universal Search Bar */}
      <div className="flex-1 max-w-md mx-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search members, desks or pods..."
            className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-9 pr-12 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-colors"
          />
          <span className="hidden sm:inline-flex items-center absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-white text-[10px] font-mono text-slate-500 border border-slate-200 shadow-2xs">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right: Chamber Status & Concierge Profile */}
      <div className="flex items-center gap-3">
        {/* Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/80 animate-pulse" />
          <span>Study Chamber Open</span>
          <span className="text-emerald-400">•</span>
          <span className="text-emerald-700 font-bold">84% Occupied</span>
        </div>

        {/* Chamber Concierge Profile Card */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="hidden lg:block text-right">
            <p className="text-xs font-semibold text-slate-900 leading-none">
              Chamber Concierge
            </p>
            <p className="text-[10px] text-slate-500 leading-tight mt-1">
              Day Shift Lead
            </p>
          </div>

          <div className="h-9 w-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-xs">
            CC
          </div>

          <button
            type="button"
            onClick={onSignOut}
            title={`Sign Out (${adminEmail})`}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
