
export interface Kpis {
  [key: string]: string;
}

export interface ContentCopy {
  primary: string;
  cta: string;
  alt_text: string;
}

export interface VoiceOver {
  text: string;
  voice: string;
  bg_music: string;
}

export interface SchedulePayload {
  api: string;
  profile_ids: string[];
  scheduled_at: string;
}

export interface ContentSlot {
  slot_id: string;
  platform: string;
  post_type: string;
  copy: ContentCopy;
  visual_prompt: string;
  video_storyboard: string[];
  voice_over: VoiceOver;
  color_palette: string[];
  hashtags: string[];
  deep_link: string;
  qr_code: string;
  schedule_payload: SchedulePayload;
}

export interface MediaGenerationStep {
  step: number;
  tool: string;
  // FIX: Made prompt_key optional and added storyboard_key to match example usage and fix type error.
  prompt_key?: string;
  storyboard_key?: string;
  output_size?: string;
  aspect?: string;
  duration?: string;
  fps?: number;
  script_key?: string;
  voice_id?: string;
  mime: string;
  safety_filter?: string;
}

export interface AutoReplyTemplate {
  positive_keywords: string[];
  reply: string;
}

export interface CampaignPlan {
  campaign_id: string;
  brand: string;
  persona: string;
  kpis: Kpis;
  content_calendar: ContentSlot[];
  media_generation_order: MediaGenerationStep[];
  auto_reply_template: AutoReplyTemplate;
  reporting_webhook: string;
}

// FIX: Added missing type definitions used by various components to resolve import errors.
export interface MarketingPrompt {
  headline: string;
  details: string;
  contact: string;
}

export interface MarketingTemplate {
  name: string;
  prompt: MarketingPrompt;
}

export type Platform = 'instagram' | 'facebook' | 'twitter';

export interface AdCopy {
  headline: string;
  body: string;
  cta: string;
}

export interface PlatformAsset {
  adCopy: AdCopy;
  imageUrl: string;
}

export interface GeneratedContent {
    platformAssets: {
        [key in Platform]?: PlatformAsset
    };
    videoUrl: string | null;
    audioScript: string | null;
}

export interface LoadingStates {
    [key: string]: boolean;
}

export interface ComplianceSettings {
    addWatermark: boolean;
    includeDisclosure: boolean;
}

export interface AnalyticsData {
    engagementRate: number;
    reach: number;
    clicks: number;
    conversions: number;
    sentiment: {
        positive: number;
        neutral: number;
        negative: number;
    };
    bestTimeToPost: string;
}
