import { writeFile, mkdir } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import sharp from 'sharp';
import fs from 'node:fs';
import debugLib from 'debug';
import { getStructure } from 'directory-structure-json';
import { isImage } from './is-image.js';
import type { ImageItem, ImageManifest } from '../types.js';

const debug = debugLib('image-manifest:to-json');

export const toJson = async (
  jsonName: string,
  basePath: string,
  includeSize: boolean,
): Promise<void> => {
  debug(`Generating JSON for ${basePath}`);

  // Промисификация getStructure
  const structure = await new Promise<ImageItem[]>((resolvePromise, reject) => {
    getStructure(fs, basePath, (error: Error | null, structure: ImageManifest | undefined) => {
      if (error) reject(error);
      else {
        if (!structure) resolvePromise([]);
        else if (Array.isArray(structure)) resolvePromise(structure);
        else resolvePromise([structure]);
      }
    });
  });

  // Размеры
  const enrichWithDimensions = async (items: ImageItem[], currentPath: string = basePath) => {
    for (const item of items) {
      if (item.type === 'folder' && item.children) {
        await enrichWithDimensions(item.children, join(currentPath, item.name));
      } else if (item.type === 'file' && isImage(item.name)) {
        if (includeSize) {
          const fullPath = resolve(currentPath, item.name);
          try {
            const metadata = await sharp(fullPath).metadata();
            item.width = metadata.width;
            item.height = metadata.height;
          } catch (e) {
            debug(`Could not read size for ${item.name}: ${String(e)}`);
          }
        }
      }
    }
  };

  await enrichWithDimensions(structure);

  // Фильтрация: только папки и изображения
  const imageFilter = (_: string, value: ImageManifest): ImageManifest => {
    if (Array.isArray(value)) {
      return value.filter((item: ImageItem) => {
        const isFolder = item.type === 'folder';
        const isImageFile = item.type === 'file' && isImage(item.name);
        return isFolder || isImageFile;
      });
    }
    return value;
  };
  const json = JSON.stringify(structure, imageFilter, 2);
  // Создаём директорию перед записью
  await mkdir(dirname(jsonName), { recursive: true });
  await writeFile(jsonName, json, 'utf8');
  debug(`JSON written to ${jsonName}`);
};
