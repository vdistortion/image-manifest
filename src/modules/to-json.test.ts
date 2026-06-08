import { describe, it, expect, vi, beforeEach } from 'vitest';
import { writeFile } from 'node:fs/promises';
import { toJson } from './to-json.js';

vi.mock('node:fs/promises', () => ({
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  readdir: vi.fn((dir: string) => {
    // корень
    if (dir === '/base') {
      return [
        { name: 'nested', isDirectory: () => true, isFile: () => false },
        { name: 'img.png', isDirectory: () => false, isFile: () => true },
        { name: 'doc.txt', isDirectory: () => false, isFile: () => true },
      ];
    }
    // вложенная папка
    if (dir === '/base/nested') {
      return [{ name: 'deep.png', isDirectory: () => false, isFile: () => true }];
    }
    return [];
  }),
}));

vi.mock('sharp', () => {
  const sharp = vi.fn(() => ({
    metadata: vi.fn().mockResolvedValue({ width: 100, height: 200 }),
  }));
  return { default: sharp };
});

import { readdir } from 'node:fs/promises';
import sharp from 'sharp';

describe('toJson', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('writes filtered JSON without sizes', async () => {
    const jsonName = '/tmp/manifest.json';
    await toJson(jsonName, '/base', false);

    expect(writeFile).toHaveBeenCalledWith(jsonName, expect.any(String), 'utf8');
    const writtenJson = JSON.parse((writeFile as any).mock.calls[0][1]);

    expect(writtenJson).toEqual([
      {
        type: 'folder',
        name: 'nested',
        children: [{ type: 'file', name: 'deep.png' }],
      },
      { type: 'file', name: 'img.png' },
    ]);
    expect(writtenJson[1].width).toBeUndefined();
    expect(writtenJson[1].height).toBeUndefined();
  });

  it('includes sizes when includeSize is true', async () => {
    const jsonName = '/tmp/manifest.json';
    await toJson(jsonName, '/base', true);

    const writtenJson = JSON.parse((writeFile as any).mock.calls[0][1]);
    // первый файл (img.png) должен получить размеры
    expect(writtenJson[1].width).toBe(100);
    expect(writtenJson[1].height).toBe(200);
    expect(sharp).toHaveBeenCalled();
  });

  it('handles empty directory', async () => {
    // переопределяем readdir для пустого корня
    (readdir as any).mockReturnValue([]);
    await toJson('/tmp/empty.json', '/base', false);
    expect(writeFile).toHaveBeenCalledWith('/tmp/empty.json', '[]', 'utf8');
  });
});
