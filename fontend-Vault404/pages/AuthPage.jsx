import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, EyeOff, Loader, AlertCircle } from 'lucide-react';
import { loginUser, signupUser, clearErrors } from '../features/auth/authSlice';
import toast from 'react-hot-toast';

const AuthPage = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLogin = pathname === '/login';
  const { loading, fieldErrors } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [localErrors, setLocalErrors] = useState({});

  // Clear errors when switching between login/signup
  useEffect(() => {
    dispatch(clearErrors());
    setLocalErrors({});
  }, [isLogin, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear field error on change
    if (localErrors[e.target.name]) {
      setLocalErrors((prev) => {
        const next = { ...prev };
        delete next[e.target.name];
        return next;
      });
    }
  };

  // Client-side validation
  const validate = () => {
    const errors = {};
    if (!isLogin && !formData.name.trim()) {
      errors.name = 'Display name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!isLogin && formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }
    setLocalErrors({});

    if (isLogin) {
      const res = await dispatch(loginUser({ email: formData.email, password: formData.password }));
      if (res.meta.requestStatus === 'fulfilled') {
        toast.success('Access Granted');
        navigate('/app/dashboard');
      } else {
        if (res.payload?.fieldErrors) {
          setLocalErrors(res.payload.fieldErrors);
        } else {
          toast.error(res.payload || 'Access Denied');
        }
      }
    } else {
      const res = await dispatch(signupUser(formData));
      if (res.meta.requestStatus === 'fulfilled') {
        toast.success('Vault Created');
        navigate('/app/dashboard');
      } else {
        if (res.payload?.fieldErrors) {
          setLocalErrors(res.payload.fieldErrors);
        } else {
          toast.error(res.payload || 'Creation Failed');
        }
      }
    }
  };

  const FieldError = ({ field }) => {
    const error = localErrors[field];
    if (!error) return null;
    return (
      <motion.p
        initial={{ opacity: 0, y: -4, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -4, height: 0 }}
        className="flex items-center gap-1.5 text-danger text-xs mt-2 pl-1"
      >
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        {error}
      </motion.p>
    );
  };

  return (
    <div className="min-h-screen bg-bgPrimary flex flex-col md:flex-row">
      {/* Left side art */}
      <div className="hidden md:flex flex-1 relative overflow-hidden items-center justify-center border-r border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accentSecondary/10 via-bgPrimary to-bgPrimary" />
        <div className="absolute w-[500px] h-[500px] border border-accentPrimary/20 rounded-full animate-[spin_60s_linear_infinite] flex items-center justify-center">
          <div className="absolute w-[300px] h-[300px] border border-accentSecondary/20 rounded-full animate-[spin_40s_reverse_linear_infinite]" />
        </div>
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-24 h-24 bg-bgSecondary border border-border rounded-3xl rotate-45 mx-auto flex items-center justify-center mb-8 shadow-glow"
          >
            <Shield className="w-10 h-10 text-accentSecondary -rotate-45" />
          </motion.div>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl font-bold mb-4"
          >
            Secure your<br/><span className="text-accentSecondary">Digital Obsidian.</span>
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-textSecondary"
          >
            Advanced encryption meets minimalist design.<br/>Enter the most secure vault.
          </motion.p>
        </div>
      </div>

      {/* Right side form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative z-10">
        <motion.div
          className="w-full max-w-md mx-auto"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-3xl font-bold mb-2">{isLogin ? 'Welcome Back' : 'Initialize Vault'}</h2>
              <p className="text-textSecondary mb-8">
                {isLogin ? 'Access your secure credentials.' : 'Create your encrypted vault in seconds.'}
              </p>
            </motion.div>
          </AnimatePresence>
          
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-xs font-bold text-accentSecondary tracking-widest uppercase mb-2">Display Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full bg-bgPrimary border ${localErrors.name ? 'border-danger' : 'border-border'} rounded-full py-3 px-6 text-textPrimary focus:outline-none focus:border-accentPrimary focus:shadow-glow transition-all duration-300`}
                    placeholder="Vault Owner"
                  />
                  <AnimatePresence><FieldError field="name" /></AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-bold text-accentSecondary tracking-widest uppercase mb-2">Email Address</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full bg-bgPrimary border ${localErrors.email ? 'border-danger' : 'border-border'} rounded-full py-3 px-6 text-textPrimary focus:outline-none focus:border-accentPrimary focus:shadow-glow transition-all duration-300`}
                placeholder="name@company.com"
              />
              <AnimatePresence><FieldError field="email" /></AnimatePresence>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-accentSecondary tracking-widest uppercase">Master Password</label>
                {isLogin && <a href="#" className="text-xs text-textSecondary hover:text-accentPrimary transition-colors">Forgot?</a>}
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full bg-bgPrimary border ${localErrors.password ? 'border-danger' : 'border-border'} rounded-full py-3 pl-6 pr-12 text-textPrimary focus:outline-none focus:border-accentPrimary focus:shadow-glow transition-all duration-300`}
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-textSecondary hover:text-textPrimary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                </button>
              </div>
              <AnimatePresence><FieldError field="password" /></AnimatePresence>
            </div>

            {isLogin && (
              <div className="flex items-center gap-3 mt-4">
                <input type="checkbox" className="w-4 h-4 rounded border-border bg-bgSecondary text-accentSecondary focus:ring-accentSecondary/50 focus:ring-offset-bgPrimary" />
                <span className="text-sm text-textSecondary">Keep vault unlocked for 24 hours</span>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-accentSecondary text-bgPrimary font-bold py-4 rounded-full hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex justify-center items-center gap-2 disabled:opacity-50 mt-8 cursor-pointer"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <span>{isLogin ? 'Login to Vault' : 'Create Vault'}</span>}
            </motion.button>
          </form>

          <p className="mt-12 text-sm text-textSecondary text-center">
            {isLogin ? 'New to the secure ecosystem? ' : 'Already have a secure session? '}
            <Link to={isLogin ? '/signup' : '/login'} className="text-textPrimary font-bold hover:text-accentSecondary transition-colors">
              {isLogin ? 'Create Account' : 'Login Here'}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
