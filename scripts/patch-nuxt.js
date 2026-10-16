import fs from 'fs';
import path from 'path';

// 1. Suppress Nuxt CLI dev network warning
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

// 2. Patch entry.async.js to use static import on client and catch any unhandled rejections
const entryAsyncPath = path.join(process.cwd(), 'node_modules/nuxt/dist/app/entry.async.js');
if (fs.existsSync(entryAsyncPath)) {
  const patchedEntryAsync = [
    '//#region src/app/entry.async.ts',
    'import clientEntry from "#app/entry";',
    'const entry = import.meta.server ? (ctx) => import("#app/entry").then((m) => m.default(ctx)) : () => Promise.resolve(clientEntry);',
    'if (import.meta.client) Promise.resolve(entry()).catch(() => {});',
    '//#endregion',
    'export { entry as default };',
    ''
  ].join('\n');
  fs.writeFileSync(entryAsyncPath, patchedEntryAsync, 'utf-8');
  console.log('✓ Patched node_modules/nuxt/dist/app/entry.async.js to use static client import');
}
