import fs from 'node:fs';
import { join, resolve } from 'node:path';
import sharp from 'sharp';
import { getStructure, type File, type Folder } from 'directory-structure-json';
import { isImage } from './is-image.js';

export const toJson = (jsonName: string, basePath: string, includeSize: boolean): Promise<void> =>
  new Promise((resolvePromise, reject) => {
    getStructure(
      fs,
      basePath,
      async (error: Error | null, structure: Folder | Array<File | Folder> | undefined) => {
        if (error) {
          reject(error);
          return;
        }

        const enrichWithDimensions = async (items: any[], currentPath: string = basePath) => {
          for (const item of items) {
            if (item.type === 'folder' && item.children) {
              await enrichWithDimensions(item.children, join(currentPath, item.name));
            } else if (item.type === 'file' && isImage(item.name)) {
              const fullPath = resolve(currentPath, item.name);

              if (includeSize) {
                try {
                  const metadata = await sharp(fullPath).metadata();
                  item.width = metadata.width;
                  item.height = metadata.height;
                } catch (e) {
                  console.warn(`Could not read size for ${item.name}. Path: ${fullPath}`);
                }
              }
            }
          }
        };

        if (includeSize) {
          const itemsToProcess = Array.isArray(structure) ? structure : [structure];
          await enrichWithDimensions(itemsToProcess);
        }

        const imageFilter = (_: string, value: Folder | Array<File | Folder>) => {
          if (Array.isArray(value)) {
            return value.filter((item) => {
              const isFolder = item.type === 'folder';
              const isImageFile = item.type === 'file' && isImage(item.name);
              return isFolder || isImageFile;
            });
          }
          return value;
        };
        const json = JSON.stringify(structure, imageFilter, 2);

        fs.writeFile(jsonName, json, (err) => {
          if (err) reject(err);
          else resolvePromise();
        });
      },
    );
  });
