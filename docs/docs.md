---
sidebar: false
---

# image-manifest

![image-manifest](/logo.webp)

A CLI tool that converts images to the required format, generates a file structure in JSON, and resizes them if necessary. Useful for static websites, galleries, and automation.

Run `npx image-manifest --help` to see all available options.

## 📖 Usage

Create an `img-src` folder

```shell
mkdir img-src
```

Place images inside `img-src`

```shell
npx image-manifest@latest
```

## 💻 Command-line options

| Option                | Description                                                                | Default  |
| --------------------- | -------------------------------------------------------------------------- | -------- |
| `--src`, `-s`         | Source folder name                                                         | img-src  |
| `--dist`, `-d`        | Result folder name                                                         | img-dist |
| `--format`, `-f`      | Output format: `webp`, `jpg`, `png`, `avif`, or keep original (`original`) | webp     |
| `--json`, `-j`        | Output JSON filename (or `--no-json` to skip)                              | null     |
| `--width`, `-W`       | Maximum image width in pixels                                              | null     |
| `--height`, `-H`      | Maximum image height in pixels                                             | null     |
| `--concurrency`, `-c` | Maximum number of concurrent image processing tasks                        | 5        |
| `--include-size`      | Include image dimensions (width and height) in the JSON manifest           | false    |
| `--manifest-only`     | Only generate JSON manifest, skip image conversion                         | false    |
| `--no-progress`       | Disable the progress bar                                                   | false    |
| `--continue-on-error` | Continue processing even if some images fail                               | false    |
| `--interactive`, `-i` | Force interactive mode even if arguments are provided                      | false    |

## ✨ Examples

```shell
# Convert all images to webp (default) and generate manifest
npx image-manifest --json static-images --format original

# Resize images to max height 2000px, use custom source folder
npx image-manifest --src sources --height 2000

# Only create a JSON manifest from existing images (no processing)
npx image-manifest --manifest-only --json gallery --src myimages

# Continue processing even if some images fail, and skip progress bar
npx image-manifest --continue-on-error --no-progress --json report

# Run interactive mode (asks for every option)
npx image-manifest --interactive
```

## ⚙️ Configuration file

You can store your options in a configuration file instead of passing CLI arguments every time. Create any of these files (searched in the current directory and up):

- `.image-manifestrc.json`
- `.image-manifestrc`
- a `"image-manifest"` property in `package.json`

Example `.image-manifestrc.json`:

```json
{
  "src": "my-images",
  "format": "webp",
  "json": "gallery",
  "width": 1200,
  "includeSize": true
}
```

When you run `npx image-manifest` without any arguments, it will automatically pick up the configuration file if one exists. Otherwise it starts interactive mode.

## 📦 Programmatic API

You can also use `image-manifest` as a library in your own scripts.

```ts
import { run } from 'image-manifest';

await run({
  src: 'photos',
  dist: 'output',
  format: 'webp',
  json: 'manifest',
  width: 800,
  height: null,
  concurrency: 4,
  includeSize: true,
  continueOnError: true,
  // manifestOnly: true  // uncomment to skip conversion
});
```

TypeScript users can import the manifest types:

```ts
import type { ImageManifest, ImageFile } from 'image-manifest';
```

You can also import individual utilities for finer control:

```ts
import { imageProcessing } from 'image-manifest/image-processing';
import { isImage } from 'image-manifest/is-image';
import { collectImages } from 'image-manifest/collect-images';
```

To enable debug output, set the `DEBUG` environment variable:

```bash
DEBUG=image-manifest:* npx image-manifest --src photos
```
