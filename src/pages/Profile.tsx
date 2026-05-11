import { useAuthStore } from '../lib/store';
import { db, auth } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Order } from '../types';
import { format } from 'date-fns';
import { formatCurrency, cn } from '../lib/utils';
import { LogOut, Package, MapPin, Settings, User as UserIcon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

export default function Profile() {
  const { user, profile, setUser, setProfile } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const path = 'orders';
    const q = query(
      collection(db, path),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    setProfile(null);
    navigate('/');
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-8">
           <div className="bg-white p-8 rounded-[2rem] border border-olive/5 text-center shadow-sm">
              <div className="w-24 h-24 bg-olive/10 rounded-full mx-auto mb-6 flex items-center justify-center overflow-hidden border-2 border-olive/5">
                 {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                 ) : (
                    <UserIcon className="w-10 h-10 text-olive" />
                 )}
              </div>
              <h2 className="text-xl font-serif font-bold">{profile?.displayName || 'Artisan Enthusiast'}</h2>
              <p className="text-xs opacity-50 font-bold uppercase tracking-widest mt-1">{profile?.role}</p>
              
              <button 
                onClick={handleLogout}
                className="mt-8 flex items-center justify-center w-full space-x-2 text-sm font-bold text-red-500 hover:text-red-600 transition-colors py-2 border-t border-stone-100 pt-6"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
           </div>

           <nav className="space-y-2">
              <button className="w-full flex items-center space-x-3 px-6 py-4 rounded-2xl bg-olive text-white font-bold shadow-lg">
                 <Package className="w-5 h-5" />
                 <span>Order History</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-6 py-4 rounded-2xl bg-white border border-olive/5 hover:bg-olive/5 transition-colors font-medium">
                 <MapPin className="w-5 h-5 opacity-40 " />
                 <span>Saved Addresses</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-6 py-4 rounded-2xl bg-white border border-olive/5 hover:bg-olive/5 transition-colors font-medium">
                 <Settings className="w-5 h-5 opacity-40 " />
                 <span>Account Settings</span>
              </button>
           </nav>
        </aside>

        {/* Orders List */}
        <div className="lg:col-span-3 space-y-8">
           <div className="flex justify-between items-end">
              <h1 className="text-4xl font-serif font-bold tracking-tight">Order <span className="italic font-normal">Vault</span></h1>
              <span className="text-xs font-bold opacity-40 uppercase tracking-widest">{orders.length} Total Purchases</span>
           </div>

           <div className="space-y-6">
              {orders.map(order => (
                <div key={order.id} className="bg-white p-8 rounded-[2.5rem] border border-olive/5 shadow-sm group">
                   <div className="flex flex-wrap justify-between items-center gap-6 mb-8 pb-8 border-b border-olive/5">
                      <div className="flex items-center space-x-6">
                         <div className="text-center bg-warm-beige px-6 py-3 rounded-2xl">
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Status</p>
                            <p className={cn(
                               "text-sm font-bold uppercase tracking-wider",
                               order.status === 'delivered' ? "text-green-600" : "text-amber-600"
                            )}>
                               {order.status}
                            </p>
                         </div>
                         <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Order #</p>
                            <p className="text-sm font-bold">{order.id.slice(-8).toUpperCase()}</p>
                         </div>
                         <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Date</p>
                            <p className="text-sm font-bold">{order.createdAt?.toDate ? format(order.createdAt.toDate(), 'PPP') : 'Today'}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1">Total</p>
                         <p className="text-2xl font-serif font-bold text-olive">{formatCurrency(order.totalAmount)}</p>
                      </div>
                   </div>

                   <div className="flex flex-wrap gap-4">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center space-x-3 bg-warm-beige/30 p-2 pr-4 rounded-xl border border-olive/5">
                           <div className="w-10 h-10 bg-white rounded-lg overflow-hidden border border-olive/10">
                              <img src={`https://picsum.photos/seed/${item.id}/100/100`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                           </div>
                           <div>
                              <p className="text-xs font-bold">{item.name}</p>
                              <p className="text-[10px] opacity-40">Qty: {item.quantity}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-olive/10">
                   <Package className="w-16 h-16 text-olive/20 mx-auto mb-6" />
                   <p className="font-serif italic text-lg opacity-40">Your archive is empty. Time to start an adventure?</p>
                   <Link to="/shop" className="text-olive font-bold underline mt-4 inline-block">Shop the Pantry</Link>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
