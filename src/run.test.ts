import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import sharp from 'sharp';
import { run } from './index.js';
import type { OptionsType } from './types.js';
import { SourceNotFoundError, DistInsideSourceError } from './errors.js';

describe('run (integration)', () => {
  let tmpDir: string;
  let srcDir: string;
  let distDir: string;

  beforeAll(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'run-test-'));
    srcDir = join(tmpDir, 'src');
    distDir = join(tmpDir, 'dist');
    await mkdir(srcDir, { recursive: true });

    const imgBuffer = await sharp({
      create: { width: 100, height: 100, channels: 3, background: { r: 255, g: 0, b: 0 } },
    })
      .png()
      .toBuffer();

    await writeFile(join(srcDir, 'test.png'), imgBuffer);
    await mkdir(join(srcDir, 'nested'));
    await writeFile(join(srcDir, 'nested', 'photo.jpg'), imgBuffer);
  });

  afterAll(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('converts images and generates JSON', async () => {
    const options: OptionsType = {
      src: srcDir,
      dist: distDir,
      format: 'webp',
      width: null,
      height: null,
      json: 'manifest',
      concurrency: 2,
      includeSize: false,
    };
    const result = await run(options);
    expect(result.status).toBe('ok');
    expect(result.message).toBe('Finished successfully!');

    const fs = await import('node:fs/promises');
    await fs.access(join(distDir, 'test.webp'));
    await fs.access(join(distDir, 'nested', 'photo.webp'));

    const manifestContent = await fs.readFile(join(distDir, 'manifest.json'), 'utf8');
    const manifest = JSON.parse(manifestContent);
    expect(manifest).toBeInstanceOf(Array);
    // Должны быть как минимум файл и папка
    expect(manifest.length).toBeGreaterThanOrEqual(2);
    // Проверяем, что есть папка nested
    const nestedFolder = manifest.find(
      (item: any) => item.type === 'folder' && item.name === 'nested',
    );
    expect(nestedFolder).toBeDefined();
    expect(nestedFolder.children.length).toBeGreaterThan(0);
  });

  it('manifestOnly: only generates JSON without converting', async () => {
    const manifestOnlyDist = join(tmpDir, 'dist-manifest-only');
    const options: OptionsType = {
      src: srcDir,
      dist: manifestOnlyDist,
      format: 'webp',
      width: null,
      height: null,
      json: 'manifest',
      concurrency: 2,
      includeSize: true,
      manifestOnly: true,
    };
    const result = await run(options);
    expect(result.status).toBe('ok');

    const fs = await import('node:fs/promises');
    const manifestPath = join(manifestOnlyDist, 'manifest.json');
    await fs.access(manifestPath);

    const manifestContent = await fs.readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    // Найдём первый файл с размерами
    const imageFile = manifest.find((item: any) => item.type === 'file' && item.width);
    expect(imageFile).toBeDefined();
    expect(imageFile.width).toBe(100);
    expect(imageFile.height).toBe(100);
  });

  it('throws SourceNotFoundError for missing src', async () => {
    const options: OptionsType = {
      src: join(tmpDir, 'nonexistent'),
      dist: distDir,
      format: 'webp',
      width: null,
      height: null,
      json: null,
      concurrency: 1,
      includeSize: false,
    };
    await expect(run(options)).rejects.toThrow(SourceNotFoundError);
  });

  it('throws DistInsideSourceError when dist is inside src', async () => {
    const subDir = join(srcDir, 'output');
    await mkdir(subDir, { recursive: true });
    const options: OptionsType = {
      src: srcDir,
      dist: subDir,
      format: 'webp',
      width: null,
      height: null,
      json: null,
      concurrency: 1,
      includeSize: false,
    };
    await expect(run(options)).rejects.toThrow(DistInsideSourceError);
  });
});
