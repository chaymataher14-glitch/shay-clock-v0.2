import * as fs from "fs";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set headers to allow embedding
  app.use((req, res, next) => {
    res.removeHeader("X-Frame-Options");
    res.removeHeader("Content-Security-Policy");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
  });

  app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-cache');
    try {
      res.sendFile(path.join(process.cwd(), 'public', 'sw.js'));
    } catch(e) {
      res.send('');
    }
  });

  app.get('*', (req, res, next) => {
    if (req.path.match(/\.(js|jsx|ts|tsx)$/) && req.path !== '/sw.js') {
      const filePath = path.join(process.cwd(), req.path);
      if (!fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'application/javascript');
        return res.send("if ('serviceWorker' in navigator) { navigator.serviceWorker.getRegistrations().then(function(r) { for(let i of r) i.unregister(); window.location.reload(true); }); }");
      }
    }
    next();
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, {
      setHeaders: (res, path, stat) => {
        res.removeHeader("X-Frame-Options");
        res.removeHeader("Content-Security-Policy");
        res.setHeader("Access-Control-Allow-Origin", "*");
      }
    }));
    app.get('*', (req, res) => {
      res.removeHeader("X-Frame-Options");
      res.removeHeader("Content-Security-Policy");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
