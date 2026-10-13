import fs from 'fs';
import path from 'path';

export default defineEventHandler(async () => {
  const publicImgDir = path.resolve(process.cwd(), 'public/img');
  const files: { name: string; url: string; size: number }[] = [];

  if (fs.existsSync(publicImgDir)) {
    const list = fs.readdirSync(publicImgDir);
    for (const f of list) {
      if (/\.(png|jpe?g|webp|svg|gif)$/i.test(f)) {
        try {
          const stats = fs.statSync(path.join(publicImgDir, f));
          files.push({
            name: f,
            url: `/img/${f}`,
            size: stats.size
          });
        } catch {}
      }
    }
  }

  return {
    media: files
  };
});
