/**
 * OrionX-AI Configuration Manager
 * Centralizes all typed environment configs, boundary parsing and diagnostics.
 */

export interface OrionXConfig {
  environment: 'development' | 'staging' | 'production';
  googleProject: string;
  googleLocation: string;
  apiKey: string;
  maxMonthlyBudgetEur: number;
  maxHourlyCalls: number;
  maxAgentDepth: number;
  demoMode: boolean;
  circuitBreakerThreshold: number;
}

class ConfigurationManager {
  private config: OrionXConfig;

  constructor() {
    const rawApiKey = (typeof process !== 'undefined' && process.env?.API_KEY) ? process.env.API_KEY : '';
    const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

    this.config = {
      environment: isDev ? 'development' : 'production',
      googleProject: 'orionx-ai-runtime',
      googleLocation: 'us-central1',
      apiKey: rawApiKey,
      maxMonthlyBudgetEur: 150.0,
      maxHourlyCalls: 100,
      maxAgentDepth: 5,
      demoMode: false,
      circuitBreakerThreshold: 5,
    };
  }

  public get<K extends keyof OrionXConfig>(key: K): OrionXConfig[K] {
    return this.config[key];
  }

  public getSnapshot(): Readonly<OrionXConfig> {
    return Object.freeze({ ...this.config, apiKey: this.maskSecret(this.config.apiKey) });
  }

  public setDemoMode(active: boolean): void {
    this.config.demoMode = active;
  }

  private maskSecret(val: string): string {
    if (!val || val.length < 8) return '********';
    return `${val.substring(0, 4)}...${val.substring(val.length - 4)}`;
  }
}

export const configManager = new ConfigurationManager();
