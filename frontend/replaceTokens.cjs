const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const regex = /const\s+T\s*=\s*\{[\s\S]*?\};\n?/g;
      
      if (regex.test(content) && !fullPath.includes('HomePage.tsx') && !fullPath.includes('ThemeTokens.ts')) {
        content = content.replace(regex, `import { T } from "@/components/ThemeTokens";\n`);
        fs.writeFileSync(fullPath, content);
        console.log(`Replaced T in ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
