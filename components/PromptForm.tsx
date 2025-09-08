import React, { useState } from 'react';
import { MarketingPrompt, MarketingTemplate } from '../types';
import { SparklesIcon, ClipboardListIcon } from './icons';
import { Spinner } from './Spinner';

interface PromptFormProps {
  prompt: MarketingPrompt;
  setPrompt: React.Dispatch<React.SetStateAction<MarketingPrompt>>;
  onGenerate: (prompt: MarketingPrompt) => void;
  isLoading: boolean;
}

const templates: MarketingTemplate[] = [
  {
    name: 'Product Launch',
    prompt: {
      headline: 'Introducing [Product Name] - The Future of [Category]',
      details: 'Announce our newest product, [Product Name]. Key features include: [Feature 1], [Feature 2], [Feature 3]. Designed for [Target Audience] who want to [Benefit/Goal].',
      contact: 'Shop now at [Your Website]!',
    },
  },
  {
    name: 'Limited-Time Sale',
    prompt: {
      headline: '🔥 HUGE SALE: Get [Discount]% Off [Product/Category]!',
      details: 'For a limited time, get an exclusive [Discount]% off our best-selling [Product/Category]. Don\'t miss out on this incredible offer. Perfect for [Occasion/Audience].',
      contact: 'Sale ends [End Date]. Shop now and save!',
    },
  },
  {
      name: 'Event Announcement',
      prompt: {
          headline: 'You\'re Invited to [Event Name]!',
          details: 'Join us for [Event Name] on [Date] at [Time/Location]. We will have [Activity 1], [Activity 2], and guest speaker [Speaker Name]. It\'s an event you won\'t want to miss.',
          contact: 'RSVP or get your tickets at [Link]!',
      },
  }
];

export const PromptForm: React.FC<PromptFormProps> = ({ prompt, setPrompt, onGenerate, isLoading }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPrompt(prev => ({ ...prev, [name]: value }));
    setSelectedTemplate(''); // Reset template selection when user types manually
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateName = e.target.value;
    setSelectedTemplate(templateName);
    const template = templates.find(t => t.name === templateName);
    if (template) {
      setPrompt(template.prompt);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(prompt);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 h-full flex flex-col shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">Create Your Campaign</h2>
      <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
        <div className="mb-4">
          <label htmlFor="template-select" className="flex items-center text-sm font-medium text-gray-400 mb-1">
            <ClipboardListIcon className="w-4 h-4 mr-1.5" /> Start with a Template
          </label>
          <select
            id="template-select"
            value={selectedTemplate}
            onChange={handleTemplateChange}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition"
          >
            <option value="">Select a template (optional)...</option>
            {templates.map((template) => (
              <option key={template.name} value={template.name}>{template.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="headline" className="block text-sm font-medium text-gray-400 mb-1">Headline</label>
          <input
            type="text"
            id="headline"
            name="headline"
            value={prompt.headline}
            onChange={handleInputChange}
            placeholder="e.g., The Ultimate Summer Refreshment"
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="details" className="block text-sm font-medium text-gray-400 mb-1">Product/Ad Details</label>
          <textarea
            id="details"
            name="details"
            value={prompt.details}
            onChange={handleInputChange}
            rows={5}
            placeholder="Describe your product, target audience, and key message. e.g., A new sparkling water with natural fruit flavors..."
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition"
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="contact" className="block text-sm font-medium text-gray-400 mb-1">Contact / Call to Action</label>
          <input
            type="text"
            id="contact"
            name="contact"
            value={prompt.contact}
            onChange={handleInputChange}
            placeholder="e.g., Visit example.com to learn more"
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition"
            required
          />
        </div>
        <div className="mt-auto">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center bg-gradient-to-r from-brand-secondary to-brand-accent text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? (
              <>
                <Spinner />
                Generating...
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5 mr-2" />
                Generate Content
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};