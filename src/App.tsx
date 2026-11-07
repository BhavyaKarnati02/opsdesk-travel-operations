import React, { useState, useEffect } from 'react';
import { Sidebar, NavModule } from './components/Sidebar';
import { Header } from './components/Header';
import { ScenarioBanner } from './components/ScenarioBanner';
import { DashboardModule } from './modules/DashboardModule';
import { CasesModule } from './modules/CasesModule';
import { AgenciesModule } from './modules/AgenciesModule';
import { SmartRoutingModule } from './modules/SmartRoutingModule';
import { SLAMonitoringModule } from './modules/SLAMonitoringModule';
import { CommunicationsModule } from './modules/CommunicationsModule';
import { InsightsModule } from './modules/InsightsModule';
import { CaseDetailModal } from './components/CaseDetailModal';
import { CreateTicketModal } from './components/CreateTicketModal';
import { dataService } from './services/dataService';
import { UnifiedCase, Ticket } from './types';
import { CheckCircle2, RotateCcw } from 'lucide-react';

export default function App() {
  const [activeModule, setActiveModule] = useState<NavModule>('dashboard');
  const [selectedCase, setSelectedCase] = useState<UnifiedCase | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createCaseId, setCreateCaseId] = useState<string | undefined>(undefined);
  const [createBookingRef, setCreateBookingRef] = useState<string | undefined>(undefined);
  const [currentScenario, setCurrentScenario] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Core Data State synchronized from dataService
  const [cases, setCases] = useState(() => dataService.getCases());
  const [tickets, setTickets] = useState(() => dataService.getTickets());
  const [agencies, setAgencies] = useState(() => dataService.getAgencies());
  const [customers, setCustomers] = useState(() => dataService.getCustomers());
  const [bookings, setBookings] = useState(() => dataService.getBookings());
  const [agents, setAgents] = useState(() => dataService.getAgents());
  const [activityLogs, setActivityLogs] = useState(() => dataService.getAllActivityLogs());

  // Subscribe to dataService mutations
  useEffect(() => {
    const unsubscribe = dataService.subscribe(() => {
      const refreshedCases = dataService.getCases();
      setCases(refreshedCases);
      setTickets(dataService.getTickets());
      setAgencies(dataService.getAgencies());
      setCustomers(dataService.getCustomers());
      setBookings(dataService.getBookings());
      setAgents(dataService.getAgents());
      setActivityLogs(dataService.getAllActivityLogs());

      // Update selectedCase reference if open
      if (selectedCase) {
        const updated = refreshedCases.find((c) => c.id === selectedCase.id);
        if (updated) setSelectedCase(updated);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [selectedCase]);

  // Hackathon Scenario Trigger handler
  const handleTriggerScenario = (num: number) => {
    setCurrentScenario(num);

    if (num === 1) {
      // Scenario 1: ABC Travels (TR123) Unified Case with 3 connected complaints
      const tr123Case = cases.find((c) => c.bookingReference === 'TR123') || cases[0];
      setSelectedCase(tr123Case);
      showToast('Scenario 1 Active: Unified Case for ABC Travels (Booking TR123, Bhavya Karnati) with 3 connected tickets.');
    } else if (num === 2) {
      // Scenario 2: Smart Routing Recommendation with transparent scoring
      setActiveModule('routing');
      showToast('Scenario 2 Active: Transparent Smart Routing score evaluated for Agent Priya Sharma.');
    } else if (num === 3) {
      // Scenario 3: Handoff Continuity & Preserved Recipients
      setActiveModule('communications');
      showToast('Scenario 3 Active: Transfer Continuity thread with preserved recipient list & handoff notes.');
    } else if (num === 4) {
      // Scenario 4: Travel-Aware SLA Imminent Check-in Countdown & Escalation
      setActiveModule('sla');
      showToast('Scenario 4 Active: Imminent check-in countdown (<2h) & Duty Manager escalation monitor.');
    } else if (num === 5) {
      // Scenario 5: Operational Insights & CSV Export
      setActiveModule('insights');
      showToast('Scenario 5 Active: Systemic repeated failure detection & operational CSV report export.');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleResetData = () => {
    dataService.resetToSeed();
    showToast('Database reset to fresh demo dataset (including ABC Travels TR123 scenario).');
  };

  const handleOpenCreateForCase = (caseId: string, bookingRef: string) => {
    setCreateCaseId(caseId);
    setCreateBookingRef(bookingRef);
    setIsCreateModalOpen(true);
  };

  const handleTicketCreated = (newTicket: Ticket, caseItem: UnifiedCase) => {
    showToast(`Ticket ${newTicket.ticketNumber} created and unified under Case ${caseItem.caseNumber}.`);
    setSelectedCase(caseItem);
  };

  const handleHeaderSearch = (q: string) => {
    setSearchQuery(q);
    if (q.trim() && activeModule !== 'cases') {
      setActiveModule('cases');
    }
  };

  // Urgent cases for header
  const urgentCases = cases.filter(
    (c) => c.priority === 'Critical' && c.status !== 'Resolved'
  );
  const openCasesCount = cases.filter((c) => c.status !== 'Resolved').length;
  const slaAtRiskCount = cases.filter(
    (c) => (c.slaRiskLevel === 'At Risk' || c.slaRiskLevel === 'Approaching Risk') && c.status !== 'Resolved'
  ).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F1F5FA] text-slate-800 antialiased font-sans">
      {/* Dark Navy Sidebar */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={(mod) => {
          setActiveModule(mod);
          setSearchQuery('');
        }}
        openCasesCount={openCasesCount}
        slaAtRiskCount={slaAtRiskCount}
        onResetSeed={handleResetData}
        onTriggerScenario={handleTriggerScenario}
      />

      {/* Main Operational Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={handleHeaderSearch}
          onOpenCreateModal={() => {
            setCreateCaseId(undefined);
            setCreateBookingRef(undefined);
            setIsCreateModalOpen(true);
          }}
          urgentCases={urgentCases}
          onSelectCase={(cs) => setSelectedCase(cs)}
        />

        {/* VoyageHack 4.0 Demonstration Quick Switcher Banner */}
        <ScenarioBanner
          currentScenario={currentScenario}
          onSelectScenario={handleTriggerScenario}
          onDismiss={() => setCurrentScenario(null)}
        />

        {/* Active Toast Notification */}
        {toastMessage && (
          <div className="bg-[#263B5B] text-white px-6 py-2.5 text-xs font-semibold flex items-center justify-between border-b border-[#354E75] animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#20A89E] shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Scrollable Workspace Viewport */}
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {activeModule === 'dashboard' && (
            <DashboardModule
              cases={cases}
              tickets={tickets}
              agencies={agencies}
              activityLogs={activityLogs}
              onSelectCase={(cs) => setSelectedCase(cs)}
              onNavigateToModule={(mod) => setActiveModule(mod)}
            />
          )}

          {activeModule === 'cases' && (
            <CasesModule
              cases={cases}
              onSelectCase={(cs) => setSelectedCase(cs)}
              onOpenCreateModal={() => {
                setCreateCaseId(undefined);
                setCreateBookingRef(undefined);
                setIsCreateModalOpen(true);
              }}
            />
          )}

          {activeModule === 'agencies' && (
            <AgenciesModule
              agencies={agencies}
              cases={cases}
              bookings={bookings}
              onSelectCase={(cs) => setSelectedCase(cs)}
            />
          )}

          {activeModule === 'routing' && (
            <SmartRoutingModule
              cases={cases}
              agents={agents}
              onSelectCase={(cs) => setSelectedCase(cs)}
            />
          )}

          {activeModule === 'sla' && (
            <SLAMonitoringModule
              cases={cases}
              onSelectCase={(cs) => setSelectedCase(cs)}
            />
          )}

          {activeModule === 'communications' && (
            <CommunicationsModule
              cases={cases}
              agents={agents}
              onSelectCase={(cs) => setSelectedCase(cs)}
            />
          )}

          {activeModule === 'insights' && (
            <InsightsModule
              cases={cases}
              tickets={tickets}
              agencies={agencies}
              bookings={bookings}
            />
          )}
        </main>
      </div>

      {/* Case Details Drawer / Modal */}
      {selectedCase && (
        <CaseDetailModal
          caseItem={selectedCase}
          onClose={() => setSelectedCase(null)}
          agencies={agencies}
          customers={customers}
          bookings={bookings}
          agents={agents}
          onOpenCreateTicketForCase={handleOpenCreateForCase}
          onNavigateToModule={(mod) => setActiveModule(mod)}
        />
      )}

      {/* Create Ticket / Complaint Modal */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultCaseId={createCaseId}
        defaultBookingRef={createBookingRef}
        bookings={bookings}
        cases={cases}
        onTicketCreated={handleTicketCreated}
      />
    </div>
  );
}
