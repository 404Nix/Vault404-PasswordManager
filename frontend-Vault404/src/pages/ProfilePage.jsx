import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Clock, Smartphone, Save, Loader } from 'lucide-react';
import { updateProfile, fetchSessions } from '../features/auth/authSlice';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const timeAgo = (dateStr) => {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, sessionCount } = useSelector((state) => state.auth);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchSessions());
  }, [dispatch]);

  const isEmailChanged = email !== user?.email;

  const handleSaveProfile = async () => {
    if (isEmailChanged && !currentPassword) {
      toast.error('Please enter your current password to change email');
      return;
    }

    setSaving(true);
    try {
      await dispatch(updateProfile({ name, email, currentPassword })).unwrap();
      toast.success('Profile updated successfully!');
      setCurrentPassword('');
    } catch (err) {
      if (typeof err === 'string') {
        toast.error(err);
      } else {
        toast.error('Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-8 pb-12"
    >
      <div>
        <h1 className="text-3xl font-bold">User Identity</h1>
        <p className="text-textSecondary mt-1">
          Manage your public node identity and security metadata.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Avatar & Quick Stats */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <div className="glass p-8 rounded-2xl border border-border flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-3xl bg-accentSecondary/10 border border-accentSecondary/20 flex items-center justify-center mb-6 rotate-12 shadow-glow">
              <User className="w-12 h-12 text-accentSecondary -rotate-12" />
            </div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-sm text-textSecondary mb-6">{user?.email}</p>
            <div className="w-full pt-6 border-t border-border flex justify-around">
              <div className="text-center">
                <p className="text-xs text-textSecondary uppercase tracking-widest mb-1">Status</p>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <div className="w-1 h-1 rounded-full bg-success animate-pulse" />
                  Active
                </span>
              </div>
              <div className="text-center">
                <p className="text-xs text-textSecondary uppercase tracking-widest mb-1">Node</p>
                <span className="text-[10px] font-mono text-textPrimary">404-NX-1</span>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl border border-border">
            <h3 className="text-xs font-bold text-textSecondary tracking-widest uppercase mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-accentPrimary" /> Security Level
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Encryption Strength</span>
                <span className="text-accentSecondary font-bold">AES-256</span>
              </div>
              <div className="w-full h-1.5 bg-bgSecondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-accentSecondary shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                />
              </div>
              <p className="text-[10px] text-textSecondary italic">Your vault uses end-to-end zero-knowledge protocols.</p>
            </div>
          </div>
        </motion.div>

        {/* Right: Settings Form */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="glass p-8 rounded-2xl border border-border space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-textSecondary tracking-widest uppercase ml-1">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-bgSecondary border border-border rounded-xl py-3 px-4 focus:outline-none focus:border-accentSecondary transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-textSecondary tracking-widest uppercase ml-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-bgSecondary border border-border rounded-xl py-3 px-4 focus:outline-none focus:border-accentSecondary transition-all duration-300"
                />
              </div>
            </div>

            {/* Password verification field - only shows when email is being changed */}
            <AnimatePresence>
              {isEmailChanged && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 pt-2 overflow-hidden"
                >
                  <label className="block text-xs font-bold text-danger tracking-widest uppercase ml-1 flex items-center gap-2">
                    <Shield className="w-3 h-3" /> Confirm with Master Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Verify your master password"
                    className="w-full bg-bgSecondary border border-danger/30 focus:border-danger rounded-xl py-3 px-4 focus:outline-none transition-all duration-300 shadow-inner"
                  />
                  <p className="text-[10px] text-textSecondary ml-1">A secure password is required to update your primary node email.</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-4 text-right">
              <motion.button
                onClick={handleSaveProfile}
                disabled={saving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-8 py-3 bg-accentSecondary text-bgPrimary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Profile
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <motion.div variants={fadeUp} className="glass p-6 rounded-2xl border border-border hover:border-accentPrimary/30 transition-all duration-300">
              <Clock className="w-6 h-6 text-textSecondary mb-3" />
              <p className="font-bold mb-1">Last Updated</p>
              <p className="text-sm text-textSecondary">{timeAgo(user?.updatedAt)} from Node 404</p>
            </motion.div>
            <motion.div variants={fadeUp} className="glass p-6 rounded-2xl border border-border hover:border-accentPrimary/30 transition-all duration-300">
              <Smartphone className="w-6 h-6 text-textSecondary mb-3" />
              <p className="font-bold mb-1">Active Sessions</p>
              <p className="text-sm text-textSecondary">{sessionCount} {sessionCount === 1 ? 'device' : 'devices'} currently syncing</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
