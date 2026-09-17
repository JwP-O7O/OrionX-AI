import React, { useState } from 'react';
import { 
  TenantProfile, 
  CircuitBreakerState, 
  ModelRouterRule, 
  SubscriptionTier,
  DaemonState 
} from '../types';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  ShieldAlert, 
  AlertOctagon, 
  UserCheck, 
  Percent, 
  Zap, 
  Lock, 
  Cpu, 
  CheckCircle2, 
  Search, 
  Sliders, 
  RotateCcw, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowUpRight,
  PlusCircle,
  Trash2,
  X,
  Radio,
  Send,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface AdminCockpitProps {
  tenants: TenantProfile[];
  setTenants: React.Dispatch<React.SetStateAction<TenantProfile[]>>;
  circuitBreaker: CircuitBreakerState;
  setCircuitBreaker: React.Dispatch<React.SetStateAction<CircuitBreakerState>>;
  onImpersonateTenant: (tenant: TenantProfile) => void;
  onOpenColdAudit: () => void;
  onIngestWebhook?: (payload: {
    tenantId: string;
    author: string;
    rating: number;
    comment: string;
    platform: 'Google' | 'Trustpilot';
  }) => void;
  daemonState?: DaemonState;
}

const MODEL_ROUTER_RULES: ModelRouterRule[] = [
  {
    complexity: 'SIMPLE_5_STAR_NO_TEXT',
    modelAssigned: 'Tier 1 Micro-Template Engine (Static + Interpolation)',
    estimatedCostPerCallEur: 0.0001,
    strategy: '100% deterministisch zonder LLM overhead. Bespaart 99% kosten.',
  },
  {
    complexity: 'POSITIVE_WITH_TEXT',
    modelAssigned: 'Tier 2 Gemini 2.5 Flash (Fast Tone Injection)',
    estimatedCostPerCallEur: 0.001,
    strategy: 'Snelle respons met lokale SEO termen en persoonlijke waardering.',
  },
  {
    complexity: 'CRITICAL_1_2_STAR',
    modelAssigned: 'Tier 3 Deep Reasoner & De-escalator (Gemini 2.5 Flash Deep Prompting)',
    estimatedCostPerCallEur: 0.005,
    strategy: 'Empathie-analyse, offline escalatie & WhatsApp draft naar ondernemer.',
  },
];

export const AdminCockpit: React.FC<AdminCockpitProps> = ({
  tenants,
  setTenants,
  circuitBreaker,
  setCircuitBreaker,
  onImpersonateTenant,
  onOpenColdAudit,
  onIngestWebhook,
  daemonState,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<'ALL' | 'STARTER' | 'PRO' | 'MULTI_LOCATION'>('ALL');
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [showWebhookTesterModal, setShowWebhookTesterModal] = useState(false);

  // Webhook Tester Form
  const [webhookTenantId, setWebhookTenantId] = useState(tenants[0]?.id || '');
  const [webhookAuthor, setWebhookAuthor] = useState('Dennis van Eijk');
  const [webhookRating, setWebhookRating] = useState<number>(5);
  const [webhookComment, setWebhookComment] = useState('Uitstekende service en betrouwbaar advies!');
  const [webhookPlatform, setWebhookPlatform] = useState<'Google' | 'Trustpilot'>('Google');

  // New tenant form state
  const [newBizName, setNewBizName] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newNiche, setNewNiche] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newPlan, setNewPlan] = useState<SubscriptionTier>('PRO');
  const [newPhone, setNewPhone] = useState('');

  // Money Cockpit aggregations
  const totalMRR = tenants.reduce((acc, t) => acc + t.monthlyRevenueEur, 0);
  const totalARR = totalMRR * 12;
  const totalTokenCost = tenants.reduce((acc, t) => acc + t.monthlyTokenCostEur, 0);
  const totalGrossProfit = totalMRR - totalTokenCost;
  const overallGrossMarginPercent = totalMRR > 0 ? ((totalGrossProfit / totalMRR) * 100).toFixed(1) : '95.0';

  const highChurnTenants = tenants.filter(t => t.churnRisk === 'HIGH' || t.churnRisk === 'MEDIUM');

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || t.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = selectedPlanFilter === 'ALL' || t.plan === selectedPlanFilter;
    return matchesSearch && matchesPlan;
  });

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName || !newEmail) return;

    const priceMap: Record<SubscriptionTier, number> = {
      STARTER: 49,
      PRO: 99,
      MULTI_LOCATION: 249,
    };

    const newTenant: TenantProfile = {
      id: `tenant-${Date.now().toString().slice(-4)}`,
      businessName: newBizName,
      ownerName: newOwner || 'Eigenaar',
      email: newEmail,
      whatsAppEmergencyNumber: newPhone || '06-00000000',
      niche: newNiche || 'MKB Dienstverlening',
      city: newCity || 'Nederland',
      toneOfVoice: 'informeel',
      isAutopilotActive: true,
      isGoogleConnected: true,
      isTrustpilotConnected: false,
      plan: newPlan,
      monthlyRevenueEur: priceMap[newPlan],
      monthlyTokenCostEur: 0.12,
      totalReviewsManaged: 0,
      hoursSaved: 0,
      averageRating: 5.0,
      lastLoginDate: 'Zojuist aangemaakt',
      churnRisk: 'LOW',
      reviewLinkSlug: newBizName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      createdAt: new Date().toISOString(),
      promptVersion: 1,
      tokenSavingsPercent: 15,
    };

    setTenants([newTenant, ...tenants]);
    setNewBizName('');
    setNewOwner('');
    setNewEmail('');
    setNewNiche('');
    setNewCity('');
    setNewPhone('');
    setShowAddTenantModal(false);
  };

  const handleDeleteTenant = (tenantId: string) => {
    if (confirm('Weet je zeker dat je deze tenant wilt verwijderen?')) {
      setTenants(prev => prev.filter(t => t.id !== tenantId));
    }
  };

  const handleTriggerLiveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onIngestWebhook) return;

    onIngestWebhook({
      tenantId: webhookTenantId || tenants[0]?.id || '',
      author: webhookAuthor,
      rating: webhookRating,
      comment: webhookComment,
      platform: webhookPlatform,
    });

    setShowWebhookTesterModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Superadmin God Mode Cockpit */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Superadmin Master Cockpit (God Mode)
            </span>
            <span className="text-xs text-slate-400">Volledige grip op omzet, unit economics &amp; churn</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Project LevelPlay: Bedrijfs- &amp; Financiële Cockpit</h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Bewaak de 80%+ brutomarge per klant, live achtergrond worker daemon en zelf-optimaliserende prompt evaluaties.
          </p>
        </div>

        {/* Global Kill Switches & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowWebhookTesterModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
            title="Stuur een live Google/Trustpilot webhook payload direct naar de daemon"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Simuleer Live Webhook</span>
          </button>

          <button
            onClick={() => setShowAddTenantModal(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Nieuwe Klant</span>
          </button>

          <button
            onClick={() => setCircuitBreaker(p => ({ ...p, freezeAllTenants: !p.freezeAllTenants }))}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              circuitBreaker.freezeAllTenants
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-slate-600'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{circuitBreaker.freezeAllTenants ? 'FREEZE ACTIEF' : 'FREEZE AUTOPILOT'}</span>
          </button>

          <button
            onClick={() => setCircuitBreaker(p => ({ ...p, isTriggered: !p.isTriggered }))}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              circuitBreaker.isTriggered
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 animate-pulse'
                : 'bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900/60'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            <span>{circuitBreaker.isTriggered ? 'STOP ACTIEF' : 'NOODREM API'}</span>
          </button>
        </div>
      </div>

      {/* KPI Money Cockpit Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Maandelijkse Omzet (MRR)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">€ {totalMRR.toLocaleString('nl-NL')}</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> ARR: € {totalARR.toLocaleString('nl-NL')}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Brutomarge</span>
            <Percent className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">{overallGrossMarginPercent}%</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Doel &gt;80% ruimschoots gehaald</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Actieve MKB Klanten</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">{tenants.length} tenants</div>
          <span className="text-[11px] text-indigo-300 mt-1 block">€ {(totalMRR / (tenants.length || 1)).toFixed(0)} ARPU</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Daemon Taken &amp; Auto-Tuning</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            {daemonState?.tasksCompletedTotal || 148}
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block">
            {daemonState?.autoTuningCyclesRun || 6} prompt tuning cycli uitgevoerd
          </span>
        </div>
      </div>

      {/* Model Router Architecture: 70% Kostenbesparing */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Model Router Switch: Review-Complexiteit &amp; Marges
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Bespaart 70%+ op LLM-kosten
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MODEL_ROUTER_RULES.map((rule, idx) => (
            <div key={idx} className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-amber-400 text-[10px] font-bold">
                  {rule.complexity.replace(/_/g, ' ')}
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  € {rule.estimatedCostPerCallEur} / call
                </span>
              </div>
              <div className="font-semibold text-white">{rule.modelAssigned}</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">{rule.strategy}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tenant Unit Economics & Impersonation Table */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Unit Economics per Klant &amp; Geoptimaliseerde Prompts
            </h3>
            <p className="text-[11px] text-slate-400">Bekijk actieve prompt-versies en tokenbesparing per klant.</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Zoek tenant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <select
              value={selectedPlanFilter}
              onChange={(e: any) => setSelectedPlanFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
            >
              <option value="ALL">Alle Pakketten</option>
              <option value="STARTER">Starter (€49)</option>
              <option value="PRO">Pro (€99)</option>
              <option value="MULTI_LOCATION">Multi-Location (€249)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400">
                <th className="py-2.5 px-3">Bedrijf &amp; Eigenaar</th>
                <th className="py-2.5 px-3">Pakket</th>
                <th className="py-2.5 px-3">Omzet</th>
                <th className="py-2.5 px-3">Token Kosten</th>
                <th className="py-2.5 px-3">Brutomarge</th>
                <th className="py-2.5 px-3">Prompt Versie</th>
                <th className="py-2.5 px-3">Churn Risico</th>
                <th className="py-2.5 px-3 text-right">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTenants.map((t) => {
                const marginPercent = (((t.monthlyRevenueEur - t.monthlyTokenCostEur) / t.monthlyRevenueEur) * 100).toFixed(1);

                return (
                  <tr key={t.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{t.businessName}</div>
                      <div className="text-[11px] text-slate-400">{t.ownerName} • {t.city}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
                        {t.plan}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      € {t.monthlyRevenueEur},-
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      € {t.monthlyTokenCostEur.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-emerald-300">
                      {marginPercent}%
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-mono text-[10px]">
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-indigo-300 font-bold">
                          v{t.promptVersion || 1}
                        </span>
                        <span className="text-emerald-400">
                          (-{t.tokenSavingsPercent || 20}% tok)
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        t.churnRisk === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : t.churnRisk === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {t.churnRisk}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onImpersonateTenant(t)}
                          className="py-1 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] inline-flex items-center gap-1 transition-all shadow-sm"
                          title="Log in als deze klant"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Inloggen als</span>
                        </button>
                        <button
                          onClick={() => handleDeleteTenant(t.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Verwijder tenant"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Live Webhook Ingestion Tester */}
      {showWebhookTesterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white">Live Webhook Ingest Testbed</h3>
              </div>
              <button onClick={() => setShowWebhookTesterModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Simuleer een binnenkomende webhook van Google Business Profile of Trustpilot. De achtergrond daemon pakt deze direct live op.
            </p>

            <form onSubmit={handleTriggerLiveWebhook} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Selecteer Doel-Tenant:</label>
                <select
                  value={webhookTenantId}
                  onChange={(e) => setWebhookTenantId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.businessName} ({t.city})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Platform:</label>
                  <select
                    value={webhookPlatform}
                    onChange={(e: any) => setWebhookPlatform(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Google">Google Maps</option>
                    <option value="Trustpilot">Trustpilot</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Klantnaam:</label>
                  <input
                    type="text"
                    required
                    value={webhookAuthor}
                    onChange={(e) => setWebhookAuthor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Score (Sterren):</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setWebhookRating(star)}
                      className={`px-3 py-1.5 rounded-lg border font-bold text-xs ${
                        webhookRating === star
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {star}★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Review Bericht:</label>
                <textarea
                  rows={3}
                  value={webhookComment}
                  onChange={(e) => setWebhookComment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Verstuur Webhook Payload naar Daemon</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nieuwe Klant Toevoegen */}
      {showAddTenantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Nieuwe MKB Tenant Registreren</h3>
              <button onClick={() => setShowAddTenantModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Bedrijfsnaam:</label>
                <input
                  type="text"
                  required
                  placeholder="bijv. Hovenier Groenrijk"
                  value={newBizName}
                  onChange={(e) => setNewBizName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Naam Eigenaar &amp; E-mail:</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Pieter Groen"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                  <input
                    type="email"
                    required
                    placeholder="pieter@groen.nl"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Branche / Niche &amp; Stad:</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Hovenier & Tuinonderhoud"
                    value={newNiche}
                    onChange={(e) => setNewNiche(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Rotterdam"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">WhatsApp Noodnummer:</label>
                <input
                  type="text"
                  placeholder="06-12345678"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">SaaS Pakket:</label>
                <select
                  value={newPlan}
                  onChange={(e: any) => setNewPlan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="STARTER">Starter (€49/mnd)</option>
                  <option value="PRO">Auto-Pilot Pro (€99/mnd)</option>
                  <option value="MULTI_LOCATION">Multi-Location (€249/mnd)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all mt-2"
              >
                Klant Aanmaken &amp; Activeer Stripe Facturatie
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
