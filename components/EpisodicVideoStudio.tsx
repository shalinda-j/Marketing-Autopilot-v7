import React, { useState, useCallback } from 'react';
import { generateEpisodePrompts, generateEpisodicVideo } from '../services/geminiService';
import { Spinner } from './Spinner';
import { SparklesIcon, DownloadIcon, FilmIcon } from './icons';

const ShimmerEffect = () => (
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-gray-700/50 to-transparent animate-shimmer" />
);

const VIDEO_QUALITIES = ["360p", "720p", "1080p", "2K", "4K", "8K"];

interface Episode {
  id: number;
  title: string;
  prompt: string;
  status: 'idle' | 'loading' | 'error' | 'complete';
  videoUrl?: string;
  error?: string;
  progressMessage?: string;
}

const EpisodeCard: React.FC<{
  episode: Episode;
  onGenerate: (id: number, prompt: string) => void;
}> = ({ episode, onGenerate }) => {
  const [selectedQuality, setSelectedQuality] = useState('1080p');
  
  const handleDownload = () => {
    if (!episode.videoUrl) return;
    const a = document.createElement('a');
    a.href = episode.videoUrl;
    a.download = `episode_${episode.id}_${episode.title.replace(/\s+/g, '_')}_${selectedQuality}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 md:p-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-bold text-white">
            <span className="text-brand-secondary">E{episode.id}:</span> {episode.title}
          </h3>
          <details className="mt-2">
            <summary className="text-sm text-gray-400 cursor-pointer hover:text-white">View AI Prompt</summary>
            <p className="text-xs text-gray-300 mt-2 p-3 bg-gray-900/50 rounded-lg max-h-24 overflow-y-auto">{episode.prompt}</p>
          </details>
          <button
            onClick={() => onGenerate(episode.id, episode.prompt)}
            disabled={episode.status === 'loading'}
            className="w-full mt-4 flex items-center justify-center bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {episode.status === 'loading' ? <Spinner /> : <FilmIcon className="w-5 h-5 mr-2" />}
            {episode.status === 'loading' ? 'Generating Video...' : (episode.status === 'complete' ? 'Regenerate Video' : 'Generate Video')}
          </button>
        </div>
        <div className="w-full">
            <div className="aspect-video w-full rounded-2xl bg-gray-900/50 border-2 border-dashed border-gray-700 flex items-center justify-center p-2">
                {episode.status === 'loading' && (
                    <div className="w-full h-full bg-gray-900 rounded-lg flex flex-col items-center justify-center text-center p-4 overflow-hidden relative">
                        <ShimmerEffect />
                        <Spinner />
                        <p className="mt-2 text-sm text-gray-300">{episode.progressMessage || 'Initializing...'}</p>
                    </div>
                )}
                {episode.status === 'error' && <p className="text-red-400 text-sm text-center p-4">{episode.error}</p>}
                {episode.status === 'complete' && episode.videoUrl && <video src={episode.videoUrl} controls autoPlay loop muted className="max-w-full max-h-full rounded-lg" />}
                {episode.status === 'idle' && <p className="text-sm text-gray-500 text-center">Video will appear here</p>}
            </div>
            {episode.status === 'complete' && (
                 <div className="mt-3 flex items-center gap-2">
                    <select
                        value={selectedQuality}
                        onChange={(e) => setSelectedQuality(e.target.value)}
                        className="flex-grow bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-brand-secondary transition"
                    >
                        {VIDEO_QUALITIES.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                    <button onClick={handleDownload} className="flex-shrink-0 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        <DownloadIcon className="w-5 h-5 mr-2"/> Download
                    </button>
                 </div>
            )}
        </div>
      </div>
    </div>
  );
};

export const EpisodicVideoStudio: React.FC = () => {
    const [seriesIdea, setSeriesIdea] = useState('');
    const [numEpisodes, setNumEpisodes] = useState(3);
    const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
    const [promptError, setPromptError] = useState<string | null>(null);
    const [episodes, setEpisodes] = useState<Episode[]>([]);

    const handleGeneratePrompts = async () => {
        if (!seriesIdea.trim()) return;
        setIsGeneratingPrompts(true);
        setPromptError(null);
        setEpisodes([]);
        try {
            const results = await generateEpisodePrompts(seriesIdea, numEpisodes);
            setEpisodes(results.map((e, index) => ({ ...e, id: index + 1, status: 'idle' })));
        } catch (err) {
            setPromptError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsGeneratingPrompts(false);
        }
    };

    const handleGenerateVideo = useCallback(async (id: number, prompt: string) => {
        setEpisodes(prev => prev.map(e => e.id === id ? { ...e, status: 'loading', videoUrl: undefined, error: undefined, progressMessage: 'Initializing...' } : e));
        
        const onProgress = (message: string) => {
            setEpisodes(prev => prev.map(e => e.id === id ? { ...e, progressMessage: message } : e));
        };

        try {
            const url = await generateEpisodicVideo(prompt, onProgress);
            setEpisodes(prev => prev.map(e => e.id === id ? { ...e, status: 'complete', videoUrl: url } : e));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setEpisodes(prev => prev.map(e => e.id === id ? { ...e, status: 'error', error: errorMessage } : e));
        }
    }, []);

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-lg min-h-[70vh] animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-2">Episodic Video Studio</h2>
            <p className="text-gray-400 mb-6">Turn a single idea into a multi-episode video series, ready for publishing.</p>

            <div className="bg-gray-800/70 p-6 rounded-2xl border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">1. Series Concept</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <textarea
                        value={seriesIdea}
                        onChange={(e) => setSeriesIdea(e.target.value)}
                        rows={3}
                        placeholder="e.g., A short documentary series about tiny homes..."
                        className="md:col-span-2 w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-secondary transition"
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Number of Episodes</label>
                        <input
                            type="number"
                            value={numEpisodes}
                            onChange={(e) => setNumEpisodes(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            min="1"
                            max="10"
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-secondary transition"
                        />
                    </div>
                </div>
                <button
                    onClick={handleGeneratePrompts}
                    disabled={isGeneratingPrompts || !seriesIdea.trim()}
                    className="w-full mt-4 flex items-center justify-center bg-gradient-to-r from-brand-secondary to-brand-accent text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {isGeneratingPrompts ? <><Spinner /> Generating Episode Plan...</> : <><SparklesIcon className="w-5 h-5 mr-2"/>Generate Episode Plan</>}
                </button>
                {promptError && <p className="text-red-400 text-sm mt-2 text-center">{promptError}</p>}
            </div>

            {episodes.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold text-white mb-4">2. Generate Your Episodes</h3>
                    <div className="space-y-6">
                        {episodes.map(episode => (
                            <EpisodeCard key={episode.id} episode={episode} onGenerate={handleGenerateVideo} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
