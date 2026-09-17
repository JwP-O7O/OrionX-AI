import React from 'react';
import { X, Lock, ShieldCheck, Activity, Terminal, CheckCircle2, AlertTriangle, Cpu, Radio, Sparkles, FileCode } from 'lucide-react';
import { DaemonState, FileLock, InvariantCoreConstraints } from '../types';

interface DaemonSentinelModalProps {
  isOpen: boolean;
  onClose: () => void;
  daemonState: DaemonState;
  invariantConstraints: InvariantCoreConstraints;
  onReleaseLock: (filePath: string) => void;
}

export const DaemonSentinelModal: React.FC<DaemonSentinelModalProps> = ({
  isOpen,
  onClose,
  daemonState,
  invariantConstraints,
  onReleaseLock,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Radio className="w-5 h-5 animate-pulse text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Daemon Sentinel &amp; Distributed Lock Manager</h3>
              <p className="text-xs text-slate-400">Achtergrond processen, invariant guards &amp; git concurrency protectie</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Daemons Live Status Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* daemon_healer.py */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-bold text-white font-mono">daemon_healer.py</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {daemonState.daemonHealerStatus}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Luistert continu naar Sentry/Telemetry webhooks. Spawnt E2B Docker containers en claimt <code className="text-rose-300 font-mono">PRIORITY_HOTFIX</code> slot.
              </p>
              <div className="text-[10px] text-slate-500 font-mono pt-1 flex items-center justify-between border-t border-slate-900">
                <span>Actieve Sandboxes: {daemonState.activeSandboxesCount}</span>
                <span className="text-indigo-400">Polling: 500ms</span>
              </div>
            </div>

            {/* cron_evolution.py */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white font-mono">cron_evolution.py</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {daemonState.cronEvolutionStatus}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Draait dagelijks om 00:00 UTC buiten productietijden. Scant churn tickets, Reddit/Trustpilot en toetst harde invarianten.
              </p>
              <div className="text-[10px] text-slate-500 font-mono pt-1 flex items-center justify-between border-t border-slate-900">
                <span>Volgende Run: Vandaag 00:00 UTC</span>
                <span className="text-emerald-400">Branch: rd/proposal</span>
              </div>
            </div>
          </div>

          {/* Distributed File Lock Manager */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Distributed File Lock Leases (Voorkomt Git Conflicten)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {daemonState.activeFileLocks.length} Actieve Bestandsreserveringen
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Voordat een agent code bewerkt, wordt een exclusieve lease van 10 minuten geclaimd. 
              De Self-Healing Swarm kan met <code className="text-rose-400 font-mono">PRIORITY_HOTFIX</code> bestaande feature-locks preëmpten.
            </p>

            <div className="space-y-2 mt-3">
              {daemonState.activeFileLocks.length === 0 ? (
                <div className="text-xs text-slate-500 italic py-3 text-center">
                  Geen bestanden vergrendeld. Alle agents kunnen vrij mergen.
                </div>
              ) : (
                daemonState.activeFileLocks.map((lock, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
                      lock.isHotfixPreempted
                        ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                        : 'bg-slate-900 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{lock.filePath}</span>
                        {lock.isHotfixPreempted && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300 font-sans font-semibold uppercase">
                            Hotfix Preempted
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                        Vergrendeld door: <strong className="text-slate-200">{lock.lockedByAgent}</strong> ({lock.cluster})
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-amber-400">Lease: {lock.leaseExpiresInSeconds}s resterend</span>
                      <button
                        onClick={() => onReleaseLock(lock.filePath)}
                        className="text-[10px] text-slate-400 hover:text-white bg-slate-800 px-2 py-1 rounded transition-colors"
                      >
                        Release Lock
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Invariant Core Architecture (Hard Constraints) */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Onschendbare Invarianten (Hard Constraints)
              </h4>
            </div>
            <p className="text-[11px] text-slate-400">
              Deze regels kunnen <strong className="text-white">nooit</strong> door de R&amp;D Swarm zelf worden herschreven. 
              Ze voorkomen "scope drift" en beschermen de 80%+ brutomarge.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 text-xs">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Immutable Core Domain:</span>
                <div className="font-semibold text-white mt-1">{invariantConstraints.immutableDomain}</div>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Minimale Brutomarge:</span>
                <div className="font-semibold text-emerald-400 mt-1 font-mono">
                  &ge; {(invariantConstraints.targetGrossMarginMin * 100).toFixed(0)}% (Zero-Touch model)
                </div>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Toegestane Tech Stack:</span>
                <div className="font-mono text-[11px] text-indigo-300 mt-1">
                  {invariantConstraints.allowedTechStack.join(' • ')}
                </div>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Human-in-the-Loop Gate:</span>
                <div className="font-semibold text-amber-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Verplicht voor Scope &amp; Kernmissie Pivots
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Project LevelPlay OS Resilience Engine • Alle locks &amp; sentinels actief
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
};
