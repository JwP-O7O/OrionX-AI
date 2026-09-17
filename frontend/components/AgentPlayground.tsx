import React, { useState } from 'react';
import { SwarmAgent } from '../types';
import { runSwarmAgentTask } from '../services/geminiService';
import { 
  Terminal, 
  Send, 
  RefreshCw, 
  Copy, 
  Check, 
  Code2, 
  Search, 
  ShieldCheck, 
  TrendingUp, 
  LifeBuoy,
  FileCheck
} from 'lucide-react';

interface AgentPlaygroundProps {
  agents: SwarmAgent[];
}

// Helper to safely copy text even under restricted iframe permissions
async function safeCopyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    // Ignore and fallback below
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (e) {
    console.warn('Fallback clipboard copy failed:', e);
    return false;
  }
}

export const AgentPlayground: React.FC<AgentPlaygroundProps> = ({ agents }) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || 'market_intel');
  const [promptInput, setPromptInput] = useState<string>(
    'Analyseer de markt voor lokale fysiotherapeuten in Den Haag. Waar laten grote ketens steken vallen?'
  );
  const [output, setOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const activeAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  const handleRunAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput || isLoading) return;

    setIsLoading(true);
    setOutput('');

    try {
      const res = await runSwarmAgentTask(
        activeAgent.name,
        activeAgent.directive,
        promptInput
      );
      setOutput(res);
    } catch (err: any) {
      setOutput(`Fout bij uitvoering: ${err?.message || 'Onbekende fout'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Safe copy handler with fallback
  const handleCopy = async () => {
    if (!output) return;
    await safeCopyToClipboard(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const quickPresets: Record<string, string> = {
    market_intel: 'Analyseer review gaten voor bakkers & banketbakkers in Amsterdam. Geef top 3 pijnpunten.',
    spec_agent: 'Genereer product_spec.json voor de LocalRepute WhatsApp review-invite pipeline met acceptatiecriteria.',
    coder_backend: 'Schrijf de Next.js App Router route handler voor POST /api/webhooks/stripe met handtekeningverificatie.',
    critic: 'Audit deze pseudo-code op hardcoded secrets, infinite loops en rate limits:\nasync function syncReviews() { while(true) { await fetchReviews(); } }',
    growth_seo: 'Genereer een B2B vergelijkingsartikel: "Waarom een lokale garage wint van kwik-fit met slimme reviews".',
    support_agent: 'Klant overweegt opzegging wegens kosten van €49/mnd. Pas retentiebeleid toe conform masterplan.',
  };

  return (
    <div className="space-y-6">
      {/* Playground Header */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">Agent Execution Sandbox</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Test elke Swarm Agent individueel via Gemini 2.5 Flash. Pas directieve en doelstelling aan en observeer deterministische outputs.
        </p>
      </div>

      {/* Select Agent Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {agents.map((agent) => {
          const isSelected = agent.id === selectedAgentId;
          return (
            <button
              key={agent.id}
              onClick={() => {
                setSelectedAgentId(agent.id);
                if (quickPresets[agent.id]) {
                  setPromptInput(quickPresets[agent.id]);
                }
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold text-xs tracking-tight">{agent.name.split(':')[0]}</div>
              <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{agent.name.split(':')[1] || agent.role}</div>
            </button>
          );
        })}
      </div>

      {/* Main Terminal View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Form and Directive */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">Actieve Agent</span>
              <h3 className="text-sm font-bold text-white">{activeAgent.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{activeAgent.role}</p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] font-mono text-slate-400 block mb-1">Vastgelegde Directieve:</span>
              <p className="text-xs text-slate-300 italic">"{activeAgent.directive}"</p>
              <div className="mt-2 text-[10px] font-mono text-indigo-400">
                Verwachte Output: {activeAgent.outputFormat}
              </div>
            </div>

            <form onSubmit={handleRunAgent} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Opdracht / Input voor {activeAgent.name}:
                </label>
                <textarea
                  rows={5}
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="Voer de taak voor de agent in..."
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Aangestuurd via Gemini 2.5 Flash</span>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs disabled:opacity-50 transition-all shadow-md shadow-indigo-500/20"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Agent voert uit...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Activeer Agent</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Output Screen */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Gegenereerd Resultaat</h3>
            </div>
            {output && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Gekopieerd' : 'Kopieer'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs text-slate-200 overflow-y-auto max-h-[460px] whitespace-pre-wrap">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-400 mb-2" />
                <span className="text-xs">Agent syntheseert data conform directives...</span>
              </div>
            ) : output ? (
              output
            ) : (
              <div className="text-slate-500 italic py-20 text-center">
                Selecteer een agent en klik op "Activeer Agent" om live output te genereren.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
