export class SourceNotFoundError extends Error {
  constructor(dir: string) {
    super(`Source directory "${dir}" not found.`);
    this.name = 'SourceNotFoundError';
  }
}

export class DistInsideSourceError extends Error {
  constructor() {
    super('Output directory is inside source directory. Aborting to prevent data loss.');
    this.name = 'DistInsideSourceError';
  }
}

export class SourceInsideDistError extends Error {
  constructor() {
    super('Source directory is inside output directory. Aborting to prevent recursion.');
    this.name = 'SourceInsideDistError';
  }
}
