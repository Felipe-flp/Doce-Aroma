import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { app } from "./server/app";

async function startServer() {
  const PORT = 3000;

  // --- VITE FRONTEND MIDDLEWARE ---

  if (process.env.NODE_ENV !== "production") {
    // Development server with Vite
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production build delivery
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind to host 0.0.0.0 and Port 3000 (essential for container ingress routing)
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Doce Aroma Backend] Executando em http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Critical: Failed to launch Doce Aroma server", error);
});
