import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Product } from '../types';
import { handleFirestoreError, OperationType } from '../lib/error-handler';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, PackageOpen } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const activeCategory = searchParams.get('category') || 'All';
  const activeTier = searchParams.get('tier') || 'All';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const path = 'products';
      try {
        let q = query(collection(db, path), orderBy('name'));
        
        if (activeCategory !== 'All') {
          q = query(collection(db, path), where('category', '==', activeCategory), orderBy('name'));
        }
        
        const snapshot = await getDocs(q);
        let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        
        if (activeTier !== 'All') {
          data = data.filter(p => p.tier === activeTier);
        }

        setProducts(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory, activeTier]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 space-y-6 md:space-y-0">
        <div>
           <h1 className="text-5xl font-serif font-bold mb-4">The <span className="italic font-normal">Pantry</span></h1>
           <p className="text-earth-brown/60">Sustainably sourced, artisan quality, delivered to your door.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search spices, nuts, blends..." 
            className="w-full bg-white border border-olive/10 rounded-full pl-12 pr-6 py-4 focus:outline-none focus:ring-1 focus:ring-olive transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="search-input"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 space-y-8 h-fit lg:sticky lg:top-28">
           <div>
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Categories
              </h3>
              <div className="space-y-2">
                {['All', 'Spices', 'Nuts', 'Blends'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                        const newParams = new URLSearchParams(searchParams);
                        if (cat === 'All') newParams.delete('category');
                        else newParams.set('category', cat);
                        setSearchParams(newParams);
                    }}
                    className={cn(
                      "block w-full text-left px-4 py-2 rounded-lg text-sm transition-all",
                      activeCategory === cat ? "bg-olive text-white font-bold" : "hover:bg-olive/5"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
           </div>

           <div>
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Experience Tier</h3>
              <div className="space-y-2">
                {['All', 'Basic', 'Standard', 'Premium'].map(tier => (
                  <button
                    key={tier}
                    onClick={() => {
                        const newParams = new URLSearchParams(searchParams);
                        if (tier === 'All') newParams.delete('tier');
                        else newParams.set('tier', tier);
                        setSearchParams(newParams);
                    }}
                    className={cn(
                      "block w-full text-left px-4 py-2 rounded-lg text-sm transition-all",
                      activeTier === tier ? "bg-olive text-white font-bold" : "hover:bg-olive/5"
                    )}
                  >
                    {tier}
                  </button>
                ))}
              </div>
           </div>
        </aside>

        {/* Main Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="bg-stone-100 aspect-square rounded-2xl"></div>
                  <div className="h-4 bg-stone-100 rounded w-3/4"></div>
                  <div className="h-4 bg-stone-100 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
               <PackageOpen className="w-16 h-16 text-stone-300 mb-4" />
               <h3 className="text-xl font-serif font-bold">No products found</h3>
               <p className="opacity-60 text-sm mt-2">Try adjusting your search or filters.</p>
               <button 
                onClick={() => setSearchParams({})}
                className="mt-6 text-olive font-bold underline"
               >
                 Clear all filters
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
