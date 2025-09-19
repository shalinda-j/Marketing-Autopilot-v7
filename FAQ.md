# Frequently Asked Questions

## General Questions

### What is Marketing Autopilot?
Marketing Autopilot is an AI-powered tool that generates complete marketing campaigns from simple 10-word briefs. It automates the creation of content calendars, visual assets, and video scripts for omni-channel marketing campaigns.

### Do I need a Google Gemini API key?
Yes, you need a Google Gemini API key to use the AI features of Marketing Autopilot. You can get one for free from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Is Marketing Autopilot free to use?
The Marketing Autopilot application is open-source and free to use. However, you'll need to provide your own Google Gemini API key, which may have usage costs depending on your usage.

## Installation and Setup

### How do I install Marketing Autopilot?
For regular users, download the Windows installer from the [Releases page](https://github.com/shalinda-j/Marketing-Autopilot-v7/releases). For developers, you can clone the repository and run it locally with Node.js.

### What are the system requirements?
- Windows 10 or 11 (for the installer)
- Node.js v16+ (for development)
- Internet connection
- Google Gemini API key

### How do I get a Google Gemini API key?
Visit [Google AI Studio](https://aistudio.google.com/app/apikey) and create a new API key. Copy the key and paste it into the API Configuration panel in Marketing Autopilot.

## Usage Questions

### How do I create a campaign brief?
Use this format:
```
BRAND | PRODUCT | CAMPAIGN THEME | TARGET PERSONA | PRIMARY KPI | BUDGET TIER | START DATE | END DATE | BRAND TOV | HASHTAG SEED | UTM_CAMPAIGN | OPTIMAL POST COUNT PER CHANNEL
```

Example:
```
Coca-Cola | Coke Zero Sugar | "Summer Vibes, Zero Limits" | Gen-Z festival goers 18-24 | Engagement rate | enterprise | 2025-06-01 | 2025-08-31 | playful, emoji-heavy, inclusive | #ZeroLimitsSummer | coke_zero_summer_25 | 3/wk IG-TK, 2/wk YT-SC, 1/wk TW-LI
```

### Can I customize the generated campaigns?
Yes, you can edit the generated campaigns manually. The AI provides a starting point, but you can modify any aspect of the campaign to better suit your needs.

### How do I generate images and videos?
After generating a campaign, you can click the "Generate Media" button on individual content slots to create images or videos using AI.

## Troubleshooting

### The application won't start
- Make sure you have the latest version installed
- Check that your API key is valid
- Try reinstalling the application

### I'm getting API key errors
- Verify your API key is correct
- Check that your API key has the necessary permissions
- Ensure you have an internet connection

### Generated content is not what I expected
- Try refining your campaign brief
- Be more specific in your brief about the desired outcome
- Remember that AI responses can vary

## Development Questions

### How can I contribute to the project?
See our [Contributing Guidelines](CONTRIBUTING.md) for information on how to contribute code, documentation, or bug reports.

### How do I run the application in development mode?
1. Clone the repository
2. Run `npm install`
3. Run `npm run dev`

### How do I build the application?
Run `npm run electron:build` to create a production build.

## Support

### Where can I get help?
- Check this FAQ for common questions
- Search existing [Issues](https://github.com/shalinda-j/Marketing-Autopilot-v7/issues)
- Create a new [Issue](https://github.com/shalinda-j/Marketing-Autopilot-v7/issues/new) if needed

### How do I report a bug?
Create a new issue on GitHub with a clear description of the problem, steps to reproduce, and your environment details.