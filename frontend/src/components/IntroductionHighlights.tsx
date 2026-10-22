import React from 'react';
import {
  Sparkles,
  MapPin,
  BarChart3,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  Building,
  ArrowRight
} from 'lucide-react';

interface IntroductionHighlightsProps {
  onExploreMap: () => void;
  onOpenValuation: () => void;
  onExploreProperties: () => void;
}

export const IntroductionHighlights: React.FC<IntroductionHighlightsProps> = ({
  onExploreMap,
  onOpenValuation,
  onExploreProperties,
}) => {
  const highlights = [
    {
      icon: Cpu,
      title: 'Gradient Boosting ML Inference',
      badge: 'PROVENANCE VERIFIED',
      description:
        'Trained on 545 authenticated records with 80% & 90% confidence intervals, continuous feature sensitivity modeling, and verified zero test-set leakage.',
      stat: 'R² > 0.65',
      statLabel: 'Predictive Fit',
    },
    {
      icon: MapPin,
      title: 'Interactive Google Maps Spatial Terminal',
      badge: 'LIVE SPATIAL INTEL',
      description:
        'Explore geocoded regional enclaves across New Delhi, Mumbai, Bengaluru, and Hyderabad with dynamic satellite imagery, custom price pins, and location filtering.',
      stat: '4 Major',
      statLabel: 'Metropolitan Enclaves',
    },
    {
      icon: Layers,
      title: '12 Micro-Market Valuation Signals',
      badge: 'MULTI-PARAMETRIC',
      description:
        'Deep sensitivity analysis evaluating built-up area, bedroom counts, bathrooms, stories, parking capacity, main-road proximity, and furnishing tiers.',
      stat: '12 Signals',
      statLabel: 'Hedonic Attributes',
    },
    {
      icon: ShieldCheck,
      title: 'Institutional Valuation Dossiers',
      badge: 'CRYPTOGRAPHIC AUDIT',
      description:
        'Generate exportable, client-ready PDF valuation reports featuring comprehensive feature attribution, comparable estate benchmarks, and SHA-256 verification.',
      stat: '100%',
      statLabel: 'Mathematical Transparency',
    },
  ];

  return (
    <section id="highlights" className="w-full py-24 sm:py-32 bg-white border-b border-[#E7E7E7] relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Editorial Eyebrow & Headline */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-champagne/10 border border-champagne/30 text-champagne-dark text-[11px] uppercase tracking-[0.25em] font-semibold mb-4">
            <Sparkles className="w-3 h-3 text-champagne" />
            <span>ARCHITECTURAL INTELLIGENCE PROTOCOL</span>
          </div>
          <h2 className="font-editorial text-4xl sm:text-5xl md:text-6xl text-charcoal font-light leading-[1.1] tracking-tight">
            Where Empirical Data Meets <br className="hidden sm:inline" />
            <span className="italic font-normal">Architectural Prestige.</span>
          </h2>
          <p className="text-base sm:text-lg text-charcoal-muted font-light leading-relaxed mt-6">
            HMX bridges the divide between opaque residential valuations and mathematical clarity. 
            By uniting 545 verified tabular records with multi-stage machine learning and live spatial mapping, 
            we empower developers, investors, and homeowners with verifiable property intelligence.
          </p>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-16">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative p-8 rounded-2xl bg-surface-secondary border border-[#E7E7E7] hover:border-champagne/60 hover:shadow-luxury transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white border border-[#E7E7E7] flex items-center justify-center text-champagne-dark group-hover:bg-champagne group-hover:text-white transition-colors duration-300 shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[9px] uppercase tracking-widest font-mono font-semibold px-2 py-0.5 rounded bg-white text-charcoal-muted border border-[#E7E7E7]">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="font-editorial text-2xl font-normal text-charcoal mb-3 group-hover:text-charcoal leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-charcoal-muted font-light leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#E7E7E7] flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-serif font-bold text-charcoal tracking-tight">
                      {item.stat}
                    </span>
                    <span className="block text-[10px] uppercase tracking-wider text-charcoal-muted font-mono mt-0.5">
                      {item.statLabel}
                    </span>
                  </div>
                  <span className="text-champagne font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    0{idx + 1}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Key Metric Summary Strip */}
        <div className="p-8 sm:p-10 rounded-3xl bg-charcoal text-white relative overflow-hidden shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Subtle Ambient Background Gradient */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-champagne/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl">
            <span className="text-[10px] uppercase tracking-[0.25em] text-champagne font-mono font-bold block mb-2">
              REAL-TIME DATASET VERIFICATION
            </span>
            <h4 className="font-editorial text-2xl sm:text-3xl text-white font-light leading-snug">
              Every metric anchored directly to <code className="text-champagne font-mono text-xl sm:text-2xl">Housing.csv</code>.
            </h4>
            <p className="text-xs sm:text-sm text-white/70 font-light mt-2 leading-relaxed">
              No fabricated records, synthetic price points, or invented properties. Explore genuine market observations with interactive spatial coordinates.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap sm:flex-nowrap items-center gap-4">
            <button
              onClick={onExploreMap}
              className="px-6 py-3.5 rounded-full bg-champagne text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#D4B890] transition-colors flex items-center space-x-2 group shadow-lg"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Launch Google Maps</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={onOpenValuation}
              className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs uppercase tracking-wider font-semibold transition-colors flex items-center space-x-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-champagne" />
              <span>Valuation Studio</span>
            </button>

            <button
              onClick={onExploreProperties}
              className="px-5 py-3.5 rounded-full text-white/70 hover:text-white text-xs uppercase tracking-wider font-medium transition-colors"
            >
              <span>545 Properties</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
