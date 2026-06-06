# to-static-images

**Formerly known as [to-webp-json](https://www.npmjs.com/package/to-webp-json)**

[![NPM Version](https://img.shields.io/npm/v/to-static-images?style=flat&logo=npm&label=version&color=cb3837)](https://www.npmjs.com/package/to-static-images)
[![GitHub Created At](https://img.shields.io/github/created-at/vdistortion/to-static-images?style=flat&logo=github)](https://github.com/vdistortion/to-static-images)

[![to-static-images](docs/public/bg.webp)](https://to-static-images.zvalentin.ru)

A CLI tool that converts images to the desired format, generates a structured JSON map of the output files, and optionally resizes them by width and/or height. Useful for static sites, galleries, and automation.

> ⭐ **Like this tool?** Give it a star on [GitHub](https://github.com/vdistortion/to-static-images) — it helps others discover the project!

## 📖 Usage

Create an `img-src` folder

```shell
mkdir img-src
```

Place images inside `img-src`

```shell
npx to-static-images@latest
```

## 💻 Command-line options

| Option      | Type           | Description                                                                | Default  |
| ----------- | -------------- | -------------------------------------------------------------------------- | -------- |
| src         | string         | Source folder name                                                         | img-src  |
| dist        | string         | Result folder name                                                         | img-dist |
| format      | string         | Output format: `webp`, `jpg`, `png`, `avif`, or keep original (`original`) | webp     |
| json        | string \| null | Output JSON filename (or null to skip)                                     | null     |
| width       | number \| null | Maximum image width in pixels                                              | null     |
| height      | number \| null | Maximum image height in pixels                                             | null     |
| concurrency | number         | Maximum number of concurrent image processing tasks                        | 5        |
| includeSize | boolean        | Include image dimensions (width and height) in the JSON manifest           | false    |

## ✨ Examples

```shell
npx to-static-images json=static-images format=original
```

```shell
npx to-static-images src=sources height=2000
```

Run with no arguments (interactive mode)

```shell
npx to-static-images
```

## 🌍 Translations

The documentation is available in several languages, but it can always be improved.
If you notice mistakes or want to add a new language, contributions are very welcome!
