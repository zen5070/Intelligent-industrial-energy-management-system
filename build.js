const fs = require('fs');
const path = require('path');

// Ensure public folder exists
const publicDir = path.join(__dirname, 'public');
fs.mkdirSync(publicDir, { recursive: true });

// Copy index.html
fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(publicDir, 'index.html'));

// Copy css directory
fs.cpSync(path.join(__dirname, 'css'), path.join(publicDir, 'css'), { recursive: true });

// Copy js directory
fs.cpSync(path.join(__dirname, 'js'), path.join(publicDir, 'js'), { recursive: true });

// Copy scada_work_order.json if exists
if (fs.existsSync(path.join(__dirname, 'scada_work_order.json'))) {
  fs.copyFileSync(path.join(__dirname, 'scada_work_order.json'), path.join(publicDir, 'scada_work_order.json'));
}

console.log('✓ Build successful: All static assets copied to public/');
