# Changelog

All notable changes to this project will be documented in this file.

The format is inspired by [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [2.0.0] - 2026-06-07

### Changed

- **Package renamed** from `to-static-images` to `image-manifest`.
  Previous packages `to-webp-json` and `to-static-images` are deprecated and redirect here.
- CLI completely rewritten using Commander. Old `key=value` syntax removed; use standard options like `--src`, `--format`, etc.
- Interactive mode: now triggered automatically only when no arguments and no config file found, or with `--interactive`.
- Configuration file support via cosmiconfig (`.image-manifestrc.json`, `image-manifest.config.js`, `package.json` property).
- Progress bar fixed: single progress bar now correctly tracks total image count across directories.
- Strict TypeScript enabled (`strict: true`); removed `noImplicitAny: false`.
- License changed from GPL-3.0 to Apache-2.0.
- Types moved to `src/types.ts` and exported; manifest types `ImageFile`, `ImageFolder`, `ImageManifest` added.

### Added

- Programmatic API: `import { run } from 'image-manifest'` to use as a library.
- `--manifest-only` option to generate JSON manifest without converting images.
- Unit tests with Vitest.
- GitHub Actions CI for tests on Node.js 22, 24 and 26.
- Automated deployment of documentation to GitHub Pages using native Actions.

### Fixed

- Multiple progress bars cluttering output.
- Potential `undefined` values in interactive mode for width/height/concurrency.
- Various path resolution issues.

### Removed

- Support for old `key=value` argument syntax.
- `to-webp-json` and `to-static-images` names (deprecated).

## [1.1.1] - 2026-02-21

### Fixed

- Fixed "Input file is missing" errors by improving path normalization using `path.resolve` and `path.join` across all modules.
- Improved nested directory handling in the JSON manifest generator by properly tracking recursive paths.
- Replaced unreliable string replacement logic in the scanner with robust relative path resolution to prevent incorrect output paths.
- Ensured the application correctly waits for JSON generation to complete before finishing the process.

## [1.1.0] - 2026-02-19

### Added

- Added optional `includeSize` parameter to include image width and height in the JSON manifest.
- Support for `includeSize` in both interactive mode and CLI arguments.

### Fixed

- Fixed an issue where selecting `avif` format resulted in an empty JSON file due to missing extension support in the image filter.

## [1.0.1] - 2025-12-29

### Changed

- Improved package metadata.

## [1.0.0] - 2025-12-29

### Changed

- Package renamed from `to-webp-json` to `to-static-images`.
- No functional changes compared to `to-webp-json@1.0.1`.

## [1.0.1] - 2025-12-19

### Fixed

- Prevented recursive processing of the output directory when it is located inside the source directory.

## [1.0.0] - 2025-10-31

### Fixed

- Incorrect file name parsing.
- Error in calculating new image dimensions.

## [0.5.0] - 2025-09-18

### Added

- Progress bar for image processing.
- `concurrency` option to control how many images are processed in parallel.
- New languages in the documentation.

## [0.4.0] - 2025-09-15

### Removed

- Support for `tiff` and `gif` formats (yeah, they barely lived since 2024-08-25).

## [0.3.4] - 2025-05-28

### Fixed

- Grammar issues in the documentation.

## [0.3.3] - 2024-11-04

### Added

- Project documentation using Vitepress.

## [0.3.2] - 2024-10-22

### Changed

- Interactive mode switched from `inquirer` to `@inquirer/prompts`.
- Type definitions for `directory-structure-json` moved to the `@types` package.

## [0.3.1] - 2024-09-14

### Added

- Type definitions for the helper package `directory-structure-json`.

## [0.3.0] - 2024-08-25

### Added

- Output support for `avif`, `tiff`, and `gif` formats.
- Option to keep the original image format.

## [0.2.0] - 2024-06-17

### Added

- Interactive mode when launched without arguments.
- Output support for `jpg` and `png` formats.

## [0.1.0] - 2024-05-30

### Added

- Initial release.
- CLI for converting images to `webp`.
- Optional max width and/or height settings.
- Generation of `.json` file with directory structure.
