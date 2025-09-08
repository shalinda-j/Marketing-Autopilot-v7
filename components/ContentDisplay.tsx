
import React, { useState } from 'react';
import { GeneratedContent, LoadingStates, Platform } from '../types';
import { FilmIcon, MicrophoneIcon, PhotographIcon, DocumentTextIcon } from './icons';
import { Tabs } from './Tabs';

interface ContentDisplayProps {
  content: GeneratedContent;
  loading: LoadingStates;
}

const ShimmerEffect = () => (
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-gray-700/50 to-transparent animate-shimmer" />
);

const LoadingSkeleton: React.FC<{ icon: React.ReactNode; title: string; message?: string; }> = ({ icon, title, message }) => (
    <div className="relative bg-gray-800/50 border border-gray-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center overflow-hidden min-h-[200px]">
        <ShimmerEffect />
        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mb-4 text-gray-400">
            {icon}
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {message && <p className="text-sm text-gray-400 mt-1">{message}</p>}
    </div>
);

const videoMessages = [
    "Crafting the perfect video scenes...",
    "Rendering high-definition frames...",
    "Adding cinematic magic...",
    "This can take a few minutes, good things come to those who wait!",
    "Syncing audio and visuals...",
    "Finalizing the video masterpiece..."
];

const VideoLoadingSkeleton: React.FC = () => {
    const [message, setMessage] = React.useState(videoMessages[0]);
    React.useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(prev => {
                const currentIndex = videoMessages.indexOf(prev);
                const nextIndex = (currentIndex + 1) % videoMessages.length;
                return videoMessages[nextIndex];
            });
        }, 3000);
        return () => clearInterval(intervalId);
    }, []);
    return <LoadingSkeleton icon={<FilmIcon className="w-6 h-6"/>} title="Generating Video" message={message} />;
};

export const ContentDisplay: React.FC<ContentDisplayProps> = ({ content, loading }) => {
  const [activePlatform, setActivePlatform] = useState<Platform>('instagram');

  const platforms: Platform[] = ['instagram', 'facebook', 'twitter'];
  const platformTabs = platforms.map(p => ({
      label: p.charAt(0).toUpperCase() + p.slice(1),
      content: null // Content is rendered outside tabs component
  }));

  const allEmpty = Object.keys(content.platformAssets).length === 0 && !content.videoUrl && !content.audioScript && Object.values(loading).every(v => !v);

  if (allEmpty) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-800/30 border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center min-h-[60vh]">
        <div className="text-5xl mb-4 text-gray-600">✨</div>
        <h2 className="text-2xl font-bold text-white">Your AI Content Hub</h2>
        <p className="text-gray-400 mt-2">Fill out the form, click "Generate", and your multi-platform marketing assets will appear here.</p>
      </div>
    );
  }

  const currentAssets = content.platformAssets[activePlatform];
  const isImageLoading = loading[`${activePlatform}_image`];
  const isAdCopyLoading = loading[`${activePlatform}_adCopy`];

  return (
    <div className="space-y-6 animate-fade-in">
        <div>
             <Tabs 
                tabs={platformTabs} 
                activeTab={platforms.indexOf(activePlatform)}
                setActiveTab={(index) => setActivePlatform(platforms[index])}
            />
            <div className="mt-6 space-y-6">
                 {isAdCopyLoading ? (
                    <LoadingSkeleton icon={<DocumentTextIcon className="w-6 h-6"/>} title={`Generating ${activePlatform} Ad Copy...`} />
                ) : currentAssets?.adCopy && (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-sm font-semibold text-brand-secondary mb-2 uppercase tracking-wider">Generated Ad Copy</h3>
                    <h4 className="text-2xl font-bold text-white">{currentAssets.adCopy.headline}</h4>
                    <p className="text-gray-300 my-3 whitespace-pre-wrap">{currentAssets.adCopy.body}</p>
                    <span className="inline-block bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg text-sm">{currentAssets.adCopy.cta}</span>
                    </div>
                )}

                {isImageLoading ? (
                    <LoadingSkeleton icon={<PhotographIcon className="w-6 h-6"/>} title={`Generating ${activePlatform} Image...`} />
                ) : currentAssets?.imageUrl && (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 shadow-lg">
                    <h3 className="text-sm font-semibold text-brand-secondary mb-3 uppercase tracking-wider px-2">Generated Banner</h3>
                    <img src={currentAssets.imageUrl} alt={`Generated banner for ${activePlatform}`} className="w-full rounded-lg object-cover" />
                    </div>
                )}
            </div>
        </div>

      {loading.video ? (
          <VideoLoadingSkeleton />
      ) : content.videoUrl && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 shadow-lg">
            <h3 className="text-sm font-semibold text-brand-secondary mb-3 uppercase tracking-wider px-2">Generated Video</h3>
            <video src={content.videoUrl} controls autoPlay loop muted className="w-full rounded-lg" />
        </div>
      )}
      
      {loading.audio ? (
        <LoadingSkeleton icon={<MicrophoneIcon className="w-6 h-6"/>} title="Generating Voiceover Script..." />
      ) : content.audioScript && (
         <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 shadow-lg">
          <h3 className="text-sm font-semibold text-brand-secondary mb-2 uppercase tracking-wider flex items-center"><MicrophoneIcon className="w-4 h-4 mr-2" /> Voiceover Script</h3>
          <p className="text-gray-300 my-3 italic">"{content.audioScript}"</p>
        </div>
      )}
    </div>
  );
};
