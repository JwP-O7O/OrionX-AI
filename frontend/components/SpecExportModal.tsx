import React, { useState } from 'react';
import { X, Copy, Check, FileDown, Terminal, Code2, Cpu } from 'lucide-react';

interface SpecExportModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export const SpecExportModal: React.FC<SpecExportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'dynamic_spec' | 'daemon_healer' | 'cron_evolution' | 'markdown'>('dynamic_spec');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const dynamicBusinessSpecJson = JSON.stringify({
    "$schema": "http://json-schema.org/draft-07/schema#",
    "project_id": "levelplay-localrepute",
    "version": "2.6.0",
    "last_autonomous_update": new Date().toISOString(),
    "guardrails": {
      "immutable_domain": "Local SMB Reputation & Review Automation",
      "target_gross_margin_min": 0.80,
      "max_monthly_llm_budget_eur": 150.00,
      "allowed_tech_stack": ["Next.js", "Supabase", "Tailwind", "Python", "Fastify"],
      "human_in_the_loop_required_for_pivots": true
    },
    "current_state": {
      "mrr": 2450.00,
      "active_tenants": 50,
      "churn_rate_30d": 0.018,
      "system_health_score": 0.994
    },
    "active_roadmap": [
      {
        "milestone_id": "M-01",
        "title": "Auth & Core Review Webhook",
        "status": "COMPLETED",
        "allocated_cluster": "CLUSTER_1",
        "source": "INITIAL_SPEC"
      },
      {
        "milestone_id": "M-02",
        "title": "Voice-to-Text Review Requests",
        "status": "IN_PROGRESS",
        "allocated_cluster": "CLUSTER_1",
        "source": "R_AND_D_AUTONOMOUS_PIVOT",
        "justification_ref": "DECISION_LOGS/ADR-003-voice-notes.md",
        "projected_roi_score": 8.7
      }
    ]
  }, null, 2);

  const daemonHealerPy = `#!/usr/bin/env python3
"""
daemon_healer.py — Background Incident Listener & Adversarial Sandbox Healer
Cluster 2: Dynamic Self-Healing Engine
"""
import time, json, requests
from e2b_code_interpreter import Sandbox

def listen_telemetry():
    print("[*] daemon_healer running: Polling Sentry/Telemetry webhooks...")
    while True:
        incident = poll_incident_queue()
        if incident:
            print(f"[!] CRITICAL: Handling {incident['error_type']} in {incident['service']}")
            
            # 1. Claim PRIORITY_HOTFIX lock on targeted file
            acquire_distributed_lock(incident["file_path"], priority="HOTFIX")
            
            # 2. Red Team writes independent failing test
            repro_test = generate_adversarial_test(incident)
            
            # 3. Code Surgeon patches in isolated E2B Sandbox
            with Sandbox() as sandbox:
                execution = sandbox.run_code(repro_test)
                assert execution.error is not None, "Reproduction test must fail initially!"
                
                # Apply code patch
                patch = generate_surgeon_patch(incident, repro_test)
                sandbox.files.write(incident["file_path"], patch)
                
                verify_run = sandbox.run_code(repro_test)
                if verify_run.error is None:
                    print("[✓] Self-Heal verified! Merging patch to staging...")
                    record_vector_runbook(incident, patch, confidence=0.96)
                    release_distributed_lock(incident["file_path"])
        time.sleep(1)

if __name__ == "__main__":
    listen_telemetry()
`;

  const cronEvolutionPy = `#!/usr/bin/env python3
"""
cron_evolution.py — Scheduled 00:00 UTC Strategic R&D Loop
Cluster 3: Auto-Research & Invariant Guard
"""
import json
from datetime import datetime

def daily_evolution_cycle():
    print(f"[*] cron_evolution triggered at {datetime.utcnow()} UTC")
    
    # 1. Scant Market & Support Churn Tickets
    market_signals = scan_reddit_and_support_churn()
    
    # 2. Bedenk innovatie hypotheses
    ideas = brainstorm_agent(market_signals)
    
    # 3. Test tegen ONONTKOOMBARE INVARIANTEN (Hard Constraints)
    spec = load_spec("DYNAMIC_BUSINESS_SPEC.json")
    for idea in ideas:
        if idea["domain"] != spec["guardrails"]["immutable_domain"]:
            print(f"[!] REJECTED: {idea['title']} violates immutable domain constraint.")
            continue
            
        if idea["roi_score"] >= 8.0:
            print(f"[✓] APPROVED: Injecting {idea['title']} into living roadmap...")
            branch = f"rd/proposal-{datetime.now().strftime('%Y-%m-%d')}"
            create_git_branch(branch, idea)
            update_living_plan(idea)

if __name__ == "__main__":
    daily_evolution_cycle()
`;

  const markdownContent = `# MASTER BEDRIJFS- EN SYSTEMENPLAN: PROJECT LEVELPLAY
Missie: Lokale MKB-ondernemingen laten concurreren via autonome AI-infrastructuur.
Bedrijfsmodel: Micro-SaaS (LocalRepute AI).
Architectuur: Zero-Touch Cybernetic State Machine.

## DE 4 CLUSTERS
1. Execution & Build Swarm (Next.js, Supabase, Stripe)
2. Repair & Debug (Adversarial Sandboxing & Vector Runbook Decay)
3. R&D & Brainstorm (Auto-Research met Onschendbare Invarianten)
4. Chronicler & Immutable Audit (/system_journal/)`;

  const getContent = () => {
    if (activeTab === 'dynamic_spec') return dynamicBusinessSpecJson;
    if (activeTab === 'daemon_healer') return daemonHealerPy;
    if (activeTab === 'cron_evolution') return cronEvolutionPy;
    return markdownContent;
  };

  // Safe copy handler with fallback
  const handleCopy = async () => {
    await safeCopyToClipboard(getContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Exporteer Swarm Specificaties &amp; Daemons</h3>
            <p className="text-xs text-slate-400">Direct inzetbaar in je Docker containers, E2B sandboxes en server</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-800 bg-slate-950/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dynamic_spec')}
            className={`px-3 py-1.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'dynamic_spec'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            DYNAMIC_BUSINESS_SPEC.json
          </button>
          <button
            onClick={() => setActiveTab('daemon_healer')}
            className={`px-3 py-1.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'daemon_healer'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            daemon_healer.py (Cluster 2)
          </button>
          <button
            onClick={() => setActiveTab('cron_evolution')}
            className={`px-3 py-1.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'cron_evolution'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            cron_evolution.py (Cluster 3)
          </button>
          <button
            onClick={() => setActiveTab('markdown')}
            className={`px-3 py-1.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'markdown'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ORCHESTRATOR_SPEC.md
          </button>
        </div>

        {/* Content Box */}
        <div className="p-5 flex-1 overflow-y-auto">
          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
            {getContent()}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950/80">
          <span className="text-[11px] text-slate-400">Koppel E2B SDK &amp; ChromaDB voor zero-human operations</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Gekopieerd!' : 'Kopieer Bestand'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
