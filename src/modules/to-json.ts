import { writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import sharp from 'sharp';
import fs from 'node:fs';
import debugLib from 'debug';
import { getStructure, type File, type Folder } from 'directory-structure-json';
import { isImage } from './is-image.js';

const debug = debugLib('image-manifest:to-json');

export const toJson = async (
  jsonName: string,
  basePath: string,
  includeSize: boolean,
): Promise<void> => {
  debug(`Generating JSON for ${basePath}`);

  // Промисификация getStructure
  const structure = await new Promise<(File | Folder)[]>((resolvePromise, reject) => {
    getStructure(
      fs,
      basePath,
      (error: Error | null, structure: Folder | Array<File | Folder> | undefined) => {
        if (error) reject(error);
        else {
          if (!structure) {
            resolvePromise([]);
          } else if (Array.isArray(structure)) {
            resolvePromise(structure);
          } else {
            resolvePromise([structure]);
          }
        }
      },
    );
  });

  // Обогащение размерами
  const enrichWithDimensions = async (items: (File | Folder)[], currentPath: string = basePath) => {
    for (const item of items) {
      if (item.type === 'folder' && item.children) {
        await enrichWithDimensions(item.children, join(currentPath, item.name));
      } else if (item.type === 'file' && isImage(item.name)) {
        if (includeSize) {
          const fullPath = resolve(currentPath, item.name);
          try {
            const metadata = await sharp(fullPath).metadata();
            (item as any).width = metadata.width;
            (item as any).height = metadata.height;
          } catch (e) {
            debug(`Could not read size for ${item.name}: ${e}`);
          }
        }
      }
    }
  };

  await enrichWithDimensions(structure);

  // Фильтрация: только папки и изображения
  const imageFilter = (_: string, value: any) => {
    if (Array.isArray(value)) {
      return value.filter((item: any) => {
        const isFolder = item.type === 'folder';
        const isImageFile = item.type === 'file' && isImage(item.name);
        return isFolder || isImageFile;
      });
    }
    return value;
  };
  const json = JSON.stringify(structure, imageFilter, 2);
  await writeFile(jsonName, json, 'utf8');
  debug(`JSON written to ${jsonName}`);
};
