import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { exec } from 'node:child_process';
import { dirname, relative, resolve } from 'node:path';
import { collectImages } from './modules/collect-images.js';
import { imageProcessing } from './modules/image-processing.js';
import type { FormatType } from './types.js';
import { SameDirectoryError } from './errors.js';

/** Converts a pasted file:// URL into a plain filesystem path. */
function normalizePath(value: string): string {
  const input = value.trim();
  if (!input.startsWith('file://')) return input;
  const withoutScheme = input.slice('file://'.length).replace(/^\/localhost\//, '/');
  try {
    return decodeURIComponent(withoutScheme);
  } catch {
    return withoutScheme;
  }
}

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>image-manifest</title><style>
body{font:16px system-ui,sans-serif;max-width:680px;margin:40px auto;padding:0 20px;color:#222}.brand{font-size:14px;font-weight:700;letter-spacing:.02em;color:#369eff;margin-bottom:10px}label{display:block;margin:16px 0 6px}input,select{box-sizing:border-box;width:100%;padding:10px;font:inherit}.options-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}@media(max-width:560px){.options-row{grid-template-columns:1fr}}button{margin-top:22px;padding:10px 22px;font:inherit;cursor:pointer}.bar{height:18px;background:#eee;margin-top:22px}.fill{height:100%;width:0;background:#369eff;transition:width .2s}.status{margin-top:12px;white-space:pre-wrap;color:#555}.status.error{color:#b00020;font-weight:700}.project-links{display:flex;gap:16px;margin-top:28px;padding-top:14px;border-top:1px solid #ddd;font-size:14px}.project-links a{color:#555;text-decoration:none}.project-links a:hover{color:#369eff;text-decoration:underline}:root{color-scheme:light dark}@media(prefers-color-scheme:dark){body{background:#181a1b;color:#e8e8e8}input,select{background:#242729;color:#e8e8e8;border:1px solid #555}input::placeholder{color:#aaa}button{background:#303436;color:#eee;border:1px solid #555}.bar{background:#333}.status{color:#bbb}.status.error{color:#ff8585}.project-links{border-color:#444}.project-links a{color:#bbb}}</style></head>
<body>
<div class="brand">image-manifest</div>
<h1 id="title">Image conversion to WebP</h1>
<label id="src-label" for="src">Source folder</label><input id="src" placeholder="For example: /home/user/photos or C:\\Users\\User\\Pictures">
<small id="drop-hint">You can drop a folder here. If the browser cannot provide its path, paste it manually.</small>
<label id="dist-label" for="dist">Output folder</label><input id="dist" placeholder="Generated automatically: source-folder-dist">
<div class="options-row"><div><label id="format-label" for="format">Format</label><select id="format"><option value="webp">WebP</option><option value="avif">AVIF</option><option value="jpg">JPG</option><option value="png">PNG</option><option value="original">Original</option></select></div>
<div><label id="width-label" for="width">Max width, px</label><input id="width" type="number" min="1" value="1000"></div>
<div><label id="height-label" for="height">Max height, px</label><input id="height" type="number" min="1" value="1000"></div></div>
<button id="start">Start</button> <button id="stop" type="button">Close</button><div class="bar"><div class="fill" id="fill"></div></div><div class="status" id="status">Ready to start</div>
<footer class="project-links"><a href="https://www.npmjs.com/package/image-manifest" target="_blank" rel="noopener noreferrer">npm</a><a href="https://github.com/vdistortion/image-manifest" target="_blank" rel="noopener noreferrer">GitHub</a></footer>
<script>
const $=id=>document.getElementById(id), src=$('src'), dist=$('dist'), start=$('start'), stop=$('stop'), status=$('status');
const translations={
 en:{title:'Image conversion',src:'Source folder',srcPlaceholder:'For example: /home/user/photos or C:\\\\Users\\\\User\\\\Pictures',drop:'You can drop a folder here. If the browser cannot provide its path, paste it manually.',dist:'Output folder',distPlaceholder:'Generated automatically: source-folder-dist',format:'Format',width:'Max width, px',height:'Max height, px',start:'Start',stop:'Close',ready:'Ready to start',preparing:'Preparing...',dropError:'The browser did not provide the folder path. Paste it manually.',selected:'Folder selected: ',closed:'UI closed'},
 ru:{title:'Конвертация изображений',src:'Исходная папка',srcPlaceholder:'Например: /home/user/photos или C:\\\\Users\\\\User\\\\Pictures',drop:'Можно перетащить папку сюда. Если браузер не передаст путь, вставьте его вручную.',dist:'Папка результата',distPlaceholder:'Будет создана автоматически: исходная-папка-dist',format:'Формат',width:'Макс. ширина, px',height:'Макс. высота, px',start:'Начать',stop:'Закрыть',ready:'Готово к запуску',preparing:'Подготовка...',dropError:'Браузер не передал путь к папке. Вставьте путь вручную.',selected:'Выбрана папка: ',closed:'Интерфейс закрыт'},
 uk:{title:'Конвертація зображень',src:'Вихідна папка',srcPlaceholder:'Наприклад: /home/user/photos або C:\\\\Users\\\\User\\\\Pictures',drop:'Можна перетягнути папку сюди. Якщо браузер не передасть шлях, вставте його вручну.',dist:'Папка результату',distPlaceholder:'Буде створена автоматично: вихідна-папка-dist',format:'Формат',width:'Макс. ширина, px',height:'Макс. висота, px',start:'Почати',stop:'Закрити',ready:'Готово до запуску',preparing:'Підготовка...',dropError:'Браузер не передав шлях до папки. Вставте шлях вручну.',selected:'Вибрано папку: ',closed:'Інтерфейс закрито'},
 de:{title:'Bildkonvertierung',src:'Quellordner',srcPlaceholder:'Zum Beispiel: /home/user/photos oder C:\\\\Users\\\\User\\\\Pictures',drop:'Sie können einen Ordner hierher ziehen. Wenn der Browser den Pfad nicht liefert, fügen Sie ihn manuell ein.',dist:'Ausgabeordner',distPlaceholder:'Automatisch erstellt: quellordner-dist',format:'Format',width:'Max. Breite, px',height:'Max. Höhe, px',start:'Starten',stop:'Schließen',ready:'Bereit zum Start',preparing:'Vorbereitung...',dropError:'Der Browser hat den Ordnerpfad nicht übergeben. Fügen Sie ihn manuell ein.',selected:'Ordner ausgewählt: ',closed:'Oberfläche geschlossen'}
};
let t=translations.en, distAuto=true;
function setStatus(message,error=false){status.textContent=message;status.classList.toggle('error',error)}
function applyLanguage(code){t=translations[code]||translations.en;document.documentElement.lang=code;title.textContent=t.title;$('src-label').textContent=t.src;src.placeholder=t.srcPlaceholder;dropHint.textContent=t.drop;$('dist-label').textContent=t.dist;dist.placeholder=t.distPlaceholder;$('format-label').textContent=t.format;$('width-label').textContent=t.width;$('height-label').textContent=t.height;start.textContent=t.start;stop.textContent=t.stop;if(!status.classList.contains('error'))setStatus(t.ready)}
const title=$('title'),dropHint=$('drop-hint');
const browserLanguage=(navigator.language||'en').split('-')[0].toLowerCase();
applyLanguage(translations[browserLanguage]?browserLanguage:'en');
stop.disabled=true;
function automaticDist(){const value=src.value.trim().replace(/[\\\\/]+$/,'');return value?value+'-dist':''}
function updateDist(){if(distAuto)dist.value=automaticDist()}
src.addEventListener('input',updateDist);$('format').addEventListener('change',updateDist);dist.addEventListener('input',()=>{distAuto=false});
src.addEventListener('drop',event=>{event.preventDefault();const file=event.dataTransfer.files[0];const uri=event.dataTransfer.getData('text/uri-list');const path=file&&file.path||(uri&&decodeURIComponent(uri.replace('file://','').split('\\n')[0]));if(path){src.value=path;distAuto=true;updateDist();setStatus(t.selected+path)}else setStatus(t.dropError,true)});src.addEventListener('dragover',event=>event.preventDefault());
async function refresh(){const p=await fetch('/api/progress').then(r=>r.json());$('fill').style.width=(p.total?p.processed/p.total*100:0)+'%';setStatus(p.message+(p.current?'\\n'+p.current:''),p.message.startsWith('Ошибка:')||p.message.startsWith('Error:'));if(p.running)setTimeout(refresh,300)}
start.onclick=async()=>{start.disabled=true;stop.disabled=false;setStatus(t.preparing);const body={src:src.value,dist:dist.value,format:$('format').value,width:Number($('width').value)||null,height:Number($('height').value)||null};const r=await fetch('/api/start',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});if(!r.ok){setStatus(await r.text(),true);start.disabled=false;return}refresh().finally(()=>{start.disabled=false})};
stop.onclick=async()=>{stop.disabled=true;const r=await fetch('/api/stop',{method:'POST'});if(!r.ok){setStatus(await r.text(),true);stop.disabled=false;return}setStatus(t.closed);};
updateDist();
</script></body></html>`;

type Progress = {
  running: boolean;
  processed: number;
  total: number;
  current: string;
  message: string;
};
type UiOptions = {
  src?: string;
  dist?: string;
  format?: FormatType;
  width?: number | null;
  height?: number | null;
};
const progress: Progress = {
  running: false,
  processed: 0,
  total: 0,
  current: '',
  message: 'Готово к запуску',
};

function json(res: ServerResponse, value: unknown, status = 200) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(value));
}

async function body(req: IncomingMessage): Promise<UiOptions> {
  let text = '';
  for await (const chunk of req) text += chunk;
  return JSON.parse(text) as UiOptions;
}

async function processImages(
  src: string,
  dist: string,
  format: FormatType,
  width: number | null,
  height: number | null,
) {
  const absSrc = resolve(normalizePath(src));
  const absDist = resolve(normalizePath(dist));
  if (absSrc === absDist) throw new SameDirectoryError();

  const images = await collectImages(absSrc, absSrc, absDist);
  progress.total = images.length;
  for (const image of images) {
    progress.current = image.name;
    const imageDist = resolve(absDist, dirname(relative(absSrc, image.path)));
    await imageProcessing(
      { name: image.name, path: image.path, dist: imageDist },
      width,
      height,
      format,
    );
    progress.processed++;
  }
}

export async function startUi(port = 0): Promise<number> {
  const server = createServer((req, res) => {
    void (async () => {
      try {
        if (req.method === 'GET' && req.url === '/') {
          res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
          res.end(html);
        } else if (req.method === 'GET' && req.url === '/api/progress') {
          json(res, progress);
        } else if (req.method === 'POST' && req.url === '/api/stop') {
          if (progress.running)
            return json(res, { error: 'Wait until processing is finished' }, 409);
          json(res, { stopped: true });
          setImmediate(() => server.close());
        } else if (req.method === 'POST' && req.url === '/api/start') {
          if (progress.running) return json(res, { error: 'Обработка уже запущена' }, 409);
          const options = await body(req);
          if (!options.src || !options.dist)
            return json(res, { error: 'Укажите исходную папку и папку результата' }, 400);
          progress.running = true;
          progress.processed = 0;
          progress.total = 0;
          progress.message = 'Обработка запущена';
          void processImages(
            normalizePath(options.src),
            normalizePath(options.dist),
            options.format || 'webp',
            options.width ?? 1000,
            options.height ?? 1000,
          )
            .then(() => {
              progress.message = 'Готово';
            })
            .catch((error: unknown) => {
              progress.message = `Ошибка: ${error instanceof Error ? error.message : String(error)}`;
            })
            .finally(() => {
              progress.running = false;
              progress.current = '';
            });
          json(res, { started: true }, 202);
        } else {
          res.writeHead(404);
          res.end('Not found');
        }
      } catch (error) {
        json(res, { error: error instanceof Error ? error.message : String(error) }, 400);
      }
    })();
  });
  await new Promise<void>((resolveServer) => server.listen(port, '127.0.0.1', resolveServer));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Could not start UI server');
  const url = `http://127.0.0.1:${address.port}`;
  exec(
    process.platform === 'win32'
      ? `start "" "${url}"`
      : process.platform === 'darwin'
        ? `open "${url}"`
        : `xdg-open "${url}"`,
  );
  console.log(`UI started at ${url}`);
  return address.port;
}
