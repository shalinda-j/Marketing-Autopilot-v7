const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Creating installer package...');

try {
  // Create installer directory
  const installerDir = path.join(__dirname, 'Marketing-Autopilot-Installer');
  if (fs.existsSync(installerDir)) {
    fs.rmSync(installerDir, { recursive: true, force: true });
  }
  fs.mkdirSync(installerDir, { recursive: true });
  
  console.log('Copying application files...');
  
  // Copy dist_electron folder
  const distElectronDir = path.join(__dirname, 'dist_electron');
  const targetDistElectronDir = path.join(installerDir, 'app');
  fs.cpSync(distElectronDir, targetDistElectronDir, { recursive: true });
  
  // Create installation batch file
  const installScript = `@echo off
title Marketing Autopilot Installer
echo Installing Marketing Autopilot...

REM Create application directory
set "APP_DIR=%LOCALAPPDATA%\\MarketingAutopilot"
if not exist "%APP_DIR%" mkdir "%APP_DIR%"

REM Copy application files
echo Copying application files...
xcopy /E /I /Y "app" "%APP_DIR%"

REM Create desktop shortcut
echo Creating desktop shortcut...
powershell "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\\Desktop\\Marketing Autopilot.lnk'); $Shortcut.TargetPath = '%APP_DIR%\\run-app.bat'; $Shortcut.WorkingDirectory = '%APP_DIR%'; $Shortcut.Save()"

echo Installation complete!
echo You can now run Marketing Autopilot from your desktop shortcut.
pause`;

  fs.writeFileSync(path.join(installerDir, 'install.bat'), installScript);
  
  // Create uninstall batch file
  const uninstallScript = `@echo off
title Marketing Autopilot Uninstaller
echo Uninstalling Marketing Autopilot...

REM Remove application directory
set "APP_DIR=%LOCALAPPDATA%\\MarketingAutopilot"
if exist "%APP_DIR%" (
    echo Removing application files...
    rmdir /s /q "%APP_DIR%"
)

REM Remove desktop shortcut
set "SHORTCUT_NAME=%USERPROFILE%\\Desktop\\Marketing Autopilot.lnk"
if exist "%SHORTCUT_NAME%" (
    echo Removing desktop shortcut...
    del "%SHORTCUT_NAME%"
)

echo Uninstallation complete!
pause`;

  fs.writeFileSync(path.join(installerDir, 'uninstall.bat'), uninstallScript);
  
  // Create README file
  const readmeContent = `Marketing Autopilot v7
=====================

A Google-Agent that turns a 10-word brief into a full, high-engagement, omni-channel campaign in 1 click.

Installation:
1. Run install.bat to install the application
2. A desktop shortcut will be created
3. Run the application from the desktop shortcut

Uninstallation:
1. Run uninstall.bat to remove the application
2. This will remove all application files and the desktop shortcut

Usage:
1. After installation, run the application from the desktop shortcut
2. Enter your Gemini API key in the API Configuration panel
3. Create marketing campaigns using the campaign input panel

Requirements:
- Windows 10 or 11
- Node.js (included with the application)
- Internet connection for AI features
- A Google Gemini API key (get one at https://aistudio.google.com/app/apikey)

Features:
- Generate complete marketing campaigns from a simple brief
- Create images and videos using AI
- Episodic video studio for creating video series
- Custom API key support for using your own Gemini account
`;

  fs.writeFileSync(path.join(installerDir, 'README.txt'), readmeContent);
  
  console.log('Installer package created successfully!');
  console.log(`Location: ${installerDir}`);
  
} catch (error) {
  console.error('Error creating installer package:', error.message);
  process.exit(1);
}