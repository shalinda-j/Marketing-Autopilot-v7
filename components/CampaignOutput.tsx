import React, { useState } from 'react';
import { CampaignPlan, ContentSlot } from '../types';
import { MegaphoneIcon, CalendarIcon, FilmIcon, CodeBracketIcon, PhotographIcon, PaintBrushIcon, SparklesIcon } from './icons';
import { Spinner } from './Spinner';

interface CampaignOutputProps {
  plan: CampaignPlan | null;
  isLoading: boolean;
  logoUrl: string | null;
  isLogoLoading: boolean;
  logoError: string | null;
  onRefineLogo: (prompt: string) => void;
  isRefiningLogo: boolean;
  refineLogoError: string | null;
  generatedMedia: Record<string, { url: string; status: 'complete' }>;
  mediaGenerationStatus: Record<string, { status: 'loading' | 'error' | 'complete'; message: string }>;
}

const ShimmerEffect = () => (
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-gray-700/50 to-transparent animate-shimmer" />
);

const LoadingSkeleton = () => (
    <div className="space-y-6">
        <div className="relative h-10 w-1/3 bg-gray-700 rounded-lg overflow-hidden"><ShimmerEffect /></div>
        <div className="relative h-40 bg-gray-800 rounded-2xl overflow-hidden"><ShimmerEffect /></div>
        <div className="relative h-60 bg-gray-800 rounded-2xl overflow-hidden"><ShimmerEffect /></div>
    </div>
);

const Tabs: React.FC<{ tabs: { label: string; icon: React.ReactNode }[]; activeTab: number; setActiveTab: (index: number) => void; }> = ({ tabs, activeTab, setActiveTab }) => (
    <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(index)}
              className={`${
                activeTab === index
                  ? 'border-brand-secondary text-brand-secondary'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
              } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
);

interface PostCardProps {
    post: ContentSlot;
    mediaUrl?: string;
    status?: { status: 'loading' | 'error' | 'complete'; message: string };
}

const PostCard: React.FC<PostCardProps> = ({ post, mediaUrl, status }) => (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 md:p-6 mb-4 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <span className="text-xs uppercase font-bold text-gray-400">{post.platform} - {post.post_type}</span>
                        <h3 className="text-lg font-bold text-white">{post.schedule_payload?.scheduled_at ? new Date(post.schedule_payload.scheduled_at).toLocaleString() : 'Unscheduled'}</h3>
                    </div>
                    <div className="flex -space-x-1">
                        {(post.color_palette || []).map(color => (
                            <div key={color} className="w-5 h-5 rounded-full border-2 border-gray-800" style={{ backgroundColor: color }} title={color} />
                        ))}
                    </div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                    {post.copy?.primary && <p className="text-gray-300 whitespace-pre-wrap">"{post.copy.primary}"</p>}
                    {post.copy?.cta && <p className="text-blue-400 font-semibold mt-2">{post.copy.cta}</p>}
                </div>
                <details className="mt-3 text-sm text-gray-400">
                    <summary className="cursor-pointer hover:text-white transition-colors">Show full generation details...</summary>
                    <div className="mt-3 space-y-3 pt-3 border-t border-gray-700">
                        {post.visual_prompt && <div><strong className="text-gray-300">Visual Prompt:</strong> <code className="text-xs bg-gray-900 p-1 rounded-md">{post.visual_prompt}</code></div>}
                        {(post.hashtags || []).length > 0 && <div><strong className="text-gray-300">Hashtags:</strong> {(post.hashtags || []).join(' ')}</div>}
                        {post.voice_over?.text && <div><strong className="text-gray-300">Voiceover Script:</strong> <em>"{post.voice_over.text}"</em></div>}
                        {post.deep_link && <div><strong className="text-gray-300">Deep Link:</strong> <a href={post.deep_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{post.deep_link}</a></div>}
                    </div>
                </details>
            </div>

            <div className="min-h-[200px]">
              <h4 className="text-xs uppercase font-bold text-gray-400 mb-2">Generated Media</h4>
              {mediaUrl && post.post_type === 'reel' && (
                 <video src={mediaUrl} controls autoPlay loop muted className="w-full rounded-lg max-h-96" />
              )}
              {mediaUrl && post.post_type !== 'reel' && (
                 <img src={mediaUrl} alt={post.copy?.alt_text || 'Generated visual'} className="w-full rounded-lg" />
              )}
              {status?.status === 'loading' && (
                 <div className="relative w-full aspect-video bg-gray-900 rounded-lg flex flex-col items-center justify-center text-center p-4 overflow-hidden">
                    <ShimmerEffect />
                    <Spinner />
                    <p className="text-sm text-gray-300 mt-2">{status.message}</p>
                 </div>
              )}
               {status?.status === 'error' && (
                 <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg" role="alert">
                    <p className="font-bold">Media Generation Failed</p>
                    <p className="text-sm">{status.message}</p>
                 </div>
              )}
              {!mediaUrl && !status && (
                 <div className="w-full aspect-video bg-gray-900/50 rounded-lg flex items-center justify-center">
                     <p className="text-sm text-gray-500">Media will be generated here...</p>
                 </div>
              )}
            </div>
        </div>
    </div>
);

const LogoRefineForm: React.FC<{ onRefine: (prompt: string) => void; isLoading: boolean; }> = ({ onRefine, isLoading }) => {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            onRefine(prompt);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-2 max-w-md">
            <label htmlFor="refine-prompt" className="block text-sm font-medium text-gray-300 flex items-center">
                <SparklesIcon className="w-4 h-4 mr-1.5 text-yellow-400" /> Refine with AI (Nano Banana)
            </label>
            <div className="flex space-x-2">
                <input
                    id="refine-prompt"
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., make it more futuristic..."
                    className="flex-grow bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition placeholder-gray-500"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !prompt.trim()}
                    className="flex items-center justify-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                    {isLoading ? <Spinner /> : 'Refine'}
                </button>
            </div>
        </form>
    );
};

const mediaToolInfo: { [key: string]: { icon: React.ReactNode; name: string; description: string; color: string; } } = {
  'imagen3': { icon: <PhotographIcon className="w-6 h-6" />, name: 'Imagen 4', description: 'Generate Image', color: 'pink-400' },
  'imagen-4.0-generate-001': { icon: <PhotographIcon className="w-6 h-6" />, name: 'Imagen 4', description: 'Generate Image', color: 'pink-400' },
  'veo2': { icon: <FilmIcon className="w-6 h-6" />, name: 'Veo 2', description: 'Create Video', color: 'purple-400' },
  'veo-2.0-generate-001': { icon: <FilmIcon className="w-6 h-6" />, name: 'Veo 2', description: 'Create Video', color: 'purple-400' },
  'gemini-2.5-flash-image-preview': { icon: <PaintBrushIcon className="w-6 h-6" />, name: 'Nano Banana', description: 'Refine Image', color: 'yellow-400' },
  'chirp3': { icon: <MegaphoneIcon className="w-6 h-6" />, name: 'Chirp 3', description: 'Generate Voiceover', color: 'teal-400' },
};


export const CampaignOutput: React.FC<CampaignOutputProps> = ({ plan, isLoading, logoUrl, isLogoLoading, logoError, onRefineLogo, isRefiningLogo, refineLogoError, generatedMedia, mediaGenerationStatus }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-lg min-h-[70vh]">
        <LoadingSkeleton />
      </div>
    );
  }

  const LogoDisplay = () => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2 text-white">Generated Brand Logo</h3>
      {isLogoLoading && (
         <div className="relative w-40 h-40 bg-gray-800 rounded-lg overflow-hidden">
            <ShimmerEffect />
         </div>
      )}
      {logoError && !isLogoLoading && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg max-w-md" role="alert">
          <p className="font-bold">Logo Generation Failed</p>
          <p className="text-sm">{logoError}</p>
        </div>
      )}
      {logoUrl && !isLogoLoading && (
        <div className="animate-fade-in">
            <div className="relative bg-white p-2 rounded-lg inline-block shadow-lg">
              <img src={logoUrl} alt="Generated brand logo" className="w-40 h-40 object-contain rounded-md" />
              {isRefiningLogo && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                    <Spinner />
                  </div>
              )}
            </div>
            <LogoRefineForm onRefine={onRefineLogo} isLoading={isRefiningLogo} />
        </div>
      )}
       {refineLogoError && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg max-w-md mt-4" role="alert">
            <p className="font-bold">Logo Refinement Failed</p>
            <p className="text-sm">{refineLogoError}</p>
          </div>
      )}
    </div>
  );


  if (!plan) {
    return (
      <div className="flex flex-col items-start justify-start h-full bg-gray-800/30 border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center min-h-[70vh]">
        {(isLogoLoading || logoUrl || logoError || isRefiningLogo || refineLogoError) ? (
          <div className="w-full text-left">
            <LogoDisplay />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="text-5xl mb-4 text-gray-600">🚀</div>
            <h2 className="text-2xl font-bold text-white">2. Campaign Plan</h2>
            <p className="text-gray-400 mt-2">Your generated campaign strategy will appear here.</p>
          </div>
        )}
      </div>
    );
  }

  const TABS = [
    { label: 'Overview', icon: <MegaphoneIcon className="w-5 h-5" /> },
    { label: 'Content Calendar', icon: <CalendarIcon className="w-5 h-5" /> },
    { label: 'Media Plan', icon: <FilmIcon className="w-5 h-5" /> },
    { label: 'Raw JSON', icon: <CodeBracketIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-lg min-h-[70vh]">
      <Tabs tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="pt-6">
        {activeTab === 0 && (
            <div className="space-y-4 animate-fade-in">
                {(isLogoLoading || logoUrl || logoError || isRefiningLogo || refineLogoError) && <LogoDisplay />}
                
                <h2 className="text-3xl font-bold text-white">{plan.campaign_id}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 p-4 rounded-lg"><strong className="block text-gray-400">Brand</strong>{plan.brand}</div>
                    <div className="bg-gray-800/50 p-4 rounded-lg"><strong className="block text-gray-400">Target Persona</strong>{plan.persona}</div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">Key Performance Indicators (KPIs)</h3>
                    <div className="bg-gray-800/50 p-4 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(plan.kpis || {}).map(([key, value]) => (
                            <div key={key}><strong className="block text-gray-400 uppercase">{key}</strong>{value}</div>
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold mb-2">Automation & Reporting</h3>
                    <div className="bg-gray-800/50 p-4 rounded-lg space-y-2">
                        <p><strong className="text-gray-400">Auto-Reply Trigger:</strong> {(plan.auto_reply_template?.positive_keywords || []).join(', ')}</p>
                        <p><strong className="text-gray-400">Auto-Reply Message:</strong> {plan.auto_reply_template?.reply}</p>
                        <p><strong className="text-gray-400">Reporting Webhook:</strong> <code className="text-xs">{plan.reporting_webhook}</code></p>
                    </div>
                </div>
            </div>
        )}
        {activeTab === 1 && (
            <div>
                {(plan.content_calendar || []).map(post => (
                  <PostCard 
                    key={post.slot_id} 
                    post={post}
                    mediaUrl={generatedMedia[post.slot_id]?.url}
                    status={mediaGenerationStatus[post.slot_id]}
                  />)
                )}
            </div>
        )}
        {activeTab === 2 && (
            <div className="animate-fade-in">
              <div className="flex flex-col items-center">
                {(plan.media_generation_order || []).map((step, index, arr) => {
                   const tool = mediaToolInfo[step.tool] || { icon: <CodeBracketIcon className="w-6 h-6" />, name: step.tool, description: 'Custom Step', color: 'gray-400' };
                   const sourceKey = step.prompt_key || step.storyboard_key || step.script_key;

                   return (
                     <React.Fragment key={step.step}>
                       <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 w-full max-w-2xl shadow-lg">
                         <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-full bg-gray-900 border-2 border-${tool.color} text-${tool.color}`}>
                                {tool.icon}
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">STEP {step.step}: {tool.description}</p>
                                <h4 className="text-lg font-bold text-white">{tool.name}</h4>
                            </div>
                            <div className="flex-grow text-right">
                                <span className={`text-xs font-mono px-2 py-1 bg-gray-900 rounded-md text-gray-300`}>{step.mime}</span>
                            </div>
                         </div>
                         <div className="mt-3 pl-16 text-sm">
                           {sourceKey && <p className="text-gray-400">Source: <code className="text-xs">{sourceKey}</code></p>}
                           {step.output_size && <p className="text-gray-400">Size: <code className="text-xs">{step.output_size}</code></p>}
                           {step.duration && <p className="text-gray-400">Duration: <code className="text-xs">{step.duration}</code></p>}
                         </div>
                       </div>
                       
                       {index < arr.length - 1 && (
                         <div className="w-1 h-8 bg-gray-700 my-1" />
                       )}
                     </React.Fragment>
                   );
                })}
              </div>
            </div>
        )}
        {activeTab === 3 && (
            <pre className="bg-gray-900 p-4 rounded-lg text-xs text-gray-300 overflow-x-auto max-h-[60vh]">
                <code>{JSON.stringify(plan, null, 2)}</code>
            </pre>
        )}
      </div>
    </div>
  );
};