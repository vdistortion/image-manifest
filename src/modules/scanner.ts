import { relative, dirname, resolve, sep, join } from 'node:path';
import { readdir, stat } from 'node:fs/promises';
import pLimit from 'p-limit';
import { SingleBar, Presets } from 'cli-progress';
import { imageProcessing } from './image-processing.js';
import { isImage } from './is-image.js';
import type { FormatType, ImageType, MaxSizeType } from '../../types/index.ts';

export const scanner = (
  initPath: string,
  dirSrc: string,
  dirDist: string,
  maxWidth: MaxSizeType,
  maxHeight: MaxSizeType,
  format: FormatType,
  concurrency: number,
) => {
  const absDist = resolve(dirDist);

  return readdir(initPath).then((files) => {
    const bar = new SingleBar({}, Presets.rect);
    const limit = pLimit(concurrency);
    let done = 0;
    bar.start(files.length, 0);

    const promises = files.map((file) =>
      limit(() => {
        const newPath = join(initPath, file);

        return stat(newPath).then((stats) => {
          if (stats.isDirectory()) {
            const absNewPath = resolve(newPath);
            if (absNewPath === absDist || absNewPath.startsWith(absDist + sep))
              return Promise.resolve();
            return scanner(newPath, dirSrc, dirDist, maxWidth, maxHeight, format, concurrency);
          } else if (isImage(file)) {
            const relativePath = relative(dirSrc, newPath); // путь файла относительно папки-источника
            const finalDistPath = resolve(dirDist, relativePath); // полный путь в папке-назначении
            const distFolder = dirname(finalDistPath); // только папка, где будет лежать файл

            const image: ImageType = {
              name: file,
              path: newPath,
              dist: distFolder,
            };
            return imageProcessing(image, maxWidth, maxHeight, format).then(() => {
              done++;
              bar.update(done);
            });
          } else return Promise.resolve();
        });
      }),
    );
    return Promise.all(promises).then(() => bar.stop());
  });
};
