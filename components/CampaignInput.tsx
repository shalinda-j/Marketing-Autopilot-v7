import React, { useState } from 'react';
import { SparklesIcon, TvIcon } from './icons';
import { Spinner } from './Spinner';

interface CampaignInputProps {
  onGenerate: (brief: string) => void;
  onOpenEpisodicStudio: () => void;
  isLoading: boolean;
  isStudioActive: boolean;
}

const exampleBrief = 'Coca-Cola | Coke Zero Sugar | “Summer Vibes, Zero Limits” | Gen-Z festival goers 18-24 | Engagement rate | enterprise | 2025-06-01 | 2025-08-31 | playful, emoji-heavy, inclusive | #ZeroLimitsSummer | coke_zero_summer_25 | 3/wk IG-TK, 2/wk YT-SC, 1/wk TW-LI';

export const CampaignInput: React.FC<CampaignInputProps> = ({ onGenerate, onOpenEpisodicStudio, isLoading, isStudioActive }) => {
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

  const handleStudioClick = () => {
    onOpenEpisodicStudio();
  };

  const isBriefEmpty = !brief.trim();

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 flex flex-col shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">1. Choose Your Tool</h2>
      <p className="text-sm text-gray-400 mb-4">
        Enter a brief to generate a full campaign, or open the studio to create an episodic video series.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={8}
          placeholder="For Campaign Plan: BRAND | PRODUCT | THEME..."
          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition placeholder-gray-500"
        />
        <div className="text-xs text-gray-500 mt-2">
            <button type="button" onClick={handleUseExample} className="text-blue-400 hover:text-blue-300 transition-colors">Use Example</button>
        </div>
        
        <div className="mt-auto pt-6 space-y-3">
          <button
            type="submit"
            disabled={isLoading || isBriefEmpty}
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
            onClick={handleStudioClick}
            disabled={isLoading}
            className={`w-full flex items-center justify-center font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
              isStudioActive 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            <TvIcon className="w-5 h-5 mr-2" />
            Episodic Video Studio
          </button>
        </div>
      </form>
    </div>
  );
};