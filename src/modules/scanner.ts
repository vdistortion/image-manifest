import pLimit from 'p-limit';
import { SingleBar, Presets } from 'cli-progress';
import { imageProcessing } from './image-processing.js';
import { collectImages } from './collect-images.js';
import type { FormatType, MaxSizeType } from '../types.js';

export const scanner = async (
  srcDir: string,
  distDir: string,
  maxWidth: MaxSizeType,
  maxHeight: MaxSizeType,
  format: FormatType,
  concurrency: number,
): Promise<void> => {
  // 1. Собрать все файлы-изображения
  const images = await collectImages(srcDir, srcDir, distDir);
  if (images.length === 0) {
    console.log('No images found.');
    return;
  }

  // 2. Создать один прогресс-бар
  const bar = new SingleBar({}, Presets.rect);
  bar.start(images.length, 0);

  const limit = pLimit(concurrency);
  let processed = 0;

  const tasks = images.map((image) =>
    limit(async () => {
      await imageProcessing(image, maxWidth, maxHeight, format);
      processed++;
      bar.update(processed);
    }),
  );

  await Promise.all(tasks);
  bar.stop();
};
