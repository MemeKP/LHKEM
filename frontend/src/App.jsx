import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import CommunityLayout from './layouts/CommunityLayout';
import SimpleLayout from './layouts/SimpleLayout';
import Landing from './pages/Landing';
import CommunityHome from './pages/CommunityHome';
import Users from './pages/Users';
import Map from './pages/Map';
import Workshops from './pages/Workshops';
import WorkshopDetail from './pages/WorkshopDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import UserDashboard from './pages/UserDashboard';
import Settings from './pages/Settings';
import ShopDashboard from './pages/ShopOwnerPages/ShopDashboard';
import ShopProfile from './pages/ShopOwnerPages/ShopProfile';
import ShopCreate from './pages/ShopOwnerPages/ShopCreate';
import ShopWorkshopCreate from './pages/ShopOwnerPages/ShopWorkshopCreate';
import ShopWorkshopDetail from './pages/ShopOwnerPages/ShopWorkshopDetail';
import OldCommunityDashboard from './pages/CommunityPages/OldCommunityDashboard';
import CommunityAdminDashboard from './pages/CommunityPages/CommunityAdminDashboard';
import EventCreateForm from './pages/CommunityPages/EventCreateForm';
import EventList from './pages/CommunityPages/EventList';
import EventDetailPage from './pages/CommunityPages/EventDetailPage';
import WorkshopPendingList from './pages/CommunityPages/WorkshopPendingList';
import WorkshopApprovalPage from './pages/CommunityPages/WorkshopApprovalPage';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Landing Page - With SimpleLayout (Navbar but no community menus) */}
            <Route path="/" element={<SimpleLayout />}>
              <Route index element={<Landing />} />
            </Route>
            
            {/* Community Routes - With CommunityLayout */}
            <Route path="/:slug" element={<CommunityLayout />}>
              <Route index element={<CommunityHome />} />
              <Route path="users" element={<Users />} />
              <Route path="map" element={<Map />} />
              <Route path="workshops" element={<Workshops />} />
              <Route path="workshops/:id" element={<WorkshopDetail />} />
              <Route path="about" element={<div className="p-8 text-center">About Page - Coming Soon</div>} />
            </Route>
            
            {/* User/Admin Routes - With SimpleLayout */}
            <Route path="/" element={<SimpleLayout />}>
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
              <Route path="shop/create" element={
                <ProtectedRoute>
                  <ShopCreate />
                </ProtectedRoute>
              } />
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
              <Route path="shop/workshops/create" element={
                <ProtectedRoute>
                  <ShopWorkshopCreate />
                </ProtectedRoute>
              } />
              <Route path="shop/workshops/:id" element={
                <ProtectedRoute>
                  <ShopWorkshopDetail />
                </ProtectedRoute>
              } />
              
              {/* Community Admin Routes */}
              {/* Old Dashboard - เชื่อมกับ API (เพื่อนทำไว้) */}
              <Route path="community/dashboard" element={
                <ProtectedRoute>
                  <OldCommunityDashboard />
                </ProtectedRoute>
              } />
              {/* New Dashboard - UI Only */}
              <Route path="community-admin/dashboard" element={
                <ProtectedRoute>
                  <CommunityAdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="community-admin/events" element={
                <ProtectedRoute>
                  <EventList />
                </ProtectedRoute>
              } />
              <Route path="community-admin/events/create" element={
                <ProtectedRoute>
                  <EventCreateForm />
                </ProtectedRoute>
              } />
              <Route path="community-admin/events/:id" element={
                <ProtectedRoute>
                  <EventDetailPage />
                </ProtectedRoute>
              } />
              <Route path="community-admin/events/:id/edit" element={
                <ProtectedRoute>
                  <EventCreateForm />
                </ProtectedRoute>
              } />
              <Route path="community-admin/workshops/pending" element={
                <ProtectedRoute>
                  <WorkshopPendingList />
                </ProtectedRoute>
              } />
              <Route path="community-admin/workshops/:id" element={
                <ProtectedRoute>
                  <WorkshopApprovalPage />
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
