import { Link } from 'react-router-dom';
import { Leaf, Instagram, Twitter, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="main-footer" className="bg-earth-brown text-warm-beige py-16 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-2">
              <Leaf className="w-8 h-8 text-olive" />
              <span className="text-2xl font-serif font-bold tracking-tight text-white">Zest & Kernels</span>
            </Link>
            <p className="text-sm opacity-70 leading-relaxed">
              Curating the world's finest artisan spices and nuts. Sustainable, ethical, and exceptionally flavorful.
            </p>
            <div className="flex space-x-4">
              <Instagram className="w-5 h-5 opacity-70 hover:opacity-100 cursor-pointer" />
              <Twitter className="w-5 h-5 opacity-70 hover:opacity-100 cursor-pointer" />
              <Facebook className="w-5 h-5 opacity-70 hover:opacity-100 cursor-pointer" />
            </div>
          </div>
          
          <div>
            <h4 className="font-serif text-lg font-bold mb-6">Shop</h4>
            <ul className="space-y-4 text-sm opacity-70">
              <li><Link to="/shop?category=Spices" className="hover:opacity-100">Artisan Spices</Link></li>
              <li><Link to="/shop?category=Nuts" className="hover:opacity-100">Premium Nuts</Link></li>
              <li><Link to="/shop?tier=Premium" className="hover:opacity-100">Premium Selection</Link></li>
              <li><Link to="/builder" className="hover:opacity-100">Build Your Mix</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm opacity-70">
              <li><Link to="/about" className="hover:opacity-100">Our Story</Link></li>
              <li><Link to="/suppliers" className="hover:opacity-100">Ethical Sourcing</Link></li>
              <li><Link to="/contact" className="hover:opacity-100">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:opacity-100">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-bold mb-6">Newsletter</h4>
            <p className="text-sm opacity-70 mb-4 font-sans">
              Join our community for exclusive recipes and spicy updates.
            </p>
            <form className="flex space-x-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-white/10 border border-white/20 rounded-md px-4 py-2 text-sm w-full focus:outline-none focus:border-olive transition-colors"
                id="newsletter-email"
              />
              <button 
                type="submit" 
                className="bg-olive px-4 py-2 rounded-md text-sm font-bold hover:bg-olive/80 transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-16 pt-8 text-xs opacity-50 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p>© 2026 Zest & Kernels. All rights reserved.</p>
          <div className="flex space-x-8">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
