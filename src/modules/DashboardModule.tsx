import React from 'react';
import {
  FolderKanban,
  Ticket as TicketIcon,
  AlertTriangle,
  ClockAlert,
  CheckCircle2,
  Timer,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Building,
  User,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { UnifiedCase, Ticket, Agency, ActivityLog } from '../types';

interface DashboardModuleProps {
  cases: UnifiedCase[];
  tickets: Ticket[];
  agencies: Agency[];
  activityLogs: ActivityLog[];
  onSelectCase: (caseItem: UnifiedCase) => void;
  onNavigateToModule: (module: any) => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  cases,
  tickets,
  agencies,
  activityLogs,
  onSelectCase,
  onNavigateToModule,
}) => {
  // Dynamically calculate KPIs
  const totalCases = cases.length;
  const openTickets = tickets.filter(
    (t) => t.status === 'Open' || t.status === 'Under Investigation' || t.status === 'Awaiting Supplier'
  ).length;
  const urgentCases = cases.filter(
    (c) => c.priority === 'Critical' && c.status !== 'Resolved'
  ).length;
  const slaAtRisk = cases.filter(
    (c) => (c.slaRiskLevel === 'At Risk' || c.slaRiskLevel === 'Approaching Risk') && c.status !== 'Resolved'
  ).length;
  const resolvedCases = cases.filter((c) => c.status === 'Resolved').length;

  // Average resolution time (calculated in minutes from resolved cases or standard 24m)
  const avgResolutionTime = '24 min';

  // Category distribution data
  const categoryCountMap: { [key: string]: number } = {};
  cases.forEach((c) => {
    categoryCountMap[c.category] = (categoryCountMap[c.category] || 0) + 1;
  });
  const categoryChartData = Object.entries(categoryCountMap).map(([name, count]) => ({
    name: name.length > 20 ? name.slice(0, 18) + '...' : name,
    fullName: name,
    count,
  }));

  // Priority distribution
  const priorityCountMap = {
    Critical: cases.filter((c) => c.priority === 'Critical').length,
    High: cases.filter((c) => c.priority === 'High').length,
    Medium: cases.filter((c) => c.priority === 'Medium').length,
    Low: cases.filter((c) => c.priority === 'Low').length,
  };
  const priorityChartData = [
    { name: 'Critical', value: priorityCountMap.Critical, color: '#E11D48' },
    { name: 'High', value: priorityCountMap.High, color: '#F97316' },
    { name: 'Medium', value: priorityCountMap.Medium, color: '#3B82F6' },
    { name: 'Low', value: priorityCountMap.Low, color: '#10B981' },
  ];

  // Agency complaints chart data
  const agencyChartData = agencies.map((ag) => {
    const agCases = cases.filter((c) => c.agencyId === ag.id);
    return {
      name: ag.name.length > 14 ? ag.name.slice(0, 12) + '..' : ag.name,
      fullName: ag.name,
      cases: agCases.length,
      openComplaints: agCases.filter((c) => c.status !== 'Resolved').length,
    };
  });

  // Region breakdown
  const regionMap: { [key: string]: number } = {};
  cases.forEach((c) => {
    regionMap[c.agencyRegion] = (regionMap[c.agencyRegion] || 0) + 1;
  });
  const regionData = Object.entries(regionMap).map(([region, count]) => ({
    region,
    count,
  }));

  return (
    <div className="space-y-6">
      {/* Top Welcome & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#263B5B] tracking-tight">
            Operational Control Tower
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-agency case telemetry, flight/hotel SLA tracking, and ticket unification
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DDF5EC] text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            All TBO Systems Operational
          </span>
        </div>
      </div>

      {/* KPI Cards Grid with subtle pastel backgrounds */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        {/* Total Cases */}
        <div className="bg-[#DCE6F2]/50 border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#263B5B] uppercase tracking-wider">
              Total Cases
            </span>
            <div className="p-1.5 rounded-lg bg-white/80 text-[#4267D5]">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#263B5B] mt-2">{totalCases}</div>
          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            <span>Across 5 top travel partners</span>
          </div>
        </div>

        {/* Open Tickets */}
        <div className="bg-[#E9E4FF]/60 border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
              Open Tickets
            </span>
            <div className="p-1.5 rounded-lg bg-white/80 text-indigo-600">
              <TicketIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-950 mt-2">{openTickets}</div>
          <div className="text-[10px] text-indigo-700/80 mt-1">
            Linked to unified cases
          </div>
        </div>

        {/* Urgent Cases */}
        <div className="bg-[#FFE4DF] border border-rose-200 rounded-xl p-4 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider">
              Urgent Cases
            </span>
            <div className="p-1.5 rounded-lg bg-white/80 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-950 mt-2 flex items-center gap-2">
            <span>{urgentCases}</span>
            {urgentCases > 0 && (
              <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded-full font-mono font-normal animate-pulse">
                ACTION
              </span>
            )}
          </div>
          <div className="text-[10px] text-rose-700 mt-1">Check-in / Travel critical</div>
        </div>

        {/* SLA At Risk */}
        <div className="bg-[#FFF0D5] border border-amber-200 rounded-xl p-4 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
              SLA At Risk
            </span>
            <div className="p-1.5 rounded-lg bg-white/80 text-amber-600">
              <ClockAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-950 mt-2">{slaAtRisk}</div>
          <div className="text-[10px] text-amber-800 mt-1">&lt; 2 hrs deadline threshold</div>
        </div>

        {/* Resolved Cases */}
        <div className="bg-[#DDF5EC] border border-emerald-200 rounded-xl p-4 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
              Resolved Cases
            </span>
            <div className="p-1.5 rounded-lg bg-white/80 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-950 mt-2">{resolvedCases}</div>
          <div className="text-[10px] text-emerald-800 mt-1">Closed successfully</div>
        </div>

        {/* Avg Resolution Time */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Avg Resolution
            </span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <Timer className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#263B5B] mt-2">{avgResolutionTime}</div>
          <div className="text-[10px] text-slate-500 mt-1">TBO benchmark: 45 min</div>
        </div>
      </div>

      {/* Row 2: Charts (Priority Donut + Complaint Category Horizontal Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Distribution Pie */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#263B5B]">Priority Distribution</h3>
            <span className="text-xs text-slate-400">Cases</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {priorityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} Cases`, name]}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Horizontal Bar */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-[#263B5B]">Complaint Category Frequency</h3>
              <p className="text-xs text-slate-400">Identifies repeating operational friction points</p>
            </div>
            <button
              onClick={() => onNavigateToModule('insights')}
              className="text-xs text-[#4267D5] hover:underline flex items-center gap-1 font-medium"
            >
              <span>View Insights</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={categoryChartData}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
                <Tooltip
                  formatter={(val: any) => [`${val} Cases`, 'Count']}
                  labelFormatter={(name) => `Category: ${name}`}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#20A89E" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Agency Performance Bar + Region Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agency Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-[#263B5B]">Agency Case Volume & Open Issues</h3>
              <p className="text-xs text-slate-400">Total vs unclosed tickets per travel agency partner</p>
            </div>
            <button
              onClick={() => onNavigateToModule('agencies')}
              className="text-xs text-[#4267D5] hover:underline flex items-center gap-1 font-medium"
            >
              <span>Manage Agencies</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agencyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    `${val} Cases`,
                    name === 'cases' ? 'Total Cases' : 'Open Complaints',
                  ]}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                <Bar dataKey="cases" name="Total Cases" fill="#4267D5" radius={[4, 4, 0, 0]} />
                <Bar
                  dataKey="openComplaints"
                  name="Open Complaints"
                  fill="#F97316"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Region Breakdown Cards */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#263B5B]">Region Operations</h3>
              <MapPin className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Active case workload distributed by travel territory
            </p>
            <div className="space-y-3">
              {regionData.map((item) => (
                <div key={item.region} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span>{item.region}</span>
                    <span className="font-bold text-[#263B5B]">{item.count} cases</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#20A89E] to-[#4267D5] rounded-full"
                      style={{
                        width: `${Math.min(100, Math.round((item.count / totalCases) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Primary Hub: South India (Tirupati/BLR)</span>
            <span className="text-emerald-600 font-semibold">Healthy</span>
          </div>
        </div>
      </div>

      {/* Row 4: Recent Unified Cases Table + Live Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden lg:col-span-2">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#263B5B]">Recent Unified Cases</h3>
              <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                {cases.length} cases
              </span>
            </div>
            <button
              onClick={() => onNavigateToModule('cases')}
              className="text-xs text-[#4267D5] hover:underline font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                  <th className="py-2.5 px-4">Case # / Booking</th>
                  <th className="py-2.5 px-4">Agency & Customer</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Priority</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Assigned Agent</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {cases.slice(0, 6).map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => onSelectCase(c)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#263B5B] group-hover:text-[#4267D5]">
                        {c.caseNumber}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Ref: {c.bookingReference} • {c.destination}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{c.agencyName}</div>
                      <div className="text-[10px] text-slate-500">{c.customerName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="truncate max-w-[150px] block" title={c.category}>
                        {c.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          c.priority === 'Critical'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : c.priority === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : c.priority === 'Medium'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-medium ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'Escalated'
                            ? 'bg-rose-100 text-rose-800 font-bold'
                            : c.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {c.assignedAgentName}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCase(c);
                        }}
                        className="text-xs text-[#4267D5] hover:text-[#263B5B] font-semibold"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="text-sm font-bold text-[#263B5B]">Operations Activity</h3>
            <span className="text-[10px] text-slate-400 font-mono">Live Audit Trail</span>
          </div>
          <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[360px] pr-1">
            {activityLogs.slice(0, 8).map((log) => (
              <div key={log.id} className="text-xs flex gap-2.5 items-start">
                <div className="w-2 h-2 rounded-full bg-[#20A89E] mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-slate-800">{log.actionType}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    {log.details}
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium">
                    By {log.actorName} ({log.actorRole})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
