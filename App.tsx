

import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { CampaignInput } from './components/CampaignInput';
import { CampaignOutput } from './components/CampaignOutput';
import { CampaignPlan } from './types';
import { generateCampaignPlan, generateImageFromPrompt, generateVideoFromStoryboard, generateBriefFromUrl } from './services/geminiService';
import { EpisodicVideoStudio } from './components/EpisodicVideoStudio';
import { FaSun, FaMoon, FaMagic } from 'react-icons/fa';

const App: React.FC = () => {
  const [campaignPlan, setCampaignPlan] = useState<CampaignPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'campaign' | 'episodic'>('campaign');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [generatedMedia, setGeneratedMedia] = useState<Record<string, { url: string; status: 'complete' }>>({});
  const [mediaGenerationStatus, setMediaGenerationStatus] = useState<Record<string, { status: 'loading' | 'error' | 'complete'; message: string }>>({});


  const handleGenerateCampaign = useCallback(async (brief: string) => {
    setError(null);
    setCampaignPlan(null);
    setGeneratedMedia({});
    setMediaGenerationStatus({});
    setView('campaign'); // Ensure we are on the campaign view

    try {
      const plan = await generateCampaignPlan(brief);
      setCampaignPlan(plan);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate campaign plan. ${errorMessage} Please check the brief format and your API key.`);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  }, []);
  
  const handleGenerateFromBrief = useCallback(async (brief: string) => {
    setLoadingMessage('Generating campaign from brief...');
    setLoading(true);
    await handleGenerateCampaign(brief);
  }, [handleGenerateCampaign]);

  const handleGenerateFromUrl = useCallback(async (url: string) => {
    setLoadingMessage('Analyzing website...');
    setLoading(true);
    setError(null);
    setCampaignPlan(null);

    try {
      const brief = await generateBriefFromUrl(url);
      setLoadingMessage('Brief created! Generating campaign...');
      await handleGenerateCampaign(brief);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate campaign from URL. ${errorMessage}`);
      setLoading(false);
      setLoadingMessage('');
    }
  }, [handleGenerateCampaign]);

  const handleOpenEpisodicStudio = useCallback(() => {
    setView('episodic');
    // Clear campaign-specific state if needed
    setCampaignPlan(null);
    setError(null);
  }, []);

  const handleGenerateMediaForSlot = useCallback(async (slotId: string) => {
    if (!campaignPlan) return;

    const slot = campaignPlan.content_calendar.find(s => s.slot_id === slotId);
    if (!slot) {
        console.error("Slot not found:", slotId);
        setMediaGenerationStatus(prev => ({ ...prev, [slotId]: { status: 'error', message: 'Content slot definition not found.' } }));
        return;
    }

    const needsImage = slot.visual_prompt && slot.visual_prompt.length > 0;
    const needsVideo = slot.video_storyboard && slot.video_storyboard.length > 0;

    if (needsImage) {
        setMediaGenerationStatus(prev => ({ ...prev, [slotId]: { status: 'loading', message: 'Generating image with Imagen...' } }));
        try {
            const imageUrl = await generateImageFromPrompt(slot.visual_prompt);
            setGeneratedMedia(prev => ({ ...prev, [slotId]: { url: imageUrl, status: 'complete' } }));
            setMediaGenerationStatus(prev => ({ ...prev, [slotId]: { status: 'complete', message: 'Image generated!' } }));
        } catch (err) {
            console.error(err);
            setMediaGenerationStatus(prev => ({ ...prev, [slotId]: { status: 'error', message: err instanceof Error ? err.message : String(err) } }));
        }
    } else if (needsVideo) {
         const progressCallback = (message: string) => {
             setMediaGenerationStatus(prev => ({ ...prev, [slotId]: { status: 'loading', message } }));
        };
        progressCallback('Initializing video generation...');
        try {
            const videoUrl = await generateVideoFromStoryboard(slot.video_storyboard, progressCallback);
            setGeneratedMedia(prev => ({ ...prev, [slotId]: { url: videoUrl, status: 'complete' } }));
            setMediaGenerationStatus(prev => ({ ...prev, [slotId]: { status: 'complete', message: 'Video ready!' } }));
        } catch (err) {
            console.error(err);
            setMediaGenerationStatus(prev => ({ ...prev, [slotId]: { status: 'error', message: err instanceof Error ? err.message : String(err) } }));
        }
    } else {
        console.warn("Slot has no media prompt:", slotId);
    }
  }, [campaignPlan]);



  // Remove theme state and effect

  return (
  <div className="min-h-screen font-sans bg-gray-900 text-gray-200">
      <Header />
      <div className="flex min-h-[90vh]">
        {/* Sidebar Navigation */}
        <aside className={`hidden md:flex flex-col bg-gray-800/90 border-r border-gray-700 p-0 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`} style={{ minWidth: sidebarCollapsed ? '4rem' : '16rem' }}>
          <div className="flex flex-col h-full">
            <div className="px-3 py-5 border-b border-gray-700 flex items-center gap-3 justify-between">
              <div className="flex items-center gap-3">
                <FaMagic className="text-brand-secondary w-6 h-6" />
                {!sidebarCollapsed && <span className="font-bold text-lg tracking-wide">Studios</span>}
              </div>
              <button
                className="p-1 rounded hover:bg-gray-700 transition-colors"
                onClick={() => setSidebarCollapsed((c) => !c)}
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
            </div>
            <nav className={`flex-1 flex flex-col gap-1 ${sidebarCollapsed ? 'items-center px-0 py-4' : 'px-2 py-4'}`}>
              <button
                className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg transition-colors font-medium text-base ${view === 'campaign' ? 'bg-brand-secondary/20 text-brand-secondary' : 'hover:bg-gray-700/60 text-gray-200'} ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                onClick={() => setView('campaign')}
                title="Campaign Studio"
              >
                <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-600/10 rounded-lg"><FaMagic className="text-blue-400 w-5 h-5" /></span>
                {!sidebarCollapsed && 'Campaign Studio'}
              </button>
              <button
                className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg transition-colors font-medium text-base ${view === 'episodic' ? 'bg-purple-600/20 text-purple-400' : 'hover:bg-gray-700/60 text-gray-200'} ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                onClick={() => setView('episodic')}
                title="Episodic Video Studio"
              >
                <span className="inline-flex items-center justify-center w-7 h-7 bg-purple-600/10 rounded-lg"><FaMoon className="text-purple-400 w-5 h-5" /></span>
                {!sidebarCollapsed && 'Episodic Video Studio'}
              </button>
            </nav>
          </div>
        </aside>
        {/* Main Content */}
  <main className={`flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 ${sidebarCollapsed ? 'ml-0' : ''}`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-screen-2xl mx-auto">
            <div className="lg:col-span-4">
              <CampaignInput
                onGenerateFromBrief={handleGenerateFromBrief}
                onGenerateFromUrl={handleGenerateFromUrl}
                onOpenEpisodicStudio={handleOpenEpisodicStudio}
                isLoading={loading}
                loadingMessage={loadingMessage}
                isStudioActive={view === 'episodic'}
              />
            </div>
            <div className="lg:col-span-8">
              {error && <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6 animate-fade-in" role="alert">{error}</div>}

              {view === 'campaign' && (
                <CampaignOutput
                  plan={campaignPlan}
                  isLoading={loading}
                  generatedMedia={generatedMedia}
                  mediaGenerationStatus={mediaGenerationStatus}
                  onGenerateMediaForSlot={handleGenerateMediaForSlot}
                />
              )}

              {view === 'episodic' && <EpisodicVideoStudio />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
