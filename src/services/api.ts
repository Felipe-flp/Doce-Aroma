import { Product, CartItem, OrderCustomer, Order, StatsInfo, CustomerSummary, OrderStatus, Testimonial } from '../types';

const API_BASE = '/api';

// Admin Session Token Manager
export const authService = {
  getToken(): string | null {
    return localStorage.getItem('da_admin_token');
  },
  setToken(token: string) {
    localStorage.setItem('da_admin_token', token);
  },
  clearToken() {
    localStorage.removeItem('da_admin_token');
  },
  getHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }
};

// WhatsApp Formatter and Redirector
export function sendOrderToWhatsApp(order: Order) {
  const phoneFormatted = '5534988534026'; // +55 34 98853-4026
  
  let msg = `Olá! Gostaria de fazer este pedido (Doce Aroma):\n\n`;
  
  order.products.forEach(item => {
    msg += `🧼 *${item.name}* (${item.aroma})\n`;
    msg += `   Qtd: ${item.quantity}\n`;
    msg += `   Valor: R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n\n`;
  });
  
  msg += `💰 *Total: R$ ${order.total.toFixed(2).replace('.', ',')}*\n\n`;
  msg += `📍 *Nome:* ${order.customer.name}\n`;
  msg += `📞 *Telefone:* ${order.customer.phone}\n`;
  msg += `🏠 *Endereço:* ${order.customer.address}\n`;
  
  if (order.customer.observations) {
    msg += `📝 *Observações:* ${order.customer.observations}\n`;
  }
  
  msg += `💳 *Forma de Pagamento:* ${order.customer.paymentMethod}\n\n`;
  msg += `Muito obrigado(a)! Aguardo confirmação do pedido.`;

  const encoded = encodeURIComponent(msg);
  const waUrl = `https://wa.me/${phoneFormatted}?text=${encoded}`;
  
  // Open with fallback for iframe constraints
  try {
    window.open(waUrl, '_blank');
  } catch (e) {
    window.location.href = waUrl;
  }
}

// Global API endpoints
export const api = {
  // --- Products ---
  async getProducts(): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error('Não foi possível carregar os produtos');
    return res.json();
  },

  async saveProduct(product: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: authService.getHeaders(),
      body: JSON.stringify(product)
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Falha ao salvar produto');
    }
    return res.json();
  },

  async deleteProduct(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: authService.getHeaders()
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Falha ao remover produto');
    }
    return true;
  },

  // --- Orders ---
  async createOrder(customer: OrderCustomer, cartItems: CartItem[]): Promise<Order> {
    const total = cartItems.reduce((sum, item) => {
      const price = item.product.promotion && item.product.salePrice ? item.product.salePrice : item.product.price;
      return sum + (price * item.quantity);
    }, 0);

    const products = cartItems.map(item => {
      const price = item.product.promotion && item.product.salePrice ? item.product.salePrice : item.product.price;
      return {
        id: item.product.id,
        name: item.product.name,
        price,
        quantity: item.quantity,
        aroma: item.product.aroma
      };
    });

    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer, products, total })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Falha ao processar pedido');
    }

    return res.json();
  },

  async getOrders(): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: authService.getHeaders()
    });
    if (!res.ok) throw new Error('Carga de pedidos falhou');
    return res.json();
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PUT',
      headers: authService.getHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Não foi possível atualizar o status');
    return res.json();
  },

  // --- Clients ---
  async getClients(): Promise<CustomerSummary[]> {
    const res = await fetch(`${API_BASE}/clients`, {
      headers: authService.getHeaders()
    });
    if (!res.ok) throw new Error('Não foi possível carregar os clientes');
    return res.json();
  },

  // --- Stats / Dashboard ---
  async getStats(): Promise<StatsInfo> {
    const res = await fetch(`${API_BASE}/stats`, {
      headers: authService.getHeaders()
    });
    if (!res.ok) throw new Error('Não foi possível carregar as estatísticas');
    return res.json();
  },

  // --- Auth ---
  async login(password: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Senha incorreta');
    }
    const data = await res.json();
    if (data.token) {
      authService.setToken(data.token);
      return true;
    }
    return false;
  },

  async checkSession(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/auth/session`, {
        headers: authService.getHeaders()
      });
      if (!res.ok) return false;
      const data = await res.json();
      return !!data.authenticated;
    } catch {
      return false;
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: authService.getHeaders()
      });
    } finally {
      authService.clearToken();
    }
  },

  // --- Categories ---
  async getCategories(): Promise<string[]> {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Não foi possível carregar as categorias');
    return res.json();
  },

  async addCategory(name: string): Promise<string[]> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: authService.getHeaders(),
      body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error('Falha ao adicionar categoria');
    return res.json();
  },

  async updateCategory(oldName: string, newName: string): Promise<string[]> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'PUT',
      headers: authService.getHeaders(),
      body: JSON.stringify({ oldName, newName })
    });
    if (!res.ok) throw new Error('Falha ao editar a categoria');
    return res.json();
  },

  async deleteCategory(name: string): Promise<string[]> {
    const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers: authService.getHeaders()
    });
    if (!res.ok) throw new Error('Falha ao remover a categoria');
    return res.json();
  },

  // --- Testimonials ---
  async getTestimonials(): Promise<Testimonial[]> {
    const res = await fetch(`${API_BASE}/testimonials`, {
      headers: authService.getHeaders()
    });
    if (!res.ok) throw new Error('Não foi possível carregar os depoimentos');
    return res.json();
  },

  async saveTestimonial(testimonial: Partial<Testimonial>): Promise<Testimonial> {
    const res = await fetch(`${API_BASE}/testimonials`, {
      method: 'POST',
      headers: authService.getHeaders(),
      body: JSON.stringify(testimonial)
    });
    if (!res.ok) throw new Error('Falha ao salvar o depoimento');
    return res.json();
  },

  async deleteTestimonial(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/testimonials/${id}`, {
      method: 'DELETE',
      headers: authService.getHeaders()
    });
    if (!res.ok) throw new Error('Falha ao remover depoimento');
    return true;
  },

  async getPublicTestimonials(): Promise<Testimonial[]> {
    const res = await fetch(`${API_BASE}/public-testimonials`);
    if (!res.ok) throw new Error('Não foi possível carregar os depoimentos públicos');
    return res.json();
  },

  async createPublicTestimonial(testimonial: Partial<Testimonial>): Promise<Testimonial> {
    const res = await fetch(`${API_BASE}/public-testimonials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testimonial)
    });
    if (!res.ok) throw new Error('Falha ao enviar depoimento');
    return res.json();
  }
};
