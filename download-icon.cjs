const https = require('https');
const fs = require('fs');
const path = require('path');

// URL of a generic app icon
const iconUrl = 'https://cdn.iconscout.com/icon/free/png-256/free-electron-2085880-1746950.png';

function downloadIcon(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('Icon downloaded successfully');
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest);
      console.error('Error downloading icon:', err);
      reject(err);
    });
  });
}

// Download the icon
const iconPath = path.join(__dirname, 'build', 'icon.ico');
downloadIcon(iconUrl, iconPath);