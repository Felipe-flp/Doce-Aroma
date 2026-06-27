import { useState, useEffect } from 'react';
import { 
  BarChart3, ShoppingBag, Package, Users, AlertTriangle, 
  TrendingUp, DollarSign, Calendar, Edit3, Trash2, Plus, 
  X, Check, Lock, LogOut, CheckCircle, Clock, Star, MessageSquare, Filter } from 'lucide-react';
import { Product, Order, CustomerSummary, StatsInfo, OrderStatus, Testimonial } from '../types';
import { api } from '../services/api';

interface AdminPanelProps {
  onLogoutSuccess: () => void;
  products: Product[];
  onRefreshProducts: () => void;
  categories: string[];
  onRefreshCategories: () => void;
}

type AdminTab = 'dashboard' | 'products' | 'filters' | 'testimonials' | 'orders' | 'customers';

export default function AdminPanel({ 
  onLogoutSuccess, 
  products, 
  onRefreshProducts,
  categories,
  onRefreshCategories
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  
  // Dashboard Metrics & Databases
  const [stats, setStats] = useState<StatsInfo | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Edit & Add Products State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  
  // Status filter for Orders list (default to 'pendente' so once confirmed they exit the default list)
  const [orderFilter, setOrderFilter] = useState<'Todos' | OrderStatus>('pendente');

  // Custom confirmation dialog state
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Filters (Categories) management state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryOldName, setEditingCategoryOldName] = useState<string | null>(null);
  const [editingCategoryNewName, setEditingCategoryNewName] = useState('');

  // Testimonials management state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);
  const [isSavingTestimonial, setIsSavingTestimonial] = useState(false);

  useEffect(() => {
    loadAdminData();
    if (activeTab === 'testimonials') {
      loadTestimonialsData();
    }
  }, [products, activeTab]); // reload when public product listing updates or tab changes

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const fetchedStats = await api.getStats();
      const fetchedOrders = await api.getOrders();
      const fetchedCustomers = await api.getClients();
      
      setStats(fetchedStats);
      setOrders(fetchedOrders);
      setCustomers(fetchedCustomers);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTestimonialsData = async () => {
    setIsLoadingTestimonials(true);
    try {
      const data = await api.getTestimonials();
      setTestimonials(data);
    } catch (err) {
      console.error('Error loading testimonials:', err);
    } finally {
      setIsLoadingTestimonials(false);
    }
  };

  // --- Category Filters admin methods ---
  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;
    try {
      await api.addCategory(name);
      setNewCategoryName('');
      onRefreshCategories();
    } catch (err: any) {
      alert(err.message || 'Erro ao adicionar filtro/categoria');
    }
  };

  const handleUpdateCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const oldName = editingCategoryOldName;
    const newName = editingCategoryNewName.trim();
    if (!oldName || !newName) return;
    try {
      await api.updateCategory(oldName, newName);
      setEditingCategoryOldName(null);
      setEditingCategoryNewName('');
      onRefreshCategories();
      onRefreshProducts();
    } catch (err: any) {
      alert(err.message || 'Erro ao renomear filtro/categoria');
    }
  };

  const handleDeleteCategory = async (name: string) => {
    setConfirmConfig({
      title: 'Excluir Categoria / Filtro',
      message: `Tem certeza que deseja excluir o filtro "${name}"? Os produtos vinculados a esta categoria serão reatribuídos para um filtro padrão.`,
      onConfirm: async () => {
        try {
          await api.deleteCategory(name);
          onRefreshCategories();
          onRefreshProducts();
        } catch (err: any) {
          alert(err.message || 'Erro ao remover filtro/categoria');
        }
      }
    });
  };

  // --- Testimonials admin methods ---
  const handleSaveTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial) return;
    setIsSavingTestimonial(true);
    try {
      await api.saveTestimonial(editingTestimonial);
      setEditingTestimonial(null);
      await loadTestimonialsData();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar depoimento');
    } finally {
      setIsSavingTestimonial(false);
    }
  };

  const handleToggleTestimonialApproved = async (item: Testimonial) => {
    try {
      await api.saveTestimonial({
        ...item,
        approved: !item.approved
      });
      await loadTestimonialsData();
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar status do depoimento');
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    setConfirmConfig({
      title: 'Excluir Depoimento',
      message: 'Tem certeza que deseja excluir permanentemente este depoimento?',
      onConfirm: async () => {
        try {
          await api.deleteTestimonial(id);
          await loadTestimonialsData();
        } catch (err: any) {
          alert(err.message || 'Falha ao remover depoimento');
        }
      }
    });
  };

  // Log Out handler
  const handleLogout = async () => {
    await api.logout();
    onLogoutSuccess();
  };

  // Toggle highlight / featured state
  const handleToggleProductProp = async (product: Product, prop: 'featured' | 'active' | 'promotion') => {
    try {
      await api.saveProduct({
        ...product,
        [prop]: !product[prop]
      });
      onRefreshProducts();
    } catch (err) {
      alert('Erro ao alterar propriedade do produto');
    }
  };

  // Delete product handler
  const handleDeleteProduct = async (id: string) => {
    setConfirmConfig({
      title: 'Excluir Produto',
      message: 'Tem certeza que deseja excluir permanentemente este produto do sistema?',
      onConfirm: async () => {
        try {
          await api.deleteProduct(id);
          onRefreshProducts();
        } catch (err: any) {
          alert(err.message || 'Falha ao remover produto');
        }
      }
    });
  };

  // Save product (Edit / New)
  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    setIsSavingProduct(true);
    try {
      await api.saveProduct(editingProduct);
      setEditingProduct(null);
      onRefreshProducts();
    } catch (err: any) {
      alert(err.message || 'Erro ao gravar produto');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Order status update Handler
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      await loadAdminData(); // Refresh metrics
      onRefreshProducts(); // Stock levels might have updated
    } catch (err) {
      alert('Falha ao redefinir status da transação');
    }
  };

  // Compute orders listing based on filter
  const filteredOrders = orders.filter(o => orderFilter === 'Todos' || o.status === orderFilter);

  // Status Badge visual styles mapper
  const getStatusBadge = (status: OrderStatus) => {
    const styles: Record<OrderStatus, string> = {
      pendente: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      confirmado: 'bg-blue-50 text-blue-800 border-blue-200',
      produção: 'bg-purple-50 text-purple-800 border-purple-200',
      entregue: 'bg-green-50 text-green-800 border-green-200',
      cancelado: 'bg-red-50 text-red-800 border-red-200'
    };
    return (
      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border rounded-xs ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <section className="bg-brand-creme/50 min-h-[85vh] py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Admin Frame Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-brand-creme pb-6 mb-8 gap-4">
          <div>
            <h1 className="font-serif text-3xl font-light text-brand-charcoal">Painel de Negócios</h1>
            <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold font-bold">Gestão Doce Aroma • Atendimento de Pedidos</p>
          </div>
          
          <button
            id="btn_admin_logout"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors px-4 py-2.5 font-semibold uppercase tracking-wider rounded-sm cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do Painel</span>
          </button>
        </div>

        {/* Tab Controllers navigation block */}
        <div className="flex overflow-x-auto gap-2 pb-4 border-b border-brand-creme/60 mb-8 no-scrollbar">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-5 py-3 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'dashboard' ? 'border-brand-gold text-brand-gold font-bold' : 'border-transparent text-brand-charcoal/60 hover:text-brand-gold'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-3 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'products' ? 'border-brand-gold text-brand-gold font-bold' : 'border-transparent text-brand-charcoal/60 hover:text-brand-gold'
            }`}
          >
            <Package className="w-4 h-4" />
            Produtos ({products.length})
          </button>

          <button
            id="tab_btn_filters"
            onClick={() => setActiveTab('filters')}
            className={`px-5 py-3 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'filters' ? 'border-brand-gold text-brand-gold font-bold' : 'border-transparent text-brand-charcoal/60 hover:text-brand-gold'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros ({categories.length})
          </button>

          <button
            id="tab_btn_testimonials"
            onClick={() => setActiveTab('testimonials')}
            className={`px-5 py-3 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'testimonials' ? 'border-brand-gold text-brand-gold font-bold' : 'border-transparent text-brand-charcoal/60 hover:text-brand-gold'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Depoimentos ({testimonials.length})
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-3 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'orders' ? 'border-brand-gold text-brand-gold font-bold' : 'border-transparent text-brand-charcoal/60 hover:text-brand-gold'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Pedidos ({orders.length})
          </button>
          
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-5 py-3 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'customers' ? 'border-brand-gold text-brand-gold font-bold' : 'border-transparent text-brand-charcoal/60 hover:text-brand-gold'
            }`}
          >
            <Users className="w-4 h-4" />
            Clientes ({customers.length})
          </button>
        </div>

        {/* CONTENT SWITCH BOARD */}
        
        {isLoading ? (
          <div className="text-center py-24 bg-white border border-brand-creme shadow-sm rounded-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold mx-auto mb-4"></div>
            <p className="font-serif italic text-base text-brand-charcoal/60">Carregando painel...</p>
          </div>
        ) : (
          <>
            {/* 1. VIEW TAB: DASHBOARD */}
            {activeTab === 'dashboard' && stats && (
              <div className="space-y-8">
                
                {/* Highlights Card row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total sales card */}
                  <div className="bg-white p-6 border border-brand-creme rounded-sm shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-brand-charcoal/50 uppercase tracking-widest block mb-1">Total Faturado</span>
                      <span className="font-serif text-2xl text-brand-charcoal font-semibold">
                        R$ {stats.totalSales.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full text-green-700">
                      <DollarSign className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Orders card */}
                  <div className="bg-white p-6 border border-brand-creme rounded-sm shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-brand-charcoal/50 uppercase tracking-widest block mb-1">Total Pedidos</span>
                      <span className="font-serif text-2xl text-brand-charcoal font-semibold">
                        {stats.ordersCount}
                      </span>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full text-blue-700">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Average Ticket */}
                  <div className="bg-white p-6 border border-brand-creme rounded-sm shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-brand-charcoal/50 uppercase tracking-widest block mb-1">Ticket Médio</span>
                      <span className="font-serif text-2xl text-brand-charcoal font-semibold">
                        R$ {stats.averageTicket.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-full text-purple-700">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Low Stock count indicator */}
                  <button
                    onClick={() => setActiveTab('products')}
                    className="bg-white p-6 border border-brand-creme rounded-sm shadow-xs flex items-center justify-between text-left hover:border-brand-gold transition-colors focus:outline-none cursor-pointer"
                  >
                    <div>
                      <span className="text-[10px] text-brand-charcoal/50 uppercase tracking-widest block mb-1">Estoque Crítico</span>
                      <span className={`font-serif text-2xl font-semibold ${stats.lowStockCount > 0 ? 'text-red-700' : 'text-brand-charcoal'}`}>
                        {stats.lowStockCount} itens
                      </span>
                    </div>
                    <div className={`p-3 rounded-full ${stats.lowStockCount > 0 ? 'bg-red-50 text-red-700 animate-pulse' : 'bg-green-50 text-green-700'}`}>
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                  </button>
                </div>

                {/* Charts Block Representation */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Revenue History representation bar styled pure CSS */}
                  <div className="bg-white p-6 border border-brand-creme rounded-sm shadow-xs overflow-hidden">
                    <h3 className="font-serif text-base text-brand-charcoal font-semibold mb-6 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-gold" />
                      Faturamento Diário Recente
                    </h3>
                    
                    <div className="overflow-x-auto no-scrollbar pb-1">
                      <div className="h-64 flex items-end gap-2 sm:gap-3 pt-6 border-b border-brand-creme px-2 min-w-[460px] md:min-w-0">
                        {stats.salesHistory.map((day, idx) => {
                          const maxAmt = Math.max(...stats.salesHistory.map(h => h.amount), 1);
                          const percentHeight = Math.max(5, (day.amount / maxAmt) * 100);
                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                              {/* Hover tooltip */}
                              <span className="absolute -top-10 bg-brand-charcoal text-brand-beige text-[9px] px-2 py-1 rounded-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-md">
                                R$ {day.amount.toFixed(2)} ({day.count} ped.)
                              </span>
                              
                              {/* CSS Bar */}
                              <div 
                                style={{ height: `${percentHeight}%` }} 
                                className="w-full bg-brand-olive group-hover:bg-brand-gold transition-all duration-300 rounded-t-sm"
                              ></div>
                              
                              <span className="text-[9px] text-[#A68A64] uppercase tracking-wider mt-2.5 truncate font-bold">
                                {day.date}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Distribution of Revenue across Order Status */}
                  <div className="bg-white p-6 border border-brand-creme rounded-sm shadow-xs">
                    <h3 className="font-serif text-base text-brand-charcoal font-semibold mb-6">
                      Faturamento por Status do Pedido
                    </h3>
                    
                    <div className="space-y-4">
                      {(Object.keys(stats.salesByStatus) as OrderStatus[]).map(status => {
                        const amount = stats.salesByStatus[status] || 0;
                        const sumRevenue = stats.totalSales || 1;
                        const percentRatio = Math.min(100, (amount / sumRevenue) * 100);
                        
                        const colorClass: Record<OrderStatus, string> = {
                          pendente: 'bg-yellow-500',
                          confirmado: 'bg-blue-500',
                          produção: 'bg-purple-500',
                          entregue: 'bg-green-500',
                          cancelado: 'bg-red-500'
                        };

                        return (
                          <div key={status} className="space-y-1">
                            <div className="flex justify-between items-baseline text-xs">
                              <span className="capitalize font-medium text-brand-charcoal/80">{status}</span>
                              <span className="font-serif text-xs font-semibold">
                                R$ {amount.toFixed(2)} ({percentRatio.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-brand-creme overflow-hidden">
                              <div 
                                style={{ width: `${percentRatio}%` }} 
                                className={`h-full ${colorClass[status]}`}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Low inventory items alerts panel */}
                {stats.lowStockCount > 0 && (
                  <div className="bg-red-50 border border-red-200 text-red-900 rounded-sm p-5">
                    <h4 className="flex items-center gap-2 font-serif text-sm font-semibold mb-3">
                      <AlertTriangle className="w-4 h-4 text-red-700 animate-bounce" />
                      ALERTA: Itens abaixo da margem segura de estoque (&lt; 5 unidades)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {products.filter(p => p.stock < 5 && p.active).map(p => (
                        <div key={p.id} className="bg-white p-3 border border-red-100 rounded-xs flex justify-between items-center text-xs">
                          <div>
                            <p className="font-medium text-brand-charcoal">{p.name}</p>
                            <p className="text-[10px] text-brand-gold uppercase tracking-wider mt-0.5">Aroma: {p.aroma}</p>
                          </div>
                          <span className="font-bold text-red-700 bg-red-100/50 px-2.5 py-1 rounded-sm border border-red-100">
                            {p.stock} un. restantes
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent activity Lists */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Top Sellers Table list */}
                  <div className="lg:col-span-12 xl:col-span-5 bg-white p-6 border border-brand-creme rounded-sm shadow-xs">
                    <h3 className="font-serif text-base text-brand-charcoal font-semibold mb-4">
                      Produtos Campeões de Venda
                    </h3>
                    
                    {/* Desktop Version table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-brand-creme text-brand-charcoal/50 text-[10px] uppercase tracking-wider">
                            <th className="py-2 font-semibold">Produto</th>
                            <th className="py-2 text-center font-semibold">Qtd. Vendida</th>
                            <th className="py-2 text-right font-semibold">Recebidos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.topSellers.map((item, id) => (
                            <tr key={id} className="border-b border-brand-creme/50 last:border-0 mr-4">
                              <td className="py-3 font-medium text-brand-charcoal">{item.name}</td>
                              <td className="py-3 text-center font-bold text-brand-olive">{item.quantity} un.</td>
                              <td className="py-3 text-right font-serif">R$ {item.revenue.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Version Card flow */}
                    <div className="block md:hidden divide-y divide-brand-creme/60">
                      {stats.topSellers.map((item, id) => (
                        <div key={id} className="py-3 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-brand-charcoal">{item.name}</p>
                            <span className="text-[10px] text-brand-charcoal/50">Qtd: {item.quantity} un.</span>
                          </div>
                          <p className="font-serif font-bold text-brand-olive text-sm">
                            R$ {item.revenue.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Orders table summary list */}
                  <div className="lg:col-span-12 xl:col-span-7 bg-white p-6 border border-brand-creme rounded-sm shadow-xs">
                    <h3 className="font-serif text-base text-brand-charcoal font-semibold mb-4">
                      Últimos Pedidos Recebidos
                    </h3>
                    
                    {/* Desktop Version table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-brand-creme text-brand-charcoal/50 text-[10px] uppercase tracking-wider">
                            <th className="py-2 font-semibold">Pedido ID</th>
                            <th className="py-2 font-semibold">Cliente</th>
                            <th className="py-2 font-semibold">Total</th>
                            <th className="py-2 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recentOrders.map(order => (
                            <tr key={order.id} className="border-b border-brand-creme/50 last:border-0 hover:bg-brand-creme/20">
                              <td className="py-3 font-semibold text-brand-olive">{order.id}</td>
                              <td className="py-3">
                                <p className="font-medium text-brand-charcoal leading-none mb-1">{order.customer.name}</p>
                                <p className="text-[10px] text-brand-charcoal/40 font-light">{order.customer.phone}</p>
                              </td>
                              <td className="py-3 font-serif">R$ {order.total.toFixed(2)}</td>
                              <td className="py-3">{getStatusBadge(order.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Version Card flow */}
                    <div className="block md:hidden divide-y divide-brand-creme/60">
                      {stats.recentOrders.map(order => (
                        <div key={order.id} className="py-3.5 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-brand-olive font-mono text-xs">{order.id}</span>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="flex justify-between items-end text-xs">
                            <div>
                              <p className="font-bold text-brand-charcoal text-sm">{order.customer.name}</p>
                              <p className="text-[10px] text-brand-charcoal/40 font-light mt-0.5">{order.customer.phone}</p>
                            </div>
                            <span className="font-serif font-bold text-brand-charcoal text-sm">
                              R$ {order.total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 2. VIEW TAB: PRODUCTS CRUD */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                
                {/* Options panel */}
                <div className="flex justify-between items-center border-b border-brand-creme/60 pb-4">
                  <span className="text-xs text-brand-charcoal/60">Lista completa dos sabonetes no site</span>
                  <button
                    id="btn_admin_add_product"
                    onClick={() => setEditingProduct({})}
                    className="flex items-center gap-1.5 bg-brand-olive hover:bg-brand-olive-hover text-brand-beige px-4 py-2.5 text-xs font-semibold uppercase tracking-widest rounded-sm focus:outline-none cursor-pointer duration-300"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Sabonete</span>
                  </button>
                </div>

                {/* Products Administration Grid list */}
                <div className="bg-white border border-brand-creme shadow-sm rounded-sm overflow-hidden">
                  {/* Desktop Table format: hidden on mobile */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-brand-creme/40 border-b border-brand-creme text-brand-charcoal/50 text-[10px] uppercase tracking-wider">
                          <th className="py-4 px-6 font-semibold">Imagem / Nome</th>
                          <th className="py-4 px-4 font-semibold">Categoria / Aroma</th>
                          <th className="py-4 px-4 font-semibold">Preço (R$)</th>
                          <th className="py-4 px-4 font-semibold text-center">Peso</th>
                          <th className="py-4 px-4 font-semibold text-center">Es. Atual</th>
                          <th className="py-4 px-4 font-semibold text-center">Destaque</th>
                          <th className="py-4 px-4 font-semibold text-center">Ativo</th>
                          <th className="py-4 px-6 text-right font-semibold">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(p => {
                          const isLow = p.stock < 5;
                          return (
                            <tr key={p.id} className="border-b border-brand-creme last:border-0 hover:bg-brand-creme/10 transition-colors">
                              {/* Name with Image */}
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-zinc-50 border border-brand-creme rounded-xs overflow-hidden shrink-0">
                                    <img
                                      src={p.image}
                                      alt={p.name}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-bold text-brand-charcoal text-sm leading-tight">{p.name}</p>
                                    <p className="text-[10px] text-brand-charcoal/40 font-light mt-1 line-clamp-1 max-w-[200px]" title={p.description}>
                                      {p.description}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="py-4 px-4">
                                <span className="bg-brand-creme text-brand-gold text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 border border-brand-creme rounded-xs">
                                  {p.category}
                                </span>
                                <p className="text-[10px] text-brand-charcoal/50 italic mt-1.5">{p.aroma}</p>
                              </td>

                              <td className="py-4 px-4 font-serif font-semibold text-sm">
                                {p.promotion && p.salePrice ? (
                                  <div>
                                    <span className="text-red-600 block leading-none">R$ {p.salePrice.toFixed(2)}</span>
                                    <span className="text-[9px] text-brand-charcoal/40 line-through">R$ {p.price.toFixed(2)}</span>
                                  </div>
                                ) : (
                                  <span>R$ {p.price.toFixed(2)}</span>
                                )}
                              </td>

                              <td className="py-4 px-4 text-center font-bold text-brand-charcoal">
                                {p.weight}
                              </td>

                              <td className="py-4 px-4 text-center">
                                <span className={`font-mono text-sm font-bold px-2.5 py-1 border rounded-xs ${
                                  p.stock === 0 ? 'bg-red-50 text-red-800 border-red-200' :
                                  isLow ? 'bg-yellow-50 text-yellow-800 border-yellow-200 animate-pulse' :
                                  'bg-green-50 text-green-800 border-green-200'
                                }`}>
                                  {p.stock} un.
                                </span>
                              </td>

                              {/* Toggle Highlights */}
                              <td className="py-4 px-4 text-center">
                                <button
                                  id={`btn_toggle_featured_${p.id}`}
                                  onClick={() => handleToggleProductProp(p, 'featured')}
                                  className={`p-1.5 rounded-full border focus:outline-none transition-colors cursor-pointer ${
                                    p.featured 
                                      ? 'bg-brand-olive border-brand-olive text-white' 
                                      : 'bg-white border-brand-creme hover:border-brand-gold text-brand-charcoal/20 hover:text-brand-gold'
                                  }`}
                                  title={p.featured ? "Remover destaque" : "Destacar na home"}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              </td>

                              {/* Toggle Active listing */}
                              <td className="py-4 px-4 text-center">
                                <button
                                  id={`btn_toggle_active_${p.id}`}
                                  onClick={() => handleToggleProductProp(p, 'active')}
                                  className={`p-1.5 rounded-full border focus:outline-none transition-colors cursor-pointer ${
                                    p.active 
                                      ? 'bg-brand-olive border-brand-olive text-white' 
                                      : 'bg-white border-brand-creme hover:border-brand-gold text-brand-charcoal/20 hover:text-brand-gold'
                                  }`}
                                  title={p.active ? "Desativar produto" : "Ativar produto"}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              </td>

                              {/* Action Tools */}
                              <td className="py-4 px-6 text-right space-x-1 whitespace-nowrap">
                                <button
                                  id={`btn_edit_product_${p.id}`}
                                  onClick={() => setEditingProduct(p)}
                                  className="p-2 border border-brand-creme/80 bg-white hover:bg-brand-creme text-brand-charcoal hover:text-brand-gold rounded-xs shadow-xs focus:outline-none transition-colors cursor-pointer inline-flex items-center"
                                  title="Editar Produto"
                                >
                                  <Edit3 className="w-4 h-4 stroke-[1.5]" />
                                </button>
                                
                                <button
                                  id={`btn_delete_product_${p.id}`}
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 rounded-xs shadow-xs focus:outline-none transition-colors cursor-pointer inline-flex items-center"
                                  title="Excluir Produto"
                                >
                                  <Trash2 className="w-4 h-4 stroke-[1.5]" />
                                </button>
                              </td>

                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards Format: visible only on small screens */}
                  <div className="block md:hidden divide-y divide-brand-creme">
                    {products.map(p => {
                      const isLow = p.stock < 5;
                      return (
                        <div key={p.id} className="p-4 space-y-4 bg-white">
                          <div className="flex gap-4">
                            <div className="w-16 h-16 bg-zinc-50 border border-brand-creme rounded-xs overflow-hidden shrink-0">
                              <img
                                src={p.image}
                                alt={p.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-brand-charcoal text-base leading-tight truncate">{p.name}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                <span className="bg-brand-creme text-brand-gold text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 border border-brand-creme rounded-xs">
                                  {p.category}
                                </span>
                                <span className="text-[10px] text-brand-charcoal/50 italic">{p.aroma}</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-xs py-2.5 border-y border-brand-creme/50 bg-brand-creme/5 px-2 rounded-xs">
                            <div>
                              <span className="text-[9px] text-brand-charcoal/40 uppercase block mb-0.5 font-bold">Preço</span>
                              {p.promotion && p.salePrice ? (
                                <div className="leading-tight">
                                  <span className="text-red-600 font-bold block">R$ {p.salePrice.toFixed(2)}</span>
                                  <span className="text-[9px] text-brand-charcoal/40 line-through">R$ {p.price.toFixed(2)}</span>
                                </div>
                              ) : (
                                <span className="font-bold text-brand-charcoal">R$ {p.price.toFixed(2)}</span>
                              )}
                            </div>
                            <div>
                              <span className="text-[9px] text-brand-charcoal/40 uppercase block mb-0.5 font-bold">Peso</span>
                              <span className="font-medium text-brand-charcoal">{p.weight}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-brand-charcoal/40 uppercase block mb-0.5 font-bold">Estoque</span>
                              <span className={`font-mono text-xs font-bold px-1.5 py-0.5 border rounded-xs ${
                                p.stock === 0 ? 'bg-red-50 text-red-800 border-red-200' :
                                isLow ? 'bg-yellow-50 text-yellow-800 border-yellow-200 animate-pulse' :
                                'bg-green-50 text-green-800 border-green-200'
                              }`}>
                                {p.stock} un.
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4 pt-1">
                            <div className="flex gap-4 items-center">
                              {/* Destaque Toggle */}
                              <button
                                onClick={() => handleToggleProductProp(p, 'featured')}
                                className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                                  p.featured 
                                    ? 'bg-brand-olive/10 border-brand-olive text-brand-olive font-bold' 
                                    : 'bg-white border-brand-creme text-brand-charcoal/40'
                                }`}
                              >
                                <Check className="w-3 h-3" />
                                <span>Destaque</span>
                              </button>

                              {/* Ativo Toggle */}
                              <button
                                onClick={() => handleToggleProductProp(p, 'active')}
                                className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                                  p.active 
                                    ? 'bg-brand-olive/10 border-brand-olive text-brand-olive font-bold' 
                                    : 'bg-white border-brand-creme text-brand-charcoal/40'
                                }`}
                              >
                                <Check className="w-3 h-3" />
                                <span>Ativo</span>
                              </button>
                            </div>

                            <div className="flex gap-2">
                              {/* Edit */}
                              <button
                                onClick={() => setEditingProduct(p)}
                                className="p-2 border border-brand-creme/80 bg-white text-brand-charcoal active:bg-brand-creme rounded-xs shadow-xs inline-flex items-center"
                              >
                                <Edit3 className="w-4 h-4 stroke-[1.5]" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-2 border border-red-200 bg-red-50 text-red-700 active:bg-red-100 rounded-xs shadow-xs inline-flex items-center"
                              >
                                <Trash2 className="w-4 h-4 stroke-[1.5]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* EDITING & SAVING MODAL DIALOG */}
                {editingProduct && (
                  <div className="fixed inset-0 z-50 bg-brand-charcoal/50 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div 
                      id="edit_product_modal"
                      className="bg-[#FDFBF7] w-full max-w-lg shadow-2xl rounded-sm border border-brand-creme overflow-hidden max-h-[90vh] flex flex-col animate-scale"
                    >
                      {/* Modal Header */}
                      <div className="px-6 py-4 border-b border-brand-creme flex justify-between items-center bg-white">
                        <h3 className="font-serif text-lg text-brand-charcoal font-semibold">
                          {editingProduct.id ? 'Editar Sabonete' : 'Novo Sabonete Artesanal'}
                        </h3>
                        <button
                          id="btn_edit_product_close"
                          onClick={() => setEditingProduct(null)}
                          className="p-1.5 hover:bg-brand-creme text-brand-charcoal rounded-full focus:outline-none cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Modal Body Scroll form */}
                      <form onSubmit={handleSaveProductSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                        
                        {/* Name */}
                        <div>
                          <label className="block uppercase tracking-wider text-[10px] text-brand-charcoal mb-1 font-bold">Nome do Produto</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Sabonete de Rosas Francesas"
                            value={editingProduct.name || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                            className="w-full text-xs bg-white border border-brand-creme px-3 py-2.5 outline-none focus:border-brand-gold transition-colors text-brand-charcoal font-medium"
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block uppercase tracking-wider text-[10px] text-brand-charcoal mb-1 font-bold">Descrição Completa</label>
                          <textarea
                            required
                            rows={3}
                            placeholder="Descreva as propriedades fitoterápicas, aromas e cuidados..."
                            value={editingProduct.description || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                            className="w-full text-xs bg-white border border-brand-creme px-3 py-2 outline-none focus:border-brand-gold transition-colors text-brand-charcoal resize-none font-medium"
                          ></textarea>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Category */}
                          <div>
                            <label className="block uppercase tracking-wider text-[10px] text-brand-charcoal mb-1 font-bold">Categoria</label>
                            <select
                              value={editingProduct.category || (categories[0] || 'Lavanda')}
                              onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                              className="w-full text-xs bg-white border border-brand-creme px-3 py-2.5 outline-none focus:border-brand-gold text-brand-charcoal font-medium cursor-pointer"
                            >
                              {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>

                          {/* Weight */}
                          <div>
                            <label className="block uppercase tracking-wider text-[10px] text-brand-charcoal mb-1 font-bold">Peso líquido</label>
                            <input
                              type="text"
                              required
                              placeholder="Ex: 110g"
                              value={editingProduct.weight || ''}
                              onChange={(e) => setEditingProduct({ ...editingProduct, weight: e.target.value })}
                              className="w-full text-xs bg-white border border-brand-creme px-3 py-2.5 outline-none focus:border-brand-gold transition-colors text-brand-charcoal font-medium"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Fragrance Aroma */}
                          <div>
                            <label className="block uppercase tracking-wider text-[10px] text-brand-charcoal mb-1 font-bold">Fragrância / Aroma</label>
                            <input
                              type="text"
                              required
                              placeholder="Ex: Cítrico & Floral"
                              value={editingProduct.aroma || ''}
                              onChange={(e) => setEditingProduct({ ...editingProduct, aroma: e.target.value })}
                              className="w-full text-xs bg-white border border-brand-creme px-3 py-2.5 outline-none focus:border-brand-gold transition-colors text-brand-charcoal font-medium"
                            />
                          </div>

                          {/* Current Inventory Stock count */}
                          <div>
                            <label className="block uppercase tracking-wider text-[10px] text-brand-charcoal mb-1 font-bold">Estoque Inicial</label>
                            <input
                              type="number"
                              required
                              min="0"
                              placeholder="10"
                              value={editingProduct.stock === undefined ? '' : editingProduct.stock}
                              onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                              className="w-full text-xs bg-white border border-brand-creme px-3 py-2.5 outline-none focus:border-brand-gold transition-colors text-brand-charcoal font-medium"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Price */}
                          <div>
                            <label className="block uppercase tracking-wider text-[10px] text-brand-charcoal mb-1 font-bold">Preço de Venda (R$)</label>
                            <input
                              type="number"
                              step="0.01"
                              required
                              min="0"
                              placeholder="18.00"
                              value={editingProduct.price === undefined ? '' : editingProduct.price}
                              onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                              className="w-full text-xs bg-white border border-brand-creme px-3 py-2.5 outline-none focus:border-brand-gold transition-colors text-brand-charcoal font-medium"
                            />
                          </div>

                          {/* Discount Price */}
                          <div>
                            <label className="block uppercase tracking-wider text-[10px] text-brand-charcoal mb-1 font-bold">Preço Promocional (R$)</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Ex: 14.00"
                              value={editingProduct.salePrice === undefined ? '' : editingProduct.salePrice}
                              onChange={(e) => setEditingProduct({ ...editingProduct, salePrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                              className="w-full text-xs bg-white border border-brand-creme px-3 py-2.5 outline-none focus:border-brand-gold transition-colors text-brand-charcoal font-medium"
                            />
                          </div>
                        </div>

                        {/* Image selection / Upload */}
                        <div className="space-y-2">
                          <label className="block uppercase tracking-wider text-[10px] text-brand-charcoal mb-1 font-bold">Imagem do Produto (Celular ou Computador)</label>
                          
                          {/* Selected image preview */}
                          {editingProduct.image && (
                            <div className="relative w-28 h-28 border border-brand-creme bg-brand-creme/10 rounded-sm overflow-hidden flex items-center justify-center group mb-2 shadow-xs">
                              <img
                                src={editingProduct.image}
                                alt="Previa"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => setEditingProduct({ ...editingProduct, image: '' })}
                                className="absolute top-1 right-1 w-6 h-6 bg-red-600/90 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-sm focus:outline-none cursor-pointer"
                                title="Remover imagem"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row gap-3">
                            {/* Device upload button link */}
                            <label className="flex-1 flex flex-col items-center justify-center px-4 py-5 border-2 border-dashed border-brand-creme/80 hover:border-brand-gold bg-brand-creme/5 hover:bg-brand-creme/20 rounded-sm cursor-pointer transition-all duration-200 text-center select-none group">
                              <Plus className="w-5 h-5 text-brand-gold group-hover:scale-110 transition-transform duration-200 mb-1.5" />
                              <span className="text-[11px] font-bold text-brand-charcoal uppercase tracking-widest leading-none">Anexar da Galeria</span>
                              <span className="text-[9px] text-brand-charcoal/50 font-light mt-1">Celular ou Computador</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      if (event.target && event.target.result) {
                                        setEditingProduct({
                                          ...editingProduct,
                                          image: event.target.result as string
                                        });
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>

                            {/* Or use manual URL input as fallback */}
                            <div className="flex-1 flex flex-col justify-center space-y-1 bg-white border border-brand-creme/60 p-3.5 rounded-sm">
                              <span className="text-[9px] uppercase tracking-widest text-brand-charcoal/40 font-bold block">Ou use link da internet:</span>
                              <input
                                type="url"
                                placeholder="https://exemplo.com/sabonete.png"
                                value={editingProduct.image && !editingProduct.image.startsWith('data:') ? editingProduct.image : ''}
                                onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                                className="w-full text-[11px] bg-brand-creme/15 border border-brand-creme/60 focus:border-brand-gold outline-none p-2 font-medium"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Booleans Row */}
                        <div className="flex justify-between items-center border border-brand-creme bg-brand-beige/50 p-4 font-bold my-4 rounded-xs">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!editingProduct.featured}
                              onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                              className="w-4 h-4 accent-brand-olive cursor-pointer"
                            />
                            <span>Destacado</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingProduct.active !== false}
                              onChange={(e) => setEditingProduct({ ...editingProduct, active: e.target.checked })}
                              className="w-4 h-4 accent-brand-olive cursor-pointer"
                            />
                            <span>Ativo Site</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!editingProduct.promotion}
                              onChange={(e) => setEditingProduct({ ...editingProduct, promotion: e.target.checked })}
                              className="w-4 h-4 accent-brand-olive cursor-pointer"
                            />
                            <span>Em Promoção</span>
                          </label>
                        </div>

                        {/* Form Submit bar */}
                        <div className="border-t border-brand-creme pt-4 flex gap-4 mt-6">
                          <button
                            type="button"
                            onClick={() => setEditingProduct(null)}
                            className="flex-1 border border-brand-creme hover:bg-brand-creme text-brand-charcoal hover:border-brand-gold py-3 text-xs uppercase tracking-widest font-semibold transition-colors rounded-sm cursor-pointer"
                          >
                            Voltar
                          </button>
                          <button
                            type="submit"
                            id="btn_submit_product_save"
                            disabled={isSavingProduct}
                            className="flex-1 bg-brand-olive hover:bg-brand-olive-hover disabled:bg-brand-creme text-brand-beige py-3 text-xs uppercase tracking-widest font-semibold rounded-sm focus:outline-none cursor-pointer duration-300"
                          >
                            {isSavingProduct ? 'Gravando...' : 'Gravar Sabonete'}
                          </button>
                        </div>

                      </form>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* VIEW TAB: FILTERS MANAGEMENT */}
            {activeTab === 'filters' && (
              <div className="space-y-6">
                <div className="text-left max-w-xl">
                  <h3 className="font-serif text-xl font-light text-brand-charcoal">Filtros de Paleta / Categorias</h3>
                  <p className="text-xs text-brand-charcoal/60 mt-1">Crie, edite ou exclua os filtros que aparecem na barra do catálogo principal do site.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Left: Create New Category Card */}
                  <div className="bg-white p-6 border border-brand-creme rounded-sm shadow-xs h-fit space-y-4">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-brand-gold border-b border-brand-creme pb-2">Novo Filtro</h4>
                    <form onSubmit={handleAddCategorySubmit} className="space-y-3">
                      <div>
                        <label className="text-[10px] text-brand-charcoal/50 uppercase tracking-widest block mb-1">Nome do Filtro</label>
                        <input
                          type="text"
                          required
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Ex: Facial, Argila, etc."
                          className="w-full text-xs bg-brand-pink-light/30 border border-brand-creme px-3 py-2 outline-none focus:border-brand-gold transition-colors text-brand-charcoal font-medium"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-brand-olive hover:bg-brand-olive-hover text-brand-beige py-2.5 text-xs uppercase tracking-widest font-semibold rounded-sm duration-300 transition-colors pointer-events-auto cursor-pointer"
                      >
                        Criar Filtro
                      </button>
                    </form>
                  </div>

                  {/* Right: List and Edit Categories */}
                  <div className="md:col-span-2 bg-white border border-brand-creme rounded-sm shadow-xs overflow-hidden">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-brand-creme/40 border-b border-brand-creme text-brand-charcoal/50 text-[10px] uppercase tracking-wider">
                          <th className="py-4 px-6 font-semibold">Nome do Filtro</th>
                          <th className="py-4 px-4 font-semibold text-center w-36">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map(cat => {
                          const isEditingThis = editingCategoryOldName === cat;
                          return (
                            <tr key={cat} className="border-b border-brand-creme last:border-0 hover:bg-brand-creme/10 transition-colors">
                              <td className="py-4 px-6">
                                {isEditingThis ? (
                                  <form onSubmit={handleUpdateCategorySubmit} className="flex gap-2 items-center">
                                    <input
                                      type="text"
                                      required
                                      value={editingCategoryNewName}
                                      onChange={(e) => setEditingCategoryNewName(e.target.value)}
                                      className="text-xs bg-brand-pink-light border border-brand-creme px-3 py-1.5 outline-none focus:border-brand-gold transition-colors text-brand-charcoal font-medium"
                                    />
                                    <button
                                      type="submit"
                                      className="p-1 px-2.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-sm text-[10px] font-bold"
                                    >
                                      Salvar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingCategoryOldName(null)}
                                      className="p-1 px-2.5 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-sm text-[10px] font-bold"
                                    >
                                      Cancelar
                                    </button>
                                  </form>
                                ) : (
                                  <span className="font-bold text-brand-charcoal text-sm">{cat}</span>
                                )}
                              </td>
                              <td className="py-4 px-4 text-center">
                                <div className="flex gap-2 justify-center">
                                  {!isEditingThis && (
                                    <button
                                      onClick={() => {
                                        setEditingCategoryOldName(cat);
                                        setEditingCategoryNewName(cat);
                                      }}
                                      className="p-1.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded-xs cursor-pointer"
                                      title="Renomear filtro"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteCategory(cat)}
                                    className="p-1.5 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 rounded-xs cursor-pointer"
                                    title="Excluir filtro"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW TAB: TESTIMONIALS MODERATION */}
            {activeTab === 'testimonials' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-brand-creme/60 pb-4">
                  <div>
                    <h3 className="font-serif text-xl font-light text-brand-charcoal">Depoimentos de Clientes</h3>
                    <p className="text-xs text-brand-charcoal/60 mt-0.5">Gerencie os depoimentos e avaliações que validam a marca.</p>
                  </div>
                  <button
                    onClick={() => setEditingTestimonial({})}
                    className="flex items-center gap-1.5 bg-brand-olive hover:bg-brand-olive-hover text-brand-beige px-4 py-2.5 text-xs font-semibold uppercase tracking-widest rounded-sm focus:outline-none cursor-pointer duration-300"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Depoimento</span>
                  </button>
                </div>

                {isLoadingTestimonials ? (
                  <div className="text-center py-20 bg-white border border-brand-creme shadow-sm rounded-sm">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold mx-auto mb-4"></div>
                    <p className="font-serif italic text-sm text-brand-charcoal/60">Buscando depoimentos...</p>
                  </div>
                ) : testimonials.length === 0 ? (
                  <div className="text-center py-20 bg-white border border-brand-creme rounded-sm">
                    <p className="font-serif italic text-lg text-brand-charcoal/50">Nenhum depoimento cadastrado</p>
                    <p className="text-xs text-brand-charcoal/40 mt-1">Clique em "Adicionar Depoimento" para começar.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map(item => (
                      <div key={item.id} className="bg-white border border-brand-creme p-6 rounded-sm shadow-xs relative flex flex-col justify-between space-y-4">
                        <div className="space-y-3 prose text-left">
                          {/* Header of review card */}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-brand-pink-light border border-brand-creme">
                              <img
                                src={item.avatar}
                                alt={item.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-bold text-brand-charcoal text-xs leading-none">{item.name}</p>
                              <p className="text-[10px] text-brand-charcoal/50 font-light mt-1">{item.city}</p>
                            </div>
                          </div>

                          {/* Star rating display */}
                          <div className="flex gap-0.5 text-brand-gold mt-1.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < item.stars ? 'fill-brand-gold text-brand-gold' : 'text-brand-creme/60 fill-brand-creme/20'
                                }`}
                              />
                            ))}
                          </div>

                          {/* Review Quotes */}
                          <p className="text-xs leading-relaxed text-brand-charcoal/80 font-light italic mt-2">
                            "{item.quote}"
                          </p>
                        </div>

                        {/* Approved Toggle and Action Buttons at bottom of review card */}
                        <div className="border-t border-brand-creme/50 pt-4 flex justify-between items-center bg-zinc-50/50 -mx-6 -mb-6 p-4 rounded-b-sm border-dashed">
                          {/* Visibility toggle check */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleTestimonialApproved(item)}
                              className={`flex items-center gap-1.5 px-3 py-1 font-bold text-[9px] uppercase tracking-wider rounded-full border transition-colors cursor-pointer ${
                                item.approved
                                  ? 'bg-green-50 border-green-200 text-green-700'
                                  : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                              }`}
                            >
                              <CheckCircle className={`w-3 h-3 ${item.approved ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
                              <span>{item.approved ? 'Aprovado' : 'Pendente'}</span>
                            </button>
                          </div>

                          {/* Edit / Remove buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingTestimonial(item)}
                              className="p-1 px-2.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded-sm text-xs font-bold transition-colors cursor-pointer"
                              title="Editar depoimento"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteTestimonial(item.id)}
                              className="p-1 px-2.5 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 rounded-sm text-xs font-bold transition-colors cursor-pointer"
                              title="Excluir depoimento"
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* TESTIMONIAL EDIT MODAL DRAW-DRAWER */}
                {editingTestimonial && (
                  <div className="fixed inset-0 z-50 bg-brand-charcoal/40 backdrop-blur-xs flex items-center justify-end">
                    <div className="w-full max-w-md bg-white h-screen shadow-2xl flex flex-col justify-between animate-slide-left border-l border-brand-creme">
                      {/* Modal Header */}
                      <div className="p-6 border-b border-brand-creme flex justify-between items-center bg-brand-beige/20">
                        <div>
                          <h3 className="font-serif text-lg font-light text-brand-charcoal">
                            {editingTestimonial.id ? 'Editar Depoimento' : 'Novo Depoimento'}
                          </h3>
                          <p className="text-[10px] text-brand-gold uppercase tracking-widest font-bold mt-1">Registro de Avaliações Doce Aroma</p>
                        </div>
                        <button
                          onClick={() => setEditingTestimonial(null)}
                          className="p-1.5 bg-brand-pink-light hover:bg-red-50 text-brand-charcoal hover:text-red-700 rounded-full transition-colors focus:outline-none cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Modal Body */}
                      <form onSubmit={handleSaveTestimonialSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-left">
                        {/* Client Name */}
                        <div>
                          <label className="block uppercase tracking-wider text-[10px] text-brand-charcoal mb-1 font-bold">Nome do Cliente</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Amanda Silva"
                            value={editingTestimonial.name || ''}
                            onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                            className="w-full text-xs bg-white border border-brand-creme px-3 py-2.5 outline-none focus:border-brand-gold transition-colors text-brand-charcoal font-medium"
                          />
                        </div>

                        {/* Location / City */}
                        <div>
                          <label className="block uppercase tracking-wider text-[10px] text-brand-charcoal mb-1 font-bold">Cidade e Região</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: São Paulo - SP"
                            value={editingTestimonial.city || ''}
                            onChange={(e) => setEditingTestimonial({ ...editingTestimonial, city: e.target.value })}
                            className="w-full text-xs bg-white border border-brand-creme px-3 py-2.5 outline-none focus:border-brand-gold transition-colors text-brand-charcoal font-medium"
                          />
                        </div>

                        {/* Avatar Image URL */}
                        <div>
                          <label className="block uppercase tracking-wider text-[10px] text-brand-charcoal mb-1 font-bold">Foto do Cliente (URL da Imagem)</label>
                          <input
                            type="url"
                            required
                            placeholder="Insira um link de imagem (ex: Unsplash)"
                            value={editingTestimonial.avatar || ''}
                            onChange={(e) => setEditingTestimonial({ ...editingTestimonial, avatar: e.target.value })}
                            className="w-full text-xs bg-white border border-brand-creme px-3 py-2.5 outline-none focus:border-brand-gold transition-colors text-brand-charcoal font-medium"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Rating Stars select */}
                          <div>
                            <label className="block uppercase tracking-wider text-[10px] text-brand-charcoal mb-1 font-bold">Pontuação (Estrelas)</label>
                            <select
                              value={editingTestimonial.stars || 5}
                              onChange={(e) => setEditingTestimonial({ ...editingTestimonial, stars: Number(e.target.value) })}
                              className="w-full text-xs bg-white border border-brand-creme px-3 py-2.5 outline-none focus:border-brand-gold text-brand-charcoal font-medium cursor-pointer"
                            >
                              <option value="5">5 estrelas</option>
                              <option value="4">4 estrelas</option>
                              <option value="3">3 estrelas</option>
                              <option value="2">2 estrelas</option>
                              <option value="1">1 estrela</option>
                            </select>
                          </div>

                          {/* Approval Flag Checkbox */}
                          <div>
                            <label className="block uppercase tracking-wider text-[10px] text-brand-charcoal mb-1 font-bold">Status Inicial</label>
                            <select
                              value={editingTestimonial.approved === false ? 'false' : 'true'}
                              onChange={(e) => setEditingTestimonial({ ...editingTestimonial, approved: e.target.value === 'true' })}
                              className="w-full text-xs bg-white border border-brand-creme px-3 py-2.5 outline-none focus:border-brand-gold text-brand-charcoal font-medium cursor-pointer"
                            >
                              <option value="true">Aprovado (Visível)</option>
                              <option value="false">Pendente (Invisível)</option>
                            </select>
                          </div>
                        </div>

                        {/* Testimonial Quote quote text */}
                        <div>
                          <label className="block uppercase tracking-wider text-[10px] text-brand-charcoal mb-1 font-bold">Texto do Depoimento</label>
                          <textarea
                            required
                            rows={4}
                            placeholder="Depoimento descrevendo a experiência do cliente..."
                            value={editingTestimonial.quote || ''}
                            onChange={(e) => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })}
                            className="w-full text-xs bg-white border border-brand-creme px-3 py-2 outline-none focus:border-brand-gold transition-colors text-brand-charcoal resize-none font-medium"
                          ></textarea>
                        </div>

                        {/* Form Submissions */}
                        <div className="border-t border-brand-creme pt-6 flex gap-4">
                          <button
                            type="button"
                            onClick={() => setEditingTestimonial(null)}
                            className="flex-1 border border-brand-creme hover:bg-brand-creme text-brand-charcoal hover:border-brand-gold py-3 text-xs uppercase tracking-widest font-semibold transition-colors rounded-sm cursor-pointer"
                          >
                            Voltar
                          </button>
                          <button
                            type="submit"
                            disabled={isSavingTestimonial}
                            className="flex-1 bg-brand-olive hover:bg-brand-olive-hover disabled:bg-brand-creme text-brand-beige py-3 text-xs uppercase tracking-widest font-semibold rounded-sm focus:outline-none cursor-pointer duration-300"
                          >
                            {isSavingTestimonial ? 'Salvando...' : 'Gravar Depoimento'}
                          </button>
                        </div>

                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. VIEW TAB: ORDERS MANAGEMENT */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                
                {/* Visual filter options panel */}
                <div className="flex flex-wrap gap-2 pb-4 border-b border-brand-creme/60 items-center">
                  <span className="text-xs text-brand-charcoal/50 uppercase tracking-wider font-bold mr-2">Filtrar Status:</span>
                  {(['Todos', 'pendente', 'confirmado', 'produção', 'entregue'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setOrderFilter(f)}
                      className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider focus:outline-none transition-colors border rounded-sm cursor-pointer ${
                        orderFilter === f 
                          ? 'bg-brand-olive text-brand-beige border-brand-olive'
                          : 'bg-white border-brand-creme/80 hover:border-brand-gold text-brand-charcoal hover:text-brand-gold'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {/* Orders Explorer table list */}
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-20 bg-white border border-brand-creme shadow-xs rounded-sm">
                    <p className="font-serif italic text-lg text-brand-charcoal/50">Nenhum pedido correspondente encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {filteredOrders.map(order => (
                      <div 
                        key={order.id} 
                        id={`order_detailed_card_${order.id}`}
                        className="bg-white border border-brand-creme rounded-sm shadow-xs overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-brand-creme"
                      >
                        
                        {/* Column Left: Order ID, Clock date, Client details (4 / 12 width) */}
                        <div className="p-6 md:w-[35%] bg-brand-creme/10 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-base font-bold text-brand-olive">{order.id}</span>
                            {getStatusBadge(order.status)}
                          </div>
                          
                          <div className="space-y-2.5 text-xs">
                            <div className="flex items-center gap-1.5 text-brand-charcoal/50 text-[10px]">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{new Date(order.date).toLocaleDateString('pt-BR')} às {new Date(order.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            
                            <p className="font-bold text-sm text-brand-charcoal">{order.customer.name}</p>
                            <p className="font-semibold text-brand-gold hover:underline"><a href={`tel:${order.customer.phone.replace(/\D/g, '')}`}>{order.customer.phone}</a></p>
                            <p className="text-brand-charcoal/70 leading-relaxed text-[11px] font-light">🏠 {order.customer.address}</p>
                            {order.customer.observations && (
                              <p className="bg-yellow-50 text-yellow-800 text-[10px] p-2 border-l-2 border-yellow-500 italic mt-2.5">
                                Nota: "{order.customer.observations}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Column Center: Items Purchased list (5 / 12 width) */}
                        <div className="p-6 md:w-[45%] flex-1 space-y-4">
                          <h4 className="text-[9px] uppercase tracking-widest text-[#A68A64] font-bold border-b border-brand-creme pb-1.5">
                            Produtos Solicitados
                          </h4>
                          <div className="space-y-3.5 max-h-48 overflow-y-auto pr-2">
                            {order.products.map(p => (
                              <div key={p.id} className="flex justify-between items-baseline text-xs">
                                <div>
                                  <span className="font-bold text-brand-charcoal">{p.name}</span>
                                  <span className="text-[10px] block text-brand-charcoal/40 font-light italic">Aroma: {p.aroma}</span>
                                </div>
                                <span className="text-[#A68A64] shrink-0 font-medium whitespace-nowrap pl-4">
                                  {p.quantity}x • R$ {p.price.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Column Right: Billing calculations, actions, status updating (3 / 12 width) */}
                        <div className="p-6 md:w-[20%] flex flex-col justify-between space-y-5">
                          <div>
                            <span className="text-[9px] uppercase tracking-widest text-brand-charcoal/40 block mb-1">Método de pagamento:</span>
                            <span className="text-xs font-bold text-brand-charcoal">{order.customer.paymentMethod}</span>
                            
                            <div className="mt-4 pt-3 border-t border-brand-creme/40">
                              <span className="text-[10px] uppercase text-brand-charcoal/40 block">Valor Final:</span>
                              <span className="font-serif text-xl font-bold text-brand-charcoal">
                                R$ {order.total.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Status changer dropdown */}
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-brand-charcoal/50 font-bold block">Status Operacional:</label>
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                              className="w-full text-xs font-semibold bg-white border border-brand-creme/80 focus:border-brand-gold outline-none p-2 rounded-xs cursor-pointer text-brand-charcoal"
                            >
                              <option value="pendente">Pendente</option>
                              <option value="confirmado">Confirmado</option>
                              <option value="produção">Em Produção</option>
                              <option value="entregue">Entregue</option>
                            </select>

                            {/* Direct Action confirmation and completion buttons */}
                            <div className="mt-3.5 pt-3 border-t border-brand-creme/50 space-y-2">
                              {order.status === 'pendente' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateOrderStatus(order.id, 'confirmado')}
                                  className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] uppercase font-bold tracking-widest py-2 px-3 rounded-xs shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
                                  id={`btn_confirm_order_${order.id}`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Confirmar Pedido</span>
                                </button>
                              )}
                              
                              {(order.status === 'confirmado' || order.status === 'produção') && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateOrderStatus(order.id, 'entregue')}
                                  className="w-full flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] uppercase font-bold tracking-widest py-2 px-3 rounded-xs shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
                                  id={`btn_finish_order_${order.id}`}
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>Finalizar Pedido</span>
                                </button>
                              )}
                              
                              {order.status !== 'entregue' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setConfirmConfig({
                                      title: 'Excluir Pedido',
                                      message: 'Tem certeza que deseja excluir este pedido permanentemente? O estoque dos itens do pedido será restaurado.',
                                      onConfirm: () => handleUpdateOrderStatus(order.id, 'cancelado')
                                    });
                                  }}
                                  className="w-full flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-[10px] uppercase font-bold tracking-widest py-2 px-3 rounded-xs shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
                                  id={`btn_cancel_order_${order.id}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Excluir Pedido</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* 4. VIEW TAB: CUSTOMER DATABASE SUMMARY */}
            {activeTab === 'customers' && (
              <div className="space-y-4">
                {/* Desktop Version Table */}
                <div className="hidden md:block bg-white border border-brand-creme shadow-sm rounded-sm overflow-hidden text-xs text-brand-charcoal">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans">
                      <thead>
                        <tr className="bg-brand-creme/40 border-b border-brand-creme text-brand-charcoal/50 text-[10px] uppercase tracking-wider">
                          <th className="py-4 px-6 font-semibold">Cliente Nome</th>
                          <th className="py-4 px-4 font-semibold">WhatsApp de Contato</th>
                          <th className="py-4 px-4 text-center font-semibold">Total de Pedidos</th>
                          <th className="py-4 px-4 text-right font-semibold">Receita Acumulada</th>
                          <th className="py-4 px-6 text-right font-semibold">Última Compra</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((c, index) => (
                          <tr key={index} className="border-b border-brand-creme last:border-0 hover:bg-brand-creme/5">
                            <td className="py-4 px-6 font-bold text-brand-charcoal">{c.name}</td>
                            <td className="py-4 px-4 font-semibold text-brand-gold">
                              <a href={`https://wa.me/${c.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="hover:underline">
                                {c.phone}
                              </a>
                            </td>
                            <td className="py-4 px-4 text-center font-mono">
                              {c.totalOrders} ped.
                            </td>
                            <td className="py-4 px-4 text-right font-serif font-bold text-brand-olive">
                              R$ {c.totalSpent.toFixed(2)}
                            </td>
                            <td className="py-4 px-6 text-right text-brand-charcoal/60">
                              {new Date(c.lastOrderDate).toLocaleDateString('pt-BR')} às {new Date(c.lastOrderDate).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Version: stackable cards */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {customers.map((c, index) => (
                    <div key={index} className="bg-white border border-brand-creme p-4 rounded-sm space-y-3 shadow-xs text-xs text-brand-charcoal">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="font-bold text-brand-charcoal text-base leading-tight">{c.name}</h4>
                          <span className="text-[10px] text-brand-charcoal/50 mt-1 block">
                            Último pedido: {new Date(c.lastOrderDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[9px] uppercase text-brand-charcoal/40 block font-bold mb-0.5">Faturamento</span>
                          <span className="font-serif text-sm font-bold text-brand-olive">
                            R$ {c.totalSpent.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-brand-creme/60 text-xs">
                        <div>
                          <span className="text-[9px] uppercase text-brand-charcoal/40 block font-bold mb-0.5">WhatsApp</span>
                          <a 
                            href={`https://wa.me/${c.phone.replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-brand-gold font-bold hover:underline"
                          >
                            {c.phone}
                          </a>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] uppercase text-brand-charcoal/40 block font-bold mb-0.5">Pedidos</span>
                          <span className="font-mono font-bold text-brand-charcoal">{c.totalOrders} total</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* Modern, Accessible Dialog Confirmation Overlay */}
      {confirmConfig && (
        <div 
          id="custom_confirm_modal" 
          className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 z-[9999]"
        >
          <div className="bg-white border border-brand-creme rounded-sm shadow-xl max-w-sm w-full p-6 space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h3 className="font-serif text-lg font-bold text-brand-charcoal">
                {confirmConfig.title}
              </h3>
              <p className="text-xs text-brand-charcoal/70 leading-relaxed">
                {confirmConfig.message}
              </p>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmConfig(null)}
                className="flex-1 border border-brand-creme hover:bg-brand-creme/20 text-brand-charcoal py-2.5 text-xs uppercase tracking-widest font-bold rounded-sm duration-200 cursor-pointer text-center"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmConfig.onConfirm();
                  setConfirmConfig(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 text-xs uppercase tracking-widest font-bold rounded-sm duration-200 cursor-pointer text-center font-sans"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
