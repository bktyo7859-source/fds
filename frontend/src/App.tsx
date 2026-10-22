import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { IntroductionHighlights } from './components/IntroductionHighlights';
import { GoogleMapsSection } from './components/GoogleMapsSection';
import { PropertyDiscovery } from './components/PropertyDiscovery';
import { Scrollytelling } from './components/Scrollytelling';
import { ValuationStudio } from './components/ValuationStudio';
import { MarketIntelligence } from './components/MarketIntelligence';
import { CallToAction } from './components/CallToAction';
import { Footer } from './components/Footer';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { ValuationReportModal } from './components/ValuationReportModal';
import { Property, ValuationResult, ValuationRequestPayload } from './types';
import { getProperties } from './services/api';
import { FALLBACK_PROPERTIES } from './data/fallbackProperties';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('discover');
  const [allProperties, setAllProperties] = useState<Property[]>(FALLBACK_PROPERTIES);
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

  // Fetch initial batch of properties for the interactive map and discovery
  useEffect(() => {
    getProperties({ limit: 100 })
      .then((data) => {
        if (data.properties && data.properties.length > 0) {
          setAllProperties(data.properties);
        }
      })
      .catch((err) => {
        console.warn('Using authentic dataset archive fallback properties:', err);
      });
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

      {/* Main Content Layout — Sequenced according to specification */}
      <main>
        {/* 1. Full-Screen Cinematic Video Hero (Shanghai 8K Night Reel + Controls) */}
        <Hero
          onExploreProperties={() => scrollTo('properties')}
          onOpenValuation={() => scrollTo('valuation')}
          onDiscoverScroll={() => scrollTo('highlights')}
          onOpenMap={() => scrollTo('map')}
        />

        {/* 2. Introduction and Key Highlights (4 Core Pillars & Verification) */}
        <IntroductionHighlights
          onExploreMap={() => scrollTo('map')}
          onOpenValuation={() => scrollTo('valuation')}
          onExploreProperties={() => scrollTo('properties')}
        />

        {/* 3. Interactive Google Maps Section (Official JS API v3 + Fallback) */}
        <GoogleMapsSection
          properties={allProperties}
          selectedProperty={selectedProperty}
          onSelectProperty={handleSelectProperty}
          onValuateProperty={handleValuateWithProfile}
        />

        {/* 4. Featured Locations & Relevant Project Content */}
        <section id="project-content">
          {/* 4a. Verified Property Discovery Archive (Housing.csv) */}
          <PropertyDiscovery
            onSelectProperty={handleSelectProperty}
            onOpenMapWithProperty={handleOpenMapWithProperty}
          />

          {/* 4b. Machine Learning Valuation Studio (5 Steps, Live ML Inference) */}
          <ValuationStudio
            initialProperty={valuationPresetProperty}
            onOpenReport={handleOpenReportFromResult}
          />

          {/* 4c. Scrollytelling Tour with Preserved Drone House Tour Video */}
          <Scrollytelling
            onExploreProperties={() => scrollTo('properties')}
            onOpenValuation={() => scrollTo('valuation')}
          />

          {/* 4d. Market Intelligence Dashboard & Sensitivity Simulator */}
          <MarketIntelligence />
        </section>

        {/* 5. Call-to-Action Section */}
        <CallToAction
          onOpenValuation={() => scrollTo('valuation')}
          onExploreMap={() => scrollTo('map')}
          onExploreProperties={() => scrollTo('properties')}
        />
      </main>

      {/* 6. Professional Footer */}
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
