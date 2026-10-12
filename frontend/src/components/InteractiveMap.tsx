import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Property } from '../types';
import { MapPin, Maximize2, Bed, Bath, ArrowUpRight, Sparkles } from 'lucide-react';

// Custom Luxury Champagne SVG Marker Icon
const createCustomIcon = (isSelected: boolean, priceMillions: string) => {
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
        box-shadow: 0 4px 14px rgba(0,0,0,0.15);
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 4px;
        transform: translate(-50%, -50%);
        cursor: pointer;
        transition: all 0.2s ease;
      ">
        <span style="color: #C5A880; font-size: 13px;">●</span>
        <span>${priceMillions}</span>
      </div>
    `,
    iconSize: [60, 30],
    iconAnchor: [30, 15],
  });
};

interface InteractiveMapProps {
  properties: Property[];
  selectedProperty: Property | null;
  onSelectProperty: (property: Property) => void;
}

// Subcomponent to animate map center when selectedProperty changes
const MapCenterController: React.FC<{ coords: { lat: number; lng: number } | null }> = ({ coords }) => {
  const map = useMap();
  React.useEffect(() => {
    if (coords) {
      map.flyTo([coords.lat, coords.lng], 12, { duration: 1.2 });
    }
  }, [coords, map]);
  return null;
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  properties,
  selectedProperty,
  onSelectProperty,
}) => {
  const [activeEnclaveFilter, setActiveEnclaveFilter] = useState<string>('all');

  // Enclaves
  const enclaves = [
    { label: 'All Metropolitan Enclaves', key: 'all', center: [20.5937, 78.9629], zoom: 5 },
    { label: 'New Delhi (Golf Links / Panchsheel)', key: 'delhi', center: [28.58, 77.22], zoom: 12 },
    { label: 'Mumbai (Worli / Malabar Hill)', key: 'mumbai', center: [18.98, 72.81], zoom: 12 },
    { label: 'Bengaluru (Sadashivnagar)', key: 'bengaluru', center: [13.01, 77.58], zoom: 12 },
    { label: 'Hyderabad (Jubilee / Banjara Hills)', key: 'hyderabad', center: [17.42, 78.41], zoom: 12 },
  ];

  const filtered = properties.filter((p) => {
    if (activeEnclaveFilter === 'all') return true;
    if (activeEnclaveFilter === 'delhi') return p.location.includes('Delhi');
    if (activeEnclaveFilter === 'mumbai') return p.location.includes('Mumbai');
    if (activeEnclaveFilter === 'bengaluru') return p.location.includes('Bengaluru');
    if (activeEnclaveFilter === 'hyderabad') return p.location.includes('Hyderabad');
    return true;
  });

  const defaultCenter: [number, number] = selectedProperty
    ? [selectedProperty.coordinates.lat, selectedProperty.coordinates.lng]
    : [28.5983, 77.2346];

  return (
    <section id="map" className="w-full py-28 bg-surface-secondary border-b border-[#E7E7E7]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-champagne-subtle border border-champagne/30 text-champagne-dark text-[11px] uppercase tracking-[0.25em] font-semibold mb-4">
              <Sparkles className="w-3 h-3 text-champagne" />
              <span>SPATIAL INTELLIGENCE & ENCLAVES</span>
            </div>
            <h2 className="font-editorial text-4xl sm:text-5xl text-charcoal font-light leading-tight">
              Interactive Territory Map
            </h2>
            <p className="text-sm text-charcoal-muted max-w-xl mt-2 font-light">
              Explore property valuations mapped across regional enclave reference nodes. Click any pin to inspect tabular record specifications and ML estimates.
            </p>
            <p className="text-[11px] text-charcoal-light max-w-xl mt-1 font-mono">
              Note: <code className="bg-white/80 px-1 py-0.5 rounded border border-[#E7E7E7]">Housing.csv</code> records are tabular; pins represent curated regional demonstration enclaves.
            </p>
          </div>

          {/* Enclave Selector Buttons */}
          <div className="mt-6 md:mt-0 flex flex-wrap gap-2">
            {enclaves.map((enc) => (
              <button
                key={enc.key}
                onClick={() => setActiveEnclaveFilter(enc.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeEnclaveFilter === enc.key
                    ? 'bg-charcoal text-white shadow-sm'
                    : 'bg-white text-charcoal-muted border border-[#E7E7E7] hover:border-champagne hover:text-charcoal'
                }`}
              >
                {enc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Map Container */}
        <div className="relative w-full h-[600px] rounded-3xl overflow-hidden border border-[#E7E7E7] shadow-luxury bg-white">
          <MapContainer
            center={defaultCenter}
            zoom={selectedProperty ? 12 : 6}
            scrollWheelZoom={false}
            className="w-full h-full"
          >
            {/* CartoDB Positron Clean Monochrome Luxury Tiles */}
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            <MapCenterController
              coords={selectedProperty ? selectedProperty.coordinates : null}
            />

            {filtered.slice(0, 80).map((prop) => {
              const isSelected = selectedProperty?.id === prop.id;
              return (
                <Marker
                  key={prop.id}
                  position={[prop.coordinates.lat, prop.coordinates.lng]}
                  icon={createCustomIcon(isSelected, prop.formatted_price_millions)}
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

          {/* Floating Map Legend & Stats Overlay (bottom left) */}
          <div className="absolute bottom-6 left-6 z-[1000] glass-panel p-4 rounded-2xl border border-white/80 max-w-xs hidden sm:block">
            <span className="text-[10px] uppercase font-bold tracking-widest text-charcoal-muted block mb-1">
              Active Geocoded Nodes
            </span>
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-champagne animate-pulse" />
              <span className="text-xs font-semibold text-charcoal">
                {filtered.length} Regional Demonstration Enclaves
              </span>
            </div>
            <p className="text-[11px] text-charcoal-muted leading-relaxed">
              Spatial pins represent illustrative regional reference anchors; tabular specifications are sourced directly from <code className="font-mono text-[10px]">Housing.csv</code>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
