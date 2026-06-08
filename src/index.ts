import { existsSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import debugLib from 'debug';
import { toJson } from './modules/to-json.js';
import { scanner } from './modules/scanner.js';
import { recreateDist } from './modules/recreate-dist.js';
import type { OptionsType } from './types.js';
export type { OptionsType } from './types.js';
import { SourceNotFoundError, DistInsideSourceError, SourceInsideDistError } from './errors.js';

const debug = debugLib('image-manifest:run');

export async function run(options: OptionsType): Promise<{ status: string; message: string }> {
  const absSrc = resolve(options.src);
  const absDist = resolve(options.dist);

  if (!existsSync(absSrc)) {
    throw new SourceNotFoundError(options.src);
  }

  // Проверка: не находится ли dist внутри src
  const relDistToSrc = relative(absSrc, absDist);
  if (relDistToSrc && !relDistToSrc.startsWith('..') && relDistToSrc !== '') {
    throw new DistInsideSourceError();
  }

  // Проверка: не находится ли src внутри dist
  const relSrcToDist = relative(absDist, absSrc);
  if (relSrcToDist && !relSrcToDist.startsWith('..') && relSrcToDist !== '') {
    throw new SourceInsideDistError();
  }

  // Если запрошен только манифест
  if (options.manifestOnly) {
    if (options.json) {
      const nameJson = join(absDist, `${options.json}.json`);
      // Генерируем манифест на основе исходной папки
      await toJson(nameJson, absSrc, options.includeSize);
      debug(`Manifest generated: ${nameJson}`);
      return { status: 'ok', message: 'Manifest created.' };
    }
    return {
      status: 'ok',
      message: 'No JSON name specified, skipping manifest.',
    };
  }

  // Обычная обработка: конвертация + JSON
  await recreateDist(absDist);
  debug('Output directory recreated');

  await scanner(
    absSrc,
    absDist,
    options.width,
    options.height,
    options.format,
    options.concurrency,
    options.progress,
    options.continueOnError,
  );
  debug('Image processing completed');

  if (options.json) {
    const nameJson = join(absDist, `${options.json}.json`);
    await toJson(nameJson, absDist, options.includeSize);
    debug(`JSON manifest written: ${nameJson}`);
  }

  return { status: 'ok', message: 'Finished successfully!' };
}
