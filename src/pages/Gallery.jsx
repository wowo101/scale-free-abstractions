import React from 'react';
import GalleryCard from '../components/gallery/GalleryCard';
import { visualizations, frameworkThemes, heroText, frameworkIntro } from '../data/concepts';

export default function Gallery() {
  return (
    <div className="min-h-screen bg-canvas text-slate-200">
      {/* Hero Section */}
      <header className="relative py-16 px-6 text-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-transparent pointer-events-none" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:60px_60px]" />
        </div>
        
        <div className="relative max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text">
            {heroText.title}
          </h1>
          <p className="text-lg text-slate-400 mb-6">{heroText.subtitle}</p>
          <p className="text-slate-500 leading-relaxed max-w-2xl mx-auto">
            {heroText.intro}
          </p>
        </div>
      </header>
      
      {/* Visualization Cards Grid */}
      <main className="max-w-5xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {visualizations.map(viz => (
            <GalleryCard key={viz.id} {...viz} />
          ))}
        </div>
        
        {/* Framework Section */}
        <section className="border-t border-white/5 pt-12">
          <h2 className="text-xl font-semibold text-center mb-4 text-slate-300">
            Connecting Threads
          </h2>
          <p className="text-sm text-slate-500 text-center max-w-2xl mx-auto mb-10 leading-relaxed">
            {frameworkIntro}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {frameworkThemes.map(theme => (
              <div 
                key={theme.title}
                className="glass-panel p-4 text-center"
              >
                <div className="text-2xl mb-2 text-slate-600">{theme.icon}</div>
                <h3 className="text-sm font-medium text-slate-300 mb-1.5">
                  {theme.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {theme.description}
                </p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-slate-600">
            Interactive explorations of complex systems
          </p>
        </footer>
      </main>
    </div>
  );
}
