import React, { useState } from 'react';
import {
  X,
  Plus,
  Ticket as TicketIcon,
  Layers,
  Building,
  User,
  Plane,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { ComplaintCategory, Priority, Ticket, UnifiedCase, Booking } from '../types';
import { dataService } from '../services/dataService';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCaseId?: string;
  defaultBookingRef?: string;
  bookings: Booking[];
  cases: UnifiedCase[];
  onTicketCreated: (ticket: Ticket, caseItem: UnifiedCase) => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  defaultCaseId,
  defaultBookingRef,
  bookings,
  cases,
  onTicketCreated,
}) => {
  if (!isOpen) return null;

  const [bookingRef, setBookingRef] = useState(defaultBookingRef || 'TR123');
  const [category, setCategory] = useState<ComplaintCategory>('Hotel Booking Cancellation');
  const [priority, setPriority] = useState<Priority>('High');
  const [source, setSource] = useState<Ticket['source']>('Agency Portal');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Check if booking ref matches an existing case
  const matchingCase = cases.find(
    (c) =>
      c.bookingReference.toLowerCase() === bookingRef.trim().toLowerCase() &&
      c.status !== 'Resolved'
  );

  const matchedBooking = bookings.find(
    (b) => b.bookingReference.toLowerCase() === bookingRef.trim().toLowerCase()
  );

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!bookingRef.trim()) {
      setError('Please provide a booking reference (e.g. TR123, BK8812).');
      return;
    }
    if (!subject.trim()) {
      setError('Please enter a ticket subject.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a complaint description.');
      return;
    }

    const { ticket, caseItem } = dataService.createTicket({
      caseId: defaultCaseId || (matchingCase ? matchingCase.id : undefined),
      bookingReference: bookingRef.trim(),
      category,
      subject: subject.trim(),
      description: description.trim(),
      priority,
      source,
    });

    onTicketCreated(ticket, caseItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#263B5B] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#20A89E] flex items-center justify-center text-white">
              <TicketIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Log New Travel Complaint</h3>
              <p className="text-xs text-slate-300">Intelligent correlation engine automatically links related tickets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Intelligent Correlation Notice */}
        <div className="p-4 bg-[#DCE6F2]/60 border-b border-slate-200 text-xs">
          {matchingCase ? (
            <div className="flex items-center gap-2 text-[#263B5B]">
              <Sparkles className="w-4 h-4 text-[#4267D5] shrink-0" />
              <span>
                <strong>Intelligent Unification:</strong> Matches existing Case{' '}
                <span className="font-mono font-bold text-[#4267D5]">
                  {matchingCase.caseNumber}
                </span>{' '}
                for {matchingCase.agencyName} ({matchingCase.customerName}). This complaint will be connected to preserve history!
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-600">
              <Layers className="w-4 h-4 text-[#20A89E] shrink-0" />
              <span>
                No active case for this booking reference. A new unified operational case will be created.
              </span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Booking Reference */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Booking Reference <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={bookingRef}
              onChange={(e) => setBookingRef(e.target.value)}
              placeholder="e.g. TR123, BK8812, BK4420..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 uppercase font-mono font-bold text-slate-800 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#4267D5]"
            />
            {matchedBooking && (
              <span className="text-[11px] text-emerald-700 font-medium block mt-1">
                Matched: {matchedBooking.serviceName} ({matchedBooking.destination}) • Agency: {matchedBooking.agencyName}
              </span>
            )}
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Complaint Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 text-slate-800 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#4267D5]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 text-slate-800 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#4267D5]"
              >
                <option value="Low">Low (Informational / Post-trip)</option>
                <option value="Medium">Medium (Standard 4h SLA)</option>
                <option value="High">High (Same-day check-in / Schedule retimed)</option>
                <option value="Critical">Critical (Check-in imminent / Overbooking crisis)</option>
              </select>
            </div>
          </div>

          {/* Source Channel */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Intake Channel / Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as Ticket['source'])}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 text-slate-800 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#4267D5]"
            >
              <option value="Agency Portal">B2B Agency Portal</option>
              <option value="Phone Call">Emergency Phone Hotline</option>
              <option value="Email">Support Desk Email</option>
              <option value="Supplier Webhook">Supplier Webhook Alert</option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Ticket Subject <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Hotel claims booking cancelled due to renovation"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 text-slate-800 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#4267D5]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Detailed Description & Traveler Context <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Provide exact details of the incident, guest arrival status, hotel front office response, and required remedy..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 text-slate-800 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#4267D5]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#4267D5] hover:bg-blue-700 shadow-xs cursor-pointer"
            >
              Log & Correlate Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
