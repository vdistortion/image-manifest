import pLimit from 'p-limit';
import { SingleBar, Presets } from 'cli-progress';
import debugLib from 'debug';
import { imageProcessing } from './image-processing.js';
import { collectImages } from './collect-images.js';
import type { FormatType, ImageType, MaxSizeType } from '../types.js';

const debug = debugLib('image-manifest:scanner');

export const scanner = async (
  srcDir: string,
  distDir: string,
  maxWidth: MaxSizeType,
  maxHeight: MaxSizeType,
  format: FormatType,
  concurrency: number,
  progress = true,
  continueOnError = false,
): Promise<number> => {
  const images = await collectImages(srcDir, srcDir, distDir);
  if (images.length === 0) {
    debug('No images found.');
    return 0;
  }

  let bar: SingleBar | null = null;
  if (progress) {
    bar = new SingleBar({}, Presets.rect);
    bar.start(images.length, 0);
  }

  const limit = pLimit(concurrency);
  let processed = 0;
  const errors: Error[] = [];

  const processImage = async (image: ImageType) => {
    try {
      await imageProcessing(image, maxWidth, maxHeight, format);
    } catch (err) {
      if (continueOnError) {
        debug(`Error processing ${image.name}: ${String(err)}`);
        errors.push(err instanceof Error ? err : new Error(String(err)));
        return; // продолжаем
      }
      throw err; // прерываем весь процесс
    } finally {
      processed++;
      bar?.update(processed);
    }
  };

  try {
    const tasks = images.map((image) => limit(() => processImage(image)));
    await Promise.all(tasks);
    if (errors.length > 0) {
      debug(`Finished with ${errors.length} error(s).`);
    }
    return processed;
  } finally {
    bar?.stop();
  }
};
