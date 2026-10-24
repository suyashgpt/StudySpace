import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Grid,
  Receipt,
  Wallet,
  CalendarCheck,
  BookOpen,
  BarChart3,
  Sparkles,
  Radio,
  ShieldCheck,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isExpanded?: boolean;
  onHoverChange?: (expanded: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isExpanded: controlledExpanded,
  onHoverChange,
}) => {
  const [internalHover, setInternalHover] = useState(false);
  const isHovered = controlledExpanded !== undefined ? controlledExpanded : internalHover;

  const handleMouseEnter = () => {
    setInternalHover(true);
    onHoverChange?.(true);
  };

  const handleMouseLeave = () => {
    setInternalHover(false);
    onHoverChange?.(false);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `group relative flex items-center rounded-xl text-xs font-semibold transition-all duration-200 overflow-hidden ${
      isHovered
        ? 'px-3.5 py-2.5 gap-3.5'
        : 'px-3.5 py-2.5 gap-3.5 lg:justify-center lg:px-0 lg:py-2.5'
    } ${
      isActive
        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Modern White / Light Sidebar */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white text-slate-700 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-200/80 ${
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
        } lg:translate-x-0 ${
          isHovered ? 'lg:w-64 lg:shadow-xl lg:shadow-slate-300/40' : 'lg:w-20 lg:shadow-xs'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-slate-100 overflow-hidden">
          <div className="flex items-center min-w-0">
            {/* Sanctuary Botanical Emblem */}
            <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 transition-transform duration-300 hover:scale-105">
              <Sparkles className="w-5 h-5 text-white" />
            </div>

            {/* Brand Title */}
            <div
              className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                isHovered
                  ? 'opacity-100 max-w-xs ml-3'
                  : 'max-w-xs ml-3 lg:opacity-0 lg:max-w-0 lg:ml-0'
              }`}
            >
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none">
                  StudySpace
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
              </div>
              <span className="text-[11px] font-medium text-slate-500 tracking-normal block mt-1">
                Sanctuary Chambers
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-6">
          {/* Section 1: OVERVIEW */}
          <div>
            <div
              className={`px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 overflow-hidden transition-all duration-300 whitespace-nowrap ${
                isHovered ? 'opacity-100 max-h-6' : 'max-h-6 lg:opacity-0 lg:max-h-0 lg:pb-0'
              }`}
            >
              OVERVIEW
            </div>
            <NavLink
              to="/"
              onClick={onClose}
              title={!isHovered ? 'Dashboard' : undefined}
              className={navLinkClass}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              <span
                className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                  isHovered ? 'opacity-100 max-w-xs' : 'max-w-xs lg:opacity-0 lg:max-w-0'
                }`}
              >
                Dashboard
              </span>
            </NavLink>
          </div>

          {/* Section 2: OPERATIONS */}
          <div className="space-y-1">
            <div
              className={`px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 overflow-hidden transition-all duration-300 whitespace-nowrap ${
                isHovered ? 'opacity-100 max-h-6' : 'max-h-6 lg:opacity-0 lg:max-h-0 lg:pb-0'
              }`}
            >
              OPERATIONS
            </div>

            <NavLink
              to="/students"
              onClick={onClose}
              title={!isHovered ? 'Students & Members' : undefined}
              className={navLinkClass}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span
                className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                  isHovered ? 'opacity-100 max-w-xs' : 'max-w-xs lg:opacity-0 lg:max-w-0'
                }`}
              >
                Students & Members
              </span>
            </NavLink>

            <NavLink
              to="/desks"
              onClick={onClose}
              title={!isHovered ? 'Desk Allocation' : undefined}
              className={navLinkClass}
            >
              <Grid className="w-4 h-4 shrink-0" />
              <span
                className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                  isHovered ? 'opacity-100 max-w-xs' : 'max-w-xs lg:opacity-0 lg:max-w-0'
                }`}
              >
                Desk Allocation
              </span>
            </NavLink>

            <NavLink
              to="/attendance"
              onClick={onClose}
              title={!isHovered ? 'Attendance Log' : undefined}
              className={navLinkClass}
            >
              <CalendarCheck className="w-4 h-4 shrink-0" />
              <span
                className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                  isHovered ? 'opacity-100 max-w-xs' : 'max-w-xs lg:opacity-0 lg:max-w-0'
                }`}
              >
                Attendance Log
              </span>
            </NavLink>
          </div>

          {/* Section 3: FINANCE */}
          <div className="space-y-1">
            <div
              className={`px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 overflow-hidden transition-all duration-300 whitespace-nowrap ${
                isHovered ? 'opacity-100 max-h-6' : 'max-h-6 lg:opacity-0 lg:max-h-0 lg:pb-0'
              }`}
            >
              FINANCE
            </div>

            <NavLink
              to="/fees"
              onClick={onClose}
              title={!isHovered ? 'Fee Recovery' : undefined}
              className={navLinkClass}
            >
              <Receipt className="w-4 h-4 shrink-0" />
              <span
                className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                  isHovered ? 'opacity-100 max-w-xs' : 'max-w-xs lg:opacity-0 lg:max-w-0'
                }`}
              >
                Fee Recovery
              </span>
            </NavLink>

            <NavLink
              to="/expenses"
              onClick={onClose}
              title={!isHovered ? 'Operational Expenses' : undefined}
              className={navLinkClass}
            >
              <Wallet className="w-4 h-4 shrink-0" />
              <span
                className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                  isHovered ? 'opacity-100 max-w-xs' : 'max-w-xs lg:opacity-0 lg:max-w-0'
                }`}
              >
                Operational Expenses
              </span>
            </NavLink>
          </div>

          {/* Section 4: LIBRARY & AUDIT */}
          <div className="space-y-1">
            <div
              className={`px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 overflow-hidden transition-all duration-300 whitespace-nowrap ${
                isHovered ? 'opacity-100 max-h-6' : 'max-h-6 lg:opacity-0 lg:max-h-0 lg:pb-0'
              }`}
            >
              LIBRARY & AUDIT
            </div>

            <NavLink
              to="/books"
              onClick={onClose}
              title={!isHovered ? 'Book Catalog' : undefined}
              className={navLinkClass}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span
                className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                  isHovered ? 'opacity-100 max-w-xs' : 'max-w-xs lg:opacity-0 lg:max-w-0'
                }`}
              >
                Book Catalog
              </span>
            </NavLink>

            <NavLink
              to="/reports"
              onClick={onClose}
              title={!isHovered ? 'Reports & Export' : undefined}
              className={navLinkClass}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span
                className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                  isHovered ? 'opacity-100 max-w-xs' : 'max-w-xs lg:opacity-0 lg:max-w-0'
                }`}
              >
                Reports & Export
              </span>
            </NavLink>
          </div>
        </div>

        {/* Bottom Sensor/Node Badge */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          <div className="rounded-xl bg-white p-2.5 border border-slate-200/80 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 shrink-0 rounded-lg bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600">
                <Radio className="w-4 h-4 text-indigo-600 animate-pulse" />
              </div>
              <div
                className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                  isHovered ? 'opacity-100 max-w-xs' : 'max-w-xs lg:opacity-0 lg:max-w-0'
                }`}
              >
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  Central Sanctuary
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  Zone A & B Calibrated
                </p>
              </div>
            </div>
            {isHovered && <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />}
          </div>
        </div>
      </aside>
    </>
  );
};
