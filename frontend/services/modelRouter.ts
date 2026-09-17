/**
 * OrionX-AI Model Router
 * Central dispatch for LLM generation requests with 3-tier cost routing.
 * Ensures business services and UI components never invoke provider SDKs directly.
 */

import { GoogleGenAI } from '@google/genai';
import { secretsManager } from './secretsManager';
import { geminiCircuitBreaker } from './circuitBreaker';
import { logger } from './structuredLogger';

export interface ModelRequest {
  tier: 'TIER_1_MICRO' | 'TIER_2_FAST' | 'TIER_3_DEEP';
  systemInstruction?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  correlationId?: string;
  responseMimeType?: string;
}

export interface ModelResponse {
  text: string;
  tierUsed: string;
  estimatedCostEur: number;
  tokensConsumed: number;
  durationMs: number;
}

class ModelRouter {
  private client: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI {
    if (!this.client) {
      const key = secretsManager.get('GEMINI_API_KEY');
      this.client = new GoogleGenAI({
        apiKey: key || undefined,
        vertexai: true,
      });
    }
    return this.client;
  }

  public async generate(req: ModelRequest): Promise<ModelResponse> {
    const startTime = Date.now();

    // 1. Tier 1 Static Template Fast-Path (Zero cost, instant)
    if (req.tier === 'TIER_1_MICRO') {
      return {
        text: 'Hartelijk dank voor uw waardering van 5 sterren! We zien u graag weer terug.',
        tierUsed: 'TIER_1_MICRO_TEMPLATE',
        estimatedCostEur: 0.0001,
        tokensConsumed: 25,
        durationMs: Date.now() - startTime,
      };
    }

    // 2. Circuit Breaker Check
    if (!geminiCircuitBreaker.canExecute()) {
      logger.warn('model_router', 'circuit_open_fallback', 'Circuit open, applying resilient fallback');
      return {
        text: 'Dank voor uw feedback. We hebben uw bericht ontvangen en nemen zo nodig contact met u op.',
        tierUsed: 'CIRCUIT_BREAKER_FALLBACK',
        estimatedCostEur: 0.0,
        tokensConsumed: 0,
        durationMs: Date.now() - startTime,
      };
    }

    // 3. Execute with Provider Adapter
    try {
      const ai = this.getClient();
      const model = 'gemini-2.5-flash';

      const config: Record<string, unknown> = {
        systemInstruction: req.systemInstruction,
        temperature: req.temperature ?? (req.tier === 'TIER_3_DEEP' ? 0.2 : 0.7),
        maxOutputTokens: req.maxTokens || 600,
      };

      if (req.responseMimeType) {
        config.responseMimeType = req.responseMimeType;
      }

      const response = await ai.models.generateContent({
        model,
        contents: req.prompt,
        config: config as any,
      });

      geminiCircuitBreaker.recordSuccess();

      const outputText = response.text || '';
      const durationMs = Date.now() - startTime;
      const cost = req.tier === 'TIER_3_DEEP' ? 0.005 : 0.001;

      return {
        text: outputText,
        tierUsed: req.tier,
        estimatedCostEur: cost,
        tokensConsumed: Math.round(outputText.length / 4) + 120,
        durationMs,
      };
    } catch (err: unknown) {
      geminiCircuitBreaker.recordFailure(err);
      logger.error('model_router', 'generation_error', `Model generation failed: ${String(err)}`);
      throw err;
    }
  }
}

export const modelRouter = new ModelRouter();
