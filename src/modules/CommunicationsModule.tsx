import React, { useState } from 'react';
import {
  MessagesSquare,
  Search,
  Send,
  Building,
  User,
  ShieldAlert,
  ArrowRightLeft,
  Info,
  CheckCircle2,
  Lock,
  Mail,
  Plane,
} from 'lucide-react';
import { UnifiedCase, Communication, SupportAgent } from '../types';
import { dataService } from '../services/dataService';

interface CommunicationsModuleProps {
  cases: UnifiedCase[];
  agents: SupportAgent[];
  onSelectCase: (caseItem: UnifiedCase) => void;
}

export const CommunicationsModule: React.FC<CommunicationsModuleProps> = ({
  cases,
  agents,
  onSelectCase,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '');
  const [messageType, setMessageType] = useState<'Agency' | 'Supplier' | 'Internal Note'>('Agency');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentCase = cases.find((c) => c.id === selectedCaseId) || cases[0];
  const communications = currentCase ? dataService.getCommunicationsByCaseId(currentCase.id) : [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !currentCase) return;

    let recipient = '';
    let recipientsList: string[] = [];

    if (messageType === 'Agency') {
      recipient = `${currentCase.agencyName} Desk`;
      recipientsList = ['ops@abctravels.in', 'bhavya.karnati@example.com', 'opsdesk@tbo.com'];
    } else if (messageType === 'Supplier') {
      recipient = 'Supplier Contracting & Reservations Desk';
      recipientsList = ['reservations@hotelbeds.com', 'opsdesk@tbo.com'];
    } else {
      recipient = 'OpsDesk Internal Operations';
      recipientsList = ['dutyops@tbo.com', currentCase.assignedAgentName];
    }

    dataService.addCommunication({
      caseId: currentCase.id,
      type: messageType,
      senderName: 'Bhavya K.',
      senderRole: 'TBO Duty Lead',
      senderType: 'TBO Agent',
      recipient,
      recipientsList,
      subject: subject.trim() || `Update regarding ${currentCase.caseNumber}`,
      content: content.trim(),
      isInternal: messageType === 'Internal Note',
    });

    dataService.addActivityLog({
      caseId: currentCase.id,
      actorName: 'Bhavya K.',
      actorRole: 'Duty Lead',
      actionType: 'Note Added',
      details: `Dispatched ${messageType} communication: "${subject.trim() || 'Operational Update'}"`,
    });

    setContent('');
    setSubject('');
    setFeedback('Message recorded to operational thread (In-App Demo Simulator).');
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#263B5B] tracking-tight">
              Communication Continuity Hub
            </h1>
            <span className="text-[11px] bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
              Zero Context Loss
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Preserves unified multi-channel conversation threads across Agency, Supplier, and Internal notes upon case transfer.
          </p>
        </div>

        {/* Demo Disclaimer notice badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Internal Operations Demo Simulator (No live external emails dispatched)</span>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Grid: Case Selector on Left, Thread & Composer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Select Thread (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Case Threads
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">{cases.length} threads</span>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {cases.map((c) => {
              const isSelected = c.id === currentCase?.id;
              const commsCount = dataService.getCommunicationsByCaseId(c.id).length;

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
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-1.5 rounded font-semibold">
                      {commsCount} msgs
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800 mt-1 line-clamp-1">
                    {c.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>{c.agencyName}</span>
                    <span className="text-slate-400 font-mono">{c.bookingReference}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Conversation Thread & Composer (8 cols) */}
        {currentCase && (
          <div className="lg:col-span-8 space-y-4">
            {/* Thread Header */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-[#263B5B]">
                    Thread: {currentCase.caseNumber}
                  </h3>
                  <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold">
                    {currentCase.bookingReference}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assigned Agent: <strong>{currentCase.assignedAgentName}</strong> • Agency: <strong>{currentCase.agencyName}</strong> ({currentCase.customerName})
                </p>
              </div>

              <button
                onClick={() => onSelectCase(currentCase)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-[#4267D5] hover:text-white rounded-lg text-xs font-semibold text-slate-700 transition-colors self-start sm:self-auto"
              >
                Inspect Case File
              </button>
            </div>

            {/* Conversation Messages Stream */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs max-h-[420px] overflow-y-auto space-y-3">
              {communications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No communications logged yet for this case. Use the composer below.
                </div>
              ) : (
                communications.map((comm) => (
                  <div
                    key={comm.id}
                    className={`p-4 rounded-xl border text-xs space-y-2 ${
                      comm.isInternal
                        ? 'bg-[#FFF0D5]/50 border-amber-200'
                        : comm.type === 'Supplier'
                        ? 'bg-blue-50/60 border-blue-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-[10px] px-2 py-0.5 rounded-full ${
                            comm.isInternal
                              ? 'bg-amber-100 text-amber-900'
                              : comm.type === 'Supplier'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {comm.type}
                        </span>
                        <span className="font-bold text-slate-800 text-sm">
                          {comm.senderName}
                        </span>
                        <span className="text-slate-400 text-xs">({comm.senderRole})</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(comm.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="font-bold text-slate-800 text-xs">{comm.subject}</div>
                    <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                      {comm.content}
                    </p>

                    {comm.recipientsList && comm.recipientsList.length > 0 && (
                      <div className="text-[10px] text-slate-400 pt-1.5 border-t border-slate-200/60 flex items-center gap-1 truncate">
                        <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                        <strong>Preserved Continuity Recipients:</strong>{' '}
                        {comm.recipientsList.join(', ')}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* In-App Composer */}
            <form
              onSubmit={handleSendMessage}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Compose Dispatch</span>

                {/* Dispatch Channel Selector */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMessageType('Agency')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      messageType === 'Agency'
                        ? 'bg-[#20A89E] text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Agency Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageType('Supplier')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      messageType === 'Supplier'
                        ? 'bg-[#4267D5] text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Supplier Inquiry
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageType('Internal Note')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      messageType === 'Internal Note'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Internal Note
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject line (e.g. Relocation Voucher Confirmation for Bhavya Karnati)"
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-[#4267D5] focus:bg-white"
              />

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type dispatch content... Continuity ensures this message is visible to all future agents if transferred."
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-[#4267D5] focus:bg-white"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  Transmitting as <strong>Bhavya K. (TBO Duty Lead)</strong>
                </span>

                <button
                  type="submit"
                  disabled={!content.trim()}
                  className="px-4 py-2 bg-[#4267D5] hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Dispatch</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
