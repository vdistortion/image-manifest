#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { confirm, input, number, rawlist } from '@inquirer/prompts';
import { cosmiconfig } from 'cosmiconfig';
import { Command } from 'commander';
import { run } from './index.js';
import type { OptionsType, FormatType } from './types.js';

const defaultFormat = 'webp';
const formats: FormatType[] = ['original', defaultFormat, 'jpg', 'png', 'avif'];

const explorer = cosmiconfig('image-manifest');

async function getInteractiveOptions(): Promise<OptionsType> {
  const src = await input({
    message: 'Source catalog with photos',
    default: 'img-src',
    validate: (v) => existsSync(v) || `"${v}" directory not found!`,
  });

  const dist = await input({
    message: 'Final catalog',
    default: 'img-dist',
  });

  const format = await rawlist({
    message: 'Image format',
    choices: formats.map((f) => ({ name: f, value: f })),
  });

  const width = (await number({ message: 'Maximum width', default: 0 })) ?? 0;
  const height = (await number({ message: 'Maximum height', default: 0 })) ?? 0;
  const concurrency = (await number({ message: 'Max concurrent tasks', default: 5 })) ?? 5;

  const isJson = await confirm({
    message: 'Should I generate a JSON file?',
    default: false,
  });

  const json = isJson
    ? await input({
        message: 'JSON file name',
        default: 'manifest',
      })
    : null;

  const includeSize = isJson
    ? await confirm({
        message: 'Include image dimensions (width/height) in JSON?',
        default: false,
      })
    : false;

  return { src, dist, format, width, height, concurrency, json, includeSize };
}

const defaultOptions: OptionsType = {
  src: 'img-src',
  dist: 'img-dist',
  format: 'webp',
  width: null,
  height: null,
  json: null,
  concurrency: 5,
  includeSize: false,
};

const program = new Command();

program
  .name('image-manifest')
  .description('Convert images and generate JSON manifest')
  .option('-s, --src <path>', 'source directory', defaultOptions.src)
  .option('-d, --dist <path>', 'output directory', defaultOptions.dist)
  .option(
    '-f, --format <format>',
    'output format: webp, jpg, png, avif, original',
    defaultOptions.format,
  )
  .option('-j, --json <name>', 'generate JSON manifest with given name')
  .option('--no-json', 'skip JSON generation')
  .option('-W, --width <pixels>', 'max width', parseInt)
  .option('-H, --height <pixels>', 'max height', parseInt)
  .option(
    '-c, --concurrency <number>',
    'max concurrent tasks',
    parseInt,
    defaultOptions.concurrency,
  )
  .option('--include-size', 'include width/height in JSON')
  .option('--manifest-only', 'only generate JSON, skip image conversion')
  .option('-i, --interactive', 'force interactive mode');

async function main() {
  const args = process.argv.slice(2);
  const hasArgs = args.length > 0;
  const forceInteractive = args.includes('--interactive') || args.includes('-i');

  if (!hasArgs || forceInteractive) {
    let options: OptionsType;

    if (!forceInteractive) {
      const cfg = await explorer.search();
      if (cfg) {
        options = { ...defaultOptions, ...cfg.config };
        console.log('Using configuration from', cfg.filepath);
        const result = await run(options);
        console.log(result);
        return;
      }
    }

    options = await getInteractiveOptions();
    const result = await run(options);
    console.log(result);
    return;
  }

  program.action(async (opts) => {
    const options: OptionsType = {
      src: opts.src || defaultOptions.src,
      dist: opts.dist || defaultOptions.dist,
      format: (opts.format as FormatType) || defaultOptions.format,
      width: opts.width || null,
      height: opts.height || null,
      json: opts.json === false ? null : opts.json || null,
      concurrency: opts.concurrency || defaultOptions.concurrency,
      includeSize: opts.includeSize || false,
      manifestOnly: opts.manifestOnly || false,
    };

    try {
      const result = await run(options);
      console.log(result);
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

  program.parse();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
