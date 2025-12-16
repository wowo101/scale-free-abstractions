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
function RevealSection({ children, className = '', delay = 0, id = null, innerRef = null }) {
  const [ref, isVisible] = useScrollReveal();
  
  return (
    <div
      ref={(node) => {
        ref.current = node;
        if (innerRef) innerRef.current = node;
      }}
      id={id}
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

export default function Gallery() {
  const [isSticky, setIsSticky] = useState(false);
  const [isPastAnchor, setIsPastAnchor] = useState(false);
  const topSentinelRef = useRef(null);
  const anchorSentinelRef = useRef(null);
  const cardRowRef = useRef(null);
  
  useEffect(() => {
    const topObserver = new IntersectionObserver(
      ([entry]) => {
        // When top sentinel is visible, cards are in normal flow
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0 }
    );
    
    const anchorObserver = new IntersectionObserver(
      ([entry]) => {
        // When anchor sentinel leaves top of viewport, cards should unstick
        if (!entry.isIntersecting && entry.boundingClientRect.top < 200) {
          setIsPastAnchor(true);
        } else {
          setIsPastAnchor(false);
        }
      },
      { threshold: 0, rootMargin: '-200px 0px 0px 0px' }
    );
    
    if (topSentinelRef.current) topObserver.observe(topSentinelRef.current);
    if (anchorSentinelRef.current) anchorObserver.observe(anchorSentinelRef.current);
    
    return () => {
      topObserver.disconnect();
      anchorObserver.disconnect();
    };
  }, []);

  const introText = `The same mathematical structures appear across wildly different domains—from chemical reactions to climate systems, from protein folding to cultural evolution, from sandpiles to neural networks. These scale-free abstractions provide a powerful lens for understanding complex systems, organized around a central insight: existence is the active maintenance of information closure, and this maintenance has characteristic structure at every scale.`;
  
  // Determine sticky state: sticky only when past top sentinel AND before anchor
  const shouldBeSticky = isSticky && !isPastAnchor;
  
  return (
    <div className="min-h-screen bg-canvas text-slate-200">
      {/* Hero Section */}
      <header className="relative min-h-[60vh] flex items-center justify-center px-8 pt-16 pb-8">
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
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text leading-tight">
            {heroText.title}
          </h1>
          
          {/* Intro paragraph - same size as title area, lighter weight */}
          <p className="text-xl md:text-2xl font-light text-slate-400 leading-relaxed">
            {introText}
          </p>
        </div>
      </header>
      
      {/* Top sentinel - when this leaves viewport, cards become sticky */}
      <div ref={topSentinelRef} className="h-0" />
      
      {/* Card Row - sticky between sentinels, transparent background */}
      <div 
        ref={cardRowRef}
        className={`z-50 transition-all duration-500 ease-out ${
          shouldBeSticky ? 'sticky top-0' : 'relative'
        }`}
      >
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="grid grid-cols-4 gap-3">
            {visualizations.map((viz, index) => (
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
      </div>
      
      {/* Scroll content */}
      <main className="relative">
        {/* Framing Content Sections */}
        <div className="max-w-2xl mx-auto px-8 pt-16 pb-8">
          {framingContent.map((section, index) => {
            const isLastSection = section.id === 'learning-to-see';
            return (
              <RevealSection 
                key={section.id} 
                delay={index * 100} 
                className="mb-24"
              >
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
                
                {/* Anchor sentinel after Learning to See */}
                {isLastSection && <div ref={anchorSentinelRef} className="h-0 mt-8" />}
              </RevealSection>
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
