import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Clock,
  Building,
  User,
  Plane,
  FileText,
  MessageSquare,
  History,
  CheckCircle2,
  ChevronRight,
  Plus,
  Send,
  UserCheck,
  ShieldAlert,
  ArrowRightLeft,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import {
  UnifiedCase,
  Ticket,
  Agency,
  Customer,
  Booking,
  SupportAgent,
  ActivityLog,
  Communication,
  CaseStatus,
  Priority,
} from '../types';
import { dataService } from '../services/dataService';
import { calculateSmartRoutingScores } from '../services/smartRouting';

interface CaseDetailModalProps {
  caseItem: UnifiedCase | null;
  onClose: () => void;
  agencies: Agency[];
  customers: Customer[];
  bookings: Booking[];
  agents: SupportAgent[];
  onOpenCreateTicketForCase: (caseId: string, bookingRef: string) => void;
  onNavigateToModule: (module: any) => void;
  currentUserName?: string;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  caseItem,
  onClose,
  agencies,
  customers,
  bookings,
  agents,
  onOpenCreateTicketForCase,
  onNavigateToModule,
  currentUserName = 'TBO Duty Lead',
}) => {
  if (!caseItem) return null;

  const [activeTab, setActiveTab] = useState<'tickets' | 'timeline' | 'comms' | 'routing'>('tickets');
  const [newNote, setNewNote] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState(caseItem.assignedAgentId);
  const [transferHandoffNotes, setTransferHandoffNotes] = useState('');
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');

  const agency = agencies.find((a) => a.id === caseItem.agencyId);
  const customer = customers.find((c) => c.id === caseItem.customerId);
  const booking = bookings.find((b) => b.id === caseItem.bookingId) || bookings.find((b) => b.bookingReference === caseItem.bookingReference);

  const linkedTickets = dataService.getTicketsByCaseId(caseItem.id);
  const activityLogs = dataService.getActivityLogsByCaseId(caseItem.id);
  const communications = dataService.getCommunicationsByCaseId(caseItem.id);

  // Smart Routing calculations
  const routingScores = calculateSmartRoutingScores(caseItem, agents);
  const recommendedScore = routingScores[0];

  // Dynamic countdown to check-in
  const checkInTime = new Date(caseItem.checkInDate).getTime();
  const diffHours = (checkInTime - Date.now()) / (1000 * 3600);
  const checkInUrgent = diffHours > 0 && diffHours <= 2;

  const handleStatusChange = (newStatus: CaseStatus) => {
    dataService.updateCaseStatus(caseItem.id, newStatus);
  };

  const handlePriorityChange = (newPriority: Priority) => {
    dataService.updateCasePriority(caseItem.id, newPriority);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    dataService.addCommunication({
      caseId: caseItem.id,
      type: 'Internal Note',
      senderName: currentUserName,
      senderRole: 'TBO Operations',
      senderType: 'TBO Agent',
      recipient: 'Internal Operations Team',
      recipientsList: ['opsdesk@tbo.com', caseItem.assignedAgentName],
      subject: `Internal Note on ${caseItem.caseNumber}`,
      content: newNote.trim(),
      isInternal: true,
    });

    dataService.addActivityLog({
      caseId: caseItem.id,
      actorName: currentUserName,
      actorRole: 'Operations Lead',
      actionType: 'Note Added',
      details: newNote.trim(),
    });

    setNewNote('');
  };

  const handleExecuteTransfer = () => {
    if (!selectedAgentId || selectedAgentId === caseItem.assignedAgentId) return;
    const note = transferHandoffNotes.trim() || 'Operational reassignment for workload balancing and expertise match.';
    dataService.transferCase(caseItem.id, selectedAgentId, note, currentUserName);
    setShowTransferConfirm(false);
    setTransferHandoffNotes('');
  };

  const handleExecuteEscalation = () => {
    if (!escalationReason.trim()) return;
    dataService.escalateCase(caseItem.id, escalationReason.trim(), currentUserName);
    setIsEscalating(false);
    setEscalationReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="bg-[#263B5B] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4267D5] flex items-center justify-center font-bold text-white shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{caseItem.caseNumber}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-white/20 text-slate-200">
                  {caseItem.bookingReference}
                </span>
                {caseItem.isEscalated && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-rose-500 text-white animate-pulse">
                    ESCALATED TO DUTY MGR
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{caseItem.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Travel Urgency Alert Strip */}
        {checkInUrgent && (
          <div className="bg-[#FFE4DF] border-b border-rose-300 px-6 py-2.5 flex items-center justify-between text-rose-900 text-xs font-medium">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 animate-bounce" />
              <span>
                <strong>CRITICAL TRAVEL DEADLINE:</strong> Hotel check-in is scheduled in{' '}
                {diffHours.toFixed(1)} hours ({new Date(caseItem.checkInDate).toLocaleTimeString()}). Guest{' '}
                {caseItem.customerName} is at destination.
              </span>
            </div>
            {!caseItem.isEscalated && (
              <button
                onClick={() => setIsEscalating(true)}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold transition-colors cursor-pointer"
              >
                Trigger Duty Manager Escalation
              </button>
            )}
          </div>
        )}

        {/* Context Summary Cards (Agency, Customer, Booking) */}
        <div className="bg-[#F1F5FA] border-b border-slate-200 px-6 py-3.5 grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
          {/* Agency Card */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1 font-semibold">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#20A89E]" />
                Agency Partner
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 rounded">
                {agency?.tier || 'Partner'}
              </span>
            </div>
            <div className="font-bold text-slate-800 text-sm">{caseItem.agencyName}</div>
            <div className="text-slate-500 text-[11px] mt-0.5">
              Contact: {agency?.contactPerson || 'Support Desk'} • {agency?.region}
            </div>
            <div className="text-slate-400 text-[10px] mt-0.5">{agency?.email}</div>
          </div>

          {/* Customer Card */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1 font-semibold">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#4267D5]" />
                Traveler Profile
              </span>
              {customer?.vipStatus && (
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 rounded">
                  VIP TRAVELER
                </span>
              )}
            </div>
            <div className="font-bold text-slate-800 text-sm">{caseItem.customerName}</div>
            <div className="text-slate-500 text-[11px] mt-0.5">
              Phone: {customer?.phone || '+91 98765 43210'}
            </div>
            <div className="text-slate-400 text-[10px] mt-0.5">{customer?.email}</div>
          </div>

          {/* Booking Card */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1 font-semibold">
              <span className="flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 text-indigo-500" />
                Booking Info
              </span>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono font-semibold px-1.5 rounded">
                Ref: {caseItem.bookingReference}
              </span>
            </div>
            <div className="font-bold text-slate-800 text-sm truncate">
              {booking?.serviceName || 'Grand Bliss Heritage'}
            </div>
            <div className="text-slate-500 text-[11px] mt-0.5">
              Supplier: <span className="font-semibold text-slate-700">{booking?.supplier}</span> • {caseItem.destination}
            </div>
            <div className="text-slate-500 text-[10px] mt-0.5 flex items-center justify-between">
              <span>Check-in: {new Date(caseItem.checkInDate).toLocaleDateString()}</span>
              {booking?.lastCancellationDate && (
                <span className="text-amber-700 font-medium">
                  LCD: {new Date(booking.lastCancellationDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status, Priority & Assignment Controls Strip */}
        <div className="px-6 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3">
            {/* Status Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={caseItem.status}
                onChange={(e) => handleStatusChange(e.target.value as CaseStatus)}
                className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-semibold focus:outline-hidden focus:ring-1 focus:ring-[#4267D5]"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Escalated">Escalated</option>
                <option value="Pending Supplier">Pending Supplier</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            {/* Priority Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Priority:</span>
              <select
                value={caseItem.priority}
                onChange={(e) => handlePriorityChange(e.target.value as Priority)}
                className={`border rounded px-2.5 py-1 font-semibold focus:outline-hidden focus:ring-1 focus:ring-[#4267D5] ${
                  caseItem.priority === 'Critical'
                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                    : 'bg-slate-50 text-slate-800 border-slate-300'
                }`}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Assigned Agent display */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <span className="text-slate-500 font-medium">Assigned Agent:</span>
              <span className="font-bold text-[#263B5B] bg-slate-100 px-2 py-0.5 rounded">
                {caseItem.assignedAgentName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('routing')}
              className="px-3 py-1 bg-[#20A89E]/10 text-[#20A89E] hover:bg-[#20A89E]/20 border border-[#20A89E]/30 rounded font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Smart Reassign / Transfer</span>
            </button>
            <button
              onClick={() => onOpenCreateTicketForCase(caseItem.id, caseItem.bookingReference)}
              className="px-3 py-1 bg-[#4267D5] hover:bg-blue-700 text-white rounded font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Complaint</span>
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 bg-slate-50/60 flex items-center gap-4 text-xs font-semibold text-slate-600 shrink-0">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'tickets'
                ? 'border-[#4267D5] text-[#4267D5] font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Connected Tickets ({linkedTickets.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('comms')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'comms'
                ? 'border-[#4267D5] text-[#4267D5] font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Communications ({communications.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'timeline'
                ? 'border-[#4267D5] text-[#4267D5] font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Activity Trail ({activityLogs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('routing')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'routing'
                ? 'border-[#20A89E] text-[#20A89E] font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Smart Routing Recommendation</span>
          </button>
        </div>

        {/* Modal Main Tab Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {/* TAB 1: Connected Tickets */}
          {activeTab === 'tickets' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#263B5B]">
                    Connected Complaints Under Booking {caseItem.bookingReference}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Unlike isolated ticketing systems, OpsDesk groups related complaints for unified resolution.
                  </p>
                </div>
                <button
                  onClick={() => onOpenCreateTicketForCase(caseItem.id, caseItem.bookingReference)}
                  className="text-xs font-semibold text-[#4267D5] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Link New Ticket</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {linkedTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#4267D5] bg-blue-50 px-2 py-0.5 rounded">
                            {ticket.ticketNumber}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            Category: {ticket.category}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              ticket.priority === 'Critical'
                                ? 'bg-rose-100 text-rose-800'
                                : ticket.priority === 'High'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-800 text-sm mt-1.5">
                          {ticket.subject}
                        </h5>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {ticket.description}
                        </p>
                        {ticket.resolutionNotes && (
                          <div className="mt-2 p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                            <strong>Resolution:</strong> {ticket.resolutionNotes}
                          </div>
                        )}
                      </div>

                      {/* Ticket Status Selector */}
                      <div className="shrink-0 flex flex-col items-end gap-1.5">
                        <select
                          value={ticket.status}
                          onChange={(e) =>
                            dataService.updateTicketStatus(
                              ticket.id,
                              e.target.value as Ticket['status']
                            )
                          }
                          className="bg-slate-50 border border-slate-300 rounded text-xs px-2 py-1 font-medium text-slate-700"
                        >
                          <option value="Open">Open</option>
                          <option value="Under Investigation">Under Investigation</option>
                          <option value="Awaiting Supplier">Awaiting Supplier</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                        <span className="text-[10px] text-slate-400">
                          Source: {ticket.source}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Communications & Notes */}
          {activeTab === 'comms' && (
            <div className="space-y-4">
              {/* Note / Message input form */}
              <form onSubmit={handleAddNote} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Add Internal Operational Note / Supplier Log
                </label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record hotelier conversation, supplier waiver codes, alternative room vouchers, or handoff directives..."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#4267D5]"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[11px] text-slate-400">
                    Logged under {currentUserName} (TBO Operations)
                  </span>
                  <button
                    type="submit"
                    disabled={!newNote.trim()}
                    className="px-3.5 py-1.5 bg-[#4267D5] hover:bg-blue-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Note</span>
                  </button>
                </div>
              </form>

              {/* Communication Message Thread */}
              <div className="space-y-3">
                {communications.map((comm) => (
                  <div
                    key={comm.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                      comm.isInternal
                        ? 'bg-[#FFF0D5]/40 border-amber-200'
                        : comm.type === 'Supplier'
                        ? 'bg-blue-50/50 border-blue-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
                            comm.isInternal
                              ? 'bg-amber-100 text-amber-900'
                              : comm.type === 'Supplier'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {comm.type}
                        </span>
                        <span className="font-bold text-slate-800">{comm.senderName}</span>
                        <span className="text-slate-400 text-[11px]">({comm.senderRole})</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(comm.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="font-semibold text-slate-800">{comm.subject}</div>
                    <div className="text-slate-600 whitespace-pre-line leading-relaxed">
                      {comm.content}
                    </div>

                    {comm.recipientsList && comm.recipientsList.length > 0 && (
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex items-center gap-1 truncate">
                        <strong>Preserved Recipients:</strong> {comm.recipientsList.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Activity Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-[#263B5B]">Complete Case Audit Timeline</h4>
              <div className="space-y-3 border-l-2 border-slate-200 pl-4 ml-2">
                {activityLogs.map((log) => (
                  <div key={log.id} className="relative text-xs">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#4267D5] border-2 border-white ring-1 ring-slate-300" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{log.actionType}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{log.details}</p>
                    <span className="text-[10px] text-slate-400">
                      Actor: {log.actorName} ({log.actorRole})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Smart Routing & Agent Transfer */}
          {activeTab === 'routing' && (
            <div className="space-y-4">
              {/* Recommended Agent Banner */}
              <div className="p-4 rounded-xl bg-[#DDF5EC] border border-emerald-300 text-emerald-950">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-700" />
                      <span className="font-bold text-xs uppercase tracking-wider text-emerald-800">
                        Smart Routing Engine Recommendation
                      </span>
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                        Match Score: {recommendedScore.totalScore}/100
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-emerald-900 mt-1">
                      {recommendedScore.agent.name} ({recommendedScore.agent.role})
                    </h4>
                    <p className="text-xs text-emerald-800 mt-1">
                      <strong>Transparent Algorithm Rationale:</strong>{' '}
                      {recommendedScore.reasons.join(' • ')}
                    </p>
                  </div>

                  {recommendedScore.agent.id !== caseItem.assignedAgentId && (
                    <button
                      onClick={() => {
                        setSelectedAgentId(recommendedScore.agent.id);
                        setShowTransferConfirm(true);
                      }}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-xs"
                    >
                      Apply Recommended Agent
                    </button>
                  )}
                </div>
              </div>

              {/* All Agents Scoring Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Support Agents Capacity & Transparent Score Breakdown</span>
                  <span className="text-slate-400 text-[10px]">Rule-based weights (Region 30, Skill 35, Workload 25, Shift 10)</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {routingScores.map((sc) => {
                    const ag = sc.agent;
                    const isCurrent = ag.id === caseItem.assignedAgentId;
                    return (
                      <div
                        key={ag.id}
                        className={`p-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors ${
                          isCurrent ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{ag.name}</span>
                            <span className="text-[10px] text-slate-500">{ag.role}</span>
                            {isCurrent && (
                              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 rounded">
                                CURRENT ASSIGNEE
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Regions: {ag.regions.join(', ')} • Capacity: {ag.activeCases}/{ag.maxCapacity} active • Status: {ag.availability}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="font-bold text-[#263B5B] text-sm">
                              {sc.totalScore}
                            </span>
                            <span className="text-[10px] text-slate-400">/100</span>
                          </div>

                          {!isCurrent ? (
                            <button
                              onClick={() => {
                                setSelectedAgentId(ag.id);
                                setShowTransferConfirm(true);
                              }}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
                            >
                              Transfer Case
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">Assigned</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transfer Confirmation Modal */}
              {showTransferConfirm && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-sm text-[#263B5B] flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-[#4267D5]" />
                      <span>Confirm Case Transfer (Communication Continuity Guaranteed)</span>
                    </h5>
                    <button
                      onClick={() => setShowTransferConfirm(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600">
                    All existing conversation threads, recipient lists, and customer context will be automatically preserved for the receiving agent.
                  </p>
                  <textarea
                    value={transferHandoffNotes}
                    onChange={(e) => setTransferHandoffNotes(e.target.value)}
                    placeholder="Provide handoff instructions or briefing notes for the new agent..."
                    rows={2}
                    className="w-full p-2 text-xs rounded border border-blue-300 bg-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowTransferConfirm(false)}
                      className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExecuteTransfer}
                      className="px-3.5 py-1 bg-[#4267D5] hover:bg-blue-700 text-white rounded text-xs font-bold shadow-xs"
                    >
                      Execute Transfer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Trigger Escalation Inline Form */}
          {isEscalating && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-rose-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Escalate Case to TBO Duty Operations Manager
                </span>
                <button
                  onClick={() => setIsEscalating(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-rose-800">
                This triggers a priority escalation alert, marks SLA as At Risk, and flags the duty command desk.
              </p>
              <input
                type="text"
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                placeholder="Reason (e.g. Check-in in 1 hour; supplier overbooked and traveler at front desk)"
                className="w-full text-xs p-2 rounded border border-rose-300 bg-white text-slate-800"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEscalating(false)}
                  className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteEscalation}
                  disabled={!escalationReason.trim()}
                  className="px-3.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold disabled:opacity-50"
                >
                  Confirm Escalation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
