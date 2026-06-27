import express from "express";
import crypto from "crypto";
import "dotenv/config";
import { dbService } from "./dbService";
import { OrderStatus } from "../src/types";

const app = express();
app.use(express.json({ limit: "10mb" }));

// Ensure compatibility with Vercel serverless routing where /api might be stripped or rewritten
app.use((req, res, next) => {
  if (req.url && !req.url.startsWith("/api") && req.url !== "/" && req.url !== "/index.html") {
    req.url = "/api" + req.url;
  }
  next();
});

// Stateless signed session tokens to survive multi-instance, autoscaling, and container recycles
const SESSION_SECRET = process.env.SESSION_SECRET || "doce-aroma-stateless-jwt-secret-token-key-2026";

function generateSessionToken(): string {
  const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours validity
  const payload = `${expiry}`;
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("hex");
  return Buffer.from(`${payload}.${signature}`).toString("base64");
}

function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [payload, signature] = decoded.split(".");
    if (!payload || !signature) return false;

    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(payload)
      .digest("hex");

    if (signature !== expectedSignature) return false;

    const expiry = parseInt(payload, 10);
    if (isNaN(expiry) || Date.now() > expiry) {
      return false; // Expired
    }

    return true;
  } catch {
    return false;
  }
}

// --- API ROUTES ---

// Auth: Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: "Senha é obrigatória" });
    }

    const isValid = await dbService.verifyPassword(password);
    if (isValid) {
      // Generate stateless token
      const token = generateSessionToken();
      return res.json({ success: true, token });
    } else {
      return res.status(401).json({ error: "Senha inválida ou incorreta" });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Auth: Validate active session
app.get("/api/auth/session", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.json({ authenticated: false });
  }
  const token = authHeader.replace("Bearer ", "");
  if (verifySessionToken(token)) {
    return res.json({ authenticated: true });
  }
  return res.json({ authenticated: false });
});

// Auth: Logout
app.post("/api/auth/logout", (req, res) => {
  // Stateless token is simply discarded by client, but we return success here
  return res.json({ success: true });
});

// ADMIN AUTHORIZATION MIDDLEWARE
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Sessão não autorizada" });
  }
  const token = authHeader.replace("Bearer ", "");
  if (verifySessionToken(token)) {
    return next();
  }
  return res.status(401).json({ error: "Sessão expirada. Faça login novamente." });
};

// Products: Public catalog
app.get("/api/products", async (req, res) => {
  try {
    const products = await dbService.getProducts();
    return res.json(products);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Products: Admin save (Creat / Edit)
app.post("/api/products", requireAdmin, async (req, res) => {
  try {
    const updatedProduct = await dbService.saveProduct(req.body);
    return res.json(updatedProduct);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Products: Admin delete
app.delete("/api/products/:id", requireAdmin, async (req, res) => {
  try {
    await dbService.deleteProduct(req.params.id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Orders: Public submission (checkout)
app.post("/api/orders", async (req, res) => {
  try {
    const { customer, products, total } = req.body;
    if (!customer || !products || products.length === 0) {
      return res.status(400).json({ error: "Dados do pedido inválidos ou vazios" });
    }

    // Check stock and deduct inside createOrder
    const newOrder = await dbService.createOrder({ customer, products, total });
    return res.status(201).json(newOrder);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Orders: Admin read
app.get("/api/orders", requireAdmin, async (req, res) => {
  try {
    const orders = await dbService.getOrders();
    return res.json(orders);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Orders: Admin update status
app.put("/api/orders/:id/status", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await dbService.updateOrderStatus(req.params.id, status as OrderStatus);
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Clients: Admin read list
app.get("/api/clients", requireAdmin, async (req, res) => {
  try {
    const clients = await dbService.getCustomers();
    return res.json(clients);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Stats: Admin read dashboard
app.get("/api/stats", requireAdmin, async (req, res) => {
  try {
    const stats = await dbService.getStats();
    return res.json(stats);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// --- Categories API ---
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await dbService.getCategories();
    return res.json(categories);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/categories", requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    const categories = await dbService.addCategory(name);
    return res.json(categories);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.put("/api/categories", requireAdmin, async (req, res) => {
  try {
    const { oldName, newName } = req.body;
    const categories = await dbService.updateCategory(oldName, newName);
    return res.json(categories);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete("/api/categories/:name", requireAdmin, async (req, res) => {
  try {
    const categories = await dbService.deleteCategory(req.params.name);
    return res.json(categories);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// --- Testimonials API ---
app.get("/api/testimonials", requireAdmin, async (req, res) => {
  try {
    const testimonials = await dbService.getTestimonials();
    return res.json(testimonials);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/testimonials", requireAdmin, async (req, res) => {
  try {
    const testimonial = await dbService.saveTestimonial(req.body);
    return res.json(testimonial);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete("/api/testimonials/:id", requireAdmin, async (req, res) => {
  try {
    await dbService.deleteTestimonial(req.params.id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// --- Public Testimonials API (No Admin Auth) ---
app.get("/api/public-testimonials", async (req, res) => {
  try {
    const testimonials = await dbService.getTestimonials();
    const approved = testimonials.filter(t => t.approved);
    return res.json(approved);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/public-testimonials", async (req, res) => {
  try {
    const { name, city, stars, quote, avatar } = req.body;
    if (!name || !quote) {
      return res.status(400).json({ error: "Nome e depoimento são obrigatórios" });
    }
    const newTestimonial = await dbService.saveTestimonial({
      name,
      city: city || "Uberlândia - MG",
      stars: Number(stars) || 5,
      quote,
      avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
      approved: false // Always goes to moderation
    });
    return res.json(newTestimonial);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export { app };
