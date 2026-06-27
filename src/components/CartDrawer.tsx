import { useState } from 'react';
import { X, Plus, Minus, Trash2, ChevronLeft, Send, Sparkles } from 'lucide-react';
import { CartItem, OrderCustomer } from '../types';
import { api, sendOrderToWhatsApp } from '../services/api';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

type DrawerStep = 'cart-list' | 'checkout-form';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}: CartDrawerProps) {
  const [step, setStep] = useState<DrawerStep>('cart-list');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'entrega' | 'retirada'>('entrega');

  // Form Fields State
  const [customer, setCustomer] = useState<OrderCustomer>({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'PIX',
    observations: ''
  });

  if (!isOpen) return null;

  // Compute values
  const total = cartItems.reduce((sum, item) => {
    const price = item.product.promotion && item.product.salePrice ? item.product.salePrice : item.product.price;
    return sum + (price * item.quantity);
  }, 0);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handleGoToCheckout = () => {
    if (cartItems.length === 0) return;
    setStep('checkout-form');
    setErrorMessage('');
  };

  const handleBackToCart = () => {
    setStep('cart-list');
    setErrorMessage('');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name || !customer.phone || !customer.address) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Save order to backend database (saves order and decreases stock)
      const savedOrder = await api.createOrder(customer, cartItems);
      
      // Open WhatsApp automatically
      sendOrderToWhatsApp(savedOrder);
      
      // Clear cart items and close
      onClearCart();
      onClose();
      setCustomer({
        name: '',
        phone: '',
        address: '',
        paymentMethod: 'PIX',
        observations: ''
      });
      setStep('cart-list');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Erro ao processar seu pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Background Dim Backdrop on hover */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-brand-charcoal/50 backdrop-blur-xs transition-opacity duration-300"
      ></div>

      {/* Cart Container Panel */}
      <div 
        id="cart_drawer"
        className="relative bg-brand-beige w-full max-w-lg h-[100dvh] shadow-2xl flex flex-col justify-between z-10 animate-slide-left rounded-l-md md:rounded-l-lg border-l border-brand-creme overflow-hidden"
      >
        
        {/* HEADER PANEL */}
        <div className="px-6 py-6 border-b border-brand-creme/60 bg-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            {step === 'checkout-form' && (
              <button 
                id="btn_cart_back"
                onClick={handleBackToCart}
                className="p-1 hover:text-brand-gold mr-1 border border-brand-creme hover:bg-brand-creme rounded-full focus:outline-none cursor-pointer"
                title="Voltar ao Carrinho"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="font-serif text-xl font-light text-brand-charcoal">
                {step === 'cart-list' ? 'Seu Pedido' : 'Finalizar Entrega'}
              </h2>
              <span className="text-[9px] uppercase tracking-[0.25em] text-brand-gold font-bold">
                {step === 'cart-list' ? `${cartCount} itens selecionados` : 'Concluir no WhatsApp'}
              </span>
            </div>
          </div>

          <button 
            id="btn_cart_close"
            onClick={onClose}
            className="p-2 hover:bg-brand-creme text-brand-charcoal hover:text-brand-gold rounded-full transition-colors focus:outline-none cursor-pointer"
            aria-label="Fechar Carrinho"
            title="Fechar Carrinho"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* INTERMEDIARY MAIN SCROLL BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {errorMessage && (
            <div className="bg-red-50 text-red-800 text-xs p-4 border-l-4 border-red-500 rounded-xs mb-4">
              {errorMessage}
            </div>
          )}

          {step === 'cart-list' ? (
            /* --- STEP 1: CART LIST --- */
            cartItems.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center opacity-85 py-16">
                <div className="w-16 h-16 rounded-full bg-brand-creme flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-brand-gold" />
                </div>
                <p className="font-serif italic text-lg text-brand-charcoal/60">Seu carrinho está vazio</p>
                <p className="text-xs text-brand-charcoal/40 max-w-xs mt-1">Explore as categorias em nosso catálogo para carregar de aromas seu ritual.</p>
                <button
                  onClick={onClose}
                  className="mt-6 border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-beige transition-colors text-[10px] uppercase tracking-widest font-semibold px-6 py-3 rounded-full cursor-pointer focus:outline-none"
                >
                  Voltar às Compras
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map(item => {
                  const itemPrice = item.product.promotion && item.product.salePrice ? item.product.salePrice : item.product.price;
                  const itemSubtotal = itemPrice * item.quantity;
                  
                  return (
                    <div 
                      key={item.product.id}
                      id={`cart_item_${item.product.id}`}
                      className="bg-white border border-brand-creme/60 rounded-sm p-4 flex gap-4 hover:shadow-xs transition-shadow relative"
                    >
                      {/* Product Thumbnail image */}
                      <div className="w-16 h-16 shrink-0 rounded-xs overflow-hidden bg-brand-creme">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info & Quantity controls */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-serif text-sm font-semibold text-brand-charcoal max-w-[80%]">
                              {item.product.name}
                            </h4>
                            
                            <button
                              id={`btn_cart_remove_${item.product.id}`}
                              onClick={() => onRemoveItem(item.product.id)}
                              className="text-brand-charcoal/40 hover:text-red-600 transition-colors focus:outline-none p-1 cursor-pointer"
                              title="Remover sabonete do pedido"
                            >
                              <Trash2 className="w-4 h-4 stroke-[1.5]" />
                            </button>
                          </div>
                          <span className="text-[10px] text-brand-gold uppercase tracking-wider block font-medium mt-0.5">
                            Aroma: {item.product.aroma}
                          </span>
                        </div>

                        {/* Quantity handler selectors */}
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-brand-creme/40">
                          <div className="flex items-center bg-brand-creme/60 rounded-xs border border-brand-creme/40">
                            <button
                              id={`btn_cart_dec_${item.product.id}`}
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                              className="p-1.5 hover:text-brand-gold disabled:opacity-30 focus:outline-none cursor-pointer"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-semibold text-brand-charcoal w-6 text-center select-none">
                              {item.quantity}
                            </span>
                            <button
                              id={`btn_cart_inc_${item.product.id}`}
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="p-1.5 hover:text-brand-gold disabled:opacity-30 focus:outline-none cursor-pointer"
                              disabled={item.quantity >= item.product.stock}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-brand-charcoal/40 block">Total item</span>
                            <span className="font-serif text-sm text-brand-charcoal font-semibold">
                              R$ {itemSubtotal.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* --- STEP 2: CHECKOUT FORM --- */
            <form id="checkout_form" onSubmit={handleSubmitOrder} className="space-y-5">
              
              <div className="bg-white/80 p-5 border border-brand-creme rounded-sm space-y-4">
                <h3 className="text-[10pt] uppercase tracking-widest font-bold text-brand-gold border-b border-brand-creme pb-2">
                  Dados de Entrega
                </h3>

                {/* Cliente Nome */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-medium text-brand-charcoal mb-1">
                    Nome Completo <span className="text-brand-gold">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={customer.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Ex: Maria Carolina Silva"
                    className="w-full text-xs bg-white border border-brand-creme/80 focus:border-brand-gold focus:outline-none px-3.5 py-3 rounded-none transition-colors"
                  />
                </div>

                {/* Cliente Telefone (WhatsApp) */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-medium text-brand-charcoal mb-1">
                    WhatsApp para contato <span className="text-brand-gold">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={customer.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="Ex: (34) 98853-4026"
                    className="w-full text-xs bg-white border border-brand-creme/80 focus:border-brand-gold focus:outline-none px-3.5 py-3 rounded-none transition-colors"
                  />
                </div>

                {/* Método de Envio */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-brand-gold mb-1.5 label-delivery mt-2">
                    Opção de Recebimento / Entrega <span className="text-brand-gold">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setDeliveryMethod('entrega');
                        setCustomer(prev => ({ ...prev, address: prev.address === 'Retirar no local (Bairro Martins, Uberlândia)' ? '' : prev.address }));
                      }}
                      className={`py-3 px-2 border text-center font-sans tracking-wide duration-200 transition-all cursor-pointer rounded-xs ${
                        deliveryMethod === 'entrega'
                          ? 'border-brand-gold bg-brand-gold/10 text-brand-charcoal font-semibold shadow-xs'
                          : 'border-brand-creme bg-white text-brand-charcoal/60 hover:border-brand-gold'
                      }`}
                    >
                      <span className="block text-xs">🚚 Entrega</span>
                      <span className="block text-[9px] mt-0.5 opacity-80">(Uberlândia - A Combinar)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeliveryMethod('retirada');
                        setCustomer(prev => ({ ...prev, address: 'Retirar no local (Bairro Martins, Uberlândia)' }));
                      }}
                      className={`py-3 px-2 border text-center font-sans tracking-wide duration-200 transition-all cursor-pointer rounded-xs ${
                        deliveryMethod === 'retirada'
                          ? 'border-brand-gold bg-brand-gold/10 text-brand-charcoal font-semibold shadow-xs'
                          : 'border-[#E5DFD5] bg-white text-brand-charcoal/60 hover:border-brand-gold'
                      }`}
                    >
                      <span className="block text-xs">🏬 Retirada</span>
                      <span className="block text-[9px] mt-0.5 opacity-80">(Bairro Martins - Grátis)</span>
                    </button>
                  </div>
                </div>

                {/* Cliente Endereço */}
                {deliveryMethod === 'entrega' ? (
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-medium text-brand-charcoal mb-1">
                      Endereço de Entrega <span className="text-brand-gold">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={customer.address === 'Retirar no local (Bairro Martins, Uberlândia)' ? '' : customer.address}
                      onChange={handleInputChange}
                      required
                      placeholder="Ex: Av. Floriano Peixoto, 400 - Centro, Uberlândia - MG"
                      className="w-full text-xs bg-white border border-brand-creme/80 focus:border-brand-gold focus:outline-none px-3.5 py-3 rounded-none transition-colors"
                    />
                    <p className="text-[10px] text-brand-charcoal/50 mt-1.5 leading-normal italic">
                      📍 Atendemos Uberlândia. O valor exato do frete por motoboy é acertado amigavelmente com você diretamente no WhatsApp.
                    </p>
                  </div>
                ) : (
                  <div className="bg-brand-creme/30 p-3.5 border border-brand-creme rounded-sm text-left">
                    <p className="text-[11px] font-bold text-brand-charcoal uppercase tracking-widest text-brand-gold flex items-center gap-1">
                      📍 Ponto de Retirada Gratuita
                    </p>
                    <p className="text-[11px] text-brand-charcoal/80 mt-1 leading-relaxed font-sans">
                      Bairro Martins, Uberlândia - MG <br />
                      A localização exata e os melhores horários para buscar serão combinados na conversa do WhatsApp.
                    </p>
                  </div>
                )}

                {/* Cliente Observações */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-medium text-brand-charcoal mb-1 mt-1">
                    Instruções ou Observações (Opcional)
                  </label>
                  <textarea
                    name="observations"
                    value={customer.observations}
                    onChange={handleInputChange}
                    placeholder="Ex: Se for para presente, adicionar um cartão de parabéns."
                    rows={2}
                    className="w-full text-xs bg-white border border-brand-creme/80 focus:border-brand-gold focus:outline-none px-3.5 py-2 rounded-none transition-colors resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="bg-white/80 p-5 border border-brand-creme rounded-sm space-y-4">
                <h3 className="text-[10pt] uppercase tracking-widest font-bold text-brand-gold border-b border-brand-creme pb-2">
                  Forma de Pagamento
                </h3>
                
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-medium text-brand-charcoal mb-1.5">
                    Como deseja pagar? <span className="text-brand-gold">*</span>
                  </label>
                  <select
                    name="paymentMethod"
                    value={customer.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full text-xs bg-white border border-brand-creme/80 focus:border-brand-gold focus:outline-none px-3.5 py-3 rounded-none transition-colors text-brand-charcoal font-medium"
                  >
                    <option value="PIX">PIX (Chave enviada no WhatsApp)</option>
                    <option value="Dinheiro na entrega">Dinheiro (na entrega física)</option>
                    <option value="Cartão de crédito ou débito">Cartão de Crédito / Débito (na maquininha)</option>
                  </select>
                </div>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-100 rounded-sm p-4 text-[11px] text-emerald-800 leading-relaxed space-y-1 select-none">
                <p className="font-bold flex items-center gap-1.5 text-emerald-950 uppercase tracking-widest text-[9px]">
                  <span>✨ Compra Segura & Sem Pagamento Automático</span>
                </p>
                <p>
                  Ao confirmar abaixo, seu pedido será enviado de forma organizada para o nosso WhatsApp. <strong>Não cobramos nada agora</strong>. Nós mesmos conferimos e combinamos todos os detalhes diretamente com você!
                </p>
                <p className="text-[10px] text-emerald-700/90 font-medium">
                  📱 Você será redirecionado para o WhatsApp com a mensagem pronta.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* REVENUE CALCULATION FOOTER PREVIEW AND CHECKOUT HANDLER */}
        <div className="px-6 py-6 border-t border-brand-creme/60 bg-white">
          <div className="space-y-2 mb-6">
            <div className="flex justify-between items-center text-xs text-brand-charcoal/60">
              <span>Subtotal do Pedido</span>
              <span className="font-serif">R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-brand-charcoal/60">
              <span>Custo de Entrega</span>
              {deliveryMethod === 'entrega' ? (
                <span className="text-brand-gold font-medium italic">Valor confirmado no WhatsApp</span>
              ) : (
                <span className="text-emerald-700 font-bold uppercase text-[10px] tracking-wider">Grátis (Retirada)</span>
              )}
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-brand-creme/40">
              <span className="text-xs font-bold uppercase text-brand-charcoal">Preço Estimado</span>
              <span className="font-serif text-2xl text-brand-charcoal font-semibold">
                R$ {total.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {step === 'cart-list' ? (
            /* Action for Cart list: Advance to form */
            <button
              id="btn_cart_advance"
              onClick={handleGoToCheckout}
              disabled={cartItems.length === 0}
              className="w-full bg-brand-olive hover:bg-brand-olive-hover disabled:bg-brand-creme disabled:text-brand-charcoal/30 text-brand-beige py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-sm transition-all shadow-md hover:shadow-lg focus:outline-none cursor-pointer"
            >
              Próxima Etapa (Dados)
            </button>
          ) : (
            /* Action for Form step: Submit and launch Whatsapp */
            <button
              form="checkout_form"
              type="submit"
              id="btn_checkout_submit"
              disabled={isSubmitting || cartItems.length === 0}
              className="w-full bg-[#25D366] hover:bg-[#1ebd59] disabled:bg-[#aef0c4] text-white py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-sm transition-all shadow-md hover:shadow-lg focus:outline-none cursor-pointer"
            >
              {isSubmitting ? (
                <>Processando Pedido...</>
              ) : (
                <>
                  <Send className="w-4 h-4 fill-white" />
                  Finalizar no WhatsApp
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
