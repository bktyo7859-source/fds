import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Scrollytelling } from './components/Scrollytelling';
import { PropertyDiscovery } from './components/PropertyDiscovery';
import { InteractiveMap } from './components/InteractiveMap';
import { ValuationStudio } from './components/ValuationStudio';
import { MarketIntelligence } from './components/MarketIntelligence';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { ValuationReportModal } from './components/ValuationReportModal';
import { Footer } from './components/Footer';
import { Property, ValuationResult, ValuationRequestPayload } from './types';
import { getProperties } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('discover');
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyDetailModalOpen, setPropertyDetailModalOpen] = useState<boolean>(false);
  const [valuationPresetProperty, setValuationPresetProperty] = useState<Property | null>(null);

  // PDF Report modal state
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [reportData, setReportData] = useState<{
    result?: ValuationResult | null;
    property?: Property | null;
    formData?: ValuationRequestPayload | null;
    location?: string;
  }>({});

  // Fetch initial batch of properties for the interactive map
  useEffect(() => {
    getProperties({ limit: 80 })
      .then((data) => setAllProperties(data.properties))
      .catch((err) => console.error('Failed to pre-load map properties:', err));
  }, []);

  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property);
    setPropertyDetailModalOpen(true);
  };

  const handleOpenMapWithProperty = (property: Property) => {
    setSelectedProperty(property);
    setActiveTab('map');
    const mapEl = document.getElementById('map');
    if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleValuateWithProfile = (property: Property) => {
    setValuationPresetProperty(property);
    setActiveTab('valuation');
    const valEl = document.getElementById('valuation');
    if (valEl) valEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenReportFromProperty = (property: Property) => {
    setReportData({ property });
    setReportModalOpen(true);
  };

  const handleOpenReportFromResult = (
    result: ValuationResult,
    formData: ValuationRequestPayload,
    location: string
  ) => {
    setReportData({ result, formData, location });
    setReportModalOpen(true);
  };

  const scrollTo = (id: string) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      className="min-h-screen bg-white text-[#111111] selection:bg-[#C5A880]/20 selection:text-[#111111] font-sans antialiased"
      style={{ overflowX: 'clip' }}
    >
      {/* Fixed Luxury Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenValuation={() => scrollTo('valuation')}
      />

      {/* Main Content Layout */}
      <main>
        {/* 1. Cinematic Hero with Untouched Landing Page Video */}
        <Hero
          onExploreProperties={() => scrollTo('properties')}
          onOpenValuation={() => scrollTo('valuation')}
          onDiscoverScroll={() => scrollTo('scrollytelling')}
        />

        {/* 2. Scrollytelling Tour with Preserved Drone House Tour Video */}
        <Scrollytelling
          onExploreProperties={() => scrollTo('properties')}
          onOpenValuation={() => scrollTo('valuation')}
        />

        {/* 3. Verified Property Discovery Archive (Housing.csv) */}
        <PropertyDiscovery
          onSelectProperty={handleSelectProperty}
          onOpenMapWithProperty={handleOpenMapWithProperty}
        />

        {/* 4. Interactive Territorial Map with Geocoded Enclaves */}
        <InteractiveMap
          properties={allProperties}
          selectedProperty={selectedProperty}
          onSelectProperty={handleSelectProperty}
        />

        {/* 5. Machine Learning Valuation Studio (5 Steps, Live ML Inference) */}
        <ValuationStudio
          initialProperty={valuationPresetProperty}
          onOpenReport={handleOpenReportFromResult}
        />

        {/* 6. Market Intelligence Dashboard & Sensitivity Simulator */}
        <MarketIntelligence />
      </main>

      {/* Footer */}
      <Footer />

      {/* Property Detail Modal */}
      {propertyDetailModalOpen && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setPropertyDetailModalOpen(false)}
          onValuateWithProfile={handleValuateWithProfile}
          onOpenReport={handleOpenReportFromProperty}
        />
      )}

      {/* Downloadable PDF Valuation Dossier Modal */}
      {reportModalOpen && (
        <ValuationReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          result={reportData.result}
          property={reportData.property}
          formData={reportData.formData}
          location={reportData.location}
        />
      )}
    </div>
  );
}

export default App;
