import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { CampaignInput } from './components/CampaignInput';
import { CampaignOutput } from './components/CampaignOutput';
import { CampaignPlan } from './types';
import { generateCampaignPlan, generateLogo, refineLogo, generateImageFromPrompt, generateVideoFromStoryboard } from './services/geminiService';

const App: React.FC = () => {
  const [campaignPlan, setCampaignPlan] = useState<CampaignPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLogoLoading, setIsLogoLoading] = useState<boolean>(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  const [isRefiningLogo, setIsRefiningLogo] = useState<boolean>(false);
  const [refineLogoError, setRefineLogoError] = useState<string | null>(null);

  // State for generated media from the campaign plan
  const [generatedMedia, setGeneratedMedia] = useState<Record<string, { url: string; status: 'complete' }>>({});
  const [mediaGenerationStatus, setMediaGenerationStatus] = useState<Record<string, { status: 'loading' | 'error' | 'complete'; message: string }>>({});


  const handleGenerateCampaign = useCallback(async (brief: string) => {
    setError(null);
    setCampaignPlan(null);
    setLoading(true);
    setLogoUrl(null);
    setLogoError(null);
    setRefineLogoError(null);
    setGeneratedMedia({});
    setMediaGenerationStatus({});

    try {
      const plan = await generateCampaignPlan(brief);
      setCampaignPlan(plan);
      setLoading(false); // Plan is loaded, now start media generation

      if (plan && plan.media_generation_order) {
        // Find the first content slot that needs an image
        const imageSlot = plan.content_calendar.find(slot => slot.visual_prompt);
        // Find the first content slot that needs a video
        const videoSlot = plan.content_calendar.find(slot => slot.video_storyboard && slot.video_storyboard.length > 0);

        const hasImageStep = plan.media_generation_order.some(step => step.tool.startsWith('imagen'));
        const hasVideoStep = plan.media_generation_order.some(step => step.tool.startsWith('veo'));

        // Generate the first image
        if (hasImageStep && imageSlot) {
            const slotId = imageSlot.slot_id;
            setMediaGenerationStatus(prev => ({ ...prev, [slotId]: { status: 'loading', message: 'Generating image with Imagen 4...' } }));
            
            generateImageFromPrompt(imageSlot.visual_prompt)
                .then(imageUrl => {
                    setGeneratedMedia(prev => ({ ...prev, [slotId]: { url: imageUrl, status: 'complete' } }));
                    setMediaGenerationStatus(prev => ({ ...prev, [slotId]: { status: 'complete', message: 'Image generated!' } }));
                })
                .catch(err => {
                    console.error(err);
                    setMediaGenerationStatus(prev => ({ ...prev, [slotId]: { status: 'error', message: err instanceof Error ? err.message : String(err) } }));
                });
        }
        
        // Generate the first video
        if (hasVideoStep && videoSlot) {
            const slotId = videoSlot.slot_id;
            const progressCallback = (message: string) => {
                 setMediaGenerationStatus(prev => ({ ...prev, [slotId]: { status: 'loading', message } }));
            };

            generateVideoFromStoryboard(videoSlot.video_storyboard, progressCallback)
                .then(videoUrl => {
                    setGeneratedMedia(prev => ({ ...prev, [slotId]: { url: videoUrl, status: 'complete' } }));
                    setMediaGenerationStatus(prev => ({ ...prev, [slotId]: { status: 'complete', message: 'Video ready!' } }));
                })
                .catch(err => {
                    console.error(err);
                    setMediaGenerationStatus(prev => ({ ...prev, [slotId]: { status: 'error', message: err instanceof Error ? err.message : String(err) } }));
                });
        }
      }

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate campaign plan. ${errorMessage} Please check the brief format and your API key.`);
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
    setRefineLogoError(null);
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

  const handleRefineLogo = useCallback(async (prompt: string) => {
    if (!logoUrl) {
      setRefineLogoError("No logo to refine. Please generate a logo first.");
      return;
    }
    if (!prompt.trim()) {
        setRefineLogoError("Please enter a refinement prompt.");
        return;
    }
    
    setRefineLogoError(null);
    setIsRefiningLogo(true);
    setLogoError(null);

    try {
      const newLogoUrl = await refineLogo(logoUrl, prompt);
      setLogoUrl(newLogoUrl);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setRefineLogoError(`Failed to refine logo. ${errorMessage}`);
    } finally {
      setIsRefiningLogo(false);
    }
  }, [logoUrl]);


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
              isRefiningLogo={isRefiningLogo}
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
              onRefineLogo={handleRefineLogo}
              isRefiningLogo={isRefiningLogo}
              refineLogoError={refineLogoError}
              generatedMedia={generatedMedia}
              mediaGenerationStatus={mediaGenerationStatus}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;