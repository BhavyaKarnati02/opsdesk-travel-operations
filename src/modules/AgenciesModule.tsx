import React, { useState } from 'react';
import {
  Building2,
  Search,
  Phone,
  Mail,
  User,
  MapPin,
  FolderKanban,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  X,
  Layers,
  Plane,
} from 'lucide-react';
import { Agency, UnifiedCase, Booking } from '../types';

interface AgenciesModuleProps {
  agencies: Agency[];
  cases: UnifiedCase[];
  bookings: Booking[];
  onSelectCase: (caseItem: UnifiedCase) => void;
}

export const AgenciesModule: React.FC<AgenciesModuleProps> = ({
  agencies,
  cases,
  bookings,
  onSelectCase,
}) => {
  const [search, setSearch] = useState('');
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(agencies[0] || null);

  const filteredAgencies = agencies.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.code.toLowerCase().includes(q) ||
      a.region.toLowerCase().includes(q) ||
      a.contactPerson.toLowerCase().includes(q)
    );
  });

  // Data for selected agency
  const agencyCases = selectedAgency
    ? cases.filter((c) => c.agencyId === selectedAgency.id)
    : [];
  const agencyBookings = selectedAgency
    ? bookings.filter((b) => b.agencyId === selectedAgency.id)
    : [];

  return (
    <div className="space-y-5">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#263B5B] tracking-tight">
            Travel Agency Partner Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor B2B agency relationships, active bookings, complaint histories, and support load
          </p>
        </div>
      </div>

      {/* Main Grid: Agency List on left, Selected Agency Profile on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Agencies List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agency by name, code (ABCT), or contact..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#4267D5]"
            />
          </div>

          <div className="space-y-2.5">
            {filteredAgencies.map((agency) => {
              const isSelected = selectedAgency?.id === agency.id;
              const openCount = cases.filter(
                (c) => c.agencyId === agency.id && c.status !== 'Resolved'
              ).length;

              return (
                <div
                  key={agency.id}
                  onClick={() => setSelectedAgency(agency)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#4267D5] shadow-md ring-2 ring-[#4267D5]/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#263B5B]">{agency.name}</span>
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                          {agency.code}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            agency.tier === 'Platinum'
                              ? 'bg-purple-100 text-purple-800'
                              : agency.tier === 'Gold'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {agency.tier}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{agency.region}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block ${
                          openCount > 0
                            ? 'bg-rose-100 text-rose-800 font-semibold'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {openCount} Open Issues
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {agency.activeBookingsCount} Active Bookings
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Agency Detailed Profile (7 cols) */}
        <div className="lg:col-span-7">
          {selectedAgency ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              {/* Header Profile banner */}
              <div className="bg-[#263B5B] text-white p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#20A89E] to-[#4267D5] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold">{selectedAgency.name}</h2>
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono">
                          {selectedAgency.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Region: <strong>{selectedAgency.region}</strong> • Tier:{' '}
                        <strong>{selectedAgency.tier} Partner</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#354E75] text-xs">
                  <div className="flex items-center gap-2 text-slate-200">
                    <User className="w-4 h-4 text-[#20A89E] shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400">Primary Contact</div>
                      <div className="font-semibold">{selectedAgency.contactPerson}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <Mail className="w-4 h-4 text-[#4267D5] shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400">Operations Email</div>
                      <div className="font-semibold truncate">{selectedAgency.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400">Direct Phone</div>
                      <div className="font-semibold">{selectedAgency.phone}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Strip */}
              <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50 border-b border-slate-200 py-3 text-center text-xs">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Active Bookings
                  </div>
                  <div className="text-lg font-bold text-[#263B5B] mt-0.5">
                    {selectedAgency.activeBookingsCount}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Total Cases
                  </div>
                  <div className="text-lg font-bold text-[#263B5B] mt-0.5">
                    {agencyCases.length}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Open Complaints
                  </div>
                  <div className="text-lg font-bold text-rose-600 mt-0.5">
                    {agencyCases.filter((c) => c.status !== 'Resolved').length}
                  </div>
                </div>
              </div>

              {/* Related Cases Section */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#263B5B] flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#4267D5]" />
                    <span>Associated Operational Cases ({agencyCases.length})</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Click to investigate case</span>
                </div>

                <div className="space-y-2">
                  {agencyCases.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => onSelectCase(c)}
                      className="p-3 rounded-lg border border-slate-200 hover:border-[#4267D5] hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-800 group-hover:text-[#4267D5]">
                            {c.caseNumber}
                          </span>
                          <span className="font-mono text-[10px] bg-slate-100 px-1.5 rounded">
                            {c.bookingReference}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 rounded-full font-bold ${
                              c.priority === 'Critical'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {c.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-medium">{c.title}</p>
                        <span className="text-[10px] text-slate-400">
                          Customer: {c.customerName} • {c.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            c.status === 'Resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {c.status}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#4267D5]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Bookings Section */}
              <div className="p-5 pt-0 space-y-3">
                <h3 className="text-sm font-bold text-[#263B5B] flex items-center gap-1.5">
                  <Plane className="w-4 h-4 text-[#20A89E]" />
                  <span>Recent Agency Bookings ({agencyBookings.length})</span>
                </h3>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
                  {agencyBookings.slice(0, 4).map((b) => (
                    <div key={b.id} className="p-2.5 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-800">
                            {b.bookingReference}
                          </span>
                          <span className="text-slate-500">• {b.type}</span>
                        </div>
                        <div className="text-slate-600">{b.serviceName}</div>
                      </div>
                      <div className="text-right text-[11px]">
                        <span className="font-semibold text-slate-700">{b.destination}</span>
                        <div className="text-slate-400">
                          {new Date(b.checkInDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
              Select an agency from the left to view detailed operational profile.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
