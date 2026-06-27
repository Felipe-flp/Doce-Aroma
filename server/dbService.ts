import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Product, Order, OrderStatus, StatsInfo, CustomerSummary, Testimonial } from '../src/types';

export interface DbSchema {
  products: Product[];
  orders: Order[];
  adminPasswordHash: string;
  categories: string[];
  testimonials: Testimonial[];
}

const BUNDLED_DB_PATH = path.join(process.cwd(), 'db.json');
const WRITABLE_DB_PATH = process.env.VERCEL || process.env.NODE_ENV === 'production'
  ? path.join('/tmp', 'db.json')
  : path.join(process.cwd(), 'db.json');

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Sabonete de Lavanda & Mel",
    description: "Com flores secas de lavanda francesa e mel silvestre de florada nativa. Nutre, suaviza e relaxa profundamente, perfeito para um banho calmo no final de dia.",
    category: "Lavanda",
    price: 18,
    stock: 12,
    image: "/src/assets/images/lavender_soap_1779567705170.png",
    aroma: "Floral & Adocicado",
    weight: "110g",
    featured: true,
    active: true,
    promotion: false
  },
  {
    id: "p2",
    name: "Sabonete de Alecrim & Argila Verde",
    description: "Ação tonificante com folhas trituradas de alecrim e argila verde mineral. Proporciona uma esfoliação extremamente leve, purificante e refrescante.",
    category: "Ervas",
    price: 16,
    stock: 4,
    image: "/src/assets/images/herbal_soap_1779567721065.png",
    aroma: "Balsâmico & Herbal",
    weight: "100g",
    featured: true,
    active: true,
    promotion: false
  },
  {
    id: "p3",
    name: "Sabonete Capim-Limão & Calêndula",
    description: "Calmante e regenerador para a pele. Elaborado especialmente para peles delicadas ou secas, com o delicioso frescor cítrico e reconfortante do capim-limão.",
    category: "Hidratantes",
    price: 16,
    stock: 25,
    image: "https://images.unsplash.com/photo-1607006342411-91361716301a?q=80&w=600",
    aroma: "Cítrico & Herbal",
    weight: "105g",
    featured: false,
    active: true,
    promotion: true,
    salePrice: 14
  },
  {
    id: "p4",
    name: "Sabonete Hidratante de Aveia & Karité",
    description: "Nutrição profunda. Rico em manteiga de karité pura da melhor procedência e farelo fino de aveia orgânica para uma esfoliação terna de peles muito secas.",
    category: "Hidratantes",
    price: 19,
    stock: 10,
    image: "https://images.unsplash.com/photo-1546554137-f86b9593a222?q=80&w=600",
    aroma: "Suave, Quente & Amendoado",
    weight: "115g",
    featured: true,
    active: true,
    promotion: false
  },
  {
    id: "p5",
    name: "Kit Essencial Doce Aroma",
    description: "Uma embalagem artesanal premium em papel kraft reciclado biodegradável contendo nossos três maiores sucessos: Lavanda, Alecrim e Aveia.",
    category: "Kits",
    price: 48,
    stock: 6,
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=600",
    aroma: "Misto & Envolvente",
    weight: "320g",
    featured: true,
    active: true,
    promotion: false
  },
  {
    id: "p6",
    name: "Kit Presente Lavanda Imperial",
    description: "O presente supremo. Contém um sabonete de Lavanda & Mel de 110g, um sachê perfumado de lavanda natural para guarda-roupas, e uma saboneteira exclusiva em madeira rústica tratada.",
    category: "Kits",
    price: 65,
    stock: 11,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600",
    aroma: "Lavanda Intesa",
    weight: "450g",
    featured: false,
    active: true,
    promotion: false
  }
];

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Camila Rodrigues",
    city: "Uberlândia - MG",
    stars: 5,
    quote: "O atendimento de vocês é excelente! Fiquei extremamente satisfeita com a atenção, rapidez e carinho no WhatsApp. Além disso, os sabonetes artesanais são cheirosos demais, de altíssima qualidade e deixam a pele muito macia. Recomendo com toda certeza!",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200",
    approved: true
  }
];

// Default hash is a secure bcrypt hash for 'viviane123adm'
const DEFAULT_HASH = '$2b$10$oIBVUFItpSSuakfei9kqM.JrCN73IaImMqvHz7DVl03TDR8NH/gx6';

async function ensureWritableDb(): Promise<string> {
  if (WRITABLE_DB_PATH !== BUNDLED_DB_PATH && !existsSync(WRITABLE_DB_PATH)) {
    try {
      let rawData = '{}';
      if (existsSync(BUNDLED_DB_PATH)) {
        rawData = await fs.readFile(BUNDLED_DB_PATH, 'utf-8');
      } else {
        const fallbackDb = {
          products: DEFAULT_PRODUCTS,
          orders: [],
          adminPasswordHash: DEFAULT_HASH,
          categories: ['Lavanda', 'Ervas', 'Hidratantes', 'Kits'],
          testimonials: DEFAULT_TESTIMONIALS
        };
        rawData = JSON.stringify(fallbackDb, null, 2);
      }
      await fs.writeFile(WRITABLE_DB_PATH, rawData, 'utf-8');
    } catch (err) {
      console.error('Failed to copy bundled db.json to /tmp', err);
    }
  }
  return WRITABLE_DB_PATH;
}

async function readDb(): Promise<DbSchema> {
  try {
    const dbPath = await ensureWritableDb();
    const raw = await fs.readFile(dbPath, 'utf-8');
    const db = JSON.parse(raw);
    
    // Manage dynamic categories and drop 'Presentes'
    if (!db.categories) {
      db.categories = ['Lavanda', 'Ervas', 'Hidratantes', 'Kits'];
    } else {
      db.categories = db.categories.filter((c: string) => c !== 'Presentes');
    }

    if (!db.testimonials) {
      db.testimonials = DEFAULT_TESTIMONIALS;
    }

    if (!db.products || db.products.length === 0) {
      db.products = DEFAULT_PRODUCTS;
    }

    return db as DbSchema;
  } catch (err) {
    console.error('Error reading db.json, returning pre-populated structure', err);
    return {
      products: DEFAULT_PRODUCTS,
      orders: [],
      adminPasswordHash: DEFAULT_HASH,
      categories: ['Lavanda', 'Ervas', 'Hidratantes', 'Kits'],
      testimonials: DEFAULT_TESTIMONIALS
    };
  }
}

async function writeDb(data: DbSchema): Promise<void> {
  const dbPath = await ensureWritableDb();
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

export const dbService = {
  async getProducts(): Promise<Product[]> {
    const db = await readDb();
    return db.products;
  },

  async saveProduct(productData: Partial<Product> & { id?: string }): Promise<Product> {
    const db = await readDb();
    if (productData.id) {
      // Edit mode
      const index = db.products.findIndex(p => p.id === productData.id);
      if (index === -1) {
        throw new Error('Produto não encontrado');
      }
      const existing = db.products[index];
      const updated: Product = {
        ...existing,
        ...productData,
        id: existing.id // protect ID
      } as Product;
      db.products[index] = updated;
      await writeDb(db);
      return updated;
    } else {
      // Create mode
      const newProduct: Product = {
        ...productData,
        id: 'p_' + Math.random().toString(36).substring(2, 9),
        active: productData.active !== false,
        featured: !!productData.featured,
        promotion: !!productData.promotion,
        price: Number(productData.price) || 0,
        stock: Number(productData.stock) || 0,
        weight: productData.weight || '100g',
        aroma: productData.aroma || 'Delicado',
        image: productData.image || 'https://images.unsplash.com/photo-1607006342411-91361716301a?q=80&w=600'
      } as Product;
      db.products.push(newProduct);
      await writeDb(db);
      return newProduct;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    const db = await readDb();
    db.products = db.products.filter(p => p.id !== id);
    await writeDb(db);
  },

  async getOrders(): Promise<Order[]> {
    const db = await readDb();
    // Sort recent first
    return [...db.orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async createOrder(orderData: Omit<Order, 'id' | 'date' | 'status'>): Promise<Order> {
    const db = await readDb();
    
    // Decrement stock in database for purchased items
    for (const item of orderData.products) {
      const product = db.products.find(p => p.id === item.id);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
      }
    }

    // Assign custom order number sequential
    const orderNum = db.orders.length + 1001;
    const newOrder: Order = {
      ...orderData,
      id: `DA-${orderNum}`,
      date: new Date().toISOString(),
      status: 'pendente'
    };

    db.orders.push(newOrder);
    await writeDb(db);
    return newOrder;
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const db = await readDb();
    const orderIndex = db.orders.findIndex(o => o.id === id);
    if (orderIndex === -1) {
      throw new Error('Pedido não encontrado');
    }
    const order = db.orders[orderIndex];
    
    // If order is transitioning to canceled, we restore stock and delete the order entirely
    if (status === 'cancelado') {
      if (order.status !== 'cancelado') {
        for (const item of order.products) {
          const product = db.products.find(p => p.id === item.id);
          if (product) {
            product.stock += item.quantity;
          }
        }
      }
      // Remove from the database entirely
      db.orders.splice(orderIndex, 1);
      await writeDb(db);
      return { ...order, status: 'cancelado' };
    }

    if (order.status === 'cancelado' && status !== 'cancelado') {
      // If moving away from canceled, re-deduct
      for (const item of order.products) {
        const product = db.products.find(p => p.id === item.id);
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
        }
      }
    }

    order.status = status;
    await writeDb(db);
    return order;
  },

  async verifyPassword(password: string): Promise<boolean> {
    const cleanInput = password.trim();
    
    // 1. Prioritize comparing with the environment variable hash
    // Default fallback bcrypt hash is for 'viviane123adm'
    const defaultHash = "$2b$10$oIBVUFItpSSuakfei9kqM.JrCN73IaImMqvHz7DVl03TDR8NH/gx6";
    const envHash = process.env.ADMIN_PASSWORD_HASH || defaultHash;
    
    try {
      const isValidEnv = await bcrypt.compare(cleanInput, envHash);
      if (isValidEnv) {
        return true;
      }
      
      const isValidEnvLower = await bcrypt.compare(cleanInput.toLowerCase(), envHash);
      if (isValidEnvLower) {
        return true;
      }
    } catch (err) {
      console.error('Error comparing password with ADMIN_PASSWORD_HASH:', err);
    }

    // 2. Fallback to reading the hash stored in db.json (which we will also store as a bcrypt hash)
    try {
      const db = await readDb();
      if (db.adminPasswordHash) {
        // If the hash in db.json is an old SHA256 hash (64 hex characters), we support migrating it to bcrypt automatically
        if (db.adminPasswordHash.length === 64 && !db.adminPasswordHash.startsWith('$')) {
          const sha256Hash = crypto.createHash('sha256').update(cleanInput.toLowerCase()).digest('hex');
          if (sha256Hash === db.adminPasswordHash) {
            const newBcryptHash = await bcrypt.hash(cleanInput, 10);
            db.adminPasswordHash = newBcryptHash;
            await writeDb(db);
            return true;
          }
        } else {
          const isValidDb = await bcrypt.compare(cleanInput, db.adminPasswordHash);
          if (isValidDb) {
            return true;
          }
          const isValidDbLower = await bcrypt.compare(cleanInput.toLowerCase(), db.adminPasswordHash);
          if (isValidDbLower) {
            return true;
          }
        }
      }
    } catch (err) {
      console.error('Error verifying password via database hash fallback:', err);
    }

    return false;
  },

  async getCustomers(): Promise<CustomerSummary[]> {
    const db = await readDb();
    // Unique clients mapped by phone number
    const customersMap = new Map<string, CustomerSummary>();
    
    // Iterate from oldest to newest to capture purchase metrics
    for (const order of db.orders) {
      const phone = order.customer.phone || 'S/N';
      const existing = customersMap.get(phone);
      
      const hasBeenConfirmed = order.status !== 'cancelado' && order.status !== 'pendente';
      const filteredPrice = hasBeenConfirmed ? order.total : 0;
      const orderCount = hasBeenConfirmed ? 1 : 0;
      
      if (existing) {
        existing.totalSpent += filteredPrice;
        existing.totalOrders += orderCount;
        if (new Date(order.date).getTime() > new Date(existing.lastOrderDate).getTime()) {
          existing.lastOrderDate = order.date;
          existing.name = order.customer.name || existing.name; // Use latest name
        }
      } else {
        customersMap.set(phone, {
          phone,
          name: order.customer.name || 'Cliente sem nome',
          totalOrders: orderCount,
          totalSpent: filteredPrice,
          lastOrderDate: order.date
        });
      }
    }
    
    return Array.from(customersMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  },

  async getStats(): Promise<StatsInfo> {
    const db = await readDb();
    
    // Low stock count (threshold < 5)
    const lowStockCount = db.products.filter(p => p.stock < 5 && p.active).length;
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Filter orders to only the last 30 days (1 month)
    const ordersLast30Days = db.orders.filter(o => new Date(o.date) >= thirtyDaysAgo);
    
    // Filter out canceled and pending orders for total computation (saldo)
    const confirmedOrders = ordersLast30Days.filter(o => o.status !== 'cancelado' && o.status !== 'pendente');
    const totalSales = confirmedOrders.reduce((sum, o) => sum + o.total, 0);
    const ordersCount = confirmedOrders.length;
    const averageTicket = confirmedOrders.length > 0 ? totalSales / confirmedOrders.length : 0;
    
    // Recent orders (last 5 of all time, for admin actionability)
    const recentOrders = [...db.orders]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // Sales by status within the last 30 days
    const salesByStatus: Record<OrderStatus, number> = {
      pendente: 0,
      confirmado: 0,
      produção: 0,
      entregue: 0,
      cancelado: 0
    };
    for (const o of ordersLast30Days) {
      salesByStatus[o.status] = (salesByStatus[o.status] || 0) + o.total;
    }

    // Top selling products in the last 30 days
    const productSales = new Map<string, { quantity: number; revenue: number }>();
    for (const order of confirmedOrders) {
      for (const item of order.products) {
        const existing = productSales.get(item.name) || { quantity: 0, revenue: 0 };
        existing.quantity += item.quantity;
        existing.revenue += item.price * item.quantity;
        productSales.set(item.name, existing);
      }
    }
    const topSellers = Array.from(productSales.entries())
      .map(([name, stats]) => ({
        name,
        quantity: stats.quantity,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Sales history (accumulated by date in the last few days of this month)
    const historyMap = new Map<string, { amount: number; count: number }>();
    // Pre-populate last 7 days for the chart
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      historyMap.set(dateStr, { amount: 0, count: 0 });
    }

    for (const order of ordersLast30Days) {
      const dateStr = order.date.split('T')[0];
      const existing = historyMap.get(dateStr);
      if (existing) {
        existing.count += 1;
        if (order.status !== 'cancelado' && order.status !== 'pendente') {
          existing.amount += order.total;
        }
      } else {
        // Only map if within the pre-populated range or add dynamically if within last 30 days
        const orderDate = new Date(order.date);
        if (orderDate >= thirtyDaysAgo) {
          historyMap.set(dateStr, {
            count: 1,
            amount: (order.status !== 'cancelado' && order.status !== 'pendente') ? order.total : 0
          });
        }
      }
    }

    const salesHistory = Array.from(historyMap.entries())
      .map(([date, data]) => ({
        date: date.substring(5), // Show MM-DD format
        amount: data.amount,
        count: data.count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalSales,
      ordersCount,
      averageTicket,
      lowStockCount,
      recentOrders,
      topSellers,
      salesByStatus,
      salesHistory
    };
  },

  async getCategories(): Promise<string[]> {
    const db = await readDb();
    return db.categories;
  },

  async addCategory(name: string): Promise<string[]> {
    const db = await readDb();
    const cleanName = name.trim();
    if (cleanName && !db.categories.includes(cleanName)) {
      db.categories.push(cleanName);
      await writeDb(db);
    }
    return db.categories;
  },

  async updateCategory(oldName: string, newName: string): Promise<string[]> {
    const db = await readDb();
    const cleanOld = oldName.trim();
    const cleanNew = newName.trim();
    if (!cleanOld || !cleanNew) return db.categories;

    const idx = db.categories.indexOf(cleanOld);
    if (idx !== -1) {
      db.categories[idx] = cleanNew;
      // Update all matching products
      db.products.forEach(p => {
        if (p.category === cleanOld) {
          p.category = cleanNew;
        }
      });
      await writeDb(db);
    }
    return db.categories;
  },

  async deleteCategory(name: string): Promise<string[]> {
    const db = await readDb();
    const cleanName = name.trim();
    db.categories = db.categories.filter(c => c !== cleanName);
    
    // For products in the deleted category, change them to first available category
    const fallbackCategory = db.categories[0] || 'Geral';
    db.products.forEach(p => {
      if (p.category === cleanName) {
        p.category = fallbackCategory;
      }
    });

    await writeDb(db);
    return db.categories;
  },

  async getTestimonials(): Promise<Testimonial[]> {
    const db = await readDb();
    return db.testimonials;
  },

  async saveTestimonial(testimonialData: Partial<Testimonial>): Promise<Testimonial> {
    const db = await readDb();
    if (testimonialData.id) {
      // Edit mode
      const idx = db.testimonials.findIndex(t => t.id === testimonialData.id);
      if (idx === -1) {
        throw new Error('Depoimento não encontrado');
      }
      const existing = db.testimonials[idx];
      const updated: Testimonial = {
        ...existing,
        ...testimonialData,
        id: existing.id
      } as Testimonial;
      db.testimonials[idx] = updated;
      await writeDb(db);
      return updated;
    } else {
      // Create mode
      const newTestimonial: Testimonial = {
        ...testimonialData,
        id: 't_' + Math.random().toString(36).substring(2, 9),
        name: testimonialData.name || 'Cliente Secreto',
        city: testimonialData.city || 'Uberlândia - MG',
        stars: Number(testimonialData.stars) || 5,
        quote: testimonialData.quote || '',
        avatar: testimonialData.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200',
        approved: testimonialData.approved !== false
      } as Testimonial;
      db.testimonials.push(newTestimonial);
      await writeDb(db);
      return newTestimonial;
    }
  },

  async deleteTestimonial(id: string): Promise<void> {
    const db = await readDb();
    db.testimonials = db.testimonials.filter(t => t.id !== id);
    await writeDb(db);
  }
};
