import React, { useState } from 'react';
import { LocalReview } from '../types';
import { 
  generateReviewReply 
} from '../services/geminiService';
import { 
  Star, 
  Sparkles, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  RefreshCw,
  PlusCircle,
  ThumbsUp,
  Settings2
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const INITIAL_REVIEWS: LocalReview[] = [
  {
    id: 'rev-1',
    author: 'Jan van Dijk',
    businessName: 'Autobedrijf & Bandenservice Utrecht',
    platform: 'Google',
    rating: 5,
    comment: 'Fantastische APK keuring gehad! Binnen 45 minuten klaar en eerlijk advies over mijn remblokken. Topservice.',
    date: '10 minuten geleden',
    sentiment: 'positive',
    status: 'auto_replied',
    autoResponse: 'Beste Jan, hartelijk dank voor uw positieve review over onze APK keuring en bandenservice in Utrecht! Fijn dat u snel en tevreden weer veilig de weg op kon. Tot de volgende beurt!',
    seoKeywordsUsed: ['APK keuring Utrecht', 'bandenservice'],
    repliedAt: '5 min geleden',
  },
  {
    id: 'rev-2',
    author: 'Sophie Bakker',
    businessName: 'Autobedrijf & Bandenservice Utrecht',
    platform: 'Google',
    rating: 2,
    comment: 'Moest erg lang wachten ondanks afspraak voor bandenwissel. Koffiezetautomaat was ook stuk.',
    date: '35 minuten geleden',
    sentiment: 'critical',
    status: 'escalated_to_owner',
    autoResponse: 'Beste Sophie, excuses voor het ongemak en de langere wachttijd voor uw bandenwissel in Utrecht. Dit past niet bij onze kwaliteitsstandaard. Zou u direct contact willen opnemen met onze vestigingsmanager via 030-xxxx of manager@autobedrijf-utrecht.nl? We lossen dit graag persoonlijk met u op.',
    seoKeywordsUsed: ['bandenwissel Utrecht'],
    repliedAt: 'Concept opgesteld - Notificatie naar eigenaar gestuurd',
  },
  {
    id: 'rev-3',
    author: 'Dennis Meijer',
    businessName: 'Autobedrijf & Bandenservice Utrecht',
    platform: 'Google',
    rating: 5,
    comment: 'Al jaren vaste klant voor groot onderhoud en winterbanden. Nooit verrassingen op de factuur.',
    date: '2 uur geleden',
    sentiment: 'positive',
    status: 'auto_replied',
    autoResponse: 'Beste Dennis, ontzettend bedankt voor uw jarenlange vertrouwen in ons autobedrijf in Utrecht voor uw groot onderhoud en bandenservice! We staan altijd met plezier voor u klaar.',
    seoKeywordsUsed: ['groot onderhoud Utrecht', 'bandenservice'],
    repliedAt: '1 uur geleden',
  },
];

export const LocalReputeSimulator: React.FC = () => {
  const [reviews, setReviews] = useState<LocalReview[]>(INITIAL_REVIEWS);
  const [businessName, setBusinessName] = useState('Autobedrijf & Bandenservice Utrecht');
  const [localKeywords, setLocalKeywords] = useState('APK keuring Utrecht, bandenwissel, betrouwbare garage');
  const [toneOfVoice, setToneOfVoice] = useState<'vriendelijk en professioneel' | 'enthousiast en warm' | 'zakelijk en to-the-point'>('vriendelijk en professioneel');
  
  // New review form
  const [newAuthor, setNewAuthor] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isProcessingNew, setIsProcessingNew] = useState(false);

  // Stats calculation
  const totalReviews = reviews.length;
  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / (totalReviews || 1)).toFixed(1);
  const autoRepliedCount = reviews.filter(r => r.status === 'auto_replied').length;
  const escalatedCount = reviews.filter(r => r.status === 'escalated_to_owner').length;
  const timeSavedHours = (autoRepliedCount * 0.25).toFixed(1); // 15 mins saved per review

  // Chart data
  const chartData = [
    { name: '5 Sterren', count: reviews.filter(r => r.rating === 5).length },
    { name: '4 Sterren', count: reviews.filter(r => r.rating === 4).length },
    { name: '3 Sterren', count: reviews.filter(r => r.rating === 3).length },
    { name: '2 Sterren', count: reviews.filter(r => r.rating === 2).length },
    { name: '1 Ster', count: reviews.filter(r => r.rating === 1).length },
  ];

  // Submit test review to trigger Gemini
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor || !newComment) return;

    setIsProcessingNew(true);

    try {
      const aiResult = await generateReviewReply({
        author: newAuthor,
        businessName,
        rating: newRating,
        comment: newComment,
        tone: toneOfVoice,
        localKeywords,
      });

      const newReview: LocalReview = {
        id: `rev-${Date.now()}`,
        author: newAuthor,
        businessName,
        platform: 'Google',
        rating: newRating,
        comment: newComment,
        date: 'Zojuist binnengekomen',
        sentiment: aiResult.sentiment || (newRating >= 4 ? 'positive' : 'critical'),
        status: newRating <= 2 || aiResult.escalationRequired ? 'escalated_to_owner' : 'auto_replied',
        autoResponse: aiResult.response,
        seoKeywordsUsed: aiResult.seoKeywordsUsed || [],
        repliedAt: newRating <= 2 ? 'Concept gereed • SMS alert verstuurd naar MKB-eigenaar' : 'Binnen 2 minuten autonoom gepubliceerd',
      };

      setReviews([newReview, ...reviews]);
      setNewAuthor('');
      setNewComment('');
      setNewRating(5);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingNew(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Product Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Het Gebouwde MVP Product
            </span>
            <span className="text-xs text-slate-400">Micro-SaaS Draaiend op Autonome Gemini Engine</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">LocalRepute AI: Review Auto-Pilot voor MKB</h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Lokale ondernemers verliezen van grote ketens door trage of ontbrekende Google reviews. 
            LocalRepute reageert binnen 5 minuten met lokale SEO-zoektermen, vangt negatieve ervaringen af en verhoogt Google Maps rankings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-xl font-bold text-emerald-400 font-mono">100%</div>
            <div className="text-[10px] text-slate-400 uppercase">Response Rate</div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-xl font-bold text-indigo-400 font-mono">{timeSavedHours}h</div>
            <div className="text-[10px] text-slate-400 uppercase">Bespaarde Tijd</div>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Gemiddelde Score</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">{avgRating} / 5.0</div>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +0.4 stijging in 30 dagen
          </span>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Autonoom Beantwoord</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">{autoRepliedCount} reviews</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Zonder tussenkomst ondernemer</span>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">1-2★ Escalatie Guard</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">{escalatedCount} geval(len)</div>
          <span className="text-[11px] text-rose-300 mt-1 block">Ondernemer direct geïnformeerd</span>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Google Maps Positie</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-300 mt-2 font-mono">Top 3 (#1 Utrecht)</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Lokale zoekintentie geoptimaliseerd</span>
        </div>
      </div>

      {/* Main Configuration & Interactive Review Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Business settings & Simulator trigger */}
        <div className="space-y-6">
          {/* MKB Configuration */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-3">
              <Settings2 className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">MKB Bedrijfsprofiel & SEO Regels</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Bedrijfsnaam:</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Lokale SEO Zoektermen (Google Maps boost):
                </label>
                <input
                  type="text"
                  value={localKeywords}
                  onChange={(e) => setLocalKeywords(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Tone of Voice:</label>
                <select
                  value={toneOfVoice}
                  onChange={(e: any) => setToneOfVoice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="vriendelijk en professioneel">Vriendelijk & Professioneel</option>
                  <option value="enthousiast en warm">Enthousiast & Warm</option>
                  <option value="zakelijk en to-the-point">Zakelijk & To-the-point</option>
                </select>
              </div>
            </div>
          </div>

          {/* Test Simuleer een Nieuwe Google Review */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-3">
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Simuleer Nieuwe Klantbeoordeling</h3>
            </div>

            <form onSubmit={handleAddReview} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Klantnaam:</label>
                <input
                  type="text"
                  required
                  placeholder="bijv. Kees Verkerk"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Waardering (Sterren):</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= newRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono text-slate-300 ml-2">{newRating} / 5</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Review Bericht:</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Schrijf een test review (probeer ook een 1-ster klacht om het escalatieprotocol te testen)..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessingNew}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all"
              >
                {isProcessingNew ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Auto-Pilot Analyseert & Genereert...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Publiceer & Test Auto-Pilot</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Rating Distribution Chart */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Review Sentiment Verdeling</h3>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column (2 cols wide): Live Feed of Auto-Replied Reviews */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Live Google Maps & Trustpilot Feed</h3>
            </div>
            <span className="text-xs text-slate-400">Automatische OAuth 2.0 Synchronisatie</span>
          </div>

          <div className="space-y-4">
            {reviews.map((rev) => {
              const isEscalated = rev.status === 'escalated_to_owner';

              return (
                <div
                  key={rev.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isEscalated
                      ? 'bg-rose-950/20 border-rose-500/40'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Review Top Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white">{rev.author}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {rev.platform}
                        </span>
                        <span className="text-[11px] text-slate-400">{rev.date}</span>
                      </div>

                      {/* Stars */}
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

                    {/* Status Badge */}
                    <div>
                      {isEscalated ? (
                        <span className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          Escalatie Alert (1-2★)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Autonoom Beantwoord
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Customer Review Comment */}
                  <p className="text-xs text-slate-200 mt-2.5 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50">
                    "{rev.comment}"
                  </p>

                  {/* Auto-Pilot Generated Response */}
                  {rev.autoResponse && (
                    <div className="mt-3 pl-3 border-l-2 border-indigo-500 bg-indigo-950/20 p-3 rounded-r-xl border-y border-r border-indigo-500/20">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <div className="flex items-center gap-1.5 font-semibold text-indigo-300">
                          <Sparkles className="w-3 h-3 text-indigo-400" />
                          <span>LocalRepute AI Respons</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{rev.repliedAt}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{rev.autoResponse}</p>

                      {rev.seoKeywordsUsed && rev.seoKeywordsUsed.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-indigo-500/10">
                          <span className="text-[10px] text-slate-400">Verwerkte SEO zoektermen:</span>
                          {rev.seoKeywordsUsed.map((kw, i) => (
                            <span
                              key={i}
                              className="text-[9px] px-2 py-0.5 rounded-md bg-indigo-900/60 text-indigo-200 font-mono"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
