export enum AgentCluster {
  STRATEGY = 'STRATEGY',
  BUILD = 'BUILD',
  OPS = 'OPS',
  SELF_HEALING = 'SELF_HEALING',
  RD_BRAINSTORM = 'RD_BRAINSTORM',
  CHRONICLER = 'CHRONICLER',
}

export enum AgentStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  BLOCKED = 'BLOCKED',
}

export interface SwarmAgent {
  id: string;
  name: string;
  role: string;
  cluster: AgentCluster;
  tools: string[];
  directive: string;
  outputFormat: string;
  status: AgentStatus;
  executionCount: number;
  lastOutput?: string;
  lastExecutionTime?: string;
}

export interface SwarmLog {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  dataSnippet?: string;
}

export interface MilestoneTask {
  id: string;
  title: string;
  agent: string;
  completed: boolean;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
}

export interface Milestone {
  id: number;
  title: string;
  hours: string;
  description: string;
  tasks: MilestoneTask[];
  injectedByRnD?: boolean;
}

/* ==========================================================
   MONETIZATION & CLIENT EXPERIENCE INTERFACES
   ========================================================== */

export type SubscriptionTier = 'STARTER' | 'PRO' | 'MULTI_LOCATION';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  priceEur: number;
  billingPeriod: 'month';
  badge?: string;
  features: string[];
  maxTenants: number;
  maxReviewsPerMonth: number | 'unlimited';
  whatsAppCredits: number;
}

export interface TenantProfile {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  whatsAppEmergencyNumber: string;
  niche: string;
  city: string;
  toneOfVoice: 'informeel' | 'formeel' | 'enthousiast';
  isAutopilotActive: boolean;
  isGoogleConnected: boolean;
  isTrustpilotConnected: boolean;
  plan: SubscriptionTier;
  monthlyRevenueEur: number;
  monthlyTokenCostEur: number;
  totalReviewsManaged: number;
  hoursSaved: number;
  averageRating: number;
  lastLoginDate: string;
  churnRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  reviewLinkSlug: string;
  createdAt: string;
  optimizedSystemPrompt?: string;
  promptVersion?: number;
  tokenSavingsPercent?: number;
}

export interface ModelRouterRule {
  complexity: 'SIMPLE_5_STAR_NO_TEXT' | 'POSITIVE_WITH_TEXT' | 'CRITICAL_1_2_STAR';
  modelAssigned: string;
  estimatedCostPerCallEur: number;
  strategy: string;
}

export interface LocalReview {
  id: string;
  tenantId: string;
  author: string;
  businessName: string;
  platform: 'Google' | 'Trustpilot';
  rating: number; // 1-5
  comment: string;
  date: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'critical';
  status: 'pending' | 'auto_replied' | 'escalated_to_owner';
  autoResponse?: string;
  seoKeywordsUsed?: string[];
  repliedAt?: string;
  routerTierUsed?: string;
  tokenCostEur?: number;
  escalationWhatsAppStatus?: 'SENT' | 'CONFIRMED' | 'EDITED';
}

export interface ColdAuditReport {
  id: string;
  businessName: string;
  city: string;
  niche: string;
  currentRating: number;
  unansweredReviewsCount: number;
  estimatedMonthlyLeadLoss: number;
  sampleUnansweredReview: {
    author: string;
    rating: number;
    comment: string;
    date: string;
  };
  sampleAiResponse: string;
  outreachMessageTemplate: string;
  generatedAt: string;
}

/* ==========================================================
   AUTONOMOUS WORKER DAEMON & WEBHOOK INGEST
   ========================================================== */

export interface DaemonQueueTask {
  id: string;
  type: 'PROCESS_REVIEW' | 'OPTIMIZE_PROMPT' | 'AUDIT_CHURN';
  tenantId: string;
  businessName: string;
  reviewId?: string;
  rating?: number;
  comment?: string;
  author?: string;
  queuedAt: string;
  retries: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  resultSnippet?: string;
}

export interface PromptTuningReport {
  id: string;
  tenantId: string;
  businessName: string;
  timestamp: string;
  previousTokenAvg: number;
  optimizedTokenAvg: number;
  savingsPercent: number;
  recommendation: string;
  newInstruction: string;
}

export interface CircuitBreakerState {
  totalBudgetEur: number;
  spentBudgetEur: number;
  hourlyCalls: number;
  maxHourlyCalls: number;
  maxIterLimit: number;
  isTriggered: boolean;
  freezeAllTenants: boolean;
}

/* ==========================================================
   SELF-HEALING (CLUSTER 2) INTERFACES
   ========================================================== */

export interface IncidentEvent {
  id: string;
  timestamp: string;
  service: string;
  errorType: string;
  message: string;
  stackTrace: string;
  contextPayload?: string;
  status: 'detecting' | 'red_teaming' | 'analyzing' | 'patching' | 'verifying' | 'healed' | 'escalated';
  rootCause?: string;
  redTeamReproductionTest?: string;
  codePatchDiff?: string;
  vectorRunbookId?: string;
  postMortemSummary?: string;
  newGuardrailRule?: string;
  adversarialCheckPassed?: boolean;
  fileLockPreempted?: boolean;
}

export interface VectorMemoryEntry {
  id: string;
  timestamp: string;
  errorSignature: string;
  rootCause: string;
  solutionDiff: string;
  guardrailEnforced: string;
  confidenceRating: number;
  decayDaysLeft: number;
  timesApplied: number;
  similarityScore?: number;
}

/* ==========================================================
   R&D & INVARIANT CORE ARCHITECTURE (CLUSTER 3) INTERFACES
   ========================================================== */

export interface InvariantCoreConstraints {
  immutableDomain: string;
  targetGrossMarginMin: number;
  allowedTechStack: string[];
  maxMonthlyBudgetEur: number;
  humanInTheLoopRequiredForPivots: boolean;
}

export interface RnDHypothesis {
  id: string;
  timestamp: string;
  title: string;
  sourceObservation: string;
  proposedFeature: string;
  targetMetric: string;
  scores: {
    ltvCacImpact: number;
    zeroTouchFeasibility: number;
    tokenGrossMargin: number;
    overallScore: number;
  };
  invariantCheck: {
    passed: boolean;
    violatesDomainConstraint?: boolean;
    violatesMarginConstraint?: boolean;
    notes?: string;
  };
  decision: 'APPROVED_AND_INJECTED' | 'REJECTED_LOW_ROI' | 'BLOCKED_BY_INVARIANT_CORE' | 'PENDING_HUMAN_APPROVAL';
  rejectionReason?: string;
  injectedMilestoneSpec?: {
    milestoneTitle: string;
    taskTitle: string;
    agentAssigned: string;
  };
}

/* ==========================================================
   DISTRIBUTED FILE LOCKS & DAEMONS
   ========================================================== */

export interface FileLock {
  filePath: string;
  lockedByAgent: string;
  cluster: AgentCluster;
  leaseExpiresInSeconds: number;
  isHotfixPreempted: boolean;
}

export interface DaemonState {
  daemonHealerStatus: 'LISTENING_ACTIVE' | 'SANDBOX_RUNNING' | 'STANDBY';
  cronEvolutionStatus: 'SCHEDULED_00_00_UTC' | 'SCANNING_CHURN' | 'COMPLETED';
  activeFileLocks: FileLock[];
  activeSandboxesCount: number;
  queueLength: number;
  tasksCompletedTotal: number;
  autoTuningCyclesRun: number;
}

/* ==========================================================
   CHRONICLER & SYSTEM JOURNAL (CLUSTER 4) INTERFACES
   ========================================================== */

export interface ADRRecord {
  id: string;
  title: string;
  date: string;
  status: 'Accepted' | 'Proposed' | 'Superseded';
  context: string;
  decision: string;
  consequences: string;
}

export interface AuditTrailEntry {
  id: string;
  timestamp: string;
  agent: string;
  actionType: 'SELF_HEAL_PATCH' | 'PLAN_PIVOT' | 'CODE_MERGE' | 'SAFETY_TRIP' | 'GUARDRAIL_INJECTION' | 'ADVERSARIAL_REPRO_TEST' | 'FILE_LOCK_PREEMPTION' | 'PROMPT_TUNED';
  summary: string;
  gitCommitHash: string;
}
