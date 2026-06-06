#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { confirm, input, number, rawlist } from '@inquirer/prompts';
import { toJson } from './modules/to-json.js';
import { scanner } from './modules/scanner.js';
import { recreateDist } from './modules/recreate-dist.js';
import type { OptionsType, FormatType } from './types.js';

const defaultFormat = 'webp';
const formats: FormatType[] = ['original', defaultFormat, 'jpg', 'png', 'avif'];

const prompt = async () => {
  const src = await input({
    message: 'Source catalog with photos',
    default: 'img-src',
    validate: (value: string) => {
      const isExist = existsSync(value);
      if (!isExist) console.warn('\x1b[31m', `\n"${value}" directory not found!`, '\x1b[0m');
      return isExist;
    },
  });

  const dist = await input({
    message: 'Final catalog',
    default: 'img-dist',
  });

  const format = await rawlist({
    message: 'Image format',
    choices: formats.map((format: FormatType) => ({
      name: format,
      value: format,
    })),
  });

  const width = await number({
    message: 'Maximum width',
    default: 0,
  });

  const height = await number({
    message: 'Maximum height',
    default: 0,
  });

  const concurrency = await number({
    message: 'Max concurrent tasks',
    default: 5,
  });

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

  return {
    src,
    dist,
    format,
    width,
    height,
    concurrency,
    isJson,
    json,
    includeSize,
  };
};

const options: Readonly<OptionsType> = {
  src: 'img-src',
  dist: 'img-dist',
  format: defaultFormat,
  width: null,
  height: null,
  json: null,
  concurrency: 5,
  includeSize: false,
};

const args: string[] = process.argv.slice(2);

const params: Partial<OptionsType> = {};

if (args.length) {
  args.forEach((arg: string) => {
    const [param, value] = arg.split('=');
    const isValidValue = Boolean(value?.length);
    const isValidParam = param ? Object.keys(options).includes(param) : false;

    if (isValidValue && isValidParam) {
      const key = param as keyof OptionsType;

      if (key === 'includeSize') {
        params[key] = value === 'true';
      } else if (key === 'width' || key === 'height') {
        const num = Number(value);
        if (num >= 100) params[key] = num;
      } else if (key === 'concurrency') {
        const num = Number(value);
        if (num >= 0) params[key] = num;
      } else if (key === 'format') {
        if (formats.includes(value as FormatType)) params[key] = value as FormatType;
      } else {
        params[key] = value;
      }
    }
  });

  start().then(console.info);
} else {
  prompt().then((answers) => {
    params.src = answers.src;
    params.dist = answers.dist;
    params.format = answers.format;
    params.includeSize = answers.includeSize;
    if (answers.isJson) params.json = answers.json;
    if (answers.concurrency && answers.concurrency > 0) params.concurrency = answers.concurrency;
    if (answers.width && answers.width > 0) params.width = answers.width;
    if (answers.height && answers.height > 0) params.height = answers.height;

    if (existsSync(answers.dist)) {
      confirm({
        message: `The "${answers.dist}" folder already exists. Do you want to overwrite it?`,
        default: false,
      }).then((confirmOverwrite) => {
        if (confirmOverwrite) start().then(console.info);
        else console.warn('\x1b[31m', `Process termination.`, '\x1b[0m');
      });
    } else {
      start().then(console.info);
    }
  });
}

async function start() {
  const settings: Readonly<OptionsType> = {
    ...options,
    ...params,
  };

  const absSrc = resolve(settings.src);
  const absDist = resolve(settings.dist);

  if (!existsSync(absSrc)) {
    console.warn('\x1b[31m', `"${settings.src}" directory not found!`, '\x1b[0m');
  } else {
    await recreateDist(absDist);

    await scanner(
      absSrc,
      absSrc,
      absDist,
      settings.width,
      settings.height,
      settings.format,
      settings.concurrency,
    );

    if (settings.json) {
      const nameJson = join(absDist, `${settings.json}.json`);
      await toJson(nameJson, absDist, settings.includeSize);
      console.info(`File ./${nameJson} generated!`);
    }
  }

  return 'Finished successfully!';
}
