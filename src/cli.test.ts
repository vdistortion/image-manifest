import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { main } from './cli.js';

vi.mock('./index.js', () => ({
  run: vi.fn().mockResolvedValue({ status: 'ok', message: 'OK' }),
}));

vi.mock('@inquirer/prompts', () => ({
  input: vi.fn().mockResolvedValue('img-src'),
  number: vi.fn().mockResolvedValue(0),
  rawlist: vi.fn().mockResolvedValue('webp'),
  confirm: vi.fn().mockResolvedValue(false),
}));

vi.mock('cosmiconfig', () => ({
  cosmiconfig: () => ({
    search: vi.fn().mockResolvedValue(null),
  }),
}));

import { run } from './index.js';
import { SourceNotFoundError } from './errors.js';

describe('CLI', () => {
  let consoleLogSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    (run as any).mockResolvedValue({ status: 'ok', message: 'OK' });
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit:${code}`);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const setArgv = (args: string[]) => {
    process.argv = ['node', 'image-manifest', ...args];
  };

  describe('core features', () => {
    it('--version prints version', async () => {
      setArgv(['--version']);
      const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
      await expect(main()).rejects.toThrow('process.exit:0');
      const output = stdoutSpy.mock.calls.map((c) => c[0]).join('');
      expect(output).toMatch(/\d+\.\d+\.\d+/);
      stdoutSpy.mockRestore();
    });

    it('--help prints help', async () => {
      setArgv(['--help']);
      const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
      await expect(main()).rejects.toThrow('process.exit:0');
      const output = stdoutSpy.mock.calls.map((c) => c[0]).join('');
      expect(output).toContain('Usage:');
      stdoutSpy.mockRestore();
    });

    it('runs with basic options and outputs result.message', async () => {
      setArgv(['--src', 'img', '--format', 'webp']);
      await main();
      expect(run).toHaveBeenCalledWith(
        expect.objectContaining({
          src: 'img',
          format: 'webp',
          json: null,
        }),
      );
      expect(consoleLogSpy.mock.calls.map((c: any) => c[0]).join('')).toContain('OK');
    });

    it('handles --no-json flag', async () => {
      setArgv(['--no-json', '--src', 'img']);
      await main();
      expect(run).toHaveBeenCalledWith(expect.objectContaining({ json: null }));
    });

    it('calls interactive mode when no args', async () => {
      setArgv([]);
      await main();
      expect(consoleLogSpy.mock.calls.map((c: any) => c[0]).join('')).toContain('OK');
    });

    it('prints error message and exits on known error', async () => {
      setArgv(['--src', 'nonexistent']);
      (run as any).mockRejectedValueOnce(new SourceNotFoundError('nonexistent'));
      await expect(main()).rejects.toThrow('process.exit:1');
      expect(consoleErrorSpy.mock.calls.map((c: any) => c[0]).join('')).toContain(
        'Source directory "nonexistent" not found.',
      );
    });
  });

  describe('extended combinations', () => {
    it.each([
      ['--manifest-only --json mymanifest', { manifestOnly: true, json: 'mymanifest' }],
      ['--manifest-only --no-json', { manifestOnly: true, json: null }],
      ['--include-size --json manifest', { includeSize: true, json: 'manifest' }],
      ['--format original', { format: 'original' }],
      ['--width 0 --height 0', { width: 0, height: 0 }],
      ['--concurrency 1', { concurrency: 1 }],
    ])('command "%s" maps to options correctly', async (argsStr, expected) => {
      setArgv(argsStr.split(' '));
      await main();
      expect(run).toHaveBeenCalledWith(expect.objectContaining(expected));
    });

    it('--json and --no-json conflict – last one wins (Commander default)', async () => {
      setArgv(['--json', 'man', '--no-json']);
      await main();
      expect(run).toHaveBeenCalledWith(expect.objectContaining({ json: null }));
    });

    it('unknown option exits with error', async () => {
      setArgv(['--unknown-flag']);
      await expect(main()).rejects.toThrow('process.exit:1');
    });

    it('interactive mode asks questions and runs', async () => {
      const { input, number, rawlist, confirm } = await import('@inquirer/prompts');
      (confirm as any)
        .mockResolvedValueOnce(false) // manifestOnly
        .mockResolvedValueOnce(true) // isJson
        .mockResolvedValueOnce(false); // includeSize
      (rawlist as any).mockResolvedValueOnce('png');
      (number as any)
        .mockResolvedValueOnce(100) // width
        .mockResolvedValueOnce(200) // height
        .mockResolvedValueOnce(3); // concurrency
      (input as any)
        .mockResolvedValueOnce('custom-src')
        .mockResolvedValueOnce('custom-dist')
        .mockResolvedValueOnce('manifest'); // json name
      setArgv([]);
      await main();
      expect(run).toHaveBeenCalledWith(
        expect.objectContaining({
          src: 'custom-src',
          dist: 'custom-dist',
          format: 'png',
          width: 100,
          height: 200,
          concurrency: 3,
          json: 'manifest',
          includeSize: false,
          manifestOnly: false,
        }),
      );
    });

    it('--continue-on-error sets option', async () => {
      setArgv(['--continue-on-error', '--src', 'img']);
      await main();
      expect(run).toHaveBeenCalledWith(expect.objectContaining({ continueOnError: true }));
    });
  });
});
