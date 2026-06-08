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
  let exitSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    (run as any).mockResolvedValue({ status: 'ok', message: 'OK' });
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit:${code}`);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const setArgv = (args: string[]) => {
    process.argv = ['node', 'image-manifest', ...args];
  };

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
    const output = consoleLogSpy.mock.calls.map((c: any) => c[0]).join('');
    expect(output).toContain('OK');
  });

  it('handles --no-json flag', async () => {
    setArgv(['--no-json', '--src', 'img']);
    await main();
    expect(run).toHaveBeenCalledWith(expect.objectContaining({ json: null }));
  });

  it('calls interactive mode when no args', async () => {
    setArgv([]);
    await main();
    const output = consoleLogSpy.mock.calls.map((c: any) => c[0]).join('');
    expect(output).toContain('OK');
  });

  it('prints error message and exits on known error', async () => {
    setArgv(['--src', 'nonexistent']);
    (run as any).mockRejectedValueOnce(new SourceNotFoundError('nonexistent'));
    await expect(main()).rejects.toThrow('process.exit:1');
    const errOutput = consoleErrorSpy.mock.calls.map((c: any) => c[0]).join('');
    expect(errOutput).toContain('Source directory "nonexistent" not found.');
  });
});
