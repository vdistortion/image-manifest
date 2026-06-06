---
sidebar: false
---

# image-manifest

![image-manifest](/logo.webp)

Ein CLI-Tool, das Bilder in das gewünschte Format konvertiert, eine Dateistruktur im JSON-Format generiert und bei Bedarf die Größe ändert. Nützlich für statische Websites, Galerien und Automatisierung.

`npx image-manifest --help` zeigt alle verfügbaren Optionen.

## 📖 Anwendungsbeispiel

Erstellen Sie einen Ordner `img-src`

```shell
mkdir img-src
```

Legen Sie Bilder in den Ordner `img-src`

```shell
npx image-manifest@latest
```

## 💻 Befehlszeilenoptionen

| Option                | Beschreibung                                                           | Standard |
| --------------------- | ---------------------------------------------------------------------- | -------- |
| `--src`, `-s`         | Name des Quellordners                                                  | img-src  |
| `--dist`, `-d`        | Name des Ergebnisordners                                               | img-dist |
| `--format`, `-f`      | Ausgabeformat: `webp`, `jpg`, `png`, `avif` oder original (`original`) | webp     |
| `--json`, `-j`        | Name der JSON-Datei (oder `--no-json` zum Überspringen)                | null     |
| `--width`, `-W`       | Maximale Bildbreite in Pixeln                                          | null     |
| `--height`, `-H`      | Maximale Bildhöhe in Pixeln                                            | null     |
| `--concurrency`, `-c` | Maximale Anzahl gleichzeitiger Bildverarbeitungsaufgaben               | 5        |
| `--include-size`      | Bildabmessungen (Breite und Höhe) in das JSON aufnehmen                | false    |
| `--manifest-only`     | Nur JSON-Manifest generieren, Bildkonvertierung überspringen           | false    |
| `--interactive`, `-i` | Interaktiven Modus erzwingen, auch wenn Argumente vorhanden sind       | false    |

## ✨ Beispiele

```shell
# Alle Bilder in webp konvertieren (Standard) und Manifest generieren
npx image-manifest --json static-images --format original

# Bilder auf maximale Höhe 2000px verkleinern, anderer Quellordner
npx image-manifest --src sources --height 2000

# Nur ein JSON-Manifest aus vorhandenen Bildern erstellen (keine Verarbeitung)
npx image-manifest --manifest-only --json galerie --src meine-bilder

# Interaktiver Modus (fragt jede Option ab)
npx image-manifest --interactive
```

## ⚙️ Konfigurationsdatei

Sie können Ihre Optionen in einer Konfigurationsdatei speichern, anstatt sie jedes Mal als CLI-Argumente anzugeben. Mögliche Dateien (werden im aktuellen Verzeichnis und darüber gesucht):

- `.image-manifestrc.json`
- `.image-manifestrc.yaml`
- `.image-manifestrc.yml`
- `.image-manifestrc.js`
- `image-manifest.config.js`
- eine `"image-manifest"` Eigenschaft in `package.json`

Beispiel `.image-manifestrc.json`:

```json
{
  "src": "my-images",
  "format": "webp",
  "json": "gallery",
  "width": 1200,
  "includeSize": true
}
```

Wenn Sie `npx image-manifest` ohne Argumente ausführen, wird die Konfigurationsdatei automatisch verwendet, falls vorhanden. Andernfalls startet der interaktive Modus.

## 📦 Programmierschnittstelle (API)

Sie können `image-manifest` auch als Bibliothek in Ihren eigenen Skripten verwenden.

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
  // manifestOnly: true  // Kommentar entfernen, um Konvertierung zu überspringen
});
```

TypeScript-Benutzer können die Manifest-Typen importieren:

```ts
import type { ImageManifest, ImageFile } from 'image-manifest';
```
