import pLimit from 'p-limit';
import { SingleBar, Presets } from 'cli-progress';
import debugLib from 'debug';
import { imageProcessing } from './image-processing.js';
import { collectImages } from './collect-images.js';
import type { FormatType, MaxSizeType } from '../types.js';

const debug = debugLib('image-manifest:scanner');

export const scanner = async (
  srcDir: string,
  distDir: string,
  maxWidth: MaxSizeType,
  maxHeight: MaxSizeType,
  format: FormatType,
  concurrency: number,
): Promise<number> => {
  // 1. Собрать все файлы-изображения
  const images = await collectImages(srcDir, srcDir, distDir);
  if (images.length === 0) {
    debug('No images found.');
    return 0;
  }

  // 2. Создать один прогресс-бар
  const bar = new SingleBar({}, Presets.rect);
  bar.start(images.length, 0);

  const limit = pLimit(concurrency);
  let processed = 0;

  try {
    const tasks = images.map((image) =>
      limit(async () => {
        await imageProcessing(image, maxWidth, maxHeight, format);
        processed++;
        bar.update(processed);
      }),
    );

    await Promise.all(tasks);
    return processed;
  } finally {
    bar.stop();
  }
};
