import multer from 'multer';
import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: config.image.maxSizeMB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (config.image.allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: ${config.image.allowedTypes.join(', ')}`));
    }
  },
});

export const processImage = [
  upload.single('image'),
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.file) {
      next();
      return;
    }
    try {
      const compressed = await sharp(req.file.buffer)
        .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      req.file.buffer = compressed;
      req.file.mimetype = 'image/jpeg';
      next();
    } catch (error) {
      next(error);
    }
  },
];

export function imageToBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}
