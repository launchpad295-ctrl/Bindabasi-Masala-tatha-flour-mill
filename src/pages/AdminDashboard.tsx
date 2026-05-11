import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, getDocs, Timestamp, where } from 'firebase/firestore';
import { Product, Order } from '../types';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  Clock,
  ChevronRight,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, cn } from '../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { format, subDays, isWithinInterval, startOfDay } from 'date-fns';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'orders' | 'analytics'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snapshot) => {
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
        setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, []);

  const lowStockItems = products.filter(p => p.stockQuantity <= p.threshold);
  const totalSales = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending');

  // Analytics Data
  const last7Days = [...Array(7)].map((_, i) => {
    const date = startOfDay(subDays(new Date(), i));
    const dayTotal = orders
      .filter(o => {
        const orderDate = o.createdAt?.toDate ? o.createdAt.toDate() : new Date();
        return isWithinInterval(orderDate, { start: date, end: new Date(date.getTime() + 86400000) });
      })
      .reduce((acc, o) => acc + o.totalAmount, 0);
    return { name: format(date, 'MMM dd'), value: dayTotal };
  }).reverse();

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    const path = `orders/${orderId}`;
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleUpdateStock = async (productId: string, newStock: number) => {
     const path = `products/${productId}`;
     try {
       await updateDoc(doc(db, 'products', productId), { stockQuantity: newStock });
     } catch (err) {
       handleFirestoreError(err, OperationType.UPDATE, path);
     }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-earth-brown text-warm-beige flex flex-col pt-10">
         <div className="px-8 mb-12">
            <h2 className="text-xl font-serif font-bold">Admin Console</h2>
            <p className="text-[10px] uppercase tracking-widest opacity-40 mt-1">Zest & Kernels v1.0</p>
         </div>

         <nav className="flex-1 space-y-1 px-4">
            {[
              { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
              { id: 'inventory', icon: Package, label: 'Inventory' },
              { id: 'orders', icon: ShoppingCart, label: 'Orders' },
              { id: 'analytics', icon: BarChart3, label: 'Analytics' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab.id ? "bg-olive text-white shadow-lg" : "opacity-60 hover:opacity-100 hover:bg-white/5"
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
         </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
         <div className="max-w-6xl mx-auto space-y-10">
            
            {/* Tab: Overview */}
            <AnimatePresence mode="wait">
               {activeTab === 'overview' && (
                 <motion.div 
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-10"
                 >
                    <header className="flex justify-between items-end">
                       <div>
                          <h1 className="text-3xl font-serif font-bold">Dashboard <span className="italic font-normal">Summary</span></h1>
                          <p className="text-sm text-stone-500">Overview of operations for {format(new Date(), 'MMMM yyyy')}</p>
                       </div>
                       {lowStockItems.length > 0 && (
                         <div className="flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg border border-red-100 animate-pulse">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">{lowStockItems.length} Items Low Stock</span>
                         </div>
                       )}
                    </header>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                       {[
                         { label: 'Total Revenue', value: formatCurrency(totalSales), icon: BarChart3, color: 'text-olive bg-olive/10' },
                         { label: 'Open Orders', value: pendingOrders.length, icon: Clock, color: 'text-amber-600 bg-amber-50' },
                         { label: 'Products', value: products.length, icon: Package, color: 'text-blue-600 bg-blue-50' },
                         { label: 'Stock Alerts', value: lowStockItems.length, icon: AlertTriangle, color: 'text-red-600 bg-red-50' }
                       ].map((stat, i) => (
                         <div key={i} className="bg-white p-6 rounded-2xl border border-stone-200 flex justify-between items-start shadow-sm">
                            <div>
                               <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">{stat.label}</p>
                               <p className="text-2xl font-serif font-bold">{stat.value}</p>
                            </div>
                            <div className={cn("p-2 rounded-lg", stat.color)}>
                               <stat.icon className="w-5 h-5" />
                            </div>
                         </div>
                       ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                       {/* Sales Chart */}
                       <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm h-96">
                          <h3 className="font-serif font-bold text-lg mb-6">Recent Sales Velocity</h3>
                          <ResponsiveContainer width="100%" height="80%">
                             <AreaChart data={last7Days}>
                                <defs>
                                   <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#5A5A40" stopOpacity={0.1}/>
                                      <stop offset="95%" stopColor="#5A5A40" stopOpacity={0}/>
                                   </linearGradient>
                                </defs>
                                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <Tooltip 
                                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                                />
                                <Area type="monotone" dataKey="value" stroke="#5A5A40" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                             </AreaChart>
                          </ResponsiveContainer>
                       </div>

                       {/* Recent Activity */}
                       <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
                          <h3 className="font-serif font-bold text-lg mb-6">Recent Orders</h3>
                          <div className="space-y-4 flex-1">
                             {orders.slice(0, 5).map(order => (
                               <div key={order.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer group">
                                  <div className="flex items-center space-x-4">
                                     <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-stone-200 font-bold text-xs text-olive">
                                        ZE
                                     </div>
                                     <div>
                                        <p className="text-sm font-bold">{order.email.split('@')[0]}</p>
                                        <p className="text-[10px] text-stone-400 uppercase tracking-widest">{order.id.slice(0, 8)}</p>
                                     </div>
                                  </div>
                                  <div className="text-right">
                                     <p className="text-sm font-bold">{formatCurrency(order.totalAmount)}</p>
                                     <p className={cn("text-[10px] font-bold uppercase tracking-widest mt-1", 
                                        order.status === 'delivered' ? "text-green-600" : "text-amber-600")}>
                                        {order.status}
                                     </p>
                                  </div>
                               </div>
                             ))}
                          </div>
                          <button 
                            onClick={() => setActiveTab('orders')}
                            className="w-full mt-6 text-sm font-bold text-olive flex items-center justify-center border-t border-stone-100 pt-4"
                          >
                            View all orders <ChevronRight className="ml-2 w-4 h-4" />
                          </button>
                       </div>
                    </div>
                 </motion.div>
               )}

               {/* Tab: Inventory */}
               {activeTab === 'inventory' && (
                 <motion.div 
                    key="inventory"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                 >
                    <header className="flex justify-between items-center mb-10">
                       <div>
                          <h1 className="text-3xl font-serif font-bold">Inventory <span className="italic font-normal">Control</span></h1>
                          <p className="text-sm text-stone-500">Manage stock levels and product catalogs</p>
                       </div>
                       <button className="bg-olive text-white px-6 py-2 rounded-full font-bold text-sm flex items-center">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Product
                       </button>
                    </header>

                    <div className="bg-white rounded-[2rem] border border-stone-200 overflow-hidden shadow-sm">
                       <table className="w-full text-left">
                          <thead>
                             <tr className="bg-stone-50 border-b border-stone-100">
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Product</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Category</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Stock</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Price</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Actions</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-50">
                             {products.map(p => (
                               <tr key={p.id} className="hover:bg-stone-50/50 transition-colors group">
                                  <td className="px-8 py-6">
                                     <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 border border-stone-100">
                                           <img src={p.image || `https://picsum.photos/seed/${p.id}/100/100`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        </div>
                                        <div>
                                           <p className="text-sm font-bold">{p.name}</p>
                                           <p className="text-[10px] text-stone-400 uppercase tracking-widest">{p.tier}</p>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="px-8 py-6">
                                     <span className="text-xs font-medium px-3 py-1 bg-stone-100 rounded-full">{p.category}</span>
                                  </td>
                                  <td className="px-8 py-6">
                                     <div className="flex items-center space-x-4">
                                        <span className={cn(
                                          "text-sm font-bold min-w-[3rem]",
                                          p.stockQuantity <= p.threshold ? "text-red-600" : "text-stone-700"
                                        )}>
                                          {p.stockQuantity} {p.unit}
                                        </span>
                                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                           <button 
                                              onClick={() => handleUpdateStock(p.id, p.stockQuantity - 100)} 
                                              className="p-1 hover:bg-stone-100 rounded"
                                            >
                                              <Minus className="w-3 h-3" />
                                            </button>
                                           <button 
                                              onClick={() => handleUpdateStock(p.id, p.stockQuantity + 100)} 
                                              className="p-1 hover:bg-stone-100 rounded"
                                            >
                                              <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="px-8 py-6 text-sm font-medium">{formatCurrency(p.basePrice)}</td>
                                  <td className="px-8 py-6">
                                     <button className="text-[10px] font-bold uppercase tracking-widest text-olive hover:underline">Edit Details</button>
                                  </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </motion.div>
               )}

               {/* Tab: Orders */}
               {activeTab === 'orders' && (
                 <motion.div 
                    key="orders"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                 >
                    <header className="mb-10">
                       <h1 className="text-3xl font-serif font-bold">Order <span className="italic font-normal">History</span></h1>
                       <p className="text-sm text-stone-500">Track and fulfill customer orders</p>
                    </header>

                    <div className="space-y-4">
                       {orders.map(order => (
                         <div key={order.id} className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm">
                            <div className="flex flex-wrap justify-between items-start gap-6 border-b border-stone-100 pb-6 mb-6">
                               <div>
                                  <div className="flex items-center space-x-3 mb-1">
                                     <h3 className="text-lg font-bold">Order #{order.id.slice(-8).toUpperCase()}</h3>
                                     <span className={cn(
                                       "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                       order.status === 'pending' ? "bg-amber-100 text-amber-700" :
                                       order.status === 'processing' ? "bg-blue-100 text-blue-700" :
                                       "bg-green-100 text-green-700"
                                     )}>
                                       {order.status}
                                     </span>
                                  </div>
                                  <p className="text-sm opacity-60">Customer: {order.email}</p>
                                  <p className="text-[10px] text-stone-400 mt-1 uppercase tracking-widest">
                                    Placed on {order.createdAt?.toDate ? format(order.createdAt.toDate(), 'PPP p') : 'Just now'}
                                  </p>
                               </div>

                               <div className="flex space-x-2">
                                  <button 
                                    onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-bold transition-all"
                                  >
                                    Mark Processing
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-bold transition-all"
                                  >
                                    Mark Shipped
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                                    className="px-6 py-2 bg-olive text-white rounded-lg text-xs font-bold transition-all"
                                  >
                                    Delivered
                                  </button>
                               </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                               <div>
                                  <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Line Items</h4>
                                  <div className="space-y-4">
                                     {order.items.map((item, i) => (
                                       <div key={i} className="flex justify-between items-center bg-stone-50/50 p-3 rounded-xl">
                                          <div className="flex items-center space-x-3">
                                             <div className="w-10 h-10 bg-white rounded-lg border border-stone-100">
                                                <img src={item.image || `https://picsum.photos/seed/${item.id}/100/100`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                             </div>
                                             <div>
                                                <p className="text-sm font-bold">{item.name}</p>
                                                <p className="text-xs opacity-60">qty: {item.quantity}</p>
                                             </div>
                                          </div>
                                          <span className="text-sm font-bold">{formatCurrency(item.basePrice * item.quantity)}</span>
                                       </div>
                                     ))}
                                  </div>
                                  <div className="mt-6 pt-4 border-t border-stone-100 flex justify-between items-end">
                                     <span className="text-sm font-bold">Total</span>
                                     <span className="text-xl font-serif font-bold text-olive">{formatCurrency(order.totalAmount)}</span>
                                  </div>
                               </div>

                               <div className="bg-stone-50/50 p-6 rounded-2xl">
                                  <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Shipping Context</h4>
                                  <div className="space-y-4">
                                     <div className="flex items-start space-x-3">
                                        <Truck className="w-4 h-4 text-stone-400 mt-1" />
                                        <div>
                                           <p className="text-sm font-bold">{order.shippingAddress?.name}</p>
                                           <p className="text-sm opacity-60 leading-relaxed">
                                              {order.shippingAddress?.line1}<br/>
                                              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}<br/>
                                              {order.shippingAddress?.country}
                                           </p>
                                        </div>
                                     </div>
                                  </div>
                               </div>
                            </div>
                         </div>
                       ))}
                       {orders.length === 0 && !loading && (
                         <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-stone-200">
                            <Clock className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                            <p className="italic text-stone-400">No orders have been placed yet.</p>
                         </div>
                       )}
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>
      </main>
    </div>
  );
}
