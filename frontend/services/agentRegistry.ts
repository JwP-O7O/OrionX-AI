/**
 * OrionX-AI Agent Registry
 * Authoritative registry for all agent roles, versions, capabilities and runtime status.
 */

import { AgentMetadata, AgentCluster, AgentCapability, AgentStatus } from '../types';

class AgentRegistry {
  private registry = new Map<string, AgentMetadata>();
  private statuses = new Map<string, AgentStatus>();
  private failureCounts = new Map<string, number>();

  constructor() {
    this.initializeDefaultAgents();
  }

  private initializeDefaultAgents(): void {
    const agents: AgentMetadata[] = [
      {
        id: 'critic',
        name: 'Agent 2.3: Security QA & Critic Guard',
        version: '2.0.0',
        cluster: AgentCluster.BUILD,
        description: 'Audits code output, verifies zero secret leakage, blocks infinite agent loops.',
        allowedCapabilities: [AgentCapability.READ_DATABASE, AgentCapability.CALL_LLM, AgentCapability.OVERRIDE_GUARDRAILS],
        directive: 'Beoordeel alle acties. Keur alles af bij ontbrekende validatie, loops of secrets.',
        outputContract: 'CriticVerdict: { approved: boolean, reason: string }',
        budget: { timeLimitMs: 6000, tokenBudget: 800, costBudgetEur: 0.005, maxChildTasks: 1 },
      },
      {
        id: 'market_intel',
        name: 'Agent 1.1: Market Intel & Competitor Researcher',
        version: '2.0.0',
        cluster: AgentCluster.STRATEGY,
        description: 'Identificeert marktgaten en onbeantwoorde reviews bij concurrenten.',
        allowedCapabilities: [AgentCapability.CALL_LLM, AgentCapability.CALL_EXTERNAL_API],
        directive: 'Focus op repetitieve SMB pijnpunten zonder menselijke overhead.',
        outputContract: 'MarketGapReport: { targetNiche: string, findings: string[] }',
        budget: { timeLimitMs: 8000, tokenBudget: 1200, costBudgetEur: 0.008, maxChildTasks: 2 },
      },
      {
        id: 'coder_backend',
        name: 'Agent 2.1: Software Architect & Backend Coder',
        version: '2.0.0',
        cluster: AgentCluster.BUILD,
        description: 'Genereert deterministische APIs en database schema updates.',
        allowedCapabilities: [AgentCapability.CALL_LLM, AgentCapability.WRITE_DATABASE, AgentCapability.DEPLOY_CODE],
        directive: 'Schrijf deterministische TypeScript code. Geen inline secrets.',
        outputContract: 'CodeArtifact: { filename: string, diff: string }',
        budget: { timeLimitMs: 12000, tokenBudget: 2500, costBudgetEur: 0.015, maxChildTasks: 2 },
      },
      {
        id: 'support_agent',
        name: 'Agent 3.2: Autonomous Retention & Support Agent',
        version: '2.0.0',
        cluster: AgentCluster.OPS,
        description: '24/7 ticket handling en churn preventie conform retention policy.',
        allowedCapabilities: [AgentCapability.READ_DATABASE, AgentCapability.CALL_LLM, AgentCapability.SEND_MESSAGES, AgentCapability.EXECUTE_REFUND],
        directive: 'Bied direct empathie en behoud marge.',
        outputContract: 'SupportResolution: { status: string, actionTaken: string }',
        budget: { timeLimitMs: 6000, tokenBudget: 1000, costBudgetEur: 0.006, maxChildTasks: 1 },
      },
    ];

    for (const a of agents) {
      this.registry.set(a.id, a);
      this.statuses.set(a.id, AgentStatus.IDLE);
      this.failureCounts.set(a.id, 0);
    }
  }

  public getAgent(id: string): AgentMetadata | undefined {
    return this.registry.get(id);
  }

  public getAll(): AgentMetadata[] {
    return Array.from(this.registry.values());
  }

  public getStatus(id: string): AgentStatus {
    return this.statuses.get(id) || AgentStatus.IDLE;
  }

  public setStatus(id: string, status: AgentStatus): void {
    this.statuses.set(id, status);
  }

  public recordExecutionFailure(id: string): void {
    const count = (this.failureCounts.get(id) || 0) + 1;
    this.failureCounts.set(id, count);
    if (count >= 3) {
      this.statuses.set(id, AgentStatus.QUARANTINED);
    }
  }

  public recordExecutionSuccess(id: string): void {
    this.failureCounts.set(id, 0);
    this.statuses.set(id, AgentStatus.IDLE);
  }
}

export const agentRegistry = new AgentRegistry();
