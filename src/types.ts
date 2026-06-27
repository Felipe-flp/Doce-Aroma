export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  aroma: string;
  weight: string;
  featured: boolean;
  active: boolean;
  promotion: boolean;
  salePrice?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  address: string;
  paymentMethod: string;
  observations?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  aroma: string;
}

export type OrderStatus = 'pendente' | 'confirmado' | 'produção' | 'entregue' | 'cancelado';

export interface Order {
  id: string;
  customer: OrderCustomer;
  products: OrderItem[];
  total: number;
  date: string;
  status: OrderStatus;
}

export interface CustomerSummary {
  phone: string;
  name: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

export interface StatsInfo {
  totalSales: number;
  ordersCount: number;
  averageTicket: number;
  lowStockCount: number;
  recentOrders: Order[];
  topSellers: { name: string; quantity: number; revenue: number }[];
  salesByStatus: Record<OrderStatus, number>;
  salesHistory: { date: string; amount: number; count: number }[];
}

export interface Testimonial {
  id: string;
  name: string;
  city: string;
  stars: number;
  quote: string;
  avatar?: string;
  approved?: boolean;
}
