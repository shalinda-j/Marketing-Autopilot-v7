import React, { useState } from 'react';
import { CampaignPlan, ContentSlot } from '../types';
import { MegaphoneIcon, CalendarIcon, FilmIcon, CodeBracketIcon, PhotographIcon, PaintBrushIcon, ChartBarIcon, SparklesIcon, DownloadIcon } from './icons';
import { Spinner } from './Spinner';
import { ProductAdStudio } from './ProductAdStudio';

interface CampaignOutputProps {
  plan: CampaignPlan | null;
  isLoading: boolean;
  generatedMedia: Record<string, { url: string; status: 'complete' }>;
  mediaGenerationStatus: Record<string, { status: 'loading' | 'error' | 'complete'; message: string }>;
  onGenerateMediaForSlot: (slotId: string) => void;
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
                     <p className="text-sm text-gray-500">Media not yet generated</p>
                 </div>
              )}
            </div>
        </div>
    </div>
);

interface MediaGenerationCardProps {
    slot: ContentSlot;
    mediaUrl?: string;
    status?: { status: 'loading' | 'error' | 'complete'; message: string };
    onGenerate: (slotId: string) => void;
}

const MediaGenerationCard: React.FC<MediaGenerationCardProps> = ({ slot, mediaUrl, status, onGenerate }) => {
    const needsImage = slot.visual_prompt && slot.visual_prompt.length > 0;
    const needsVideo = slot.video_storyboard && slot.video_storyboard.length > 0;
    const prompt = needsImage ? slot.visual_prompt : (needsVideo ? slot.video_storyboard.join(' / ') : 'No prompt available.');
    const mediaType = needsImage ? 'Image' : 'Video';

    const isProcessing = status?.status === 'loading';
    const isComplete = status?.status === 'complete' && !!mediaUrl;

    const getButtonText = () => {
        if (isProcessing) return `Generating ${mediaType}...`;
        if (isComplete) return `Re-generate ${mediaType}`;
        return `Generate ${mediaType}`;
    };

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <span className="text-xs uppercase font-bold text-gray-400">{slot.platform} - {slot.post_type}</span>
                <h3 className="text-lg font-bold text-white mb-2">Creative Prompt</h3>
                <div className="bg-gray-900/50 p-3 rounded-lg max-h-40 overflow-y-auto">
                    <p className="text-gray-300 text-sm italic">"{prompt}"</p>
                </div>
                <button
                    onClick={() => onGenerate(slot.slot_id)}
                    disabled={isProcessing}
                    className="w-full mt-4 flex items-center justify-center bg-gradient-to-r from-brand-secondary to-brand-accent text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                    {isProcessing ? <Spinner /> : <SparklesIcon className="w-5 h-5 mr-2" />}
                    {getButtonText()}
                </button>
            </div>
            <div className="aspect-video w-full rounded-2xl bg-gray-900/50 border-2 border-dashed border-gray-700 flex items-center justify-center p-2 relative">
                {isProcessing && (
                    <div className="relative w-full h-full bg-gray-900 rounded-lg flex flex-col items-center justify-center text-center p-4 overflow-hidden">
                        <ShimmerEffect />
                        <Spinner />
                        <p className="mt-2 text-sm text-gray-300">{status?.message || `Generating ${mediaType}...`}</p>
                    </div>
                )}
                {status?.status === 'error' && !isProcessing && <p className="text-red-400 text-sm text-center p-4">{status.message}</p>}
                {isComplete && needsVideo && <video src={mediaUrl} controls autoPlay loop muted className="max-w-full max-h-full rounded-lg" />}
                {isComplete && needsImage && (
                    <>
                        <img src={mediaUrl} alt="Generated marketing" className="max-w-full max-h-full rounded-lg object-contain" />
                        <a 
                            href={mediaUrl} 
                            download={`${slot.slot_id}.png`}
                            className="absolute top-2 right-2 bg-gray-900/70 text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
                            aria-label="Download Image"
                            title="Download Image"
                        >
                            <DownloadIcon className="w-5 h-5" />
                        </a>
                    </>
                )}
                {!isComplete && !isProcessing && status?.status !== 'error' && <p className="text-sm text-gray-500 text-center">Your {mediaType.toLowerCase()} will appear here</p>}
            </div>
        </div>
    );
};


export const CampaignOutput: React.FC<CampaignOutputProps> = ({ plan, isLoading, generatedMedia, mediaGenerationStatus, onGenerateMediaForSlot }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-lg min-h-[70vh]">
        <LoadingSkeleton />
      </div>
    );
  }
  
  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-800/30 border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center min-h-[70vh]">
        <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="text-5xl mb-4 text-gray-600">🚀</div>
            <h2 className="text-2xl font-bold text-white">2. Campaign Plan</h2>
            <p className="text-gray-400 mt-2">Your generated campaign strategy will appear here.</p>
        </div>
      </div>
    );
  }

  const TABS = [
    { label: 'Overview', icon: <ChartBarIcon className="w-5 h-5" /> },
    { label: 'Content Calendar', icon: <CalendarIcon className="w-5 h-5" /> },
    { label: 'Media Plan', icon: <FilmIcon className="w-5 h-5" /> },
    { label: 'Product Ad Studio', icon: <PaintBrushIcon className="w-5 h-5" /> },
    { label: 'Raw JSON', icon: <CodeBracketIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-lg min-h-[70vh]">
      <Tabs tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="pt-6">
        {activeTab === 0 && (
            <div className="space-y-4 animate-fade-in">
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
             <div className="animate-fade-in space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Media Generation Hub</h2>
                    <p className="text-gray-400 mt-1">
                        Create the visual assets for your campaign posts. Prompts are automatically filled from your content calendar.
                    </p>
                </div>
                {(plan.content_calendar || [])
                    .filter(slot => (slot.visual_prompt && slot.visual_prompt.length > 0) || (slot.video_storyboard && slot.video_storyboard.length > 0))
                    .map(slot => (
                        <MediaGenerationCard
                            key={slot.slot_id}
                            slot={slot}
                            mediaUrl={generatedMedia[slot.slot_id]?.url}
                            status={mediaGenerationStatus[slot.slot_id]}
                            onGenerate={onGenerateMediaForSlot}
                        />
                    ))
                }
            </div>
        )}
        {activeTab === 3 && (
            <ProductAdStudio />
        )}
        {activeTab === 4 && (
            <pre className="bg-gray-900 p-4 rounded-lg text-xs text-gray-300 overflow-x-auto max-h-[60vh]">
                <code>{JSON.stringify(plan, null, 2)}</code>
            </pre>
        )}
      </div>
    </div>
  );
};