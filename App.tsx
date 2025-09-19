import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { CampaignInput } from './components/CampaignInput';
import { CampaignOutput } from './components/CampaignOutput';
import { CampaignPlan } from './types';
import { generateCampaignPlan, generateImageFromPrompt, generateVideoFromStoryboard, generateBriefFromUrl, setApiConfig } from './services/geminiService';
import { EpisodicVideoStudio } from './components/EpisodicVideoStudio';
import ApiConfigPanel from './components/ApiConfigPanel';

const App: React.FC = () => {
  const [campaignPlan, setCampaignPlan] = useState<CampaignPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'campaign' | 'episodic'>('campaign');
  const [apiKey, setApiKey] = useState<string>('');

  const [generatedMedia, setGeneratedMedia] = useState<Record<string, { url: string; status: 'complete' }>>({});
  const [mediaGenerationStatus, setMediaGenerationStatus] = useState<Record<string, { status: 'loading' | 'error' | 'complete'; message: string }>>({});

  // Load API key from localStorage on app start
  useEffect(() => {
    const savedApiKey = localStorage.getItem('geminiApiKey') || '';
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setApiConfig(savedApiKey);
    }
  }, []);

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('geminiApiKey', newApiKey);
    setApiConfig(newApiKey);
  };

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


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-screen-2xl mx-auto">
          <div className="lg:col-span-4">
            <ApiConfigPanel 
              onApiKeyChange={handleApiKeyChange}
              currentApiKey={apiKey}
            />
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
  );
};

export default App;