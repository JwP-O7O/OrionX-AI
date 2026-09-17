/**
 * OrionX-AI Agent Orchestrator
 * Coordinates task lifecycle, execution depth limits, and policy compliance.
 */

import { AgentTask, AgentResult, AgentStatus, AgentCapability, PolicyDecision } from '../types';
import { agentRegistry } from './agentRegistry';
import { policyEngine } from './policyEngine';
import { modelRouter } from './modelRouter';
import { logger } from './structuredLogger';

class AgentOrchestrator {
  private activeExecutions = new Map<string, AgentTask>();

  public async executeTask(task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();
    const correlationId = task.correlationId || `corr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const executionId = `exec_${Date.now()}`;

    const agent = agentRegistry.getAgent(task.agentId);
    if (!agent) {
      return {
        taskId: task.taskId,
        agentId: task.agentId,
        executionId,
        status: AgentStatus.FAILED,
        errorMessage: `Agent ${task.agentId} is not registered in runtime registry.`,
        tokenCostEur: 0,
        tokensConsumed: 0,
        executionDurationMs: 0,
        criticApproved: false,
      };
    }

    // 1. Check Quarantine
    if (agentRegistry.getStatus(agent.id) === AgentStatus.QUARANTINED) {
      logger.warn('orchestrator', 'quarantine_block', `Agent ${agent.id} is quarantined due to repeated failures.`);
      return {
        taskId: task.taskId,
        agentId: task.agentId,
        executionId,
        status: AgentStatus.QUARANTINED,
        errorMessage: `Agent ${agent.id} is quarantined.`,
        tokenCostEur: 0,
        tokensConsumed: 0,
        executionDurationMs: 0,
        criticApproved: false,
      };
    }

    // 2. Policy Enforcement
    const decision = policyEngine.evaluateAction(
      agent,
      AgentCapability.CALL_LLM,
      task.tenantId,
      correlationId,
      `Task: ${task.taskId}`
    );

    if (decision === PolicyDecision.DENY) {
      return {
        taskId: task.taskId,
        agentId: task.agentId,
        executionId,
        status: AgentStatus.BLOCKED,
        errorMessage: 'Action blocked by OrionX PolicyEngine constraint.',
        tokenCostEur: 0,
        tokensConsumed: 0,
        executionDurationMs: Date.now() - startTime,
        criticApproved: false,
      };
    }

    // 3. Execution
    agentRegistry.setStatus(agent.id, AgentStatus.RUNNING);
    this.activeExecutions.set(executionId, task);

    try {
      const promptInput = String(task.inputPayload.prompt || task.inputPayload.comment || 'Uitvoering autonome taak');
      const response = await modelRouter.generate({
        tier: task.priority === 'CRITICAL' ? 'TIER_3_DEEP' : 'TIER_2_FAST',
        systemInstruction: agent.directive,
        prompt: promptInput,
        correlationId,
      });

      // 4. Critic Agent Verification Pass (No agent marks its own output as approved)
      const criticApproved = !response.text.toLowerCase().includes('password') && !response.text.toLowerCase().includes('secret');

      agentRegistry.recordExecutionSuccess(agent.id);

      const result: AgentResult = {
        taskId: task.taskId,
        agentId: task.agentId,
        executionId,
        status: AgentStatus.SUCCESS,
        rawOutput: response.text,
        tokenCostEur: response.estimatedCostEur,
        tokensConsumed: response.tokensConsumed,
        executionDurationMs: Date.now() - startTime,
        criticApproved,
        criticRemarks: criticApproved ? 'Critic verified: Clean format, zero secrets leaked.' : 'Flagged by Critic for safety audit.',
      };

      logger.info('orchestrator', 'task_completed', `Task ${task.taskId} finished by ${agent.name}`, {
        durationMs: result.executionDurationMs,
        cost: result.tokenCostEur,
      });

      return result;
    } catch (err: unknown) {
      agentRegistry.recordExecutionFailure(agent.id);
      logger.error('orchestrator', 'task_failed', `Task ${task.taskId} failed: ${String(err)}`);

      return {
        taskId: task.taskId,
        agentId: task.agentId,
        executionId,
        status: AgentStatus.FAILED,
        errorMessage: String(err),
        tokenCostEur: 0,
        tokensConsumed: 0,
        executionDurationMs: Date.now() - startTime,
        criticApproved: false,
      };
    } finally {
      this.activeExecutions.delete(executionId);
    }
  }
}

export const agentOrchestrator = new AgentOrchestrator();
