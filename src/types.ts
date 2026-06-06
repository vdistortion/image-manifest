export type MaxSizeType = number | null;

export type FormatType = 'original' | 'webp' | 'jpg' | 'png' | 'avif';

export type OptionsType = {
  src: string;
  dist: string;
  width: MaxSizeType;
  height: MaxSizeType;
  format: FormatType;
  json: string | null;
  concurrency: number;
  includeSize: boolean;
  manifestOnly?: boolean;
};

export type ImageType = {
  name: string;
  path: string;
  dist: string;
};
