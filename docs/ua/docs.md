---
sidebar: false
---

# image-manifest

![image-manifest](/logo.webp)

Кросплатформний інструмент Node.js, який конвертує зображення у потрібний формат, генерує структуру файлів у форматі JSON та за потреби змінює розміри. Доступний з командного рядка, через локальний Web UI або як бібліотека. Корисний для статичних сайтів, галерей та автоматизації.

Потрібен Node.js 22 або новіший. `npx image-manifest --help` покаже всі доступні опції.

## 📖 Приклад використання

Створіть папку `img-src`

```shell
mkdir img-src
```

Помістіть зображення в `img-src`

```shell
npx image-manifest@latest
```

## 💻 Параметри командного рядка

| Параметр              | Опис                                                                      | За замовчуванням |
| --------------------- | ------------------------------------------------------------------------- | ---------------- |
| `--src`, `-s`         | Назва вихідної папки (має існувати)                                       | img-src          |
| `--dist`, `-d`        | Назва папки з результатом                                                 | img-dist         |
| `--format`, `-f`      | Формат виходу: `webp`, `jpg`, `png`, `avif` або оригінальний (`original`) | webp             |
| `--json`, `-j`        | Ім’я JSON-файлу (або `--no-json`, щоб пропустити)                         | null             |
| `--width`, `-W`       | Максимальна ширина зображення в пікселях                                  | null             |
| `--height`, `-H`      | Максимальна висота зображення в пікселях                                  | null             |
| `--concurrency`, `-c` | Максимальна кількість паралельних завдань обробки зображень               | 5                |
| `--include-size`      | Додати розміри зображень (ширину та висоту) в JSON                        | false            |
| `--manifest-only`     | Лише згенерувати JSON-маніфест, без конвертації зображень                 | false            |
| `--no-progress`       | Вимкнути індикатор прогресу                                               | false            |
| `--continue-on-error` | Продовжувати обробку, навіть якщо деякі зображення помилкові              | false            |
| `--interactive`, `-i` | Примусовий інтерактивний режим, навіть якщо передано аргументи            | false            |
| `--ui`                | Відкрити локальний Web UI у браузері                                      | false            |

## ✨ Приклади

```shell
# Конвертувати всі зображення в webp (за замовчуванням) і створити маніфест
npx image-manifest --json static-images --format original

# Змінити розмір до максимальної висоти 2000px, інша вихідна папка
npx image-manifest --src sources --height 2000

# Тільки створити JSON-маніфест з наявних зображень (без обробки)
npx image-manifest --manifest-only --json gallery --src myimages

# Продовжити обробку при помилках і без індикатора прогресу
npx image-manifest --continue-on-error --no-progress --json report

# Запустити інтерактивний режим (запитує всі параметри)
npx image-manifest --interactive

# Відкрити локальний Web UI
npx image-manifest --ui
```

## 🌐 Локальний Web UI

Запустіть `npx image-manifest --ui`, щоб відкрити локальний інтерфейс у браузері. Вкажіть вихідну папку, за потреби змініть автоматично запропоновану папку результату (`<вихідна-папка>-webp`), виберіть максимальну сторону та натисніть **Почати**. Інтерфейс показує прогрес і конвертує зображення у WebP.

Сервер працює лише на `127.0.0.1` і використовує випадковий вільний порт. Браузер не завжди може передати повний шлях перетягнутої папки, тому ручне вставлення шляху залишається найнадійнішим способом.

## ⚙️ Файл конфігурації

Ви можете зберігати налаштування у файлі конфігурації, замість того щоб передавати їх у командному рядку. Допустимі файли (пошук у поточній директорії та вище):

- `.image-manifestrc.json`
- `.image-manifestrc`
- властивість `"image-manifest"` у `package.json`

Приклад `.image-manifestrc.json`:

```json
{
  "src": "my-images",
  "format": "webp",
  "json": "gallery",
  "width": 1200,
  "includeSize": true
}
```

Коли ви запускаєте `npx image-manifest` без аргументів, автоматично використовується файл конфігурації, якщо він існує. Інакше запускається інтерактивний режим.

## 📦 Програмний API

Ви також можете використовувати `image-manifest` як бібліотеку у власних скриптах.

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
  // manifestOnly: true  // розкоментуйте, щоб пропустити конвертацію
});
```

Користувачі TypeScript можуть імпортувати типи маніфесту:

```ts
import type { ImageManifest, ImageFile } from 'image-manifest';
```

Також можна імпортувати окремі утиліти:

```ts
import { imageProcessing } from 'image-manifest/image-processing';
import { convertToWebp } from 'image-manifest/to-webp';
import { isImage } from 'image-manifest/is-image';
import { collectImages } from 'image-manifest/collect-images';
```

`convertToWebp` приймає шлях до файлу або `Buffer`, повертає WebP `Buffer` і розміри зображення та за замовчуванням обмежує довшу сторону до 1000 пікселів:

```ts
const { buffer, width, height } = await convertToWebp(input, 1000);
```

Вихідна та кінцева папки мають відрізнятися. Бібліотека припиняє роботу, якщо вони однакові або одна папка знаходиться всередині іншої.

Для налагодження встановіть змінну середовища `DEBUG`:

```bash
DEBUG=image-manifest:* npx image-manifest --src photos
```
