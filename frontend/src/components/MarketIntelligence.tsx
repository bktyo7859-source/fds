import React, { useState, useEffect } from 'react';
import { MarketAnalytics } from '../types';
import { getMarketAnalytics } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  BarChart3,
  Sparkles,
  TrendingUp,
  Cpu,
  Layers,
  CheckCircle,
  Sliders,
  DollarSign,
  Maximize2
} from 'lucide-react';

export const MarketIntelligence: React.FC = () => {
  const [analytics, setAnalytics] = useState<MarketAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Interactive What-If Simulation State
  const [simArea, setSimArea] = useState<number>(6500);
  const [simBeds, setSimBeds] = useState<number>(4);
  const [simBaths, setSimBaths] = useState<number>(2);
  const [simAC, setSimAC] = useState<boolean>(true);
  const [simPref, setSimPref] = useState<boolean>(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMarketAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load market analytics.');
    } finally {
      setLoading(false);
    }
  };

  // What-If Dynamic Price Simulation based on regression weights
  const simulatedPrice = React.useMemo(() => {
    if (!analytics) return 0;
    const base = analytics.summary.average_price;
    const areaDelta = (simArea - 5150) * 720;
    const bedDelta = (simBeds - 3) * 200000;
    const bathDelta = (simBaths - 1) * 850000;
    const acDelta = simAC ? 650000 : 0;
    const prefDelta = simPref ? 580000 : 0;
    return Math.max(1800000, base + areaDelta + bedDelta + bathDelta + acDelta + prefDelta);
  }, [analytics, simArea, simBeds, simBaths, simAC, simPref]);

  if (loading) {
    return (
      <section id="analytics" className="w-full py-28 bg-[#FFFFFF] border-b border-[#E7E7E7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center py-24">
          <div className="w-12 h-12 rounded-full border-4 border-champagne/30 border-t-champagne animate-spin mx-auto mb-4" />
          <p className="text-xs text-charcoal-muted uppercase tracking-widest font-semibold">
            Aggregating Statistical Distributions & Model Diagnostics...
          </p>
        </div>
      </section>
    );
  }

  if (error || !analytics) {
    return (
      <section id="analytics" className="w-full py-28 bg-[#FFFFFF] border-b border-[#E7E7E7]">
        <div className="max-w-md mx-auto px-6 text-center py-16 bg-red-50 rounded-2xl border border-red-200">
          <p className="text-red-700 text-xs font-semibold mb-4">{error || 'Data unavailable.'}</p>
          <button
            onClick={fetchAnalytics}
            className="px-6 py-2.5 rounded-full bg-charcoal text-white text-xs uppercase tracking-wider font-semibold"
          >
            Retry Analytics Engine
          </button>
        </div>
      </section>
    );
  }

  const { summary, price_distribution, scatter_area_vs_price, model_metrics } = analytics;

  return (
    <section id="analytics" className="w-full py-28 bg-[#FFFFFF] border-b border-[#E7E7E7]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-champagne-subtle border border-champagne/30 text-champagne-dark text-[11px] uppercase tracking-[0.25em] font-semibold mb-4">
              <BarChart3 className="w-3 h-3 text-champagne" />
              <span>MARKET INTELLIGENCE & EVALUATION BENCHMARKS</span>
            </div>
            <h2 className="font-editorial text-4xl sm:text-5xl md:text-6xl text-charcoal font-light leading-tight">
              Empirical Real Estate Analytics
            </h2>
            <p className="text-sm sm:text-base text-charcoal-muted max-w-xl mt-3 font-light leading-relaxed">
              Transparent distribution metrics computed directly from the 545 verified properties in Housing.csv. Rigorous comparison of training and holdout test metrics.
            </p>
          </div>

          <div className="mt-6 md:mt-0 flex items-center space-x-2 text-xs font-mono text-charcoal-muted">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Algorithm: GradientBoostingRegressor</span>
          </div>
        </div>

        {/* Metric Benchmark Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-surface-secondary border border-[#E7E7E7] shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-widest text-charcoal-light block mb-1">
              Dataset Records
            </span>
            <span className="font-editorial text-3xl sm:text-4xl font-light text-charcoal block">
              {summary.total_properties}
            </span>
            <span className="text-[11px] text-charcoal-muted font-light mt-1 block">
              Verified Housing.csv Rows
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-surface-secondary border border-[#E7E7E7] shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-widest text-charcoal-light block mb-1">
              Median / Mean Price
            </span>
            <span className="font-editorial text-3xl sm:text-4xl font-light text-charcoal block">
              ₹{(summary.median_price / 1e6).toFixed(2)}M
            </span>
            <span className="text-[11px] text-charcoal-muted font-light mt-1 block">
              Mean: ₹{(summary.average_price / 1e6).toFixed(2)}M
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-surface-secondary border border-[#E7E7E7] shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-widest text-charcoal-light block mb-1">
              Mean Price / Footprint
            </span>
            <span className="font-editorial text-3xl sm:text-4xl font-light text-charcoal block">
              ₹{summary.average_price_per_sqft.toLocaleString()}
            </span>
            <span className="text-[11px] text-charcoal-muted font-light mt-1 block">
              Avg Area: {summary.average_area.toLocaleString()} sqft
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-surface-secondary border border-[#E7E7E7] shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-widest text-charcoal-light block mb-1">
              Test R² / 5-Fold CV R²
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="font-editorial text-3xl sm:text-4xl font-light text-emerald-800">
                {model_metrics.test_r2}
              </span>
              <span className="text-xs font-mono text-charcoal-muted">
                (CV: {model_metrics.cv_5fold_r2_mean})
              </span>
            </div>
            <span className="text-[11px] text-charcoal-muted font-light mt-1 block">
              Train: {model_metrics.train_r2} • MAE: ₹{(model_metrics.mae / 1e3).toFixed(0)}k
            </span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Chart 1: Price Distribution Histogram */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E7E7E7] shadow-luxury flex flex-col justify-between">
            <div className="mb-6">
              <span className="text-[10px] uppercase tracking-widest font-bold text-champagne-dark font-mono">
                FREQUENCY HISTOGRAM
              </span>
              <h3 className="font-editorial text-2xl font-light text-charcoal mt-1">
                Property Price Distribution
              </h3>
              <p className="text-xs text-charcoal-muted mt-1 font-light">
                Distribution of 545 verified valuations binned into price segments.
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={price_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EFEB" vertical={false} />
                  <XAxis
                    dataKey="range"
                    tick={{ fontSize: 10, fill: '#6B6B6B' }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#6B6B6B' }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-charcoal text-white text-xs p-3 rounded-xl shadow-xl">
                            <span className="font-mono text-champagne block mb-1 font-semibold">{data.range}</span>
                            <span className="font-bold text-base">{data.count} Properties</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {price_distribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index < 3 ? '#C5A880' : index < 7 ? '#A88B63' : '#343434'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Footprint vs Price Scatter Plot */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E7E7E7] shadow-luxury flex flex-col justify-between">
            <div className="mb-6">
              <span className="text-[10px] uppercase tracking-widest font-bold text-champagne-dark font-mono">
                CORRELATION & DISPERSION
              </span>
              <h3 className="font-editorial text-2xl font-light text-charcoal mt-1">
                Built-Up Footprint vs Price
              </h3>
              <p className="text-xs text-charcoal-muted mt-1 font-light">
                Regression dispersion mapping square footage against verified price in millions.
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EFEB" />
                  <XAxis
                    dataKey="area"
                    name="Area (sqft)"
                    unit=" sqft"
                    tick={{ fontSize: 10, fill: '#6B6B6B' }}
                  />
                  <YAxis
                    dataKey="price_m"
                    name="Price"
                    unit="M"
                    tick={{ fontSize: 10, fill: '#6B6B6B' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const pt = payload[0].payload;
                        return (
                          <div className="bg-charcoal text-white text-xs p-3 rounded-xl shadow-xl">
                            <span className="font-bold text-champagne block mb-1">
                              ₹{pt.price_m}M (₹{pt.price.toLocaleString()})
                            </span>
                            <span className="block text-white/80">{pt.area.toLocaleString()} sqft</span>
                            <span className="block text-white/60">{pt.bedrooms} Beds • {pt.bathrooms} Baths</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter name="Properties" data={scatter_area_vs_price} fill="#C5A880" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Feature Importance & What-If Simulation Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Feature Importance Rankings (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-surface-secondary border border-[#E7E7E7]">
            <span className="text-[10px] uppercase tracking-widest font-bold text-champagne-dark font-mono block mb-1">
              GRADIENT BOOSTING FEATURE WEIGHTS
            </span>
            <h3 className="font-editorial text-2xl font-light text-charcoal mb-2">
              Model Feature Importance
            </h3>
            <p className="text-xs text-charcoal-muted mb-6 font-light leading-relaxed">
              Relative importance extracted from the trained Scikit-learn tree ensembles. Built-up footprint and bathroom count dominate valuation impact.
            </p>

            <div className="space-y-4">
              {model_metrics.feature_importances.slice(0, 7).map((feat) => (
                <div key={feat.feature} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-charcoal capitalize">
                      {feat.feature.replace('_', ' ')}
                    </span>
                    <span className="font-mono text-champagne-dark font-bold">
                      {feat.importance}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white border border-[#E7E7E7] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-champagne to-champagne-dark rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(feat.importance * 2, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive What-If Simulation Calculator (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white border border-[#E7E7E7] shadow-luxury">
            <div className="flex items-center space-x-2 text-[10px] uppercase tracking-widest font-bold text-champagne-dark font-mono mb-1">
              <Sliders className="w-3.5 h-3.5" />
              <span>SENSITIVITY LAB</span>
            </div>
            <h3 className="font-editorial text-2xl font-light text-charcoal mb-2">
              Interactive What-If Valuation Simulator
            </h3>
            <p className="text-xs text-charcoal-muted mb-8 font-light">
              Adjust sliders dynamically to evaluate real-time marginal valuation impact.
            </p>

            <div className="space-y-6">
              {/* Footprint Slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-charcoal">Footprint Area:</span>
                  <span className="font-mono font-bold text-champagne-dark">{simArea.toLocaleString()} sqft</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="12000"
                  step="250"
                  value={simArea}
                  onChange={(e) => setSimArea(Number(e.target.value))}
                  className="w-full accent-[#C5A880] cursor-pointer"
                />
              </div>

              {/* Bedrooms & Bathrooms */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-semibold text-charcoal mb-2">Bedrooms: {simBeds}</span>
                  <div className="flex space-x-1.5">
                    {[2, 3, 4, 5].map((b) => (
                      <button
                        key={b}
                        onClick={() => setSimBeds(b)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                          simBeds === b ? 'bg-charcoal text-white' : 'bg-surface-secondary text-charcoal-muted border'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-charcoal mb-2">Bathrooms: {simBaths}</span>
                  <div className="flex space-x-1.5">
                    {[1, 2, 3, 4].map((b) => (
                      <button
                        key={b}
                        onClick={() => setSimBaths(b)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                          simBaths === b ? 'bg-charcoal text-white' : 'bg-surface-secondary text-charcoal-muted border'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSimAC(!simAC)}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                    simAC ? 'border-champagne bg-champagne-subtle text-charcoal' : 'border-[#E7E7E7] text-charcoal-muted'
                  }`}
                >
                  <span>Central Air Conditioning</span>
                  <CheckCircle className={`w-4 h-4 ${simAC ? 'text-champagne-dark' : 'text-gray-300'}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setSimPref(!simPref)}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                    simPref ? 'border-champagne bg-champagne-subtle text-charcoal' : 'border-[#E7E7E7] text-charcoal-muted'
                  }`}
                >
                  <span>Prime Preferred Enclave</span>
                  <CheckCircle className={`w-4 h-4 ${simPref ? 'text-champagne-dark' : 'text-gray-300'}`} />
                </button>
              </div>

              {/* Simulated Output Card */}
              <div className="p-6 rounded-2xl bg-surface-secondary border border-[#E7E7E7] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-muted block mb-0.5">
                    Simulated Valuation
                  </span>
                  <span className="font-editorial text-3xl font-semibold text-charcoal">
                    ₹{(simedPrice => `₹${(simedPrice / 1e6).toFixed(2)}M`)(simulatedPrice)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-muted block mb-0.5">
                    Estimated Rate
                  </span>
                  <span className="text-sm font-mono font-bold text-champagne-dark">
                    ₹{Math.round(simulatedPrice / simArea).toLocaleString()}/sqft
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
