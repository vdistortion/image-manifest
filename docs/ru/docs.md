# to-static-images

![to-static-images](/bg.webp)

Инструмент командной строки, который конвертирует изображения в нужный формат, генерирует структуру файлов в формате JSON и при необходимости изменяет размеры. Полезен для статических сайтов, галерей и автоматизации.

## 📖 Использование

Создайте папку `img-src`

```shell
mkdir img-src
```

Поместите изображения в `img-src`

```shell
npx to-static-images@latest
```

## 💻 Параметры командной строки

| Параметр    | Тип            | Описание                                                                | По умолчанию |
| ----------- | -------------- | ----------------------------------------------------------------------- | ------------ |
| src         | string         | Имя исходной папки                                                      | img-src      |
| dist        | string         | Имя папки с результатами                                                | img-dist     |
| format      | string         | Выходной формат: `webp`, `jpg`, `png`, `avif` или исходный (`original`) | webp         |
| json        | string \| null | Имя выходного JSON-файла (или `null`, чтобы пропустить)                 | null         |
| width       | number \| null | Максимальная ширина изображения в пикселях                              | null         |
| height      | number \| null | Максимальная высота изображения в пикселях                              | null         |
| concurrency | number         | Максимум одновременно обрабатываемых изображений                        | 5            |
| includeSize | boolean        | Включить размеры изображений (ширину и высоту) в JSON                   | false        |

## ✨ Примеры

```shell
npx to-static-images json=static-images format=original
```

```shell
npx to-static-images src=sources height=2000
```

Запуск без аргументов (интерактивный режим)

```shell
npx to-static-images
```
