import fs from 'fs';
import path from 'path';

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event);
    if (!formData || formData.length === 0) {
      // Check if json base64 was sent
      const body = await readBody(event).catch(() => null);
      if (body && body.data && body.filename) {
        const matches = body.data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        const buffer = matches ? Buffer.from(matches[2], 'base64') : Buffer.from(body.data, 'base64');
        const cleanName = body.filename.toLowerCase().replace(/[^a-z0-9.-]/g, '-');
        const fileName = `${Date.now()}-${cleanName}`;
        
        const publicDir = path.resolve(process.cwd(), 'public/img');
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        
        const filePath = path.join(publicDir, fileName);
        fs.writeFileSync(filePath, buffer);
        
        return {
          success: true,
          url: `/img/${fileName}`,
          filename: fileName
        };
      }
      
      throw createError({ statusCode: 400, statusMessage: 'No file uploaded' });
    }

    const file = formData.find(item => item.name === 'file' || item.filename);
    if (!file || !file.data) {
      throw createError({ statusCode: 400, statusMessage: 'File data missing' });
    }

    const originalName = file.filename || `upload-${Date.now()}.png`;
    const cleanName = originalName.toLowerCase().replace(/[^a-z0-9.-]/g, '-');
    const fileName = `${Date.now()}-${cleanName}`;

    const publicDir = path.resolve(process.cwd(), 'public/img');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const filePath = path.join(publicDir, fileName);
    fs.writeFileSync(filePath, file.data);

    return {
      success: true,
      url: `/img/${fileName}`,
      filename: fileName
    };
  } catch (err: any) {
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Upload failed',
      message: err.message || 'Could not save uploaded file'
    });
  }
});
