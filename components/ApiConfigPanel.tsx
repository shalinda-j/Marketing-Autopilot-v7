import React, { useState } from 'react';

interface ApiConfigPanelProps {
  onApiKeyChange: (apiKey: string) => void;
  currentApiKey: string;
}

const ApiConfigPanel: React.FC<ApiConfigPanelProps> = ({ onApiKeyChange, currentApiKey }) => {
  const [apiKey, setApiKey] = useState(currentApiKey);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApiKeyChange(apiKey);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">API Configuration</h2>
      <p className="text-gray-300 mb-4">
        Enter your Gemini API key to enable all AI features. Your key is stored locally and never sent to any server except Google's API.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">
            Gemini API Key
          </label>
          <div className="flex">
            <input
              type={showApiKey ? "text" : "password"}
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary"
              placeholder="Enter your Gemini API key"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="px-4 py-2 bg-gray-700 border border-l-0 border-gray-600 rounded-r-lg hover:bg-gray-600 transition-colors"
            >
              {showApiKey ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        
        <button
          type="submit"
          className="px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Save API Key
        </button>
      </form>
      
      <div className="mt-4 text-sm text-gray-400">
        <p>
          Don't have an API key? Get one from{' '}
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-brand-secondary hover:underline"
          >
            Google AI Studio
          </a>
        </p>
      </div>
    </div>
  );
};

export default ApiConfigPanel;