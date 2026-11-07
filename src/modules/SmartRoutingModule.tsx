import React, { useState } from 'react';
import {
  Cpu,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Briefcase,
  Layers,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Info,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { UnifiedCase, SupportAgent } from '../types';
import {
  calculateSmartRoutingScores,
  generateAssignmentExplanation,
} from '../services/smartRouting';
import { dataService } from '../services/dataService';

interface SmartRoutingModuleProps {
  cases: UnifiedCase[];
  agents: SupportAgent[];
  onSelectCase: (caseItem: UnifiedCase) => void;
}

export const SmartRoutingModule: React.FC<SmartRoutingModuleProps> = ({
  cases,
  agents,
  onSelectCase,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '');
  const [assignmentFeedback, setAssignmentFeedback] = useState<string | null>(null);

  const currentCase = cases.find((c) => c.id === selectedCaseId) || cases[0];
  const routingScores = currentCase ? calculateSmartRoutingScores(currentCase, agents) : [];
  const topMatch = routingScores[0];

  const handleApplyAssignment = (agentId: string) => {
    if (!currentCase) return;
    const targetAgent = agents.find((a) => a.id === agentId);
    if (!targetAgent) return;

    dataService.reassignAgent(
      currentCase.id,
      agentId,
      `Smart Routing algorithm matched agent (Score: ${topMatch?.totalScore || 85}/100)`
    );

    setAssignmentFeedback(`Successfully assigned ${currentCase.caseNumber} to ${targetAgent.name}!`);
    setTimeout(() => setAssignmentFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Module Title & Rationale Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#263B5B] tracking-tight">
              Smart Routing & Transparent Assignment Engine
            </h1>
            <span className="text-[11px] bg-[#20A89E]/15 text-[#20A89E] font-bold px-2.5 py-0.5 rounded-full border border-[#20A89E]/30">
              Rule-Based Algorithm
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparently scores and routes incoming travel cases based on Territory (30 pts), Category Expertise (35 pts), Workload Capacity (25 pts), and Real-time Availability (10 pts).
          </p>
        </div>
      </div>

      {assignmentFeedback && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>{assignmentFeedback}</span>
        </div>
      )}

      {/* Workbench Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Select Case to Route (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Operational Case
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">{cases.length} cases</span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {cases.map((c) => {
              const isSelected = c.id === currentCase?.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#4267D5] shadow-md ring-2 ring-[#4267D5]/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#263B5B]">{c.caseNumber}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        c.priority === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {c.priority}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800 mt-1 line-clamp-1">
                    {c.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>
                      {c.agencyName} • {c.agencyRegion}
                    </span>
                    <span className="font-medium text-slate-600">Assigned: {c.assignedAgentName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Routing Evaluation & Transparent Score Breakdown (8 cols) */}
        {currentCase && topMatch && (
          <div className="lg:col-span-8 space-y-4">
            {/* Top Recommended Match Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#DDF5EC] to-[#E9E4FF] border border-emerald-300 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                      Smart Engine Recommendation for {currentCase.caseNumber}
                    </span>
                    <span className="bg-emerald-700 text-white text-xs font-mono font-bold px-2 py-0.5 rounded-full">
                      Score: {topMatch.totalScore}/100
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#263B5B]">
                    {topMatch.agent.name}
                  </h3>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    <strong>Rule-Based Explanation:</strong>{' '}
                    {generateAssignmentExplanation(topMatch, currentCase)}
                  </p>
                </div>

                <div className="shrink-0 flex sm:flex-col gap-2">
                  <button
                    onClick={() => handleApplyAssignment(topMatch.agent.id)}
                    disabled={topMatch.agent.id === currentCase.assignedAgentId}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      topMatch.agent.id === currentCase.assignedAgentId
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-[#20A89E] hover:bg-[#1a8981] text-white cursor-pointer'
                    }`}
                  >
                    {topMatch.agent.id === currentCase.assignedAgentId
                      ? 'Already Assigned'
                      : 'Apply Recommended Assignment'}
                  </button>
                  <button
                    onClick={() => onSelectCase(currentCase)}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors"
                  >
                    Open Case Details
                  </button>
                </div>
              </div>
            </div>

            {/* Score Breakdown Methodology Box */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-700">
                <Info className="w-4 h-4 text-[#4267D5]" />
                <span>Transparent Scoring Weights Formula (No Opaque AI Claims)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
                <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="font-bold text-[#4267D5] text-sm">35 pts</div>
                  <div className="text-[10px] text-slate-600 font-medium">Domain Expertise</div>
                  <div className="text-[9px] text-slate-400">Match complaint category</div>
                </div>
                <div className="p-2 rounded-lg bg-teal-50 border border-teal-200">
                  <div className="font-bold text-[#20A89E] text-sm">30 pts</div>
                  <div className="text-[10px] text-slate-600 font-medium">Region Coverage</div>
                  <div className="text-[9px] text-slate-400">Territory alignment</div>
                </div>
                <div className="p-2 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="font-bold text-purple-700 text-sm">25 pts</div>
                  <div className="text-[10px] text-slate-600 font-medium">Workload Capacity</div>
                  <div className="text-[9px] text-slate-400">Available case slots</div>
                </div>
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="font-bold text-amber-700 text-sm">10 pts</div>
                  <div className="text-[10px] text-slate-600 font-medium">Live Shift Status</div>
                  <div className="text-[9px] text-slate-400">Online/Available presence</div>
                </div>
              </div>
            </div>

            {/* Candidate Agents Comparison Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#263B5B]">
                    Candidate Agents Comparison for Case {currentCase.caseNumber}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Evaluating Category: <strong>{currentCase.category}</strong> • Region: <strong>{currentCase.agencyRegion}</strong>
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {routingScores.map((scoreItem) => {
                  const ag = scoreItem.agent;
                  const isAssigned = ag.id === currentCase.assignedAgentId;
                  const isTop = scoreItem.isRecommended;

                  return (
                    <div
                      key={ag.id}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                        isAssigned ? 'bg-blue-50/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Agent details */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#263B5B]">{ag.name}</span>
                          <span className="text-xs text-slate-500 font-medium">{ag.role}</span>
                          {isTop && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                              BEST FIT
                            </span>
                          )}
                          {isAssigned && (
                            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                              CURRENT
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                          <span>
                            <strong>Regions:</strong> {ag.regions.join(', ')}
                          </span>
                          <span>
                            <strong>Capacity:</strong> {ag.activeCases}/{ag.maxCapacity} cases
                          </span>
                          <span>
                            <strong>Shift:</strong>{' '}
                            <span
                              className={`font-semibold ${
                                ag.availability === 'Available'
                                  ? 'text-emerald-700'
                                  : ag.availability === 'In Call'
                                  ? 'text-blue-700'
                                  : 'text-amber-700'
                              }`}
                            >
                              {ag.availability}
                            </span>
                          </span>
                          <span>
                            <strong>SLA Compliance:</strong> {ag.slaComplianceRate}%
                          </span>
                        </div>

                        {/* Breakdown pills */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                            Expertise: +{scoreItem.breakdown.expertiseMatch}
                          </span>
                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                            Region: +{scoreItem.breakdown.regionMatch}
                          </span>
                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                            Capacity: +{scoreItem.breakdown.capacityScore}
                          </span>
                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                            Availability: +{scoreItem.breakdown.availabilityScore}
                          </span>
                        </div>
                      </div>

                      {/* Score & Assign action */}
                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                        <div className="text-right">
                          <div className="text-xl font-bold text-[#263B5B]">
                            {scoreItem.totalScore}
                            <span className="text-xs font-normal text-slate-400">/100</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Total Match</div>
                        </div>

                        {!isAssigned ? (
                          <button
                            onClick={() => handleApplyAssignment(ag.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#4267D5] hover:text-white text-slate-700 text-xs font-bold transition-all"
                          >
                            Assign
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-blue-700 px-2 py-1">
                            Assigned
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
