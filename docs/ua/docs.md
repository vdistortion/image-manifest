# image-manifest

![image-manifest](/logo.webp)

CLI-інструмент, який конвертує зображення у потрібний формат, генерує структуру файлів у форматі JSON та за потреби змінює розміри. Корисний для статичних сайтів, галерей та автоматизації.

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

| Параметр    | Тип            | Опис                                                                      | За замовчуванням |
| ----------- | -------------- | ------------------------------------------------------------------------- | ---------------- |
| src         | string         | Назва вихідної папки                                                      | img-src          |
| dist        | string         | Назва папки з результатом                                                 | img-dist         |
| format      | string         | Формат виходу: `webp`, `jpg`, `png`, `avif` або оригінальний (`original`) | webp             |
| json        | string \| null | Ім’я JSON-файлу (або `null`, щоб пропустити)                              | null             |
| width       | number \| null | Максимальна ширина зображення в пікселях                                  | null             |
| height      | number \| null | Максимальна висота зображення в пікселях                                  | null             |
| concurrency | number         | Максимальна кількість паралельних завдань обробки зображень               | 5                |
| includeSize | boolean        | Додати розміри зображень (ширину та висоту) в JSON                        | false            |

## ✨ Приклади

```shell
npx image-manifest json=static-images format=original
```

```shell
npx image-manifest src=sources height=2000
```

Запустіть без аргументів (інтерактивний режим)

```shell
npx image-manifest
```
