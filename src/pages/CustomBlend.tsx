import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Product } from '../types';
import { useCartStore } from '../lib/store';
import { Plus, Minus, Info, Sparkles, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, cn } from '../lib/utils';

interface BlendIngredient {
  product: Product;
  quantity: number; // in grams
}

export default function CustomBlend() {
  const [availableSpices, setAvailableSpices] = useState<Product[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<BlendIngredient[]>([]);
  const [blendName, setBlendName] = useState('My Signature Blend');
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchSpices = async () => {
      const q = query(collection(db, 'products'), where('category', '==', 'Spices'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setAvailableSpices(data);
    };
    fetchSpices();
  }, []);

  const totalGrams = selectedIngredients.reduce((acc, i) => acc + i.quantity, 0);
  const totalPrice = selectedIngredients.reduce((acc, i) => acc + (i.product.basePrice * (i.quantity / 50)), 0);

  const updateQuantity = (productId: string, delta: number) => {
    setSelectedIngredients(prev => {
      const existing = prev.find(i => i.product.id === productId);
      if (existing) {
        return prev.map(i => 
          i.product.id === productId 
            ? { ...i, quantity: Math.max(0, i.quantity + delta) } 
            : i
        ).filter(i => i.quantity > 0);
      } else {
        const spice = availableSpices.find(s => s.id === productId);
        if (spice && delta > 0) {
          return [...prev, { product: spice, quantity: delta }];
        }
      }
      return prev;
    });
  };

  const handleAddToCart = () => {
    if (selectedIngredients.length === 0) return;
    
    // Create a special product object for the blend
    const blendProduct: Product = {
      id: `custom-${Date.now()}`,
      name: blendName,
      description: `Custom blend: ${selectedIngredients.map(i => `${i.quantity}g ${i.product.name}`).join(', ')}`,
      basePrice: totalPrice,
      category: 'Blends',
      image: '', // Placeholder
      stockQuantity: 1,
      threshold: 0,
      unit: 'blend',
      tier: 'Standard'
    };

    addItem(blendProduct, 1, true, selectedIngredients.map(i => ({
      productId: i.product.id,
      name: i.product.name,
      quantity: i.quantity
    })));
    
    // Reset state
    setSelectedIngredients([]);
    setBlendName('My Signature Blend');
    alert('Blend added to cart!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
         <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center space-x-2 text-olive bg-olive/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
         >
           <Sparkles className="w-4 h-4" />
           <span>The Alchemist's Station</span>
         </motion.div>
         <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">Create Your <span className="italic font-normal">Signature</span></h1>
         <p className="text-earth-brown/60 max-w-2xl mx-auto">
           A precise art. Select your base notes, accents, and aromatics to craft a blend that defines your culinary style. Minimum 50g total.
         </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Ingredient Selection */}
        <div className="lg:col-span-7 space-y-8">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {availableSpices.map((spice) => {
                const selected = selectedIngredients.find(i => i.product.id === spice.id);
                return (
                  <div key={spice.id} className={cn(
                    "bg-white p-6 rounded-2xl border transition-all flex flex-col justify-between",
                    selected ? "border-olive ring-1 ring-olive/20 shadow-md" : "border-olive/10 opacity-70 hover:opacity-100"
                  )}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-serif font-bold text-lg">{spice.name}</h3>
                        <p className="text-[10px] text-stone-400 uppercase tracking-widest">{spice.tier} Tier</p>
                      </div>
                      <span className="text-sm font-bold opacity-60">{formatCurrency(spice.basePrice)}/50g</span>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                       <div className="flex items-center space-x-4">
                          <button 
                            onClick={() => updateQuantity(spice.id, -5)}
                            className="w-10 h-10 rounded-full border border-olive/20 flex items-center justify-center hover:bg-olive hover:text-white transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-bold text-lg">{selected?.quantity || 0}g</span>
                          <button 
                            onClick={() => updateQuantity(spice.id, 5)}
                            className="w-10 h-10 rounded-full border border-olive/20 flex items-center justify-center hover:bg-olive hover:text-white transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>

        {/* Blend Visualizer & Summary */}
        <div className="lg:col-span-5">
           <div className="sticky top-28 bg-earth-brown text-warm-beige p-10 rounded-[3rem] shadow-2xl space-y-10 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
              
              <div className="relative z-10">
                <input 
                  type="text" 
                  value={blendName}
                  onChange={(e) => setBlendName(e.target.value)}
                  className="bg-transparent border-0 border-b border-white/20 text-3xl font-serif italic focus:outline-none focus:border-olive w-full pb-2 mb-8"
                  id="blend-name"
                />

                <div className="space-y-6">
                   <AnimatePresence>
                     {selectedIngredients.map((i) => (
                       <motion.div 
                        key={i.product.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-2"
                       >
                         <div className="flex justify-between text-xs font-bold uppercase tracking-widest opacity-60">
                            <span>{i.product.name}</span>
                            <span>{i.quantity}g</span>
                         </div>
                         <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                              layoutId={`bar-${i.product.id}`}
                              className="h-full bg-olive" 
                              style={{ width: `${(i.quantity / (totalGrams || 1)) * 100}%` }} 
                            />
                         </div>
                       </motion.div>
                     ))}
                   </AnimatePresence>
                   {selectedIngredients.length === 0 && (
                     <div className="py-12 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center opacity-40">
                        <Info className="w-8 h-8 mb-4" />
                        <p className="text-sm italic">Add ingredients to start blending</p>
                     </div>
                   )}
                </div>

                <div className="pt-10 border-t border-white/10 mt-10 space-y-6">
                   <div className="flex justify-between items-end">
                      <span className="text-sm opacity-60">Total Weight</span>
                      <span className="text-2xl font-serif italic">{totalGrams}g</span>
                   </div>
                   <div className="flex justify-between items-end">
                      <span className="text-sm opacity-60">Estimated Cost</span>
                      <span className="text-4xl font-serif font-bold">{formatCurrency(totalPrice)}</span>
                   </div>
                   
                   <button
                    onClick={handleAddToCart}
                    disabled={totalGrams < 50}
                    className="w-full bg-olive hover:bg-olive/90 text-white py-5 rounded-full font-bold flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                   >
                     <ShoppingBag className="w-5 h-5 mr-3 group-hover:-translate-y-0.5 transition-transform" />
                     {totalGrams < 50 ? `Add ${50 - totalGrams}g more` : 'Add Custom Blend to Cart'}
                   </button>
                   
                   <p className="text-[10px] text-center opacity-40 uppercase tracking-[0.2em]">
                     Hand-blended & Sealed within 24 hours of order
                   </p>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
