import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Users from './pages/Users';
import Map from './pages/Map';
import Workshops from './pages/Workshops';
import WorkshopDetail from './pages/WorkshopDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import UserDashboard from './pages/UserDashboard';
import Settings from './pages/Settings';
import ShopDashboard from './pages/ShopDashboard';
import ShopProfile from './pages/ShopProfile';
import CommunityAdminDashboard from './pages/CommunityAdminDashboard';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="users" element={<Users />} />
              <Route path="map" element={<Map />} />
              <Route path="workshops" element={<Workshops />} />
              <Route path="workshops/:id" element={<WorkshopDetail />} />
              
              {/* User Routes */}
              <Route path="dashboard" element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } />
              <Route path="settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              
              {/* Shop Owner Routes */}
              <Route path="shop/dashboard" element={
                <ProtectedRoute>
                  <ShopDashboard />
                </ProtectedRoute>
              } />
              <Route path="shop/profile" element={
                <ProtectedRoute>
                  <ShopProfile />
                </ProtectedRoute>
              } />
              
              {/* Community Admin Routes */}
              <Route path="community/dashboard" element={
                <ProtectedRoute>
                  <CommunityAdminDashboard />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* Auth Routes - Without Layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
