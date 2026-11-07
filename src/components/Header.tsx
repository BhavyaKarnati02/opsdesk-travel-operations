import React from 'react';
import {
  Search,
  Plus,
  AlertTriangle,
  UserCheck,
  Building,
  Bell,
  Clock,
} from 'lucide-react';
import { UnifiedCase } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCreateModal: () => void;
  urgentCases: UnifiedCase[];
  onSelectCase: (caseItem: UnifiedCase) => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
  urgentCases,
  onSelectCase,
}) => {
  const topCritical = urgentCases.find((c) => c.priority === 'Critical' && c.status !== 'Resolved');

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

      {/* Right Actions: Travel Urgency Warning, Create Button, Profile */}
      <div className="flex items-center gap-3">
        {/* Dynamic Travel Urgency Alert if any critical check-in is pending */}
        {topCritical && (
          <button
            onClick={() => onSelectCase(topCritical)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FFE4DF] border border-rose-300 text-rose-800 text-xs font-semibold hover:bg-rose-100 transition-colors animate-pulse"
            title="Click to open critical case immediately"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="hidden sm:inline">
              Travel Urgency: {topCritical.bookingReference} Check-In Imminent!
            </span>
            <span className="sm:hidden font-mono">{topCritical.bookingReference}</span>
          </button>
        )}

        {/* Create Ticket / Complaint Button */}
        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#20A89E] hover:bg-[#1b8f87] text-white text-xs font-semibold shadow-xs shadow-teal-900/10 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Complaint</span>
        </button>

        {/* User / Agent Duty Profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#E9E4FF] text-[#4267D5] font-bold text-xs flex items-center justify-center border border-[#4267D5]/20">
            BK
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-800 leading-tight">Bhavya K.</div>
            <div className="text-[10px] text-slate-500 font-medium">TBO Duty Lead</div>
          </div>
        </div>
      </div>
    </header>
  );
};
