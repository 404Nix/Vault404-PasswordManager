import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import VaultPage from './pages/VaultPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3, ease: 'easeInOut' },
};

const PageWrapper = ({ children }) => (
  <motion.div {...pageTransition}>
    {children}
  </motion.div>
);

const ProtectedRoute = ({ children }) => {
  const { user, authInitialized } = useSelector((state) => state.auth);
  if (authInitialized && !user) return <Navigate to="/login" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user, authInitialized } = useSelector((state) => state.auth);
  if (authInitialized && user) return <Navigate to="/app/dashboard" replace />;
  return children;
};

const AppRoutes = () => {
  const location = useLocation();
  
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<GuestRoute><PageWrapper><LandingPage /></PageWrapper></GuestRoute>} />
      <Route path="/login" element={<GuestRoute><PageWrapper><AuthPage /></PageWrapper></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><PageWrapper><AuthPage /></PageWrapper></GuestRoute>} />
      <Route path="/register" element={<Navigate to="/signup" replace />} />
      
      <Route path="/app" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<PageWrapper><DashboardPage /></PageWrapper>} />
        <Route path="vault" element={<PageWrapper><VaultPage /></PageWrapper>} />
        <Route path="profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
        <Route path="settings" element={<PageWrapper><SettingsPage /></PageWrapper>} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
