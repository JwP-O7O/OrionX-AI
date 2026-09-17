import React from 'react';
import { X, ShieldAlert, CheckCircle2, AlertOctagon, RotateCcw } from 'lucide-react';
import { CircuitBreakerState } from '../types';

interface CircuitBreakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: CircuitBreakerState;
  setState: React.Dispatch<React.SetStateAction<CircuitBreakerState>>;
}

export const CircuitBreakerModal: React.FC<CircuitBreakerModalProps> = ({
  isOpen,
  onClose,
  state,
  setState,
}) => {
  if (!isOpen) return null;

  const budgetUsagePercent = Math.min(
    100,
    Math.round((state.spentBudgetEur / state.totalBudgetEur) * 100)
  );

  const handleReset = () => {
    setState(prev => ({
      ...prev,
      spentBudgetEur: 12.45,
      hourlyCalls: 18,
      isTriggered: false,
    }));
  };

  const handleToggleEmergencyStop = () => {
    setState(prev => ({
      ...prev,
      isTriggered: !prev.isTriggered,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-white">Fail-Safe & Veiligheidsgrenzen</h3>
              <p className="text-xs text-slate-400">Hardware & API Circuit Breaker bewaking</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Status banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              state.isTriggered
                ? 'bg-rose-950/30 border-rose-500 text-rose-300'
                : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
            }`}
          >
            {state.isTriggered ? (
              <AlertOctagon className="w-5 h-5 text-rose-400 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-xs uppercase tracking-wider">
                {state.isTriggered ? 'NOODSTOP ACTIEF (CIRCUIT TRIPPED)' : 'VEILIGHEIDSSTATUS: NORMAAL'}
              </div>
              <p className="text-xs mt-0.5 opacity-90">
                {state.isTriggered
                  ? 'Alle agent calls zijn gepauzeerd. Geen verdere externe token consumptie.'
                  : 'Alle geautomatiseerde loops blijven ruim binnen de budget- en uurlimiet.'}
              </p>
            </div>
          </div>

          {/* Hard Rules Breakdown */}
          <div className="space-y-3">
            {/* Rule 1: Financiële Stopknop */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-200">1. Financiële Stopknop (OpenAI/Anthropic/Gemini)</span>
                <span className="font-mono text-indigo-400">€{state.spentBudgetEur.toFixed(2)} / €{state.totalBudgetEur}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all"
                  style={{ width: `${budgetUsagePercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Harde maandlimiet van € 150,00. Zodra bereikt schakelt de gateway automatisch uit.
              </p>
            </div>

            {/* Rule 2: Uurlijkse rate-limit & loop limit */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">2. Uurlijkse Rate Limit</span>
                <span className="font-mono text-slate-300">{state.hourlyCalls} / {state.maxHourlyCalls} calls/uur</span>
              </div>
              <p className="text-[11px] text-slate-400">
                &gt;100 calls/uur zonder opgeslagen output resulteert in automatische process kill.
              </p>
            </div>

            {/* Rule 3: Loop limit */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">3. Maximale Iteratie Limiet (Loop Guard)</span>
                <span className="font-mono text-amber-400">Max {state.maxIterLimit} iteraties / taak</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Geen enkele agent mag meer dan 5 iteraties over één taak draaien. Bij overschrijding wordt de taak direct <code className="text-rose-400 font-mono">BLOCKED</code> met Slack/Telegram webhook.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Tellers</span>
          </button>

          <button
            onClick={handleToggleEmergencyStop}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              state.isTriggered
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
            }`}
          >
            {state.isTriggered ? 'Deactiveer Noodstop' : 'Activeer Noodstop (Kill All)'}
          </button>
        </div>
      </div>
    </div>
  );
};
