# image-manifest

![image-manifest](/logo.webp)

Ein CLI-Tool, das Bilder in das gewünschte Format konvertiert, eine Dateistruktur im JSON-Format generiert und bei Bedarf die Größe ändert. Nützlich für statische Websites, Galerien und Automatisierung.

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

| Option      | Typ            | Beschreibung                                                           | Standard |
| ----------- | -------------- | ---------------------------------------------------------------------- | -------- |
| src         | string         | Name des Quellordners                                                  | img-src  |
| dist        | string         | Name des Ergebnisordners                                               | img-dist |
| format      | string         | Ausgabeformat: `webp`, `jpg`, `png`, `avif` oder original (`original`) | webp     |
| json        | string \| null | Name der JSON-Datei (oder `null` zum Überspringen)                     | null     |
| width       | number \| null | Maximale Bildbreite in Pixeln                                          | null     |
| height      | number \| null | Maximale Bildhöhe in Pixeln                                            | null     |
| concurrency | number         | Maximale Anzahl gleichzeitiger Bildverarbeitungsaufgaben               | 5        |
| includeSize | boolean        | Bildabmessungen (Breite und Höhe) in das JSON aufnehmen                | false    |

## ✨ Beispiele

```shell
npx image-manifest json=static-images format=original
```

```shell
npx image-manifest src=sources height=2000
```

Start ohne Argumente (interaktiver Modus)

```shell
npx image-manifest
```
