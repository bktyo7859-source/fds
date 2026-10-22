import React from 'react';
import { Sparkles, MapPin, ArrowRight, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface CallToActionProps {
  onOpenValuation: () => void;
  onExploreMap: () => void;
  onExploreProperties: () => void;
}

export const CallToAction: React.FC<CallToActionProps> = ({
  onOpenValuation,
  onExploreMap,
  onExploreProperties,
}) => {
  return (
    <section className="w-full py-28 sm:py-36 bg-[#0E0E0E] text-white relative overflow-hidden">
      {/* Ambient Radial Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-champagne/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Hairline Grid Lines */}
      <div className="absolute inset-x-8 top-12 bottom-12 border border-white/5 pointer-events-none hidden sm:block" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-champagne text-[11px] uppercase tracking-[0.25em] font-semibold mb-6 shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-champagne animate-pulse" />
          <span>PRECISION VALUATION AT INSTITUTIONAL SCALE</span>
        </div>

        {/* Headline */}
        <h2 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-light text-white leading-[1.08] tracking-tight mb-6">
          Ready to discover what <br className="hidden sm:inline" />
          <span className="italic font-normal text-champagne">your address is truly worth?</span>
        </h2>

        {/* Description */}
        <p className="max-w-2xl text-base sm:text-lg md:text-xl text-white/75 font-light leading-relaxed mb-12 tracking-wide">
          Harness the predictive accuracy of gradient boosting machine learning. 
          Model 12 hedonic drivers, inspect geocoded regional enclaves on Google Maps, 
          and export authenticated valuation reports in seconds.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16">
          <button
            onClick={onOpenValuation}
            className="w-full sm:w-auto px-9 py-4 rounded-full bg-champagne text-white text-xs uppercase tracking-[0.18em] font-semibold hover:bg-[#D4B890] hover:shadow-[0_8px_30px_rgba(197,168,128,0.4)] transition-all flex items-center justify-center space-x-3 group"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Launch Valuation Studio</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={onExploreMap}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 text-xs uppercase tracking-[0.18em] font-semibold transition-all flex items-center justify-center space-x-2"
          >
            <MapPin className="w-4 h-4 text-champagne" />
            <span>Interactive Google Maps</span>
          </button>

          <button
            onClick={onExploreProperties}
            className="w-full sm:w-auto px-7 py-4 rounded-full text-white/70 hover:text-white text-xs uppercase tracking-[0.18em] font-medium transition-colors hover:bg-white/5"
          >
            <span>Browse 545 Estates</span>
          </button>
        </div>

        {/* Trust & Methodology Signals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full pt-12 border-t border-white/10 text-left">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center space-x-2 text-champagne mb-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-semibold text-white">545 Verified Estates</span>
            </div>
            <p className="text-[11px] text-white/50 font-light leading-relaxed">
              Real records authenticated from the primary <code className="text-white/70 font-mono">Housing.csv</code> archive.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center space-x-2 text-champagne mb-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-semibold text-white">Zero Data Leakage</span>
            </div>
            <p className="text-[11px] text-white/50 font-light leading-relaxed">
              Strict 80/20 train-test separation with 5-fold cross-validation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center space-x-2 text-champagne mb-1.5">
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-semibold text-white">Google Maps Core</span>
            </div>
            <p className="text-[11px] text-white/50 font-light leading-relaxed">
              Official Google Maps JavaScript API with responsive satellite layers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center space-x-2 text-champagne mb-1.5">
              <FileText className="w-4 h-4" />
              <span className="text-xs font-semibold text-white">Cryptographic Dossier</span>
            </div>
            <p className="text-[11px] text-white/50 font-light leading-relaxed">
              SHA-256 verification hash generated for every valuation calculation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
