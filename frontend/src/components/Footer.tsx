import React from 'react';
import { ArrowUpRight, Sparkles, Building2, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#111111] text-white pt-20 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          {/* Brand Info (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-sm border border-champagne/50 bg-white/10 flex items-center justify-center">
                <span className="font-serif text-lg font-bold text-champagne">H</span>
              </div>
              <span className="font-serif tracking-[0.25em] font-semibold text-xl text-white">
                HMX
              </span>
            </div>

            <p className="font-editorial text-2xl text-white/90 font-light italic leading-snug max-w-sm pt-2">
              "Every property has a story. Discover what it's worth."
            </p>

            <p className="text-xs text-white/60 font-light leading-relaxed max-w-sm">
              An extraordinary real-estate intelligence terminal combining luxury editorial design, empirical spatial data, and machine learning appraisal.
            </p>
          </div>

          {/* Navigation Links (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-champagne block mb-4">
              PLATFORM NAVIGATION
            </span>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <button
                  onClick={() => scrollTo('discover')}
                  className="hover:text-champagne transition-colors"
                >
                  Intelligent Hero Experience
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('scrollytelling')}
                  className="hover:text-champagne transition-colors"
                >
                  FPV Drone Tour Scrollytelling
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('properties')}
                  className="hover:text-champagne transition-colors"
                >
                  545 Verified Property Archives
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('map')}
                  className="hover:text-champagne transition-colors"
                >
                  Interactive Geocoded Enclaves
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('valuation')}
                  className="hover:text-champagne transition-colors"
                >
                  AI Valuation Studio
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('analytics')}
                  className="hover:text-champagne transition-colors"
                >
                  Market Intelligence & Metrics
                </button>
              </li>
            </ul>
          </div>

          {/* Machine Learning Specs (4 cols) */}
          <div className="md:col-span-4 space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-champagne block mb-4">
              ALGORITHMIC FOUNDATIONS
            </span>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs text-white/70">
              <div className="flex items-center justify-between">
                <span>Dataset:</span>
                <span className="font-mono text-white">Housing.csv (545 samples)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Model Pipeline:</span>
                <span className="font-mono text-champagne">GradientBoostingRegressor</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Holdout Test R²:</span>
                <span className="font-mono text-emerald-400">0.67 (CV: 0.62)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Confidence Band:</span>
                <span className="font-mono text-white">±1.96 × Residual Std Error</span>
              </div>
            </div>
            <p className="text-[10px] text-white/40 leading-relaxed pt-1">
              Engineered with Scikit-learn, FastAPI, React 19, and Vite.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/50">
          <div>
            © {new Date().getFullYear()} HMX — HOMES, UNDERSTOOD. All rights reserved.
          </div>
          <div className="flex items-center space-x-6">
            <span className="hover:text-white transition-colors">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-white transition-colors">Methodology Standards</span>
            <span>•</span>
            <span className="hover:text-white transition-colors">API Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
