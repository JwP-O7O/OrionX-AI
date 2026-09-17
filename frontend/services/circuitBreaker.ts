/**
 * OrionX-AI Circuit Breaker
 * Protects downstream LLM providers and external APIs from cascade failures.
 */

import { CircuitBreakerStateEnum, CircuitBreakerStatus } from '../types';
import { logger } from './structuredLogger';

export class ServiceCircuitBreaker {
  private state: CircuitBreakerStateEnum = CircuitBreakerStateEnum.CLOSED;
  private failures = 0;
  private lastFailureTime = 0;

  constructor(
    public readonly serviceName: string,
    private readonly failureThreshold = 4,
    private readonly resetTimeoutMs = 15000
  ) {}

  public canExecute(): boolean {
    if (this.state === CircuitBreakerStateEnum.CLOSED) {
      return true;
    }

    if (this.state === CircuitBreakerStateEnum.OPEN) {
      const now = Date.now();
      if (now - this.lastFailureTime > this.resetTimeoutMs) {
        this.state = CircuitBreakerStateEnum.HALF_OPEN;
        logger.info('circuit_breaker', 'circuit_half_open', `Circuit entered HALF_OPEN state for ${this.serviceName}`);
        return true;
      }
      return false;
    }

    // HALF_OPEN allows single canary probe
    return true;
  }

  public recordSuccess(): void {
    if (this.state !== CircuitBreakerStateEnum.CLOSED) {
      logger.info('circuit_breaker', 'circuit_recovered', `Circuit CLOSED (recovered) for ${this.serviceName}`);
    }
    this.failures = 0;
    this.state = CircuitBreakerStateEnum.CLOSED;
  }

  public recordFailure(err?: unknown): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    logger.warn('circuit_breaker', 'failure_recorded', `Failure #${this.failures} recorded on ${this.serviceName}`, {
      error: String(err),
    });

    if (this.failures >= this.failureThreshold) {
      this.state = CircuitBreakerStateEnum.OPEN;
      logger.error('circuit_breaker', 'circuit_tripped', `Circuit TRIPPED to OPEN for ${this.serviceName}. Threshold exceeded.`);
    }
  }

  public getStatus(): CircuitBreakerStatus {
    return {
      serviceName: this.serviceName,
      state: this.state,
      failuresCount: this.failures,
      failureThreshold: this.failureThreshold,
      lastFailureTime: this.lastFailureTime,
      resetTimeoutMs: this.resetTimeoutMs,
    };
  }

  public manualReset(): void {
    this.failures = 0;
    this.state = CircuitBreakerStateEnum.CLOSED;
  }
}

export const geminiCircuitBreaker = new ServiceCircuitBreaker('VertexAI_Gemini_Provider', 4, 15000);
