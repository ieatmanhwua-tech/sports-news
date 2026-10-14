import fs from 'fs';
import path from 'path';

const cliDist = path.join(process.cwd(), 'node_modules/@nuxt/cli/dist');
if (fs.existsSync(cliDist)) {
  const files = fs.readdirSync(cliDist);
  for (const f of files) {
    if (f.startsWith('listen-') && f.endsWith('.mjs')) {
      const fullPath = path.join(cliDist, f);
      let content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes('The dev server is reachable from the network without authentication')) {
        content = content.replace(
          /logger\.warn\("The dev server is reachable from the network without authentication: anyone who can connect can read the app, build errors and source code\."\);?/g,
          '/* suppressed dev network warning */'
        );
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log('✓ Patched Nuxt dev server network warning in', f);
      }
    }
  }
}
