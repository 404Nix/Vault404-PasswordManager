import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Copy,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Plus,
  Box,
  Loader,
  X,
  Globe,
  User,
  Lock,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import {
  fetchVaultItems,
  revealPassword,
  removeCachedPassword,
  addVaultItem,
  deleteVaultItem,
  updateVaultItem,
} from '../features/vault/vaultSlice';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import PlatformSearch from '../components/PlatformSearch';

const PlatformIcon = ({ slug, name, size = 'w-12 h-12' }) => {
  const [hasError, setHasError] = useState(false);
  const { theme } = useSelector((state) => state.ui);
  const cleanSlug = (slug || '').replace(/\.(com|org|net|io|dev|app|co)$/i, '').toLowerCase();

  if (hasError || !cleanSlug) {
    return (
      <div className={`${size} rounded-xl bg-bgSecondary border border-border flex items-center justify-center text-accentSecondary font-bold text-xl uppercase shadow-inner`}>
        {(name || slug || '?').charAt(0)}
      </div>
    );
  }

  // Use white for dark theme icons, and a dark obsidian for light theme icons
  const iconColor = theme === 'dark' ? 'ffffff' : '0f172a';

  return (
    <div className={`${size} rounded-xl bg-bgSecondary border border-border flex items-center justify-center overflow-hidden p-2.5 shadow-sm`}>
      <img
        src={`https://cdn.simpleicons.org/${cleanSlug}/${iconColor}`}
        alt={name || slug}
        className="w-full h-full object-contain transition-opacity duration-300"
        onError={() => setHasError(true)}
        loading="lazy"
      />
    </div>
  );
};

const VaultPage = () => {
  const dispatch = useDispatch();
  const { items, loading, decryptedCache } = useSelector(
    (state) => state.vault
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');

  const [searchTerm, setSearchTerm] = useState('');
  const [revealingIds, setRevealingIds] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [addForm, setAddForm] = useState({
    platformName: '',
    platformSlug: '',
    username: '',
    password: '',
  });
  const [editForm, setEditForm] = useState({
    username: '',
    password: '',
  });

  useEffect(() => {
    dispatch(fetchVaultItems());
  }, [dispatch]);

  // ─── Reveal / Hide Password ────────────────────────────────
  const togglePassword = async (id) => {
    if (decryptedCache[id]) {
      dispatch(removeCachedPassword(id));
      return;
    }
    setRevealingIds((prev) => ({ ...prev, [id]: true }));
    try {
      await dispatch(revealPassword(id)).unwrap();
    } catch (err) {
      toast.error(err || 'Failed to reveal password');
    } finally {
      setRevealingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  // ─── Copy ──────────────────────────────────────────────────
  const handleCopyUsername = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Username copied');
  };

  const handleCopyPassword = async (id) => {
    let decrypted = decryptedCache[id];
    if (!decrypted) {
      try {
        const result = await dispatch(revealPassword(id)).unwrap();
        decrypted = result.decrypted;
      } catch (err) {
        toast.error(err || 'Failed to copy password');
        return;
      }
    }
    navigator.clipboard.writeText(decrypted.password);
    toast.success('Password copied');
  };

  // ─── Add ───────────────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await dispatch(addVaultItem(addForm)).unwrap();
      toast.success('Credential saved!');
      setShowAddModal(false);
      setAddForm({ platformName: '', platformSlug: '', username: '', password: '' });
    } catch (err) {
      toast.error(err || 'Failed to save');
    }
  };

  // ─── Edit ──────────────────────────────────────────────────
  const openEditModal = (item) => {
    setShowEditModal(item);
    setEditForm({ username: item.username, password: '' });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        updateVaultItem({
          id: showEditModal._id,
          username: editForm.username,
          password: editForm.password || undefined,
        })
      ).unwrap();
      toast.success('Credential updated!');
      setShowEditModal(null);
    } catch (err) {
      toast.error(err || 'Failed to update');
    }
  };

  // ─── Delete ────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await dispatch(deleteVaultItem(id)).unwrap();
      toast.success('Entry deleted');
    } catch (err) {
      toast.error(err || 'Failed to delete');
    }
  };

  // ─── Filter ────────────────────────────────────────────────
  const filteredItems = items.filter((item) => {
    // 1. Check strength filter from URL if present
    if (filterParam && item.strength !== filterParam) {
      return false;
    }

    // 2. Check search term
    const term = searchTerm.toLowerCase();
    if (!term) return true;

    return (
      (item.platformName || '').toLowerCase().includes(term) ||
      (item.platformSlug || '').toLowerCase().includes(term) ||
      (item.username || '').toLowerCase().includes(term)
    );
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSearchParams({});
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: i * 0.05, duration: 0.3, ease: 'easeOut' },
    }),
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      transition: { duration: 0.2, ease: 'easeIn' } 
    },
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold">My Credentials</h1>
          <p className="text-textSecondary mt-1">
            {items.length} Encrypted records found in your vault
          </p>
          {filterParam && (
            <div className="mt-2 flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                filterParam === 'strong' ? 'text-success border-success/30 bg-success/10' : 'text-danger border-danger/30 bg-danger/10'
              }`}>
                Filtered: {filterParam}
              </span>
              <button 
                onClick={clearFilters}
                className="text-[10px] text-textSecondary hover:text-textPrimary underline cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
          <div className="flex items-center gap-1.5 p-1 bg-border/20 rounded-xl border border-border">
            <button
              onClick={() => setSearchParams({})}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !filterParam ? 'bg-accentPrimary text-white shadow-sm' : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSearchParams({ filter: 'strong' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterParam === 'strong' ? 'bg-success text-white shadow-sm' : 'text-textSecondary hover:text-success'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Strong</span>
            </button>
            <button
              onClick={() => setSearchParams({ filter: 'weak' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterParam === 'weak' ? 'bg-danger text-white shadow-sm' : 'text-textSecondary hover:text-danger'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Weak</span>
            </button>
          </div>
          <div className="relative flex-1 md:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
            <input
              type="text"
              placeholder="Search vault..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-bgSecondary border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-accentPrimary transition-all duration-300"
            />
          </div>
          <motion.button
            onClick={() => setShowAddModal(true)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="flex items-center justify-center w-10 h-10 bg-accentSecondary text-bgPrimary rounded-xl border border-accentSecondary hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="glass p-6 rounded-2xl border border-border space-y-4 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-bgSecondary rounded-xl" />
                <div className="space-y-2 flex-1 pt-1">
                  <div className="h-4 bg-bgSecondary rounded w-1/2" />
                  <div className="h-3 bg-bgSecondary rounded w-1/3" />
                </div>
              </div>
              <div className="h-10 bg-bgSecondary rounded-xl" />
              <div className="h-10 bg-bgSecondary rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => {
            const isRevealed = !!decryptedCache[item._id];
            const isRevealing = !!revealingIds[item._id];
            return (
              <motion.div
                key={item._id}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                className="glass p-6 rounded-2xl border border-border hover:border-accentPrimary/50 transition-all duration-300 group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <PlatformIcon slug={item.platformSlug} name={item.platformName} />
                    <div>
                      <h3 className="font-bold text-lg leading-tight">
                        {item.platformName || item.platformSlug}
                      </h3>
                      <div className="mt-1 flex gap-2">
                        <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border ${
                          item.strength === 'strong' 
                            ? 'text-success bg-success/10 border-success/20' 
                            : item.strength === 'weak'
                            ? 'text-danger bg-danger/10 border-danger/20'
                            : 'text-warning bg-warning/10 border-warning/20'
                        }`}>
                          {item.strength || 'Medium'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <motion.button
                      onClick={() => openEditModal(item)}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-textSecondary hover:text-textPrimary cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(item._id)}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-textSecondary hover:text-danger cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Username */}
                  <div className="bg-bgSecondary/50 border border-border rounded-xl p-3 flex justify-between items-center group/field hover:border-textSecondary/30 transition-all duration-200">
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-bold text-textSecondary uppercase tracking-wider mb-1">
                        Username / Email
                      </p>
                      <p className="text-sm truncate">{item.username}</p>
                    </div>
                    <motion.button
                      onClick={() => handleCopyUsername(item.username)}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-textSecondary hover:text-accentSecondary opacity-0 group-hover/field:opacity-100 transition-all p-1 cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </motion.button>
                  </div>

                  {/* Password */}
                  <div className="bg-bgSecondary/50 border border-border rounded-xl p-3 flex justify-between items-center group/field hover:border-textSecondary/30 transition-all duration-200">
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-bold text-textSecondary uppercase tracking-wider mb-1">
                        Password
                      </p>
                      <p className="text-sm font-mono text-accentSecondary">
                        {isRevealing ? (
                          <Loader className="w-4 h-4 animate-spin inline" />
                        ) : isRevealed ? (
                          decryptedCache[item._id].password
                        ) : (
                          '••••••••••••'
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover/field:opacity-100 transition-all">
                      <motion.button
                        onClick={() => togglePassword(item._id)}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-textSecondary hover:text-textPrimary p-1 cursor-pointer"
                        disabled={isRevealing}
                      >
                        {isRevealed ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </motion.button>
                      <motion.button
                        onClick={() => handleCopyPassword(item._id)}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-textSecondary hover:text-accentSecondary p-1 cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="py-20 text-center flex flex-col items-center"
        >
          <div className="w-20 h-20 rounded-full bg-bgSecondary flex items-center justify-center mb-4 text-textSecondary">
            <Box className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Credentials Found</h3>
          <p className="text-textSecondary">
            Your vault is empty. Add a new credential to secure it.
          </p>
        </motion.div>
      )}

      {/* ── Add Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="glass border border-border rounded-2xl p-8 w-full max-w-lg shadow-glow"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accentSecondary/10 flex items-center justify-center border border-accentSecondary/20">
                    <KeyRound className="w-5 h-5 text-accentSecondary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Add New Credential</h2>
                    <p className="text-xs text-textSecondary">Encrypt and store securely</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setShowAddModal(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="cursor-pointer"
                >
                  <X className="w-5 h-5 text-textSecondary hover:text-textPrimary transition-colors" />
                </motion.button>
              </div>
              <form onSubmit={handleAdd} className="space-y-5">
                <PlatformSearch
                  value={{ platformName: addForm.platformName, platformSlug: addForm.platformSlug }}
                  onChange={({ platformName, platformSlug }) =>
                    setAddForm((prev) => ({ ...prev, platformName, platformSlug }))
                  }
                />
                <div>
                  <label className="block text-xs font-bold text-textSecondary tracking-widest uppercase mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Username / Email
                  </label>
                  <input
                    value={addForm.username}
                    onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                    required
                    className="w-full bg-bgSecondary border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:border-accentPrimary text-sm transition-all duration-300"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-textSecondary tracking-widest uppercase mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Password
                  </label>
                  <input
                    type="password"
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    required
                    className="w-full bg-bgSecondary border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:border-accentPrimary text-sm transition-all duration-300"
                    placeholder="••••••••"
                  />
                </div>

                {/* Live preview */}
                {(addForm.platformName || addForm.platformSlug) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-bgSecondary/50 border border-border rounded-xl p-4 flex items-center gap-4"
                  >
                    <PlatformIcon slug={addForm.platformSlug} name={addForm.platformName} size="w-10 h-10" />
                    <div>
                      <p className="text-sm font-bold">{addForm.platformName || addForm.platformSlug}</p>
                      <p className="text-xs text-textSecondary">{addForm.username || 'username'}</p>
                    </div>
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full bg-accentSecondary text-bgPrimary font-bold py-3 rounded-xl hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all mt-2 cursor-pointer"
                >
                  Save Credential
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Edit Modal ──────────────────────────────────────── */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowEditModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="glass border border-border rounded-2xl p-8 w-full max-w-md shadow-glow"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <PlatformIcon slug={showEditModal.platformSlug} name={showEditModal.platformName} size="w-10 h-10" />
                  <div>
                    <h2 className="text-xl font-bold">Edit Credential</h2>
                    <p className="text-xs text-textSecondary">{showEditModal.platformName}</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setShowEditModal(null)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="cursor-pointer"
                >
                  <X className="w-5 h-5 text-textSecondary hover:text-textPrimary transition-colors" />
                </motion.button>
              </div>
              <form onSubmit={handleEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-textSecondary tracking-widest uppercase mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Username / Email
                  </label>
                  <input
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    required
                    className="w-full bg-bgSecondary border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:border-accentPrimary text-sm transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-textSecondary tracking-widest uppercase mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> New Password
                    <span className="text-textSecondary/50 lowercase tracking-normal font-normal ml-1">(leave blank to keep current)</span>
                  </label>
                  <input
                    type="password"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    className="w-full bg-bgSecondary border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:border-accentPrimary text-sm transition-all duration-300"
                    placeholder="••••••••"
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full bg-accentPrimary text-white font-bold py-3 rounded-xl hover:shadow-glow transition-all mt-2 cursor-pointer"
                >
                  Update Credential
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VaultPage;
