import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, ArrowRight } from 'lucide-react';

interface ScrollytellingProps {
  onExploreProperties: () => void;
  onOpenValuation: () => void;
}

const STORY_PHASES = [
  {
    phase: '01',
    eyebrow: 'THE APPROACH & TOPOGRAPHY',
    title: 'Monolithic Geometry In Harmony With Nature',
    description:
      'Sweeping coastal access points and landscaped stone terraces. Every square foot is strategically positioned to capture uninterrupted daylight and cross-ventilation.',
    statLabel: 'Ground Footprint',
    statValue: '7,420 sqft',
    range: [0.0, 0.28],
  },
  {
    phase: '02',
    eyebrow: 'VOLUMES & INTERIOR CONTINUITY',
    title: 'Uncompromised Architectural Proportions',
    description:
      'Seamless structural transitions between grand public living halls and private retreat wings. Natural travertine limestone pairs with bespoke acoustic glass facades.',
    statLabel: 'Ceiling Clearance',
    statValue: '4.2m Double Height',
    range: [0.28, 0.58],
  },
  {
    phase: '03',
    eyebrow: 'TACTILE FINISHES & SPECIFICATIONS',
    title: 'Precision-Engineered Luxury Amenities',
    description:
      'Integrated multizone climate automation, private subterranean wellness suites, and radiant hydronic heating. Features verified by HMX valuation weights.',
    statLabel: 'Specification Tier',
    statValue: 'Prime Preferred (A+)',
    range: [0.58, 0.82],
  },
  {
    phase: '04',
    eyebrow: 'PROVENANCE & HORIZON',
    title: 'From Spatial Emotion To Absolute Market Value',
    description:
      'The intrinsic value of rare architectural real estate transcends simple square footage. HMX AI blends spatial excellence with verified market transactions.',
    statLabel: 'Valuation Range',
    statValue: '₹9.8M – ₹13.3M',
    range: [0.82, 1.0],
  },
];

export const Scrollytelling: React.FC<ScrollytellingProps> = ({
  onExploreProperties: _onExploreProperties,
  onOpenValuation,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [isManualPlaying, setIsManualPlaying] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Synchronization refs to prevent seek-abort loops and decoder blackouts
  const isSeekingRef = useRef<boolean>(false);
  const pendingSeekTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const targetTimeRef = useRef<number>(0);

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Check if video is already ready from cache
  useEffect(() => {
    if (videoRef.current && videoRef.current.readyState >= 1) {
      setIsVideoReady(true);
    }
  }, []);

  // Safe video seeking pipeline
  const performSeek = useCallback((targetTime: number) => {
    const video = videoRef.current;
    if (!video || !video.duration || Number.isNaN(video.duration)) return;

    const clamped = Math.max(0, Math.min(targetTime, video.duration - 0.05));

    // If already in an active seek, queue the latest target time
    if (isSeekingRef.current) {
      pendingSeekTimeRef.current = clamped;
      return;
    }

    // Ignore micro-seeks to avoid unnecessary decoder work
    if (Math.abs(video.currentTime - clamped) < 0.06) {
      return;
    }

    isSeekingRef.current = true;
    try {
      if ('fastSeek' in video && typeof (video as any).fastSeek === 'function') {
        (video as any).fastSeek(clamped);
      } else {
        video.currentTime = clamped;
      }
    } catch {
      isSeekingRef.current = false;
    }
  }, []);

  // Handle seeked event: release lock and execute queued seek if target changed
  const handleSeeked = useCallback(() => {
    isSeekingRef.current = false;
    if (pendingSeekTimeRef.current !== null) {
      const nextTime = pendingSeekTimeRef.current;
      pendingSeekTimeRef.current = null;
      performSeek(nextTime);
    }
  }, [performSeek]);

  // RAF-throttled scroll handler
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const containerHeight = containerRef.current.offsetHeight - window.innerHeight;
      if (containerHeight <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.min(Math.max(scrolled / containerHeight, 0), 1);
      setScrollProgress(progress);

      // Update active storytelling phase
      const phaseIdx = STORY_PHASES.findIndex(
        (p) => progress >= p.range[0] && progress <= p.range[1]
      );
      if (phaseIdx !== -1) {
        setCurrentPhaseIndex(phaseIdx);
      }

      // Scrub video when not in manual playback and not prefers-reduced-motion
      if (!isManualPlaying && !prefersReducedMotion && videoRef.current && videoRef.current.duration) {
        const targetTime = progress * videoRef.current.duration;
        targetTimeRef.current = targetTime;
        performSeek(targetTime);
      }
    });
  }, [isManualPlaying, prefersReducedMotion, performSeek]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    // Trigger initial calculation
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [handleScroll]);

  // Video loaded metadata handler
  const handleLoadedMetadata = () => {
    setIsVideoReady(true);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const toggleManualPlay = () => {
    if (!videoRef.current) return;
    if (isManualPlaying) {
      videoRef.current.pause();
      setIsManualPlaying(false);
    } else {
      videoRef.current.play();
      setIsManualPlaying(true);
    }
  };

  const activePhase = STORY_PHASES[currentPhaseIndex] || STORY_PHASES[0];

  return (
    <section
      id="scrollytelling"
      ref={containerRef}
      className="relative w-full h-[320vh] bg-[#0E0E0E] text-white"
    >
      {/* Sticky Cinematic Viewport */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        {/* 
          FALLBACK LUXURY ARCHITECTURAL POSTER
          Always renders behind the video to ensure zero black screens before, during, or after video decode
        */}
        <img
          src="/assets/images/hmx_luxury_villa.jpg"
          alt="Monolithic Architectural Villa"
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        />

        {/* 
          SUPPLIED SCROLL-ANIMATION VIDEO ASSET
          Streamed directly from original 'scroll down\Real Estate - FPV Drone...' via /videos/scroll
        */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500"
          style={{ opacity: isVideoReady ? 1 : 0.8 }}
          muted
          playsInline
          preload="auto"
          poster="/assets/images/hmx_luxury_villa.jpg"
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={() => setIsVideoReady(true)}
          onSeeked={handleSeeked}
          onTimeUpdate={() => {
            if (isManualPlaying && videoRef.current && videoRef.current.duration) {
              const prog = videoRef.current.currentTime / videoRef.current.duration;
              setScrollProgress(prog);
              const idx = STORY_PHASES.findIndex(
                (p) => prog >= p.range[0] && prog <= p.range[1]
              );
              if (idx !== -1) setCurrentPhaseIndex(idx);
            }
          }}
        >
          <source src="/videos/scroll" type="video/mp4" />
          Your browser does not support HTML5 video playback.
        </video>

        {/* Sophisticated Dark Luxury Vignette & Contrast Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/25 to-black/65 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/35 z-10 pointer-events-none" />

        {/* Section Top Header & Coordinates */}
        <div className="absolute top-8 left-8 right-8 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex items-center space-x-3">
            <span className="w-2 h-2 rounded-full bg-champagne animate-ping" />
            <span className="text-[11px] uppercase tracking-[0.25em] text-white/70 font-medium">
              FPV Architectural Narrative Tour
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-4 text-[11px] text-white/50 tracking-widest font-mono">
            <span>SCRUB: {Math.round(scrollProgress * 100)}%</span>
            <span>•</span>
            <span>PHASE {activePhase.phase}/04</span>
          </div>
        </div>

        {/* Floating Scrollytelling Editorial Content Card */}
        <div className="relative z-20 max-w-7xl w-full mx-auto px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pointer-events-none">
          {/* Main Story Card (Left Side) */}
          <div className="lg:col-span-6 bg-black/60 backdrop-blur-2xl border border-white/15 p-8 sm:p-10 rounded-2xl shadow-2xl pointer-events-auto transition-all duration-500">
            {/* Animated card body on phase change */}
            <div key={activePhase.phase} className="transition-all duration-300">
              {/* Phase Tag */}
              <div className="flex items-center space-x-3 mb-4">
                <span className="px-2.5 py-1 rounded bg-champagne/20 border border-champagne/40 text-champagne text-[10px] font-mono font-bold tracking-widest">
                  ACT {activePhase.phase}
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-champagne/90 font-semibold">
                  {activePhase.eyebrow}
                </span>
              </div>

              {/* Headline */}
              <h2 className="font-editorial text-2xl sm:text-4xl text-white font-light leading-tight mb-4">
                {activePhase.title}
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-base text-white/80 font-light leading-relaxed mb-6">
                {activePhase.description}
              </p>

              {/* Architectural Stat Highlight */}
              <div className="pt-5 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-white/50">
                    {activePhase.statLabel}
                  </span>
                  <span className="text-base sm:text-lg font-serif font-semibold text-champagne">
                    {activePhase.statValue}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={onOpenValuation}
                    className="px-4 py-2 rounded-full bg-champagne hover:bg-champagne-light text-charcoal text-[11px] uppercase tracking-wider font-semibold transition-all flex items-center space-x-1.5 shadow-md"
                  >
                    <span>Valuate Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Floating Indicator Elements */}
          <div className="hidden lg:flex lg:col-span-6 flex-col items-end space-y-4">
            {STORY_PHASES.map((p, idx) => (
              <div
                key={p.phase}
                className={`transition-all duration-500 flex items-center space-x-3 ${
                  idx === currentPhaseIndex
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-30 translate-x-4'
                }`}
              >
                <div className="text-right">
                  <span className="block text-[11px] uppercase tracking-wider font-medium text-white">
                    {p.eyebrow}
                  </span>
                  <span className="text-[10px] text-white/60">{p.statValue}</span>
                </div>
                <div
                  className={`w-3 h-3 rounded-full border transition-all ${
                    idx === currentPhaseIndex
                      ? 'bg-champagne border-champagne scale-125'
                      : 'border-white/40'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Interactive Scrub Bar & Controls */}
        <div className="absolute bottom-8 left-8 right-8 z-20 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Play/Pause & Scrub Info */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleManualPlay}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all flex items-center justify-center shadow-sm"
              title={isManualPlaying ? 'Pause video' : 'Play video automatically'}
              aria-label="Toggle Drone Tour Playback"
            >
              {isManualPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <span className="text-xs text-white/70 tracking-wide font-light">
              {isManualPlaying
                ? 'Autoplaying FPV Drone Tour'
                : prefersReducedMotion
                ? 'Reduced motion mode: Scroll down to progress story acts'
                : 'Scroll down to scrub cinematic footage'}
            </span>
          </div>

          {/* Scrub Progress Bar */}
          <div className="w-full sm:w-80 flex items-center space-x-3">
            <span className="text-[10px] font-mono text-white/50">0%</span>
            <div className="relative flex-1 h-1.5 bg-white/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-champagne to-white rounded-full transition-all duration-75"
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-white/50">100%</span>
          </div>
        </div>
      </div>
    </section>
  );
};
