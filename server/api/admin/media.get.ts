import fs from 'fs';
import path from 'path';

export default defineEventHandler(async () => {
  const publicImgDir = path.resolve(process.cwd(), 'public/img');
  const files: { name: string; url: string; size: number }[] = [];

  function scanDir(dir: string, urlPrefix: string) {
    if (!fs.existsSync(dir)) return;
    const list = fs.readdirSync(dir);
    for (const f of list) {
      const full = path.join(dir, f);
      try {
        const stats = fs.statSync(full);
        if (stats.isDirectory()) {
          scanDir(full, `${urlPrefix}/${f}`);
        } else if (/\.(png|jpe?g|webp|svg|gif)$/i.test(f)) {
          files.push({
            name: `${urlPrefix.replace(/^\/img\/?/, '') ? urlPrefix.replace(/^\/img\/?/, '') + '/' : ''}${f}`,
            url: `${urlPrefix}/${f}`,
            size: stats.size
          });
        }
      } catch {}
    }
  }

  scanDir(publicImgDir, '/img');

  return {
    media: files
  };
});
