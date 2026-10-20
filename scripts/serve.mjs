import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve("out"),
  port = Number(process.env.PORT ?? 3000);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};
const server = http.createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    let file = resolve(root, `.${path}`);
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(403).end();
      return;
    }
    if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
    const body = await readFile(file);
    res
      .writeHead(200, {
        "Content-Type": mime[extname(file)] ?? "application/octet-stream",
        "Cache-Control": "no-cache",
      })
      .end(body);
  } catch {
    res.writeHead(404).end("Not found");
  }
});
server.listen(port, "127.0.0.1", () =>
  console.log(`VN63 preview http://127.0.0.1:${port}`),
);
