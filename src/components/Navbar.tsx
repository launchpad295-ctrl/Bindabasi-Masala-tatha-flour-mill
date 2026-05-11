import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Leaf } from 'lucide-react';
import { useState } from 'react';
import { useCartStore, useAuthStore } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const { user, profile } = useAuthStore();

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav id="main-nav" className="sticky top-0 z-50 bg-warm-beige/80 backdrop-blur-md border-b border-olive/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <Leaf className="w-8 h-8 text-olive group-hover:rotate-12 transition-transform" />
            <span className="text-2xl font-serif font-bold tracking-tight">Zest & Kernels</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
             <Link to="/shop" className="hover:text-olive transition-colors font-medium">Shop</Link>
             <Link to="/builder" className="hover:text-olive transition-colors font-medium">Custom Blend</Link>
             {profile?.role === 'admin' && (
               <Link to="/admin" className="text-olive font-bold hover:underline">Admin</Link>
             )}
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/cart" className="relative p-2 hover:bg-olive/5 rounded-full transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-olive text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to={user ? "/profile" : "/login"} className="p-2 hover:bg-olive/5 rounded-full transition-colors">
              <User className="w-6 h-6" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-warm-beige border-b border-olive/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              <Link to="/shop" className="block py-2 text-lg font-medium" onClick={() => setIsOpen(false)}>Shop</Link>
              <Link to="/builder" className="block py-2 text-lg font-medium" onClick={() => setIsOpen(false)}>Custom Blend</Link>
              <Link to="/cart" className="block py-2 text-lg font-medium" onClick={() => setIsOpen(false)}>Cart ({cartCount})</Link>
              <Link to={user ? "/profile" : "/login"} className="block py-2 text-lg font-medium" onClick={() => setIsOpen(false)}>
                {user ? "Profile" : "Login"}
              </Link>
              {profile?.role === 'admin' && (
                <Link to="/admin" className="block py-2 text-lg font-bold text-olive" onClick={() => setIsOpen(false)}>Admin Panel</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
