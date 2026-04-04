import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  KeyRound,
  MonitorSmartphone,
  Terminal,
  Loader,
  CheckCircle,
  Eye,
  EyeOff,
  Clock,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  logoutUser,
  logoutAllDevices,
  deleteAccount,
  updatePassword,
  fetchSessions,
} from '../features/auth/authSlice';
import toast from 'react-hot-toast';

// ─── Extracted PasswordInput (outside of SettingsPage to avoid remount) ──
const PasswordInput = ({ name, label, placeholder, value, onChange, error, show, onToggleShow }) => (
  <div>
    <label className="block text-xs font-bold text-textSecondary tracking-widest uppercase mb-2">
      {label}
    </label>
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-bgSecondary border ${error ? 'border-danger' : 'border-border'} rounded-xl py-3 px-4 pr-10 focus:outline-none focus:border-accentPrimary transition-all duration-300`}
      />
      <button
        type="button"
        onClick={onToggleShow}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-textPrimary transition-colors cursor-pointer"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-danger text-xs mt-1.5 pl-1"
      >
        {error}
      </motion.p>
    )}
  </div>
);

// ─── Simple user-agent parser ────────────────────────────────
const parseUserAgent = (ua) => {
  if (!ua) return { device: 'Unknown Device', browser: 'Unknown' };
  let device = 'Desktop';
  if (/iPhone/i.test(ua)) device = 'iPhone';
  else if (/iPad/i.test(ua)) device = 'iPad';
  else if (/Android/i.test(ua)) device = 'Android';
  else if (/Macintosh/i.test(ua)) device = 'macOS Desktop';
  else if (/Windows/i.test(ua)) device = 'Windows Desktop';
  else if (/Linux/i.test(ua)) device = 'Linux Desktop';

  let browser = 'Browser';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua)) browser = 'Safari';

  return { device, browser };
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Active now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const SettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sessions, sessionCount } = useSelector((state) => state.auth);
  const [deleteStep, setDeleteStep] = useState(0);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Fetch sessions on mount
  useEffect(() => {
    dispatch(fetchSessions());
  }, [dispatch]);

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    if (passwordErrors[e.target.name]) {
      setPasswordErrors((prev) => {
        const next = { ...prev };
        delete next[e.target.name];
        return next;
      });
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strengthColors = ['bg-danger', 'bg-warning', 'bg-warning', 'bg-accentSecondary', 'bg-success'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong', 'Excellent'];
  const strength = getPasswordStrength(passwordForm.newPassword);

  const handlePasswordSubmit = async () => {
    const errors = {};
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Must be at least 8 characters';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordLoading(true);
    try {
      await dispatch(
        updatePassword({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        })
      ).unwrap();
      toast.success('Master password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
    } catch (err) {
      if (typeof err === 'string') {
        toast.error(err);
      } else if (err?.fieldErrors) {
        setPasswordErrors(err.fieldErrors);
      } else {
        toast.error('Failed to update password');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // ─── Logout All Devices ─────────────────────────────────
  const handleLogoutAll = async () => {
    try {
      await dispatch(logoutAllDevices()).unwrap();
      toast.success('Logged out from all devices');
      navigate('/login');
    } catch (err) {
      toast.error(err || 'Failed to logout all devices');
    }
  };

  // ─── Delete Account ─────────────────────────────────────
  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await dispatch(deleteAccount()).unwrap();
      toast.success('Account deleted permanently');
      navigate('/');
    } catch (err) {
      toast.error(err || 'Account deletion failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Account & Security</h1>
        <p className="text-textSecondary mt-1">
          Manage your cryptographic master key, active hardware sessions, and
          sensitive account data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="md:col-span-2 glass p-8 rounded-2xl border border-border space-y-8"
        >
          <div className="flex items-center gap-4 border-b border-border pb-6">
            <div className="w-12 h-12 rounded-full bg-accentSecondary/10 flex items-center justify-center border border-accentSecondary/20">
              <KeyRound className="w-6 h-6 text-accentSecondary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Change Master Password</h2>
              <p className="text-sm text-textSecondary">
                Update your primary vault encryption key
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <PasswordInput
              name="currentPassword"
              label="Current Master Password"
              placeholder="••••••••••••"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.currentPassword}
              show={showPasswords.current}
              onToggleShow={() => setShowPasswords((p) => ({ ...p, current: !p.current }))}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PasswordInput
                name="newPassword"
                label="New Password"
                placeholder="Min 8 characters"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.newPassword}
                show={showPasswords.new}
                onToggleShow={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
              />
              <PasswordInput
                name="confirmPassword"
                label="Confirm New Password"
                placeholder="Re-enter password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.confirmPassword}
                show={showPasswords.confirm}
                onToggleShow={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              {/* Strength indicator */}
              <div className="flex items-center gap-3">
                <div className="flex gap-1 w-28">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                        i <= strength
                          ? `${strengthColors[strength]} shadow-[0_0_8px_rgba(6,182,212,0.3)]`
                          : 'bg-bgSecondary'
                      }`}
                    />
                  ))}
                </div>
                {strength > 0 && (
                  <span className="text-xs text-textSecondary">{strengthLabels[strength]}</span>
                )}
              </div>
              <motion.button
                onClick={handlePasswordSubmit}
                disabled={passwordLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="bg-accentSecondary text-bgPrimary font-bold py-2.5 px-6 rounded-full hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {passwordLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Update Master Key
              </motion.button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-6"
        >
          <div className="glass p-6 rounded-2xl border border-border">
            <div className="flex justify-between flex-col mb-4">
              <h3 className="text-xs font-bold text-textSecondary tracking-widest uppercase mb-2">
                Active Sessions
              </h3>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-bold">{String(sessionCount).padStart(2, '0')}</span>
                <motion.button
                  onClick={handleLogoutAll}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-4 py-1.5 border border-border rounded-lg text-xs font-bold hover:bg-bgSecondary transition-colors cursor-pointer"
                >
                  Logout All Devices
                </motion.button>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl border border-border space-y-4">
            <h3 className="text-sm font-bold mb-2">Device Management</h3>

            {sessions.length > 0 ? (
              sessions.map((session) => {
                const { device, browser } = parseUserAgent(session.userAgent);
                return (
                  <div
                    key={session.id}
                    className={`bg-bgSecondary/50 p-4 rounded-xl border border-border flex items-center gap-4 ${
                      !session.isCurrent ? 'opacity-70' : ''
                    }`}
                  >
                    <MonitorSmartphone className={`w-6 h-6 shrink-0 ${session.isCurrent ? 'text-accentSecondary' : 'text-textSecondary'}`} />
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold truncate">
                        {device} • {browser}
                        {session.isCurrent && (
                          <span className="ml-2 text-[10px] bg-accentSecondary/10 text-accentSecondary px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">
                            This device
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-textSecondary flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {session.isCurrent ? 'Active now' : timeAgo(session.updatedAt)}
                        {session.ip && ` • ${session.ip}`}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-textSecondary text-center py-4">
                <Loader className="w-4 h-4 animate-spin mx-auto mb-2" />
                Loading sessions…
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="glass p-6 rounded-2xl border border-border flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-textSecondary tracking-widest uppercase mb-1 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-accentPrimary" /> Two-Factor
              Auth
            </h3>
            <p className="text-sm">Authenticator App</p>
          </div>
          <span className="text-[10px] font-bold bg-warning/10 text-warning px-2.5 py-1 rounded-sm uppercase tracking-wider">
            Coming Soon
          </span>
        </div>

        <div className="glass p-6 rounded-2xl border border-border flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-textSecondary tracking-widest uppercase mb-1 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-accentPrimary" /> Security
              Audit
            </h3>
            <p className="text-sm">Last Key Change</p>
          </div>
          <span className="text-[10px] font-mono text-textSecondary">
            14.02.2024
          </span>
        </div>

        <div className="glass p-6 rounded-2xl border border-border flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-textSecondary tracking-widest uppercase mb-1 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-accentPrimary" /> Login Alerts
            </h3>
            <p className="text-sm">Email notifications</p>
          </div>
          <span className="text-[10px] font-bold bg-warning/10 text-warning px-2.5 py-1 rounded-sm uppercase tracking-wider">
            Coming Soon
          </span>
        </div>
      </motion.div>

      {/* ── Danger Zone ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="glass p-8 rounded-2xl border border-danger/30 relative overflow-hidden group mb-12"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <ShieldAlert className="w-48 h-48 text-danger" />
        </div>

        {deleteStep === 0 && (
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="max-w-xl">
              <h2 className="text-xl font-bold text-danger flex items-center gap-2 mb-2">
                <ShieldAlert className="w-6 h-6" /> Danger Zone
              </h2>
              <p className="text-textSecondary text-sm">
                Deleting your account is irreversible. All encrypted data,
                including passwords, identities, and notes, will be purged from
                our servers immediately. This action cannot be undone.
              </p>
            </div>
            <motion.button
              onClick={() => setDeleteStep(1)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-3 rounded-full border border-danger text-danger hover:bg-danger/10 transition-colors font-bold whitespace-nowrap cursor-pointer"
            >
              Delete Account
            </motion.button>
          </div>
        )}

        {deleteStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 space-y-4"
          >
            <h2 className="text-xl font-bold text-danger flex items-center gap-2">
              <ShieldAlert className="w-6 h-6" /> Are you absolutely sure?
            </h2>
            <p className="text-textSecondary text-sm">
              To verify, type{' '}
              <span className="font-mono text-textPrimary bg-bgSecondary px-1 rounded">
                DELETE
              </span>{' '}
              below:
            </p>
            <div className="flex gap-4">
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                className="bg-bgSecondary border border-danger/50 rounded-lg px-4 py-2 text-textPrimary focus:outline-none focus:border-danger uppercase w-48 transition-colors"
                placeholder="DELETE"
              />
              <motion.button
                onClick={handleDeleteAccount}
                disabled={deleteInput.toUpperCase() !== 'DELETE' || deleting}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-2 rounded-lg bg-danger text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-danger/90 transition-colors cursor-pointer"
              >
                {deleting ? 'Deleting...' : 'Confirm Deletion'}
              </motion.button>
              <motion.button
                onClick={() => {
                  setDeleteStep(0);
                  setDeleteInput('');
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-2 rounded-lg border border-border hover:bg-bgSecondary transition-colors cursor-pointer"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SettingsPage;
