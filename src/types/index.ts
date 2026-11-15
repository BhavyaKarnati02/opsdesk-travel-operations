export type Region = 'South India' | 'North India' | 'West India' | 'UAE & Middle East' | 'Southeast Asia' | 'Europe';

export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export type CaseStatus = 'Open' | 'In Progress' | 'Escalated' | 'Pending Supplier' | 'Resolved';

export type TicketStatus = 'Open' | 'Under Investigation' | 'Awaiting Supplier' | 'Resolved' | 'Closed';

export type ComplaintCategory =
  | 'Hotel Booking Cancellation'
  | 'Refund Delay'
  | 'Alternative Booking Requested'
  | 'Check-In Refusal / Room Unavailable'
  | 'Flight Schedule Change'
  | 'Name Correction / Voucher Discrepancy'
  | 'Supplier Payment Dispute'
  | 'Transfer No-Show'
  | 'Visa / Travel Advisory Issue';

export type SLARiskLevel = 'Safe' | 'Approaching Risk' | 'At Risk' | 'Breached' | 'Resolved';

export interface Agency {
  id: string;
  name: string;
  code: string;
  region: Region;
  tier: 'Platinum' | 'Gold' | 'Silver';
  contactPerson: string;
  email: string;
  phone: string;
  activeBookingsCount: number;
  totalCasesCount: number;
  openComplaintsCount: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  agencyId: string;
  vipStatus: boolean;
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingReference: string; // e.g. TR123
  agencyId: string;
  agencyName: string;
  customerId: string;
  customerName: string;
  type: 'Hotel' | 'Flight' | 'Package' | 'Transfer';
  serviceName: string; // e.g. "Grand Heritage Hotel & Spa"
  destination: string; // e.g. "Tirupati"
  checkInDate: string; // ISO string
  checkOutDate: string; // ISO string
  lastCancellationDate?: string; // LCD ISO string
  supplier: string; // e.g. "Hotelbeds", "RateHawk", "Amadeus"
  bookingStatus: 'Confirmed' | 'Voucher Issued' | 'Pending Confirmation' | 'Cancelled';
  amount: number;
  currency: string;
}

export interface UnifiedCase {
  id: string;
  caseNumber: string; // e.g. "CASE-2026-TR123"
  title: string;
  agencyId: string;
  agencyName: string;
  agencyRegion: Region;
  customerId: string;
  customerName: string;
  bookingId: string;
  bookingReference: string;
  destination: string;
  status: CaseStatus;
  priority: Priority;
  category: ComplaintCategory;
  assignedAgentId: string;
  assignedAgentName: string;
  ticketIds: string[];
  slaDeadline: string; // ISO string
  slaRiskLevel: SLARiskLevel;
  isEscalated: boolean;
  escalationReason?: string;
  checkInDate: string;
  lastCancellationDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string; // e.g. "TCK-8810"
  caseId: string;
  bookingReference: string;
  category: ComplaintCategory;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  assignedAgentId: string;
  assignedAgentName: string;
  source: 'Agency Portal' | 'Email' | 'Phone Call' | 'Supplier Webhook';
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface SupportAgent {
  id: string;
  name: string;
  email: string;
  role: string;
  regions: Region[];
  expertise: ComplaintCategory[];
  activeCases: number;
  maxCapacity: number;
  availability: 'Available' | 'In Call' | 'On Break' | 'Offline';
  avgResolutionMinutes: number;
  slaComplianceRate: number; // e.g. 96
}

export interface Communication {
  id: string;
  caseId: string;
  ticketId?: string;
  type: 'Agency' | 'Supplier' | 'Internal Note';
  senderName: string;
  senderRole: string;
  senderType: 'Agency Contact' | 'TBO Agent' | 'Supplier Desk' | 'System Bot';
  recipient: string;
  recipientsList: string[];
  subject: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  caseId: string;
  ticketId?: string;
  actorName: string;
  actorRole: string;
  actionType:
    | 'Case Created'
    | 'Ticket Linked'
    | 'Agent Assigned'
    | 'Agent Reassigned'
    | 'Status Updated'
    | 'Priority Escalated'
    | 'Note Added'
    | 'SLA Alert Triggered'
    | 'Case Transferred'
    | 'Case Resolved';
  details: string;
  timestamp: string;
}

export interface SmartRoutingScore {
  agent: SupportAgent;
  totalScore: number;
  breakdown: {
    regionMatch: number; // max 30
    expertiseMatch: number; // max 35
    capacityScore: number; // max 25
    availabilityScore: number; // max 10
  };
  reasons: string[];
  isRecommended: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'agent' | 'lead' | 'admin';
  department?: string;
  createdAt: string;
  updatedAt: string;
}
