import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { toJson } from './modules/to-json.js';
import { scanner } from './modules/scanner.js';
import { recreateDist } from './modules/recreate-dist.js';
import type { OptionsType } from './types.js';
export type { OptionsType } from './types.js';

export async function run(options: OptionsType): Promise<string> {
  const absSrc = resolve(options.src);
  const absDist = resolve(options.dist);

  if (!existsSync(absSrc)) {
    throw new Error(`Source directory "${options.src}" not found.`);
  }

  // Если запрошен только манифест
  if (options.manifestOnly) {
    if (options.json) {
      const nameJson = join(absDist, `${options.json}.json`);
      // Генерируем манифест на основе исходной папки
      await toJson(nameJson, absSrc, options.includeSize);
      console.log(`Manifest generated: ${nameJson}`);
    }
    return 'Manifest created.';
  }

  // Обычная обработка: конвертация + JSON
  await recreateDist(absDist);
  await scanner(
    absSrc,
    absDist,
    options.width,
    options.height,
    options.format,
    options.concurrency,
  );

  if (options.json) {
    const nameJson = join(absDist, `${options.json}.json`);
    await toJson(nameJson, absDist, options.includeSize);
    console.info(`File ${nameJson} generated.`);
  }

  return 'Finished successfully!';
}
