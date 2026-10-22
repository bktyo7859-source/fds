import React, { useState, useEffect, useRef } from 'react';
import { Property } from '../types';
import {
  MapPin,
  Sparkles,
  Search,
  Layers,
  Compass,
  SlidersHorizontal,
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  Maximize2,
  X,
  ChevronRight,
  Info
} from 'lucide-react';
import { loadGoogleMaps, resetGoogleMapsLoader } from '../services/googleMapsLoader';
import { HMX_LUXURY_MAP_STYLES } from '../services/googleMapsTheme';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom Leaflet DivIcon for fallback map
const createLeafletIcon = (isSelected: boolean, priceMillions: string) => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background: ${isSelected ? '#111111' : '#FFFFFF'};
        color: ${isSelected ? '#FFFFFF' : '#111111'};
        border: 2px solid ${isSelected ? '#C5A880' : '#E7E7E7'};
        border-radius: 9999px;
        padding: 4px 10px;
        font-family: 'DM Sans', sans-serif;
        font-size: 11px;
        font-weight: 700;
        box-shadow: 0 4px 14px rgba(0,0,0,0.18);
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 5px;
        transform: translate(-50%, -50%);
        cursor: pointer;
        transition: all 0.2s ease;
      ">
        <span style="color: #C5A880; font-size: 13px;">●</span>
        <span>${priceMillions}</span>
      </div>
    `,
    iconSize: [64, 30],
    iconAnchor: [32, 15],
  });
};

// Leaflet center animator
const LeafletCenterController: React.FC<{ coords: { lat: number; lng: number } | null }> = ({
  coords,
}) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo([coords.lat, coords.lng], 13, { duration: 1.2 });
    }
  }, [coords, map]);
  return null;
};

interface GoogleMapsSectionProps {
  properties: Property[];
  selectedProperty: Property | null;
  onSelectProperty: (property: Property) => void;
  onValuateProperty?: (property: Property) => void;
}

export const GoogleMapsSection: React.FC<GoogleMapsSectionProps> = ({
  properties,
  selectedProperty,
  onSelectProperty,
  onValuateProperty,
}) => {
  const [activeEnclaveFilter, setActiveEnclaveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState<boolean>(false);
  const [customKeyInput, setCustomKeyInput] = useState<string>('');
  const [activeMapType, setActiveMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');

  // Google Map container & instance refs
  const googleMapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Enclaves definition
  const enclaves = [
    { label: 'All Metropolitan Enclaves', key: 'all', center: { lat: 21.7679, lng: 78.8718 }, zoom: 5 },
    { label: 'New Delhi (Golf Links / Panchsheel)', key: 'delhi', center: { lat: 28.5983, lng: 77.2346 }, zoom: 13 },
    { label: 'Mumbai (Worli / Malabar Hill)', key: 'mumbai', center: { lat: 18.98, lng: 72.8172 }, zoom: 13 },
    { label: 'Bengaluru (Sadashivnagar / Indiranagar)', key: 'bengaluru', center: { lat: 13.0068, lng: 77.5813 }, zoom: 13 },
    { label: 'Hyderabad (Jubilee / Banjara Hills)', key: 'hyderabad', center: { lat: 17.4319, lng: 78.4073 }, zoom: 13 },
  ];

  // Filter properties by enclave and search query
  const filteredProperties = properties.filter((p) => {
    if (activeEnclaveFilter === 'delhi' && !p.location.includes('Delhi')) return false;
    if (activeEnclaveFilter === 'mumbai' && !p.location.includes('Mumbai')) return false;
    if (activeEnclaveFilter === 'bengaluru' && !p.location.includes('Bengaluru')) return false;
    if (activeEnclaveFilter === 'hyderabad' && !p.location.includes('Hyderabad')) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.formatted_price_millions.toLowerCase().includes(q) ||
      p.furnishingstatus.toLowerCase().includes(q) ||
      p.id.toString() === q
    );
  });

  // Load Google Maps API
  useEffect(() => {
    let isMounted = true;

    loadGoogleMaps()
      .then(() => {
        if (!isMounted) return;
        setIsGoogleMapsReady(true);
        setMapError(null);
      })
      .catch((err) => {
        if (!isMounted) return;
        setIsGoogleMapsReady(false);
        setMapError(err.message || 'FALLBACK_MODE');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize official Google Map instance when Google Maps is ready
  useEffect(() => {
    if (!isGoogleMapsReady || !googleMapRef.current || !(window as any).google?.maps) return;

    const initialEnclave = enclaves.find((e) => e.key === activeEnclaveFilter) || enclaves[0];
    const mapCenter = selectedProperty
      ? { lat: selectedProperty.coordinates.lat, lng: selectedProperty.coordinates.lng }
      : initialEnclave.center;

    const map = new google.maps.Map(googleMapRef.current, {
      center: mapCenter,
      zoom: selectedProperty ? 13 : initialEnclave.zoom,
      styles: activeMapType === 'roadmap' ? HMX_LUXURY_MAP_STYLES : undefined,
      mapTypeId: activeMapType,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false, // We supply custom luxury switcher
      scaleControl: true,
      streetViewControl: true,
      rotateControl: true,
      fullscreenControl: true,
    });

    mapInstanceRef.current = map;
    infoWindowRef.current = new google.maps.InfoWindow();

    // Places autocomplete if input exists
    if (searchInputRef.current && (google.maps as any).places) {
      try {
        const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
          fields: ['geometry', 'name', 'formatted_address'],
        });
        autocomplete.bindTo('bounds', map);
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry?.location) {
            map.panTo(place.geometry.location);
            map.setZoom(14);
          }
        });
      } catch (e) {
        console.log('Google Places Autocomplete init notice:', e);
      }
    }
  }, [isGoogleMapsReady, activeMapType]);

  // Update Google Maps markers whenever filtered properties change
  useEffect(() => {
    if (!isGoogleMapsReady || !mapInstanceRef.current || !(window as any).google?.maps) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const map = mapInstanceRef.current;
    const infoWindow = infoWindowRef.current;

    filteredProperties.slice(0, 100).forEach((prop) => {
      const isSelected = selectedProperty?.id === prop.id;

      // Custom SVG marker pin
      const marker = new google.maps.Marker({
        position: { lat: prop.coordinates.lat, lng: prop.coordinates.lng },
        map: map,
        title: `${prop.title} - ${prop.formatted_price_millions}`,
        icon: {
          url:
            'data:image/svg+xml;charset=UTF-8,' +
            encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="76" height="34" viewBox="0 0 76 34">
                <rect x="2" y="2" width="72" height="28" rx="14" fill="${
                  isSelected ? '#111111' : '#FFFFFF'
                }" stroke="${isSelected ? '#C5A880' : '#CCCCCC'}" stroke-width="2"/>
                <circle cx="14" cy="16" r="4" fill="#C5A880"/>
                <text x="24" y="20" font-family="'DM Sans', sans-serif" font-size="11" font-weight="bold" fill="${
                  isSelected ? '#FFFFFF' : '#111111'
                }">${prop.formatted_price_millions}</text>
              </svg>
            `),
          scaledSize: new google.maps.Size(76, 34),
          anchor: new google.maps.Point(38, 17),
        },
      });

      marker.addListener('click', () => {
        if (!infoWindow) return;

        const contentString = `
          <div style="font-family: 'DM Sans', sans-serif; padding: 4px; max-width: 240px; color: #111111;">
            <img 
              src="${prop.image}" 
              alt="${prop.title}" 
              style="width: 100%; height: 110px; object-fit: cover; border-radius: 6px; margin-bottom: 8px;"
              onerror="this.src='/assets/images/hmx_luxury_villa.jpg'"
            />
            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #C5A880; font-weight: bold;">
              Record #${prop.id} • ${prop.furnishingstatus}
            </div>
            <div style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 18px; font-weight: 600; line-height: 1.2; margin: 2px 0 4px 0;">
              ${prop.title}
            </div>
            <div style="font-size: 11px; color: #666666; margin-bottom: 8px;">
              ${prop.location}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; padding-top: 6px; border-top: 1px solid #EAEAEA;">
              <div>
                <span style="font-size: 16px; font-weight: bold; color: #111111;">${prop.formatted_price_millions}</span>
                <span style="font-size: 10px; color: #888888; display: block;">₹${prop.price_per_sqft}/sqft</span>
              </div>
              <button 
                id="btn-inspect-${prop.id}"
                style="padding: 5px 12px; background: #111111; color: #FFFFFF; border: none; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; cursor: pointer; letter-spacing: 0.05em;"
              >
                Inspect
              </button>
            </div>
          </div>
        `;

        infoWindow.setContent(contentString);
        infoWindow.open(map, marker);

        // Bind click handler once DOM node mounts
        google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
          const btn = document.getElementById(`btn-inspect-${prop.id}`);
          if (btn) {
            btn.onclick = () => onSelectProperty(prop);
          }
        });
      });

      markersRef.current.push(marker);
    });
  }, [filteredProperties, isGoogleMapsReady, selectedProperty]);

  // Handle fly-to when selectedProperty changes
  useEffect(() => {
    if (selectedProperty && mapInstanceRef.current && isGoogleMapsReady) {
      mapInstanceRef.current.panTo({
        lat: selectedProperty.coordinates.lat,
        lng: selectedProperty.coordinates.lng,
      });
      mapInstanceRef.current.setZoom(14);
    }
  }, [selectedProperty, isGoogleMapsReady]);

  // Enclave change handler
  const handleEnclaveChange = (key: string) => {
    setActiveEnclaveFilter(key);
    const enc = enclaves.find((e) => e.key === key);
    if (enc && mapInstanceRef.current && isGoogleMapsReady) {
      mapInstanceRef.current.panTo(enc.center);
      mapInstanceRef.current.setZoom(enc.zoom);
    }
  };

  // Test custom API Key handler
  const handleApplyCustomKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (customKeyInput.trim()) {
      sessionStorage.setItem('HMX_GOOGLE_MAPS_API_KEY', customKeyInput.trim());
      resetGoogleMapsLoader();
      setIsGoogleMapsReady(false);
      setMapError(null);
      loadGoogleMaps({ apiKey: customKeyInput.trim() })
        .then(() => {
          setIsGoogleMapsReady(true);
          setApiKeyModalOpen(false);
        })
        .catch((err) => {
          setMapError(err.message || 'Authentication error');
        });
    }
  };

  const handleResetView = () => {
    setActiveEnclaveFilter('all');
    setSearchQuery('');
    if (mapInstanceRef.current && isGoogleMapsReady) {
      mapInstanceRef.current.panTo(enclaves[0].center);
      mapInstanceRef.current.setZoom(enclaves[0].zoom);
    }
  };

  return (
    <section id="map" className="w-full py-24 sm:py-32 bg-surface-secondary border-b border-[#E7E7E7] relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-champagne-subtle border border-champagne/30 text-champagne-dark text-[11px] uppercase tracking-[0.25em] font-semibold mb-4">
              <MapPin className="w-3.5 h-3.5 text-champagne" />
              <span>OFFICIAL GOOGLE MAPS JAVASCRIPT API</span>
            </div>
            <h2 className="font-editorial text-4xl sm:text-5xl md:text-6xl text-charcoal font-light leading-tight tracking-tight">
              Interactive Google Maps Section
            </h2>
            <p className="text-sm sm:text-base text-charcoal-muted mt-3 font-light leading-relaxed">
              Explore 545 verified architectural records geocoded across major metropolitan enclaves. 
              Search addresses, filter regional clusters, and inspect live valuation markers with full pan and zoom navigation.
            </p>
          </div>

          {/* Status Badge & API Key Trigger */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div
              className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-medium border ${
                isGoogleMapsReady
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {isGoogleMapsReady ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Google Maps Active (Satellite & Places)</span>
                </>
              ) : (
                <>
                  <Info className="w-3.5 h-3.5 text-amber-600" />
                  <span>High-Precision Spatial Fallback Active</span>
                </>
              )}
            </div>

            <button
              onClick={() => setApiKeyModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-neutral-50 text-charcoal text-xs font-semibold border border-[#E7E7E7] transition-all flex items-center space-x-1.5 shadow-sm hover:border-champagne"
              title="Configure Google Maps API Key"
            >
              <Key className="w-3 h-3 text-champagne" />
              <span>Configure Maps Key</span>
            </button>
          </div>
        </div>

        {/* Map Explorer Controls Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E7E7E7] shadow-sm mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search place, enclave (Delhi, Mumbai, Bengaluru...), or record #..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-surface-secondary border border-[#E7E7E7] text-xs sm:text-sm text-charcoal placeholder-charcoal-light focus:outline-none focus:border-champagne transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-light hover:text-charcoal p-1"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Enclave Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {enclaves.map((enc) => (
              <button
                key={enc.key}
                onClick={() => handleEnclaveChange(enc.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeEnclaveFilter === enc.key
                    ? 'bg-charcoal text-white shadow-sm'
                    : 'bg-surface-secondary text-charcoal-muted hover:text-charcoal hover:bg-neutral-200/70 border border-[#E7E7E7]'
                }`}
              >
                {enc.label}
              </button>
            ))}
          </div>

          {/* Map Layer / Type Toggle (Google Maps mode) */}
          {isGoogleMapsReady && (
            <div className="hidden lg:flex items-center space-x-1 p-1 bg-surface-secondary rounded-xl border border-[#E7E7E7]">
              {(['roadmap', 'satellite', 'hybrid'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveMapType(type)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                    activeMapType === type
                      ? 'bg-white text-charcoal shadow-sm'
                      : 'text-charcoal-muted hover:text-charcoal'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}

          {/* Reset View Button */}
          <button
            onClick={handleResetView}
            className="p-2.5 rounded-xl border border-[#E7E7E7] hover:border-champagne text-charcoal-muted hover:text-charcoal transition-colors self-end md:self-auto"
            title="Reset to National Overview"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Dedicated Map Canvas Container */}
        <div className="relative w-full h-[540px] sm:h-[620px] lg:h-[700px] rounded-3xl overflow-hidden border border-[#E7E7E7] shadow-luxury bg-white">
          {/* OFFICIAL GOOGLE MAPS CONTAINER */}
          {isGoogleMapsReady ? (
            <div ref={googleMapRef} className="w-full h-full" />
          ) : (
            /* RESILIENT HIGH-PRECISION LEAFLET / CARTODB FALLBACK MAP */
            <div className="relative w-full h-full">
              {/* Fallback Notification Banner */}
              <div className="absolute top-4 left-4 right-4 z-[500] max-w-xl mx-auto p-3 rounded-xl bg-white/95 backdrop-blur-md border border-[#E7E7E7] shadow-lg flex items-center justify-between text-xs text-charcoal">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>
                    Google Maps API Key not detected in environment (<code className="font-mono text-[10px] bg-neutral-100 px-1 py-0.5 rounded">VITE_GOOGLE_MAPS_API_KEY</code>). Displaying high-precision spatial fallback.
                  </span>
                </div>
                <button
                  onClick={() => setApiKeyModalOpen(true)}
                  className="ml-3 px-2.5 py-1 rounded bg-charcoal text-white text-[10px] uppercase tracking-wider font-semibold hover:bg-champagne transition-colors whitespace-nowrap"
                >
                  Add Key
                </button>
              </div>

              <MapContainer
                center={
                  selectedProperty
                    ? [selectedProperty.coordinates.lat, selectedProperty.coordinates.lng]
                    : [21.7679, 78.8718]
                }
                zoom={selectedProperty ? 13 : 5}
                scrollWheelZoom={true}
                className="w-full h-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                <LeafletCenterController
                  coords={selectedProperty ? selectedProperty.coordinates : null}
                />

                {filteredProperties.slice(0, 80).map((prop) => {
                  const isSelected = selectedProperty?.id === prop.id;
                  return (
                    <Marker
                      key={prop.id}
                      position={[prop.coordinates.lat, prop.coordinates.lng]}
                      icon={createLeafletIcon(isSelected, prop.formatted_price_millions)}
                    >
                      <Popup>
                        <div className="p-1 max-w-[220px]">
                          <img
                            src={prop.image}
                            alt={prop.title}
                            className="w-full h-24 object-cover rounded-md mb-2"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/assets/images/hmx_luxury_villa.jpg';
                            }}
                          />
                          <span className="text-[10px] uppercase font-mono text-champagne-dark font-bold block">
                            #{prop.id} • {prop.furnishingstatus}
                          </span>
                          <h4 className="font-editorial text-base font-semibold text-charcoal leading-snug line-clamp-1">
                            {prop.title}
                          </h4>
                          <p className="text-[11px] text-charcoal-muted line-clamp-1 mb-2">
                            {prop.location}
                          </p>
                          <div className="flex items-center justify-between pt-2 border-t border-[#E7E7E7]">
                            <span className="font-editorial text-base font-bold text-charcoal">
                              {prop.formatted_price_millions}
                            </span>
                            <button
                              onClick={() => onSelectProperty(prop)}
                              className="px-2.5 py-1 rounded bg-charcoal text-white text-[10px] uppercase tracking-wider font-semibold hover:bg-champagne transition-colors"
                            >
                              Inspect
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          )}

          {/* Floating Stats & Coordinates Overlay (bottom left) */}
          <div className="absolute bottom-6 left-6 z-[400] glass-panel p-4 rounded-2xl border border-white/80 max-w-xs hidden sm:block pointer-events-auto">
            <span className="text-[10px] uppercase font-bold tracking-widest text-charcoal-muted block mb-1">
              Active Geocoded Nodes
            </span>
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-champagne animate-pulse" />
              <span className="text-xs font-semibold text-charcoal">
                {filteredProperties.length} Residential Estates Indexed
              </span>
            </div>
            <p className="text-[11px] text-charcoal-muted leading-relaxed">
              Spatial nodes mapped to genuine <code className="font-mono text-[10px] text-charcoal">Housing.csv</code> records. Click any pin to open full architectural specifications.
            </p>
          </div>

          {/* Interactive Property Preview Drawer (if selected) */}
          {selectedProperty && (
            <div className="absolute bottom-6 right-6 z-[400] glass-panel p-4 rounded-2xl border border-white/80 max-w-sm pointer-events-auto shadow-2xl animate-fade-in hidden md:block">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-champagne/15 text-champagne-dark font-mono text-[10px] font-bold uppercase">
                    Record #{selectedProperty.id}
                  </span>
                  <span className="text-[11px] text-charcoal-muted font-medium">
                    {selectedProperty.furnishingstatus}
                  </span>
                </div>
                <button
                  onClick={() => onSelectProperty(selectedProperty)}
                  className="text-xs text-champagne-dark hover:text-charcoal font-semibold flex items-center space-x-1"
                >
                  <span>Dossier</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="flex gap-3 mb-3">
                <img
                  src={selectedProperty.image}
                  alt={selectedProperty.title}
                  className="w-20 h-20 rounded-xl object-cover border border-[#E7E7E7]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/images/hmx_luxury_villa.jpg';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-editorial text-lg font-bold text-charcoal truncate">
                    {selectedProperty.title}
                  </h4>
                  <p className="text-[11px] text-charcoal-muted truncate mb-1">
                    {selectedProperty.location}
                  </p>
                  <span className="text-base font-serif font-bold text-charcoal block">
                    {selectedProperty.formatted_price_millions}
                  </span>
                  <span className="text-[10px] text-charcoal-light font-mono">
                    {selectedProperty.area.toLocaleString()} sqft • ₹{selectedProperty.price_per_sqft}/sqft
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#E7E7E7]">
                <button
                  onClick={() => onSelectProperty(selectedProperty)}
                  className="flex-1 py-2 rounded-xl bg-charcoal text-white text-xs font-semibold hover:bg-neutral-800 transition-colors uppercase tracking-wider"
                >
                  Inspect Record
                </button>
                {onValuateProperty && (
                  <button
                    onClick={() => onValuateProperty(selectedProperty)}
                    className="flex-1 py-2 rounded-xl bg-champagne text-white text-xs font-semibold hover:bg-[#D4B890] transition-colors uppercase tracking-wider flex items-center justify-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Valuate</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Google Maps API Key Modal */}
      {apiKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E7E7E7] relative">
            <button
              onClick={() => setApiKeyModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-charcoal-light hover:text-charcoal hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-champagne/15 text-champagne-dark flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-editorial text-2xl font-bold text-charcoal">
                  Google Maps API Configuration
                </h3>
                <span className="text-xs text-charcoal-muted">
                  Official Google Maps JavaScript API v3
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed mb-6 font-light">
              To unlock native Google Maps satellite layers, photorealistic 3D, and Places autocomplete, provide an API key. 
              The application strictly reads secrets via environment variables (<code className="font-mono text-xs bg-neutral-100 px-1 py-0.5 rounded text-charcoal">VITE_GOOGLE_MAPS_API_KEY</code>). You can also test a key in this browser session below.
            </p>

            <form onSubmit={handleApplyCustomKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-2">
                  Session API Key Test
                </label>
                <input
                  type="text"
                  value={customKeyInput}
                  onChange={(e) => setCustomKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-3 rounded-xl bg-surface-secondary border border-[#E7E7E7] text-xs sm:text-sm font-mono text-charcoal focus:outline-none focus:border-champagne"
                />
              </div>

              {mapError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center space-x-2 border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Notice: {mapError}. Spatial fallback remains fully active.</span>
                </div>
              )}

              <div className="p-4 rounded-xl bg-neutral-50 border border-[#E7E7E7] text-xs text-charcoal-muted space-y-1.5 font-light">
                <div className="font-semibold text-charcoal flex items-center space-x-1">
                  <span>How to configure permanently in .env:</span>
                </div>
                <pre className="font-mono text-[11px] bg-white p-2 rounded border border-[#E7E7E7] text-charcoal overflow-x-auto">
                  VITE_GOOGLE_MAPS_API_KEY=your_actual_key_here
                </pre>
                <p className="text-[11px]">
                  Keys are never committed to version control. If no key is set, HMX automatically delivers the high-precision spatial fallback.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setApiKeyModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-charcoal-muted hover:text-charcoal transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-charcoal text-white text-xs uppercase tracking-wider font-semibold hover:bg-champagne transition-colors"
                >
                  Apply & Load
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
