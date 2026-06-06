import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { collectImages } from './collect-images.js';

describe('collectImages', () => {
  let tmpDir: string;

  beforeAll(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'image-manifest-test-'));
    await mkdir(join(tmpDir, 'nested'));
    await writeFile(join(tmpDir, 'a.jpg'), '');
    await writeFile(join(tmpDir, 'nested', 'b.png'), '');
    await writeFile(join(tmpDir, 'nested', 'c.txt'), '');
  });

  afterAll(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('collects all images ignoring non-images', async () => {
    const result = await collectImages(tmpDir, tmpDir, '/dist');
    expect(result).toHaveLength(2);
    expect(result.map((i) => i.name).sort()).toEqual(['a.jpg', 'b.png']);
  });

  it('computes correct dist paths', async () => {
    const result = await collectImages(tmpDir, tmpDir, '/dist');
    const nested = result.find((i) => i.name === 'b.png');
    expect(nested?.dist).toBe(join('/dist', 'nested'));
  });
});
