const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building the application...');

try {
  // Run the build command
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
  
  // Check if dist_electron directory exists and remove it
  const distElectronDir = path.join(__dirname, 'dist_electron');
  if (fs.existsSync(distElectronDir)) {
    console.log('Removing existing dist_electron directory...');
    fs.rmSync(distElectronDir, { recursive: true, force: true });
  }
  
  // Create dist_electron directory
  fs.mkdirSync(distElectronDir, { recursive: true });
  
  // Copy dist folder to dist_electron
  const distDir = path.join(__dirname, 'dist');
  const targetDistDir = path.join(distElectronDir, 'dist');
  console.log('Copying dist folder...');
  fs.cpSync(distDir, targetDistDir, { recursive: true });
  
  // Copy electron.cjs to dist_electron
  const electronFile = path.join(__dirname, 'electron.cjs');
  const targetElectronFile = path.join(distElectronDir, 'electron.cjs');
  console.log('Copying electron.cjs...');
  fs.copyFileSync(electronFile, targetElectronFile);
  
  // Copy package.json to dist_electron
  const packageFile = path.join(__dirname, 'package.json');
  const targetPackageFile = path.join(distElectronDir, 'package.json');
  console.log('Copying package.json...');
  const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
  
  // Modify package.json for production
  delete packageJson.scripts['electron:dev'];
  delete packageJson.scripts['electron:build'];
  delete packageJson.scripts['icon-build'];
  delete packageJson.devDependencies;
  packageJson.main = 'electron.cjs';
  
  fs.writeFileSync(targetPackageFile, JSON.stringify(packageJson, null, 2));
  
  // Copy build folder to dist_electron
  const buildDir = path.join(__dirname, 'build');
  const targetBuildDir = path.join(distElectronDir, 'build');
  if (fs.existsSync(buildDir)) {
    console.log('Copying build folder...');
    fs.cpSync(buildDir, targetBuildDir, { recursive: true });
  }
  
  console.log('Application packaged successfully in dist_electron folder!');
  console.log('You can now run the application with: electron dist_electron/electron.cjs');
  
} catch (error) {
  console.error('Error packaging the application:', error.message);
  process.exit(1);
}