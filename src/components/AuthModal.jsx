import { HiX, HiOutlineUser } from 'react-icons/hi';
import { useAuth } from '../contexts/AuthContext';

export default function AuthModal({ isOpen, onClose, message }) {
  const { loginAnonymously } = useAuth();

  if (!isOpen) return null;

  const handleLogin = async () => {
    try {
      await loginAnonymously();
      onClose();
    } catch (err) {
      // error signing in anonymously
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-gray-900 rounded-2xl shadow-2xl border border-gray-700/50 p-8 max-w-sm w-full mx-4 animate-[fadeIn_0.2s_ease]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition"
        >
          <HiX size={20} />
        </button>

        <div className="text-center">
            <div className="w-16 h-16 bg-brand-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-brand-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2a7.2 7.2 0 01-6-3.22c.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08a7.2 7.2 0 01-6 3.22z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-100 mb-2">Sign in required</h3>
          <p className="text-gray-400 text-sm mb-6">
            {message || 'Continue as a guest to proceed.'}
          </p>
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-6 py-3 text-sm font-semibold transition-all shadow-sm"
          >
            <HiOutlineUser size={22} />
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
