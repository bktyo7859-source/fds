import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, BarChart3, Building2, MapPin, Menu, X, ArrowUpRight } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenValuation: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenValuation }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'scrollytelling', label: 'Tour', icon: Building2 },
    { id: 'properties', label: 'Properties', icon: Building2 },
    { id: 'map', label: 'Spatial Map', icon: MapPin },
    { id: 'valuation', label: 'Valuation Studio', icon: Sparkles },
    { id: 'analytics', label: 'Market Intelligence', icon: BarChart3 },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'py-3 bg-white/80 backdrop-blur-xl border-b border-[#E7E7E7] shadow-[0_4px_24px_rgba(0,0,0,0.03)]'
          : 'py-6 bg-gradient-to-b from-black/60 via-black/30 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        {/* Brand Mark */}
        <div
          onClick={() => handleNavClick('discover')}
          className="cursor-pointer group flex items-center space-x-3"
        >
          <div className="w-9 h-9 rounded-sm border border-champagne/40 bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:border-champagne transition-colors">
            <span className={`font-serif text-lg font-bold ${isScrolled ? 'text-charcoal' : 'text-white'}`}>
              H
            </span>
          </div>
          <div className="flex flex-col">
            <span
              className={`font-serif tracking-[0.2em] font-semibold text-lg transition-colors leading-none ${
                isScrolled ? 'text-charcoal' : 'text-white'
              }`}
            >
              HMX
            </span>
            <span
              className={`text-[9px] uppercase tracking-[0.3em] font-medium transition-colors ${
                isScrolled ? 'text-charcoal-muted' : 'text-white/70'
              }`}
            >
              Homes, Understood.
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-3.5 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-300 flex items-center space-x-1.5 ${
                  isActive
                    ? isScrolled
                      ? 'bg-charcoal text-white shadow-sm'
                      : 'bg-white/20 text-white backdrop-blur-md border border-white/30'
                    : isScrolled
                    ? 'text-charcoal-graphite hover:text-charcoal hover:bg-black/5'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5 opacity-80" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Button */}
        <div className="hidden sm:flex items-center space-x-3">
          <button
            onClick={() => {
              setActiveTab('valuation');
              onOpenValuation();
            }}
            className="btn-champagne px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold flex items-center space-x-2 group"
          >
            <span>Valuation Studio</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-md transition-colors ${
              isScrolled ? 'text-charcoal' : 'text-white'
            }`}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-2xl border-b border-[#E7E7E7] px-6 py-6 space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-charcoal hover:bg-surface-secondary text-left transition-colors"
              >
                <Icon className="w-4 h-4 text-champagne" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-3 border-t border-[#E7E7E7]">
            <button
              onClick={() => {
                setActiveTab('valuation');
                onOpenValuation();
                setMobileMenuOpen(false);
              }}
              className="w-full btn-champagne py-3 rounded-full text-xs uppercase tracking-wider font-semibold flex items-center justify-center space-x-2"
            >
              <span>Explore Valuation Studio</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
