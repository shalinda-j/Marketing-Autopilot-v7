
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { CampaignPlan } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey });

const systemPrompt = `You are MarketingAutopilot v7, a Google-Agent that turns a 10-word brief into a full, high-engagement, omni-channel campaign in 1 click.

INPUT FORMAT (single line, separated by '|'):
BRAND | PRODUCT | CAMPAIGN THEME | TARGET PERSONA | PRIMARY KPI | BUDGET TIER (micro/smb/enterprise) | START DATE | END DATE | BRAND TOV (emoji allowed) | HASHTAG SEED | UTM_CAMPAIGN | OPTIMAL POST COUNT PER CHANNEL

EXAMPLE INPUT:
Coca-Cola | Coke Zero Sugar | “Summer Vibes, Zero Limits” | Gen-Z festival goers 18-24 | Engagement rate | enterprise | 2025-06-01 | 2025-08-31 | playful, emoji-heavy, inclusive | #ZeroLimitsSummer | coke_zero_summer_25 | 3/wk IG-TK, 2/wk YT-SC, 1/wk TW-LI

OUTPUT FORMAT (valid JSON only, no commentary):
{
  "campaign_id": "coke_zero_summer_25",
  "brand": "Coca-Cola",
  "persona": "Gen-Z festival goers 18-24",
  "kpis": {"er_ig": "≥5%", "ctr_tk": "≥2.5%", "save_rate": "≥4%", "roas": "≥4×"},
  "content_calendar": [
    {
      "slot_id": "IG_2025-06-03_19:00:00+00:00",
      "platform": "instagram",
      "post_type": "reel",
      "copy": {
        "primary": "Zero sugar, 100% festival feels 🎶🔥 Which set are we vibing to first? #ZeroLimitsSummer",
        "cta": "Tag your fest crew 👀🥤",
        "alt_text": "Ice-cold Coke Zero splashing over neon speakers under sunset sky"
      },
      "visual_prompt": "ultra-realistic 9:16 vertical, golden-hour music festival, neon wristbands, splash of Coke Zero liquid freezing mid-air, depth-of-field, shot on ARRI Alexa 35, f/1.4, cinematic color grade, trending on Behance",
      "video_storyboard": [
        "Frame1 0-2s: fast dolly-in on sweating can, condensation beads",
        "Frame2 2-4s: can opens, zero-sugar droplets morph into equalizer bars",
        "Frame3 4-6s: POV hand raises can, crowd lights flare",
        "Frame4 6-8s: logo + CTA wipe with bass drop"
      ],
      "voice_over": {
        "text": "Zero sugar. Zero limits. This summer, feel everything.",
        "voice": "en-US-Studio-O (Google Chirp 3, 24-year-old female, upbeat, 110% speed)",
        "bg_music": "128 bpm tropical house, royalty-free, key C-major, loop 15 s"
      },
      "color_palette": ["#FF0040", "#0A0A0A", "#FFFFFF", "#FFE600"],
      "hashtags": ["#ZeroLimitsSummer", "#CokeZeroFest", "#SugarFreeVibes"],
      "deep_link": "https://coca.cola/zero?s=ig&utm_campaign=coke_zero_summer_25&utm_source=instagram&utm_medium=reel&utm_content=IG_2025-06-03_19:00:00",
      "qr_code": "https://api.qrserver.com/v1/create-qr-code/?size=1080x1080&data=https%3A%2F%2Fcoca.cola%2Fzero%3Fs%3Dig%26utm_campaign%3Dcoke_zero_summer_25",
      "schedule_payload": {
        "api": "buffer",
        "profile_ids": ["instagram_profile_id"],
        "scheduled_at": "2025-06-03T19:00:00Z"
      }
    }
  ],
  "media_generation_order": [
    { "step": 1, "tool": "imagen3", "prompt_key": "visual_prompt", "output_size": "1080x1350", "mime": "image/jpeg", "safety_filter": "safe_search_strict" },
    { "step": 2, "tool": "veo2", "storyboard_key": "video_storyboard", "aspect": "9:16", "duration": "8s", "fps": 30, "mime": "video/mp4" },
    { "step": 3, "tool": "chirp3", "script_key": "voice_over.text", "voice_id": "en-US-Studio-O", "mime": "audio/mp3" }
  ],
  "auto_reply_template": {
    "positive_keywords": ["love", "🔥", "❤️"],
    "reply": "Thanks fam! Grab your own #ZeroLimitsSummer can 👉 {qr_code}"
  },
  "reporting_webhook": "https://your-autopilot.app/api/v1/report"
}`;

export const generateCampaignPlan = async (brief: string): Promise<CampaignPlan> => {
    try {
        const fullPrompt = `${systemPrompt}\n\nProcess this input:\n${brief}`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        
        const text = response.text;
        if (!text) {
            const blockReason = response.promptFeedback?.blockReason;
            if (blockReason) {
                throw new Error(`Request was blocked due to ${blockReason}. Please adjust your prompt.`);
            }
            throw new Error("The model returned an empty or invalid response.");
        }

        const jsonText = text.trim();
        const cleanedJson = jsonText.replace(/^```json\s*|```\s*$/g, '');
        const parsedJson = JSON.parse(cleanedJson);

        if (parsedJson.error) {
            throw new Error(parsedJson.error);
        }

        return parsedJson as CampaignPlan;

    } catch (error) {
        console.error("Error generating campaign plan:", error);
        throw new Error(`Failed to generate campaign plan from AI. ${error instanceof Error ? error.message : 'An unknown error occurred.'}`);
    }
};

const parseDataUri = (dataUri: string): { mimeType: string; data: string } => {
    const match = dataUri.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
        throw new Error("Invalid data URI format");
    }
    return {
        mimeType: match[1],
        data: match[2],
    };
};

export const editImage = async (base64ImageDataUri: string, prompt: string): Promise<string> => {
    try {
        const { mimeType, data: base64ImageData } = parseDataUri(base64ImageDataUri);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        if (!response?.candidates?.[0]?.content?.parts) {
             throw new Error("The model returned an empty or invalid response for image editing.");
        }

        const imagePart = response.candidates[0].content.parts.find(part => part.inlineData);

        // FIX: Corrected typo from `imagePage.tsxrt` to `imagePart`.
        if (!imagePart || !imagePart.inlineData) {
            const textPart = response.candidates[0].content.parts.find(part => part.text);
            if (textPart && textPart.text) {
                 throw new Error(`Image editing failed. The model responded: "${textPart.text}"`);
            }
            throw new Error("No image part found in the editing response.");
        }

        const base64ImageBytes: string = imagePart.inlineData.data;
        const newMimeType = imagePart.inlineData.mimeType;
        return `data:${newMimeType};base64,${base64ImageBytes}`;

    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error(`Failed to edit image with AI. ${error instanceof Error ? error.message : 'An unknown error occurred.'}`);
    }
};

export const generateImageFromPrompt = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
        });
        
        if (!response || !response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("No image was generated by the API.");
        }
        
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;

    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error(`Failed to generate image from AI. ${error instanceof Error ? error.message : 'An unknown error occurred.'}`);
    }
};

export const generateVideoFromStoryboard = async (storyboard: string[], onProgress?: (message: string) => void): Promise<string> => {
    try {
        const prompt = "Create a short, dynamic, and engaging marketing video based on this storyboard: " + storyboard.join('. ');
        onProgress?.("Starting video generation with Veo 2...");

        let operation = await ai.models.generateVideos({
          model: 'veo-2.0-generate-001',
          prompt: prompt,
          config: {
            numberOfVideos: 1
          }
        });
        
        onProgress?.("Video processing has begun. This may take a few minutes...");

        while (!operation.done) {
          await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
          onProgress?.("Checking video status...");
          operation = await ai.operations.getVideosOperation({operation: operation});
        }
        
        onProgress?.("Video generation complete! Fetching the file...");

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation succeeded, but no download link was provided.");
        }
        
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch the video file. Status: ${response.statusText}`);
        }
        const videoBlob = await response.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        
        onProgress?.("Video ready!");
        return videoUrl;

    } catch (error) {
        console.error("Error generating video:", error);
        throw new Error(`Failed to generate video from AI. ${error instanceof Error ? error.message : 'An unknown error occurred.'}`);
    }
};

export const getImageDescription = async (base64ImageDataUri: string, prompt: string): Promise<string> => {
    try {
        const { mimeType, data: base64ImageData } = parseDataUri(base64ImageDataUri);
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            }
        });

        const text = response.text;
        if (!text) {
             throw new Error("The model returned no description for the image.");
        }
        return text;
    } catch (error) {
        console.error("Error getting image description:", error);
        throw new Error(`Failed to describe image. ${error instanceof Error ? error.message : 'An unknown error occurred.'}`);
    }
};

export const generateProductVideo = async (
    productImageUri: string, 
    characterImageUri: string, 
    script: string, 
    onProgress?: (message: string) => void
): Promise<string> => {
    try {
        onProgress?.("Analyzing character image...");
        const characterDescription = await getImageDescription(characterImageUri, "Describe the person in this image concisely for a video generation prompt. Focus on appearance, clothing, and expression.");
        onProgress?.(`Character identified. Including in prompt...`);

        const fullPrompt = `${script}. This video should prominently feature the product shown in the input image. Also, include a person who looks like this: ${characterDescription}. The video should have a voice-over narrating the script.`;
        
        onProgress?.("Starting video generation with Veo 2...");
        const { mimeType, data: productImageData } = parseDataUri(productImageUri);

        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: fullPrompt,
            image: {
                imageBytes: productImageData,
                mimeType: mimeType,
            },
            config: {
                numberOfVideos: 1
            }
        });
        
        onProgress?.("Video processing has begun. This may take a few minutes...");

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            onProgress?.("Checking video status...");
            operation = await ai.operations.getVideosOperation({operation: operation});
        }
        
        onProgress?.("Video generation complete! Fetching the file...");

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation succeeded, but no download link was provided.");
        }
        
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch the video file. Status: ${response.statusText}`);
        }
        const videoBlob = await response.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        
        onProgress?.("Video ready!");
        return videoUrl;

    } catch (error) {
        console.error("Error generating product video:", error);
        throw new Error(`Failed to generate product video. ${error instanceof Error ? error.message : 'An unknown error occurred.'}`);
    }
};

export const generateProductImage = async (
    productImageUri: string, 
    characterImageUri: string, 
    prompt: string
): Promise<string> => {
    try {
        const characterDescription = await getImageDescription(characterImageUri, "Describe the person in this image concisely for an image editing prompt. Focus on appearance, clothing, and expression.");
        const fullPrompt = `${prompt}. Add a person who looks like this into the scene: ${characterDescription}.`;
        
        const editedImageUrl = await editImage(productImageUri, fullPrompt);
        return editedImageUrl;
    } catch (error) {
        console.error("Error generating product image:", error);
        throw new Error(`Failed to generate product image. ${error instanceof Error ? error.message : 'An unknown error occurred.'}`);
    }
};

export const generateMarketingImagePrompt = async (
    productImageUri: string,
    characterImageUri: string
): Promise<string> => {
    try {
        const { mimeType: productMime, data: productData } = parseDataUri(productImageUri);
        const { mimeType: characterMime, data: characterData } = parseDataUri(characterImageUri);

        const systemPrompt = `You are an expert creative director for an advertising agency. Your task is to analyze two images—one of a product and one of a character/model—and generate a single, detailed, and compelling prompt for an AI image generator (like Imagen 4).

        The generated prompt must:
        1.  Combine the character and the product into a cohesive, realistic, and engaging scene.
        2.  Describe a specific setting, atmosphere, and lighting (e.g., golden hour, studio lighting, neon city).
        3.  Suggest an action or interaction between the character and the product.
        4.  Include stylistic keywords that lead to a high-quality, photorealistic, and professional marketing image suitable for social media. Examples: "ultra-realistic", "cinematic", "shot on ARRI Alexa", "depth-of-field", "vibrant colors".
        5.  Be a single paragraph of text. Do not use lists or markdown.

        Analyze the provided images and generate the prompt.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { text: systemPrompt },
                    { inlineData: { mimeType: productMime, data: productData } },
                    { inlineData: { mimeType: characterMime, data: characterData } },
                ],
            }
        });

        const text = response.text;
        if (!text) {
            throw new Error("The model returned no prompt.");
        }
        return text.trim();
    } catch (error) {
        console.error("Error generating marketing image prompt:", error);
        throw new Error(`Failed to generate prompt. ${error instanceof Error ? error.message : 'An unknown error occurred.'}`);
    }
};

export const generateMarketingVideoScript = async (
    productImageUri: string,
    characterImageUri: string
): Promise<string> => {
    try {
        const { mimeType: productMime, data: productData } = parseDataUri(productImageUri);
        const { mimeType: characterMime, data: characterData } = parseDataUri(characterImageUri);

        const systemPrompt = `You are an expert creative director for an advertising agency. Your task is to analyze two images—one of a product and one of a character/model—and generate a short, compelling video script prompt for an AI video generator (like Veo).

        The generated script should:
        1.  Be a single, concise paragraph.
        2.  Describe a short (5-10 second) scene that is dynamic and visually interesting.
        3.  Clearly feature both the product and the character.
        4.  Suggest an action, a mood, and a setting.
        5.  Include a brief voiceover line that is catchy and memorable.
        6.  Do not use markdown or scene numbers like "Scene 1:". Just describe the video flow.

        Analyze the provided images and generate the video script prompt.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { text: systemPrompt },
                    { inlineData: { mimeType: productMime, data: productData } },
                    { inlineData: { mimeType: characterMime, data: characterData } },
                ],
            }
        });

        const text = response.text;
        if (!text) {
            throw new Error("The model returned no video script.");
        }
        return text.trim();
    } catch (error) {
        console.error("Error generating marketing video script:", error);
        throw new Error(`Failed to generate video script. ${error instanceof Error ? error.message : 'An unknown error occurred.'}`);
    }
};

export const generateEpisodePrompts = async (seriesIdea: string, numEpisodes: number): Promise<{ title: string; prompt: string }[]> => {
    try {
        const systemInstruction = `You are an expert scriptwriter and creative director for a production studio. Your task is to take a high-level series idea and generate a plan for a series of short, engaging video episodes.

For each episode, you must provide:
1. A catchy, concise title.
2. A detailed, single-paragraph video prompt suitable for an AI video generator like Veo. This prompt should describe the scene, characters, action, camera angles, lighting, and include a line of voiceover dialogue.

The output must be a valid JSON array.`;

        const userPrompt = `Generate a plan for a ${numEpisodes}-episode video series based on the following idea: "${seriesIdea}"`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        episodes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING, description: "The title of the episode." },
                                    prompt: { type: Type.STRING, description: "A detailed video generation prompt for the episode." }
                                }
                            }
                        }
                    }
                },
            },
        });

        const text = response.text.trim();
        if (!text) {
            throw new Error("The model returned an empty response for episode prompts.");
        }

        const parsedJson = JSON.parse(text);
        if (!parsedJson.episodes || !Array.isArray(parsedJson.episodes)) {
             throw new Error("The model returned an invalid structure for episodes.");
        }

        return parsedJson.episodes;

    } catch (error) {
        console.error("Error generating episode prompts:", error);
        throw new Error(`Failed to generate episode prompts. ${error instanceof Error ? error.message : 'An unknown error occurred.'}`);
    }
};

export const generateEpisodicVideo = async (prompt: string, onProgress?: (message: string) => void): Promise<string> => {
    // Note: The Veo API via this SDK does not currently support specifying output resolution.
    // The quality parameter from the UI is noted, but the API will generate at its default high quality.
    try {
        onProgress?.("Starting video generation...");

        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            config: {
                numberOfVideos: 1
            }
        });
        
        onProgress?.("Processing video. This can take several minutes...");

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            onProgress?.("Checking generation status...");
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }
        
        onProgress?.("Finalizing video...");

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation succeeded, but the download link is missing.");
        }
        
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) {
            throw new Error(`Failed to download the final video file. Status: ${response.statusText}`);
        }
        const videoBlob = await response.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        
        onProgress?.("Video is ready!");
        return videoUrl;

    } catch (error) {
        console.error("Error generating episodic video:", error);
        throw new Error(`Failed to generate the episode video. ${error instanceof Error ? error.message : 'An unknown error occurred.'}`);
    }
};

export const generateBriefFromUrl = async (url: string): Promise<string> => {
    try {
        const systemInstruction = `You are a marketing analyst. Based on the following website URL, create a one-line campaign brief.
You must strictly follow this format:
BRAND | PRODUCT | CAMPAIGN THEME | TARGET PERSONA | PRIMARY KPI | BUDGET TIER (micro/smb/enterprise) | START DATE (next month) | END DATE (3 months from start) | BRAND TOV (emoji allowed) | HASHTAG SEED | UTM_CAMPAIGN | OPTIMAL POST COUNT PER CHANNEL

Make educated guesses for all fields based on the URL's likely content. The output must be a single line. Do not include any other text, explanation, or markdown.

EXAMPLE OUTPUT for url 'https://www.allbirds.com/products/mens-tree-runners':
Allbirds | Tree Runners | "Light on Your Feet, Light on the Planet" | Eco-conscious millennials 25-40 | Conversion rate | smb | 2025-07-01 | 2025-09-30 | sustainable, comfortable, minimalist | #LiveLightly | allbirds_tree_runners_q3 | 4/wk IG, 2/wk FB, 1/wk Pinterest
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate the brief for this URL: ${url}`,
            config: {
                systemInstruction,
            }
        });

        const text = response.text;
        if (!text) {
            const blockReason = response.promptFeedback?.blockReason;
            if (blockReason) {
                throw new Error(`Request was blocked due to ${blockReason}. Please try a different URL.`);
            }
            throw new Error("The model returned an empty or invalid response for the URL.");
        }
        return text.trim();

    } catch (error) {
        console.error("Error generating brief from URL:", error);
        throw new Error(`Failed to generate brief from URL. ${error instanceof Error ? error.message : 'An unknown error occurred.'}`);
    }
};
