import React, { useRef, useState, useEffect } from 'react';
import {
  ArrowDown,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  MapPin,
  ChevronRight,
  Film,
  Compass
} from 'lucide-react';

interface HeroProps {
  onExploreProperties: () => void;
  onOpenValuation: () => void;
  onDiscoverScroll: () => void;
  onOpenMap?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreProperties,
  onOpenValuation,
  onDiscoverScroll,
  onOpenMap,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeReel, setActiveReel] = useState<'shanghai' | 'architectural'>('shanghai');

  // Exact real filenames in public/videos
  const shanghaiVideoEncoded =
    "/videos/Shanghai,%20China's%20MEGA%20City%20_%20Breathtaking%208K%20Night%20Video%20by%20DJI%20Inspire%203%20-%20(1080p).mp4";
  const shanghaiVideoRaw =
    "/videos/Shanghai, China's MEGA City _ Breathtaking 8K Night Video by DJI Inspire 3 - (1080p).mp4";
  const architecturalVideo = "/videos/landing page.mp4";

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((e) => {
          console.warn('Autoplay initiated in muted state:', e);
        });
    }
  }, [activeReel]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleReel = () => {
    setActiveReel((prev) => (prev === 'shanghai' ? 'architectural' : 'shanghai'));
  };

  return (
    <section
      id="discover"
      className="relative w-full min-h-[100svh] flex items-center justify-center overflow-hidden"
      style={{ position: 'relative', minHeight: '100svh', overflow: 'hidden' }}
    >
      {/* 
        Step 3: REAL HTML5 VIDEO ELEMENT
        Exact verified video file added by user:
        'Shanghai, China's MEGA City _ Breathtaking 8K Night Video by DJI Inspire 3 - (1080p).mp4'
      */}
      <video
        ref={videoRef}
        key={activeReel}
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        {activeReel === 'shanghai' ? (
          <>
            <source src={shanghaiVideoEncoded} type="video/mp4" />
            <source src={shanghaiVideoRaw} type="video/mp4" />
            <source src="/videos/cinematic" type="video/mp4" />
          </>
        ) : (
          <>
            <source src={architecturalVideo} type="video/mp4" />
            <source src="/videos/hero" type="video/mp4" />
          </>
        )}
        Your browser does not support HTML5 video playback.
      </video>

      {/* Non-opaque subtle contrast gradient layer so video is clearly visible behind text */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)',
          zIndex: 1,
        }}
      />

      {/* Subtle Hairline Frame Lines */}
      <div className="absolute inset-x-8 top-24 bottom-12 border border-white/10 pointer-events-none hidden sm:block" style={{ zIndex: 1 }} />

      {/* Hero Typography & Interface Layer */}
      <div className="hero-content relative max-w-5xl mx-auto px-6 text-center flex flex-col items-center pt-16">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-champagne text-[11px] sm:text-xs uppercase tracking-[0.25em] font-semibold mb-6 animate-fade-in shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-champagne animate-pulse" />
          <span>INTELLIGENT PROPERTY VALUATION & SPATIAL INTELLIGENCE</span>
        </div>

        {/* Master Headline */}
        <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-light tracking-tight leading-[1.05] mb-6 drop-shadow-2xl">
          Every property has a story.<br />
          <span className="italic font-normal text-white/95">Discover what it's truly worth.</span>
        </h1>

        {/* Supporting Copy */}
        <p className="max-w-2xl text-base sm:text-lg md:text-xl text-white/90 font-light leading-relaxed mb-10 tracking-wide drop-shadow-md">
          Understand the value behind every address with empirical gradient boosting machine learning and real-time spatial enclave analytics.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          {/* Primary CTA: Open Interactive Google Maps */}
          <button
            id="hero-map-cta"
            onClick={onOpenMap || onDiscoverScroll}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-charcoal text-xs uppercase tracking-[0.18em] font-semibold hover:bg-[#F2ECE1] hover:shadow-[0_8px_30px_rgba(255,255,255,0.3)] transition-all flex items-center justify-center space-x-3 group"
          >
            <MapPin className="w-4 h-4 text-champagne" />
            <span>Interactive Google Maps</span>
            <ChevronRight className="w-4 h-4 text-champagne transition-transform group-hover:translate-x-1" />
          </button>

          {/* Secondary CTA: Valuation Studio */}
          <button
            id="hero-valuation-cta"
            onClick={onOpenValuation}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 text-white backdrop-blur-md border border-white/30 text-xs uppercase tracking-[0.18em] font-semibold hover:bg-white/20 hover:border-white/50 transition-all flex items-center justify-center space-x-2 shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5 text-champagne" />
            <span>Launch Valuation Studio</span>
          </button>

          {/* Tertiary CTA: Explore Properties */}
          <button
            id="hero-explore-cta"
            onClick={onExploreProperties}
            className="w-full sm:w-auto px-6 py-4 rounded-full text-white/80 hover:text-white text-xs uppercase tracking-[0.18em] font-medium transition-colors flex items-center justify-center space-x-2 hover:bg-white/5 border border-transparent hover:border-white/10"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explore 545 Estates</span>
          </button>
        </div>
      </div>

      {/* Floating Video Media Controls (bottom left) */}
      <div className="absolute bottom-8 left-6 sm:left-10 flex items-center space-x-2" style={{ zIndex: 3 }}>
        <button
          onClick={togglePlay}
          className="p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white backdrop-blur-md border border-white/20 transition-all text-xs flex items-center justify-center shadow-lg hover:scale-105 active:scale-95"
          title={isPlaying ? 'Pause video' : 'Play video'}
          aria-label="Toggle Play"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={toggleMute}
          className="p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white backdrop-blur-md border border-white/20 transition-all text-xs flex items-center justify-center shadow-lg hover:scale-105 active:scale-95"
          title={isMuted ? 'Unmute audio' : 'Mute audio'}
          aria-label="Toggle Audio"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* Video Reel Switcher Button */}
        <button
          onClick={toggleReel}
          className="hidden sm:inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white backdrop-blur-md border border-white/20 transition-all text-[11px] font-medium shadow-lg hover:border-champagne"
          title="Switch cinematic reel"
        >
          <Film className="w-3 h-3 text-champagne" />
          <span>
            {activeReel === 'shanghai' ? 'Shanghai 8K Night Reel' : 'Architectural Reel'}
          </span>
          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/15 text-champagne font-mono">
            {activeReel === 'shanghai' ? 'DJI Inspire 3' : 'Original'}
          </span>
        </button>
      </div>

      {/* Scroll Indicator (bottom center) */}
      <div
        onClick={onDiscoverScroll}
        className="absolute bottom-8 cursor-pointer flex flex-col items-center space-y-1.5 text-white/70 hover:text-white transition-colors group"
        style={{ zIndex: 3 }}
      >
        <span className="text-[10px] uppercase tracking-[0.25em] font-medium group-hover:text-champagne transition-colors">
          Scroll to Explore
        </span>
        <ArrowDown className="w-4 h-4 animate-bounce text-champagne" />
      </div>

      {/* Architectural Coordinates Badge (bottom right) */}
      <div className="hidden md:flex absolute bottom-8 right-6 sm:right-10 flex-col items-end text-right" style={{ zIndex: 3 }}>
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-black/40 backdrop-blur-md border border-white/10 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest text-champagne font-mono font-semibold">
            28.5983° N • 77.2346° E
          </span>
        </div>
        <span className="text-[10px] text-white/60 tracking-wider font-light">
          HMX Spatial Intelligence Terminal
        </span>
      </div>
    </section>
  );
};
