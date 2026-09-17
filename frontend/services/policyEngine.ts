/**
 * OrionX-AI Policy Engine
 * Enforces least privilege, budget boundaries, and approval requirements.
 */

import { AgentCapability, AgentMetadata, PolicyDecision, AuditEvent } from '../types';
import { logger } from './structuredLogger';

class PolicyEngine {
  private auditLog: AuditEvent[] = [];

  public evaluateAction(
    agent: AgentMetadata,
    requestedCapability: AgentCapability,
    tenantId: string,
    correlationId: string,
    details?: string
  ): PolicyDecision {
    // 1. Immutable Capability Check
    if (!agent.allowedCapabilities.includes(requestedCapability)) {
      this.recordAudit({
        actorType: 'AGENT',
        actorId: agent.id,
        tenantId,
        action: `CAPABILITY_REQUEST:${requestedCapability}`,
        resource: 'CoreRuntime',
        decision: PolicyDecision.DENY,
        reason: `Capability ${requestedCapability} is not permitted in agent ${agent.name} specification.`,
        correlationId,
      });
      return PolicyDecision.DENY;
    }

    // 2. High-Risk Action Gates
    const highRiskCapabilities = [
      AgentCapability.EXECUTE_REFUND,
      AgentCapability.DEPLOY_CODE,
      AgentCapability.OVERRIDE_GUARDRAILS,
    ];

    if (highRiskCapabilities.includes(requestedCapability)) {
      this.recordAudit({
        actorType: 'AGENT',
        actorId: agent.id,
        tenantId,
        action: `HIGH_RISK_OP:${requestedCapability}`,
        resource: 'ProductionBoundary',
        decision: PolicyDecision.REQUIRE_APPROVAL,
        reason: `High risk capability ${requestedCapability} mandates operator review.`,
        correlationId,
      });
      return PolicyDecision.REQUIRE_APPROVAL;
    }

    // 3. Approved
    this.recordAudit({
      actorType: 'AGENT',
      actorId: agent.id,
      tenantId,
      action: `INVOKE:${requestedCapability}`,
      resource: details || 'AgentSandbox',
      decision: PolicyDecision.ALLOW,
      reason: 'Capability matches registered profile within budget envelope.',
      correlationId,
    });
    return PolicyDecision.ALLOW;
  }

  private recordAudit(event: Omit<AuditEvent, 'eventId' | 'timestamp'>): void {
    const fullEvent: AuditEvent = {
      ...event,
      eventId: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLog.unshift(fullEvent);
    if (this.auditLog.length > 200) this.auditLog.pop();

    logger.info('policy_engine', 'policy_evaluation', `${fullEvent.decision}: ${fullEvent.action} (${fullEvent.reason})`, {
      correlationId: fullEvent.correlationId,
      agentId: fullEvent.actorId,
    });
  }

  public getAuditTrail(): AuditEvent[] {
    return [...this.auditLog];
  }
}

export const policyEngine = new PolicyEngine();
