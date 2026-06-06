---
sidebar: false
---

# image-manifest

![image-manifest](/logo.webp)

Инструмент командной строки, который конвертирует изображения в нужный формат, генерирует структуру файлов в формате JSON и при необходимости изменяет размеры. Полезен для статических сайтов, галерей и автоматизации.

`npx image-manifest --help` покажет все доступные опции.

## 📖 Использование

Создайте папку `img-src`

```shell
mkdir img-src
```

Поместите изображения в `img-src`

```shell
npx image-manifest@latest
```

## 💻 Параметры командной строки

| Параметр              | Описание                                                                | По умолчанию |
| --------------------- | ----------------------------------------------------------------------- | ------------ |
| `--src`, `-s`         | Имя исходной папки                                                      | img-src      |
| `--dist`, `-d`        | Имя папки с результатами                                                | img-dist     |
| `--format`, `-f`      | Выходной формат: `webp`, `jpg`, `png`, `avif` или исходный (`original`) | webp         |
| `--json`, `-j`        | Имя выходного JSON-файла (или `--no-json`, чтобы пропустить)            | null         |
| `--width`, `-W`       | Максимальная ширина изображения в пикселях                              | null         |
| `--height`, `-H`      | Максимальная высота изображения в пикселях                              | null         |
| `--concurrency`, `-c` | Максимум одновременно обрабатываемых изображений                        | 5            |
| `--include-size`      | Включить размеры изображений (ширину и высоту) в JSON                   | false        |
| `--manifest-only`     | Только генерация JSON-манифеста, без конвертации изображений            | false        |
| `--interactive`, `-i` | Принудительный интерактивный режим, даже если переданы аргументы        | false        |

## ✨ Примеры

```shell
# Конвертировать все изображения в webp (по умолчанию) и создать манифест
npx image-manifest --json static-images --format original

# Изменить размер до максимальной высоты 2000px, другая исходная папка
npx image-manifest --src sources --height 2000

# Только создать JSON-манифест из существующих изображений (без обработки)
npx image-manifest --manifest-only --json gallery --src myimages

# Запустить интерактивный режим (запрашивает все параметры)
npx image-manifest --interactive
```

## ⚙️ Файл конфигурации

Вы можете хранить настройки в файле конфигурации, чтобы не передавать их каждый раз в командной строке. Допустимые файлы (поиск в текущей директории и выше):

- `.image-manifestrc.json`
- `.image-manifestrc.yaml`
- `.image-manifestrc.yml`
- `.image-manifestrc.js`
- `image-manifest.config.js`
- свойство `"image-manifest"` в `package.json`

Пример `.image-manifestrc.json`:

```json
{
  "src": "my-images",
  "format": "webp",
  "json": "gallery",
  "width": 1200,
  "includeSize": true
}
```

При запуске `npx image-manifest` без аргументов будет автоматически использован файл конфигурации, если он существует. В противном случае запустится интерактивный режим.

## 📦 Программный API

Вы также можете использовать `image-manifest` как библиотеку в своих скриптах.

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
  // manifestOnly: true  // раскомментируйте, чтобы пропустить конвертацию
});
```

Пользователи TypeScript могут импортировать типы манифеста:

```ts
import type { ImageManifest, ImageFile } from 'image-manifest';
```
