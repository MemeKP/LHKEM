import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, User, Settings, LogOut, LayoutDashboard, Shield } from 'lucide-react';
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
    navigate('/');
  };

  const getUserDisplayName = () => {
    const first = (user && (user.firstName || user.firstname)) || null;
    return first || (user?.email?.split('@')[0] || 'User');
  };

  const getRoleSpecificMenuItems = () => {
    const role = user?.role;

    if (role === 'SHOP_OWNER') {
      return [
        { to: '/shop/dashboard', icon: LayoutDashboard, label: t('nav.shopDashboard') },
        { to: '/settings', icon: Settings, label: t('nav.settings') }
      ];
    }

    if (role === 'COMMUNITY_ADMIN') {
      return [
        { to: '/community-admin/dashboard', icon: LayoutDashboard, label: t('nav.communityDashboard') },
        { to: '/settings', icon: Settings, label: t('nav.settings') }
      ];
    }

    if (role === 'PLATFORM_ADMIN') {
      return [
        { to: '/admin/dashboard', icon: Shield, label: t('nav.adminDashboard') },
        { to: '/settings', icon: Settings, label: t('nav.settings') }
      ];
    }

    return [
      { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
      { to: '/settings', icon: Settings, label: t('nav.settings') }
    ];
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 transition-shadow duration-300 hover:shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group transition-transform duration-200 hover:scale-105">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-full shadow-md group-hover:shadow-lg transition-all duration-200">
              <span className="text-white font-bold text-sm">LHKEM</span>
            </div>
            <span className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-200">Platform</span>
          </Link>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200 border border-transparent hover:border-orange-200"
            >
              <Globe className="h-4 w-4 transition-transform duration-200 hover:rotate-12" />
              <span className="text-sm font-medium">{language === 'th' ? 'TH' : 'EN'}</span>
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 px-3 py-2 rounded-lg transition-all duration-200 border border-transparent hover:border-orange-200"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">{getUserDisplayName()}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-xs text-gray-500">{t('nav.signedInAs')}</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
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
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    ))}

                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-all duration-200 w-full"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{t('nav.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:text-orange-600 font-medium transition-all duration-200 rounded-lg hover:bg-orange-50 border border-transparent hover:border-orange-200"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
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
