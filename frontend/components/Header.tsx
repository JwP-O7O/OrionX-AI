import React from 'react';
import { 
  Bot, 
  Layers, 
  Store, 
  ShieldAlert, 
  Play, 
  Pause, 
  FileCode2, 
  Terminal, 
  Cpu, 
  Flame, 
  BrainCircuit, 
  BookOpen,
  Radio,
  UserCheck,
  LayoutDashboard,
  ShieldCheck,
  Target,
  LogOut,
  Building2
} from 'lucide-react';
import { CircuitBreakerState, TenantProfile } from '../types';

interface HeaderProps {
  appMode: 'PORTAL' | 'ADMIN' | 'SWARM_ENGINE';
  setAppMode: (mode: 'PORTAL' | 'ADMIN' | 'SWARM_ENGINE') => void;
  activeTab: 'orchestrator' | 'selfhealing' | 'rnd' | 'localrepute' | 'playground' | 'roadmap';
  setActiveTab: (tab: 'orchestrator' | 'selfhealing' | 'rnd' | 'localrepute' | 'playground' | 'roadmap') => void;
  circuitBreaker: CircuitBreakerState;
  onOpenCircuitBreaker: () => void;
  onOpenSpecExport: () => void;
  onOpenJournal: () => void;
  onOpenDaemonSentinel: () => void;
  isAutopilotRunning: boolean;
  onToggleAutopilot: () => void;
  impersonatedTenant: TenantProfile | null;
  onStopImpersonating: () => void;
  onOpenColdAudit: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  appMode,
  setAppMode,
  activeTab,
  setActiveTab,
  circuitBreaker,
  onOpenCircuitBreaker,
  onOpenSpecExport,
  onOpenJournal,
  onOpenDaemonSentinel,
  isAutopilotRunning,
  onToggleAutopilot,
  impersonatedTenant,
  onStopImpersonating,
  onOpenColdAudit,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      {/* Impersonation active warning banner */}
      {impersonatedTenant && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 text-xs font-semibold px-4 py-1.5 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <UserCheck className="w-4 h-4 shrink-0" />
            <span>
              <strong>GOD MODE ACTIEF:</strong> Je bekijkt momenteel het portaal als tenant{' '}
              <span className="underline">{impersonatedTenant.businessName}</span> ({impersonatedTenant.email})
            </span>
            <button
              onClick={onStopImpersonating}
              className="ml-auto bg-slate-950 text-white hover:bg-slate-900 px-2.5 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span>Verlaat Impersonatie</span>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-white tracking-tight">LEVELPLAY</h1>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Micro-SaaS &amp; Swarm OS
                </span>
              </div>
              <p className="text-xs text-slate-400">Zero-Touch Local Reputation Engine</p>
            </div>
          </div>

          {/* Primary View Switcher: Klantportaal vs Superadmin vs Swarm Engine */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => setAppMode('PORTAL')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                appMode === 'PORTAL'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Klantportaal</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
            </button>

            <button
              onClick={() => setAppMode('ADMIN')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                appMode === 'ADMIN'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
              <span>Admin Cockpit</span>
            </button>

            <button
              onClick={() => setAppMode('SWARM_ENGINE')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                appMode === 'SWARM_ENGINE'
                  ? 'bg-slate-800 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Swarm Telemetrie</span>
            </button>
          </div>

          {/* Quick Actions, Circuit Breaker & Cold-Audit */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenColdAudit}
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition-all shadow-sm"
              title="Acquisitie Bot: Scrape Google Maps & genereer kant-en-klare koude audit mail"
            >
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Cold-Audit Bot</span>
            </button>

            <button
              onClick={onOpenDaemonSentinel}
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-amber-300 hover:border-amber-500/50 transition-all"
              title="Bekijk Distributed File Locks & Invariant Core Guards"
            >
              <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline">Sentinel</span>
            </button>

            <button
              onClick={onOpenJournal}
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300 hover:border-slate-600 hover:text-white transition-all"
              title="Bekijk LIVING_PLAN.md, ADRs en Git Audit Trail"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Living Plan</span>
            </button>

            <button
              onClick={onOpenCircuitBreaker}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all ${
                circuitBreaker.isTriggered || circuitBreaker.freezeAllTenants
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:border-slate-600'
              }`}
              title="Bekijk Circuit Breakers & Budget Veiligheidslimiet"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">€{circuitBreaker.spentBudgetEur.toFixed(2)} / €{circuitBreaker.totalBudgetEur}</span>
            </button>

            <button
              onClick={onOpenSpecExport}
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm"
              title="Exporteer Master Spec & DYNAMIC_BUSINESS_SPEC.json"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SPEC</span>
            </button>
          </div>
        </div>

        {/* Sub-navigation bar when in Swarm Engine Mode */}
        {appMode === 'SWARM_ENGINE' && (
          <div className="flex overflow-x-auto py-2 gap-1 border-t border-slate-800">
            {[
              { id: 'orchestrator', label: 'Swarm Orchestrator', icon: Cpu },
              { id: 'selfhealing', label: 'Self-Healing Swarm', icon: Flame },
              { id: 'rnd', label: 'R&D Innovation Loop', icon: BrainCircuit },
              { id: 'localrepute', label: 'Review Generator Engine', icon: Store },
              { id: 'playground', label: 'Agent Sandbox', icon: Terminal },
              { id: 'roadmap', label: '120h Roadmap', icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
