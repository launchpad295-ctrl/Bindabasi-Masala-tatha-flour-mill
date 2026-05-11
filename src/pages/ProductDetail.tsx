import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Product } from '../types';
import { useCartStore } from '../lib/store';
import { formatCurrency, cn } from '../lib/utils';
import { ShoppingBag, ChevronLeft, Star, ShieldCheck, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import ReviewSection from '../components/ReviewSection';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="min-h-screen flex flex-col items-center justify-center">Product not found. <Link to="/shop">Back to shop</Link></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/shop" className="inline-flex items-center text-sm font-bold opacity-50 hover:opacity-100 mb-12">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Pantry
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Gallery */}
        <div className="space-y-6">
           <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-square rounded-[3rem] overflow-hidden bg-white shadow-xl border border-olive/5"
           >
              <img 
                src={product.image || `https://picsum.photos/seed/${product.id}/800/800`} 
                alt={product.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
           </motion.div>
        </div>

        {/* Content */}
        <div className="space-y-10">
           <div>
              <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.3em] text-olive mb-4">
                 <ShieldCheck className="w-4 h-4" />
                 <span>Ethically Sourced • Organic</span>
              </div>
              <h1 className="text-5xl font-serif font-bold mb-4">{product.name}</h1>
              <div className="flex items-center space-x-4">
                 <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                 </div>
                 <span className="text-sm opacity-50 font-bold">128 Reviews</span>
              </div>
           </div>

           <p className="text-lg leading-relaxed text-earth-brown/80">
              {product.description || "A masterfully selected spice from our artisan collections. Experience the depth of flavor only fresh, cold-milled seeds can provide."}
           </p>

           <div className="flex items-end space-x-4">
              <span className="text-4xl font-serif font-bold">{formatCurrency(product.basePrice)}</span>
              <span className="text-sm opacity-50 pb-1">per {product.unit}</span>
           </div>

           <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="bg-white border border-olive/20 rounded-full px-6 py-4 flex items-center space-x-6">
                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-olive">−</button>
                 <span className="font-bold w-4 text-center">{quantity}</span>
                 <button onClick={() => setQuantity(quantity + 1)} className="text-olive">+</button>
              </div>
              <button 
                onClick={() => addItem(product, quantity)}
                className="flex-1 bg-olive text-white px-10 py-4 rounded-full font-bold hover:bg-olive/90 transition-all shadow-lg flex items-center justify-center space-x-3 group"
              >
                <ShoppingBag className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                <span>Add to Cart</span>
              </button>
              <button className="p-4 bg-white border border-olive/20 rounded-full hover:bg-red-50 hover:text-red-500 transition-all text-stone-400">
                 <Heart className="w-6 h-6" />
              </button>
           </div>

           <div className="grid grid-cols-2 gap-8 pt-10 border-t border-olive/10">
              <div className="space-y-2">
                 <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Origin</p>
                 <p className="text-sm font-medium italic font-serif">Western Ghats, India</p>
              </div>
              <div className="space-y-2">
                 <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Aroma Profile</p>
                 <p className="text-sm font-medium italic font-serif">Earthly, Citrus, Warm</p>
              </div>
           </div>
        </div>
      </div>

      {/* Reviews */}
      <ReviewSection productId={product.id} />
    </div>
  );
}
