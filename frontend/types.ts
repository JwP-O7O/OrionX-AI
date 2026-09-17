/**
 * OrionX-AI Core Domain Types & Contracts
 */

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
  QUARANTINED = 'QUARANTINED',
}

export enum AgentCapability {
  READ_DATABASE = 'READ_DATABASE',
  WRITE_DATABASE = 'WRITE_DATABASE',
  CALL_LLM = 'CALL_LLM',
  CALL_EXTERNAL_API = 'CALL_EXTERNAL_API',
  CREATE_TASK = 'CREATE_TASK',
  DEPLOY_CODE = 'DEPLOY_CODE',
  EXECUTE_REFUND = 'EXECUTE_REFUND',
  SEND_MESSAGES = 'SEND_MESSAGES',
  OVERRIDE_GUARDRAILS = 'OVERRIDE_GUARDRAILS',
}

export enum PolicyDecision {
  ALLOW = 'ALLOW',
  DENY = 'DENY',
  REQUIRE_APPROVAL = 'REQUIRE_APPROVAL',
}

export enum CircuitBreakerStateEnum {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export type SubscriptionTier = 'STARTER' | 'PRO' | 'MULTI_LOCATION';

export interface ExecutionBudget {
  timeLimitMs: number;
  tokenBudget: number;
  costBudgetEur: number;
  maxChildTasks: number;
}

export interface AgentMetadata {
  id: string;
  name: string;
  version: string;
  cluster: AgentCluster;
  description: string;
  allowedCapabilities: AgentCapability[];
  directive: string;
  outputContract: string;
  budget: ExecutionBudget;
}

export interface AgentContext {
  tenantId: string;
  correlationId: string;
  initiatedBy: string;
  depth: number;
  timestamp: string;
}

export interface AgentTask {
  taskId: string;
  agentId: string;
  tenantId: string;
  correlationId: string;
  inputPayload: Record<string, unknown>;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  createdAt: string;
  timeoutMs: number;
  maxAttempts: number;
  currentAttempt: number;
}

export interface AgentResult {
  taskId: string;
  agentId: string;
  executionId: string;
  status: AgentStatus;
  outputPayload?: Record<string, unknown>;
  rawOutput?: string;
  tokenCostEur: number;
  tokensConsumed: number;
  executionDurationMs: number;
  criticApproved: boolean;
  criticRemarks?: string;
  errorMessage?: string;
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
  criticVerified?: boolean;
}

export interface CircuitBreakerStatus {
  serviceName: string;
  state: CircuitBreakerStateEnum;
  failuresCount: number;
  failureThreshold: number;
  lastFailureTime?: number;
  resetTimeoutMs: number;
}

export interface RuntimeMetrics {
  totalRequests: number;
  successfulTasks: number;
  failedTasks: number;
  quarantinedAgentsCount: number;
  totalTokensConsumed: number;
  totalEstimatedCostEur: number;
  avgLatencyMs: number;
  circuitBreakers: CircuitBreakerStatus[];
}

export interface AuditEvent {
  eventId: string;
  timestamp: string;
  actorType: 'SYSTEM' | 'AGENT' | 'OPERATOR';
  actorId: string;
  tenantId: string;
  action: string;
  resource: string;
  decision: PolicyDecision;
  reason: string;
  correlationId: string;
}

export interface InvariantCoreConstraints {
  immutableDomain: string;
  targetGrossMarginMin: number;
  allowedTechStack: string[];
  maxMonthlyBudgetEur: number;
  humanInTheLoopRequiredForPivots: boolean;
}
