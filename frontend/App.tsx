import React, { useState, useEffect, useRef } from 'react';
import { 
  SwarmAgent, 
  AgentCluster, 
  AgentStatus, 
  SwarmLog, 
  Milestone, 
  CircuitBreakerState, 
  AuditTrailEntry, 
  DaemonState, 
  DaemonQueueTask,
  PromptTuningReport,
  InvariantCoreConstraints, 
  TenantProfile, 
  LocalReview,
  ColdAuditReport
} from './types';
import { Header } from './components/Header';
import { ClientPortal } from './components/ClientPortal';
import { AdminCockpit } from './components/AdminCockpit';
import { ColdAuditBot } from './components/ColdAuditBot';
import { SwarmCanvas } from './components/SwarmCanvas';
import { LocalReputeSimulator } from './components/LocalReputeSimulator';
import { AgentPlayground } from './components/AgentPlayground';
import { MilestonesTracker } from './components/MilestonesTracker';
import { SpecExportModal } from './components/SpecExportModal';
import { CircuitBreakerModal } from './components/CircuitBreakerModal';
import { SelfHealingSwarm } from './components/SelfHealingSwarm';
import { RnDBrainstormSwarm } from './components/RnDBrainstormSwarm';
import { SystemJournalModal } from './components/SystemJournalModal';
import { DaemonSentinelModal } from './components/DaemonSentinelModal';
import { 
  generateSmartRoutedReviewReply, 
  evaluateAndTuneTenantPrompt 
} from './services/geminiService';

const STORAGE_KEYS = {
  TENANTS: 'levelplay_tenants_v1',
  REVIEWS: 'levelplay_reviews_v1',
  LOGS: 'levelplay_logs_v1',
  MILESTONES: 'levelplay_milestones_v1',
  CIRCUIT_BREAKER: 'levelplay_cb_v1',
};

const DEFAULT_TENANTS: TenantProfile[] = [
  {
    id: 'tenant-01',
    businessName: 'Autobedrijf & Bandenservice Utrecht',
    ownerName: 'Marco van Dijk',
    email: 'marco@autobedrijf-utrecht.nl',
    whatsAppEmergencyNumber: '06-48291034',
    niche: 'Autogarage & Bandenwissel',
    city: 'Utrecht',
    toneOfVoice: 'informeel',
    isAutopilotActive: true,
    isGoogleConnected: true,
    isTrustpilotConnected: true,
    plan: 'PRO',
    monthlyRevenueEur: 99.00,
    monthlyTokenCostEur: 3.40,
    totalReviewsManaged: 42,
    hoursSaved: 5.5,
    averageRating: 4.8,
    lastLoginDate: '2 uur geleden',
    churnRisk: 'LOW',
    reviewLinkSlug: 'autobedrijf-utrecht-apk',
    createdAt: new Date().toISOString(),
    promptVersion: 2,
    tokenSavingsPercent: 28,
  },
  {
    id: 'tenant-02',
    businessName: 'Bakkerij & Patisserie De Jong',
    ownerName: 'Jan de Jong',
    email: 'info@bakkerijdejong.nl',
    whatsAppEmergencyNumber: '06-12948172',
    niche: 'Ambachtelijke Bakkerij',
    city: 'Amsterdam',
    toneOfVoice: 'enthousiast',
    isAutopilotActive: true,
    isGoogleConnected: true,
    isTrustpilotConnected: false,
    plan: 'STARTER',
    monthlyRevenueEur: 49.00,
    monthlyTokenCostEur: 1.15,
    totalReviewsManaged: 18,
    hoursSaved: 2.2,
    averageRating: 4.9,
    lastLoginDate: '1 dag geleden',
    churnRisk: 'LOW',
    reviewLinkSlug: 'bakkerij-dejong-amsterdam',
    createdAt: new Date().toISOString(),
    promptVersion: 1,
    tokenSavingsPercent: 15,
  },
  {
    id: 'tenant-03',
    businessName: 'Tandheelkundig Centrum Eindhoven',
    ownerName: 'Dr. Sophie Vermeulen',
    email: 'praktijk@tandartseindhoven.nl',
    whatsAppEmergencyNumber: '06-98124567',
    niche: 'Tandartspraktijk & Implantologie',
    city: 'Eindhoven',
    toneOfVoice: 'formeel',
    isAutopilotActive: true,
    isGoogleConnected: true,
    isTrustpilotConnected: true,
    plan: 'MULTI_LOCATION',
    monthlyRevenueEur: 249.00,
    monthlyTokenCostEur: 8.60,
    totalReviewsManaged: 94,
    hoursSaved: 12.0,
    averageRating: 4.7,
    lastLoginDate: '18 dagen geleden',
    churnRisk: 'HIGH',
    reviewLinkSlug: 'tandheelkunde-eindhoven',
    createdAt: new Date().toISOString(),
    promptVersion: 3,
    tokenSavingsPercent: 32,
  },
];

const DEFAULT_REVIEWS: LocalReview[] = [
  {
    id: 'rev-1',
    tenantId: 'tenant-01',
    author: 'Jan van Dijk',
    businessName: 'Autobedrijf & Bandenservice Utrecht',
    platform: 'Google',
    rating: 5,
    comment: 'Fantastische APK keuring gehad! Binnen 45 minuten klaar en eerlijk advies over mijn remblokken. Topservice.',
    date: '10 minuten geleden',
    sentiment: 'positive',
    status: 'auto_replied',
    autoResponse: 'Hoi Jan, super bedankt voor je 5-sterren review voor Autobedrijf & Bandenservice Utrecht! Fijn dat je snel en veilig weer de weg op kon. Tot de volgende keer! 🙌',
    routerTierUsed: 'TIER_2_FAST_LOCAL (€0.001)',
    repliedAt: '3 min geleden',
  },
  {
    id: 'rev-2',
    tenantId: 'tenant-01',
    author: 'Sophie Bakker',
    businessName: 'Autobedrijf & Bandenservice Utrecht',
    platform: 'Google',
    rating: 2,
    comment: 'Moest erg lang wachten ondanks afspraak voor bandenwissel. Koffiezetautomaat was ook stuk.',
    date: '35 minuten geleden',
    sentiment: 'critical',
    status: 'escalated_to_owner',
    autoResponse: 'Beste Sophie, excuses voor de langere wachttijd voor uw bandenwissel. Dit past niet bij onze kwaliteitsstandaard. Zou u direct contact willen opnemen met onze vestigingsmanager via 06-48291034? We lossen dit graag persoonlijk voor u op.',
    routerTierUsed: 'TIER_3_DE_ESCALATION (€0.005)',
    repliedAt: 'Concept opgesteld • WhatsApp alert naar eigenaar',
  },
];

const INITIAL_AGENTS: SwarmAgent[] = [
  {
    id: 'market_intel',
    name: 'Agent 1.1: Market Intel & Competitor Researcher',
    role: 'Identificeert gaten in MKB-markten & review gaps ten opzichte van ketens',
    cluster: AgentCluster.STRATEGY,
    tools: ['Web Search API', 'Reddit/Trustpilot Scraper', 'Google Trends'],
    directive: 'Zoek alleen naar repetitieve taken die kleine bedrijven handmatig doen en waar enterprise software te duur of te complex voor is.',
    outputFormat: 'market_gap_report.json',
    status: AgentStatus.SUCCESS,
    executionCount: 14,
    lastOutput: JSON.stringify({
      target_niche: "Lokale autobedrijven & installateurs MKB",
      primary_gap: "Verliezen 40% leads aan franchiseketens door trage Google Review reacties.",
      competitor_pricing: "€199/mnd (Enterprise te complex)",
      target_saas_pricing: "€49 - €79/mnd",
      missed_keywords: ["APK keuring vandaag", "snelle bandenwissel Utrecht"]
    }, null, 2),
    lastExecutionTime: '10:45:12',
  },
  {
    id: 'spec_agent',
    name: 'Agent 1.2: Technical Product Manager (Spec Agent)',
    role: 'Vertaalt marktdata naar onbreekbare PRD en datamodellen',
    cluster: AgentCluster.STRATEGY,
    tools: ['Markdown Writer', 'Schema Validator', 'Zod Generator'],
    directive: 'Schrijf modulaire use cases. Geen feature mag live gaan zonder gedefinieerde acceptatiecriteria en API payload mock-ups.',
    outputFormat: 'product_spec.json & schema.sql',
    status: AgentStatus.SUCCESS,
    executionCount: 8,
    lastOutput: JSON.stringify({
      module: "Auto-Pilot Review Pipeline",
      tables: ["users", "tenants", "integrations", "reviews", "activity_logs"],
      acceptance_criteria: [
        "Reactie binnen max 300 seconden na webhook",
        "Lokale SEO term geïnjecteerd",
        "Escalatie trigger bij rating < 3"
      ]
    }, null, 2),
    lastExecutionTime: '11:02:40',
  },
  {
    id: 'coder_backend',
    name: 'Agent 2.1: Software Architect & Backend Coder',
    role: 'Genereert deterministische backend, Supabase schema & pipelines',
    cluster: AgentCluster.BUILD,
    tools: ['Next.js App Router', 'Supabase Postgres', 'Stripe SDK', 'Docker Sandbox'],
    directive: 'Schrijf deterministische code. Valideer alle inputs via Zod/Pydantic. Handhaaf strikte rate-limits op alle externe LLM-calls.',
    outputFormat: 'api/webhooks/route.ts & schema.sql',
    status: AgentStatus.SUCCESS,
    executionCount: 22,
    lastOutput: `// Next.js App Router POST /api/webhooks/stripe\nexport async function POST(req: Request) {\n  return Response.json({ received: true });\n}`,
    lastExecutionTime: '11:15:02',
  },
  {
    id: 'frontend_ux',
    name: 'Agent 2.2: Frontend & UX Agent',
    role: 'Conversiegerichte, oma-vriendelijke interface voor lokale ondernemers',
    cluster: AgentCluster.BUILD,
    tools: ['Tailwind CSS', 'Shadcn UI', 'React 19', 'Playwright'],
    directive: 'De interface moet "oma-vriendelijk" zijn. Maximaal 3 velden per actie. Voorkom jargon zoals "tokens", "prompts" of "embeddings".',
    outputFormat: 'components/LocalDashboard.tsx',
    status: AgentStatus.SUCCESS,
    executionCount: 19,
    lastOutput: `// Ultra-simple UI with 3 primary stats: Reviews, Geautomatiseerd, Tijd Bespaard`,
    lastExecutionTime: '11:20:18',
  },
  {
    id: 'critic',
    name: 'Agent 2.3: Critic & Security QA Agent (Poortwachter)',
    role: 'Beoordeelt alle pull requests, audits op secrets en infinite loops',
    cluster: AgentCluster.BUILD,
    tools: ['Static Code Analyzer', 'Bandit/Snyk Scanner', 'Test Runner'],
    directive: 'Keur PRs ALTIJD af indien er hardcoded secrets zijn, test-dekking onder 80% ligt, of kans is op oneindige loops.',
    outputFormat: 'security_audit_report.json',
    status: AgentStatus.SUCCESS,
    executionCount: 16,
    lastOutput: JSON.stringify({ pr_number: 42, decision: "APPROVED", test_coverage: "88.4%" }, null, 2),
    lastExecutionTime: '11:22:50',
  },
  {
    id: 'growth_seo',
    name: 'Agent 3.1: Growth & SEO Content Agent',
    role: 'Continu organische leads aantrekken via hyperlokale intentie',
    cluster: AgentCluster.OPS,
    tools: ['CMS API', 'Ayrshare API', 'Schema.org JSON-LD Generator'],
    directive: 'Focus op hyperlokale zoekintentie en B2B-koopintentie.',
    outputFormat: 'landing_pages/utrecht-reviews.md',
    status: AgentStatus.SUCCESS,
    executionCount: 11,
    lastOutput: `# Waarom Lokale Garages in Utrecht Winnen van Keten-Kwikfit`,
    lastExecutionTime: '11:30:10',
  },
  {
    id: 'support_agent',
    name: 'Agent 3.2: Autonomous Support & Retention Agent',
    role: '24/7 ticket handling, self-healing support en churn preventie',
    cluster: AgentCluster.OPS,
    tools: ['Stripe API (read/refund)', 'Ticket Resolver', 'Database Lookup'],
    directive: 'Mag accounts resetten, logs uitleggen en storingen melden. Indien klant churn dreigt: mag 1 maand 50% korting aanbieden via webhook.',
    outputFormat: 'support_log_resolved.json',
    status: AgentStatus.SUCCESS,
    executionCount: 9,
    lastOutput: JSON.stringify({ ticket_id: "TICK-8841", churn_risk: "LOW" }, null, 2),
    lastExecutionTime: '11:34:00',
  },
];

const INITIAL_LOGS: SwarmLog[] = [
  {
    id: 'log-1',
    timestamp: '11:34:00',
    agentId: 'support_agent',
    agentName: 'Autonomous Support Agent',
    level: 'success',
    message: 'OAuth Google Token vernieuwd voor tenant autobedrijf-utrecht.',
  },
  {
    id: 'log-2',
    timestamp: '11:30:10',
    agentId: 'growth_seo',
    agentName: 'Growth & SEO Agent',
    level: 'info',
    message: 'Hyperlokale landingspagina gedeployed: /nl/utrecht/google-reviews-mkb.',
  },
  {
    id: 'log-3',
    timestamp: '11:22:50',
    agentId: 'critic',
    agentName: 'Critic & Security Agent',
    level: 'success',
    message: 'PR #42 Goedgekeurd. Test coverage 88.4%. Geen secrets gevonden.',
  },
];

const INITIAL_MILESTONES: Milestone[] = [
  {
    id: 1,
    title: 'Milestone 1: Omgeving & Fundering',
    hours: 'Uur 0 - 24',
    description: 'Next.js App Router, Supabase Postgres schema en CI/CD pipeline.',
    tasks: [
      { id: '1.1', title: 'Init Git repo met Next.js, Tailwind, Supabase schema', agent: 'Architect', completed: true, status: 'completed' },
      { id: '1.2', title: 'Definieer DB tabellen: users, tenants, integrations, reviews, activity_logs', agent: 'Spec Agent', completed: true, status: 'completed' },
      { id: '1.3', title: 'Stel GitHub Actions CI/CD op met geautomatiseerde linting en branch protection', agent: 'Security QA', completed: true, status: 'completed' },
    ],
  },
  {
    id: 2,
    title: 'Milestone 2: Betaal- & Authenticatie-infrastructuur',
    hours: 'Uur 24 - 48',
    description: 'Stripe Billing webhooks, Supabase Auth en test coverage.',
    tasks: [
      { id: '2.1', title: 'Koppel Stripe Billing (Webhook handlers voor subscription.created, cancelled)', agent: 'Backend Coder', completed: true, status: 'completed' },
      { id: '2.2', title: 'Bouw auth-pagina\'s (Magic Link / Google Auth) en Subscription Paywall', agent: 'Frontend UX', completed: true, status: 'completed' },
      { id: '2.3', title: 'Simuleer succesvolle en mislukte betalingen via mock webhooks', agent: 'Critic QA', completed: true, status: 'completed' },
    ],
  },
  {
    id: 3,
    title: 'Milestone 3: Kernfunctionaliteit & AI Pipelines',
    hours: 'Uur 48 - 96',
    description: 'Google Review sync cron jobs, Response Generator Engine en MKB dashboard.',
    tasks: [
      { id: '3.1', title: 'Bouw Google My Business API / Review sync cron job via Supabase/Temporal', agent: 'Backend Coder', completed: true, status: 'completed' },
      { id: '3.2', title: 'Ontwikkel Response Generator Engine (Gemini 2.5 sentiment + tone-of-voice)', agent: 'AI Agent', completed: true, status: 'completed' },
      { id: '3.3', title: 'Bouw live dashboard: Nieuwe reviews, Geautomatiseerd beantwoord, Tijdsbesparing', agent: 'Frontend UX', completed: true, status: 'completed' },
    ],
  },
  {
    id: 4,
    title: 'Milestone 4: Autonome Marketing & Launch',
    hours: 'Uur 96 - 120',
    description: 'Hyperlokale landingspagina\'s, SEO gidsen en end-to-end systeemvalidatie.',
    tasks: [
      { id: '4.1', title: 'Genereer en deploy landingspagina "Google Reviews automatiseren voor MKB"', agent: 'Growth Agent', completed: true, status: 'completed' },
      { id: '4.2', title: 'Genereer 10 vergelijkings- en instructiepagina\'s gericht op lokale ondernemers', agent: 'SEO Agent', completed: true, status: 'completed' },
      { id: '4.3', title: 'Voer end-to-end systeemcheck uit: van bezoeker -> betaling -> review auto-reply', agent: 'Orchestrator', completed: false, status: 'pending' },
    ],
  },
];

const INITIAL_AUDIT_TRAIL: AuditTrailEntry[] = [
  {
    id: 'aud-1',
    timestamp: '11:34:00',
    agent: 'Support & Retention Agent',
    actionType: 'SELF_HEAL_PATCH',
    summary: 'OAuth 2.0 Google token hersteld via atomic mutex rotation.',
    gitCommitHash: '9a4f21b',
  },
  {
    id: 'aud-2',
    timestamp: '11:22:50',
    agent: 'Critic Agent 2.3',
    actionType: 'CODE_MERGE',
    summary: 'PR #42 gemerged naar staging na geslaagde Bandit & testsuite audit.',
    gitCommitHash: '8c130fe',
  },
  {
    id: 'aud-3',
    timestamp: '08:30:15',
    agent: 'Dynamic Spec Architect',
    actionType: 'PLAN_PIVOT',
    summary: 'LIVING_PLAN.md bijgewerkt: WhatsApp Voice Notes dicteer-module toegevoegd na R&D research.',
    gitCommitHash: '31ba789',
  },
];

const INITIAL_DAEMON_STATE: DaemonState = {
  daemonHealerStatus: 'LISTENING_ACTIVE',
  cronEvolutionStatus: 'SCHEDULED_00_00_UTC',
  activeFileLocks: [
    {
      filePath: 'src/integrations/google_client.ts',
      lockedByAgent: 'Code Surgeon Agent 2.3',
      cluster: AgentCluster.SELF_HEALING,
      leaseExpiresInSeconds: 480,
      isHotfixPreempted: true,
    },
  ],
  activeSandboxesCount: 1,
  queueLength: 0,
  tasksCompletedTotal: 148,
  autoTuningCyclesRun: 6,
};

const INVARIANT_CONSTRAINTS: InvariantCoreConstraints = {
  immutableDomain: 'Local SMB Reputation & Review Automation',
  targetGrossMarginMin: 0.80,
  allowedTechStack: ['Next.js', 'Supabase', 'Tailwind', 'Python', 'Fastify'],
  maxMonthlyBudgetEur: 150.00,
  humanInTheLoopRequiredForPivots: true,
};

export default function App() {
  const [appMode, setAppMode] = useState<'PORTAL' | 'ADMIN' | 'SWARM_ENGINE'>('PORTAL');
  const [activeTab, setActiveTab] = useState<'orchestrator' | 'selfhealing' | 'rnd' | 'localrepute' | 'playground' | 'roadmap'>('orchestrator');

  // Load persistent tenants from localStorage
  const [tenants, setTenants] = useState<TenantProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TENANTS);
      return saved ? JSON.parse(saved) : DEFAULT_TENANTS;
    } catch {
      return DEFAULT_TENANTS;
    }
  });

  const [activeTenant, setActiveTenant] = useState<TenantProfile>(() => tenants[0] || DEFAULT_TENANTS[0]);
  const [impersonatedTenant, setImpersonatedTenant] = useState<TenantProfile | null>(null);

  // Load persistent reviews from localStorage
  const [reviews, setReviews] = useState<LocalReview[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      return saved ? JSON.parse(saved) : DEFAULT_REVIEWS;
    } catch {
      return DEFAULT_REVIEWS;
    }
  });

  // Background Task Queue for live autonomous execution
  const [taskQueue, setTaskQueue] = useState<DaemonQueueTask[]>([]);
  const isWorkerBusyRef = useRef(false);

  // Swarm & Telemetry state
  const [agents, setAgents] = useState<SwarmAgent[]>(INITIAL_AGENTS);
  const [logs, setLogs] = useState<SwarmLog[]>(INITIAL_LOGS);
  const [milestones, setMilestones] = useState<Milestone[]>(INITIAL_MILESTONES);
  const [auditTrail, setAuditTrail] = useState<AuditTrailEntry[]>(INITIAL_AUDIT_TRAIL);
  const [daemonState, setDaemonState] = useState<DaemonState>(INITIAL_DAEMON_STATE);
  const [isAutopilotRunning, setIsAutopilotRunning] = useState<boolean>(true);

  // Modals
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [isCircuitBreakerModalOpen, setIsCircuitBreakerModalOpen] = useState(false);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [isDaemonSentinelModalOpen, setIsDaemonSentinelModalOpen] = useState(false);
  const [isColdAuditOpen, setIsColdAuditOpen] = useState(false);

  // Circuit breaker state
  const [circuitBreaker, setCircuitBreaker] = useState<CircuitBreakerState>({
    totalBudgetEur: 150.0,
    spentBudgetEur: 15.42,
    hourlyCalls: 28,
    maxHourlyCalls: 100,
    maxIterLimit: 5,
    isTriggered: false,
    freezeAllTenants: false,
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
    } catch (e) {
      console.warn('LocalStorage tenants save error', e);
    }
  }, [tenants]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    } catch (e) {
      console.warn('LocalStorage reviews save error', e);
    }
  }, [reviews]);

  // Keep activeTenant in sync with tenants array
  useEffect(() => {
    const found = tenants.find(t => t.id === activeTenant.id);
    if (found) {
      setActiveTenant(found);
    }
  }, [tenants, activeTenant.id]);

  // Heartbeat ticker for lease timers & queue counter
  useEffect(() => {
    const timer = setInterval(() => {
      setDaemonState(prev => ({
        ...prev,
        queueLength: taskQueue.length,
        activeFileLocks: prev.activeFileLocks
          .map(lock => ({
            ...lock,
            leaseExpiresInSeconds: Math.max(0, lock.leaseExpiresInSeconds - 1),
          }))
          .filter(lock => lock.leaseExpiresInSeconds > 0),
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [taskQueue.length]);

  const addLog = (
    level: 'info' | 'warn' | 'error' | 'success',
    agentName: string,
    agentId: string,
    message: string,
    dataSnippet?: string
  ) => {
    const newLog: SwarmLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('nl-NL'),
      agentId,
      agentName,
      level,
      message,
      dataSnippet,
    };
    setLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  const recordAudit = (
    actionType: 'SELF_HEAL_PATCH' | 'PLAN_PIVOT' | 'CODE_MERGE' | 'ADVERSARIAL_REPRO_TEST' | 'FILE_LOCK_PREEMPTION' | 'PROMPT_TUNED',
    summary: string
  ) => {
    const newEntry: AuditTrailEntry = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString('nl-NL'),
      agent: 'Chronicler Agent 4.1',
      actionType,
      summary,
      gitCommitHash: Math.random().toString(16).substring(2, 9),
    };
    setAuditTrail(prev => [newEntry, ...prev]);
  };

  /* =========================================================================
     1 & 2. LIVE AUTONOMOUS BACKGROUND AGENT WORKER LOOP
     Detects pending reviews and executes them autonomously via live Gemini API
     ========================================================================= */
  useEffect(() => {
    if (!isAutopilotRunning || circuitBreaker.isTriggered || circuitBreaker.freezeAllTenants) return;

    const workerTimer = setInterval(async () => {
      if (isWorkerBusyRef.current) return;

      // 1. Find any pending review needing autonomous reply
      const pendingReview = reviews.find(r => r.status === 'pending');
      if (!pendingReview) return;

      const matchingTenant = tenants.find(t => t.id === pendingReview.tenantId);
      if (!matchingTenant || !matchingTenant.isAutopilotActive) return;

      isWorkerBusyRef.current = true;
      addLog(
        'info',
        'Autonomous Swarm Daemon',
        'swarm_daemon',
        `Live processing review van ${pendingReview.author} voor ${matchingTenant.businessName}...`
      );

      try {
        const result = await generateSmartRoutedReviewReply({
          author: pendingReview.author,
          businessName: matchingTenant.businessName,
          rating: pendingReview.rating,
          comment: pendingReview.comment,
          tone: matchingTenant.toneOfVoice,
          nicheSpecialty: matchingTenant.niche,
          emergencyContact: matchingTenant.whatsAppEmergencyNumber,
          customPromptInstruction: matchingTenant.optimizedSystemPrompt,
        });

        const isEscalated = pendingReview.rating <= 2 || result.escalationRequired;

        // Update review with real live response
        setReviews(prev =>
          prev.map(r =>
            r.id === pendingReview.id
              ? {
                  ...r,
                  status: isEscalated ? 'escalated_to_owner' : 'auto_replied',
                  autoResponse: result.response,
                  routerTierUsed: result.routerTierUsed,
                  tokenCostEur: result.tokenCostEur,
                  repliedAt: isEscalated
                    ? 'Concept gereed • WhatsApp alert naar eigenaar'
                    : 'Zojuist autonoom geplaatst via Gemini 2.5',
                  escalationWhatsAppStatus: isEscalated ? 'SENT' : undefined,
                }
              : r
          )
        );

        // Update tenant stats & circuit breaker spend
        const cost = result.tokenCostEur || 0.001;
        setTenants(prev =>
          prev.map(t =>
            t.id === matchingTenant.id
              ? {
                  ...t,
                  totalReviewsManaged: t.totalReviewsManaged + 1,
                  hoursSaved: Number((t.hoursSaved + 0.25).toFixed(1)),
                  monthlyTokenCostEur: Number((t.monthlyTokenCostEur + cost).toFixed(4)),
                }
              : t
          )
        );

        setCircuitBreaker(prev => ({
          ...prev,
          spentBudgetEur: Number((prev.spentBudgetEur + cost).toFixed(4)),
          hourlyCalls: prev.hourlyCalls + 1,
        }));

        setDaemonState(prev => ({
          ...prev,
          tasksCompletedTotal: prev.tasksCompletedTotal + 1,
        }));

        addLog(
          'success',
          'Autonomous Swarm Daemon',
          'swarm_daemon',
          `Review van ${pendingReview.author} succesvol beantwoord via ${result.routerTierUsed}. Cost: €${cost}`
        );

      } catch (err: any) {
        addLog(
          'error',
          'Autonomous Swarm Daemon',
          'swarm_daemon',
          `Fout bij live verwerking van review ${pendingReview.id}: ${err?.message}`
        );
      } finally {
        isWorkerBusyRef.current = false;
      }
    }, 4000);

    return () => clearInterval(workerTimer);
  }, [isAutopilotRunning, reviews, tenants, circuitBreaker]);

  /* =========================================================================
     3. ZELF-OPTIMALISERENDE EVALUATOR AGENT (PROMPT TUNING FEEDBACK LOOP)
     Evaluates tenant review responses periodically and tightens prompt efficiency
     ========================================================================= */
  useEffect(() => {
    if (!isAutopilotRunning) return;

    // Run periodic prompt tuning check every 45 seconds for tenants with >= 2 replied reviews
    const tunerTimer = setInterval(async () => {
      for (const tenant of tenants) {
        const repliedReviews = reviews.filter(
          r => r.tenantId === tenant.id && r.autoResponse && r.status === 'auto_replied'
        );

        // Run prompt tuning if tenant has managed reviews and hasn't had recent optimization
        if (repliedReviews.length >= 2 && (!tenant.promptVersion || tenant.promptVersion < 3)) {
          try {
            addLog(
              'info',
              'Prompt Tuning Evaluator',
              'evaluator_agent',
              `Start autonome prompt-optimalisatie cyclus voor ${tenant.businessName}...`
            );

            const evaluation = await evaluateAndTuneTenantPrompt({
              tenantBusinessName: tenant.businessName,
              niche: tenant.niche,
              recentPairs: repliedReviews.slice(-3).map(r => ({
                comment: r.comment,
                reply: r.autoResponse || '',
                rating: r.rating,
              })),
            });

            const newVersion = (tenant.promptVersion || 1) + 1;

            setTenants(prev =>
              prev.map(t =>
                t.id === tenant.id
                  ? {
                      ...t,
                      optimizedSystemPrompt: evaluation.newInstruction,
                      promptVersion: newVersion,
                      tokenSavingsPercent: evaluation.estimatedTokenSavingsPercent,
                    }
                  : t
              )
            );

            setDaemonState(prev => ({
              ...prev,
              autoTuningCyclesRun: prev.autoTuningCyclesRun + 1,
            }));

            recordAudit(
              'PROMPT_TUNED',
              `Prompt v${newVersion} gedeployed voor ${tenant.businessName}: Besparing ${evaluation.estimatedTokenSavingsPercent}%`
            );

            addLog(
              'success',
              'Prompt Tuning Evaluator',
              'evaluator_agent',
              `Prompt v${newVersion} geactiveerd voor ${tenant.businessName}. Geschatte tokenbesparing: ${evaluation.estimatedTokenSavingsPercent}%`
            );
          } catch (e: any) {
            console.warn('Auto prompt tuning cycle error', e);
          }
          break; // Process one tenant per interval to avoid spiking tokens
        }
      }
    }, 45000);

    return () => clearInterval(tunerTimer);
  }, [isAutopilotRunning, reviews, tenants]);

  const handleToggleTask = (milestoneId: number, taskId: string) => {
    setMilestones(prev =>
      prev.map(m => {
        if (m.id !== milestoneId) return m;
        return {
          ...m,
          tasks: m.tasks.map(t =>
            t.id === taskId
              ? { ...t, completed: !t.completed, status: !t.completed ? 'completed' : 'pending' }
              : t
          ),
        };
      })
    );
  };

  const handleInjectMilestoneTask = (spec: { milestoneTitle: string; taskTitle: string; agentAssigned: string }) => {
    const newTaskId = `4.${Date.now().toString().slice(-2)}`;
    setMilestones(prev => {
      const milestone4 = prev.find(m => m.id === 4);
      if (!milestone4) return prev;

      return prev.map(m => {
        if (m.id !== 4) return m;
        return {
          ...m,
          injectedByRnD: true,
          tasks: [
            ...m.tasks,
            {
              id: newTaskId,
              title: spec.taskTitle,
              agent: spec.agentAssigned,
              completed: false,
              status: 'pending',
            },
          ],
        };
      });
    });
  };

  const handleReleaseLock = (filePath: string) => {
    setDaemonState(prev => ({
      ...prev,
      activeFileLocks: prev.activeFileLocks.filter(l => l.filePath !== filePath),
    }));
    addLog('info', 'Distributed Lock Manager', 'lock_mgr', `Lock handmatig vrijgegeven voor ${filePath}`);
  };

  const handleToggleAutopilot = () => {
    setIsAutopilotRunning(prev => {
      const next = !prev;
      addLog(
        next ? 'info' : 'warn',
        'Orchestrator CEO',
        'ceo',
        next ? 'Autonome swarm loops & worker daemon geactiveerd.' : 'Swarm worker daemon gepauzeerd.'
      );
      return next;
    });
  };

  const handleImpersonateTenant = (tenantToImpersonate: TenantProfile) => {
    setImpersonatedTenant(tenantToImpersonate);
    setActiveTenant(tenantToImpersonate);
    setAppMode('PORTAL');
    addLog('warn', 'God Mode / Admin', 'admin', `Superadmin impersonation gestart voor ${tenantToImpersonate.businessName}`);
  };

  const handleStopImpersonating = () => {
    setImpersonatedTenant(null);
    setAppMode('ADMIN');
  };

  // Convert prospect from cold audit into a tenant
  const handleConvertProspectToTenant = (report: ColdAuditReport) => {
    const newTenant: TenantProfile = {
      id: `tenant-${Date.now().toString().slice(-4)}`,
      businessName: report.businessName,
      ownerName: 'Directie',
      email: `contact@${report.businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}.nl`,
      whatsAppEmergencyNumber: '06-81920394',
      niche: report.niche,
      city: report.city,
      toneOfVoice: 'informeel',
      isAutopilotActive: true,
      isGoogleConnected: true,
      isTrustpilotConnected: false,
      plan: 'PRO',
      monthlyRevenueEur: 99.00,
      monthlyTokenCostEur: 0.25,
      totalReviewsManaged: 1,
      hoursSaved: 0.25,
      averageRating: report.currentRating,
      lastLoginDate: 'Zojuist binnengehaald via Cold Audit',
      churnRisk: 'LOW',
      reviewLinkSlug: report.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      createdAt: new Date().toISOString(),
      promptVersion: 1,
      tokenSavingsPercent: 20,
    };

    setTenants(prev => [newTenant, ...prev]);
    addLog('success', 'Acquisition Bot 3.1', 'cold_audit', `Nieuwe betalende tenant geconverteerd uit cold audit: ${newTenant.businessName} (€99/mnd MRR)`);
  };

  // Live Ingest webhook handler trigger from UI or external integration
  const handleIngestLiveWebhook = (payload: {
    tenantId: string;
    author: string;
    rating: number;
    comment: string;
    platform: 'Google' | 'Trustpilot';
  }) => {
    const matchingTenant = tenants.find(t => t.id === payload.tenantId) || tenants[0];
    const newReview: LocalReview = {
      id: `rev-${Date.now().toString().slice(-4)}`,
      tenantId: matchingTenant.id,
      author: payload.author,
      businessName: matchingTenant.businessName,
      platform: payload.platform,
      rating: payload.rating,
      comment: payload.comment,
      date: 'Zojuist via Webhook Ingest',
      sentiment: payload.rating >= 4 ? 'positive' : 'critical',
      status: 'pending', // Swarm daemon will process this live
    };

    setReviews(prev => [newReview, ...prev]);
    addLog(
      'info',
      'Webhook Ingest Worker',
      'webhook_ingest',
      `Nieuwe review ontvangen via webhook voor ${matchingTenant.businessName} (${payload.rating}★). Toegevoegd aan worker daemon queue.`
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        appMode={appMode}
        setAppMode={setAppMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        circuitBreaker={circuitBreaker}
        onOpenCircuitBreaker={() => setIsCircuitBreakerModalOpen(true)}
        onOpenSpecExport={() => setIsSpecModalOpen(true)}
        onOpenJournal={() => setIsJournalModalOpen(true)}
        onOpenDaemonSentinel={() => setIsDaemonSentinelModalOpen(true)}
        isAutopilotRunning={isAutopilotRunning}
        onToggleAutopilot={handleToggleAutopilot}
        impersonatedTenant={impersonatedTenant}
        onStopImpersonating={handleStopImpersonating}
        onOpenColdAudit={() => setIsColdAuditOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* MODE 1: KLANTPORTAAL */}
        {appMode === 'PORTAL' && (
          <ClientPortal
            tenant={activeTenant}
            setTenant={setActiveTenant}
            reviews={reviews}
            setReviews={setReviews}
          />
        )}

        {/* MODE 2: SUPERADMIN COCKPIT (GOD MODE) */}
        {appMode === 'ADMIN' && (
          <AdminCockpit
            tenants={tenants}
            setTenants={setTenants}
            circuitBreaker={circuitBreaker}
            setCircuitBreaker={setCircuitBreaker}
            onImpersonateTenant={handleImpersonateTenant}
            onOpenColdAudit={() => setIsColdAuditOpen(true)}
            onIngestWebhook={handleIngestLiveWebhook}
            daemonState={daemonState}
          />
        )}

        {/* MODE 3: SWARM ENGINE (TELEMETRY & RUNBOOKS) */}
        {appMode === 'SWARM_ENGINE' && (
          <>
            {activeTab === 'orchestrator' && (
              <SwarmCanvas
                agents={agents}
                setAgents={setAgents}
                logs={logs}
                addLog={addLog}
              />
            )}

            {activeTab === 'selfhealing' && (
              <SelfHealingSwarm
                onAddLog={addLog}
                onRecordAudit={recordAudit}
              />
            )}

            {activeTab === 'rnd' && (
              <RnDBrainstormSwarm
                onInjectMilestone={handleInjectMilestoneTask}
                onAddLog={addLog}
                onRecordAudit={recordAudit}
              />
            )}

            {activeTab === 'localrepute' && <LocalReputeSimulator />}

            {activeTab === 'playground' && <AgentPlayground agents={agents} />}

            {activeTab === 'roadmap' && (
              <MilestonesTracker
                milestones={milestones}
                onToggleTask={handleToggleTask}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>Project LevelPlay: Autonoom Swarm Ecosysteem</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
              DAEMON WORKER: ACTIEF ({daemonState.tasksCompletedTotal} taken verwerkt)
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Prompt Evaluator: Auto-Tuning Actief</span>
            <span>Google Compliance: 100% Anti-Gating</span>
            <span className="font-mono text-emerald-400">STATUS: AUTONOMOUS_LIVE</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SpecExportModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
      />

      <CircuitBreakerModal
        isOpen={isCircuitBreakerModalOpen}
        onClose={() => setIsCircuitBreakerModalOpen(false)}
        state={circuitBreaker}
        setState={setCircuitBreaker}
      />

      <SystemJournalModal
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
        auditTrail={auditTrail}
      />

      <DaemonSentinelModal
        isOpen={isDaemonSentinelModalOpen}
        onClose={() => setIsDaemonSentinelModalOpen(false)}
        daemonState={daemonState}
        invariantConstraints={INVARIANT_CONSTRAINTS}
        onReleaseLock={handleReleaseLock}
      />

      <ColdAuditBot
        isOpen={isColdAuditOpen}
        onClose={() => setIsColdAuditOpen(false)}
        onConvertProspectToTenant={handleConvertProspectToTenant}
      />
    </div>
  );
}
