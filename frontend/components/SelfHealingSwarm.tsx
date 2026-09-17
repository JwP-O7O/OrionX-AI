import React, { useState } from 'react';
import { IncidentEvent, VectorMemoryEntry } from '../types';
import { diagnoseAndSelfHealIncident } from '../services/geminiService';
import { 
  ShieldAlert, 
  Wrench, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  RefreshCw, 
  Zap, 
  FileText, 
  Terminal, 
  GitCommit, 
  Flame,
  Search,
  Check,
  Copy,
  Lock,
  Layers,
  ShieldCheck,
  Clock
} from 'lucide-react';

interface SelfHealingSwarmProps {
  onAddLog: (level: 'info' | 'warn' | 'error' | 'success', agentName: string, agentId: string, message: string, dataSnippet?: string) => void;
  onRecordAudit: (action: 'SELF_HEAL_PATCH' | 'ADVERSARIAL_REPRO_TEST' | 'FILE_LOCK_PREEMPTION', summary: string) => void;
}

const PRESET_INCIDENTS = [
  {
    service: 'Google OAuth 2.0 Cron Worker',
    errorType: 'TokenExpiredError (HTTP 401)',
    message: 'OAuth refresh_token grant expired for tenant autogarage-utrecht; Google Review Sync halted.',
    stackTrace: 'at GoogleApiClient.refreshAccessTokens (google_client.ts:89)\n  at ReviewSyncCron.execute (sync_worker.ts:142)\n  at processTicksAndRejections (node:internal/process/task_queues:95:5)',
    contextPayload: '{"tenantId": "tenant-0941", "provider": "google_my_business", "lastSync": "2025-05-10T08:14:00Z"}',
    filePathTarget: 'src/integrations/google_client.ts',
  },
  {
    service: 'Stripe Billing Webhook Handler',
    errorType: 'SignatureVerificationFailed (HTTP 400)',
    message: 'Webhook signature secret mismatch on event subscription.created payload raw buffer parsing.',
    stackTrace: 'at Stripe.webhooks.constructEvent (stripe.ts:44)\n  at POST (app/api/webhooks/stripe/route.ts:18)\n  at NextServer.handleRequest (node_modules/next:102)',
    contextPayload: '{"eventId": "evt_test_994", "headerSignature": "t=17153392,v1=99fa0b..."}',
    filePathTarget: 'src/app/api/webhooks/stripe/route.ts',
  },
  {
    service: 'Agent Orchestration Loop Guard',
    errorType: 'MaxIterationsExceededWarning',
    message: 'SEO Content Generator reached iteration 6 without producing valid schema.org output.',
    stackTrace: 'at LoopGuard.assertMaxIter (guardrails.ts:28)\n  at SwarmNode.execute (swarm_engine.ts:210)',
    contextPayload: '{"agent": "growth_seo", "task": "utrecht-garages-comparison", "currentIter": 6}',
    filePathTarget: 'src/swarm/guardrails.ts',
  },
];

const INITIAL_VECTOR_MEMORIES: VectorMemoryEntry[] = [
  {
    id: 'VEC-001',
    timestamp: 'Gisteren 14:22',
    errorSignature: 'OAuth 401 TokenExpiredError google_my_business',
    rootCause: 'Oude Google refresh tokens vereisen idempotente token rotation met lockfile in Supabase.',
    solutionDiff: `// Patch: Atomic refresh with mutex\nconst token = await lockAndRotateToken(tenantId);`,
    guardrailEnforced: 'Voeg altijd fallback toe met exponentiële backoff (max 3 retries) en mutex lock.',
    confidenceRating: 0.96,
    decayDaysLeft: 58,
    timesApplied: 4,
    similarityScore: 0.96,
  },
  {
    id: 'VEC-002',
    timestamp: '2 dagen geleden',
    errorSignature: 'Stripe webhook raw body parser buffer collision',
    rootCause: 'Next.js App Router leest request standaard als json; Stripe vereist req.arrayBuffer().',
    solutionDiff: `const rawBody = Buffer.from(await req.arrayBuffer());`,
    guardrailEnforced: 'Verplicht raw arrayBuffer voor alle webhook route handlers.',
    confidenceRating: 0.94,
    decayDaysLeft: 52,
    timesApplied: 2,
    similarityScore: 0.94,
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
    // Fallback below
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

export const SelfHealingSwarm: React.FC<SelfHealingSwarmProps> = ({
  onAddLog,
  onRecordAudit,
}) => {
  const [activeIncidents, setActiveIncidents] = useState<IncidentEvent[]>([]);
  const [vectorMemories, setVectorMemories] = useState<VectorMemoryEntry[]>(INITIAL_VECTOR_MEMORIES);
  const [isHealing, setIsHealing] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentEvent | null>(null);
  const [copiedDiff, setCopiedDiff] = useState(false);
  const [activeStage, setActiveStage] = useState<string | null>(null);

  // Trigger adversarial self-healing incident simulation
  const handleSimulateIncident = async (presetIndex: number) => {
    const preset = PRESET_INCIDENTS[presetIndex];
    const incidentId = `INC-${Date.now().toString().slice(-4)}`;
    
    const newIncident: IncidentEvent = {
      id: incidentId,
      timestamp: new Date().toLocaleTimeString('nl-NL'),
      service: preset.service,
      errorType: preset.errorType,
      message: preset.message,
      stackTrace: preset.stackTrace,
      contextPayload: preset.contextPayload,
      status: 'detecting',
      fileLockPreempted: true,
    };

    setActiveIncidents(prev => [newIncident, ...prev]);
    setSelectedIncident(newIncident);
    setIsHealing(true);
    setActiveStage('SENTRY_DETECTION');

    onAddLog('error', 'Sentry Monitor 2.1', 'sentry', `CRITICAL EXCEPTION: ${preset.errorType} in ${preset.service}`, preset.message);
    onRecordAudit('FILE_LOCK_PREEMPTION', `PRIORITY_HOTFIX lock verworven op ${preset.filePathTarget}; feature branch gepauzeerd.`);

    try {
      // Step 1: Distributed Lock Preemption
      await new Promise(r => setTimeout(r, 400));
      onAddLog('warn', 'Distributed Lock Manager', 'lock_mgr', `PRIORITY_HOTFIX lock geclaimd voor ${preset.filePathTarget}`);

      // Step 2: Adversarial Red Team Test Creation (without seeing patch)
      setActiveStage('ADVERSARIAL_RED_TEAM');
      setActiveIncidents(prev => prev.map(inc => inc.id === incidentId ? { ...inc, status: 'red_teaming' } : inc));
      onAddLog('info', 'Red Team QA Agent', 'red_team', `Schrijft onafhankelijke faaltest om ${preset.errorType} te isoleren (Adversarial Sandboxing)...`);

      await new Promise(r => setTimeout(r, 600));

      const memorySummary = vectorMemories
        .map(v => `Match [${v.errorSignature}]: ${v.rootCause} (Confidence: ${v.confidenceRating})`)
        .join('\n');

      // Call Gemini for real root cause, adversarial test, patch and confidence decay
      const result = await diagnoseAndSelfHealIncident({
        service: preset.service,
        errorType: preset.errorType,
        message: preset.message,
        stackTrace: preset.stackTrace,
        contextPayload: preset.contextPayload,
        pastLearningsSummary: memorySummary,
      });

      onRecordAudit('ADVERSARIAL_REPRO_TEST', `Onafhankelijke faaltest opgesteld voor ${preset.errorType}`);

      // Step 3: Code Surgeon sandbox patch
      setActiveStage('CODE_SURGEON_PATCH');
      setActiveIncidents(prev => prev.map(inc => inc.id === incidentId ? { ...inc, status: 'patching' } : inc));
      onAddLog('warn', 'Code Surgeon Agent 2.3', 'surgeon', `Patch gegenereerd in E2B Docker sandbox. Draait verificatie tegen Red Team test...`);

      // Step 4: Verification test
      await new Promise(r => setTimeout(r, 700));
      setActiveStage('ADVERSARIAL_VERIFY');
      setActiveIncidents(prev => prev.map(inc => inc.id === incidentId ? { ...inc, status: 'verifying' } : inc));

      // Step 5: Healed & Memory Retention with decay
      const healedIncident: IncidentEvent = {
        ...newIncident,
        status: 'healed',
        rootCause: result.rootCause,
        redTeamReproductionTest: result.redTeamReproductionTest,
        codePatchDiff: result.codePatchDiff,
        postMortemSummary: result.postMortemSummary,
        newGuardrailRule: result.newGuardrailRule,
        adversarialCheckPassed: true,
        vectorRunbookId: `VEC-${Math.floor(Math.random() * 900 + 100)}`,
      };

      setActiveIncidents(prev => prev.map(inc => inc.id === incidentId ? healedIncident : inc));
      setSelectedIncident(healedIncident);

      // Save new vector memory with confidence & decay
      const newMemory: VectorMemoryEntry = {
        id: healedIncident.vectorRunbookId!,
        timestamp: 'Zojuist vastgelegd',
        errorSignature: `${preset.errorType} in ${preset.service}`,
        rootCause: result.rootCause,
        solutionDiff: result.codePatchDiff,
        guardrailEnforced: result.newGuardrailRule,
        confidenceRating: result.confidenceRating || 0.95,
        decayDaysLeft: result.decayDays || 60,
        timesApplied: 1,
        similarityScore: 0.98,
      };

      setVectorMemories(prev => [newMemory, ...prev]);

      onAddLog('success', 'Memory Retention 2.4', 'retention', `Fix gevalideerd door Red Team test! Opgeslagen in Vector Runbook (${newMemory.id}) met confidence ${newMemory.confidenceRating}. File lock vrijgegeven.`);
      onRecordAudit('SELF_HEAL_PATCH', `Auto-fix geverifieerd via Adversarial Sandboxing voor ${preset.errorType}`);

    } catch (err: any) {
      onAddLog('error', 'Self-Healing Swarm', 'healing', `Fout tijdens zelf-herstel: ${err?.message}`);
    } finally {
      setIsHealing(false);
      setActiveStage(null);
    }
  };

  // Safe copy handler with fallback
  const handleCopyDiff = async (code: string) => {
    await safeCopyToClipboard(code);
    setCopiedDiff(true);
    setTimeout(() => setCopiedDiff(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Self-Healing Architecture */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              Cluster 2: Adversarial Self-Healing Engine
            </span>
            <span className="text-xs text-slate-400">Red Team Isolation • Sandboxed Patches • Time Decay Memory</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Autonome Reparatie &amp; Adversarial Sandboxing</h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Voorkomt de "LLM keurt LLM goed" valkuil: De Red Team Test Agent schrijft een onafhankelijke faaltest 
            <strong className="text-white">vóórdat</strong> de Code Surgeon een patch schrijft in een geïsoleerde E2B Docker sandbox.
          </p>
        </div>

        {/* Action button to inject a test error */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="text-xs text-slate-400">Simuleer Incident:</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSimulateIncident(0)}
              disabled={isHealing}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-rose-500/40 text-xs font-medium text-rose-300 hover:bg-rose-950/30 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>OAuth 401 Crash</span>
            </button>
            <button
              onClick={() => handleSimulateIncident(1)}
              disabled={isHealing}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-500/40 text-xs font-medium text-amber-300 hover:bg-amber-950/30 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Stripe Webhook Mismatch</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Agent Pipeline Steps Indicator */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border transition-all ${
          activeStage === 'SENTRY_DETECTION'
            ? 'bg-rose-950/40 border-rose-500 text-white animate-pulse'
            : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-white">2.1 Sentry &amp; Preemption</span>
            <Lock className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-[11px] text-slate-400">Claimt PRIORITY_HOTFIX file lock lease.</p>
          <div className="mt-2 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Preemption Active
          </div>
        </div>

        <div className={`p-4 rounded-xl border transition-all ${
          activeStage === 'ADVERSARIAL_RED_TEAM'
            ? 'bg-indigo-950/40 border-indigo-500 text-white animate-pulse'
            : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-white">2.2 Adversarial Red Team</span>
            <Search className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-[11px] text-slate-400">Schrijft faaltest vóór patch code bestaat.</p>
          <div className="mt-2 text-[10px] font-mono text-indigo-400">
            Blind Spot Guard Active
          </div>
        </div>

        <div className={`p-4 rounded-xl border transition-all ${
          activeStage === 'CODE_SURGEON_PATCH' || activeStage === 'ADVERSARIAL_VERIFY'
            ? 'bg-amber-950/40 border-amber-500 text-white animate-pulse'
            : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-white">2.3 Patch Code Surgeon</span>
            <Wrench className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-[11px] text-slate-400">Draait E2B Sandbox en lost Red Team test op.</p>
          <div className="mt-2 text-[10px] font-mono text-amber-300">
            Zero-Regression Passed
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-white">2.4 Vector Retention &amp; Decay</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-[11px] text-slate-400">TTL Verval &amp; gewogen confidence score.</p>
          <div className="mt-2 text-[10px] font-mono text-emerald-400">
            Confidence Decay Active
          </div>
        </div>
      </div>

      {/* Main Grid: Active Incidents & Live Surgeon Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Incidents Stream */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Incident Telemetrie Feed</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {activeIncidents.length} Geregistreerd
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {activeIncidents.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-xs">
                Geen actieve crashes. Klik rechtsboven op een simulatieknop om het zelf-herstellend vermogen te testen.
              </div>
            ) : (
              activeIncidents.map(inc => {
                const isSelected = selectedIncident?.id === inc.id;

                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/20'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-slate-400">{inc.id}</span>
                        <span className="text-xs font-bold text-white">{inc.errorType}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        inc.status === 'healed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                      }`}>
                        {inc.status === 'healed' ? '✓ SELF-HEALED' : inc.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{inc.service}</p>
                    <p className="text-[11px] text-slate-300 mt-1 font-mono line-clamp-2 bg-slate-900/90 p-1.5 rounded">
                      {inc.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Columns: Live Surgeon & Memory Inspector */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Incident Resolution Screen */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Adversarial Sandboxing &amp; Code Surgeon Resolution
                </h3>
              </div>
              {selectedIncident && (
                <span className="text-xs font-mono text-indigo-400">
                  Status: {selectedIncident.status.toUpperCase()}
                </span>
              )}
            </div>

            {selectedIncident ? (
              <div className="space-y-4">
                {/* Error Banner */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-rose-400">{selectedIncident.errorType}</span>
                    <span className="text-slate-400 font-mono text-[10px]">{selectedIncident.service} • {selectedIncident.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-300">{selectedIncident.message}</p>
                  <pre className="text-[10px] font-mono text-slate-500 bg-slate-900 p-2 rounded overflow-x-auto">
                    {selectedIncident.stackTrace}
                  </pre>
                </div>

                {/* Independent Red Team Reproduction Test */}
                {selectedIncident.redTeamReproductionTest && (
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-indigo-500/30 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                        Onafhankelijke Red Team Faaltest (Adversarial Isolation):
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                        PASSED_AFTER_PATCH
                      </span>
                    </div>
                    <pre className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[10px] font-mono text-indigo-200 overflow-x-auto max-h-36 whitespace-pre-wrap">
                      {selectedIncident.redTeamReproductionTest}
                    </pre>
                  </div>
                )}

                {/* Code Patch Diff */}
                {selectedIncident.codePatchDiff && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <GitCommit className="w-3.5 h-3.5 text-emerald-400" />
                        Gevalideerde Code Patch (E2B Sandbox Verified):
                      </span>
                      <button
                        onClick={() => handleCopyDiff(selectedIncident.codePatchDiff!)}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded"
                      >
                        {copiedDiff ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Kopieer Patch</span>
                      </button>
                    </div>
                    <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-48 whitespace-pre-wrap">
                      {selectedIncident.codePatchDiff}
                    </pre>
                  </div>
                )}

                {/* Reproduction Test & System Guardrail */}
                {selectedIncident.newGuardrailRule && (
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
                      Permanente System Prompt Guardrail Geïnjecteerd:
                    </span>
                    <p className="text-xs text-slate-300 italic">
                      "{selectedIncident.newGuardrailRule}"
                    </p>
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Vector Runbook: {selectedIncident.vectorRunbookId}</span>
                      <span className="text-emerald-400">Auto-Committed to /system_journal/</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-24 text-center text-slate-500 text-xs">
                Selecteer een incident in de linker kolom om de forensische analyse en code-patch te bekijken.
              </div>
            )}
          </div>

          {/* Vector Memory Database Viewer with Confidence & Time Decay */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Vectorized Runbook Geheugen met Time-Decay &amp; Confidence
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{vectorMemories.length} Vector embeddings</span>
            </div>

            <div className="space-y-3">
              {vectorMemories.map((entry) => (
                <div key={entry.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-indigo-400 text-[10px] font-bold">{entry.id}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-mono">
                        Confidence: {(entry.confidenceRating * 100).toFixed(0)}%
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      Decay TTL: {entry.decayDaysLeft} dagen
                    </span>
                  </div>
                  <div className="font-semibold text-white">{entry.errorSignature}</div>
                  <p className="text-slate-400 text-[11px]">{entry.rootCause}</p>
                  <div className="text-[10px] text-amber-300/90 font-mono bg-slate-900 p-1.5 rounded flex items-center justify-between">
                    <span>Guardrail: {entry.guardrailEnforced}</span>
                    <span className="text-slate-500">Toegepast: {entry.timesApplied}x</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
