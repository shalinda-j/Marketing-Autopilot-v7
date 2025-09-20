# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [7.0.0] - 2025-09-20

### Added
- Custom API key support with API Configuration panel
- Persistent API key storage using localStorage
- Professional Windows installer with customizable installation directory
- Desktop and Start Menu shortcuts creation
- Comprehensive documentation (README, CONTRIBUTING, CODE_OF_CONDUCT, FAQ)
- Release notes and GitHub release instructions

### Fixed
- Application startup issues on Windows
- API key validation errors
- Path resolution for packaged application
- File access issues during build process

### Changed
- Improved error handling and user feedback
- Better separation of development and production environments
- Enhanced application packaging process
- Updated electron main process to properly load local files in production

### Removed
- Dependency on electron-is-dev in packaged version

## [6.0.0] - 2025-08-15

### Added
- Initial release of Marketing Autopilot v7
- AI-powered campaign generation from 10-word briefs
- Episodic Video Studio for creating video series
- Basic React UI with campaign input and output panels
- Integration with Google Gemini API
- Electron-based desktop application

[7.0.0]: https://github.com/shalinda-j/Marketing-Autopilot-v7/releases/tag/v7.0.0
[6.0.0]: https://github.com/shalinda-j/Marketing-Autopilot-v7/releases/tag/v6.0.0