import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, User, Settings, LogOut, LayoutDashboard, Store, Users, Shield } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { language, toggleLanguage, t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  
  const isActive = (path) => location.pathname === path;

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
    const first =
      (user && (user.firstName || user.firstname)) ||
      null;
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
        { to: '/community/dashboard', icon: LayoutDashboard, label: t('nav.communityDashboard') },
        { to: '/settings', icon: Settings, label: t('nav.settings') }
      ];
    }
    
    if (role === 'PLATFORM_ADMIN') {
      return [
        { to: '/admin/dashboard', icon: Shield, label: t('nav.adminDashboard') },
        { to: '/settings', icon: Settings, label: t('nav.settings') }
      ];
    }
    
    // Default for TOURIST
    return [
      { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
      { to: '/settings', icon: Settings, label: t('nav.settings') }
    ];
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="p-2 rounded-full" style={{ backgroundColor: '#111827' }}>
              <span className="text-white font-bold text-sm">LHK</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm" style={{ color: '#111827' }}>{t('nav.logoTitle')}</span>
              <span className="text-xs" style={{ color: '#6b7280' }}>{t('nav.logoSubtitle')}</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`font-medium transition-colors border-b-2 pb-1 ${isActive('/') ? '' : 'border-transparent'}`}
              style={{ 
                color: isActive('/') ? '#111827' : '#4b5563',
                borderColor: isActive('/') ? '#ea580c' : 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ea580c'}
              onMouseLeave={(e) => e.currentTarget.style.color = isActive('/') ? '#111827' : '#4b5563'}
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/workshops"
              className={`font-medium transition-colors border-b-2 pb-1 ${isActive('/workshops') ? '' : 'border-transparent'}`}
              style={{ 
                color: isActive('/workshops') ? '#111827' : '#4b5563',
                borderColor: isActive('/workshops') ? '#ea580c' : 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ea580c'}
              onMouseLeave={(e) => e.currentTarget.style.color = isActive('/workshops') ? '#111827' : '#4b5563'}
            >
              {t('nav.workshops')}
            </Link>
            <Link
              to="/map"
              className={`font-medium transition-colors border-b-2 pb-1 ${isActive('/map') ? '' : 'border-transparent'}`}
              style={{ 
                color: isActive('/map') ? '#111827' : '#4b5563',
                borderColor: isActive('/map') ? '#ea580c' : 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ea580c'}
              onMouseLeave={(e) => e.currentTarget.style.color = isActive('/map') ? '#111827' : '#4b5563'}
            >
              {t('nav.map')}
            </Link>
            <Link
              to="/about"
              className={`font-medium transition-colors border-b-2 pb-1 ${isActive('/about') ? '' : 'border-transparent'}`}
              style={{ 
                color: isActive('/about') ? '#111827' : '#4b5563',
                borderColor: isActive('/about') ? '#ea580c' : 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ea580c'}
              onMouseLeave={(e) => e.currentTarget.style.color = isActive('/about') ? '#111827' : '#4b5563'}
            >
              {t('nav.about')}
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 transition-colors"
              style={{ color: '#4b5563' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#4b5563'}
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">{language} / {language === 'TH' ? 'EN' : 'TH'}</span>
            </button>
            
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 font-medium transition-colors px-3 py-2 rounded-lg"
                  style={{ color: '#374151' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <User className="h-5 w-5" />
                  <span>{getUserDisplayName()}</span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-slideDown">
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
                    
                    {getRoleSpecificMenuItems().map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={index}
                          to={item.to}
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
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      );
                    })}
                    
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
              <>
                <Link
                  to="/login"
                  className="font-medium transition-colors"
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
              </>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
            style={{ color: '#374151' }}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link
              to="/"
              className={`block font-medium transition-colors ${isActive('/') ? 'border-l-4 pl-3' : 'pl-4'}`}
              style={{ 
                color: isActive('/') ? '#ea580c' : '#111827',
                borderColor: isActive('/') ? '#ea580c' : 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ea580c'}
              onMouseLeave={(e) => e.currentTarget.style.color = isActive('/') ? '#ea580c' : '#111827'}
              onClick={() => setIsMenuOpen(false)}
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/workshops"
              className={`block font-medium transition-colors ${isActive('/workshops') ? 'border-l-4 pl-3' : 'pl-4'}`}
              style={{ 
                color: isActive('/workshops') ? '#ea580c' : '#4b5563',
                borderColor: isActive('/workshops') ? '#ea580c' : 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ea580c'}
              onMouseLeave={(e) => e.currentTarget.style.color = isActive('/workshops') ? '#ea580c' : '#4b5563'}
              onClick={() => setIsMenuOpen(false)}
            >
              {t('nav.workshops')}
            </Link>
            <Link
              to="/map"
              className={`block font-medium transition-colors ${isActive('/map') ? 'border-l-4 pl-3' : 'pl-4'}`}
              style={{ 
                color: isActive('/map') ? '#ea580c' : '#4b5563',
                borderColor: isActive('/map') ? '#ea580c' : 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ea580c'}
              onMouseLeave={(e) => e.currentTarget.style.color = isActive('/map') ? '#ea580c' : '#4b5563'}
              onClick={() => setIsMenuOpen(false)}
            >
              {t('nav.map')}
            </Link>
            <Link
              to="/about"
              className={`block font-medium transition-colors ${isActive('/about') ? 'border-l-4 pl-3' : 'pl-4'}`}
              style={{ 
                color: isActive('/about') ? '#ea580c' : '#4b5563',
                borderColor: isActive('/about') ? '#ea580c' : 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ea580c'}
              onMouseLeave={(e) => e.currentTarget.style.color = isActive('/about') ? '#ea580c' : '#4b5563'}
              onClick={() => setIsMenuOpen(false)}
            >
              {t('nav.about')}
            </Link>
            <div className="pt-3 border-t space-y-2">
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-1 pl-4"
                style={{ color: '#4b5563' }}
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">{language} / {language === 'TH' ? 'EN' : 'TH'}</span>
              </button>
              
              {isAuthenticated ? (
                <>
                  <div className="pl-4 py-2 font-medium" style={{ color: '#111827' }}>
                    <User className="h-4 w-4 inline mr-2" />
                    {getUserDisplayName()}
                  </div>
                  <Link
                    to="/dashboard"
                    className="block font-medium pl-4 py-2"
                    style={{ color: '#374151' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4 inline mr-2" />
                    {t('nav.dashboard')}
                  </Link>
                  <Link
                    to="/settings"
                    className="block font-medium pl-4 py-2"
                    style={{ color: '#374151' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 inline mr-2" />
                    {t('nav.settings')}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block font-medium pl-4 py-2 w-full text-left"
                    style={{ color: '#dc2626' }}
                  >
                    <LogOut className="h-4 w-4 inline mr-2" />
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block font-medium pl-4"
                    style={{ color: '#374151' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="block text-white font-semibold px-6 py-2 rounded-full text-center transition-colors ml-4 mr-4"
                    style={{ backgroundColor: '#f97316' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f97316'}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.register')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
