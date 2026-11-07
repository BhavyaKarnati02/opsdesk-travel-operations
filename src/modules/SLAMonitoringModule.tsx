import React, { useState, useEffect } from 'react';
import {
  ClockAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  Calendar,
  Building,
  User,
  Plane,
  BellRing,
  RotateCw,
} from 'lucide-react';
import { UnifiedCase, SLARiskLevel } from '../types';
import { dataService } from '../services/dataService';

interface SLAMonitoringModuleProps {
  cases: UnifiedCase[];
  onSelectCase: (caseItem: UnifiedCase) => void;
}

export const SLAMonitoringModule: React.FC<SLAMonitoringModuleProps> = ({
  cases,
  onSelectCase,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'URGENT' | 'AT_RISK' | 'CHECKIN_IMMINENT' | 'RESOLVED'>('ALL');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [escalatedCaseId, setEscalatedCaseId] = useState<string | null>(null);

  // Live timer ticking every 1 second to update countdowns dynamically
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format remaining seconds into clean H:M:S format
  const formatCountdown = (targetDateStr: string) => {
    const target = new Date(targetDateStr).getTime();
    const diffMs = target - currentTime;

    if (diffMs <= 0) {
      const overdueSec = Math.floor(Math.abs(diffMs) / 1000);
      const h = Math.floor(overdueSec / 3600);
      const m = Math.floor((overdueSec % 3600) / 60);
      const s = overdueSec % 60;
      return {
        text: `BREACHED (-${h}h ${m}m ${s}s)`,
        isBreached: true,
        diffHours: diffMs / (1000 * 3600),
      };
    }

    const sec = Math.floor(diffMs / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    return {
      text: `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`,
      isBreached: false,
      diffHours: diffMs / (1000 * 3600),
    };
  };

  const filteredCases = cases.filter((c) => {
    const checkInDiff = (new Date(c.checkInDate).getTime() - currentTime) / (1000 * 3600);
    const slaDiff = (new Date(c.slaDeadline).getTime() - currentTime) / (1000 * 3600);

    if (filter === 'RESOLVED') return c.status === 'Resolved';
    if (filter === 'URGENT') return c.priority === 'Critical' && c.status !== 'Resolved';
    if (filter === 'AT_RISK') return (c.slaRiskLevel === 'At Risk' || slaDiff <= 2) && c.status !== 'Resolved';
    if (filter === 'CHECKIN_IMMINENT') return checkInDiff > 0 && checkInDiff <= 2.5 && c.status !== 'Resolved';

    return true;
  });

  const handleEscalateDutyManager = (c: UnifiedCase) => {
    dataService.escalateCase(
      c.id,
      `Check-in / SLA threshold breached or imminent. Traveler ${c.customerName} requires direct command desk intervention.`
    );
    setEscalatedCaseId(c.id);
    setTimeout(() => setEscalatedCaseId(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#263B5B] tracking-tight">
              Travel-Aware SLA & Imminent Check-In Guardian
            </h1>
            <span className="text-[11px] bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-full border border-rose-300 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              Live 1s Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronizes operational resolution deadlines with physical flight departures, hotel check-ins, and supplier Last Cancellation Dates (LCD).
          </p>
        </div>

        {/* Live Clock Indicator */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-[#4267D5]" />
          <span>OPS TIME: {new Date(currentTime).toLocaleTimeString()}</span>
        </div>
      </div>

      {escalatedCaseId && (
        <div className="p-3.5 bg-rose-100 border border-rose-300 text-rose-950 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <BellRing className="w-4 h-4 text-rose-700 animate-bounce" />
          <span>Case escalated to TBO Duty Escalation Manager with immediate broadcast alert.</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'ALL'
              ? 'bg-[#263B5B] text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All SLAs ({cases.length})
        </button>
        <button
          onClick={() => setFilter('CHECKIN_IMMINENT')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            filter === 'CHECKIN_IMMINENT'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-[#FFE4DF] text-rose-900 border border-rose-300 hover:bg-rose-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Approaching Check-in &lt; 2h</span>
        </button>
        <button
          onClick={() => setFilter('AT_RISK')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'AT_RISK'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-[#FFF0D5] text-amber-900 border border-amber-300 hover:bg-amber-100'
          }`}
        >
          At Risk &lt; 2h
        </button>
        <button
          onClick={() => setFilter('URGENT')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'URGENT'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-purple-100 text-purple-900 border border-purple-200 hover:bg-purple-200'
          }`}
        >
          Critical Priority
        </button>
        <button
          onClick={() => setFilter('RESOLVED')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'RESOLVED'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Resolved Cases
        </button>
      </div>

      {/* SLA Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCases.map((c) => {
          const slaCountdown = formatCountdown(c.slaDeadline);
          const checkInCountdown = formatCountdown(c.checkInDate);
          const lcdCountdown = c.lastCancellationDate
            ? formatCountdown(c.lastCancellationDate)
            : null;

          const isCheckInCritical =
            checkInCountdown.diffHours > 0 && checkInCountdown.diffHours <= 1.5;

          return (
            <div
              key={c.id}
              onClick={() => onSelectCase(c)}
              className={`rounded-2xl border p-4 bg-white shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                isCheckInCritical
                  ? 'border-rose-400 ring-2 ring-rose-400/20'
                  : c.priority === 'Critical'
                  ? 'border-rose-200'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                {/* Header & Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-[#263B5B]">{c.caseNumber}</span>
                      <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                        {c.bookingReference}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {c.agencyName} • {c.customerName}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : isCheckInCritical
                        ? 'bg-rose-600 text-white animate-pulse'
                        : c.priority === 'Critical'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isCheckInCritical ? 'TRAVEL URGENCY' : c.slaRiskLevel}
                  </span>
                </div>

                {/* Case Subject */}
                <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-relaxed">
                  {c.title}
                </h4>

                {/* Real-time Countdown Box */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  {/* Resolution SLA Timer */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#4267D5]" />
                      <span>Resolution SLA:</span>
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        c.status === 'Resolved'
                          ? 'text-emerald-700'
                          : slaCountdown.isBreached
                          ? 'text-rose-600'
                          : 'text-[#263B5B]'
                      }`}
                    >
                      {c.status === 'Resolved' ? 'COMPLIED' : slaCountdown.text}
                    </span>
                  </div>

                  {/* Check-In Deadline Timer */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Plane className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Hotel Check-in:</span>
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        isCheckInCritical ? 'text-rose-600 animate-pulse' : 'text-slate-800'
                      }`}
                    >
                      {checkInCountdown.diffHours <= 0
                        ? 'TODAY (In Progress)'
                        : checkInCountdown.text}
                    </span>
                  </div>

                  {/* Last Cancellation Date (LCD) if exists */}
                  {lcdCountdown && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500">Free Cancellation (LCD):</span>
                      <span
                        className={`font-mono font-medium ${
                          lcdCountdown.isBreached ? 'text-slate-400' : 'text-amber-700'
                        }`}
                      >
                        {lcdCountdown.isBreached ? 'LCD Expired' : lcdCountdown.text}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer info & Escalation CTA */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">
                  Agent: <strong>{c.assignedAgentName}</strong>
                </span>

                <div className="flex items-center gap-1.5">
                  {!c.isEscalated && c.status !== 'Resolved' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEscalateDutyManager(c);
                      }}
                      className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 font-bold text-[10px] border border-rose-200 transition-colors"
                      title="Flag directly to Duty Escalation Manager"
                    >
                      Escalate
                    </button>
                  )}
                  <span className="text-[#4267D5] font-semibold text-xs hover:underline">
                    View &rarr;
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
