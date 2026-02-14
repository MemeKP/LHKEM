import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import CommunityLayout from './layouts/CommunityLayout';
import SimpleLayout from './layouts/SimpleLayout';
import AdminLayoutWithNav from './layouts/AdminLayoutWithNav';
import Landing from './pages/Landing';
import CommunityHome from './pages/CommunityHome';
import Users from './pages/Users';
import Map from './pages/Map';
import Workshops from './pages/Workshops';
import WorkshopDetail from './pages/WorkshopDetail';
import Shops from './pages/Shops';
import ShopProfile from './pages/ShopProfile';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import UserDashboard from './pages/UserDashboard';
import Settings from './pages/Settings';
import ShopDashboard from './pages/ShopOwnerPages/ShopDashboard';
import ShopOwnerProfile from './pages/ShopOwnerPages/ShopProfile';
import ShopCreate from './pages/ShopOwnerPages/ShopCreate';
import ShopWorkshopCreate from './pages/ShopOwnerPages/ShopWorkshopCreate';
import ShopWorkshopDetail from './pages/ShopOwnerPages/ShopWorkshopDetail';
import ShopWorkshopEdit from './pages/ShopOwnerPages/ShopWorkshopEdit';
import OldCommunityDashboard from './pages/CommunityPages/OldCommunityDashboard';
import CommunityAdminDashboard from './pages/CommunityPages/CommunityAdminDashboard';
import AdminDashboard from './pages/CommunityPages/AdminDashboard';
import AdminCommunityInfo from './pages/CommunityPages/AdminCommunityInfo';
import AdminCommunitySettings from './pages/CommunityPages/AdminCommunitySettings';
import AdminWorkshopConfirmation from './pages/CommunityPages/AdminWorkshopConfirmation';
import EventCreateForm from './pages/CommunityPages/EventCreateForm';
import EventList from './pages/CommunityPages/EventList';
import EventDetailPage from './pages/CommunityPages/EventDetailPage';
import WorkshopPendingList from './pages/CommunityPages/WorkshopPendingList';
import WorkshopApprovalPage from './pages/CommunityPages/WorkshopApprovalPage';
import PlatformAdminLayout from './layouts/PlatformAdminLayout';
import PlatformDashboard from './pages/PlatformAdminPages/PlatformDashboard';
import PlatformOverview from './pages/PlatformAdminPages/PlatformOverview';
import PlatformCommunityDetail from './pages/PlatformAdminPages/PlatformCommunityDetail';
import PlatformCreateCommunity from './pages/PlatformAdminPages/PlatformCreateCommunity';
import PlatformEditCommunity from './pages/PlatformAdminPages/PlatformEditCommunity';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Landing Page - With SimpleLayout (Navbar but no community menus) */}
            <Route path="/" element={<SimpleLayout />}>
              <Route index element={<Landing />} />
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
            </Route>
            
            {/* Community Routes - With CommunityLayout */}
            <Route path="/:slug" element={<CommunityLayout />}>
              <Route index element={<CommunityHome />} />
              <Route path="users" element={<Users />} />
              <Route path="map" element={<Map />} />
              <Route path="workshops" element={<Workshops />} />
              <Route path="workshops/:id" element={<WorkshopDetail />} />
              <Route path="shops" element={<Shops />} />
              <Route path="shops/:shopId" element={<ShopProfile />} />
              <Route path="about" element={<About />} />
              
              {/* User Dashboard - stays in community layout */}
              <Route path="dashboard" element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } />
              
              {/* Settings - stays in community layout */}
              <Route path="settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              
              {/* Shop Owner Routes - in community context */}
              <Route path="shop/create" element={
                <ProtectedRoute allowedRoles={['SHOP_OWNER']}>
                  <ShopCreate />
                </ProtectedRoute>
              } />
              <Route path="shop/dashboard" element={
                <ProtectedRoute allowedRoles={['SHOP_OWNER']}>
                  <ShopDashboard />
                </ProtectedRoute>
              } />
              <Route path="shop/profile" element={
                <ProtectedRoute allowedRoles={['SHOP_OWNER']}>
                  <ShopOwnerProfile />
                </ProtectedRoute>
              } />
              <Route path="shop/workshops/create" element={
                <ProtectedRoute allowedRoles={['SHOP_OWNER']}>
                  <ShopWorkshopCreate />
                </ProtectedRoute>
              } />
              <Route path="shop/workshops/:id" element={
                <ProtectedRoute allowedRoles={['SHOP_OWNER']}>
                  <ShopWorkshopDetail />
                </ProtectedRoute>
              } />
              <Route path="shop/workshops/:id/edit" element={
                <ProtectedRoute allowedRoles={['SHOP_OWNER']}>
                  <ShopWorkshopEdit />
                </ProtectedRoute>
              } />
            </Route>
            
            
            {/* Community Admin Routes - With AdminLayoutWithNav (Navbar + Footer) */}
            <Route path="/community-admin" element={<AdminLayoutWithNav />}>
              <Route path="dashboard" element={
                <ProtectedRoute allowedRoles={['COMMUNITY_ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="info" element={
                <ProtectedRoute allowedRoles={['COMMUNITY_ADMIN']}>
                  <AdminCommunityInfo />
                </ProtectedRoute>
              } />
              <Route path="settings" element={
                <ProtectedRoute allowedRoles={['COMMUNITY_ADMIN']}>
                  <AdminCommunitySettings />
                </ProtectedRoute>
              } />
              <Route path="account-settings" element={
                <ProtectedRoute allowedRoles={['COMMUNITY_ADMIN']}>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="workshops/:id/approve" element={
                <ProtectedRoute allowedRoles={['COMMUNITY_ADMIN']}>
                  <AdminWorkshopConfirmation />
                </ProtectedRoute>
              } />
              <Route path="old-dashboard" element={
                <ProtectedRoute allowedRoles={['COMMUNITY_ADMIN']}>
                  <CommunityAdminDashboard />
                </ProtectedRoute>
              } />
              {/* Event Management Routes */}
              <Route path="events" element={
                <ProtectedRoute allowedRoles={['COMMUNITY_ADMIN']}>
                  <EventList />
                </ProtectedRoute>
              } />
              <Route path="events/create" element={
                <ProtectedRoute allowedRoles={['COMMUNITY_ADMIN']}>
                  <EventCreateForm />
                </ProtectedRoute>
              } />
              <Route path="events/:id" element={
                <ProtectedRoute allowedRoles={['COMMUNITY_ADMIN']}>
                  <EventDetailPage />
                </ProtectedRoute>
              } />
              <Route path="events/:id/edit" element={
                <ProtectedRoute allowedRoles={['COMMUNITY_ADMIN']}>
                  <EventCreateForm />
                </ProtectedRoute>
              } />
              {/* Workshop Management Routes */}
              <Route path="workshops/pending" element={
                <ProtectedRoute allowedRoles={['COMMUNITY_ADMIN']}>
                  <WorkshopPendingList />
                </ProtectedRoute>
              } />
              <Route path="workshops/:id" element={
                <ProtectedRoute allowedRoles={['COMMUNITY_ADMIN']}>
                  <WorkshopApprovalPage />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* Platform Admin Routes - With PlatformAdminLayout */}
            <Route path="/platform-admin" element={<PlatformAdminLayout />}>
              <Route path="dashboard" element={
                <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}>
                  <PlatformDashboard />
                </ProtectedRoute>
              } />
              <Route path="overview" element={
                <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}>
                  <PlatformOverview />
                </ProtectedRoute>
              } />
              <Route path="communities/create" element={
                <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}>
                  <PlatformCreateCommunity />
                </ProtectedRoute>
              } />
              <Route path="communities/:id" element={
                <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}>
                  <PlatformCommunityDetail />
                </ProtectedRoute>
              } />
              <Route path="communities/:id/edit" element={
                <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}>
                  <PlatformEditCommunity />
                </ProtectedRoute>
              } />
              <Route path="settings" element={
                <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}>
                  <Settings />
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
