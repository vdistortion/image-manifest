import { extname } from 'node:path';

const SUPPORTED = new Set(['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'tiff', 'tif', 'svg']);
export const isImage = (filename: string) =>
  SUPPORTED.has(extname(filename).slice(1).toLowerCase());
