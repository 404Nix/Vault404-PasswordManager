import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Menu, Search, RefreshCw, Moon, Sun } from 'lucide-react';
import { toggleSidebar, toggleTheme } from '../../features/ui/uiSlice';
import { fetchVaultItems } from '../../features/vault/vaultSlice';

const Topbar = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.ui);
  const { loading } = useSelector((state) => state.vault);

  const handleSync = () => {
    dispatch(fetchVaultItems());
  };

  return (
    <div className="h-20 glass border-b border-border px-8 flex items-center sticky top-0 z-10 w-full gap-4">
      {/* Left: hamburger only */}
      <motion.button
        onClick={() => dispatch(toggleSidebar())}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="text-textSecondary hover:text-textPrimary transition-colors cursor-pointer shrink-0"
      >
        <Menu className="w-6 h-6" />
      </motion.button>

      {/* Center: spacing */}
      <div className="flex-1" />

      {/* Right: action buttons */}
      <div className="flex items-center gap-4 shrink-0">
        <motion.button
          onClick={handleSync}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-accentSecondary/10 text-accentSecondary border border-accentSecondary/20 rounded-full hover:bg-accentSecondary/20 transition-all duration-300 font-medium text-sm disabled:opacity-50 cursor-pointer"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Sync Now</span>
        </motion.button>

        <motion.button
          onClick={() => dispatch(toggleTheme())}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 text-textSecondary hover:text-textPrimary bg-bgSecondary rounded-full border border-border transition-colors duration-300 cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </motion.button>
      </div>
    </div>
  );
};

export default Topbar;
