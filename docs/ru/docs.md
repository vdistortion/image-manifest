---
sidebar: false
---

# image-manifest

![image-manifest](/logo.webp)

Кроссплатформенный инструмент Node.js, который конвертирует изображения в нужный формат, генерирует структуру файлов в формате JSON и при необходимости изменяет размеры. Доступен из командной строки, через локальный Web UI или как библиотека. Полезен для статических сайтов, галерей и автоматизации.

Требуется Node.js 22 или новее. `npx image-manifest --help` покажет все доступные опции.

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
| `--src`, `-s`         | Имя исходной папки (должна существовать)                                | img-src      |
| `--dist`, `-d`        | Имя папки с результатами                                                | img-dist     |
| `--format`, `-f`      | Выходной формат: `webp`, `jpg`, `png`, `avif` или исходный (`original`) | webp         |
| `--json`, `-j`        | Имя выходного JSON-файла (или `--no-json`, чтобы пропустить)            | null         |
| `--width`, `-W`       | Максимальная ширина изображения в пикселях                              | null         |
| `--height`, `-H`      | Максимальная высота изображения в пикселях                              | null         |
| `--concurrency`, `-c` | Максимум одновременно обрабатываемых изображений                        | 5            |
| `--include-size`      | Включить размеры изображений (ширину и высоту) в JSON                   | false        |
| `--manifest-only`     | Только генерация JSON-манифеста, без конвертации изображений            | false        |
| `--no-progress`       | Отключить индикатор выполнения                                          | false        |
| `--continue-on-error` | Продолжать обработку, даже если некоторые изображения выдают ошибку     | false        |
| `--interactive`, `-i` | Принудительный интерактивный режим, даже если переданы аргументы        | false        |
| `--ui`                | Открыть локальный Web UI в браузере                                     | false        |

## ✨ Примеры

```shell
# Конвертировать все изображения в webp (по умолчанию) и создать манифест
npx image-manifest --json static-images --format original

# Изменить размер до максимальной высоты 2000px, другая исходная папка
npx image-manifest --src sources --height 2000

# Только создать JSON-манифест из существующих изображений (без обработки)
npx image-manifest --manifest-only --json gallery --src myimages

# Продолжить обработку при ошибках и отключить прогресс-бар
npx image-manifest --continue-on-error --no-progress --json report

# Запустить интерактивный режим (запрашивает все параметры)
npx image-manifest --interactive

# Открыть локальный Web UI
npx image-manifest --ui
```

## 🌐 Локальный Web UI

Запустите `npx image-manifest --ui`, чтобы открыть локальный интерфейс в браузере. Укажите исходную папку, при необходимости измените автоматически предложенную папку результата (`<исходная-папка>-webp`), выберите максимальную сторону и нажмите **Начать**. Интерфейс показывает прогресс и конвертирует изображения в WebP.

Сервер работает только на `127.0.0.1` и использует случайный свободный порт. Браузер не всегда может передать полный путь перетащенной папки, поэтому ручная вставка пути остаётся самым надёжным способом.

## ⚙️ Файл конфигурации

Вы можете хранить настройки в файле конфигурации, чтобы не передавать их каждый раз в командной строке. Допустимые файлы (поиск в текущей директории и выше):

- `.image-manifestrc.json`
- `.image-manifestrc`
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
  continueOnError: true,
  // manifestOnly: true  // раскомментируйте, чтобы пропустить конвертацию
});
```

Пользователи TypeScript могут импортировать типы манифеста:

```ts
import type { ImageManifest, ImageFile } from 'image-manifest';
```

Также можно импортировать отдельные утилиты:

```ts
import { imageProcessing } from 'image-manifest/image-processing';
import { convertToWebp } from 'image-manifest/to-webp';
import { isImage } from 'image-manifest/is-image';
import { collectImages } from 'image-manifest/collect-images';
```

`convertToWebp` принимает путь к файлу или `Buffer`, возвращает WebP `Buffer` и размеры изображения и по умолчанию ограничивает длинную сторону 1000 пикселями:

```ts
const { buffer, width, height } = await convertToWebp(input, 1000);
```

Исходная и выходная папки должны различаться. Библиотека прекращает работу, если они совпадают или одна папка находится внутри другой.

Для отладки установите переменную окружения `DEBUG`:

```bash
DEBUG=image-manifest:* npx image-manifest --src photos
```
