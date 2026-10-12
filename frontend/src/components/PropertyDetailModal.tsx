import React from 'react';
import { Property } from '../types';
import {
  X,
  MapPin,
  Maximize2,
  Bed,
  Bath,
  Car,
  Layers,
  Sparkles,
  CheckCircle2,
  FileDown,
  ArrowRight
} from 'lucide-react';

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
  onValuateWithProfile: (property: Property) => void;
  onOpenReport: (property: Property) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onValuateWithProfile,
  onOpenReport,
}) => {
  if (!property) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-[#E7E7E7] shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1">
          {/* Main Architectural Hero Image */}
          <div className="relative w-full h-80 sm:h-96 bg-surface-secondary">
            <img
              src={property.image}
              alt={property.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/images/hmx_luxury_villa.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Bottom Overlay Text on Image */}
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <div className="flex items-center space-x-2 text-xs uppercase tracking-[0.2em] text-champagne mb-2 font-mono">
                <span>ESTATE INDEX #{property.id}</span>
                <span>•</span>
                <span>{property.furnishingstatus.toUpperCase()}</span>
              </div>
              <h2 className="font-editorial text-3xl sm:text-5xl font-light mb-2">
                {property.title}
              </h2>
              <div className="flex items-center space-x-2 text-sm text-white/80">
                <MapPin className="w-4 h-4 text-champagne" />
                <span>{property.location}</span>
              </div>
            </div>
          </div>

          {/* Details Content */}
          <div className="p-6 sm:p-10 space-y-8">
            {/* Price & Value Summary Banner */}
            <div className="p-6 rounded-2xl bg-surface-secondary border border-[#E7E7E7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-charcoal-muted block mb-1">
                  Verified Dataset Benchmark Valuation
                </span>
                <span className="font-editorial text-3xl sm:text-4xl font-semibold text-charcoal">
                  {property.formatted_price}
                </span>
                <span className="text-xs text-charcoal-muted ml-3 font-mono">
                  ({property.formatted_price_millions})
                </span>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[11px] uppercase tracking-wider text-charcoal-muted block mb-1">
                  Rate Per Built-up Footprint
                </span>
                <span className="text-lg font-mono font-semibold text-champagne-dark">
                  ₹{property.price_per_sqft.toLocaleString()} / sqft
                </span>
              </div>
            </div>

            {/* Spatial Metrics Grid */}
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-charcoal-muted font-bold mb-4">
                SPATIAL SPECIFICATIONS & VOLUMES
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-[#E7E7E7] bg-white text-center">
                  <Maximize2 className="w-5 h-5 text-champagne mx-auto mb-2" />
                  <span className="block text-[10px] uppercase text-charcoal-muted">Area</span>
                  <span className="font-semibold text-charcoal text-sm sm:text-base">
                    {property.area.toLocaleString()} sqft
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-[#E7E7E7] bg-white text-center">
                  <Bed className="w-5 h-5 text-champagne mx-auto mb-2" />
                  <span className="block text-[10px] uppercase text-charcoal-muted">Bedrooms</span>
                  <span className="font-semibold text-charcoal text-sm sm:text-base">
                    {property.bedrooms} En-Suite
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-[#E7E7E7] bg-white text-center">
                  <Bath className="w-5 h-5 text-champagne mx-auto mb-2" />
                  <span className="block text-[10px] uppercase text-charcoal-muted">Bathrooms</span>
                  <span className="font-semibold text-charcoal text-sm sm:text-base">
                    {property.bathrooms} Luxury
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-[#E7E7E7] bg-white text-center">
                  <Car className="w-5 h-5 text-champagne mx-auto mb-2" />
                  <span className="block text-[10px] uppercase text-charcoal-muted">Parking</span>
                  <span className="font-semibold text-charcoal text-sm sm:text-base">
                    {property.parking} Bays
                  </span>
                </div>
              </div>
            </div>

            {/* Architectural Narrative Description */}
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-charcoal-muted font-bold mb-3">
                ARCHITECTURAL ARCHIVE NOTES
              </h3>
              <p className="text-sm sm:text-base text-charcoal-graphite leading-relaxed font-light">
                {property.description}
              </p>
            </div>

            {/* Verified Feature Matrix */}
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-charcoal-muted font-bold mb-4">
                VERIFIED AMENITY SPECIFICATIONS (HOUSING.CSV)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Central HVAC / Air Conditioning', val: property.airconditioning === 'yes' },
                  { label: 'Prime Preferred Enclave', val: property.prefarea === 'yes' },
                  { label: 'Subterranean Basement', val: property.basement === 'yes' },
                  { label: 'Private Guest Suite', val: property.guestroom === 'yes' },
                  { label: 'Hot Water Hydronic Heating', val: property.hotwaterheating === 'yes' },
                  { label: 'Direct Main Road Access', val: property.mainroad === 'yes' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`p-3 rounded-xl border flex items-center space-x-2.5 text-xs font-medium ${
                      item.val
                        ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
                        : 'border-[#E7E7E7] bg-surface-secondary text-charcoal-light'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        item.val ? 'text-emerald-600' : 'text-gray-300'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-6 bg-surface-secondary border-t border-[#E7E7E7] flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => onOpenReport(property)}
            className="w-full sm:w-auto btn-tactile px-5 py-3 rounded-full text-xs uppercase tracking-wider font-semibold flex items-center justify-center space-x-2 text-charcoal"
          >
            <FileDown className="w-4 h-4 text-champagne" />
            <span>Generate Valuation Dossier (PDF)</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onValuateWithProfile(property);
            }}
            className="w-full sm:w-auto btn-champagne px-7 py-3 rounded-full text-xs uppercase tracking-wider font-semibold flex items-center justify-center space-x-2"
          >
            <span>Run Custom AI Valuation on this Profile</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
