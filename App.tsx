import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { CampaignInput } from './components/CampaignInput';
import { CampaignOutput } from './components/CampaignOutput';
import { CampaignPlan } from './types';
import { generateCampaignPlan, generateLogo, generateImageFromPrompt, generateVideoFromStoryboard } from './services/geminiService';

const App: React.FC = () => {
  const [campaignPlan, setCampaignPlan] = useState<CampaignPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLogoLoading, setIsLogoLoading] = useState<boolean>(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  const [generatedMedia, setGeneratedMedia] = useState<Record<string, { url: string; status: 'complete' }>>({});
  const [mediaGenerationStatus, setMediaGenerationStatus] = useState<Record<string, { status: 'loading' | 'error' | 'complete'; message: string }>>({});


  const handleGenerateCampaign = useCallback(async (brief: string) => {
    setError(null);
    setCampaignPlan(null);
    setLoading(true);
    setLogoUrl(null);
    setLogoError(null);
    setGeneratedMedia({});
    setMediaGenerationStatus({});

    try {
      const plan = await generateCampaignPlan(brief);
      setCampaignPlan(plan);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate campaign plan. ${errorMessage} Please check the brief format and your API key.`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGenerateLogo = useCallback(async (brief: string) => {
    if (!brief.trim()) {
      setLogoError("Please enter a campaign brief first to generate a logo.");
      return;
    }
    const parts = brief.split('|').map(p => p.trim());
    if (parts.length < 3 || !parts[0] || !parts[2]) {
      setLogoError("Brief is too short. Please provide at least a Brand and Campaign Theme to generate a logo.");
      return;
    }
    const brand = parts[0];
    const theme = parts[2];

    setLogoError(null);
    setLogoUrl(null);
    setIsLogoLoading(true);

    try {
      const imageUrl = await generateLogo(brand, theme);
      setLogoUrl(imageUrl);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setLogoError(`Failed to generate logo. ${errorMessage}`);
    } finally {
      setIsLogoLoading(false);
    }
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
            <CampaignInput 
              onGenerate={handleGenerateCampaign}
              onGenerateLogo={handleGenerateLogo}
              isLoading={loading}
              isLogoLoading={isLogoLoading}
            />
          </div>
          <div className="lg:col-span-8">
            {error && <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6 animate-fade-in" role="alert">{error}</div>}
            <CampaignOutput 
              plan={campaignPlan} 
              isLoading={loading} 
              logoUrl={logoUrl}
              isLogoLoading={isLogoLoading}
              logoError={logoError}
              generatedMedia={generatedMedia}
              mediaGenerationStatus={mediaGenerationStatus}
              onGenerateMediaForSlot={handleGenerateMediaForSlot}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;