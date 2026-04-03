import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import AppRoutes from './AppRoutes';
import { initializeAuth } from './features/auth/authSlice';
import { Shield } from 'lucide-react';

function App() {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.ui);
  const { authInitialized } = useSelector((state) => state.auth);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-bgPrimary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-bgSecondary border border-border flex items-center justify-center rotate-45 shadow-glow">
            <Shield className="w-8 h-8 text-accentSecondary -rotate-45" />
          </div>
          <p className="text-textSecondary text-sm tracking-widest uppercase">Initializing Vault...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: theme === 'dark' ? '#131318' : '#ffffff',
          color: theme === 'dark' ? '#f8fafc' : '#0f172a',
          border: '1px solid rgba(124, 58, 237, 0.2)',
        }
      }} />
      <AnimatePresence mode="wait">
        <AppRoutes />
      </AnimatePresence>
    </>
  );
}

export default App;
