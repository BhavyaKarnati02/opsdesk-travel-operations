import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Building2,
  Cpu,
  ClockAlert,
  MessagesSquare,
  BarChart3,
  RotateCcw,
  Sparkles,
  Plane,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export type NavModule =
  | 'dashboard'
  | 'cases'
  | 'agencies'
  | 'routing'
  | 'sla'
  | 'communications'
  | 'insights';

interface SidebarProps {
  activeModule: NavModule;
  onSelectModule: (module: NavModule) => void;
  openCasesCount: number;
  slaAtRiskCount: number;
  onResetSeed: () => void;
  onTriggerScenario: (scenarioNumber: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  openCasesCount,
  slaAtRiskCount,
  onResetSeed,
  onTriggerScenario,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavModule,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'cases' as NavModule,
      label: 'Cases',
      icon: Layers,
      badge: openCasesCount > 0 ? `${openCasesCount}` : null,
      badgeColor: 'bg-[#4267D5] text-white',
    },
    {
      id: 'agencies' as NavModule,
      label: 'Agencies',
      icon: Building2,
      badge: null,
    },
    {
      id: 'routing' as NavModule,
      label: 'Smart Routing',
      icon: Cpu,
      badge: 'AI Rule Engine',
      badgeColor: 'bg-[#20A89E] text-white text-[10px] px-1.5 py-0.5 rounded font-medium',
    },
    {
      id: 'sla' as NavModule,
      label: 'SLA Monitoring',
      icon: ClockAlert,
      badge: slaAtRiskCount > 0 ? `${slaAtRiskCount} Alert` : null,
      badgeColor: 'bg-rose-500 text-white animate-pulse',
    },
    {
      id: 'communications' as NavModule,
      label: 'Communications',
      icon: MessagesSquare,
      badge: null,
    },
    {
      id: 'insights' as NavModule,
      label: 'Insights',
      icon: BarChart3,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-[#263B5B] text-slate-200 flex flex-col shrink-0 min-h-screen border-r border-[#1B2C45] select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#354E75] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#20A89E] to-[#4267D5] flex items-center justify-center text-white font-bold shadow-md shadow-black/20">
            <Plane className="w-5 h-5 -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-white tracking-tight">OpsDesk</span>
              <span className="text-[10px] bg-[#20A89E]/20 text-[#20A89E] font-semibold px-1.5 py-0.5 rounded border border-[#20A89E]/40">
                TBO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">
              Travel Operations System
            </p>
          </div>
        </div>
      </div>

      {/* VoyageHack 4.0 Badge */}
      <div className="mx-3 mt-3 p-2.5 rounded-lg bg-[#1B2C45]/80 border border-[#354E75] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-semibold text-slate-200">VOYAGEHACK 4.0</span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          Live DB
        </span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Operations Modules
        </div>
        {navItems.map((item) => {
          const isActive = activeModule === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#4267D5] text-white shadow-md shadow-blue-900/30 font-semibold'
                  : 'text-slate-300 hover:bg-[#324b70] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    item.badgeColor || 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick Hackathon Demo Scenarios */}
        <div className="pt-5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
            <span>Hackathon Scenarios</span>
            <span className="text-[10px] text-amber-300 font-mono">1 to 5</span>
          </div>
          <div className="space-y-1">
            <button
              onClick={() => onTriggerScenario(1)}
              className="w-full text-left px-3 py-1.5 rounded-md text-xs text-slate-300 hover:bg-[#324b70] hover:text-white flex items-center justify-between group transition-colors"
            >
              <span className="truncate">1. Unified Case (TR123)</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 shrink-0" />
            </button>
            <button
              onClick={() => onTriggerScenario(2)}
              className="w-full text-left px-3 py-1.5 rounded-md text-xs text-slate-300 hover:bg-[#324b70] hover:text-white flex items-center justify-between group transition-colors"
            >
              <span className="truncate">2. Smart Routing Scoring</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 shrink-0" />
            </button>
            <button
              onClick={() => onTriggerScenario(3)}
              className="w-full text-left px-3 py-1.5 rounded-md text-xs text-slate-300 hover:bg-[#324b70] hover:text-white flex items-center justify-between group transition-colors"
            >
              <span className="truncate">3. Handoff Continuity</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 shrink-0" />
            </button>
            <button
              onClick={() => onTriggerScenario(4)}
              className="w-full text-left px-3 py-1.5 rounded-md text-xs text-slate-300 hover:bg-[#324b70] hover:text-white flex items-center justify-between group transition-colors"
            >
              <span className="truncate">4. SLA Countdown & Escalate</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 shrink-0" />
            </button>
            <button
              onClick={() => onTriggerScenario(5)}
              className="w-full text-left px-3 py-1.5 rounded-md text-xs text-slate-300 hover:bg-[#324b70] hover:text-white flex items-center justify-between group transition-colors"
            >
              <span className="truncate">5. Insights & CSV Export</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 shrink-0" />
            </button>
          </div>
        </div>
      </nav>

      {/* Footer / Reset Action */}
      <div className="p-3 border-t border-[#354E75] bg-[#1E304B] space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#20A89E]" />
            <span className="text-[11px]">Firestore Connected</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">v4.0-PRO</span>
        </div>
        <button
          onClick={onResetSeed}
          className="w-full py-2 px-3 rounded-lg bg-[#263B5B] hover:bg-[#324b70] text-slate-200 text-xs font-medium flex items-center justify-center gap-2 border border-[#354E75] transition-all"
          title="Reset database to demo seed data with ABC Travels TR123 scenario"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </aside>
  );
};
