import { describe, expect, it, vi } from 'vitest';
import { convertToWebp } from './to-webp.js';

const { toBuffer, webp, resize, sharpMock } = vi.hoisted(() => {
  const toBuffer = vi.fn().mockResolvedValue({
    data: Buffer.from('webp'),
    info: { width: 1000, height: 750 },
  });
  const webp = vi.fn(() => ({ toBuffer }));
  const resize = vi.fn(() => ({ webp }));
  const sharpMock = vi.fn(() => ({ resize }));
  return { toBuffer, webp, resize, sharpMock };
});

vi.mock('sharp', () => ({
  default: Object.assign(sharpMock, { cache: vi.fn() }),
}));

describe('convertToWebp', () => {
  it('converts to WebP and limits the longest side', async () => {
    const result = await convertToWebp(Buffer.from('source'));

    expect(sharpMock).toHaveBeenCalledWith(Buffer.from('source'), {
      animated: true,
      limitInputPixels: false,
    });
    expect(resize).toHaveBeenCalledWith(1000, 1000, {
      fit: 'inside',
      withoutEnlargement: true,
    });
    expect(webp).toHaveBeenCalledWith({ quality: 80 });
    expect(result).toEqual({ buffer: Buffer.from('webp'), width: 1000, height: 750 });
  });

  it('rejects an invalid maximum side', async () => {
    await expect(convertToWebp(Buffer.from('source'), 0)).rejects.toThrow(
      'maxSide must be a positive integer',
    );
  });
});
