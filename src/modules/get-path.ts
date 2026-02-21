import { join } from 'node:path';

export const getPath = (...args: string[]) => join(...args);
