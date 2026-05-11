import { auth, db } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { Leaf, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const navigate = useNavigate();
  const { setUser, setProfile, setLoading } = useAuthStore();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUser(user);

      // Check if profile exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        const newProfile = {
          email: user.email,
          displayName: user.displayName,
          role: 'customer',
          createdAt: Timestamp.now()
        };
        await setDoc(doc(db, 'users', user.uid), newProfile);
        setProfile(newProfile);
      } else {
        setProfile(userDoc.data());
      }
      navigate(-1); // Go back
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-xl border border-olive/10 text-center"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-olive/10 rounded-full mb-8">
           <Leaf className="w-10 h-10 text-olive" />
        </div>
        <h1 className="text-4xl font-serif font-bold mb-4">Welcome Back</h1>
        <p className="text-earth-brown/60 mb-10 leading-relaxed">
          Sign in to access your custom blends, track orders, and join our artisan community.
        </p>

        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-olive/20 hover:bg-olive/5 text-earth-brown font-bold flex items-center justify-center px-8 py-4 rounded-full transition-all group"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4 mr-3" alt="Google" />
          Continue with Google
        </button>

        <p className="mt-10 text-xs opacity-40 uppercase tracking-widest font-bold">
          Secure Artisan Authentication
        </p>
      </motion.div>
    </div>
  );
}
