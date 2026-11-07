import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Layers,
  Building,
  User,
  Plane,
  AlertTriangle,
  ClockAlert,
  CheckCircle2,
  ChevronRight,
  ArrowUpDown,
  Tag,
  ShieldAlert,
} from 'lucide-react';
import {
  UnifiedCase,
  CaseStatus,
  Priority,
  ComplaintCategory,
  Region,
} from '../types';

interface CasesModuleProps {
  cases: UnifiedCase[];
  onSelectCase: (caseItem: UnifiedCase) => void;
  onOpenCreateModal: () => void;
}

export const CasesModule: React.FC<CasesModuleProps> = ({
  cases,
  onSelectCase,
  onOpenCreateModal,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');

  // Filter cases
  const filteredCases = cases.filter((c) => {
    // Search match
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.caseNumber.toLowerCase().includes(q) ||
      c.bookingReference.toLowerCase().includes(q) ||
      c.customerName.toLowerCase().includes(q) ||
      c.agencyName.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.destination.toLowerCase().includes(q);

    // Filter matches
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
    const matchesRegion = regionFilter === 'ALL' || c.agencyRegion === regionFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesRegion;
  });

  const categories: ComplaintCategory[] = [
    'Hotel Booking Cancellation',
    'Refund Delay',
    'Alternative Booking Requested',
    'Check-In Refusal / Room Unavailable',
    'Flight Schedule Change',
    'Name Correction / Voucher Discrepancy',
    'Supplier Payment Dispute',
    'Transfer No-Show',
    'Visa / Travel Advisory Issue',
  ];

  const regions: Region[] = [
    'South India',
    'North India',
    'West India',
    'UAE & Middle East',
    'Southeast Asia',
    'Europe',
  ];

  return (
    <div className="space-y-5">
      {/* Module Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#263B5B] tracking-tight">
            Case Management & Unification
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Group related travel tickets into unified operational cases with full booking context
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4267D5] hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Case / Complaint</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Case #, Booking Ref (e.g. TR123), Customer, or Agency..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#4267D5] focus:bg-white"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-[#4267D5]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Escalated">Escalated</option>
              <option value="Pending Supplier">Pending Supplier</option>
              <option value="Resolved">Resolved</option>
            </select>

            {/* Priority */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-[#4267D5]"
            >
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Category */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-[#4267D5] max-w-[180px] truncate"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Region */}
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-[#4267D5]"
            >
              <option value="ALL">All Regions</option>
              {regions.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>

            {/* Reset Filters */}
            {(search ||
              statusFilter !== 'ALL' ||
              priorityFilter !== 'ALL' ||
              categoryFilter !== 'ALL' ||
              regionFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('ALL');
                  setPriorityFilter('ALL');
                  setCategoryFilter('ALL');
                  setRegionFilter('ALL');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 underline px-1"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cases List */}
      <div className="space-y-3">
        {filteredCases.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No matching cases found</h3>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search criteria or filter selections.
            </p>
          </div>
        ) : (
          filteredCases.map((c) => {
            const checkInTime = new Date(c.checkInDate).getTime();
            const hoursToCheckIn = (checkInTime - Date.now()) / (1000 * 3600);
            const isImminent = hoursToCheckIn > 0 && hoursToCheckIn <= 2;

            return (
              <div
                key={c.id}
                onClick={() => onSelectCase(c)}
                className={`bg-white rounded-xl border p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer group ${
                  c.priority === 'Critical'
                    ? 'border-rose-300 hover:border-rose-400'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Left Column: Case Number, Titles, Badges */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-[#263B5B] group-hover:text-[#4267D5] transition-colors">
                        {c.caseNumber}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                        Ref: {c.bookingReference}
                      </span>
                      <span className="text-xs text-slate-500">
                        • {c.destination}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          c.priority === 'Critical'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : c.priority === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : c.priority === 'Medium'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c.priority}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'Escalated'
                            ? 'bg-rose-600 text-white'
                            : c.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {c.status}
                      </span>
                      {c.isEscalated && (
                        <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
                          <ShieldAlert className="w-3 h-3" />
                          ESCALATED
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-slate-800 leading-snug">
                      {c.title}
                    </h3>

                    {/* Metadata strip */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-[#20A89E]" />
                        <strong>{c.agencyName}</strong> ({c.agencyRegion})
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#4267D5]" />
                        {c.customerName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        {c.category}
                      </span>
                      <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full text-[11px]">
                        {c.ticketIds.length} Linked Tickets
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Travel Deadline, Agent & Action */}
                  <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      {isImminent ? (
                        <div className="text-xs font-bold text-rose-600 flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Check-in: {hoursToCheckIn.toFixed(1)}h away</span>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 font-medium">
                          Check-in: {new Date(c.checkInDate).toLocaleDateString()}
                        </div>
                      )}
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Assigned: <strong className="text-slate-800">{c.assignedAgentName}</strong>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCase(c);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-100 group-hover:bg-[#4267D5] group-hover:text-white text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>Open Case</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
