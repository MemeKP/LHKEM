import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Globe, User, Settings, LogOut, LayoutDashboard, Shield, Info, Cog, Store } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../hooks/useAuth';

/**
 * SimpleNavbar - Navbar สำหรับหน้าที่ไม่ได้อยู่ในชุมชน
 * แสดงแค่ Logo, Language Toggle, และ User Menu
 */

const SimpleNavbar = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { language, toggleLanguage, t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    // Stay on current page after logout if it's a public page
    const currentPath = window.location.pathname;
    const publicPaths = ['/', '/login', '/register'];
    const isPublicOrCommunity = publicPaths.includes(currentPath) || 
                                (currentPath.match(/^\/[^\/]+/) && 
                                !currentPath.match(/^\/(dashboard|settings|platform-admin|community-admin|shop)/));
    
    if (!isPublicOrCommunity) {
      navigate('/');
    }
    // Otherwise stay on current page
  };

  const getUserDisplayName = () => {
    const first = (user && (user.firstName || user.firstname)) || null;
    return first || (user?.email?.split('@')[0] || 'User');
  };

  const getRoleSpecificMenuItems = () => {
    const role = user?.role;
    const { ct } = useTranslation();

    if (role === 'SHOP_OWNER') {
      // For Shop Owner on Landing Page, redirect to their community
      // TODO: Get actual community slug from user data when backend is ready
      const communitySlug = 'loeng-him-kaw'; // Default community for now
      return [
        { to: `/${communitySlug}/shop/dashboard`, icon: LayoutDashboard, label: t('nav.shopDashboard') },
        { to: '/settings', icon: Settings, label: t('nav.settings') }
      ];
    }

    if (role === 'COMMUNITY_ADMIN') {
      return [
        { to: '/community-admin/dashboard', icon: LayoutDashboard, label: ct('จัดการข้อมูลชุมชน', 'Manage Community') },
        { to: '/community-admin/info', icon: Info, label: ct('ดูแดชบอร์ด', 'View Dashboard') },
        { to: '/community-admin/settings', icon: Cog, label: ct('ตั้งค่าชุมชน', 'Community Settings') },
        { to: '/settings', icon: Settings, label: ct('ตั้งค่าบัญชี', 'Account Settings') }
      ];
    }

    if (role === 'PLATFORM_ADMIN') {
      return [
        { to: '/platform-admin/dashboard', icon: LayoutDashboard, label: ct('แดชบอร์ดแพลตฟอร์ม', 'Platform Dashboard') },
        { to: '/platform-admin/overview', icon: Shield, label: ct('ภาพรวมแพลตฟอร์ม', 'Platform Overview') },
        { to: '/platform-admin/settings', icon: Settings, label: ct('ตั้งค่า', 'Settings') }
      ];
    }

    return [
      { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
      { to: '/settings', icon: Settings, label: t('nav.settings') }
    ];
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gray-900 p-2 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">LHKEM</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm" style={{ color: '#111827' }}>LHKEM Platform</span>
              <span className="text-xs" style={{ color: '#6b7280' }}>Local Heritage & Knowledge Exchange</span>
            </div>
          </Link>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-2 px-3 py-2 rounded-full transition-colors border border-transparent"
              style={{ color: '#4b5563' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#111827';
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#4b5563';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">{language} / {language === 'TH' ? 'EN' : 'TH'}</span>
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 font-medium transition-colors px-4 py-2 rounded-full"
                  style={{ color: '#374151' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <User className="h-5 w-5" />
                  <span>{getUserDisplayName()}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-xs text-gray-500">{t('nav.signedInAs')}</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
                      <p className="text-xs text-orange-600 mt-0.5">
                        {user?.role === 'SHOP_OWNER' && t('nav.roleShop')}
                        {user?.role === 'COMMUNITY_ADMIN' && t('nav.roleCommunityAdmin')}
                        {user?.role === 'PLATFORM_ADMIN' && t('nav.rolePlatformAdmin')}
                        {user?.role === 'TOURIST' && t('nav.roleTourist')}
                      </p>
                    </div>

                    {getRoleSpecificMenuItems().map((item, index) => (
                      <Link
                        key={index}
                        to={item.to}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2.5 transition-colors"
                        style={{ color: '#374151' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                          e.currentTarget.style.color = '#ea580c';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#374151';
                        }}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    ))}

                    <div className="border-t border-gray-200 my-2"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-2.5 w-full text-left transition-colors"
                      style={{ color: '#dc2626' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="font-medium">{t('nav.logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  state={{ from: location }}
                  className="font-medium transition-colors px-4 py-2 rounded-full"
                  style={{ color: '#374151' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="text-white font-semibold px-6 py-2 rounded-full transition-colors"
                  style={{ backgroundColor: '#f97316' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f97316'}
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SimpleNavbar;
