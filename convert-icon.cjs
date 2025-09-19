const fs = require('fs');
const path = require('path');
const toIco = require('to-ico');

async function convertPngToIco() {
  try {
    // Read the PNG file
    const pngBuffer = fs.readFileSync(path.join(__dirname, 'build', 'logo.png'));
    
    // Convert to ICO
    const icoBuffer = await toIco([pngBuffer]);
    
    // Write the ICO file
    fs.writeFileSync(path.join(__dirname, 'build', 'icon.ico'), icoBuffer);
    
    console.log('Successfully converted PNG to ICO');
  } catch (error) {
    console.error('Error converting PNG to ICO:', error);
  }
}

convertPngToIco();