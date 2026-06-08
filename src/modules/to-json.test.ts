import { describe, it, expect, vi, beforeEach } from 'vitest';
import { writeFile } from 'node:fs/promises';
import { toJson } from './to-json.js';

vi.mock('node:fs/promises', () => ({
  writeFile: vi.fn(),
  mkdir: vi.fn(),
}));

vi.mock('node:fs', () => ({
  default: {
    readdir: vi.fn(),
    stat: vi.fn(),
  },
}));

vi.mock('directory-structure-json', () => ({
  getStructure: vi.fn(),
}));

vi.mock('sharp', () => {
  const sharp = vi.fn(() => ({
    metadata: vi.fn().mockResolvedValue({ width: 100, height: 200 }),
  }));
  return { default: sharp };
});

import { getStructure } from 'directory-structure-json';
import sharp from 'sharp';

describe('toJson', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('writes filtered JSON without sizes', async () => {
    const mockStructure = [
      {
        type: 'folder',
        name: 'nested',
        children: [
          { type: 'file', name: 'img.png' },
          { type: 'file', name: 'doc.txt' },
        ],
      },
    ];
    (getStructure as any).mockImplementation((fs: any, dir: string, cb: Function) => {
      cb(null, mockStructure);
    });

    const jsonName = '/tmp/manifest.json';
    await toJson(jsonName, '/base', false);

    expect(writeFile).toHaveBeenCalledWith(jsonName, expect.any(String), 'utf8');
    const writtenJson = JSON.parse((writeFile as any).mock.calls[0][1]);

    expect(writtenJson).toEqual([
      {
        type: 'folder',
        name: 'nested',
        children: [{ type: 'file', name: 'img.png' }],
      },
    ]);
    expect(writtenJson[0].children[0].width).toBeUndefined();
    expect(writtenJson[0].children[0].height).toBeUndefined();
  });

  it('includes sizes when includeSize is true', async () => {
    const mockStructure = [{ type: 'file', name: 'img.png' }];
    (getStructure as any).mockImplementation((fs: any, dir: string, cb: Function) => {
      cb(null, mockStructure);
    });

    const jsonName = '/tmp/manifest.json';
    await toJson(jsonName, '/base', true);

    const writtenJson = JSON.parse((writeFile as any).mock.calls[0][1]);
    expect(writtenJson[0].width).toBe(100);
    expect(writtenJson[0].height).toBe(200);
    expect(sharp).toHaveBeenCalled();
  });

  it('handles empty directory', async () => {
    (getStructure as any).mockImplementation((fs: any, dir: string, cb: Function) => {
      cb(null, []);
    });

    await toJson('/tmp/empty.json', '/base', false);
    expect(writeFile).toHaveBeenCalledWith('/tmp/empty.json', '[]', 'utf8');
  });
});
