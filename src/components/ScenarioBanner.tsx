import React from 'react';
import {
  Sparkles,
  Layers,
  Cpu,
  ArrowRightLeft,
  ClockAlert,
  BarChart3,
  X,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface ScenarioBannerProps {
  currentScenario: number | null;
  onSelectScenario: (num: number) => void;
  onDismiss: () => void;
}

export const ScenarioBanner: React.FC<ScenarioBannerProps> = ({
  currentScenario,
  onSelectScenario,
  onDismiss,
}) => {
  const scenarios = [
    {
      num: 1,
      title: '1. Unified Case (TR123)',
      desc: 'ABC Travels: 3 complaints connected to 1 case',
      icon: Layers,
    },
    {
      num: 2,
      title: '2. Smart Routing',
      desc: 'Transparent scoring: Region + Skill + Workload',
      icon: Cpu,
    },
    {
      num: 3,
      title: '3. Zero Context Loss',
      desc: 'Preserved recipients & conversation in transfer',
      icon: ArrowRightLeft,
    },
    {
      num: 4,
      title: '4. Check-in SLA Urgency',
      desc: '1-hour countdown alert & Duty Manager flag',
      icon: ClockAlert,
    },
    {
      num: 5,
      title: '5. Repeated Issues & CSV',
      desc: 'Recurring problem detection & data export',
      icon: BarChart3,
    },
  ];

  return (
    <div className="bg-[#263B5B] text-white px-6 py-2.5 border-b border-[#354E75] shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="p-1 rounded bg-amber-400/20 text-amber-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <span>VOYAGEHACK 4.0 Demonstration Scenarios</span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">
                Judge Quick Tour
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Select any scenario below to evaluate full workflow functionality:
            </p>
          </div>
        </div>

        {/* 5 Scenario Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {scenarios.map((sc) => {
            const isSelected = currentScenario === sc.num;
            const Icon = sc.icon;
            return (
              <button
                key={sc.num}
                onClick={() => onSelectScenario(sc.num)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all text-left whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-[#4267D5] border-blue-400 text-white shadow-sm ring-1 ring-blue-300'
                    : 'bg-[#1B2C45] border-[#354E75] text-slate-300 hover:bg-[#324b70] hover:text-white'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isSelected ? 'text-amber-300' : 'text-[#20A89E]'
                  }`}
                />
                <div>
                  <div className="font-semibold leading-tight">{sc.title}</div>
                  <div className="text-[10px] text-slate-300 hidden md:block">{sc.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
