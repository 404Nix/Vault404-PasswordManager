import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, ShieldAlert, Clock, Plus, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchVaultItems } from '../features/vault/vaultSlice';

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.vault);

  useEffect(() => {
    dispatch(fetchVaultItems());
  }, [dispatch]);

  const goToVault = (filter = '') => {
    // Navigate to vault with a search query if filter is provided
    if (filter) {
      navigate(`/app/vault?filter=${filter}`);
    } else {
      navigate('/app/vault');
    }
  };

  return (
    <motion.div
      className="max-w-6xl mx-auto space-y-8"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Good Day, <span className="text-accentSecondary">{user?.name}</span></h1>
          <p className="text-textSecondary mt-1">Your vault is encrypted and secure.</p>
        </div>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link to="/app/vault" className="flex items-center gap-2 px-6 py-3 bg-accentPrimary text-white rounded-xl font-bold shadow-glow hover:bg-accentPrimary/90 transition-all">
            <Plus className="w-5 h-5" />
            <span>Add Credential</span>
          </Link>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          variants={fadeUp} 
          onClick={() => goToVault()}
          className="glass p-6 rounded-2xl border border-border relative overflow-hidden group hover:border-accentPrimary/30 transition-all duration-300 cursor-pointer"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
            <KeyRound className="w-24 h-24 text-accentPrimary" />
          </div>
          <p className="text-textSecondary uppercase tracking-widest text-xs font-bold mb-4">Total Passwords</p>
          <div className="flex items-baseline gap-2">
            <p className="text-5xl font-light">{items?.length || 0}</p>
            <span className="text-xs text-textSecondary uppercase">vault items</span>
          </div>
        </motion.div>
        
        <motion.div 
          variants={fadeUp} 
          onClick={() => goToVault('strong')}
          className="glass p-6 rounded-2xl border border-border relative overflow-hidden group hover:border-success/30 transition-all duration-300 cursor-pointer"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
            <ShieldCheck className="w-24 h-24 text-success" />
          </div>
          <p className="text-textSecondary uppercase tracking-widest text-xs font-bold mb-4">Secure Credentials</p>
          <div className="flex items-baseline gap-2">
            <p className="text-5xl font-light text-success">{items?.filter(i => i.strength === 'strong').length || 0}</p>
            <span className="text-xs text-success/70 uppercase">hardened</span>
          </div>
        </motion.div>

        <motion.div 
          variants={fadeUp} 
          onClick={() => goToVault('weak')}
          className="glass p-6 rounded-2xl border border-danger/20 relative overflow-hidden group bg-danger/5 hover:border-danger/40 transition-all duration-300 cursor-pointer"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
            <ShieldAlert className="w-24 h-24 text-danger" />
          </div>
          <p className="text-danger uppercase tracking-widest text-xs font-bold mb-4">Weak Passwords</p>
          <div className="flex items-baseline gap-2">
            <p className="text-5xl font-light text-danger">{items?.filter(i => i.strength === 'weak').length || 0}</p>
            <span className="text-xs text-danger/70 uppercase">action required</span>
          </div>
        </motion.div>
      </div>

      <motion.div variants={fadeUp} className="mt-8">
        <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
            <Link to="/app/vault" className="glass p-4 rounded-xl border border-border hover:border-accentSecondary flex items-center gap-4 transition-all duration-300 block">
              <div className="w-10 h-10 rounded-full bg-accentSecondary/10 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-accentSecondary" />
              </div>
              <div>
                <p className="font-bold">Browse Vault</p>
                <p className="text-xs text-textSecondary">View and manage credentials</p>
              </div>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
            <Link to="/app/settings" className="glass p-4 rounded-xl border border-border hover:border-accentPrimary flex items-center gap-4 transition-all duration-300 block">
              <div className="w-10 h-10 rounded-full bg-accentPrimary/10 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-accentPrimary" />
              </div>
              <div>
                <p className="font-bold">Security Center</p>
                <p className="text-xs text-textSecondary">Audit your account health</p>
              </div>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;
