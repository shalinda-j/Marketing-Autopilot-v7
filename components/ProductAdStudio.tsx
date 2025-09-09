import React, { useState, useCallback, useRef, useEffect } from 'react';
import { generateProductVideo, generateProductImage, generateMarketingImagePrompt } from '../services/geminiService';
import { CubeTransparentIcon, UsersIcon, FilmIcon, PhotographIcon, UploadIcon, DownloadIcon } from './icons';
import { Spinner } from './Spinner';

const ShimmerEffect = () => (
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-gray-700/50 to-transparent animate-shimmer" />
);

const ImageUploader: React.FC<{ title: string; onImageSelect: (dataUrl: string) => void; icon: React.ReactNode }> = ({ title, onImageSelect, icon }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                onImageSelect(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full bg-gray-900/50 border-2 border-dashed border-gray-700 rounded-2xl p-4 flex flex-col items-center justify-center hover:border-brand-secondary transition-colors"
            >
                <div className="text-gray-400 mb-2">{icon}</div>
                <span className="text-sm font-semibold text-gray-300">{title}</span>
                <span className="text-xs text-gray-500">Click to upload</span>
            </button>
        </div>
    );
};

const AssetPreview: React.FC<{ src: string | null; title: string; }> = ({ src, title }) => (
    <div>
        <h4 className="text-sm font-bold text-gray-400 mb-2">{title}</h4>
        <div className="aspect-square w-full rounded-2xl bg-gray-900 flex items-center justify-center p-1">
            {src ? (
                <img src={src} alt={title} className="max-w-full max-h-full rounded-lg object-contain" />
            ) : (
                <p className="text-xs text-gray-600">Not uploaded</p>
            )}
        </div>
    </div>
);


export const ProductAdStudio: React.FC = () => {
    const [productImage, setProductImage] = useState<string | null>(null);
    const [characterImage, setCharacterImage] = useState<string | null>(null);

    const [videoScript, setVideoScript] = useState<string>('');
    const [isVideoLoading, setIsVideoLoading] = useState<boolean>(false);
    const [videoError, setVideoError] = useState<string | null>(null);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [videoProgress, setVideoProgress] = useState<string>('');

    const [imagePrompt, setImagePrompt] = useState<string>('');
    const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
    const [imageError, setImageError] = useState<string | null>(null);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [isPromptLoading, setIsPromptLoading] = useState<boolean>(false);
    const [promptError, setPromptError] = useState<string | null>(null);

    useEffect(() => {
        if (productImage && characterImage) {
            const autoFillPrompt = async () => {
                setIsPromptLoading(true);
                setPromptError(null);
                setImagePrompt('');
                try {
                    const prompt = await generateMarketingImagePrompt(productImage, characterImage);
                    setImagePrompt(prompt);
                } catch (err) {
                    setPromptError(err instanceof Error ? err.message : 'Failed to generate prompt.');
                } finally {
                    setIsPromptLoading(false);
                }
            };
            autoFillPrompt();
        }
    }, [productImage, characterImage]);

    const handleGenerateVideo = useCallback(async () => {
        if (!productImage || !characterImage || !videoScript.trim()) return;

        setIsVideoLoading(true);
        setVideoError(null);
        setGeneratedVideoUrl(null);
        setVideoProgress('');
        try {
            const url = await generateProductVideo(productImage, characterImage, videoScript, setVideoProgress);
            setGeneratedVideoUrl(url);
        } catch (err) {
            setVideoError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsVideoLoading(false);
            setVideoProgress('');
        }
    }, [productImage, characterImage, videoScript]);

    const handleGenerateImage = useCallback(async () => {
        if (!productImage || !characterImage || !imagePrompt.trim()) return;
        
        setIsImageLoading(true);
        setImageError(null);
        setGeneratedImageUrl(null);
        try {
            const url = await generateProductImage(productImage, characterImage, imagePrompt);
            setGeneratedImageUrl(url);
        } catch (err) {
            setImageError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsImageLoading(false);
        }
    }, [productImage, characterImage, imagePrompt]);
    
    const canGenerate = !!productImage && !!characterImage;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            {/* Left Column: Controls & Previews */}
            <div className="space-y-6">
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4">1. Upload Assets</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ImageUploader title="Product Image" onImageSelect={setProductImage} icon={<CubeTransparentIcon className="w-8 h-8"/>} />
                        <ImageUploader title="Character Image" onImageSelect={setCharacterImage} icon={<UsersIcon className="w-8 h-8"/>} />
                    </div>
                </div>

                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center"><FilmIcon className="w-6 h-6 mr-2 text-purple-400"/> 2. Generate Video Ad (Veo)</h3>
                    <textarea
                        value={videoScript}
                        onChange={(e) => setVideoScript(e.target.value)}
                        rows={4}
                        placeholder="Enter a script or prompt for your video ad... e.g., 'A short, exciting ad showing someone enjoying this product outdoors.'"
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white disabled:opacity-50"
                        disabled={!canGenerate}
                    />
                    <button onClick={handleGenerateVideo} disabled={!canGenerate || isVideoLoading || !videoScript.trim()} className="w-full mt-3 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg disabled:opacity-50">
                        {isVideoLoading ? <><Spinner /> Generating Video...</> : 'Generate Video'}
                    </button>
                </div>
                
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white flex items-center"><PhotographIcon className="w-6 h-6 mr-2 text-pink-400"/> 3. Generate Marketing Image</h3>
                        {isPromptLoading && <span className="text-sm text-gray-400 flex items-center"><Spinner /> Auto-filling...</span>}
                     </div>
                     <textarea
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        rows={4}
                        placeholder={!canGenerate ? "Upload a product and character image to auto-generate a prompt." : "Auto-generating prompt..."}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white disabled:opacity-50"
                        disabled={!canGenerate || isPromptLoading}
                    />
                    {promptError && <p className="text-red-400 text-sm mt-2">{promptError}</p>}
                    <button onClick={handleGenerateImage} disabled={!canGenerate || isImageLoading || !imagePrompt.trim() || isPromptLoading} className="w-full mt-3 flex items-center justify-center bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg disabled:opacity-50">
                        {isImageLoading ? <><Spinner /> Generating Image...</> : 'Generate Image'}
                    </button>
                </div>

            </div>

            {/* Right Column: Results */}
            <div className="space-y-6">
                <div>
                     <h3 className="text-lg font-semibold text-white mb-2">Asset Previews</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <AssetPreview src={productImage} title="Product" />
                        <AssetPreview src={characterImage} title="Character" />
                    </div>
                </div>
                
                 <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Generated Video</h3>
                    <div className="aspect-video w-full rounded-2xl bg-gray-900/50 border-2 border-dashed border-gray-700 flex items-center justify-center p-2">
                        {isVideoLoading && (
                             <div className="relative w-full h-full bg-gray-900 rounded-lg flex flex-col items-center justify-center text-center p-4 overflow-hidden">
                                <ShimmerEffect />
                                <Spinner/>
                                <p className="mt-2 text-sm text-gray-300">{videoProgress || 'Generating video...'}</p>
                            </div>
                        )}
                        {videoError && !isVideoLoading && <p className="text-red-400 text-sm text-center p-4">{videoError}</p>}
                        {generatedVideoUrl && !isVideoLoading && <video src={generatedVideoUrl} controls autoPlay loop muted className="max-w-full max-h-full rounded-lg" />}
                         {!generatedVideoUrl && !isVideoLoading && !videoError && <p className="text-sm text-gray-500 text-center">Your video ad will appear here</p>}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Generated Image</h3>
                    <div className="aspect-square w-full rounded-2xl bg-gray-900/50 border-2 border-dashed border-gray-700 flex items-center justify-center p-2 relative">
                         {isImageLoading && (
                            <div className="relative w-full h-full bg-gray-900 rounded-lg flex flex-col items-center justify-center text-center p-4 overflow-hidden">
                                <ShimmerEffect />
                                <Spinner/>
                            </div>
                        )}
                        {imageError && !isImageLoading && <p className="text-red-400 text-sm text-center p-4">{imageError}</p>}
                        {generatedImageUrl && !isImageLoading && (
                            <>
                                <img src={generatedImageUrl} alt="Generated marketing" className="max-w-full max-h-full rounded-lg object-contain" />
                                <a 
                                    href={generatedImageUrl} 
                                    download="marketing-image.png"
                                    className="absolute top-2 right-2 bg-gray-900/70 text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
                                    aria-label="Download Image"
                                    title="Download Image"
                                >
                                    <DownloadIcon className="w-5 h-5" />
                                </a>
                            </>
                        )}
                        {!generatedImageUrl && !isImageLoading && !imageError && <p className="text-sm text-gray-500 text-center">Your marketing image will appear here</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};
