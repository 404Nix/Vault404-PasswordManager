import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { LayoutDashboard, Lock, User, Settings, LogOut, Shield } from 'lucide-react';
import { clsx } from 'clsx';
import { logoutUser } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const { sidebarOpen } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      // clearAuth will handle the state
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
    <div className={clsx(
      "glass border-r border-border flex flex-col transition-all duration-300",
      sidebarOpen ? "w-64" : "w-0 md:w-20 overflow-hidden"
    )}>
      {/* Brand */}
      <div className={clsx(
        "h-20 flex items-center border-b border-border text-accentSecondary font-bold text-2xl tracking-wider transition-all duration-300",
        sidebarOpen ? "px-6" : "justify-center px-0"
      )}>
        <span>V<span className="text-accentPrimary">404</span></span>
        {sidebarOpen && <span className="ml-2 text-textPrimary uppercase text-sm tracking-[0.2em] font-light">Vault</span>}
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
  );
};

export default Sidebar;
