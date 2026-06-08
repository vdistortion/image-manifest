import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scanner } from './scanner.js';

const { mockBar, debugMock } = vi.hoisted(() => ({
  mockBar: {
    start: vi.fn(),
    update: vi.fn(),
    stop: vi.fn(),
  },
  debugMock: vi.fn(),
}));

vi.mock('debug', () => {
  const debug = vi.fn(() => debugMock);
  return { default: debug };
});

vi.mock('./collect-images.js', () => ({
  collectImages: vi.fn(),
}));

vi.mock('./image-processing.js', () => ({
  imageProcessing: vi.fn(),
}));

vi.mock('p-limit', () => ({
  default: (_concurrency: number) => (fn: () => Promise<void>) => fn(),
}));

vi.mock('cli-progress', () => {
  const MockSingleBar = function (this: any) {
    return mockBar;
  } as any;
  return {
    SingleBar: MockSingleBar,
    Presets: { rect: {} },
  };
});

import { collectImages } from './collect-images.js';
import { imageProcessing } from './image-processing.js';

describe('scanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 0 and logs when no images found', async () => {
    (collectImages as any).mockResolvedValue([]);

    const result = await scanner('/src', '/dist', null, null, 'webp', 5);
    expect(result).toBe(0);
    expect(debugMock).toHaveBeenCalledWith('No images found.');
  });

  it('processes all images and returns count', async () => {
    const images = [
      { name: 'a.png', path: '/src/a.png', dist: '/dist' },
      { name: 'b.jpg', path: '/src/b.jpg', dist: '/dist/nested' },
    ];
    (collectImages as any).mockResolvedValue(images);
    (imageProcessing as any).mockResolvedValue(undefined);

    const result = await scanner('/src', '/dist', 800, 600, 'webp', 2);
    expect(result).toBe(2);
    expect(imageProcessing).toHaveBeenCalledTimes(2);
    expect(imageProcessing).toHaveBeenCalledWith(images[0], 800, 600, 'webp');
    expect(imageProcessing).toHaveBeenCalledWith(images[1], 800, 600, 'webp');
  });

  it('creates progress bar and stops even if processing fails', async () => {
    const images = [{ name: 'a.png', path: '/src/a.png', dist: '/dist' }];
    (collectImages as any).mockResolvedValue(images);
    (imageProcessing as any).mockRejectedValueOnce(new Error('fail'));

    await expect(scanner('/src', '/dist', null, null, 'webp', 1)).rejects.toThrow('fail');

    expect(mockBar.start).toHaveBeenCalledWith(1, 0);
    expect(mockBar.stop).toHaveBeenCalled();
  });
});
