import React, { useState } from 'react';
import { TenantProfile, LocalReview, SubscriptionTier } from '../types';
import { generateSmartRoutedReviewReply, generateAntiGatingReviewInvite } from '../services/geminiService';
import { 
  Star, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Copy, 
  Check, 
  QrCode, 
  MessageSquare, 
  Sparkles, 
  Smartphone, 
  AlertTriangle, 
  ArrowRight, 
  Edit3, 
  Power, 
  Share2, 
  ShieldCheck, 
  Send, 
  Building, 
  RefreshCw, 
  ExternalLink,
  PlusCircle,
  CreditCard,
  X
} from 'lucide-react';

interface ClientPortalProps {
  tenant: TenantProfile;
  setTenant: React.Dispatch<React.SetStateAction<TenantProfile>>;
  reviews: LocalReview[];
  setReviews: React.Dispatch<React.SetStateAction<LocalReview[]>>;
  onOpenUpgradeModal?: () => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
  tenant,
  setTenant,
  reviews,
  setReviews,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showIncomingModal, setShowIncomingModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editedResponseText, setEditedResponseText] = useState('');
  
  // WhatsApp Preview Drawer
  const [showWhatsAppSimulator, setShowWhatsAppSimulator] = useState(false);
  const [whatsAppSimStep, setWhatsAppSimStep] = useState<'ALERT_RECEIVED' | 'CONFIRMED' | 'WEEKLY_DIGEST'>('ALERT_RECEIVED');

  // New Live Ingested Review Form
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isProcessingLiveReview, setIsProcessingLiveReview] = useState(false);

  const reviewUrl = `https://g.page/r/${tenant.reviewLinkSlug}/review`;
  const compliantInvite = generateAntiGatingReviewInvite(tenant.businessName, reviewUrl, tenant.toneOfVoice);

  const tenantReviews = reviews.filter(r => r.tenantId === tenant.id || !r.tenantId);

  // Toggle Autopilot
  const handleToggleAutopilot = () => {
    setTenant(prev => ({
      ...prev,
      isAutopilotActive: !prev.isAutopilotActive,
    }));
  };

  // Copy review link
  const handleCopyReviewLink = () => {
    navigator.clipboard.writeText(reviewUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Copy Anti-Gating WhatsApp text
  const handleCopyCompliantText = () => {
    navigator.clipboard.writeText(compliantInvite.compliantMessage);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Save manual edit
  const handleSaveEdit = (reviewId: string) => {
    setReviews(prev =>
      prev.map(r => (r.id === reviewId ? { ...r, autoResponse: editedResponseText } : r))
    );
    setEditingReviewId(null);
  };

  // Live Process new review from Google Business Profile Webhook
  const handleIngestLiveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim()) return;

    setIsProcessingLiveReview(true);
    try {
      const result = await generateSmartRoutedReviewReply({
        author: newReviewAuthor,
        businessName: tenant.businessName,
        rating: newReviewRating,
        comment: newReviewComment,
        tone: tenant.toneOfVoice,
        nicheSpecialty: tenant.niche,
        emergencyContact: tenant.whatsAppEmergencyNumber,
      });

      const newReview: LocalReview = {
        id: `rev-${Date.now().toString().slice(-4)}`,
        tenantId: tenant.id,
        author: newReviewAuthor,
        businessName: tenant.businessName,
        platform: 'Google',
        rating: newReviewRating,
        comment: newReviewComment.trim() || '(Geen geschreven toelichting)',
        date: 'Zojuist via Google API',
        sentiment: result.sentiment as any,
        status: result.escalationRequired ? 'escalated_to_owner' : 'auto_replied',
        autoResponse: result.response,
        repliedAt: result.escalationRequired ? 'Concept opgesteld • WhatsApp alert naar eigenaar' : 'Binnen 3 minuten autonoom geplaatst',
        routerTierUsed: result.routerTierUsed,
        tokenCostEur: result.tokenCostEur,
      };

      setReviews([newReview, ...reviews]);
      setTenant(prev => ({
        ...prev,
        totalReviewsManaged: prev.totalReviewsManaged + 1,
        hoursSaved: Number((prev.hoursSaved + 0.25).toFixed(1)),
        monthlyTokenCostEur: Number((prev.monthlyTokenCostEur + (result.tokenCostEur || 0.001)).toFixed(3)),
      }));

      if (result.escalationRequired) {
        setShowWhatsAppSimulator(true);
        setWhatsAppSimStep('ALERT_RECEIVED');
      }

      setNewReviewAuthor('');
      setNewReviewComment('');
      setShowIncomingModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingLiveReview(false);
    }
  };

  const handlePlanUpgrade = (tier: SubscriptionTier, price: number) => {
    setTenant(prev => ({
      ...prev,
      plan: tier,
      monthlyRevenueEur: price,
    }));
    setShowUpgradeModal(false);
  };

  return (
    <div className="space-y-6">
      {/* 90-Second Onboarding Prompt Banner if not fully setup */}
      {!tenant.isGoogleConnected && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Welkom bij LocalRepute AI! Koppel je profiel in &lt; 90 seconden</h3>
              <p className="text-xs text-slate-300">Verbind éénmalig met Google en de AI doet vanaf dan al het zware werk.</p>
            </div>
          </div>
          <button
            onClick={() => setShowOnboarding(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shrink-0"
          >
            Start 90-sec Setup
          </button>
        </div>
      )}

      {/* Top Header: Bedrijfsnaam + Score + Grote Autopilot Switch + Live Ingest */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
            {tenant.businessName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight">{tenant.businessName}</h2>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all flex items-center gap-1"
              >
                <span>Pakket: {tenant.plan}</span>
                <span className="underline">Upgrade</span>
              </button>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
              <div className="flex items-center gap-1 font-bold text-white">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{tenant.averageRating.toFixed(1)} / 5.0</span>
              </div>
              <span>•</span>
              <span>{tenant.niche} ({tenant.city})</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Google Sync Live
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls: Live Ingest + Autopilot Switch */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowIncomingModal(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nieuwe Review Invoeren</span>
          </button>

          <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
            <div className="text-right">
              <div className="text-xs font-bold text-white">
                {tenant.isAutopilotActive ? 'AUTOPILOT AAN' : 'AUTOPILOT UIT'}
              </div>
              <p className="text-[10px] text-slate-400">
                {tenant.isAutopilotActive ? '&lt; 5 min reactie' : 'Handmatig'}
              </p>
            </div>
            <button
              onClick={handleToggleAutopilot}
              className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                tenant.isAutopilotActive ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                  tenant.isAutopilotActive ? 'translate-x-6 text-emerald-600' : 'translate-x-0 text-slate-400'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* De 3 Kernkaarten (Oma-test compliant: Geen jargon, puur resultaat) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Kaart 1: Tijd Bespaard */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-white">Tijd Bespaard door AI</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-white font-mono">{tenant.hoursSaved} uur</div>
            <p className="text-xs text-slate-300 mt-1">
              Deze maand heeft de AI <strong className="text-emerald-400">{tenant.totalReviewsManaged} reviews</strong> autonoom afgehandeld.
            </p>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span>Uurtarief MKB € 65,-</span>
            <span className="font-bold text-emerald-400">≈ € {(tenant.hoursSaved * 65).toFixed(0)} bespaard</span>
          </div>
        </div>

        {/* Kaart 2: Slimme 1-Klik Review Link Generator */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-white">Slimme Klant Review-Link</span>
            <Share2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2 space-y-2">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono truncate">
              {reviewUrl}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyReviewLink}
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Gekopieerd!' : 'Kopieer Link'}</span>
              </button>
              <button
                onClick={() => setShowQrModal(true)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Download QR code voor op de balie of factuur"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR</span>
              </button>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between border-t border-slate-800/80">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Google Beleid Compliant
            </span>
            <button onClick={handleCopyCompliantText} className="text-indigo-400 hover:underline">
              Kopieer WhatsApp Tekst
            </button>
          </div>
        </div>

        {/* Kaart 3: WhatsApp First Escalatie & Wekelijks Rapport */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-white">WhatsApp-First Alerts</span>
            <Smartphone className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-3">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{tenant.whatsAppEmergencyNumber}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">Actief</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Bij 1-3 sterren reviews stuurt de AI een WhatsAppje. Jij hoeft alleen met <strong className="text-white">'JA'</strong> te antwoorden.
            </p>
          </div>
          <button
            onClick={() => {
              setShowWhatsAppSimulator(true);
              setWhatsAppSimStep('WEEKLY_DIGEST');
            }}
            className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open WhatsApp Simulator</span>
          </button>
        </div>
      </div>

      {/* Recente Reacties Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Live Review Feed &amp; Geplaatste Reacties</h3>
          </div>
          <span className="text-xs text-slate-400">Totaal beheerd: {tenantReviews.length} recensies</span>
        </div>

        <div className="space-y-4">
          {tenantReviews.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs space-y-2">
              <MessageSquare className="w-6 h-6 mx-auto text-slate-600" />
              <p>Nog geen reviews geregistreerd voor dit bedrijf.</p>
              <button
                onClick={() => setShowIncomingModal(true)}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-semibold"
              >
                Voer eerste review in
              </button>
            </div>
          ) : (
            tenantReviews.map((rev) => {
              const isEditing = editingReviewId === rev.id;
              const isEscalated = rev.status === 'escalated_to_owner';

              return (
                <div
                  key={rev.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isEscalated
                      ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Review Top Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{rev.author}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {rev.platform}
                        </span>
                        <span className="text-xs text-slate-500">{rev.date}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      {isEscalated ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          Escalatie Alert (1-2★)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Geautomatiseerd Beantwoord
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Customer Review Body */}
                  <p className="text-xs text-slate-200 mt-2.5 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 font-sans">
                    "{rev.comment}"
                  </p>

                  {/* AI Response Block */}
                  {rev.autoResponse && (
                    <div className="mt-3 pl-3 border-l-2 border-indigo-500 bg-indigo-950/20 p-3 rounded-r-xl border-y border-r border-indigo-500/20 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          <span>LocalRepute AI Reactie:</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">{rev.repliedAt}</span>
                          {!isEditing && (
                            <button
                              onClick={() => {
                                setEditingReviewId(rev.id);
                                setEditedResponseText(rev.autoResponse || '');
                              }}
                              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded transition-colors"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Bewerk</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            rows={3}
                            value={editedResponseText}
                            onChange={(e) => setEditedResponseText(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => setEditingReviewId(null)}
                              className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs"
                            >
                              Annuleren
                            </button>
                            <button
                              onClick={() => handleSaveEdit(rev.id)}
                              className="px-3 py-1 rounded bg-emerald-600 text-white font-semibold text-xs"
                            >
                              Opslaan &amp; Updaten op Google
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {rev.autoResponse}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal: Nieuwe Review Invoeren (Direct Ingest) */}
      {showIncomingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Nieuwe Review Invoeren</h3>
              </div>
              <button onClick={() => setShowIncomingModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleIngestLiveReview} className="space-y-3">
              <div>
                <label className="block text-slate-300 text-xs font-medium mb-1">Klantnaam:</label>
                <input
                  type="text"
                  required
                  placeholder="bijv. Kees van Veen"
                  value={newReviewAuthor}
                  onChange={(e) => setNewReviewAuthor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-medium mb-1">Waardering (Sterren):</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewReviewRating(star)}
                      className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= newReviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono text-slate-300 ml-2">{newReviewRating} / 5</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-medium mb-1">Review Bericht (optioneel):</label>
                <textarea
                  rows={3}
                  placeholder="Laat leeg voor 5-sterren micro-template test, of voer een klacht in om de WhatsApp bot te triggeren..."
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessingLiveReview}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                {isProcessingLiveReview ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Gemini Model Router Verwerkt...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Verwerk via Model Router</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Plan Upgrade (Stripe Pricing) */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Upgrade je LocalRepute AI Abonnement</h3>
                <p className="text-xs text-slate-400">100% aftrekbare bedrijfskosten • Maandelijks opzegbaar</p>
              </div>
              <button onClick={() => setShowUpgradeModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Starter */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
                tenant.plan === 'STARTER' ? 'border-indigo-500 bg-indigo-950/20' : 'border-slate-800 bg-slate-950'
              }`}>
                <div>
                  <div className="text-xs font-bold text-white">Starter (Guard)</div>
                  <div className="text-2xl font-extrabold text-white mt-2 font-mono">€ 49,-</div>
                  <span className="text-[10px] text-slate-400 block mb-3">per maand excl. btw</span>
                  <ul className="text-[11px] text-slate-300 space-y-1.5">
                    <li>✓ 1 Google koppeling</li>
                    <li>✓ Tot 30 antwoorden/mnd</li>
                    <li>✓ Wekelijks rapport</li>
                  </ul>
                </div>
                <button
                  disabled={tenant.plan === 'STARTER'}
                  onClick={() => handlePlanUpgrade('STARTER', 49)}
                  className="w-full mt-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-white"
                >
                  {tenant.plan === 'STARTER' ? 'Huidig Pakket' : 'Kies Starter'}
                </button>
              </div>

              {/* Pro (Aanrader) */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between relative ${
                tenant.plan === 'PRO' ? 'border-emerald-500 bg-emerald-950/20' : 'border-emerald-500/40 bg-slate-950'
              }`}>
                <span className="absolute -top-2.5 right-4 bg-emerald-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow">
                  Aanrader
                </span>
                <div>
                  <div className="text-xs font-bold text-emerald-400">Auto-Pilot Pro</div>
                  <div className="text-2xl font-extrabold text-white mt-2 font-mono">€ 99,-</div>
                  <span className="text-[10px] text-slate-400 block mb-3">per maand excl. btw</span>
                  <ul className="text-[11px] text-slate-300 space-y-1.5">
                    <li>✓ Google + Trustpilot</li>
                    <li>✓ Onbeperkte reacties</li>
                    <li>✓ WhatsApp Escalatie-bot</li>
                    <li>✓ 50 WhatsApp credits</li>
                  </ul>
                </div>
                <button
                  disabled={tenant.plan === 'PRO'}
                  onClick={() => handlePlanUpgrade('PRO', 99)}
                  className="w-full mt-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-xs font-bold text-white shadow-md shadow-emerald-600/30"
                >
                  {tenant.plan === 'PRO' ? 'Huidig Pakket' : 'Activeer Pro'}
                </button>
              </div>

              {/* Multi-Location */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
                tenant.plan === 'MULTI_LOCATION' ? 'border-indigo-500 bg-indigo-950/20' : 'border-slate-800 bg-slate-950'
              }`}>
                <div>
                  <div className="text-xs font-bold text-white">Multi-Location</div>
                  <div className="text-2xl font-extrabold text-white mt-2 font-mono">€ 249,-</div>
                  <span className="text-[10px] text-slate-400 block mb-3">per maand excl. btw</span>
                  <ul className="text-[11px] text-slate-300 space-y-1.5">
                    <li>✓ Tot 5 vestigingen</li>
                    <li>✓ Multi-locatie dashboard</li>
                    <li>✓ Aangepaste tone-of-voice</li>
                  </ul>
                </div>
                <button
                  disabled={tenant.plan === 'MULTI_LOCATION'}
                  onClick={() => handlePlanUpgrade('MULTI_LOCATION', 249)}
                  className="w-full mt-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-white"
                >
                  {tenant.plan === 'MULTI_LOCATION' ? 'Huidig Pakket' : 'Kies Multi-Location'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal with SVG */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Printbare Google Review QR-Code</h3>
            <p className="text-xs text-slate-400">
              Plaats deze QR-code op je balie, factuur of visitekaartje. Klanten scannen en kunnen direct 1-klik beoordelen.
            </p>
            <div className="p-6 bg-white rounded-2xl inline-block mx-auto shadow-inner">
              <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none">
                <rect width="100" height="100" fill="white"/>
                <path d="M10 10h30v30h-30zM15 15v20h20v-20zM60 10h30v30h-30zM65 15v20h20v-20zM10 60h30v30h-30zM15 65v20h20v-20zM22 22h6v6h-6zM72 22h6v6h-6zM22 72h6v6h-6zM50 15h5v10h-5zM45 30h10v5h-10zM55 45h15v5h-15zM75 50h15v5h-15zM50 60h10v10h-10zM65 65h10v25h-10zM80 75h10v15h-10zM45 80h10v10h-10z" fill="#020617"/>
              </svg>
            </div>
            <div className="text-[11px] font-mono text-slate-300 bg-slate-950 p-2 rounded-lg break-all">
              {reviewUrl}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowQrModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Sluiten
              </button>
              <button
                onClick={() => {
                  alert(`Directe print-link geopend voor balie display: ${reviewUrl}`);
                  setShowQrModal(false);
                }}
                className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md"
              >
                Print Tafelkaartje
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp First Interactive Phone Simulator Modal */}
      {showWhatsAppSimulator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl flex flex-col">
            {/* Phone Top Notch */}
            <div className="bg-[#075e54] text-white p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/30 flex items-center justify-center font-bold text-xs">
                  LR
                </div>
                <div>
                  <div className="font-bold text-xs">LocalRepute AI Bot</div>
                  <div className="text-[9px] text-emerald-200">Online</div>
                </div>
              </div>
              <button onClick={() => setShowWhatsAppSimulator(false)} className="text-white text-xs opacity-75 hover:opacity-100">
                ✕
              </button>
            </div>

            {/* Chat Messages */}
            <div className="p-4 bg-[#0b141a] space-y-3 font-sans text-xs min-h-[320px] max-h-[420px] overflow-y-auto">
              <div className="bg-[#202c33] text-slate-200 p-3 rounded-2xl rounded-tl-none max-w-[85%] space-y-1.5 shadow">
                <div className="text-[11px] font-bold text-emerald-400">📅 Wekelijks Vrijdagochtend Rapport</div>
                <p className="text-[11px] leading-relaxed">
                  Goedemorgen {tenant.businessName}! 🚀<br />
                  Deze week hebben we <strong>8 reviews</strong> beantwoord. Je gemiddelde score steeg naar <strong>★ {tenant.averageRating.toFixed(1)}</strong>! Fijn weekend!
                </p>
                <div className="text-[9px] text-slate-400 text-right">09:00 ✓✓</div>
              </div>

              <div className="bg-[#202c33] text-slate-200 p-3 rounded-2xl rounded-tl-none max-w-[90%] space-y-1.5 shadow border-l-2 border-rose-500">
                <div className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Let op! 1-Ster Review ontvangen</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Klant Sophie gaf 1 ster: <em>"Lange wachttijd voor service..."</em><br /><br />
                  We hebben direct een diplomatiek antwoord klaargezet met jouw noodnummer ({tenant.whatsAppEmergencyNumber}).<br /><br />
                  <strong>Antwoord met 'JA'</strong> om te publiceren, of typ je eigen antwoord.
                </p>
                <div className="text-[9px] text-slate-400 text-right">11:14 ✓✓</div>
              </div>

              {whatsAppSimStep === 'CONFIRMED' && (
                <div className="bg-[#005c4b] text-white p-2.5 rounded-2xl rounded-tr-none ml-auto max-w-[70%] text-[11px] shadow">
                  JA
                  <div className="text-[9px] text-emerald-200 text-right">11:15 ✓✓</div>
                </div>
              )}

              {whatsAppSimStep === 'CONFIRMED' && (
                <div className="bg-[#202c33] text-slate-200 p-2.5 rounded-2xl rounded-tl-none max-w-[85%] text-[11px] space-y-1 shadow">
                  <p>✓ Begrepen! De reactie is zojuist gepubliceerd op Google Bedrijfsprofiel. Fijne dag!</p>
                  <div className="text-[9px] text-slate-400 text-right">11:15 ✓✓</div>
                </div>
              )}
            </div>

            <div className="p-3 bg-[#202c33] flex items-center gap-2">
              {whatsAppSimStep !== 'CONFIRMED' ? (
                <button
                  onClick={() => setWhatsAppSimStep('CONFIRMED')}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Simuleer Antwoord 'JA'</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowWhatsAppSimulator(false)}
                  className="w-full py-2 rounded-xl bg-slate-700 text-white font-bold text-xs"
                >
                  Sluit WhatsApp Simulator
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 90-Second Setup Wizard Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">90-Seconden Onboarding</span>
              <h3 className="text-base font-bold text-white">Stel je Bedrijfs-DNA in</h3>
              <p className="text-xs text-slate-400 mt-0.5">Slechts 3 eenvoudige vragen. Daarna draait alles 100% autonoom.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">1. Hoe spreek je klanten aan?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTenant(p => ({ ...p, toneOfVoice: 'informeel' }))}
                    className={`py-2 px-3 rounded-xl border font-bold transition-all ${
                      tenant.toneOfVoice === 'informeel' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Informeel (je / jij)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTenant(p => ({ ...p, toneOfVoice: 'formeel' }))}
                    className={`py-2 px-3 rounded-xl border font-bold transition-all ${
                      tenant.toneOfVoice === 'formeel' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Formeel (u / uw)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">2. Wat is je vakgebied &amp; specialiteit?</label>
                <input
                  type="text"
                  value={tenant.niche}
                  onChange={(e) => setTenant(p => ({ ...p, niche: e.target.value }))}
                  placeholder="bijv. Autogarage met snelle APK keuring & bandenservice"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">3. WhatsApp Noodnummer voor klachten-alerts:</label>
                <input
                  type="text"
                  value={tenant.whatsAppEmergencyNumber}
                  onChange={(e) => setTenant(p => ({ ...p, whatsAppEmergencyNumber: e.target.value }))}
                  placeholder="06-12345678"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setTenant(p => ({ ...p, isGoogleConnected: true, isAutopilotActive: true }));
                setShowOnboarding(false);
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verbind met Google &amp; Schakel Autopilot Aan</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
