import React, { useRef, useState } from 'react';
import { ArrowDown, Sparkles, Volume2, VolumeX, Play, Pause, ChevronRight } from 'lucide-react';

interface HeroProps {
  onExploreProperties: () => void;
  onOpenValuation: () => void;
  onDiscoverScroll: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreProperties,
  onOpenValuation,
  onDiscoverScroll,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

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

  return (
    <section id="discover" className="relative w-full h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-black">
      {/* 
        PRESERVED HERO VIDEO ASSET
        Streamed directly from original file 'landing page.mp4' via /videos/hero
      */}
      <img
        src="/assets/images/hmx_glass_pavilion.jpg"
        alt="Architectural Estate"
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/assets/images/hmx_glass_pavilion.jpg"
      >
        <source src="/videos/hero" type="video/mp4" />
        Your browser does not support HTML5 video playback.
      </video>

      {/* Cinematic Contrast Overlay Layer (Leaves original video asset untouched) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/50 z-10 pointer-events-none" />

      {/* Subtle Hairline Frame Lines */}
      <div className="absolute inset-x-8 top-28 bottom-12 border border-white/10 pointer-events-none z-10 hidden sm:block" />

      {/* Hero Typography & Interface Layer */}
      <div className="relative z-20 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-champagne text-[11px] uppercase tracking-[0.25em] font-semibold mb-6 animate-fade-in">
          <Sparkles className="w-3 h-3 text-champagne animate-pulse" />
          <span>INTELLIGENT PROPERTY VALUATION</span>
        </div>

        {/* Master Headline */}
        <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-light tracking-tight leading-[1.05] mb-6 drop-shadow-md">
          Every property has a story.<br />
          <span className="italic font-normal text-white/95">Discover what it's worth.</span>
        </h1>

        {/* Supporting Copy */}
        <p className="max-w-2xl text-base sm:text-lg md:text-xl text-white/80 font-light leading-relaxed mb-10 tracking-wide">
          Understand the value behind every address with data-driven property intelligence.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <button
            onClick={onExploreProperties}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-charcoal text-xs uppercase tracking-[0.18em] font-semibold hover:bg-white/90 hover:shadow-[0_8px_30px_rgba(255,255,255,0.25)] transition-all flex items-center justify-center space-x-3 group"
          >
            <span>Explore a Property</span>
            <ChevronRight className="w-4 h-4 text-champagne transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={onOpenValuation}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 text-white backdrop-blur-md border border-white/30 text-xs uppercase tracking-[0.18em] font-semibold hover:bg-white/20 hover:border-white/50 transition-all flex items-center justify-center space-x-2"
          >
            <span>Valuation Studio</span>
          </button>

          <button
            onClick={onDiscoverScroll}
            className="w-full sm:w-auto px-6 py-4 rounded-full text-white/80 hover:text-white text-xs uppercase tracking-[0.18em] font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <span>Discover HMX</span>
          </button>
        </div>
      </div>

      {/* Floating Video Media Controls (bottom left) */}
      <div className="absolute bottom-8 left-8 z-20 flex items-center space-x-2">
        <button
          onClick={togglePlay}
          className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-md border border-white/15 transition-all text-xs flex items-center justify-center"
          title={isPlaying ? "Pause video" : "Play video"}
          aria-label="Toggle Play"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={toggleMute}
          className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-md border border-white/15 transition-all text-xs flex items-center justify-center"
          title={isMuted ? "Unmute audio" : "Mute audio"}
          aria-label="Toggle Audio"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
        <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest text-white/50 pl-2">
          Cinematic Reel
        </span>
      </div>

      {/* Scroll Indicator (bottom center) */}
      <div
        onClick={onDiscoverScroll}
        className="absolute bottom-8 z-20 cursor-pointer flex flex-col items-center space-y-2 text-white/60 hover:text-white transition-colors"
      >
        <span className="text-[10px] uppercase tracking-[0.25em] font-medium">Scroll to Tour</span>
        <ArrowDown className="w-4 h-4 animate-bounce text-champagne" />
      </div>

      {/* Architectural Coordinates Badge (bottom right) */}
      <div className="hidden md:flex absolute bottom-8 right-8 z-20 flex-col items-end text-right">
        <span className="text-[10px] uppercase tracking-widest text-champagne font-mono">28.5983° N • 77.2346° E</span>
        <span className="text-[10px] text-white/60 tracking-wider">HMX Curated Intelligence</span>
      </div>
    </section>
  );
};
