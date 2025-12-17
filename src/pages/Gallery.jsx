import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { visualizations, heroText, framingContent, theoreticalLayers } from '../data/concepts';
import { getAccent } from '../styles/theme';

// Hook for scroll-based reveal animations
function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
}

// Scroll reveal wrapper component
function RevealSection({ children, className = '', delay = 0 }) {
  const [ref, isVisible] = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// Card for the visualization row - no icons, just gradient preview
function VisualizationCard({ title, subtitle, accent, route, gradient }) {
  const accentColors = getAccent(accent);

  return (
    <Link
      to={route}
      className="group block glass-panel p-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20"
      style={{ borderColor: 'rgba(255,255,255,0.08)' }}
    >
      {/* Gradient preview - no icon */}
      <div
        className={`h-16 rounded-md mb-2.5 bg-gradient-to-br ${gradient} opacity-70 group-hover:opacity-100 transition-opacity relative overflow-hidden`}
      >
        <div className="absolute inset-0 opacity-15">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[length:12px_12px]" />
        </div>
      </div>

      {/* Content */}
      <h3
        className="text-xs font-semibold mb-0.5 group-hover:text-white transition-colors"
        style={{ color: accentColors.primary }}
      >
        {title}
      </h3>
      <p className="text-[10px] text-slate-500 leading-snug">{subtitle}</p>
    </Link>
  );
}

// Card row component to avoid duplication - 3x3 grid
function CardRow({ className = '' }) {
  return (
    <div className={`max-w-4xl mx-auto px-6 py-4 ${className}`}>
      <div className="grid grid-cols-3 gap-3">
        {visualizations.slice(0, 9).map((viz, index) => (
          <div
            key={viz.id}
            className="transition-all duration-500 ease-out"
            style={{
              transitionDelay: `${index * 50}ms`,
            }}
          >
            <VisualizationCard {...viz} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Gallery() {
  // Card positioning state: 'normal' | 'sticky' | 'anchored'
  const [cardMode, setCardMode] = useState('normal');
  const [anchorOffset, setAnchorOffset] = useState(0);
  const topSentinelRef = useRef(null);
  const anchorSentinelRef = useRef(null);
  const cardRowRef = useRef(null);
  const cardRowHeight = 120;

  useEffect(() => {
    const handleScroll = () => {
      if (!topSentinelRef.current || !anchorSentinelRef.current) return;
      
      const topRect = topSentinelRef.current.getBoundingClientRect();
      const anchorRect = anchorSentinelRef.current.getBoundingClientRect();
      
      if (topRect.top >= 0) {
        // Haven't scrolled past the cards yet
        setCardMode('normal');
      } else if (anchorRect.top > cardRowHeight) {
        // Scrolled past cards but not to anchor yet - sticky mode
        setCardMode('sticky');
      } else {
        // Past anchor - cards should be anchored and scroll with content
        setCardMode('anchored');
        // Calculate how far past the anchor we are (negative value)
        setAnchorOffset(anchorRect.top - cardRowHeight);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const introText = `In complex systems, some patterns recur on all scales – from molecules to minds to markets. Scale-free abstractions offer a powerful lens for understanding these patterns. They‘re organised around a central insight: existence is the active maintenance of information closure.`;

  return (
    <div className="min-h-screen bg-canvas text-slate-200">
      {/* Hero Section */}
      <header className="relative min-h-[55vh] flex items-center justify-center px-8 pt-16 pb-8">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-transparent to-transparent pointer-events-none" />

        {/* Subtle animated gradient */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(34,211,238,0.1) 0%, transparent 50%)',
          }}
        />

        <div className="relative max-w-3xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text leading-tight">
            {heroText.title}
          </h1>

          {/* Intro paragraph - larger text, lighter weight */}
          <p className="text-2xl md:text-3xl font-light text-slate-400 leading-relaxed">
            {introText}
          </p>
        </div>
      </header>

      {/* Top sentinel - when this leaves viewport, cards become sticky */}
      <div ref={topSentinelRef} className="h-0" />

      {/* Card Row with three modes: normal (in flow), sticky (fixed), anchored (fixed but scrolls up) */}
      {/* Placeholder to maintain document flow when cards are fixed */}
      {cardMode !== 'normal' && <div style={{ height: cardRowHeight }} />}
      
      <div
        ref={cardRowRef}
        className="z-50 left-0 right-0"
        style={{
          position: cardMode === 'normal' ? 'relative' : 'fixed',
          top: cardMode === 'anchored' ? anchorOffset : 0,
        }}
      >
        <CardRow />
      </div>

      {/* Scroll content */}
      <main className="relative">
        {/* Framing Content Sections */}
        <div className="max-w-2xl mx-auto px-8 pt-16 pb-8">
          {framingContent.map((section, index) => {
            const isLastSection = section.id === 'learning-to-see';
            return (
              <div key={section.id} className="mb-24">
                <RevealSection delay={index * 100}>
                  <h2 className="text-2xl font-semibold mb-4 text-slate-200">
                    {section.title}
                  </h2>
                  <p className="text-lg text-slate-400 leading-relaxed">
                    {section.content}
                  </p>

                  {/* Gradient line */}
                  <div
                    className="mt-8 h-px w-24"
                    style={{
                      background: 'linear-gradient(90deg, rgba(99,102,241,0.5) 0%, transparent 100%)',
                    }}
                  />
                </RevealSection>

                {/* Anchor sentinel after Learning to See */}
                {isLastSection && (
                  <div ref={anchorSentinelRef} className="h-0 mt-8" />
                )}
              </div>
            );
          })}
        </div>

        {/* Theoretical Framework Section */}
        <section className="py-24 border-t border-white/5">
          <div className="max-w-4xl mx-auto px-8">
            <RevealSection>
              <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-cyan-400 to-indigo-400 text-transparent bg-clip-text">
                The Mathematical Architecture
              </h2>
              <p className="text-center text-slate-500 mb-16 max-w-xl mx-auto">
                Six interconnected layers describe what it means to exist—not as static substance but as ongoing process.
              </p>
            </RevealSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {theoreticalLayers.map((layer, index) => (
                <RevealSection key={layer.id} delay={index * 80}>
                  <div className="glass-panel p-5 h-full">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-xs text-slate-600 font-mono">{String(index + 1).padStart(2, '0')}</span>
                      <h3 className="text-sm font-semibold text-slate-200">{layer.title}</h3>
                    </div>
                    <p className="text-xs text-indigo-400/80 mb-2">{layer.subtitle}</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{layer.description}</p>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className="py-24 text-center px-8">
          <RevealSection>
            <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
              The universe doesn't follow laws—it expresses patterns through the collective agency of systems maintaining their existence.
            </p>
            <p className="text-sm text-slate-600 mt-8">
              To exist is to predict. To predict is to persist.
            </p>
          </RevealSection>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-white/5 text-center">
          <p className="text-xs text-slate-600">
            Interactive explorations of complex systems
          </p>
        </footer>
      </main>
    </div>
  );
}
