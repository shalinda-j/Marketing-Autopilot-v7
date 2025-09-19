const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to unlock files using handle.exe from Sysinternals
function unlockFiles() {
  try {
    // Check if handle.exe is available
    try {
      execSync('handle.exe /?', { stdio: 'ignore' });
    } catch (error) {
      console.log('handle.exe not found. Please download it from Sysinternals.');
      return;
    }
    
    // Find and close handles to the dist_electron directory
    const distElectronDir = path.join(__dirname, 'dist_electron');
    if (fs.existsSync(distElectronDir)) {
      console.log('Finding handles to dist_electron directory...');
      try {
        const handleOutput = execSync(`handle.exe "${distElectronDir}"`, { encoding: 'utf8' });
        console.log('Handles found:');
        console.log(handleOutput);
        
        // Close handles
        console.log('Closing handles...');
        execSync(`handle.exe -c "${distElectronDir}" -y`, { stdio: 'inherit' });
      } catch (error) {
        console.log('No handles found or error closing handles:', error.message);
      }
    }
  } catch (error) {
    console.error('Error unlocking files:', error.message);
  }
}

// Function to force remove directory
function forceRemoveDir(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      console.log(`Removing directory: ${dirPath}`);
      // Try multiple approaches
      try {
        fs.rmSync(dirPath, { recursive: true, force: true, maxRetries: 3, retryDelay: 1000 });
        console.log('Directory removed successfully');
      } catch (error) {
        console.log('Error removing with fs.rmSync, trying alternative methods...');
        // Try using Windows cmd
        try {
          execSync(`cmd /c "rmdir /s /q \"${dirPath}\""`, { stdio: 'inherit' });
          console.log('Directory removed with cmd');
        } catch (cmdError) {
          console.log('Error removing with cmd:', cmdError.message);
          // Try PowerShell
          try {
            execSync(`powershell "Remove-Item -Path '${dirPath}' -Recurse -Force"`, { stdio: 'inherit' });
            console.log('Directory removed with PowerShell');
          } catch (psError) {
            console.log('Error removing with PowerShell:', psError.message);
          }
        }
      }
    } else {
      console.log('Directory does not exist');
    }
  } catch (error) {
    console.error('Error removing directory:', error.message);
  }
}

// Main execution
console.log('Unlocking files and removing dist_electron directory...');
unlockFiles();
forceRemoveDir(path.join(__dirname, 'dist_electron'));
console.log('Done!');const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to unlock files using handle.exe from Sysinternals
function unlockFiles() {
  try {
    // Check if handle.exe is available
    try {
      execSync('handle.exe /?', { stdio: 'ignore' });
    } catch (error) {
      console.log('handle.exe not found. Please download it from Sysinternals.');
      return;
    }
    
    // Find and close handles to the dist_electron directory
    const distElectronDir = path.join(__dirname, 'dist_electron');
    if (fs.existsSync(distElectronDir)) {
      console.log('Finding handles to dist_electron directory...');
      try {
        const handleOutput = execSync(`handle.exe "${distElectronDir}"`, { encoding: 'utf8' });
        console.log('Handles found:');
        console.log(handleOutput);
        
        // Close handles
        console.log('Closing handles...');
        execSync(`handle.exe -c "${distElectronDir}" -y`, { stdio: 'inherit' });
      } catch (error) {
        console.log('No handles found or error closing handles:', error.message);
      }
    }
  } catch (error) {
    console.error('Error unlocking files:', error.message);
  }
}

// Function to force remove directory
function forceRemoveDir(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      console.log(`Removing directory: ${dirPath}`);
      // Try multiple approaches
      try {
        fs.rmSync(dirPath, { recursive: true, force: true, maxRetries: 3, retryDelay: 1000 });
        console.log('Directory removed successfully');
      } catch (error) {
        console.log('Error removing with fs.rmSync, trying alternative methods...');
        // Try using Windows cmd
        try {
          execSync(`cmd /c "rmdir /s /q \"${dirPath}\""`, { stdio: 'inherit' });
          console.log('Directory removed with cmd');
        } catch (cmdError) {
          console.log('Error removing with cmd:', cmdError.message);
          // Try PowerShell
          try {
            execSync(`powershell "Remove-Item -Path '${dirPath}' -Recurse -Force"`, { stdio: 'inherit' });
            console.log('Directory removed with PowerShell');
          } catch (psError) {
            console.log('Error removing with PowerShell:', psError.message);
          }
        }
      }
    } else {
      console.log('Directory does not exist');
    }
  } catch (error) {
    console.error('Error removing directory:', error.message);
  }
}

// Main execution
console.log('Unlocking files and removing dist_electron directory...');
unlockFiles();
forceRemoveDir(path.join(__dirname, 'dist_electron'));
console.log('Done!');