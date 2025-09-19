import { describe, it, expect, vi } from 'vitest';

// Set the environment variable before any other imports
process.env.API_KEY = 'test-api-key';

vi.mock('@google/genai', () => {
  const mockGenerateContent = vi.fn();
  const mockGoogleGenAI = {
    models: {
      generateContent: mockGenerateContent,
    },
  };
  return {
    GoogleGenAI: vi.fn(() => mockGoogleGenAI),
    mockGenerateContent,
  };
});

// Dynamically import the module to be tested after mocking
const { generateCampaignPlan } = await import('./geminiService');
const { mockGenerateContent } = await import('@google/genai');

describe('generateCampaignPlan', () => {
  it('should throw an error if the API returns an error message', async () => {
    const errorResponse = {
      text: JSON.stringify({ error: 'Invalid API key' }),
    };
    (mockGenerateContent as any).mockResolvedValue(errorResponse);

    await expect(generateCampaignPlan('test brief')).rejects.toThrow(
      'Failed to generate campaign plan from AI. Invalid API key'
    );
  });
});
