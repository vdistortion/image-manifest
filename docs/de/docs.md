---
sidebar: false
---

# image-manifest

![image-manifest](/logo.webp)

Ein plattformübergreifendes Node.js-Tool, das Bilder in das gewünschte Format konvertiert, eine Dateistruktur im JSON-Format generiert und bei Bedarf die Größe ändert. Es kann über die Kommandozeile, eine lokale Web-Oberfläche oder als Bibliothek verwendet werden. Nützlich für statische Websites, Galerien und Automatisierung.

Node.js 22 oder neuer ist erforderlich. `npx image-manifest --help` zeigt alle verfügbaren Optionen.

## 📖 Anwendungsbeispiel

Erstellen Sie einen Ordner `img-src`

```shell
mkdir img-src
```

Legen Sie Bilder in den Ordner `img-src`

```shell
# Interaktive CLI (fragt immer nach Optionen)
npx image-manifest@latest -i

# Browser-Oberfläche
npx image-manifest@latest --ui
```

Ohne Argumente verwendet `npx image-manifest@latest` eine gefundene Konfigurationsdatei, falls vorhanden; andernfalls startet der interaktive Modus.

## 💻 Befehlszeilenoptionen

| Option                | Beschreibung                                                           | Standard |
| --------------------- | ---------------------------------------------------------------------- | -------- |
| `--src`, `-s`         | Name des Quellordners (muss existieren)                                | img-src  |
| `--dist`, `-d`        | Name des Ergebnisordners                                               | img-dist |
| `--format`, `-f`      | Ausgabeformat: `webp`, `jpg`, `png`, `avif` oder original (`original`) | webp     |
| `--json`, `-j`        | Name der JSON-Datei (oder `--no-json` zum Überspringen)                | null     |
| `--width`, `-W`       | Maximale Bildbreite in Pixeln                                          | null     |
| `--height`, `-H`      | Maximale Bildhöhe in Pixeln                                            | null     |
| `--concurrency`, `-c` | Maximale Anzahl gleichzeitiger Bildverarbeitungsaufgaben               | 5        |
| `--include-size`      | Bildabmessungen (Breite und Höhe) in das JSON aufnehmen                | false    |
| `--manifest-only`     | Nur JSON-Manifest generieren, Bildkonvertierung überspringen           | false    |
| `--no-progress`       | Fortschrittsbalken deaktivieren                                        | false    |
| `--continue-on-error` | Verarbeitung fortsetzen, auch wenn einzelne Bilder fehlschlagen        | false    |
| `--interactive`, `-i` | Interaktiven Modus erzwingen, auch wenn Argumente vorhanden sind       | false    |
| `--ui`                | Lokale Web-Oberfläche im Browser öffnen                                | false    |

## ✨ Beispiele

```shell
# Alle Bilder in webp konvertieren (Standard) und Manifest generieren
npx image-manifest --json static-images --format original

# Bilder auf maximale Höhe 2000px verkleinern, anderer Quellordner
npx image-manifest --src sources --height 2000

# Nur ein JSON-Manifest aus vorhandenen Bildern erstellen (keine Verarbeitung)
npx image-manifest --manifest-only --json galerie --src meine-bilder

# Fortsetzen, auch wenn einige Bilder fehlschlagen, ohne Fortschrittsbalken
npx image-manifest --continue-on-error --no-progress --json bericht

# Interaktiver Modus (fragt jede Option ab)
npx image-manifest --interactive

# Lokale Web-Oberfläche öffnen
npx image-manifest --ui
```

## 🌐 Lokale Web-Oberfläche

Führen Sie `npx image-manifest --ui` aus, um die lokale Oberfläche im Browser zu öffnen. Geben Sie den Quellordner ein; als Ausgabeordner wird `<quellordner>-dist` vorgeschlagen, der geändert werden kann. Wählen Sie WebP, AVIF, JPG, PNG oder **Original** und legen Sie unabhängige maximale Breiten- und Höhenwerte in Pixeln fest. Beide Werte sind standardmäßig 1000 px. Das Seitenverhältnis bleibt erhalten; verkleinert wird nur, wenn ein Grenzwert überschritten wird. Klicken Sie auf **Starten**. Während der Verarbeitung wird dieselbe Schaltfläche zu **Verarbeitung stoppen**: Das aktuelle Bild wird fertiggestellt, die übrigen werden übersprungen. **Schließen** ist während der Verarbeitung deaktiviert.

Der Server ist an `127.0.0.1` gebunden und verwendet einen zufällig ausgewählten Port. Die Oberfläche übernimmt die Browsersprache, wenn Englisch, Russisch, Ukrainisch oder Deutsch verfügbar ist, andernfalls Englisch. Das helle oder dunkle Design folgt der Browser-/Systemeinstellung. Starten Sie nach dem Schließen erneut `npx image-manifest --ui`, um die Oberfläche wieder zu öffnen. Ein Browser kann den vollständigen Pfad eines gezogenen Ordners nicht immer übergeben; das manuelle Einfügen des Pfads bleibt daher am zuverlässigsten.

## ⚙️ Konfigurationsdatei

Sie können Ihre Optionen in einer Konfigurationsdatei speichern, anstatt sie jedes Mal als CLI-Argumente anzugeben. Mögliche Dateien (werden im aktuellen Verzeichnis und darüber gesucht):

- `.image-manifestrc.json`
- `.image-manifestrc`
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
  continueOnError: true,
  // manifestOnly: true  // Kommentar entfernen, um Konvertierung zu überspringen
});
```

TypeScript-Benutzer können die Manifest-Typen importieren:

```ts
import type { ImageManifest, ImageFile } from 'image-manifest';
```

Einzelne Hilfsfunktionen lassen sich ebenfalls importieren:

```ts
import { imageProcessing } from 'image-manifest/image-processing';
import { convertToWebp } from 'image-manifest/to-webp';
import { isImage } from 'image-manifest/is-image';
import { collectImages } from 'image-manifest/collect-images';
```

`convertToWebp` akzeptiert einen Dateipfad oder `Buffer`, gibt einen WebP-`Buffer` und Bildabmessungen zurück und begrenzt die längste Seite standardmäßig auf 1000 Pixel:

```ts
const { buffer, width, height } = await convertToWebp(input, 1000);
```

Quell- und Ausgabeordner müssen verschieden sein. Die Bibliothek bricht ab, wenn sie identisch sind oder einer innerhalb des anderen liegt.

Debug-Ausgaben aktivieren Sie mit der Umgebungsvariablen `DEBUG`:

```bash
DEBUG=image-manifest:* npx image-manifest --src photos
```
