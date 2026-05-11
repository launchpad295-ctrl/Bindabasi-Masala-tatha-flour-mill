import { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { Review } from '../types';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

interface ReviewSectionProps {
  productId: string;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const path = 'reviews';
    const q = query(
      collection(db, path),
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      setReviews(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return alert('Please login to leave a review');
    if (!comment.trim()) return;

    const path = 'reviews';
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, path), {
        productId,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Anonymous',
        rating,
        comment,
        createdAt: serverTimestamp()
      });
      setComment('');
      setRating(5);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-16 border-t border-olive/10 pt-16">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-serif font-bold mb-8 flex items-center">
          <MessageSquare className="w-8 h-8 mr-3 text-olive" />
          Customer Reviews
        </h2>

        {/* Review Form */}
        {auth.currentUser ? (
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-olive/10 mb-12">
            <h3 className="font-serif text-lg font-bold mb-4">Share your experience</h3>
            <div className="flex space-x-2 mb-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="focus:outline-none"
                >
                  <Star className={cn("w-6 h-6", s <= rating ? "fill-amber-400 text-amber-400" : "text-stone-300")} />
                </button>
              ))}
            </div>
            <textarea
              className="w-full bg-warm-beige/50 border border-olive/10 rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-olive transition-all min-h-[100px]"
              placeholder="What did you think of this spice?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              id="review-comment"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 bg-olive text-white px-6 py-2 rounded-lg font-bold hover:bg-olive/90 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : 'Post Review'}
            </button>
          </form>
        ) : (
          <div className="bg-olive/5 p-6 rounded-xl text-center mb-12">
            <p className="text-sm">Please <a href="/login" className="font-bold underline text-olive">login</a> to leave a review.</p>
          </div>
        )}

        <div className="space-y-8">
          <AnimatePresence>
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/50 p-6 rounded-xl border border-olive/5"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold">{review.userName}</p>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">
                      {review.createdAt?.toDate ? format(review.createdAt.toDate(), 'MMM dd, yyyy') : 'Recently'}
                    </p>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={cn("w-4 h-4", i < review.rating ? "fill-current" : "text-stone-200")} />
                    ))}
                  </div>
                </div>
                <p className="text-earth-brown/80 leading-relaxed italic">{review.comment}</p>
              </motion.div>
            ))}
          </AnimatePresence>
          {reviews.length === 0 && (
            <p className="text-center text-stone-500 py-12">No reviews yet. Be the first to try this!</p>
          )}
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
