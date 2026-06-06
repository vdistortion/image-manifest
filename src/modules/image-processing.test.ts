import { describe, it, expect, vi } from 'vitest';
import { imageProcessing } from './image-processing.js';
import type { ImageType } from '../types.js';

vi.mock('sharp', () => {
  const mockSharpInstance = {
    metadata: vi.fn().mockResolvedValue({ width: 1000, height: 800 }),
    resize: vi.fn().mockReturnThis(),
    toFile: vi.fn().mockResolvedValue(undefined),
  };
  const mockSharp = vi.fn(() => mockSharpInstance) as any;
  mockSharp.cache = vi.fn();
  return { default: mockSharp };
});

vi.mock('node:fs/promises', () => ({
  default: {
    mkdir: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('imageProcessing', () => {
  const baseImage: ImageType = {
    name: 'test.png',
    path: '/src/test.png',
    dist: './dist', // относительный путь, чтобы избежать путаницы с /
  };

  it('converts to webp and appends extension', async () => {
    const sharp = await import('sharp');
    const mockSharp = sharp.default as any;
    await imageProcessing(baseImage, null, null, 'webp');
    expect(mockSharp).toHaveBeenCalled();
    expect(mockSharp().toFile).toHaveBeenCalledWith(expect.stringContaining('test.webp'));
  });

  it('keeps original extension if format is original', async () => {
    const sharp = await import('sharp');
    const mockSharp = sharp.default as any;
    await imageProcessing(baseImage, null, null, 'original');
    expect(mockSharp().toFile).toHaveBeenCalledWith(expect.stringContaining('test.png'));
  });

  it('resizes when width exceeds maxWidth', async () => {
    const sharp = await import('sharp');
    const mockSharp = sharp.default as any;
    await imageProcessing(baseImage, 500, null, 'webp');
    expect(mockSharp().resize).toHaveBeenCalledWith(500, null, { fit: 'inside' });
  });
});
