import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, rm, access, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { recreateDist } from './recreate-dist.js';

describe('recreateDist', () => {
  let tmpDir: string;
  let distDir: string;

  beforeAll(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'recreate-dist-test-'));
    distDir = join(tmpDir, 'output');
  });

  afterAll(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('creates a new directory if it does not exist', async () => {
    await recreateDist(distDir);
    await expect(access(distDir)).resolves.toBeUndefined();
  });

  it('removes and recreates directory if it already exists', async () => {
    // создаём подпапку с файлом
    const subDir = join(distDir, 'sub');
    await mkdir(subDir, { recursive: true });
    await writeFile(join(subDir, 'test.txt'), 'hello');

    await recreateDist(distDir);

    // старая папка должна быть удалена и создана заново (пустая)
    const entries = await import('node:fs/promises').then((fs) => fs.readdir(distDir));
    expect(entries).toEqual([]);
  });
});
