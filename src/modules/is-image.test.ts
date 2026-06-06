import { describe, it, expect } from 'vitest';
import { isImage } from './is-image.js';

describe('isImage', () => {
  it.each([
    ['photo.jpg', true],
    ['photo.jpeg', true],
    ['photo.png', true],
    ['photo.webp', true],
    ['photo.avif', true],
    ['photo.tiff', true],
    ['photo.tif', true],
    ['photo.svg', true],
    ['photo.gif', true],
    ['photo.txt', false],
    ['photo', false],
    ['.gitkeep', false],
  ])('%s -> %s', (filename, expected) => {
    expect(isImage(filename)).toBe(expected);
  });
});
