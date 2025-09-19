# Marketing Autopilot v7

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/shalinda-j/Marketing-Autopilot-v7/blob/main/LICENSE)
[![GitHub release](https://img.shields.io/github/release/shalinda-j/Marketing-Autopilot-v7.svg)](https://github.com/shalinda-j/Marketing-Autopilot-v7/releases)
[![GitHub issues](https://img.shields.io/github/issues/shalinda-j/Marketing-Autopilot-v7.svg)](https://github.com/shalinda-j/Marketing-Autopilot-v7/issues)

A Google-Agent that turns a 10-word brief into a full, high-engagement, omni-channel campaign in 1 click.

![Marketing Autopilot Demo](https://placehold.co/800x400?text=Marketing+Autopilot+Demo+Screenshot)

## Overview

Marketing Autopilot v7 is an AI-powered marketing tool that automates the creation of comprehensive marketing campaigns. With just a simple 10-word brief, it generates complete campaign plans including content calendars, visual assets, and video scripts.

## Features

- 🚀 **AI-Powered Campaign Generation**: Create full marketing campaigns from simple briefs
- 🎨 **Visual Content Creation**: Generate images and videos using AI
- 📹 **Episodic Video Studio**: Create video series with consistent themes
- 🔧 **Custom API Key Support**: Use your own Google Gemini API key
- 🖥️ **Cross-Platform**: Available as a desktop application for Windows
- 🌐 **Omni-Channel**: Supports Instagram, TikTok, YouTube, Twitter, LinkedIn, and more

## Installation

### For Users (Windows)

1. Download the latest Windows installer from the [Releases page](https://github.com/shalinda-j/Marketing-Autopilot-v7/releases)
2. Run the installer and follow the setup wizard
3. Launch the application from your desktop shortcut

### For Developers

#### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)
- Google Gemini API key

#### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/shalinda-j/Marketing-Autopilot-v7.git
   cd Marketing-Autopilot-v7
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment:
   ```bash
   cp .env .env.local
   ```
   Then edit `.env.local` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Run in development mode:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run electron:build
   ```

## Usage

1. Launch the application
2. Enter your Gemini API key in the API Configuration panel
3. Create a campaign brief using this format:
   ```
   BRAND | PRODUCT | CAMPAIGN THEME | TARGET PERSONA | PRIMARY KPI | BUDGET TIER | START DATE | END DATE | BRAND TOV | HASHTAG SEED | UTM_CAMPAIGN | OPTIMAL POST COUNT PER CHANNEL
   ```
4. Click "Generate Campaign" to create your marketing campaign
5. Use the Episodic Video Studio to create video series

## Example Campaign Brief

```
Coca-Cola | Coke Zero Sugar | "Summer Vibes, Zero Limits" | Gen-Z festival goers 18-24 | Engagement rate | enterprise | 2025-06-01 | 2025-08-31 | playful, emoji-heavy, inclusive | #ZeroLimitsSummer | coke_zero_summer_25 | 3/wk IG-TK, 2/wk YT-SC, 1/wk TW-LI
```

## Contributing

We welcome contributions to Marketing Autopilot! Here's how you can help:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Create a new Pull Request

Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## Development

### Project Structure

```
Marketing-Autopilot-v7/
├── components/          # React components
├── services/            # API services and utilities
├── build/               # Build resources and icons
├── dist/                # Production build output
├── dist_electron/       # Electron build output
├── electron.cjs         # Electron main process
├── index.html           # Main HTML file
├── index.tsx            # React entry point
├── App.tsx              # Main React application
├── vite.config.ts       # Vite configuration
├── electron-builder.json # Electron Builder configuration
└── package.json         # Project dependencies and scripts
```

### Available Scripts

- `npm run dev` - Run in development mode
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run electron:dev` - Run Electron app in development
- `npm run electron:build` - Build Electron app for production
- `npm run icon-build` - Generate app icons

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [FAQ](FAQ.md) for common questions
2. Search existing [Issues](https://github.com/shalinda-j/Marketing-Autopilot-v7/issues)
3. Create a new [Issue](https://github.com/shalinda-j/Marketing-Autopilot-v7/issues/new) if needed

## Acknowledgments

- Thanks to Google for providing the Gemini API
- Built with React, TypeScript, and Electron
- Inspired by modern marketing automation tools