import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ResendVerification from './pages/ResendVerification';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import MemberDetail from './pages/MemberDetail';
import Attendance from './pages/Attendance';
import Cotisations from './pages/Cotisations';
import Statistics from './pages/Statistics';
import Notifications from './pages/Notifications';

// Route protégée
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Routes de vérification d'email - CORRIGÉ */}
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/verify-email/success" element={<VerifyEmail />} />
          <Route path="/verify-email/error" element={<VerifyEmail />} />
          
          <Route path="/resend-verification" element={<ResendVerification />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="members" element={<Members />} />
            <Route path="members/:id" element={<MemberDetail />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="cotisations" element={<Cotisations />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
