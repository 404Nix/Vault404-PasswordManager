import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Lock, User, Settings, LogOut, Shield, X } from 'lucide-react';
import { clsx } from 'clsx';
import { logoutUser } from '../../features/auth/authSlice';
import { toggleSidebar, closeSidebar } from '../../features/ui/uiSlice';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const { sidebarOpen } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth < 768) {
      dispatch(closeSidebar());
    }
  }, [location.pathname, dispatch]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Vault', path: '/app/vault', icon: Lock },
    { name: 'Profile', path: '/app/profile', icon: User },
    { name: 'Settings', path: '/app/settings', icon: Settings },
  ];

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeSidebar())}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <div className={clsx(
        "glass border-r border-border flex flex-col transition-all duration-300 z-50",
        "fixed md:relative left-0 top-0 h-full md:h-auto w-64",
        sidebarOpen
          ? "translate-x-0 pointer-events-auto"
          : "-translate-x-full md:translate-x-0 md:w-20 overflow-hidden pointer-events-none md:pointer-events-auto"
      )}>
        {/* Brand */}
        <div className={clsx(
          "h-20 flex items-center justify-between border-b border-border text-accentSecondary font-bold text-2xl tracking-wider transition-all duration-300",
          sidebarOpen ? "px-6" : "justify-center px-0"
        )}>
          <div className="flex items-center">
            <img
              src="/assests/vault404_logo.png"
              alt="Vault404 Logo"
              className={clsx("h-10 w-auto object-contain transition-all", !sidebarOpen && "h-8")}
            />
            {sidebarOpen && <span className="ml-2 text-textPrimary uppercase text-sm tracking-[0.2em] font-light">Vault</span>}
          </div>

          {sidebarOpen && (
            <motion.button
              onClick={() => dispatch(closeSidebar())}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="md:hidden text-textSecondary hover:text-textPrimary transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </motion.button>
          )}
        </div>

        {/* User Section */}
        <div className={clsx("p-6 border-b border-border flex items-center gap-4", !sidebarOpen && "justify-center px-0")}>
          <div className="w-10 h-10 rounded-full bg-accentPrimary/20 flex items-center justify-center border border-accentPrimary shadow-[0_0_10px_rgba(124,58,237,0.3)]">
            <Shield className="w-5 h-5 text-accentPrimary" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-textPrimary truncate">{user?.name || 'Secure Session'}</p>
              <p className="text-xs text-success tracking-widest uppercase">Encrypted</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-4 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => clsx(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300",
                isActive
                  ? "bg-accentSecondary/10 text-accentSecondary shadow-[inset_0_0_10px_rgba(6,182,212,0.1)] border border-accentSecondary/20"
                  : "text-textSecondary hover:bg-bgSecondary/50 hover:text-textPrimary border border-transparent"
              )}
            >
              {({ isActive }) => (
                <motion.div
                  className="flex items-center gap-4 w-full"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                >
                  <link.icon className="w-5 h-5 shrink-0" />
                  {(sidebarOpen) && <span className="font-medium tracking-wide">{link.name}</span>}
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <motion.button
            onClick={handleLogout}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-textSecondary hover:bg-danger/10 hover:text-danger hover:border-danger/20 transition-all duration-300 border border-transparent cursor-pointer"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {(sidebarOpen) && <span className="font-medium tracking-wide">Logout</span>}
          </motion.button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
