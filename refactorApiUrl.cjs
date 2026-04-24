const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      // Handle single quotes
      if (content.includes("'http://localhost:5000")) {
        content = content.replace(/'http:\/\/localhost:5000/g, "(import.meta.env.VITE_API_URL || 'http://localhost:5000') + '");
        modified = true;
      }
      
      // Handle backticks (template literals)
      if (content.includes("`http://localhost:5000")) {
        content = content.replace(/`http:\/\/localhost:5000/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}");
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated', fullPath);
      }
    }
  }
}

traverse(srcDir);
