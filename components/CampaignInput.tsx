
import React, { useState } from 'react';
import { SparklesIcon, TvIcon, GlobeAltIcon } from './icons';
import { Spinner } from './Spinner';

interface CampaignInputProps {
  onGenerateFromBrief: (brief: string) => void;
  onGenerateFromUrl: (url: string) => void;
  onOpenEpisodicStudio: () => void;
  isLoading: boolean;
  loadingMessage: string;
  isStudioActive: boolean;
}

const exampleBrief = 'Coca-Cola | Coke Zero Sugar | “Summer Vibes, Zero Limits” | Gen-Z festival goers 18-24 | Engagement rate | enterprise | 2025-06-01 | 2025-08-31 | playful, emoji-heavy, inclusive | #ZeroLimitsSummer | coke_zero_summer_25 | 3/wk IG-TK, 2/wk YT-SC, 1/wk TW-LI';

export const CampaignInput: React.FC<CampaignInputProps> = ({ onGenerateFromBrief, onGenerateFromUrl, onOpenEpisodicStudio, isLoading, loadingMessage, isStudioActive }) => {
  const [inputMode, setInputMode] = useState<'brief' | 'website'>('brief');
  const [brief, setBrief] = useState<string>('');
  const [url, setUrl] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMode === 'brief' && brief.trim()) {
      onGenerateFromBrief(brief.trim());
    } else if (inputMode === 'website' && url.trim()) {
      onGenerateFromUrl(url.trim());
    }
  };
  
  const handleUseExample = () => {
    setInputMode('brief');
    setBrief(exampleBrief);
  };

  const handleStudioClick = () => {
    onOpenEpisodicStudio();
  };

  const isInputEmpty = (inputMode === 'brief' && !brief.trim()) || (inputMode === 'website' && !url.trim());
  
  const getButtonText = () => {
    if (!isLoading) return 'Generate Campaign Plan';
    return loadingMessage || 'Generating...';
  };


  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 flex flex-col shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">1. Create Campaign</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
        <div className="flex border-b border-gray-700 mb-4">
            <button type="button" onClick={() => setInputMode('brief')} className={`py-2 px-4 text-sm font-medium transition-colors ${inputMode === 'brief' ? 'border-b-2 border-brand-secondary text-white' : 'text-gray-400 hover:text-white'}`}>
                From Brief
            </button>
            <button type="button" onClick={() => setInputMode('website')} className={`py-2 px-4 text-sm font-medium transition-colors ${inputMode === 'website' ? 'border-b-2 border-brand-secondary text-white' : 'text-gray-400 hover:text-white'}`}>
                From Website URL
            </button>
        </div>

        {inputMode === 'brief' && (
            <div className="animate-fade-in">
                <textarea
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  rows={8}
                  placeholder="BRAND | PRODUCT | THEME..."
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition placeholder-gray-500"
                />
                <div className="text-xs text-gray-500 mt-2">
                    <button type="button" onClick={handleUseExample} className="text-blue-400 hover:text-blue-300 transition-colors">Use Example</button>
                </div>
            </div>
        )}

        {inputMode === 'website' && (
            <div className="animate-fade-in">
                 <label htmlFor="website-url" className="flex items-center text-sm font-medium text-gray-400 mb-2">
                    <GlobeAltIcon className="w-4 h-4 mr-1.5" />
                    Enter a URL to a product or service
                </label>
                <input
                  id="website-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/product-page"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition placeholder-gray-500"
                />
                <p className="text-xs text-gray-500 mt-2">We'll analyze the page to automatically create a marketing brief.</p>
            </div>
        )}

        <div className="mt-auto pt-6 space-y-3">
          <button
            type="submit"
            disabled={isLoading || isInputEmpty}
            className="w-full flex items-center justify-center bg-gradient-to-r from-brand-secondary to-brand-accent text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? (
              <>
                <Spinner />
                {getButtonText()}
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
