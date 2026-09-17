import React, { useState } from 'react';
import { X, Copy, Check, BookOpen, GitBranch, ShieldCheck, FileText, ScrollText } from 'lucide-react';
import { ADRRecord, AuditTrailEntry } from '../types';

interface SystemJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditTrail: AuditTrailEntry[];
}

const INITIAL_ADRS: ADRRecord[] = [
  {
    id: 'ADR-001',
    title: 'Autonome Zero-Touch State Machine via LangGraph',
    date: '2025-05-01',
    status: 'Accepted',
    context: 'Traditionele chat-agent swarms leiden tot oneindige lussen en onvoorspelbare tokenkosten.',
    decision: 'Gebruik een deterministische State Machine met strikte max_iter=5 en budget circuit breakers.',
    consequences: 'Gegarandeerde werking binnen budget; falende taken triggeren direct webhook escalatie.',
  },
  {
    id: 'ADR-002',
    title: 'Self-Healing Sandbox & Vectorized Runbook Geheugen',
    date: '2025-05-06',
    status: 'Accepted',
    context: 'Wanneer runtime fouten optreden in staging/productie, kan een mens niet altijd binnen 5 minuten reageren.',
    decision: 'Laat Sentry fouten opvangen, genereer een reproductietest en patch in Docker/E2B sandbox.',
    consequences: 'Dezelfde bug kan nooit tweemaal optreden doordat de oplossing als vector wordt opgeslagen.',
  },
  {
    id: 'ADR-003',
    title: 'Continue Auto-Research Loop met 8/10 ROI Gate',
    date: '2025-05-09',
    status: 'Accepted',
    context: 'Voorkom "feature creep" en handmatige consultancy verzoeken die het Micro-SaaS model uithollen.',
    decision: 'Alleen ideeën met score >= 8/10 mogen autonoom het LIVING_PLAN.md en de roadmap wijzigen.',
    consequences: 'Hoge brutomarge (>80%) blijft gegarandeerd zonder menselijke ontwikkelaars.',
  },
];

// Helper to safely copy text even under restricted iframe permissions
async function safeCopyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    // Ignore and fallback below
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (e) {
    console.warn('Fallback clipboard copy failed:', e);
    return false;
  }
}

export const SystemJournalModal: React.FC<SystemJournalModalProps> = ({
  isOpen,
  onClose,
  auditTrail,
}) => {
  const [activeTab, setActiveTab] = useState<'living_plan' | 'changelog' | 'adrs' | 'audit_trail'>('living_plan');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const livingPlanMd = `# LIVING_PLAN.md — Dynamisch Master Bedrijfsplan
Laatste Automatische Update: ${new Date().toLocaleDateString('nl-NL')} om ${new Date().toLocaleTimeString('nl-NL')} door Chronicler Agent 4.1

## 1. EXECUTIVE SUMMARY & REALTIME KERNCIJFERS
* Bedrijfsmodel: 100% Autonome Micro-SaaS voor MKB (LocalRepute AI)
* Doelgroep: Lokale dienstverleners (autobedrijven, bakkers, klinieken, installateurs)
* Geschat MRR Target: € 24.500,- (500 MKB klanten à € 49,-/mnd)
* Huidige Brutomarge: 88.4% (na Gemini API token consumptie)
* Systeemstatus: Resilient & Self-Healing Actief

## 2. ACTIVE ENGINEERING ROADMAP (SPRINT DOELEN)
* Milestone 1: Omgeving, Supabase & Git Fundering [VOLTOOID]
* Milestone 2: Stripe Billing Webhooks & Paywall [VOLTOOID]
* Milestone 3: Auto-Pilot Review Generator Engine [VOLTOOID]
* Milestone 4: WhatsApp Voice-to-Review Invite Pipeline [GEÏNJECTEERD DOOR R&D SWARM]

## 3. GEVALIDEERDE HYPOTHESES & A/B LEERPUNTEN
1. "1-klik Google Review links per SMS/WhatsApp verhogen respons met 62% t.o.v. email."
2. "Subtiele lokale SEO termen in review antwoorden laten MKB'ers binnen 30 dagen in de Google Maps Top-3 ranken."
3. "1-2 sterren reviews direct escaleren naar eigenaar voorkomt 95% van publieke escalaties."

## 4. DYNAMISCHE RISICO-MATRIX & FAIL-SAFES
* Token Budget Cap: Max € 150/mnd met automatische noodstop.
* Loop Limiet: Max 5 iteraties per agent taak.
* Security Gate: PR merge naar main geblokkeerd zonder goedkeuring Critic Agent.`;

  const strategyChangelogMd = `# STRATEGY_CHANGELOG.md — Evolutie van het Bedrijf
Alle autonome besluiten en pivots gedocumenteerd door de R&D Swarm.

### [2025-05-10] — Injectie WhatsApp Voicenote Dicteer-Module
* Trigger: R&D Trend Scouting observeerde dat monteurs onderweg zelden typen.
* ROI Score: 9.0 / 10 (LTV +35%, CAC impact hoog).
* Actie: Milestone 4 uitgebreid met Whisper transcriptie webhook.

### [2025-05-08] — Afwijzing Salesforce Enterprise Sync
* Trigger: Twee grotere leads vroegen enterprise CRM integratie.
* ROI Score: 4.2 / 10 (Afgewezen wegens verlies Zero-Touch model en te hoge onderhoudskosten).

### [2025-05-06] — Activatie Self-Healing Vector Runbook
* Trigger: OAuth token expiry legde review sync stil.
* Actie: Code Surgeon schreef sandbox test en verankerde mutex lock in vector memory.`;

  const getActiveContent = () => {
    if (activeTab === 'living_plan') return livingPlanMd;
    if (activeTab === 'changelog') return strategyChangelogMd;
    return '';
  };

  // Safe copy handler with fallback
  const handleCopy = async () => {
    await safeCopyToClipboard(getActiveContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-white">System Journal &amp; Immutable Audit (Cluster 4)</h3>
              <p className="text-xs text-slate-400">Gedocumenteerd door The Chronicler • /system_journal/</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-800 bg-slate-950/60">
          <button
            onClick={() => setActiveTab('living_plan')}
            className={`px-3.5 py-1.5 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'living_plan'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>LIVING_PLAN.md</span>
          </button>

          <button
            onClick={() => setActiveTab('changelog')}
            className={`px-3.5 py-1.5 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'changelog'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>STRATEGY_CHANGELOG.md</span>
          </button>

          <button
            onClick={() => setActiveTab('adrs')}
            className={`px-3.5 py-1.5 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'adrs'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ADR Decision Logs ({INITIAL_ADRS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit_trail')}
            className={`px-3.5 py-1.5 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'audit_trail'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>AUDIT_TRAIL.jsonl ({auditTrail.length})</span>
          </button>
        </div>

        {/* Content Viewer */}
        <div className="p-5 flex-1 overflow-y-auto">
          {activeTab === 'living_plan' || activeTab === 'changelog' ? (
            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
              {getActiveContent()}
            </pre>
          ) : activeTab === 'adrs' ? (
            <div className="space-y-4">
              {INITIAL_ADRS.map((adr) => (
                <div key={adr.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-indigo-400 font-bold">{adr.id}: {adr.title}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                      {adr.status} • {adr.date}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400 text-[11px]">Context: </span>
                    <span className="text-slate-300">{adr.context}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400 text-[11px]">Besluit: </span>
                    <span className="text-slate-200 font-medium">{adr.decision}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 italic bg-slate-900/80 p-2 rounded border border-slate-800">
                    Consequenties: {adr.consequences}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 font-mono text-xs">
              {auditTrail.map((entry) => (
                <div key={entry.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[10px]">{entry.timestamp}</span>
                      <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[10px]">
                        [{entry.actionType}]
                      </span>
                      <span className="text-slate-200 font-sans">{entry.summary}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    commit {entry.gitCommitHash}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950">
          <span className="text-[11px] text-slate-400">
            Immutable Audit Trail • Alle wijzigingen worden vastgelegd in Git repository
          </span>
          {(activeTab === 'living_plan' || activeTab === 'changelog') && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Gekopieerd!' : 'Kopieer Markdown'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
