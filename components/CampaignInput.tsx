import React, { useState } from 'react';
import { SparklesIcon, PaintBrushIcon } from './icons';
import { Spinner } from './Spinner';

interface CampaignInputProps {
  onGenerate: (brief: string) => void;
  onGenerateLogo: (brief: string) => void;
  isLoading: boolean;
  isLogoLoading: boolean;
  isRefiningLogo: boolean;
}

const exampleBrief = 'Coca-Cola | Coke Zero Sugar | “Summer Vibes, Zero Limits” | Gen-Z festival goers 18-24 | Engagement rate | enterprise | 2025-06-01 | 2025-08-31 | playful, emoji-heavy, inclusive | #ZeroLimitsSummer | coke_zero_summer_25 | 3/wk IG-TK, 2/wk YT-SC, 1/wk TW-LI';

export const CampaignInput: React.FC<CampaignInputProps> = ({ onGenerate, onGenerateLogo, isLoading, isLogoLoading, isRefiningLogo }) => {
  const [brief, setBrief] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (brief.trim()) {
      onGenerate(brief.trim());
    }
  };
  
  const handleUseExample = () => {
    setBrief(exampleBrief);
  };

  const handleLogoClick = () => {
    if (brief.trim()) {
      onGenerateLogo(brief.trim());
    }
  };

  const isAnyLoading = isLoading || isLogoLoading || isRefiningLogo;
  const isBriefEmpty = !brief.trim();

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 h-full flex flex-col shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">1. Campaign Brief</h2>
      <p className="text-sm text-gray-400 mb-4">
        Enter your campaign details as a single line, separated by <code className="bg-gray-900 px-1 py-0.5 rounded-md text-gray-300">|</code>. The AI will generate a complete omni-channel plan.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={8}
          placeholder="BRAND | PRODUCT | THEME | PERSONA | KPI..."
          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition placeholder-gray-500"
          required
        />
        <div className="text-xs text-gray-500 mt-2">
            <button type="button" onClick={handleUseExample} className="text-blue-400 hover:text-blue-300 transition-colors">Use Example</button>
        </div>
        
        <div className="mt-auto pt-6 space-y-3">
          <button
            type="submit"
            disabled={isAnyLoading}
            className="w-full flex items-center justify-center bg-gradient-to-r from-brand-secondary to-brand-accent text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? (
              <>
                <Spinner />
                Generating Campaign...
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5 mr-2" />
                Generate Campaign Plan
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleLogoClick}
            disabled={isAnyLoading || isBriefEmpty}
            className="w-full flex items-center justify-center bg-gray-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLogoLoading ? (
              <>
                <Spinner />
                Generating Logo...
              </>
            ) : (
              <>
                <PaintBrushIcon className="w-5 h-5 mr-2" />
                Generate Brand Logo
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};