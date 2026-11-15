import React, { useState, useEffect, useCallback } from 'react';
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
import { AuthPage, AuthMode } from './components/AuthPage';
import { EmailVerificationModal } from './components/EmailVerificationModal';
import { useAuth } from './contexts/AuthContext';
import { dataService } from './services/dataService';
import { UnifiedCase, Ticket } from './types';
import { CheckCircle2, Plane } from 'lucide-react';

const PROTECTED_PATHS: Record<string, NavModule> = {
  '/dashboard': 'dashboard',
  '/cases': 'cases',
  '/agencies': 'agencies',
  '/routing': 'routing',
  '/sla': 'sla',
  '/communications': 'communications',
  '/insights': 'insights',
};

const MODULE_TO_PATH: Record<NavModule, string> = {
  dashboard: '/dashboard',
  cases: '/cases',
  agencies: '/agencies',
  routing: '/routing',
  sla: '/sla',
  communications: '/communications',
  insights: '/insights',
};

function getAuthModeFromPath(pathname: string): AuthMode | null {
  const clean = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  if (clean === '/signin' || clean === '/login') return 'signin';
  if (clean === '/signup' || clean === '/register') return 'signup';
  if (clean === '/forgot-password') return 'forgot';
  return null;
}

function getAuthPathFromMode(mode: AuthMode): string {
  if (mode === 'signup') return '/signup';
  if (mode === 'forgot') return '/forgot-password';
  return '/signin';
}

function getProtectedModuleFromPath(pathname: string): NavModule | null {
  const clean = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  return PROTECTED_PATHS[clean] || null;
}

export default function App() {
  const { user, userProfile, emailVerified, loading, logout } = useAuth();
  const isAuthorized = Boolean(user && emailVerified);

  // Route & auth view state
  const initialPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const initialProtected = getProtectedModuleFromPath(initialPath);
  const initialAuthMode = getAuthModeFromPath(initialPath);

  const [activeModule, setActiveModule] = useState<NavModule>(initialProtected || 'dashboard');
  const [intendedModule, setIntendedModule] = useState<NavModule | null>(initialProtected);
  const [authMode, setAuthMode] = useState<AuthMode>(initialAuthMode || 'signin');
  const [redirectNotice, setRedirectNotice] = useState<string | null>(
    initialProtected ? 'Please sign in to access OpsDesk protected operations.' : null
  );

  // Workspace modal & filter states
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

  // Navigate to a protected module and keep browser URL in sync
  const navigateToModule = useCallback(
    (mod: NavModule) => {
      if (!isAuthorized) {
        setIntendedModule(mod);
        setAuthMode('signin');
        setRedirectNotice(
          user && !emailVerified
            ? 'Please verify your email address before accessing OpsDesk operations.'
            : 'Please sign in to access OpsDesk protected operations.'
        );
        if (typeof window !== 'undefined' && window.location.pathname !== '/signin') {
          window.history.pushState({}, '', '/signin');
        }
        return;
      }
      setActiveModule(mod);
      const targetPath = MODULE_TO_PATH[mod];
      if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
    },
    [isAuthorized, user, emailVerified]
  );

  const handleAuthModeChange = useCallback((nextMode: AuthMode) => {
    setAuthMode(nextMode);
    setRedirectNotice(null);
    const targetPath = getAuthPathFromMode(nextMode);
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  }, []);

  // Enforce route protection when auth or email verification state changes
  useEffect(() => {
    if (loading || typeof window === 'undefined') return;

    const currentPath = window.location.pathname;
    const pathAuthMode = getAuthModeFromPath(currentPath);
    const pathProtectedModule = getProtectedModuleFromPath(currentPath);

    if (!isAuthorized) {
      // Unauthenticated or unverified: block direct URL access to protected pages
      if (pathProtectedModule) {
        setIntendedModule(pathProtectedModule);
        setRedirectNotice(
          user && !emailVerified
            ? 'Please verify your email address before accessing OpsDesk operations.'
            : 'Please sign in to access OpsDesk protected operations.'
        );
      }
      if (!pathAuthMode) {
        setAuthMode('signin');
        window.history.replaceState({}, '', '/signin');
      }
    } else {
      // Authenticated & verified: redirect away from auth/root paths into protected dashboard or intended module
      if (pathAuthMode || currentPath === '/' || !pathProtectedModule) {
        const target = intendedModule || 'dashboard';
        setActiveModule(target);
        setIntendedModule(null);
        setRedirectNotice(null);
        window.history.replaceState({}, '', MODULE_TO_PATH[target]);
      } else {
        setActiveModule(pathProtectedModule);
        setRedirectNotice(null);
      }
    }
  }, [isAuthorized, user, emailVerified, loading, intendedModule]);

  // Listen to browser Back / Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname;
      const pathAuthMode = getAuthModeFromPath(pathname);
      const pathProtectedModule = getProtectedModuleFromPath(pathname);

      if (!isAuthorized) {
        if (pathProtectedModule) {
          setIntendedModule(pathProtectedModule);
          setRedirectNotice(
            user && !emailVerified
              ? 'Please verify your email address before accessing OpsDesk operations.'
              : 'Please sign in to access OpsDesk protected operations.'
          );
          setAuthMode('signin');
          window.history.replaceState({}, '', '/signin');
        } else if (pathAuthMode) {
          setAuthMode(pathAuthMode);
        } else {
          setAuthMode('signin');
          window.history.replaceState({}, '', '/signin');
        }
      } else {
        if (pathProtectedModule) {
          setActiveModule(pathProtectedModule);
        } else {
          setActiveModule('dashboard');
          window.history.replaceState({}, '', '/dashboard');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthorized, user, emailVerified]);

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

      if (selectedCase) {
        const updated = refreshedCases.find((c) => c.id === selectedCase.id);
        if (updated) setSelectedCase(updated);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [selectedCase]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Hackathon Scenario Trigger handler
  const handleTriggerScenario = (num: number) => {
    setCurrentScenario(num);

    if (num === 1) {
      const tr123Case = cases.find((c) => c.bookingReference === 'TR123') || cases[0];
      setSelectedCase(tr123Case);
      showToast('Scenario 1 Active: Unified Case for ABC Travels (Booking TR123, Bhavya Karnati) with 3 connected tickets.');
    } else if (num === 2) {
      navigateToModule('routing');
      showToast('Scenario 2 Active: Transparent Smart Routing score evaluated for Agent Priya Sharma.');
    } else if (num === 3) {
      navigateToModule('communications');
      showToast('Scenario 3 Active: Transfer Continuity thread with preserved recipient list & handoff notes.');
    } else if (num === 4) {
      navigateToModule('sla');
      showToast('Scenario 4 Active: Imminent check-in countdown (<2h) & Duty Manager escalation monitor.');
    } else if (num === 5) {
      navigateToModule('insights');
      showToast('Scenario 5 Active: Systemic repeated failure detection & operational CSV report export.');
    }
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
      navigateToModule('cases');
    }
  };

  const handleSignOut = async () => {
    setSelectedCase(null);
    setIsCreateModalOpen(false);
    setCurrentScenario(null);
    setSearchQuery('');
    setIntendedModule(null);
    setRedirectNotice(null);
    await logout();
    setAuthMode('signin');
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/signin');
    }
  };

  // Loading Splash while Firebase Auth checks persisted session
  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-[#F1F5FA] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center gap-4 max-w-sm w-full text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#20A89E] to-[#4267D5] flex items-center justify-center text-white shadow-md animate-pulse">
            <Plane className="w-6 h-6 -rotate-45" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#263B5B]">OpsDesk Security Check</h2>
            <p className="text-xs text-slate-500 mt-1">
              Verifying authenticated Firebase session...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated or unverified users cannot access OpsDesk modules
  if (!user || !emailVerified) {
    return (
      <>
        <AuthPage
          mode={authMode}
          onChangeMode={handleAuthModeChange}
          redirectNotice={redirectNotice}
        />
        {user && !emailVerified && (
          <EmailVerificationModal
            isOpen={true}
            email={user.email || ''}
            userName={userProfile?.name || user.displayName || undefined}
          />
        )}
      </>
    );
  }

  const operatorName =
    userProfile?.name || user.displayName || user.email?.split('@')[0] || 'TBO Operator';
  const operatorEmail = userProfile?.email || user.email || '';
  const operatorRole = userProfile?.role || 'agent';

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
          navigateToModule(mod);
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
          userName={operatorName}
          userEmail={operatorEmail}
          userRole={operatorRole}
          onSignOut={handleSignOut}
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
              onNavigateToModule={(mod) => navigateToModule(mod)}
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
              currentUserName={operatorName}
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
          onNavigateToModule={(mod) => navigateToModule(mod)}
          currentUserName={operatorName}
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
