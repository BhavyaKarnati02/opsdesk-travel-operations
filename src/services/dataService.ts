import {
  Agency,
  Customer,
  Booking,
  UnifiedCase,
  Ticket,
  SupportAgent,
  Communication,
  ActivityLog,
  CaseStatus,
  Priority,
  ComplaintCategory,
  SLARiskLevel,
} from '../types';
import {
  SEED_AGENCIES,
  SEED_CUSTOMERS,
  SEED_BOOKINGS,
  SEED_AGENTS,
  SEED_CASES,
  SEED_TICKETS,
  SEED_COMMUNICATIONS,
  SEED_ACTIVITY_LOGS,
} from '../data/seedData';
import { db, auth, handleFirestoreError, OperationType } from '../firebase/config';
import { doc, setDoc, getDocs, collection, writeBatch } from 'firebase/firestore';

class DataService {
  private agencies: Agency[] = [];
  private customers: Customer[] = [];
  private bookings: Booking[] = [];
  private cases: UnifiedCase[] = [];
  private tickets: Ticket[] = [];
  private agents: SupportAgent[] = [];
  private communications: Communication[] = [];
  private activityLogs: ActivityLog[] = [];

  private listeners: Set<() => void> = new Set();
  private isInitialized = false;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('opsdesk_store_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.agencies = parsed.agencies || SEED_AGENCIES;
        this.customers = parsed.customers || SEED_CUSTOMERS;
        this.bookings = parsed.bookings || SEED_BOOKINGS;
        this.cases = parsed.cases || SEED_CASES;
        this.tickets = parsed.tickets || SEED_TICKETS;
        this.agents = parsed.agents || SEED_AGENTS;
        this.communications = parsed.communications || SEED_COMMUNICATIONS;
        this.activityLogs = parsed.activityLogs || SEED_ACTIVITY_LOGS;
        this.isInitialized = true;
        return;
      }
    } catch {
      // Fallback
    }

    this.agencies = JSON.parse(JSON.stringify(SEED_AGENCIES));
    this.customers = JSON.parse(JSON.stringify(SEED_CUSTOMERS));
    this.bookings = JSON.parse(JSON.stringify(SEED_BOOKINGS));
    this.cases = JSON.parse(JSON.stringify(SEED_CASES));
    this.tickets = JSON.parse(JSON.stringify(SEED_TICKETS));
    this.agents = JSON.parse(JSON.stringify(SEED_AGENTS));
    this.communications = JSON.parse(JSON.stringify(SEED_COMMUNICATIONS));
    this.activityLogs = JSON.parse(JSON.stringify(SEED_ACTIVITY_LOGS));
    this.isInitialized = true;
    this.saveToStorage();
  }

  private saveToStorage() {
    try {
      const payload = {
        agencies: this.agencies,
        customers: this.customers,
        bookings: this.bookings,
        cases: this.cases,
        tickets: this.tickets,
        agents: this.agents,
        communications: this.communications,
        activityLogs: this.activityLogs,
      };
      localStorage.setItem('opsdesk_store_v1', JSON.stringify(payload));
    } catch {
      // Storage fallback
    }
    this.notify();
  }

  public async initAuthenticatedSync() {
    if (!auth.currentUser) return;
    try {
      const casesSnap = await getDocs(collection(db, 'cases'));
      if (!casesSnap.empty) {
        // Existing data found in Firestore — pull without overwriting
        await this.pullFromFirestore();
      } else {
        // Firestore is empty — seed initial demo records safely
        await this.syncToFirestore();
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'cases');
    }
  }

  public async syncToFirestore() {
    if (!auth.currentUser) return;
    try {
      const batch = writeBatch(db);
      for (const ag of this.agencies) {
        batch.set(doc(db, 'agencies', ag.id), ag, { merge: true });
      }
      for (const cs of this.cases) {
        batch.set(doc(db, 'cases', cs.id), cs, { merge: true });
      }
      for (const tk of this.tickets) {
        batch.set(doc(db, 'tickets', tk.id), tk, { merge: true });
      }
      for (const agt of this.agents) {
        batch.set(doc(db, 'agents', agt.id), agt, { merge: true });
      }
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'batch-sync');
    }
  }

  public async pullFromFirestore() {
    if (!auth.currentUser) return;
    try {
      const [casesSnap, ticketsSnap, agentsSnap, agenciesSnap, commsSnap, logsSnap] = await Promise.all([
        getDocs(collection(db, 'cases')),
        getDocs(collection(db, 'tickets')),
        getDocs(collection(db, 'agents')),
        getDocs(collection(db, 'agencies')),
        getDocs(collection(db, 'communications')),
        getDocs(collection(db, 'activityLogs')),
      ]);

      let updated = false;
      if (!casesSnap.empty) {
        this.cases = casesSnap.docs.map((d) => d.data() as UnifiedCase);
        updated = true;
      }
      if (!ticketsSnap.empty) {
        this.tickets = ticketsSnap.docs.map((d) => d.data() as Ticket);
        updated = true;
      }
      if (!agentsSnap.empty) {
        this.agents = agentsSnap.docs.map((d) => d.data() as SupportAgent);
        updated = true;
      }
      if (!agenciesSnap.empty) {
        this.agencies = agenciesSnap.docs.map((d) => d.data() as Agency);
        updated = true;
      }
      if (!commsSnap.empty) {
        this.communications = commsSnap.docs.map((d) => d.data() as Communication);
        updated = true;
      }
      if (!logsSnap.empty) {
        this.activityLogs = logsSnap.docs.map((d) => d.data() as ActivityLog);
        updated = true;
      }
      if (updated) {
        this.saveToStorage();
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'cases');
    }
  }

  public resetToSeed() {
    // Clone fresh demo seeds
    this.agencies = JSON.parse(JSON.stringify(SEED_AGENCIES));
    this.customers = JSON.parse(JSON.stringify(SEED_CUSTOMERS));
    this.bookings = JSON.parse(JSON.stringify(SEED_BOOKINGS));
    this.cases = JSON.parse(JSON.stringify(SEED_CASES));
    this.tickets = JSON.parse(JSON.stringify(SEED_TICKETS));
    this.agents = JSON.parse(JSON.stringify(SEED_AGENTS));
    this.communications = JSON.parse(JSON.stringify(SEED_COMMUNICATIONS));
    this.activityLogs = JSON.parse(JSON.stringify(SEED_ACTIVITY_LOGS));
    this.isInitialized = true;
    this.saveToStorage();
    if (auth.currentUser) {
      this.syncToFirestore().catch(() => {});
    }
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // --- Getters ---
  public getAgencies(): Agency[] {
    return [...this.agencies];
  }

  public getAgencyById(id: string): Agency | undefined {
    return this.agencies.find((a) => a.id === id);
  }

  public getCustomers(): Customer[] {
    return [...this.customers];
  }

  public getCustomerById(id: string): Customer | undefined {
    return this.customers.find((c) => c.id === id);
  }

  public getBookings(): Booking[] {
    return [...this.bookings];
  }

  public getBookingByRef(ref: string): Booking | undefined {
    return this.bookings.find(
      (b) => b.bookingReference.toLowerCase() === ref.trim().toLowerCase()
    );
  }

  public getCases(): UnifiedCase[] {
    return [...this.cases];
  }

  public getCaseById(id: string): UnifiedCase | undefined {
    return this.cases.find((c) => c.id === id);
  }

  public getTickets(): Ticket[] {
    return [...this.tickets];
  }

  public getTicketById(id: string): Ticket | undefined {
    return this.tickets.find((t) => t.id === id);
  }

  public getTicketsByCaseId(caseId: string): Ticket[] {
    return this.tickets.filter((t) => t.caseId === caseId);
  }

  public getAgents(): SupportAgent[] {
    return [...this.agents];
  }

  public getAgentById(id: string): SupportAgent | undefined {
    return this.agents.find((a) => a.id === id);
  }

  public getCommunicationsByCaseId(caseId: string): Communication[] {
    return this.communications
      .filter((c) => c.caseId === caseId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getActivityLogsByCaseId(caseId: string): ActivityLog[] {
    return this.activityLogs
      .filter((l) => l.caseId === caseId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getAllActivityLogs(): ActivityLog[] {
    return [...this.activityLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // --- Mutations ---

  public updateCaseStatus(caseId: string, status: CaseStatus, actorName = 'Duty Ops Manager') {
    const cs = this.cases.find((c) => c.id === caseId);
    if (!cs) return;

    const oldStatus = cs.status;
    cs.status = status;
    cs.updatedAt = new Date().toISOString();
    if (status === 'Resolved') {
      cs.resolvedAt = new Date().toISOString();
      cs.slaRiskLevel = 'Resolved';
    }

    this.addActivityLog({
      caseId,
      actorName,
      actorRole: 'Operations Lead',
      actionType: 'Status Updated',
      details: `Case status changed from '${oldStatus}' to '${status}'.`,
    });

    this.persistCase(cs);
    this.saveToStorage();
  }

  public updateCasePriority(caseId: string, priority: Priority, actorName = 'Duty Ops Manager') {
    const cs = this.cases.find((c) => c.id === caseId);
    if (!cs) return;

    const oldPriority = cs.priority;
    cs.priority = priority;
    cs.updatedAt = new Date().toISOString();

    this.addActivityLog({
      caseId,
      actorName,
      actorRole: 'Operations Lead',
      actionType: 'Priority Escalated',
      details: `Priority changed from '${oldPriority}' to '${priority}'.`,
    });

    this.persistCase(cs);
    this.saveToStorage();
  }

  public reassignAgent(
    caseId: string,
    newAgentId: string,
    reason: string,
    actorName = 'Duty Ops Manager'
  ) {
    const cs = this.cases.find((c) => c.id === caseId);
    const newAgent = this.agents.find((a) => a.id === newAgentId);
    if (!cs || !newAgent) return;

    const oldAgentName = cs.assignedAgentName;
    const oldAgentId = cs.assignedAgentId;

    // Adjust active case counts
    const oldAgent = this.agents.find((a) => a.id === oldAgentId);
    if (oldAgent && oldAgent.activeCases > 0) {
      oldAgent.activeCases -= 1;
    }
    newAgent.activeCases += 1;

    cs.assignedAgentId = newAgent.id;
    cs.assignedAgentName = newAgent.name;
    cs.updatedAt = new Date().toISOString();

    // Also update assignedAgent for all linked tickets
    for (const t of this.tickets) {
      if (t.caseId === caseId) {
        t.assignedAgentId = newAgent.id;
        t.assignedAgentName = newAgent.name;
        t.updatedAt = new Date().toISOString();
        this.persistTicket(t);
      }
    }

    this.addActivityLog({
      caseId,
      actorName,
      actorRole: 'Dispatcher',
      actionType: 'Agent Reassigned',
      details: `Reassigned from ${oldAgentName} to ${newAgent.name}. Reason: ${reason}`,
    });

    this.persistCase(cs);
    this.persistAgent(newAgent);
    if (oldAgent) this.persistAgent(oldAgent);
    this.saveToStorage();
  }

  /**
   * Transfer Case - Preserves full communication recipient list and conversation continuity!
   */
  public transferCase(
    caseId: string,
    toAgentId: string,
    handoffNotes: string,
    actorName = 'Duty Ops Manager'
  ) {
    const cs = this.cases.find((c) => c.id === caseId);
    const toAgent = this.agents.find((a) => a.id === toAgentId);
    if (!cs || !toAgent) return;

    const fromAgentName = cs.assignedAgentName;
    const fromAgentId = cs.assignedAgentId;

    // Adjust workloads
    const fromAgent = this.agents.find((a) => a.id === fromAgentId);
    if (fromAgent && fromAgent.activeCases > 0) {
      fromAgent.activeCases -= 1;
    }
    toAgent.activeCases += 1;

    cs.assignedAgentId = toAgent.id;
    cs.assignedAgentName = toAgent.name;
    cs.updatedAt = new Date().toISOString();

    // Preserve communication recipient list from previous threads
    const previousComms = this.getCommunicationsByCaseId(caseId);
    const existingRecipients = new Set<string>();
    existingRecipients.add(toAgent.email);
    if (fromAgent) existingRecipients.add(fromAgent.email);
    previousComms.forEach((c) => {
      c.recipientsList?.forEach((r) => existingRecipients.add(r));
    });

    // Create an explicit handoff communication entry ensuring zero context loss
    this.addCommunication({
      caseId,
      type: 'Internal Note',
      senderName: actorName,
      senderRole: 'Operations Dispatcher',
      senderType: 'TBO Agent',
      recipient: `${toAgent.name} <${toAgent.email}>`,
      recipientsList: Array.from(existingRecipients),
      subject: `Case Handoff Continuity: Transferred from ${fromAgentName} to ${toAgent.name}`,
      content: `CASE TRANSFER SUMMARY:\n• Previous Agent: ${fromAgentName}\n• New Agent: ${toAgent.name}\n• Handoff Notes: ${handoffNotes}\n• All ${previousComms.length} previous messages and agency thread context have been handed over intact.`,
      isInternal: true,
    });

    this.addActivityLog({
      caseId,
      actorName,
      actorRole: 'Duty Ops Lead',
      actionType: 'Case Transferred',
      details: `Transferred case to ${toAgent.name}. Recipient continuity preserved. Notes: ${handoffNotes}`,
    });

    this.persistCase(cs);
    this.persistAgent(toAgent);
    if (fromAgent) this.persistAgent(fromAgent);
    this.saveToStorage();
  }

  public escalateCase(caseId: string, reason: string, actorName = 'Duty Ops Lead') {
    const cs = this.cases.find((c) => c.id === caseId);
    if (!cs) return;

    cs.isEscalated = true;
    cs.escalationReason = reason;
    cs.priority = 'Critical';
    cs.slaRiskLevel = 'At Risk';
    cs.updatedAt = new Date().toISOString();

    this.addActivityLog({
      caseId,
      actorName,
      actorRole: 'Escalations Watchdog',
      actionType: 'Priority Escalated',
      details: `ESCALATED TO DUTY MANAGER: ${reason}`,
    });

    this.addCommunication({
      caseId,
      type: 'Internal Note',
      senderName: actorName,
      senderRole: 'Escalations Watchdog',
      senderType: 'System Bot',
      recipient: 'Duty Operations Manager',
      recipientsList: ['dutyops@tbo.com', 'escalations@opsdesk.tbo.com'],
      subject: `[ESCALATION TRIGGER] Case ${cs.caseNumber} - ${cs.title}`,
      content: `Case has been flagged as travel-critical. Reason: ${reason}. Check-in / Last cancellation deadline is imminent. Immediate intervention required.`,
      isInternal: true,
    });

    this.persistCase(cs);
    this.saveToStorage();
  }

  public createTicket(ticketData: {
    caseId?: string;
    bookingReference: string;
    category: ComplaintCategory;
    subject: string;
    description: string;
    priority: Priority;
    source: Ticket['source'];
  }): { ticket: Ticket; caseItem: UnifiedCase } {
    const ticketId = `tck-${Date.now().toString().slice(-4)}`;
    const ticketNumber = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;

    let targetCase: UnifiedCase | undefined;

    if (ticketData.caseId) {
      targetCase = this.cases.find((c) => c.id === ticketData.caseId);
    } else {
      // Intelligent Case Unification:
      // Look for an existing open case matching the SAME booking reference or agency & customer context!
      targetCase = this.cases.find(
        (c) =>
          c.bookingReference.toLowerCase() === ticketData.bookingReference.trim().toLowerCase() &&
          c.status !== 'Resolved'
      );
    }

    const booking = this.getBookingByRef(ticketData.bookingReference);
    const agency = booking ? this.getAgencyById(booking.agencyId) : this.agencies[0];
    const customer = booking ? this.getCustomerById(booking.customerId) : this.customers[0];

    if (!targetCase) {
      // Create a brand new Unified Case
      const caseId = `case-${Date.now().toString().slice(-4)}`;
      const caseNumber = `CASE-2026-${ticketData.bookingReference.toUpperCase() || 'GEN'}`;
      
      // Auto-assign top agent
      const assignedAgent = this.agents[0];
      assignedAgent.activeCases += 1;

      targetCase = {
        id: caseId,
        caseNumber,
        title: `${ticketData.category} - ${booking ? booking.serviceName : 'Travel Inquiry'} (${booking ? booking.destination : agency?.region})`,
        agencyId: agency?.id || 'agency-abc',
        agencyName: agency?.name || 'ABC Travels',
        agencyRegion: agency?.region || 'South India',
        customerId: customer?.id || 'cust-bhavya',
        customerName: customer?.name || 'Bhavya Karnati',
        bookingId: booking?.id || 'book-tr123',
        bookingReference: ticketData.bookingReference.toUpperCase(),
        destination: booking?.destination || 'Tirupati',
        status: 'Open',
        priority: ticketData.priority,
        category: ticketData.category,
        assignedAgentId: assignedAgent.id,
        assignedAgentName: assignedAgent.name,
        ticketIds: [ticketId],
        slaDeadline: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
        slaRiskLevel: 'Safe',
        isEscalated: false,
        checkInDate: booking ? booking.checkInDate : new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        ...(booking?.lastCancellationDate ? { lastCancellationDate: booking.lastCancellationDate } : {}),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.cases.unshift(targetCase);
      this.persistCase(targetCase);
    } else {
      // Unify complaint under existing case!
      if (!targetCase.ticketIds.includes(ticketId)) {
        targetCase.ticketIds.push(ticketId);
        targetCase.updatedAt = new Date().toISOString();
        if (ticketData.priority === 'Critical') {
          targetCase.priority = 'Critical';
          targetCase.slaRiskLevel = 'At Risk';
        }
        this.persistCase(targetCase);
      }
    }

    const newTicket: Ticket = {
      id: ticketId,
      ticketNumber,
      caseId: targetCase.id,
      bookingReference: ticketData.bookingReference.toUpperCase(),
      category: ticketData.category,
      subject: ticketData.subject,
      description: ticketData.description,
      status: 'Open',
      priority: ticketData.priority,
      assignedAgentId: targetCase.assignedAgentId,
      assignedAgentName: targetCase.assignedAgentName,
      source: ticketData.source,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tickets.unshift(newTicket);
    this.persistTicket(newTicket);

    this.addActivityLog({
      caseId: targetCase.id,
      ticketId: newTicket.id,
      actorName: 'Ops Intake API',
      actorRole: 'System Gateway',
      actionType: 'Ticket Linked',
      details: `Created and unified ticket ${ticketNumber} under Case ${targetCase.caseNumber} for booking ${ticketData.bookingReference}.`,
    });

    this.saveToStorage();
    return { ticket: newTicket, caseItem: targetCase };
  }

  public linkTicketToCase(ticketId: string, targetCaseId: string, actorName = 'Duty Ops Lead') {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    const targetCase = this.cases.find((c) => c.id === targetCaseId);
    if (!ticket || !targetCase) return;

    const oldCaseId = ticket.caseId;
    ticket.caseId = targetCaseId;
    ticket.assignedAgentId = targetCase.assignedAgentId;
    ticket.assignedAgentName = targetCase.assignedAgentName;
    ticket.updatedAt = new Date().toISOString();

    // Remove from old case ticketIds
    const oldCase = this.cases.find((c) => c.id === oldCaseId);
    if (oldCase) {
      oldCase.ticketIds = oldCase.ticketIds.filter((id) => id !== ticketId);
      this.persistCase(oldCase);
    }

    if (!targetCase.ticketIds.includes(ticketId)) {
      targetCase.ticketIds.push(ticketId);
      this.persistCase(targetCase);
    }

    this.addActivityLog({
      caseId: targetCaseId,
      ticketId,
      actorName,
      actorRole: 'Intelligent Correlator',
      actionType: 'Ticket Linked',
      details: `Manually linked ticket ${ticket.ticketNumber} to Case ${targetCase.caseNumber}.`,
    });

    this.persistTicket(ticket);
    this.saveToStorage();
  }

  public updateTicketStatus(
    ticketId: string,
    status: Ticket['status'],
    resolutionNotes?: string,
    actorName = 'Assigned Agent'
  ) {
    const t = this.tickets.find((x) => x.id === ticketId);
    if (!t) return;

    t.status = status;
    t.updatedAt = new Date().toISOString();
    if (resolutionNotes) {
      t.resolutionNotes = resolutionNotes;
    }
    if (status === 'Resolved' || status === 'Closed') {
      t.resolvedAt = new Date().toISOString();
    }

    this.addActivityLog({
      caseId: t.caseId,
      ticketId: t.id,
      actorName,
      actorRole: 'Agent',
      actionType: 'Status Updated',
      details: `Ticket ${t.ticketNumber} marked as '${status}'. Notes: ${resolutionNotes || 'None'}`,
    });

    this.persistTicket(t);
    this.saveToStorage();
  }

  public addCommunication(comm: Omit<Communication, 'id' | 'createdAt'>) {
    const newComm: Communication = {
      ...comm,
      id: `comm-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.communications.unshift(newComm);

    // Save to Firestore when authenticated
    if (auth.currentUser) {
      try {
        setDoc(doc(db, 'communications', newComm.id), newComm).catch((err) =>
          handleFirestoreError(err, OperationType.CREATE, 'communications')
        );
      } catch {
        //
      }
    }

    this.saveToStorage();
    return newComm;
  }

  public addActivityLog(log: Omit<ActivityLog, 'id' | 'timestamp'>) {
    const newLog: ActivityLog = {
      ...log,
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    this.activityLogs.unshift(newLog);

    if (auth.currentUser) {
      try {
        setDoc(doc(db, 'activityLogs', newLog.id), newLog).catch((err) =>
          handleFirestoreError(err, OperationType.CREATE, 'activityLogs')
        );
      } catch {
        //
      }
    }
  }

  // --- Background Firestore Helpers ---
  private persistCase(cs: UnifiedCase) {
    if (!auth.currentUser) return;
    try {
      setDoc(doc(db, 'cases', cs.id), cs, { merge: true }).catch((err) =>
        handleFirestoreError(err, OperationType.UPDATE, `cases/${cs.id}`)
      );
    } catch {
      //
    }
  }

  private persistTicket(t: Ticket) {
    if (!auth.currentUser) return;
    try {
      setDoc(doc(db, 'tickets', t.id), t, { merge: true }).catch((err) =>
        handleFirestoreError(err, OperationType.UPDATE, `tickets/${t.id}`)
      );
    } catch {
      //
    }
  }

  private persistAgent(a: SupportAgent) {
    if (!auth.currentUser) return;
    try {
      setDoc(doc(db, 'agents', a.id), a, { merge: true }).catch((err) =>
        handleFirestoreError(err, OperationType.UPDATE, `agents/${a.id}`)
      );
    } catch {
      //
    }
  }
}

export const dataService = new DataService();
