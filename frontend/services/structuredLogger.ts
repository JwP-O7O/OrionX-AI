/**
 * OrionX-AI Structured JSON Logger
 */

import { secretsManager } from './secretsManager';

export interface LogEntry {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  service: string;
  component: string;
  event: string;
  correlationId?: string;
  tenantId?: string;
  agentId?: string;
  message: string;
  meta?: Record<string, unknown>;
}

class StructuredLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  public log(entry: Omit<LogEntry, 'timestamp'>): LogEntry {
    const sanitizedMsg = secretsManager.redact(entry.message);
    const fullEntry: LogEntry = {
      ...entry,
      message: sanitizedMsg,
      timestamp: new Date().toISOString(),
    };

    this.logs.unshift(fullEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    if (entry.level === 'ERROR') {
      console.error(JSON.stringify(fullEntry));
    } else if (entry.level === 'WARN') {
      console.warn(JSON.stringify(fullEntry));
    } else {
      console.log(JSON.stringify(fullEntry));
    }

    return fullEntry;
  }

  public info(component: string, event: string, message: string, meta?: Record<string, unknown>): LogEntry {
    return this.log({ level: 'INFO', service: 'orionx-core', component, event, message, meta });
  }

  public warn(component: string, event: string, message: string, meta?: Record<string, unknown>): LogEntry {
    return this.log({ level: 'WARN', service: 'orionx-core', component, event, message, meta });
  }

  public error(component: string, event: string, message: string, meta?: Record<string, unknown>): LogEntry {
    return this.log({ level: 'ERROR', service: 'orionx-core', component, event, message, meta });
  }

  public getRecentLogs(): LogEntry[] {
    return [...this.logs];
  }
}

export const logger = new StructuredLogger();
