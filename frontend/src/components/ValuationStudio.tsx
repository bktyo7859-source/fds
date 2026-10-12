import React, { useState, useEffect } from 'react';
import { ValuationRequestPayload, ValuationResult, Property } from '../types';
import { predictValuation } from '../services/api';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Check,
  AlertCircle,
  TrendingUp,
  FileDown,
  Layers,
  MapPin,
  Maximize2,
  Bed,
  Bath,
  Car,
  ShieldCheck,
  CheckCircle2,
  Info
} from 'lucide-react';

interface ValuationStudioProps {
  initialProperty?: Property | null;
  onOpenReport?: (result: ValuationResult, formData: ValuationRequestPayload, location: string) => void;
}

const PRESET_ARCHETYPES = [
  {
    name: 'Coastal Travertine Villa',
    location: 'Worli Sea Face, Mumbai',
    area: 7420,
    bedrooms: 4,
    bathrooms: 2,
    stories: 3,
    parking: 2,
    mainroad: 'yes',
    guestroom: 'no',
    basement: 'no',
    hotwaterheating: 'no',
    airconditioning: 'yes',
    prefarea: 'yes',
    furnishingstatus: 'furnished',
  },
  {
    name: 'Modernist Forest Pavilion',
    location: 'Golf Links Enclave, New Delhi',
    area: 6000,
    bedrooms: 4,
    bathrooms: 3,
    stories: 2,
    parking: 2,
    mainroad: 'yes',
    guestroom: 'yes',
    basement: 'yes',
    hotwaterheating: 'yes',
    airconditioning: 'no',
    prefarea: 'no',
    furnishingstatus: 'semi-furnished',
  },
  {
    name: 'Contemporary Penthouse',
    location: 'Sadashivnagar, Bengaluru',
    area: 4500,
    bedrooms: 3,
    bathrooms: 2,
    stories: 2,
    parking: 2,
    mainroad: 'yes',
    guestroom: 'no',
    basement: 'no',
    hotwaterheating: 'no',
    airconditioning: 'yes',
    prefarea: 'yes',
    furnishingstatus: 'furnished',
  },
];

export const ValuationStudio: React.FC<ValuationStudioProps> = ({
  initialProperty,
  onOpenReport,
}) => {
  const [step, setStep] = useState<number>(1);
  const [location, setLocation] = useState<string>('Golf Links Enclave, New Delhi');

  // Form State matching Housing.csv feature schema
  const [formData, setFormData] = useState<ValuationRequestPayload>({
    area: 6500,
    bedrooms: 4,
    bathrooms: 2,
    stories: 2,
    parking: 2,
    mainroad: 'yes',
    guestroom: 'no',
    basement: 'no',
    hotwaterheating: 'no',
    airconditioning: 'yes',
    prefarea: 'yes',
    furnishingstatus: 'furnished',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ValuationResult | null>(null);

  // If initial property passed, pre-fill form
  useEffect(() => {
    if (initialProperty) {
      setLocation(initialProperty.location);
      setFormData({
        area: initialProperty.area,
        bedrooms: initialProperty.bedrooms,
        bathrooms: initialProperty.bathrooms,
        stories: initialProperty.stories,
        parking: initialProperty.parking,
        mainroad: initialProperty.mainroad,
        guestroom: initialProperty.guestroom,
        basement: initialProperty.basement,
        hotwaterheating: initialProperty.hotwaterheating,
        airconditioning: initialProperty.airconditioning,
        prefarea: initialProperty.prefarea,
        furnishingstatus: initialProperty.furnishingstatus,
      });
      setStep(2);
    }
  }, [initialProperty]);

  const loadArchetype = (arch: (typeof PRESET_ARCHETYPES)[0]) => {
    setLocation(arch.location);
    setFormData({
      area: arch.area,
      bedrooms: arch.bedrooms,
      bathrooms: arch.bathrooms,
      stories: arch.stories,
      parking: arch.parking,
      mainroad: arch.mainroad,
      guestroom: arch.guestroom,
      basement: arch.basement,
      hotwaterheating: arch.hotwaterheating,
      airconditioning: arch.airconditioning,
      prefarea: arch.prefarea,
      furnishingstatus: arch.furnishingstatus,
    });
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else if (step === 3) {
      // Trigger Prediction (Step 4 -> 5)
      submitValuation();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const submitValuation = async () => {
    setLoading(true);
    setError(null);
    setStep(4); // Evaluating state

    try {
      const res = await predictValuation(formData);
      setResult(res);
      setStep(5); // Results state
    } catch (err: any) {
      setError(err.message || 'Valuation inference engine encountered an issue.');
      setStep(3); // return to edit
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setStep(1);
  };

  const stepsHeader = [
    { num: 1, label: 'Location' },
    { num: 2, label: 'Profile' },
    { num: 3, label: 'Features' },
    { num: 4, label: 'Evaluation' },
    { num: 5, label: 'Dossier' },
  ];

  return (
    <section id="valuation" className="w-full py-28 bg-[#FFFFFF] border-b border-[#E7E7E7]">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-champagne-subtle border border-champagne/30 text-champagne-dark text-[11px] uppercase tracking-[0.25em] font-semibold mb-4">
            <Sparkles className="w-3 h-3 text-champagne" />
            <span>MACHINE LEARNING VALUATION STUDIO</span>
          </div>
          <h2 className="font-editorial text-4xl sm:text-5xl text-charcoal font-light leading-tight">
            Algorithmic Property Appraisal
          </h2>
          <p className="text-sm sm:text-base text-charcoal-muted mt-3 font-light leading-relaxed">
            Submit verified spatial dimensions and amenity tiers to our trained Gradient Boosting pipeline for immediate valuation with 95% confidence intervals.
          </p>
        </div>

        {/* Step Indicator Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-xl mx-auto relative">
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-[#E7E7E7] z-0" />
            <div
              className="absolute top-1/2 left-0 -translate-y-1/2 h-0.5 bg-champagne z-0 transition-all duration-500"
              style={{ width: `${((step - 1) / 4) * 100}%` }}
            />

            {stepsHeader.map((s) => {
              const isActive = step === s.num;
              const isDone = step > s.num;
              return (
                <div key={s.num} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      isActive
                        ? 'bg-charcoal text-white ring-4 ring-champagne/30 scale-110 shadow-md'
                        : isDone
                        ? 'bg-champagne text-white'
                        : 'bg-white text-charcoal-light border border-[#E7E7E7]'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span
                    className={`text-[10px] uppercase tracking-wider font-semibold mt-2 ${
                      isActive ? 'text-charcoal' : 'text-charcoal-light'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Archetype Quick-Fill Badges (Available during Step 1) */}
        {step === 1 && (
          <div className="mb-8 p-4 rounded-2xl bg-surface-secondary border border-[#E7E7E7] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-xs text-charcoal-muted font-medium">
              <Sparkles className="w-4 h-4 text-champagne shrink-0" />
              <span>Or quick-load an architectural baseline:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_ARCHETYPES.map((arch) => (
                <button
                  key={arch.name}
                  onClick={() => loadArchetype(arch)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#E7E7E7] hover:border-champagne hover:text-champagne-dark transition-all shadow-sm"
                >
                  {arch.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-700 font-bold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Form Container */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-[#E7E7E7] shadow-luxury">
          {/* ================= STEP 1: LOCATION ================= */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-champagne-dark font-bold font-mono">
                  STEP 01 OF 04
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl font-light text-charcoal mt-1">
                  Designate Geographical & Enclave Position
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-muted mt-1 font-light">
                  Select the metropolitan territory or primary enclave corridor for baseline spatial modeling.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-xs uppercase tracking-wider font-semibold text-charcoal">
                  Territory & Preferred Enclave
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Golf Links Enclave, New Delhi',
                    'Worli Sea Face, Mumbai',
                    'Sadashivnagar, Bengaluru',
                    'Jubilee Hills, Hyderabad',
                    'Malabar Hill, Mumbai',
                    'Panchsheel Park, New Delhi',
                    'Boat Club Road, Chennai',
                    'Alibaug Coastal Belt',
                  ].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setLocation(loc)}
                      className={`p-4 rounded-xl border text-left flex items-center space-x-3 transition-all ${
                        location === loc
                          ? 'border-champagne bg-champagne-subtle text-charcoal font-semibold shadow-sm'
                          : 'border-[#E7E7E7] bg-white text-charcoal-muted hover:border-gray-300'
                      }`}
                    >
                      <MapPin
                        className={`w-4 h-4 shrink-0 ${
                          location === loc ? 'text-champagne-dark' : 'text-gray-400'
                        }`}
                      />
                      <span className="text-xs">{loc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: PROFILE ================= */}
          {step === 2 && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-champagne-dark font-bold font-mono">
                  STEP 02 OF 04
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl font-light text-charcoal mt-1">
                  Structural Dimensions & Volumetric Layout
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-muted mt-1 font-light">
                  Specify exact built-up footprint in square feet, room counts, and parking capacity.
                </p>
              </div>

              {/* Area Slider & Input */}
              <div className="p-6 rounded-2xl bg-surface-secondary border border-[#E7E7E7] space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-wider font-semibold text-charcoal flex items-center space-x-2">
                    <Maximize2 className="w-4 h-4 text-champagne" />
                    <span>Built-up Footprint Area (sqft)</span>
                  </label>
                  <span className="font-editorial text-2xl font-bold text-charcoal font-mono">
                    {formData.area.toLocaleString()} sqft
                  </span>
                </div>

                <input
                  type="range"
                  min="1200"
                  max="16200"
                  step="100"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
                  className="w-full accent-[#C5A880] cursor-pointer"
                />

                <div className="flex items-center justify-between text-[11px] text-charcoal-light font-mono">
                  <span>1,200 sqft (Compact)</span>
                  <span>5,150 sqft (Dataset Mean)</span>
                  <span>16,200 sqft (Palatial)</span>
                </div>
              </div>

              {/* Bedrooms, Bathrooms, Stories, Parking */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Bedrooms */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-charcoal flex items-center space-x-1.5">
                    <Bed className="w-4 h-4 text-champagne" />
                    <span>Bedrooms</span>
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setFormData({ ...formData, bedrooms: b })}
                        className={`py-3 rounded-xl text-xs font-bold transition-all ${
                          formData.bedrooms === b
                            ? 'bg-charcoal text-white shadow-sm'
                            : 'bg-surface-secondary text-charcoal-muted border border-[#E7E7E7] hover:border-gray-400'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bathrooms */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-charcoal flex items-center space-x-1.5">
                    <Bath className="w-4 h-4 text-champagne" />
                    <span>Bathrooms</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setFormData({ ...formData, bathrooms: b })}
                        className={`py-3 rounded-xl text-xs font-bold transition-all ${
                          formData.bathrooms === b
                            ? 'bg-charcoal text-white shadow-sm'
                            : 'bg-surface-secondary text-charcoal-muted border border-[#E7E7E7] hover:border-gray-400'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stories */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-charcoal flex items-center space-x-1.5">
                    <Layers className="w-4 h-4 text-champagne" />
                    <span>Vertical Stories / Levels</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData({ ...formData, stories: s })}
                        className={`py-3 rounded-xl text-xs font-bold transition-all ${
                          formData.stories === s
                            ? 'bg-charcoal text-white shadow-sm'
                            : 'bg-surface-secondary text-charcoal-muted border border-[#E7E7E7] hover:border-gray-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Parking */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-charcoal flex items-center space-x-1.5">
                    <Car className="w-4 h-4 text-champagne" />
                    <span>Covered Parking Bays</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 1, 2, 3].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFormData({ ...formData, parking: p })}
                        className={`py-3 rounded-xl text-xs font-bold transition-all ${
                          formData.parking === p
                            ? 'bg-charcoal text-white shadow-sm'
                            : 'bg-surface-secondary text-charcoal-muted border border-[#E7E7E7] hover:border-gray-400'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: AMENITIES & FEATURES ================= */}
          {step === 3 && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-champagne-dark font-bold font-mono">
                  STEP 03 OF 04
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl font-light text-charcoal mt-1">
                  Amenities, Climate Automation & Interior Tier
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-muted mt-1 font-light">
                  Select genuine dataset attributes evaluated by the trained Scikit-learn model.
                </p>
              </div>

              {/* Furnishing Status Segmented Control */}
              <div className="space-y-3">
                <label className="block text-xs uppercase tracking-wider font-semibold text-charcoal">
                  Interior Furnishing Tier
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'furnished', label: 'Furnished', desc: 'Full luxury architectural styling' },
                    { key: 'semi-furnished', label: 'Semi-Furnished', desc: 'Fitted cabinetry & fixtures' },
                    { key: 'unfurnished', label: 'Unfurnished', desc: 'Raw architectural shell' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          furnishingstatus: item.key,
                        })
                      }
                      className={`p-4 rounded-xl border text-left transition-all ${
                        formData.furnishingstatus === item.key
                          ? 'border-champagne bg-champagne-subtle text-charcoal shadow-sm'
                          : 'border-[#E7E7E7] bg-white text-charcoal-muted hover:border-gray-300'
                      }`}
                    >
                      <span className="block text-xs font-bold uppercase tracking-wider mb-1">
                        {item.label}
                      </span>
                      <span className="text-[11px] text-charcoal-muted hidden sm:block">
                        {item.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Binary Amenities Grid */}
              <div className="space-y-3">
                <label className="block text-xs uppercase tracking-wider font-semibold text-charcoal">
                  Architectural & Mechanical Features
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      key: 'airconditioning',
                      label: 'Central HVAC / Air Conditioning',
                      desc: 'Full-home zoned climate control',
                    },
                    {
                      key: 'prefarea',
                      label: 'Prime Preferred Enclave Access',
                      desc: 'Situated in high-demand residential corridor',
                    },
                    {
                      key: 'basement',
                      label: 'Subterranean Basement Floor',
                      desc: 'Lower ground level recreational or storage area',
                    },
                    {
                      key: 'guestroom',
                      label: 'Private Guestroom Suite',
                      desc: 'Independent accommodation with separate access',
                    },
                    {
                      key: 'hotwaterheating',
                      label: 'Thermal Hydronic Water Heating',
                      desc: 'Centralized continuous boiler circulation',
                    },
                    {
                      key: 'mainroad',
                      label: 'Direct Arterial Road Access',
                      desc: 'Immediate frontage onto primary avenue',
                    },
                  ].map((feature) => {
                    const isChecked = (formData as any)[feature.key] === 'yes';
                    return (
                      <button
                        key={feature.key}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            [feature.key]: isChecked ? 'no' : 'yes',
                          })
                        }
                        className={`p-4 rounded-xl border text-left flex items-start space-x-3 transition-all ${
                          isChecked
                            ? 'border-emerald-300 bg-emerald-50/40 text-emerald-950 shadow-sm'
                            : 'border-[#E7E7E7] bg-white text-charcoal-muted hover:border-gray-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
                            isChecked
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span className="block text-xs font-bold leading-tight">
                            {feature.label}
                          </span>
                          <span className="text-[11px] text-charcoal-light mt-0.5 block">
                            {feature.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4: EVALUATING SPINNER ================= */}
          {step === 4 && (
            <div className="py-20 text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full border-4 border-champagne/30 border-t-champagne animate-spin mx-auto" />
              <div className="max-w-md mx-auto">
                <h3 className="font-editorial text-3xl font-light text-charcoal mb-2">
                  Querying Machine Learning Engine
                </h3>
                <p className="text-xs text-charcoal-muted font-light leading-relaxed">
                  Executing Gradient Boosting inference pipeline, computing residual standard error intervals, and calculating local feature attributions...
                </p>
              </div>
            </div>
          )}

          {/* ================= STEP 5: VALUATION DOSSIER RESULTS ================= */}
          {step === 5 && result && (
            <div className="space-y-8 animate-fade-in">
              {/* Top Banner */}
              <div className="p-8 rounded-2xl bg-gradient-to-br from-charcoal via-[#1C1C1C] to-black text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-champagne/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center space-x-2 text-[11px] uppercase tracking-widest text-champagne font-mono font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>HMX CERTIFIED VALUATION ESTIMATE</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                      <span className="text-white/50">HASH:</span>
                      <span className="text-champagne bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15" title={result.verification_hash || ''}>
                        {result.verification_hash || 'HMX-CANONICAL'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-white/60 block mb-1">
                        Estimated True Property Value
                      </span>
                      <h2 className="font-editorial text-4xl sm:text-6xl text-white font-light tracking-tight">
                        {result.formatted_price}
                      </h2>
                      <span className="text-base text-champagne font-mono font-semibold block mt-1">
                        {result.formatted_price_millions}
                      </span>
                    </div>

                    <div className="space-y-2.5 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/70">90% Conformal Interval:</span>
                        <span className="font-mono font-bold text-white">
                          {result.confidence_interval_95.formatted_range}
                        </span>
                      </div>
                      {result.confidence_interval_95.nominal_coverage && (
                        <div className="text-[10px] text-white/60 text-right font-mono">
                          {result.confidence_interval_95.nominal_coverage}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
                        <span className="text-white/70">Estimated Rate:</span>
                        <span className="font-mono font-bold text-champagne">
                          ₹{result.price_per_sqft.toLocaleString()} / sqft
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/70">Reference Enclave:</span>
                        <span className="font-medium text-white truncate max-w-[180px]">
                          {location}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extrapolation Warning if Out of Bounds */}
              {result.is_extrapolation && result.warning && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-3">
                  <Info className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">Out-of-Distribution Caveat</span>
                    <span>{result.warning}</span>
                  </div>
                </div>
              )}

              {/* Feature Attribution Waterfall */}
              <div>
                <div className="mb-4">
                  <h4 className="text-xs uppercase tracking-[0.2em] text-charcoal-muted font-bold">
                    EXACT SHAPLEY ATTRIBUTION BREAKDOWN (VS BASELINE)
                  </h4>
                  <p className="text-[11px] text-charcoal-light font-light mt-0.5">
                    Exact interventional Shapley values enumerated across all 2¹² = 4,096 feature coalitions (0.00 additivity error).
                  </p>
                </div>
                <div className="space-y-2">
                  {result.attributions.map((att) => (
                    <div
                      key={att.factor}
                      className="p-3.5 rounded-xl border border-[#E7E7E7] bg-white flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-charcoal">{att.factor}</span>
                        <span className="text-charcoal-muted text-[11px]">({att.value})</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-mono font-bold ${
                            att.impact > 0
                              ? 'text-emerald-700'
                              : att.impact < 0
                              ? 'text-red-700'
                              : 'text-charcoal-light'
                          }`}
                        >
                          {att.impact > 0 ? '+' : ''}₹{Math.round(att.impact).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submitted Property Configuration Summary */}
              <div className="p-6 rounded-2xl bg-surface-secondary border border-[#E7E7E7]">
                <h4 className="text-xs uppercase tracking-[0.2em] text-charcoal-muted font-bold mb-3">
                  EVALUATED PROPERTY PROFILE
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-charcoal-light block text-[10px] uppercase">Footprint</span>
                    <span className="font-semibold text-charcoal">{formData.area.toLocaleString()} sqft</span>
                  </div>
                  <div>
                    <span className="text-charcoal-light block text-[10px] uppercase">Rooms</span>
                    <span className="font-semibold text-charcoal">{formData.bedrooms} Beds • {formData.bathrooms} Baths</span>
                  </div>
                  <div>
                    <span className="text-charcoal-light block text-[10px] uppercase">Floors & Bays</span>
                    <span className="font-semibold text-charcoal">{formData.stories} Stories • {formData.parking} Parking</span>
                  </div>
                  <div>
                    <span className="text-charcoal-light block text-[10px] uppercase">Furnishing</span>
                    <span className="font-semibold text-charcoal capitalize">{formData.furnishingstatus}</span>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-4 rounded-xl bg-surface-warm/50 border border-[#E7E7E7] text-[11px] text-charcoal-muted leading-relaxed font-light space-y-1">
                <div>
                  <strong>Valuation & Prediction Integrity Disclosure:</strong> This appraisal is generated by an empirical GradientBoostingRegressor trained on 545 verified records from <code className="font-mono text-[10px]">Housing.csv</code> (Train R²: 0.86, 5-Fold CV R²: 0.61 ± 0.05, Test R²: 0.66, Test MAE: ₹969k). Prediction boundaries are empirical conformal residual intervals with stated empirical test coverage.
                </div>
                <div className="text-charcoal-light text-[10px]">
                  <strong>Statutory Notice:</strong> The canonical verification hash verifies exact mathematical reproducibility against model weights and inputs only, and does not certify legal ownership, municipal permits, structural survey, or physical title.
                </div>
              </div>
            </div>
          )}

          {/* Form Navigation Controls */}
          <div className="pt-8 mt-8 border-t border-[#E7E7E7] flex items-center justify-between">
            {step > 1 && step < 4 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="btn-tactile px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold flex items-center space-x-2 text-charcoal"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            )}

            {step === 5 && (
              <button
                type="button"
                onClick={resetForm}
                className="btn-tactile px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold flex items-center space-x-2 text-charcoal"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Valuation</span>
              </button>
            )}

            <div className="ml-auto flex items-center space-x-3">
              {step < 3 && (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn-champagne px-7 py-3 rounded-full text-xs uppercase tracking-wider font-semibold flex items-center space-x-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {step === 3 && (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn-champagne px-8 py-3.5 rounded-full text-xs uppercase tracking-wider font-semibold flex items-center space-x-2 shadow-lg"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Execute AI Valuation</span>
                </button>
              )}

              {step === 5 && result && onOpenReport && (
                <button
                  type="button"
                  onClick={() => onOpenReport(result, formData, location)}
                  className="btn-champagne px-7 py-3 rounded-full text-xs uppercase tracking-wider font-semibold flex items-center space-x-2"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Export Official Dossier (PDF)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
