import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { initDatabase, getAllStoreValues, getStoreValue, setStoreValue } from "./server/db";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // Initialize SQLite database
  await initDatabase();

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      system: "Saleem Daal Factory Cheque Management System",
      timestamp: new Date().toISOString(),
    });
  });

  // SQLite Database API Routes
  app.get("/api/db", (req, res) => {
    try {
      const all = getAllStoreValues();
      res.json(all);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/db/:key", (req, res) => {
    try {
      const val = getStoreValue(req.params.key);
      res.json({ key: req.params.key, value: val });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/db/:key", (req, res) => {
    try {
      setStoreValue(req.params.key, req.body.value);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for dev or static files for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Saleem Daal Factory server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

