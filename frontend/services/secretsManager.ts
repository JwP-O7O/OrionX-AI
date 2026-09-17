/**
 * OrionX-AI Secrets Manager
 * Strictly provides secrets in-memory without serializing or leaking to logs.
 */

import { configManager } from './configurationManager';

export interface SecretsProvider {
  getSecret(key: string): string;
  hasSecret(key: string): boolean;
}

class LocalSecretsProvider implements SecretsProvider {
  private inMemoryVault = new Map<string, string>();

  constructor() {
    const apiKey = configManager.get('apiKey');
    if (apiKey) {
      this.inMemoryVault.set('GEMINI_API_KEY', apiKey);
    }
  }

  public getSecret(key: string): string {
    return this.inMemoryVault.get(key) || '';
  }

  public hasSecret(key: string): boolean {
    return this.inMemoryVault.has(key);
  }

  public setSecret(key: string, secretValue: string): void {
    this.inMemoryVault.set(key, secretValue);
  }
}

class SecretsManager {
  private provider: SecretsProvider;

  constructor(provider?: SecretsProvider) {
    this.provider = provider || new LocalSecretsProvider();
  }

  public get(key: string): string {
    const secret = this.provider.getSecret(key);
    if (!secret) {
      // Degrade gracefully if key is missing in demo/test contexts
      return '';
    }
    return secret;
  }

  public redact(text: string): string {
    if (!text) return '';
    const apiKey = this.get('GEMINI_API_KEY');
    if (apiKey && apiKey.length > 5) {
      return text.replaceAll(apiKey, '[REDACTED_API_KEY]');
    }
    return text;
  }
}

export const secretsManager = new SecretsManager();
