# to-static-images

![to-static-images](/bg.webp)

A CLI tool that converts images to the required format, generates a file structure in JSON, and resizes them if necessary. Useful for static websites, galleries, and automation.

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
| json        | string \| null | Output JSON filename (or `null` to skip)                                   | null     |
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
