import React, { useState } from 'react';
import { 
  SwarmAgent, 
  AgentCluster, 
  AgentStatus, 
  SwarmLog 
} from '../types';
import { 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  Activity, 
  ArrowRight,
  ShieldCheck,
  Terminal,
  Zap,
  RefreshCw
} from 'lucide-react';
import { runSwarmAgentTask } from '../services/geminiService';

interface SwarmCanvasProps {
  agents: SwarmAgent[];
  setAgents: React.Dispatch<React.SetStateAction<SwarmAgent[]>>;
  logs: SwarmLog[];
  addLog: (level: 'info' | 'warn' | 'error' | 'success', agentName: string, agentId: string, message: string, dataSnippet?: string) => void;
}

export const SwarmCanvas: React.FC<SwarmCanvasProps> = ({
  agents,
  setAgents,
  logs,
  addLog,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<SwarmAgent | null>(null);
  const [runningAgentId, setRunningAgentId] = useState<string | null>(null);
  const [customTaskPrompt, setCustomTaskPrompt] = useState<string>('');

  const clusterTitles: Record<AgentCluster, { name: string; desc: string; badge: string }> = {
    [AgentCluster.STRATEGY]: {
      name: 'Fase 1: Strategie & Specs',
      desc: 'Marktonderzoek & onbreekbare PRD specificaties',
      badge: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    },
    [AgentCluster.BUILD]: {
      name: 'Fase 2: Engineering & QA',
      desc: 'Next.js, Supabase code & Security Critic Gatekeeper',
      badge: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
    },
    [AgentCluster.OPS]: {
      name: 'Fase 3: Ops, Growth & Run',
      desc: 'Autonome SEO marketing, Stripe & 24/7 retentie support',
      badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    },
  };

  const executeAgent = async (agent: SwarmAgent, userPrompt?: string) => {
    setRunningAgentId(agent.id);
    
    // Update agent status to RUNNING
    setAgents(prev =>
      prev.map(a => (a.id === agent.id ? { ...a, status: AgentStatus.RUNNING } : a))
    );

    addLog('info', agent.name, agent.id, `Taak gestart: ${userPrompt || 'Autonome state cycle executie'}`);

    try {
      const promptToUse = userPrompt || `Voer je primaire richtlijn uit voor MKB project LocalRepute AI. Valideer inputs en lever concrete output op.`;
      const result = await runSwarmAgentTask(agent.name, agent.directive, promptToUse);

      const timestamp = new Date().toLocaleTimeString('nl-NL');

      // Update state
      setAgents(prev =>
        prev.map(a =>
          a.id === agent.id
            ? {
                ...a,
                status: AgentStatus.SUCCESS,
                executionCount: a.executionCount + 1,
                lastOutput: result,
                lastExecutionTime: timestamp,
              }
            : a
        )
      );

      // If this agent is selected, update it
      setSelectedAgent(prev =>
        prev && prev.id === agent.id
          ? {
              ...prev,
              status: AgentStatus.SUCCESS,
              executionCount: prev.executionCount + 1,
              lastOutput: result,
              lastExecutionTime: timestamp,
            }
          : prev
      );

      addLog('success', agent.name, agent.id, `Taak succesvol voltooid (${agent.outputFormat})`, result.slice(0, 140) + '...');
    } catch (err: any) {
      setAgents(prev =>
        prev.map(a => (a.id === agent.id ? { ...a, status: AgentStatus.FAILED } : a))
      );
      addLog('error', agent.name, agent.id, `Executiefout: ${err?.message || 'Onbekende fout'}`);
    } finally {
      setRunningAgentId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: State Machine Pipeline Overview */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              State Machine Architectuur
            </span>
            <span className="text-xs text-slate-400">Hierarchical LangGraph / CrewAI Protocol</span>
          </div>
          <h2 className="text-lg font-bold text-white">Project LevelPlay: Autonoom Swarm Netwerk</h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
            Strikte invoer- en uitvoerspecificaties. De CEO / Orchestrator bewaakt de status en budgetlimiet. 
            Elke agent levert deterministische outputs via modulaire tools.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <div className="text-center px-2">
            <div className="text-lg font-bold text-indigo-400 font-mono">
              {agents.reduce((acc, a) => acc + a.executionCount, 0)}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Loops Voltooid</div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-center px-2">
            <div className="text-lg font-bold text-emerald-400 font-mono">
              {agents.filter(a => a.status === AgentStatus.SUCCESS || a.status === AgentStatus.IDLE).length} / {agents.length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Agents Actief</div>
          </div>
        </div>
      </div>

      {/* Grid of Clusters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[AgentCluster.STRATEGY, AgentCluster.BUILD, AgentCluster.OPS].map(clusterKey => {
          const clusterConfig = clusterTitles[clusterKey];
          const clusterAgents = agents.filter(a => a.cluster === clusterKey);

          return (
            <div
              key={clusterKey}
              className="flex flex-col bg-slate-900/60 rounded-2xl border border-slate-800/80 p-4 relative"
            >
              {/* Cluster Header */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
                <div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${clusterConfig.badge}`}>
                    {clusterConfig.name}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">{clusterConfig.desc}</p>
                </div>
              </div>

              {/* Agent Cards */}
              <div className="space-y-3 flex-1">
                {clusterAgents.map(agent => {
                  const isRunning = runningAgentId === agent.id;
                  const isCurrentSelected = selectedAgent?.id === agent.id;

                  return (
                    <div
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isCurrentSelected
                          ? 'border-indigo-500 bg-indigo-950/20 shadow-md shadow-indigo-500/10'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-white tracking-wide">
                              {agent.name}
                            </span>
                            {agent.id === 'critic' && (
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" title="Gatekeeper: Beoordeelt alle pull requests" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {agent.role}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center">
                          {isRunning ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                              Draait
                            </span>
                          ) : agent.status === AgentStatus.SUCCESS ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Ready
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400">
                              <Clock className="w-2.5 h-2.5" />
                              Standby
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Directive & Tool tags */}
                      <p className="text-[11px] text-slate-300 italic mt-2 line-clamp-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                        "{agent.directive}"
                      </p>

                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/50">
                        <div className="flex flex-wrap gap-1">
                          {agent.tools.slice(0, 2).map((t, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">
                              {t}
                            </span>
                          ))}
                          {agent.tools.length > 2 && (
                            <span className="text-[9px] px-1 py-0.5 bg-slate-800 text-slate-400 rounded">
                              +{agent.tools.length - 2}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            executeAgent(agent);
                          }}
                          disabled={isRunning}
                          className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-all"
                        >
                          <Play className="w-2.5 h-2.5" />
                          <span>Run</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Inspector and Live Swarm Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Inspector & Interactive Trigger */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Agent Inspector & Live Directieve</h3>
              </div>
              {selectedAgent && (
                <span className="text-xs font-mono text-slate-400">
                  Executies: {selectedAgent.executionCount} | Laatst: {selectedAgent.lastExecutionTime || 'Nog niet'}
                </span>
              )}
            </div>

            {selectedAgent ? (
              <div className="space-y-4 mt-3">
                <div>
                  <h4 className="text-xs font-semibold text-white">{selectedAgent.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedAgent.role}</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">Output Template / File:</span>{' '}
                    <code className="text-indigo-400 font-mono">{selectedAgent.outputFormat}</code>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">Actieve Tools:</span>{' '}
                    <span className="text-slate-300">{selectedAgent.tools.join(', ')}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">Strikte Directieve:</span>{' '}
                    <span className="text-slate-200 italic">"{selectedAgent.directive}"</span>
                  </div>
                </div>

                {/* Custom Task Input */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Opdracht / Prompt voor deze agent (optioneel):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`bijv. Analyseer review trends voor tandartsen in Rotterdam...`}
                      value={customTaskPrompt}
                      onChange={(e) => setCustomTaskPrompt(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => executeAgent(selectedAgent, customTaskPrompt)}
                      disabled={runningAgentId === selectedAgent.id}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium disabled:opacity-50"
                    >
                      {runningAgentId === selectedAgent.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Zap className="w-3.5 h-3.5" />
                      )}
                      <span>Execute</span>
                    </button>
                  </div>
                </div>

                {/* Last Output Viewer */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Laatst Gegenereerde Output / Artefact:
                  </label>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-56 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap">
                    {selectedAgent.lastOutput || (
                      <span className="text-slate-500 italic">Nog geen output gegenereerd. Klik op 'Execute' om Gemini deze agent te laten draaien.</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 text-xs">
                Selecteer een agent hierboven om diens specifieke directieven, tools en live output te bekijken.
              </div>
            )}
          </div>
        </div>

        {/* Real-time Swarm Terminal Logs */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Live Orchestrator State Stream</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              STREAMS_OK
            </span>
          </div>

          <div className="mt-3 flex-1 bg-slate-950 rounded-xl border border-slate-800/90 p-3 font-mono text-[11px] overflow-y-auto max-h-[380px] space-y-2">
            {logs.length === 0 ? (
              <div className="text-slate-500 italic">Geen logs geregistreerd.</div>
            ) : (
              logs.map(log => {
                const colorMap = {
                  info: 'text-blue-400',
                  warn: 'text-amber-400',
                  error: 'text-rose-400',
                  success: 'text-emerald-400',
                };

                return (
                  <div key={log.id} className="border-b border-slate-900 pb-1.5 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{log.timestamp}</span>
                      <span className={`font-semibold ${colorMap[log.level]}`}>[{log.level.toUpperCase()}]</span>
                      <span className="text-indigo-300">[{log.agentName}]:</span>
                      <span className="text-slate-300">{log.message}</span>
                    </div>
                    {log.dataSnippet && (
                      <div className="mt-1 pl-4 text-slate-400 text-[10px] bg-slate-900/50 p-1.5 rounded border border-slate-800">
                        {log.dataSnippet}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
