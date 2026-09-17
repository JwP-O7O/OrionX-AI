import React, { useState } from 'react';
import { ColdAuditReport, TenantProfile } from '../types';
import { generateColdAuditReport } from '../services/geminiService';
import { 
  Target, 
  Send, 
  Copy, 
  Check, 
  Sparkles, 
  AlertTriangle, 
  DollarSign, 
  Star, 
  RefreshCw, 
  Mail, 
  X,
  FileText,
  UserPlus
} from 'lucide-react';

interface ColdAuditBotProps {
  isOpen: boolean;
  onClose: () => void;
  onConvertProspectToTenant?: (report: ColdAuditReport) => void;
}

export const ColdAuditBot: React.FC<ColdAuditBotProps> = ({ 
  isOpen, 
  onClose,
  onConvertProspectToTenant
}) => {
  const [niche, setNiche] = useState('Autogarages');
  const [city, setCity] = useState('Utrecht');
  const [businessName, setBusinessName] = useState('Autobedrijf Van Dijk');
  const [isLoading, setIsLoading] = useState(false);
  const [auditReport, setAuditReport] = useState<ColdAuditReport | null>(null);
  const [copiedMail, setCopiedMail] = useState(false);
  const [converted, setConverted] = useState(false);

  if (!isOpen) return null;

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuditReport(null);
    setConverted(false);

    try {
      const report = await generateColdAuditReport(niche, city, businessName);
      setAuditReport(report);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyOutreach = () => {
    if (!auditReport) return;
    navigator.clipboard.writeText(auditReport.outreachMessageTemplate);
    setCopiedMail(true);
    setTimeout(() => setCopiedMail(false), 2000);
  };

  const handleAddToPipeline = () => {
    if (!auditReport || !onConvertProspectToTenant) return;
    onConvertProspectToTenant(auditReport);
    setConverted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Cold-Audit Acquisitie Machine (Agent 3.1)</h3>
              <p className="text-xs text-slate-400">Zoekt onbeantwoorde recensies op Google Maps &amp; berekent exact omzetverlies</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Target Scanner Form */}
          <form onSubmit={handleRunAudit} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zoekopdracht voor Lead Generatie</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Niche / Branche:</label>
                <input
                  type="text"
                  required
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="bijv. Tandartsen of Autogarages"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Stad / Regio:</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="bijv. Utrecht of Eindhoven"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Bedrijfsnaam (Optioneel):</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="bijv. Tandartspraktijk Centrum"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Agent analyseert Google Maps data &amp; genereert rapport...</span>
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  <span>Genereer Cold-Audit Rapport &amp; Outreach E-mail</span>
                </>
              )}
            </button>
          </form>

          {/* Audit Results View */}
          {auditReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-mono">HUIDIGE SCORE</span>
                  <div className="text-xl font-bold text-amber-400 font-mono mt-0.5">
                    ★ {auditReport.currentRating} / 5.0
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-mono">ONBEANTWOORDE REVIEWS</span>
                  <div className="text-xl font-bold text-rose-400 font-mono mt-0.5">
                    {auditReport.unansweredReviewsCount} reviews
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-mono">GESCHAT OMZETVERLIES</span>
                  <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
                    ≈ € {auditReport.estimatedMonthlyLeadLoss},- / mnd
                  </div>
                </div>
              </div>

              {/* Sample Review & Solution Preview */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gevonden Onbeantwoorde Klacht van {auditReport.sampleUnansweredReview.author}:</span>
                </div>
                <p className="text-xs text-slate-300 italic bg-slate-900 p-3 rounded-xl border border-slate-800">
                  "{auditReport.sampleUnansweredReview.comment}"
                </p>

                <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 pt-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Hoe LocalRepute AI dit binnen 3 minuten oplost:</span>
                </div>
                <p className="text-xs text-slate-300 bg-indigo-950/20 p-3 rounded-xl border border-indigo-500/20">
                  {auditReport.sampleAiResponse}
                </p>
              </div>

              {/* Ready to Send Cold Outreach Message */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Gepersonaliseerde Koude E-mail / LinkedIn Outreach:</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {onConvertProspectToTenant && (
                      <button
                        onClick={handleAddToPipeline}
                        disabled={converted}
                        className="flex items-center gap-1 text-[11px] font-bold text-emerald-300 hover:text-white bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>{converted ? 'Toegevoegd aan Pipeline ✓' : 'Voeg toe als Tenant'}</span>
                      </button>
                    )}
                    <button
                      onClick={handleCopyOutreach}
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      {copiedMail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedMail ? 'Gekopieerd!' : 'Kopieer E-mail'}</span>
                    </button>
                  </div>
                </div>
                <textarea
                  readOnly
                  rows={6}
                  value={auditReport.outreachMessageTemplate}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-sans leading-relaxed focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Converteert gemiddeld 18-24% naar een 14-dagen gratis proefperiode
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
};
