import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Filter,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Building,
  CheckCircle2,
  Calendar,
  Layers,
  FileSpreadsheet,
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
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { UnifiedCase, Ticket, Agency, Booking } from '../types';

interface InsightsModuleProps {
  cases: UnifiedCase[];
  tickets: Ticket[];
  agencies: Agency[];
  bookings: Booking[];
}

export const InsightsModule: React.FC<InsightsModuleProps> = ({
  cases,
  tickets,
  agencies,
  bookings,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('ALL');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Filter cases based on selections
  const filteredCases = cases.filter((c) => {
    const booking = bookings.find((b) => b.bookingReference === c.bookingReference);
    const matchesCat = selectedCategory === 'ALL' || c.category === selectedCategory;
    const matchesSupp = selectedSupplier === 'ALL' || booking?.supplier === selectedSupplier;
    return matchesCat && matchesSupp;
  });

  // Complaint category counts
  const categoryCountMap: { [key: string]: number } = {};
  filteredCases.forEach((c) => {
    categoryCountMap[c.category] = (categoryCountMap[c.category] || 0) + 1;
  });
  const categoryData = Object.entries(categoryCountMap).map(([cat, count]) => ({
    name: cat.length > 20 ? cat.slice(0, 18) + '...' : cat,
    fullName: cat,
    count,
  }));

  // Supplier-related failure trends
  const supplierCountMap: { [key: string]: { total: number; cancellations: number } } = {
    Hotelbeds: { total: 0, cancellations: 0 },
    Agoda: { total: 0, cancellations: 0 },
    RateHawk: { total: 0, cancellations: 0 },
    Amadeus: { total: 0, cancellations: 0 },
    'TBO DMC / Wholesaler': { total: 0, cancellations: 0 },
  };

  cases.forEach((c) => {
    const b = bookings.find((x) => x.bookingReference === c.bookingReference);
    const supp = b?.supplier || 'Hotelbeds';
    const key = supplierCountMap[supp] ? supp : 'Hotelbeds';
    supplierCountMap[key].total += 1;
    if (
      c.category === 'Hotel Booking Cancellation' ||
      c.category === 'Check-In Refusal / Room Unavailable'
    ) {
      supplierCountMap[key].cancellations += 1;
    }
  });

  const supplierData = Object.entries(supplierCountMap).map(([supplier, stats]) => ({
    supplier,
    totalCases: stats.total,
    cancellations: stats.cancellations,
  }));

  // Repeated Booking Issues Detection (Identifies multiple complaints against the same service / booking)
  const repeatedIssues = [
    {
      issue: 'Hotel Overbooking & Sudden Cancellation on Arrival',
      supplier: 'Hotelbeds (Tirupati & Goa properties)',
      frequency: 4,
      impact: 'Critical (Travelers at destination)',
      recommendation: 'Enforce instant stop-sale buffer on religious pilgrimage dates.',
    },
    {
      issue: 'Voucher XML Discrepancy & Breakfast Exclusion',
      supplier: 'RateHawk & Hotelbeds (SE Asia & Europe)',
      frequency: 3,
      impact: 'Medium (Double billing claims)',
      recommendation: 'Audit channel manager meal-plan code translation table.',
    },
    {
      issue: 'Last-Mile Airport Transfer Driver Delay',
      supplier: 'TBO Ground Transport Contractors',
      frequency: 2,
      impact: 'High (Missed hotel check-in/flight)',
      recommendation: 'Mandate live GPS coordinate integration for chauffeurs.',
    },
  ];

  // Monthly complaint trends
  const monthlyTrendData = [
    { month: 'Jun', total: 12, resolved: 11, breachedSla: 1 },
    { month: 'Jul', total: 18, resolved: 17, breachedSla: 2 },
    { month: 'Aug', total: 24, resolved: 22, breachedSla: 3 },
    { month: 'Sep', total: 29, resolved: 27, breachedSla: 2 },
    { month: 'Oct', total: 34, resolved: 32, breachedSla: 2 },
    { month: 'Nov (Current)', total: cases.length, resolved: cases.filter(c => c.status === 'Resolved').length, breachedSla: 1 },
  ];

  // CSV Export handler
  const handleExportCSV = () => {
    const headers = [
      'Case Number',
      'Booking Ref',
      'Agency',
      'Customer',
      'Destination',
      'Category',
      'Priority',
      'Status',
      'Assigned Agent',
      'Check-In Date',
      'Created At',
    ];

    const rows = filteredCases.map((c) => [
      `"${c.caseNumber}"`,
      `"${c.bookingReference}"`,
      `"${c.agencyName}"`,
      `"${c.customerName}"`,
      `"${c.destination}"`,
      `"${c.category}"`,
      `"${c.priority}"`,
      `"${c.status}"`,
      `"${c.assignedAgentName}"`,
      `"${c.checkInDate}"`,
      `"${c.createdAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OpsDesk_Operational_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice(`Exported ${filteredCases.length} operational records as CSV.`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Title & CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#263B5B] tracking-tight">
            Operational Insights & Root-Cause Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Surfaces systemic supplier failures, repeat complaint patterns, and partner friction metrics
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-[#20A89E] hover:bg-[#1a8880] text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Records to CSV</span>
        </button>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Analytics KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Overall SLA Compliance
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">94.8%</div>
          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            <span>+2.4% over last quarter</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            SLA Breach Rate
          </span>
          <div className="text-2xl font-bold text-rose-600 mt-1">5.2%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Predominantly arrival-day cancellations
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Repeat Issue Ratio
          </span>
          <div className="text-2xl font-bold text-amber-600 mt-1">31.4%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Same booking / agency pattern
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Avg Escalation Resolution
          </span>
          <div className="text-2xl font-bold text-[#4267D5] mt-1">21 mins</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Target benchmark: &lt; 30 mins
          </div>
        </div>
      </div>

      {/* Row 2: Category Frequency & Monthly Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Resolution Trend */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-[#263B5B]">Monthly Operational Volume & SLA</h3>
              <p className="text-xs text-slate-400">Total complaints handled vs SLA compliance rate</p>
            </div>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Total Cases"
                  stroke="#4267D5"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved Cases"
                  stroke="#10B981"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="breachedSla"
                  name="Breached SLA"
                  stroke="#EF4444"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Supplier Friction Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-[#263B5B]">Supplier Failure Analysis</h3>
              <p className="text-xs text-slate-400">Hotelbeds, Agoda, RateHawk cancellation frequency</p>
            </div>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplierData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="supplier" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                <Bar dataKey="totalCases" name="Total Disputes" fill="#4267D5" radius={[4, 4, 0, 0]} />
                <Bar
                  dataKey="cancellations"
                  name="Check-In Refusal / Cancel"
                  fill="#E11D48"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Repeated Booking Issues Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#263B5B] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Repeated Operational Failure Patterns (Systemic Issue Detection)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Identifies recurring bottlenecks causing multiple complaints from the same agency and booking context
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <th className="py-2.5 px-4">Recurring Failure Mode</th>
                <th className="py-2.5 px-4">Primary Supplier / Domain</th>
                <th className="py-2.5 px-4">Occurrences</th>
                <th className="py-2.5 px-4">Severity Impact</th>
                <th className="py-2.5 px-4">Operational Action & Mitigation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {repeatedIssues.map((issue, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-[#263B5B]">
                    {issue.issue}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{issue.supplier}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      {issue.frequency} cases
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        issue.impact.includes('Critical')
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {issue.impact}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {issue.recommendation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
