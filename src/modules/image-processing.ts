import fs from 'node:fs/promises';
import { join, parse } from 'node:path';
import sharp from 'sharp';
import type { FormatType, ImageType, MaxSizeType } from '../types.js';

sharp.cache(false);

function getName(fullName: string, format: string) {
  if (format === 'original') return fullName;
  const { name } = parse(fullName);
  return `${name}.${format}`;
}

export const imageProcessing = async (
  image: ImageType,
  maxWidth: MaxSizeType,
  maxHeight: MaxSizeType,
  format: FormatType,
) => {
  const fullPath = join(image.dist, getName(image.name, format));
  await fs.mkdir(image.dist, { recursive: true });

  const input = sharp(image.path, {
    animated: true,
    limitInputPixels: false,
  });

  const metadata = await input.metadata();
  const currentWidth = metadata.width ?? null;
  const currentHeight = metadata.height ?? null;
  const width =
    typeof maxWidth === 'number' && currentWidth && currentWidth > maxWidth ? maxWidth : null;
  const height =
    typeof maxHeight === 'number' && currentHeight && currentHeight > maxHeight ? maxHeight : null;

  await input.resize(width, height, { fit: 'inside' }).toFile(fullPath);
};
