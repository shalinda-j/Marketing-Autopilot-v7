import React, { useState, useCallback, useRef, useEffect } from 'react';
import { generateImageFromPrompt, editImage } from '../services/geminiService';
import { PhotographIcon, SparklesIcon, PaintBrushIcon, UploadIcon } from './icons';
import { Spinner } from './Spinner';

const ShimmerEffect = () => (
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-gray-700/50 to-transparent animate-shimmer" />
);

const ImageDisplay: React.FC<{ src: string | null; title: string; isLoading: boolean; error: string | null; emptyMessage: string; }> = ({ src, title, isLoading, error, emptyMessage }) => (
    <div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <div className="aspect-square w-full rounded-2xl bg-gray-900/50 border-2 border-dashed border-gray-700 flex items-center justify-center p-2">
            {isLoading && (
                <div className="relative w-full h-full bg-gray-900 rounded-lg flex flex-col items-center justify-center text-center p-4 overflow-hidden">
                    <ShimmerEffect />
                    <Spinner/>
                    <p className="mt-2 text-sm text-gray-400">Working on it...</p>
                </div>
            )}
            {error && !isLoading && (
                <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg" role="alert">
                    <p className="font-bold">Error</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}
            {src && !isLoading && !error && (
                <img src={src} alt={title} className="max-w-full max-h-full rounded-lg object-contain" />
            )}
            {!src && !isLoading && !error && (
                <p className="text-sm text-gray-500 text-center">{emptyMessage}</p>
            )}
        </div>
    </div>
);

interface ImageStudioToolProps {
  defaultPrompt?: string;
}

export const ImageStudioTool: React.FC<ImageStudioToolProps> = ({ defaultPrompt = '' }) => {
    // State for image generation
    const [generatePrompt, setGeneratePrompt] = useState<string>(defaultPrompt);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [generateError, setGenerateError] = useState<string | null>(null);

    // State for image editing
    const [editPrompt, setEditPrompt] = useState<string>('');
    const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
    const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editError, setEditError] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (defaultPrompt) {
            setGeneratePrompt(defaultPrompt);
        }
    }, [defaultPrompt]);


    const handleGenerate = useCallback(async () => {
        if (!generatePrompt.trim()) return;
        setIsGenerating(true);
        setGenerateError(null);
        setGeneratedImageUrl(null);
        try {
            const url = await generateImageFromPrompt(generatePrompt);
            setGeneratedImageUrl(url);
        } catch (err) {
            setGenerateError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsGenerating(false);
        }
    }, [generatePrompt]);

    const handleEdit = useCallback(async () => {
        if (!editPrompt.trim() || !sourceImageUrl) return;
        setIsEditing(true);
        setEditError(null);
        setEditedImageUrl(null);
        try {
            const url = await editImage(sourceImageUrl, editPrompt);
            setEditedImageUrl(url);
        } catch (err) {
            setEditError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsEditing(false);
        }
    }, [editPrompt, sourceImageUrl]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setSourceImageUrl(e.target?.result as string);
                setEditedImageUrl(null);
                setEditError(null);
            };
            reader.onerror = () => {
                setEditError("Failed to read the selected file.");
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleUseGenerated = useCallback(() => {
        if (generatedImageUrl) {
            setSourceImageUrl(generatedImageUrl);
            setEditedImageUrl(null);
            setEditError(null);
        }
    }, [generatedImageUrl]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            {/* Left Column: Controls */}
            <div className="space-y-8">
                {/* Generate Section */}
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-3 flex items-center">
                        <SparklesIcon className="w-6 h-6 mr-2 text-brand-secondary" />
                        1. Generate Image (Imagen 4)
                    </h3>
                    <div className="space-y-4">
                        <textarea
                            value={generatePrompt}
                            onChange={(e) => setGeneratePrompt(e.target.value)}
                            rows={4}
                            placeholder="A photorealistic image of a cat wearing a tiny wizard hat..."
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white"
                        />
                        <button onClick={handleGenerate} disabled={isGenerating || !generatePrompt.trim()} className="w-full flex items-center justify-center bg-gradient-to-r from-brand-secondary to-brand-accent text-white font-bold py-3 rounded-lg disabled:opacity-50">
                            {isGenerating ? <><Spinner /> Generating...</> : 'Generate Image'}
                        </button>
                    </div>
                </div>

                {/* Edit Section */}
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-3 flex items-center">
                        <PaintBrushIcon className="w-6 h-6 mr-2 text-yellow-400" />
                        2. Edit Image (Nano Banana)
                    </h3>
                    <div className="space-y-4">
                       <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                       <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg">
                           <UploadIcon className="w-5 h-5 mr-2" />
                           Upload an Image
                       </button>
                        {generatedImageUrl && (
                            <button onClick={handleUseGenerated} className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg">
                                <PhotographIcon className="w-5 h-5 mr-2" />
                                Use Generated Image
                            </button>
                        )}
                        <textarea
                            value={editPrompt}
                            onChange={(e) => setEditPrompt(e.target.value)}
                            rows={3}
                            placeholder="Add sunglasses to the cat..."
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white"
                            disabled={!sourceImageUrl}
                        />
                        <button onClick={handleEdit} disabled={isEditing || !editPrompt.trim() || !sourceImageUrl} className="w-full flex items-center justify-center bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 rounded-lg disabled:opacity-50">
                            {isEditing ? <><Spinner /> Editing...</> : 'Edit Image'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column: Display */}
            <div className="space-y-6">
                 <ImageDisplay 
                    src={generatedImageUrl}
                    title="Generated Image"
                    isLoading={isGenerating}
                    error={generateError}
                    emptyMessage="Generate an image to see it here."
                />
                <ImageDisplay 
                    src={sourceImageUrl}
                    title="Source for Editing"
                    isLoading={false}
                    error={null}
                    emptyMessage="Upload or generate an image to edit."
                />
                 <ImageDisplay 
                    src={editedImageUrl}
                    title="Edited Image"
                    isLoading={isEditing}
                    error={editError}
                    emptyMessage="Your edited image will appear here."
                />
            </div>
        </div>
    );
};