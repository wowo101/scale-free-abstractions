import React, { useEffect, useRef, useState } from 'react';
import GalleryCard from '../components/gallery/GalleryCard';
import { visualizations, heroText, coreInsight, framingContent, theoreticalLayers } from '../data/concepts';

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

export default function Gallery() {
  return (
    <div className="min-h-screen bg-canvas text-slate-200">
      {/* Fixed sidebar with visualization cards */}
      <aside className="fixed right-0 top-0 h-screen w-72 p-4 overflow-y-auto z-40 border-l border-white/5 bg-canvas/80 backdrop-blur-sm">
        <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-4 px-1">
          Explorations
        </div>
        <div className="space-y-3">
          {visualizations.map(viz => (
            <GalleryCard key={viz.id} {...viz} compact />
          ))}
        </div>
      </aside>
      
      {/* Main scrollable content */}
      <main className="mr-72 min-h-screen">
        {/* Hero Section */}
        <header className="relative min-h-screen flex items-center justify-center px-8 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-transparent to-canvas pointer-events-none" />
          
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
            <p className="text-xl text-slate-400 mb-12">{heroText.subtitle}</p>
            
            {/* Core insight */}
            <div className="glass-panel p-6 text-left max-w-lg mx-auto">
              <p className="text-lg text-slate-200 font-medium leading-relaxed">
                {coreInsight.statement}
              </p>
              <p className="text-sm text-slate-400 mt-2">
                {coreInsight.elaboration}
              </p>
            </div>
            
            {/* Scroll indicator */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500">
              <span className="text-xs uppercase tracking-widest">Explore</span>
              <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </header>
        
        {/* Framing Content Sections */}
        <div className="max-w-2xl mx-auto px-8 py-24">
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
