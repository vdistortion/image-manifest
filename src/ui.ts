import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { exec } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { collectImages } from './modules/collect-images.js';
import { convertToWebp, DEFAULT_MAX_IMAGE_SIDE } from './modules/to-webp.js';

const html = `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>image-manifest</title><style>
body{font:16px system-ui,sans-serif;max-width:680px;margin:40px auto;padding:0 20px;color:#222}label{display:block;margin:16px 0 6px}input{box-sizing:border-box;width:100%;padding:10px;font:inherit}button{margin-top:22px;padding:10px 22px;font:inherit;cursor:pointer}.bar{height:18px;background:#eee;margin-top:22px}.fill{height:100%;width:0;background:#369eff;transition:width .2s}.status{margin-top:12px;white-space:pre-wrap;color:#555}</style></head>
<body><h1>Конвертация изображений</h1>
<label>Исходная папка</label><input id="src" placeholder="/path/to/images">
<label>Папка результата</label><input id="dist" placeholder="/path/to/images-webp">
<label>Максимальная сторона, px</label><input id="max" type="number" min="1" value="1000">
<button id="start">Начать</button><div class="bar"><div class="fill" id="fill"></div></div><div class="status" id="status">Готово к запуску</div>
<script>
const $=id=>document.getElementById(id), start=$('start');
async function refresh(){const p=await fetch('/api/progress').then(r=>r.json());$('fill').style.width=(p.total?p.processed/p.total*100:0)+'%';$('status').textContent=p.message+(p.current?'\\n'+p.current:'');if(p.running)setTimeout(refresh,300)}
start.onclick=async()=>{start.disabled=true;$('status').textContent='Подготовка...';const body={src:$('src').value,dist:$('dist').value,maxSide:Number($('max').value)||1000};const r=await fetch('/api/start',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});if(!r.ok){$('status').textContent=await r.text();start.disabled=false;return}refresh().finally(()=>{start.disabled=false})};
</script></body></html>`;

type Progress = {
  running: boolean;
  processed: number;
  total: number;
  current: string;
  message: string;
};
type UiOptions = { src?: string; dist?: string; maxSide?: number };
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

async function processImages(src: string, dist: string, maxSide: number) {
  const images = await collectImages(src, src, dist);
  progress.total = images.length;
  for (const image of images) {
    progress.current = image.name;
    const converted = await convertToWebp(image.path, maxSide);
    const output = resolve(dist, relative(src, image.path)).replace(/\.[^./\\]+$/, '.webp');
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, converted.buffer);
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
            resolve(options.src),
            resolve(options.dist),
            options.maxSide || DEFAULT_MAX_IMAGE_SIDE,
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
