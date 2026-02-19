import fs from 'node:fs';
import isImage from 'is-image';
import sharp from 'sharp';
import { getStructure, traverseStructure, type File, type Folder } from 'directory-structure-json';
import { getPath } from './get-path.js';

const isImageExtended = (name: string) => isImage(name) || name.toLowerCase().endsWith('.avif');

export const toJson = (jsonName: string, basePath: string, includeSize: boolean) =>
  new Promise((resolve, reject) => {
    getStructure(
      fs,
      basePath,
      async (error: Error | null, structure: Folder | Array<File | Folder> | undefined) => {
        if (error) {
          reject(error);
          return;
        }

        const list: string[] = [];

        const enrichWithDimensions = async (items: any[]) => {
          for (const item of items) {
            if (item.type === 'folder' && item.children) {
              await enrichWithDimensions(item.children);
            } else if (item.type === 'file' && isImageExtended(item.name)) {
              const fullPath = getPath(basePath, item.path || '', item.name);

              if (includeSize) {
                try {
                  const metadata = await sharp(fullPath).metadata();
                  item.width = metadata.width;
                  item.height = metadata.height;
                } catch (e) {
                  console.warn(`Could not read size for ${item.name}`);
                }
              }
              list.push(fullPath);
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
              const isImageFile = item.type === 'file' && isImageExtended(item.name);
              return isFolder || isImageFile;
            });
          }
          return value;
        };
        const json = JSON.stringify(structure, imageFilter, 2);

        if (Array.isArray(structure)) {
          traverseStructure(
            structure,
            '.',
            () => {},
            (file: File, path: string) => {
              const fullPath = getPath(path, file.name);
              list.push(fullPath);
            },
          );
        }

        fs.writeFile(jsonName, json, (err) => {
          if (err) reject(err);
          else resolve(list);
        });
      },
    );
  });
