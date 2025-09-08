import { GoogleGenAI, Modality } from '@google/genai';
import { CampaignPlan } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
        
        const text = response?.text;
        if (!text) {
            const blockReason = response?.promptFeedback?.blockReason;
            if (blockReason) {
                throw new Error(`Request was blocked due to ${blockReason}. Please adjust your prompt.`);
            }
            throw new Error("The model returned an empty or invalid response.");
        }

        const jsonText = text.trim();
        const cleanedJson = jsonText.replace(/^```json\s*|```\s*$/g, '');
        return JSON.parse(cleanedJson) as CampaignPlan;

    } catch (error) {
        console.error("Error generating campaign plan:", error);
        throw new Error(`Failed to generate campaign plan from AI. ${error instanceof Error ? error.message : 'An unknown error occurred.'}`);
    }
};

export const generateLogo = async (brand: string, theme: string): Promise<string> => {
    try {
        const prompt = `Modern, minimalist vector logo for a brand named "${brand}". The logo should reflect the theme of "${theme}". Clean, flat design, centered on a solid white background, suitable for a corporate brand identity. SVG style.`;

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
            throw new Error("No image was generated by the API. The response was empty.");
        }
        
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;

    } catch (error) {
        console.error("Error generating logo:", error);
        throw new Error(`Failed to generate logo from AI. ${error instanceof Error ? error.message : 'An unknown error occurred.'}`);
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

export const refineLogo = async (base64ImageDataUri: string, prompt: string): Promise<string> => {
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
             throw new Error("The model returned an empty or invalid response for image refinement.");
        }

        const imagePart = response.candidates[0].content.parts.find(part => part.inlineData);

        if (!imagePart || !imagePart.inlineData) {
            const textPart = response.candidates[0].content.parts.find(part => part.text);
            if (textPart && textPart.text) {
                 throw new Error(`Image refinement failed. The model responded: "${textPart.text}"`);
            }
            throw new Error("No image part found in the refinement response.");
        }

        const base64ImageBytes: string = imagePart.inlineData.data;
        const newMimeType = imagePart.inlineData.mimeType;
        return `data:${newMimeType};base64,${base64ImageBytes}`;

    } catch (error) {
        console.error("Error refining logo:", error);
        throw new Error(`Failed to refine logo with AI. ${error instanceof Error ? error.message : 'An unknown error occurred.'}`);
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
              aspectRatio: '9:16', // Default for social media stories/reels
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
