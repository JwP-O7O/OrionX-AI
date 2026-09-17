import React, { useState } from 'react';
import { RnDHypothesis, InvariantCoreConstraints } from '../types';
import { runAutoResearchCycle } from '../services/geminiService';
import { 
  Lightbulb, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  Zap, 
  RefreshCw, 
  DollarSign, 
  Percent, 
  ArrowRight,
  BrainCircuit,
  MessageSquareQuote,
  ShieldAlert,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface RnDBrainstormSwarmProps {
  onInjectMilestone: (newMilestoneTask: { milestoneTitle: string; taskTitle: string; agentAssigned: string }) => void;
  onAddLog: (level: 'info' | 'warn' | 'error' | 'success', agentName: string, agentId: string, message: string, dataSnippet?: string) => void;
  onRecordAudit: (action: 'PLAN_PIVOT', summary: string) => void;
}

const INITIAL_HYPOTHESES: RnDHypothesis[] = [
  {
    id: 'HYP-01',
    timestamp: 'Vanochtend 08:30',
    title: 'WhatsApp Voice Notes Dicteer-Module',
    sourceObservation: 'MKB monteurs & bakkers zijn onderweg en typen geen reviews. Ze gebruiken de hele dag WhatsApp voice memo\'s.',
    proposedFeature: 'Laat ondernemer 10 sec spraakbericht sturen: AI transcribeert, filtert klantgegevens en stuurt automatisch 1-klik review link.',
    targetMetric: 'Review conversie +62%, MKB activatie +35%',
    scores: {
      ltvCacImpact: 9.2,
      zeroTouchFeasibility: 8.8,
      tokenGrossMargin: 8.9,
      overallScore: 9.0,
    },
    invariantCheck: {
      passed: true,
      violatesDomainConstraint: false,
      violatesMarginConstraint: false,
      notes: 'Binnen MKB reputatie automation en >80% brutomarge.',
    },
    decision: 'APPROVED_AND_INJECTED',
    injectedMilestoneSpec: {
      milestoneTitle: 'Milestone 4: Autonome Marketing & Launch',
      taskTitle: 'Koppel WhatsApp Voice Note transcriptie API aan review invite webhook',
      agentAssigned: 'Backend Coder',
    },
  },
  {
    id: 'HYP-02',
    timestamp: 'Gisteren 17:15',
    title: '1-Klik Overstaptool van Ketensoftware',
    sourceObservation: 'Trustpilot reviews van Podium en Birdeye klagen over prijsstijgingen tot €300/mnd en wurgcontracten.',
    proposedFeature: 'Bouw een "Kopieer-mijn-reviews-en-bespaar" overstapwizard met 1-klik Google OAuth import.',
    targetMetric: 'Customer Acquisition Cost (CAC) -45%',
    scores: {
      ltvCacImpact: 8.5,
      zeroTouchFeasibility: 8.9,
      tokenGrossMargin: 9.1,
      overallScore: 8.8,
    },
    invariantCheck: {
      passed: true,
      violatesDomainConstraint: false,
      violatesMarginConstraint: false,
      notes: 'Focus blijft op Google My Business review overstappen.',
    },
    decision: 'APPROVED_AND_INJECTED',
    injectedMilestoneSpec: {
      milestoneTitle: 'Milestone 4: Autonome Marketing & Launch',
      taskTitle: 'Genereer overstappagina\'s en import script voor ex-Podium klanten',
      agentAssigned: 'Growth Agent',
    },
  },
  {
    id: 'HYP-03',
    timestamp: '2 dagen geleden',
    title: 'Crypto Betaalmodule & Web3 Review Tokens',
    sourceObservation: 'Trendy blog post suggereerde cryptobeloningen voor reviews.',
    proposedFeature: 'Integratie van Ethereum smart contracts voor token beloningen per review.',
    targetMetric: 'Niet passend',
    scores: {
      ltvCacImpact: 3.2,
      zeroTouchFeasibility: 2.5,
      tokenGrossMargin: 4.0,
      overallScore: 3.2,
    },
    invariantCheck: {
      passed: false,
      violatesDomainConstraint: true,
      violatesMarginConstraint: true,
      notes: 'Schendt de Invariant Core (on-chain gas fees en schending van Google Terms of Service).',
    },
    decision: 'BLOCKED_BY_INVARIANT_CORE',
    rejectionReason: 'GEBLOKKEERD DOOR ONONTKOOMBARE INVARIANT: Schendt Google TOS (betaalde reviews) en breekt het 80%+ margemodel.',
  },
];

export const RnDBrainstormSwarm: React.FC<RnDBrainstormSwarmProps> = ({
  onInjectMilestone,
  onAddLog,
  onRecordAudit,
}) => {
  const [hypotheses, setHypotheses] = useState<RnDHypothesis[]>(INITIAL_HYPOTHESES);
  const [marketInput, setMarketInput] = useState(
    'Lokale tandartsen en fysiotherapeuten in de Randstad verliezen leads doordat ketens adverteren op Google Maps met 1000+ reviews.'
  );
  const [isResearching, setIsResearching] = useState(false);

  const handleRunResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marketInput || isResearching) return;

    setIsResearching(true);
    onAddLog('info', 'Auto-Research Agent 3.1', 'researcher', `Scant markttrends en churn data: "${marketInput.slice(0, 60)}..."`);

    try {
      // Step 1: Brainstorm & Innovation
      onAddLog('info', 'Innovation Agent 3.2', 'brainstormer', 'Hypotheses en feature prototypes genereren via Gemini 2.5...');
      
      const result = await runAutoResearchCycle(marketInput);

      const newHypothesis: RnDHypothesis = {
        id: `HYP-${Date.now().toString().slice(-2)}`,
        timestamp: new Date().toLocaleTimeString('nl-NL'),
        title: result.title,
        sourceObservation: result.sourceObservation,
        proposedFeature: result.proposedFeature,
        targetMetric: result.targetMetric,
        scores: result.scores,
        invariantCheck: result.invariantCheck || { passed: true, notes: 'Compliant met Invariant Core' },
        decision: result.decision,
        rejectionReason: result.rejectionReason,
        injectedMilestoneSpec: result.injectedMilestoneSpec,
      };

      setHypotheses([newHypothesis, ...hypotheses]);

      if (result.decision === 'APPROVED_AND_INJECTED' && result.injectedMilestoneSpec) {
        onAddLog('success', 'Invariant Guard 3.3', 'invariant_guard', `Invariant check geslaagd! Binnen MKB reputatie scope & marge.`);
        onAddLog('success', 'Dynamic Spec Architect 3.4', 'spec_architect', `Taak "${result.injectedMilestoneSpec.taskTitle}" direct geïnjecteerd in het LIVING_PLAN.md en roadmap!`);
        
        onInjectMilestone(result.injectedMilestoneSpec);
        onRecordAudit('PLAN_PIVOT', `R&D Innovatie geactiveerd: ${result.title}`);
      } else if (result.decision === 'BLOCKED_BY_INVARIANT_CORE') {
        onAddLog('error', 'Invariant Core Guard', 'invariant_guard', `GEBLOKKEERD: Idee "${result.title}" schendt de onschendbare kernregels van het bedrijfsplan!`);
      } else {
        onAddLog('warn', 'ROI Critic Agent 3.3', 'critic_roi', `Idee afgewezen (Score ${result.scores.overallScore.toFixed(1)} < 8.0): ${result.rejectionReason || 'Onvoldoende ROI'}`);
      }
    } catch (err: any) {
      onAddLog('error', 'R&D Swarm', 'rnd', `Fout in research cyclus: ${err?.message}`);
    } finally {
      setIsResearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
              Cluster 3: Continuous Auto-Research &amp; Invariant Guard
            </span>
            <span className="text-xs text-slate-400">Zelf-Evoluerend Bedrijfsplan met Scope Drift Protectie</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Autonome Innovatie, Invariant Filter &amp; Roadmap Injectie</h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Het bedrijf herontwerpt zichzelf continu. Onschendbare Invarianten (Hard Constraints) voorkomen dat de swarm 
            afwijkt van het kernmodel (Micro-SaaS MKB Reputatie met &ge;80% brutomarge).
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <div className="text-center px-2">
            <div className="text-xl font-bold text-emerald-400 font-mono">
              {hypotheses.filter(h => h.decision === 'APPROVED_AND_INJECTED').length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase">Geïnjecteerd</div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-center px-2">
            <div className="text-xl font-bold text-rose-400 font-mono">
              {hypotheses.filter(h => h.decision === 'BLOCKED_BY_INVARIANT_CORE').length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase">Geblokkeerd</div>
          </div>
        </div>
      </div>

      {/* R&D Swarm Trigger Box */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <form onSubmit={handleRunResearch} className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Start Nieuwe Auto-Research &amp; Brainstorm Cyclus
            </label>
            <span className="text-[11px] text-slate-400">Wordt normaal elke 24u getriggerd door cron_evolution.py</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={marketInput}
              onChange={(e) => setMarketInput(e.target.value)}
              placeholder="Voer marktobservatie, concurrentiedata of churn feedback in..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
            />
            <button
              type="submit"
              disabled={isResearching}
              className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all shrink-0"
            >
              {isResearching ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>R&amp;D Swarm Evalueert Invarianten...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Draai Research Cyclus</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Hypotheses & ROI Gate Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Gegenereerde Hypotheses &amp; Invariant Evaluaties
          </h3>
          <span className="text-xs text-slate-400">Harde Drempel: Score &ge; 8.0 &amp; Invariant Core Approved</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {hypotheses.map(hyp => {
            const isApproved = hyp.decision === 'APPROVED_AND_INJECTED';
            const isBlockedByInvariant = hyp.decision === 'BLOCKED_BY_INVARIANT_CORE';

            return (
              <div
                key={hyp.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  isApproved
                    ? 'bg-slate-900/80 border-indigo-500/40 shadow-lg shadow-indigo-500/5'
                    : isBlockedByInvariant
                    ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-500/5'
                    : 'bg-slate-900/40 border-slate-800 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono text-slate-400">{hyp.id} • {hyp.timestamp}</span>
                    {isApproved ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        GEÏNJECTEERD IN PLAN
                      </span>
                    ) : isBlockedByInvariant ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        <ShieldAlert className="w-3 h-3 text-rose-400" />
                        INVARIANT BLOCKED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        <XCircle className="w-3 h-3 text-slate-400" />
                        AFGEWEZEN (ROI &lt; 8)
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white tracking-tight">{hyp.title}</h4>

                  {/* Observation & Feature */}
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] font-mono text-slate-400 block mb-0.5">Markt Observatie:</span>
                      <p className="text-slate-300 leading-relaxed text-[11px]">{hyp.sourceObservation}</p>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] font-mono text-indigo-400 block mb-0.5">Voorgestelde Oplossing:</span>
                      <p className="text-slate-200 leading-relaxed text-[11px]">{hyp.proposedFeature}</p>
                    </div>

                    {/* Invariant Core evaluation badge */}
                    {hyp.invariantCheck && (
                      <div className={`p-2 rounded-lg border text-[10px] flex items-center gap-1.5 ${
                        hyp.invariantCheck.passed
                          ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-300'
                          : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                      }`}>
                        <ShieldCheck className="w-3 h-3 shrink-0" />
                        <span>Invariant: {hyp.invariantCheck.notes || 'Scope drift check completed'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ROI Score Grid & Injection Target */}
                <div className="mt-4 pt-3 border-t border-slate-800/60">
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                      <div className="text-[9px] text-slate-400">LTV / CAC</div>
                      <div className="text-xs font-bold text-white font-mono">{hyp.scores.ltvCacImpact}</div>
                    </div>
                    <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                      <div className="text-[9px] text-slate-400">Zero-Touch</div>
                      <div className="text-xs font-bold text-white font-mono">{hyp.scores.zeroTouchFeasibility}</div>
                    </div>
                    <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                      <div className="text-[9px] text-slate-400">&gt;80% Marge</div>
                      <div className="text-xs font-bold text-white font-mono">{hyp.scores.tokenGrossMargin}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Gewogen Score:</span>
                    <span className={`font-mono font-bold text-sm ${
                      isApproved ? 'text-emerald-400' : isBlockedByInvariant ? 'text-rose-400' : 'text-slate-400'
                    }`}>
                      {hyp.scores.overallScore.toFixed(1)} / 10
                    </span>
                  </div>

                  {isApproved && hyp.injectedMilestoneSpec && (
                    <div className="mt-2 text-[10px] font-mono bg-indigo-950/40 p-2 rounded-lg border border-indigo-500/20 text-indigo-300">
                      &rarr; Injected in {hyp.injectedMilestoneSpec.milestoneTitle.split(':')[0]}: "{hyp.injectedMilestoneSpec.taskTitle.slice(0, 48)}..."
                    </div>
                  )}

                  {hyp.rejectionReason && (
                    <div className="mt-2 text-[10px] text-rose-300/90 italic bg-rose-950/20 p-2 rounded-lg border border-rose-500/20">
                      {hyp.rejectionReason}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
