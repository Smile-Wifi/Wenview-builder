import React from 'react';
import { Smartphone, Terminal, BookOpen, Layers } from 'lucide-react';

interface WizardHeaderProps {
  currentStep: number;
  onNavigateTab: (tab: 'wizard' | 'logs' | 'docs' | 'preview') => void;
  activeTab: 'wizard' | 'logs' | 'docs' | 'preview';
  onReset: () => void;
}

export const WizardHeader: React.FC<WizardHeaderProps> = ({
  currentStep,
  onNavigateTab,
  activeTab,
  onReset,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold text-lg">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-100 tracking-tight whitespace-nowrap">
              HTML → APK Studio
            </span>
            <span className="text-xs text-slate-400 font-mono">Capacitor v6 Engine</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => onNavigateTab('wizard')}
            className={`flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'wizard' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Wizard (Step {currentStep}/10)</span>
          </button>

          <button
            onClick={() => onNavigateTab('preview')}
            className={`flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'preview' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Device Preview</span>
          </button>

          <button
            onClick={() => onNavigateTab('logs')}
            className={`flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'logs' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Build Console</span>
          </button>

          <button
            onClick={() => onNavigateTab('docs')}
            className={`flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'docs' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Architecture & Specs</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onReset}
            type="button"
            className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            Reset Form
          </button>
        </div>
      </div>
    </header>
  );
};
