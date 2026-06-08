export interface ImageFile {
  name: string;
  type: 'file';
  width?: number;
  height?: number;
}

export interface ImageFolder {
  name: string;
  type: 'folder';
  children: ImageItem[];
}

export type ImageItem = ImageFile | ImageFolder;

export type ImageManifest = ImageFolder | ImageItem[];

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
  progress?: boolean;
  continueOnError?: boolean;
};

export type CliOptions = {
  src?: string;
  dist?: string;
  format?: FormatType;
  width?: number;
  height?: number;
  json?: string | false;
  concurrency?: number;
  includeSize?: boolean;
  manifestOnly?: boolean;
  progress?: boolean;
  continueOnError?: boolean;
};

export type ImageType = {
  name: string;
  path: string;
  dist: string;
};
