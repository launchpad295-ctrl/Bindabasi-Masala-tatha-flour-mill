import { useCartStore, useAuthStore } from '../lib/store';
import { formatCurrency, cn } from '../lib/utils';
import { ShoppingBag, Trash2, ArrowRight, Minus, Plus, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const path = 'orders';
    try {
      // In a real app we'd call the /api/create-checkout-session we defined in server.ts
      // For this demo, we'll simulate a successful order placement in Firestore
      const orderData = {
        userId: user.uid,
        email: user.email,
        items: items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, basePrice: i.basePrice })),
        totalAmount: total(),
        status: 'pending',
        createdAt: serverTimestamp(),
        shippingAddress: {
          name: user.displayName || 'Customer',
          line1: '123 Spice Lane',
          city: 'Flavor City',
          state: 'FC',
          postalCode: '90210',
          country: 'USA'
        }
      };

      await addDoc(collection(db, path), orderData);
      clearCart();
      alert('Order placed successfully! (Simulation)');
      navigate('/');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-olive/10 rounded-full flex items-center justify-center mb-8">
           <ShoppingBag className="w-10 h-10 text-olive" />
        </div>
        <h1 className="text-4xl font-serif font-bold mb-4">Your basket is <span className="italic font-normal">empty</span></h1>
        <p className="text-earth-brown/60 max-w-sm mb-10">
          Looks like you haven't added any artisan spices or nuts to your collection yet.
        </p>
        <Link to="/shop" className="bg-olive text-white px-10 py-4 rounded-full font-bold hover:bg-olive/90 transition-all">
          Browse the Pantry
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-5xl font-serif font-bold mb-12">Your <span className="italic font-normal">Basket</span></h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-6">
           <AnimatePresence>
              {items.map((item) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-6 rounded-3xl border border-olive/5 flex items-center shadow-sm"
                >
                   <div className="w-24 h-24 bg-stone-100 rounded-2xl overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image || `https://picsum.photos/seed/${item.id}/200/200`} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                   </div>
                   
                   <div className="ml-6 flex-grow">
                      <div className="flex justify-between items-start">
                         <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-olive mb-1">
                              {item.isCustom ? 'Custom Blend' : item.category}
                            </p>
                            <h3 className="text-xl font-serif font-bold">{item.name}</h3>
                         </div>
                         <button onClick={() => removeItem(item.id)} className="text-stone-300 hover:text-red-500 transition-colors p-2">
                            <Trash2 className="w-5 h-5" />
                         </button>
                      </div>

                      <div className="flex justify-between items-end mt-4">
                         <div className="bg-warm-beige rounded-full px-4 py-2 flex items-center space-x-6 border border-olive/5">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-olive hover:scale-125 transition-transform"><Minus className="w-4 h-4" /></button>
                            <span className="font-bold text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-olive hover:scale-125 transition-transform"><Plus className="w-4 h-4" /></button>
                         </div>
                         <span className="text-xl font-serif font-bold">{formatCurrency(item.basePrice * item.quantity)}</span>
                      </div>
                   </div>
                </motion.div>
              ))}
           </AnimatePresence>
        </div>

        <div className="lg:col-span-4">
           <div className="bg-earth-brown text-warm-beige p-10 rounded-[3rem] sticky top-28 shadow-2xl">
              <h2 className="text-2xl font-serif font-bold mb-8 italic">Order Summary</h2>
              
              <div className="space-y-6 text-sm mb-10">
                 <div className="flex justify-between opacity-60">
                    <span>Subtotal</span>
                    <span>{formatCurrency(total())}</span>
                 </div>
                 <div className="flex justify-between opacity-60">
                    <span>Shipping</span>
                    <span>{total() > 50 ? 'Free' : formatCurrency(5.99)}</span>
                 </div>
                 <div className="flex justify-between opacity-60">
                    <span>Estimate Tax</span>
                    <span className="italic">Calculated at checkout</span>
                 </div>
                 <div className="pt-6 border-t border-white/10 flex justify-between text-xl font-serif font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(total() + (total() > 50 ? 0 : 5.99))}</span>
                 </div>
              </div>

              <button 
                onClick={handleCheckout}
                className="w-full bg-olive text-white py-5 rounded-full font-bold flex items-center justify-center space-x-3 hover:bg-olive/90 transition-all shadow-lg active:scale-[0.98] group"
              >
                <CreditCard className="w-5 h-5" />
                <span>Secure Checkout</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-8 flex justify-center space-x-6 opacity-30 grayscale hover:grayscale-0 transition-all cursor-default">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="Mastercard" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="Paypal" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
