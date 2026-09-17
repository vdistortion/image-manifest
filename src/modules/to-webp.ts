import sharp from 'sharp';

export const DEFAULT_MAX_IMAGE_SIDE = 1000;

export type WebpConversionResult = {
  buffer: Buffer;
  width: number | null;
  height: number | null;
};

/**
 * Converts an image to WebP and limits its longest side.
 *
 * The input is never modified: callers decide whether and when the source
 * file should be removed after the returned buffer has been stored safely.
 */
export async function convertToWebp(
  input: string | Buffer,
  maxSide = DEFAULT_MAX_IMAGE_SIDE,
): Promise<WebpConversionResult> {
  if (!Number.isInteger(maxSide) || maxSide <= 0) {
    throw new Error('maxSide must be a positive integer');
  }

  const { data, info } = await sharp(input, {
    animated: true,
    limitInputPixels: false,
  })
    .resize(maxSide, maxSide, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: data,
    width: info.width ?? null,
    height: info.height ?? null,
  };
}
