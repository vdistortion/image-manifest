import { readdir } from 'node:fs/promises';
import { join, relative, resolve, dirname } from 'node:path';
import { isImage } from './is-image.js';
import type { ImageType } from '../types.js';

export async function collectImages(
  rootPath: string,
  srcBase: string,
  distBase: string,
): Promise<ImageType[]> {
  const result: ImageType[] = [];

  async function walk(currentPath: string): Promise<void> {
    const entries = await readdir(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(currentPath, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && isImage(entry.name)) {
        const rel = relative(srcBase, full);
        const distDir = dirname(resolve(distBase, rel));
        result.push({
          name: entry.name,
          path: full,
          dist: distDir,
        });
      }
    }
  }

  await walk(rootPath);
  return result;
}
