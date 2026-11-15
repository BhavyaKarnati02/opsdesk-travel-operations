import React, { useState } from 'react';
import {
  Search,
  Plus,
  AlertTriangle,
  LogOut,
} from 'lucide-react';
import { UnifiedCase } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCreateModal: () => void;
  urgentCases: UnifiedCase[];
  onSelectCase: (caseItem: UnifiedCase) => void;
  userName: string;
  userEmail: string;
  userRole?: string;
  onSignOut: () => Promise<void> | void;
}

function getInitials(name: string, email: string): string {
  const source = name.trim() || email.split('@')[0] || 'OP';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
  urgentCases,
  onSelectCase,
  userName,
  userEmail,
  userRole = 'agent',
  onSignOut,
}) => {
  const [signingOut, setSigningOut] = useState(false);
  const topCritical = urgentCases.find((c) => c.priority === 'Critical' && c.status !== 'Resolved');
  const initials = getInitials(userName, userEmail);

  const handleSignOutClick = async () => {
    setSigningOut(true);
    try {
      await onSignOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Case ID, Customer name, Agency, or Booking Ref (e.g. TR123)..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#4267D5] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right Actions: Travel Urgency Warning, Create Button, Signed-In Profile & Sign Out */}
      <div className="flex items-center gap-3">
        {/* Dynamic Travel Urgency Alert if any critical check-in is pending */}
        {topCritical && (
          <button
            onClick={() => onSelectCase(topCritical)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FFE4DF] border border-rose-300 text-rose-800 text-xs font-semibold hover:bg-rose-100 transition-colors animate-pulse"
            title="Click to open critical case immediately"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="hidden xl:inline">
              Travel Urgency: {topCritical.bookingReference} Check-In Imminent!
            </span>
            <span className="xl:hidden font-mono">{topCritical.bookingReference}</span>
          </button>
        )}

        {/* Create Ticket / Complaint Button */}
        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#20A89E] hover:bg-[#1b8f87] text-white text-xs font-semibold shadow-xs shadow-teal-900/10 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Complaint</span>
        </button>

        {/* Signed-In User Profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#E9E4FF] text-[#4267D5] font-bold text-xs flex items-center justify-center border border-[#4267D5]/20 shrink-0">
            {initials}
          </div>
          <div className="hidden md:block text-left max-w-[190px]">
            <div className="text-xs font-semibold text-slate-800 leading-tight truncate flex items-center gap-1.5">
              <span className="truncate">{userName}</span>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0">
                {userRole}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium truncate" title={userEmail}>
              {userEmail}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOutClick}
            disabled={signingOut}
            title="Sign Out of OpsDesk"
            className="ml-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60 shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{signingOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
