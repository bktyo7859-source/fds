import React, { useState, useEffect } from 'react';
import { Property } from '../types';
import { getProperties } from '../services/api';
import {
  Bed,
  Bath,
  Maximize2,
  Heart,
  Eye,
  SlidersHorizontal,
  Sparkles,
  MapPin,
  Check,
  Search,
  Layers,
  ArrowRight
} from 'lucide-react';

interface PropertyDiscoveryProps {
  onSelectProperty: (property: Property) => void;
  onOpenMapWithProperty: (property: Property) => void;
}

export const PropertyDiscovery: React.FC<PropertyDiscoveryProps> = ({
  onSelectProperty,
  onOpenMapWithProperty,
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [selectedFurnishing, setSelectedFurnishing] = useState<string>('all');
  const [selectedBedrooms, setSelectedBedrooms] = useState<number>(0);
  const [selectedPrefarea, setSelectedPrefarea] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'price_desc' | 'price_asc' | 'area_desc'>('price_desc');

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('hmx_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('hmx_favorites', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    fetchPropertyList();
  }, [selectedFurnishing, selectedBedrooms, selectedPrefarea]);

  const fetchPropertyList = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProperties({
        furnishing: selectedFurnishing,
        bedrooms: selectedBedrooms > 0 ? selectedBedrooms : undefined,
        prefarea: selectedPrefarea,
        limit: 48,
      });
      setProperties(data.properties);
    } catch (err: any) {
      setError(err.message || 'Failed to load properties from dataset.');
    } finally {
      setLoading(false);
    }
  };

  // Client-side search and sorting
  const filteredProperties = properties
    .filter((p) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'area_desc') return b.area - a.area;
      return 0;
    });

  return (
    <section id="properties" className="w-full py-28 bg-[#FFFFFF] border-b border-[#E7E7E7]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-champagne-subtle border border-champagne/30 text-champagne-dark text-[11px] uppercase tracking-[0.25em] font-semibold mb-4">
              <Sparkles className="w-3 h-3 text-champagne" />
              <span>VERIFIED REAL-ESTATE ARCHIVE</span>
            </div>
            <h2 className="font-editorial text-4xl sm:text-5xl md:text-6xl text-charcoal font-light tracking-tight leading-tight">
              Curated Architectural Residences
            </h2>
            <p className="text-sm sm:text-base text-charcoal-muted max-w-xl mt-3 font-light leading-relaxed">
              545 authentic properties indexed from the primary dataset. Each estate features verified spatial metrics, built-up specifications, and valuation markers.
            </p>
          </div>

          <div className="mt-6 md:mt-0 flex items-center space-x-3">
            <span className="text-xs uppercase tracking-wider text-charcoal-muted font-medium">
              Showing <strong className="text-charcoal font-semibold">{filteredProperties.length}</strong> of 545 verified residences
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="glass-panel p-4 rounded-2xl mb-12 flex flex-col lg:flex-row items-center justify-between gap-4 border border-[#E7E7E7]">
          {/* Search Input */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-charcoal-light absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search enclaves or estates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-surface-secondary border border-[#E7E7E7] focus:outline-none focus:border-champagne text-charcoal placeholder-charcoal-light font-medium"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Furnishing Tier */}
            <div className="flex items-center space-x-1 bg-surface-secondary p-1 rounded-xl border border-[#E7E7E7]">
              {['all', 'furnished', 'semi-furnished', 'unfurnished'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedFurnishing(tier)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] uppercase tracking-wider font-semibold transition-all ${
                    selectedFurnishing === tier
                      ? 'bg-white text-charcoal shadow-sm'
                      : 'text-charcoal-muted hover:text-charcoal'
                  }`}
                >
                  {tier === 'all' ? 'All Tiers' : tier.replace('-', ' ')}
                </button>
              ))}
            </div>

            {/* Bedrooms */}
            <div className="flex items-center space-x-1 bg-surface-secondary p-1 rounded-xl border border-[#E7E7E7]">
              {[0, 3, 4, 5].map((beds) => (
                <button
                  key={beds}
                  onClick={() => setSelectedBedrooms(beds)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    selectedBedrooms === beds
                      ? 'bg-white text-charcoal shadow-sm'
                      : 'text-charcoal-muted hover:text-charcoal'
                  }`}
                >
                  {beds === 0 ? 'All Beds' : `${beds}+ Beds`}
                </button>
              ))}
            </div>

            {/* Preferred Area Only */}
            <button
              onClick={() => setSelectedPrefarea(selectedPrefarea === 'yes' ? 'all' : 'yes')}
              className={`px-3 py-2 rounded-xl text-[11px] uppercase tracking-wider font-semibold border transition-all flex items-center space-x-1.5 ${
                selectedPrefarea === 'yes'
                  ? 'bg-champagne/15 border-champagne text-champagne-dark'
                  : 'bg-surface-secondary border-[#E7E7E7] text-charcoal-muted hover:text-charcoal'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Prime Enclaves Only</span>
            </button>
          </div>

          {/* Sort Selector */}
          <div className="w-full lg:w-auto flex items-center justify-end space-x-2">
            <span className="text-[11px] uppercase tracking-wider text-charcoal-light">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-surface-secondary border border-[#E7E7E7] rounded-xl px-3 py-2 text-xs text-charcoal font-medium focus:outline-none focus:border-champagne"
            >
              <option value="price_desc">Price: Highest First</option>
              <option value="price_asc">Price: Lowest First</option>
              <option value="area_desc">Footprint: Largest First</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="rounded-2xl border border-[#E7E7E7] bg-surface-secondary p-4 animate-pulse">
                <div className="w-full h-64 bg-gray-200 rounded-xl mb-4" />
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="h-8 bg-gray-200 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-16 bg-red-50/50 rounded-2xl border border-red-200 p-8">
            <p className="text-red-700 font-medium mb-3">{error}</p>
            <button
              onClick={fetchPropertyList}
              className="px-6 py-2 rounded-full bg-charcoal text-white text-xs uppercase tracking-wider font-semibold"
            >
              Retry Database Sync
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProperties.length === 0 && (
          <div className="text-center py-24 bg-surface-secondary rounded-2xl border border-[#E7E7E7] p-8">
            <Layers className="w-10 h-10 text-charcoal-light mx-auto mb-3" />
            <h3 className="font-editorial text-2xl text-charcoal mb-2">No Properties Matched Criteria</h3>
            <p className="text-xs text-charcoal-muted mb-6">
              Adjust your filters or search keywords to view other verified estates in the catalog.
            </p>
            <button
              onClick={() => {
                setSelectedFurnishing('all');
                setSelectedBedrooms(0);
                setSelectedPrefarea('all');
                setSearchQuery('');
              }}
              className="btn-tactile px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Property Grid */}
        {!loading && !error && filteredProperties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((prop) => {
              const isFav = favorites.includes(prop.id);
              return (
                <div
                  key={prop.id}
                  onClick={() => onSelectProperty(prop)}
                  className="group cursor-pointer rounded-2xl bg-white border border-[#E7E7E7] hover:border-champagne/60 hover:shadow-luxury-hover transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Property Image Container */}
                  <div className="relative w-full h-64 overflow-hidden bg-surface-secondary">
                    <img
                      src={prop.image}
                      alt={prop.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        // Fallback image
                        (e.target as HTMLImageElement).src = '/assets/images/hmx_luxury_villa.jpg';
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-[10px] uppercase font-mono tracking-widest">
                        #{prop.id} • {prop.furnishingstatus}
                      </span>

                      <button
                        onClick={(e) => toggleFavorite(prop.id, e)}
                        className={`p-2 rounded-full backdrop-blur-md transition-all ${
                          isFav
                            ? 'bg-red-500 text-white scale-110 shadow-md'
                            : 'bg-black/40 text-white/80 hover:text-white hover:bg-black/60 border border-white/20'
                        }`}
                        title={isFav ? 'Remove from favorites' : 'Save property'}
                        aria-label="Save Property"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Bottom Price Tag on Image */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-white/70 block">
                          Verified Valuation
                        </span>
                        <span className="font-editorial text-2xl font-semibold tracking-tight text-white drop-shadow-sm">
                          {prop.formatted_price_millions}
                        </span>
                      </div>
                      <span className="text-[11px] text-white/80 font-mono tracking-tight">
                        ₹{prop.price_per_sqft}/sqft
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Enclave Location */}
                      <div className="flex items-center space-x-1.5 text-charcoal-muted text-xs mb-2">
                        <MapPin className="w-3.5 h-3.5 text-champagne shrink-0" />
                        <span className="truncate">{prop.location}</span>
                      </div>

                      {/* Title */}
                      <h3 className="font-editorial text-xl font-medium text-charcoal group-hover:text-champagne-dark transition-colors mb-3 line-clamp-1">
                        {prop.title}
                      </h3>

                      {/* Spatial Specs Pills */}
                      <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#E7E7E7] text-xs text-charcoal-graphite">
                        <div className="flex items-center space-x-1.5">
                          <Maximize2 className="w-3.5 h-3.5 text-champagne shrink-0" />
                          <span className="font-medium">{prop.area.toLocaleString()} sqft</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Bed className="w-3.5 h-3.5 text-champagne shrink-0" />
                          <span className="font-medium">{prop.bedrooms} Beds</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Bath className="w-3.5 h-3.5 text-champagne shrink-0" />
                          <span className="font-medium">{prop.bathrooms} Baths</span>
                        </div>
                      </div>

                      {/* Amenities Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {prop.features.slice(0, 3).map((f) => (
                          <span
                            key={f}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-surface-secondary text-charcoal-muted border border-[#E7E7E7]"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-5 mt-4 border-t border-[#E7E7E7] flex items-center justify-between">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenMapWithProperty(prop);
                        }}
                        className="text-[11px] uppercase tracking-wider text-charcoal-muted hover:text-champagne-dark font-semibold transition-colors flex items-center space-x-1"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>Locate</span>
                      </button>

                      <div className="flex items-center space-x-1 text-xs text-charcoal font-semibold group-hover:text-champagne-dark transition-colors">
                        <span>Inspect Dossier</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
