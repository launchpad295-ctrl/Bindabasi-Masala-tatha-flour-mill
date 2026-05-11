import { Link } from 'react-router-dom';
import { Leaf, ArrowRight, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import ProductCard from '../components/ProductCard';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { Product } from '../types';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const path = 'products';
      try {
        const q = query(collection(db, path), limit(4));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setFeaturedProducts(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/spices/1920/1080?blur=2" 
            alt="Artisan Spices" 
            className="w-full h-full object-cover brightness-50"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-warm-beige">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="flex items-center space-x-2 text-olive font-bold uppercase tracking-[0.3em] text-xs mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Est. 2026 • Premium Artisan Selection</span>
            </span>
            <h1 className="text-6xl md:text-8xl font-serif font-bold leading-[0.9] mb-8">
              Flavor <br/> <span className="italic font-normal">Reimagined.</span>
            </h1>
            <p className="text-lg opacity-90 mb-10 leading-relaxed font-sans max-w-lg">
              Explore our curated collection of hand-harvested spices and premium nuts. From daily essentials to rare culinary treasures.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
              <Link 
                to="/shop" 
                className="bg-olive hover:bg-olive/90 text-white px-10 py-5 rounded-full font-bold flex items-center justify-center transition-all group"
              >
                Explore Collection
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/builder" 
                className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white px-10 py-5 rounded-full font-bold flex items-center justify-center transition-all"
              >
                Create Your Blend
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll badge */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2 opacity-50">
          <span className="text-[10px] uppercase tracking-widest font-bold">Scroll to explore</span>
          <div className="w-[1px] h-12 bg-warm-beige/30"></div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-olive/10 rounded-full flex items-center justify-center">
              <Leaf className="w-8 h-8 text-olive" />
            </div>
            <h3 className="text-xl font-serif font-bold">100% Organic</h3>
            <p className="text-sm opacity-60">Sourced directly from sustainable artisan farms worldwide.</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-olive/10 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-olive" />
            </div>
            <h3 className="text-xl font-serif font-bold">Premium Quality</h3>
            <div className="text-sm opacity-60">Purity tested and cold-stored to preserve essential oils.</div>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-olive/10 rounded-full flex items-center justify-center">
              <Truck className="w-8 h-8 text-olive" />
            </div>
            <h3 className="text-xl font-serif font-bold">Gift Ready Packaging</h3>
            <p className="text-sm opacity-60">Beautifully packed in sustainable glass jars and wood boxes.</p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-serif font-bold mb-12 text-center">Curated Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 h-[600px]">
          <Link to="/shop?category=Spices" className="relative md:col-span-2 group overflow-hidden rounded-3xl">
            <img src="https://picsum.photos/seed/peppercorns/1200/800" alt="Spices" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end text-white">
              <span className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Artisan Pantry</span>
              <h3 className="text-4xl font-serif font-bold mb-4">Spice Essentials</h3>
              <p className="text-sm opacity-90 max-w-md">The foundation of flavor. Heritage varieties from Kerala, Madagascar, and beyond.</p>
            </div>
          </Link>
          <Link to="/shop?category=Nuts" className="relative group overflow-hidden rounded-3xl">
            <img src="https://picsum.photos/seed/almonds/600/800" alt="Nuts" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end text-white">
              <span className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Protein Rich</span>
              <h3 className="text-3xl font-serif font-bold mb-4">Slow-Roasted Nuts</h3>
              <button className="text-xs font-bold underline decoration-olive underline-offset-4">Explore More</button>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 space-y-6 md:space-y-0">
            <div className="max-w-xl">
              <h2 className="text-4xl font-serif font-bold mb-4">Today's <span className="italic font-normal">Picks</span></h2>
              <p className="text-earth-brown/60">The freshest selections from our master curaters, arrive weekly at our warehouse.</p>
            </div>
            <Link to="/shop" className="text-olive font-bold flex items-center hover:translate-x-1 transition-transform">
              Browse Entire Pantry <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.length > 0 ? (
              featuredProducts.map(p => <ProductCard key={p.id} product={p} />)
            ) : (
              [...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="bg-stone-100 aspect-square rounded-2xl"></div>
                  <div className="h-4 bg-stone-100 rounded w-3/4 mx-auto"></div>
                  <div className="h-4 bg-stone-100 rounded w-1/2 mx-auto"></div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Custom Blend Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-olive rounded-[3rem] p-12 md:p-24 flex flex-col md:flex-row items-center gap-16 overflow-hidden relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
           <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48"></div>

           <div className="flex-1 text-white z-10">
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8">The <span className="italic font-normal text-warm-beige/60">Alchemist's</span> Station</h2>
              <p className="text-lg opacity-80 mb-10 leading-relaxed font-sans">
                Master the art of seasoning. Our signature blend builder allows you to select proportions to the milligram, creating a custom flavor profile unique to your kitchen.
              </p>
              <Link to="/builder" className="bg-warm-beige text-olive px-12 py-5 rounded-full font-bold hover:bg-white transition-colors inline-block">
                Start Blending
              </Link>
           </div>
           
           <div className="flex-1 relative z-10 w-full max-w-sm">
              <div className="aspect-[4/5] bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 flex flex-col space-y-6">
                 {[
                   { name: 'Smoked Paprika', pct: '45%', color: 'bg-red-500' },
                   { name: 'Cumin Seed', pct: '25%', color: 'bg-amber-600' },
                   { name: 'Black Pepper', pct: '20%', color: 'bg-stone-800' },
                   { name: 'Mystery Spice', pct: '10%', color: 'bg-stone-400' },
                 ].map((s, i) => (
                   <div key={i} className="space-y-2">
                     <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-warm-beige/60">
                       <span>{s.name}</span>
                       <span>{s.pct}</span>
                     </div>
                     <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                       <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: s.pct }}
                        className={`h-full ${s.color}`}
                       />
                     </div>
                   </div>
                 ))}
                 <div className="pt-6 border-t border-white/10">
                    <p className="text-center font-serif italic text-warm-beige">"Zest & Kernels Signature Blend No. 1"</p>
                 </div>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
}
