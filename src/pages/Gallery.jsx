import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { visualizations, heroText, coreInsight, framingContent, theoreticalLayers } from '../data/concepts';
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

// Medium-sized card for the sticky row
function VisualizationCard({ title, subtitle, description, accent, route, gradient }) {
  const accentColors = getAccent(accent);
  
  return (
    <Link 
      to={route}
      className="group block glass-panel p-4 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-black/20"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
    >
      {/* Gradient preview */}
      <div 
        className={`h-20 rounded-lg mb-3 bg-gradient-to-br ${gradient} opacity-75 group-hover:opacity-100 transition-opacity flex items-center justify-center relative overflow-hidden`}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:16px_16px]" />
        </div>
        <span className="text-2xl text-white/80 group-hover:scale-110 transition-transform">
          {accent === 'zinc' && '▦'}
          {accent === 'green' && '∿'}
          {accent === 'cyan' && '◈'}
          {accent === 'indigo' && '⛰'}
        </span>
      </div>
      
      {/* Content */}
      <h3 
        className="text-sm font-semibold mb-1 group-hover:text-white transition-colors"
        style={{ color: accentColors.primary }}
      >
        {title}
      </h3>
      <p className="text-[10px] text-slate-500 mb-1.5">{subtitle}</p>
      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
        {description}
      </p>
    </Link>
  );
}

export default function Gallery() {
  const [isSticky, setIsSticky] = useState(false);
  const cardRowRef = useRef(null);
  const sentinelRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '0px 0px 0px 0px' }
    );
    
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div className="min-h-screen bg-canvas text-slate-200">
      {/* Hero Section */}
      <header className="relative min-h-[70vh] flex items-center justify-center px-8 pt-16 pb-8">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-transparent to-transparent pointer-events-none" />
        
        {/* Subtle animated gradient */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(34,211,238,0.1) 0%, transparent 50%)',
          }}
        />
        
        <div className="relative max-w-2xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text leading-tight">
            {heroText.title}
          </h1>
          <p className="text-xl text-slate-400 mb-10">{heroText.subtitle}</p>
          
          {/* Core insight */}
          <div className="glass-panel p-6 text-left max-w-lg mx-auto">
            <p className="text-lg text-slate-200 font-medium leading-relaxed">
              {coreInsight.statement}
            </p>
            <p className="text-sm text-slate-400 mt-2">
              {coreInsight.elaboration}
            </p>
          </div>
        </div>
      </header>
      
      {/* Sentinel for detecting when cards should stick */}
      <div ref={sentinelRef} className="h-0" />
      
      {/* Sticky Card Row */}
      <div 
        ref={cardRowRef}
        className={`sticky top-0 z-50 transition-all duration-500 ease-out ${
          isSticky 
            ? 'bg-canvas/95 backdrop-blur-md shadow-2xl shadow-black/30 border-b border-white/5' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="grid grid-cols-4 gap-4">
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
      
      {/* Scroll content that goes behind cards */}
      <main className="relative">
        {/* Gradient overlay at top to create smooth transition */}
        <div 
          className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(to bottom, rgba(10,10,15,0.95) 0%, transparent 100%)',
          }}
        />
        
        {/* Framing Content Sections */}
        <div className="max-w-2xl mx-auto px-8 pt-24 pb-24">
          {framingContent.map((section, index) => (
            <RevealSection key={section.id} delay={index * 100} className="mb-24">
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
          ))}
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
