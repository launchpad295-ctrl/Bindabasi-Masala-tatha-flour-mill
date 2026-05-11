import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { Product } from '../types';
import { useCartStore } from '../lib/store';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const tierColors = {
    Basic: 'bg-stone-200 text-stone-700',
    Standard: 'bg-blue-100 text-blue-700',
    Premium: 'bg-amber-100 text-amber-700',
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-olive/5 group flex flex-col h-full"
    >
      <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden">
        <img 
          src={product.image || `https://picsum.photos/seed/${product.id}/600/600`} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4">
          <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", tierColors[product.tier])}>
            {product.tier}
          </span>
        </div>
        {product.stockQuantity <= product.threshold && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-[10px] font-bold uppercase">
            Low Stock
          </div>
        )}
      </Link>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/product/${product.id}`}>
            <h3 className="text-lg font-serif font-bold group-hover:text-olive transition-colors">{product.name}</h3>
          </Link>
          <div className="flex items-center text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-xs font-bold ml-1">4.8</span>
          </div>
        </div>
        
        <p className="text-sm text-earth-brown/60 line-clamp-2 mb-4 flex-grow">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-xl font-bold font-serif">{formatCurrency(product.basePrice)}</span>
          <button 
            onClick={() => addItem(product, 1)}
            disabled={product.stockQuantity <= 0}
            className="bg-olive text-white p-3 rounded-full hover:bg-olive/90 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
