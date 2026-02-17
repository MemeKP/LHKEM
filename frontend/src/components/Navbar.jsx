import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, User, Settings, LogOut, LayoutDashboard, Store, Users, Shield, ChevronDown, Info, Cog } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../hooks/useAuth';
import { getLogo } from '../utils/getLogo';
import axios from 'axios';
import api from '../services/api';

const Navbar = ({ community }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCommunityMenuOpen, setIsCommunityMenuOpen] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [shopCommunitySlug, setShopCommunitySlug] = useState(null);
  const { language, toggleLanguage, t, ct} = useTranslation();
  const { user, isAuthenticated, logout, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const communityMenuRef = useRef(null);

  // const isActive = (path) => location.pathname === path;
  const isActive = (path) => {
    const fullPath = path === '' ? `/${community.slug}` : `/${community.slug}/${path}`;
    if (path === '') {
      return location.pathname === fullPath || location.pathname === `${fullPath}/`;
    }
    return location.pathname.startsWith(fullPath);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (communityMenuRef.current && !communityMenuRef.current.contains(event.target)) {
        setIsCommunityMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await axios.get('/communities');
        setCommunities(response.data);
      } catch (error) {
        console.error('Failed to fetch communities:', error);
      }
    };
    fetchCommunities();
  }, []);

  // Fetch shop owner's community slug
  useEffect(() => {
    const fetchShopCommunity = async () => {
      if (user?.role === 'SHOP_OWNER' && token) {
        try {
          const response = await api.get('/api/shops/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data?.communityId) {
            // Fetch community details to get slug
            const communityResponse = await api.get(`/api/communities/${response.data.communityId}`);
            setShopCommunitySlug(communityResponse.data.slug);
          }
        } catch (error) {
          console.error('Failed to fetch shop community:', error);
          setShopCommunitySlug(null);
        }
      } else {
        // Clear slug when user is not shop owner or not logged in
        setShopCommunitySlug(null);
      }
    };
    fetchShopCommunity();
  }, [user, token]);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    // Stay on current page after logout if it's a public page
    const currentPath = window.location.pathname;
    const publicPaths = ['/', '/login', '/register'];
    const isPublicOrCommunity = publicPaths.includes(currentPath) || 
                                currentPath.match(/^\/[^\/]+/) && 
                                !currentPath.match(/^\/(dashboard|settings|platform-admin|community-admin|shop)/);
    
    if (!isPublicOrCommunity) {
      navigate('/');
    }
    // Otherwise stay on current page
  };

  const getUserDisplayName = () => {
    const first =
      (user && (user.firstName || user.firstname)) ||
      null;
    return first || (user?.email?.split('@')[0] || 'User');
  };

  const getRoleSpecificMenuItems = () => {
    const role = user?.role;

    // Check if we're in a community context (has slug in URL)
    // Match /slug or /slug/anything but NOT / or /dashboard or /settings
    const isInCommunity = window.location.pathname.match(/^\/[^\/]+/) && 
                          !window.location.pathname.match(/^\/(dashboard|settings|login|register|platform-admin|community-admin)/);

    if (role === 'SHOP_OWNER') {
      const shopSlug = shopCommunitySlug || community?.slug || 'loeng-him-kaw';
      return [
        { to: isInCommunity ? 'shop/dashboard' : `/${shopSlug}/shop/dashboard`, icon: LayoutDashboard, label: t('nav.shopDashboard') },
        { to: isInCommunity ? 'settings' : '/settings', icon: Settings, label: t('nav.settings') }
      ];
    }

    if (role === 'COMMUNITY_ADMIN') {
      return [
        { to: '/community-admin/dashboard', icon: LayoutDashboard, label: ct('จัดการข้อมูลชุมชน', 'Manage Community') },
        { to: '/community-admin/info', icon: Info, label: ct('ดูแดชบอร์ด', 'View Dashboard') },
        { to: '/community-admin/settings', icon: Cog, label: ct('ตั้งค่าชุมชน', 'Community Settings') },
        { to: isInCommunity ? 'settings' : '/settings', icon: Settings, label: ct('ตั้งค่าบัญชี', 'Account Settings') }
      ];
    }

    if (role === 'PLATFORM_ADMIN') {
      return [
        { to: '/platform-admin/dashboard', icon: LayoutDashboard, label: ct('แดชบอร์ดแพลตฟอร์ม', 'Platform Dashboard') },
        { to: '/platform-admin/overview', icon: Shield, label: ct('ภาพรวมแพลตฟอร์ม', 'Platform Overview') },
        { to: '/platform-admin/settings', icon: Settings, label: ct('ตั้งค่า', 'Settings') }
      ];
    }

    // Default for TOURIST
    return [
      { to: isInCommunity ? 'dashboard' : '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
      { to: isInCommunity ? 'settings' : '/settings', icon: Settings, label: t('nav.settings') }
    ];
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={`/`} className="flex items-center space-x-2" >
            <div className="bg-gray-900 p-2 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {getLogo(community)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm" style={{ color: '#111827' }}>{ct(community.name, community.name_en)}</span>
              <span className="text-xs" style={{ color: '#6b7280' }}>{ct(community.name, community.name_en)}</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to={`/${community.slug}`}
              className={`font-medium transition-colors border-b-2 pb-1 ${isActive('') ? '' : 'border-transparent'}`}
              style={{
                color: isActive('') ? '#111827' : '#4b5563',
                borderColor: isActive('') ? '#ea580c' : 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ea580c'}
              onMouseLeave={(e) => e.currentTarget.style.color = isActive('') ? '#111827' : '#4b5563'}
            >
              {t('nav.home')}
            </Link>
            
            <Link
              to={`/${community.slug}/shops`}
              className={`font-medium transition-colors border-b-2 pb-1 ${isActive('shops') ? '' : 'border-transparent'}`}
              style={{
                color: isActive('shops') ? '#111827' : '#4b5563',
                borderColor: isActive('shops') ? '#ea580c' : 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ea580c'}
              onMouseLeave={(e) => e.currentTarget.style.color = isActive('shops') ? '#111827' : '#4b5563'}
            >
              {t('nav.shops')}
            </Link>
            <Link
              to={`/${community.slug}/workshops`}
              className={`font-medium transition-colors border-b-2 pb-1 ${isActive('workshops') ? '' : 'border-transparent'}`}
              style={{
                color: isActive('workshops') ? '#111827' : '#4b5563',
                borderColor: isActive('workshops') ? '#ea580c' : 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ea580c'}
              onMouseLeave={(e) => e.currentTarget.style.color = isActive('workshops') ? '#111827' : '#4b5563'}
            >
              {t('nav.workshops')}
            </Link>
            
            <Link
              to={`/${community.slug}/map`}
              className={`font-medium transition-colors border-b-2 pb-1 ${isActive('map') ? '' : 'border-transparent'}`}
              style={{
                color: isActive('map') ? '#111827' : '#4b5563',
                borderColor: isActive('map') ? '#ea580c' : 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ea580c'}
              onMouseLeave={(e) => e.currentTarget.style.color = isActive('map') ? '#111827' : '#4b5563'}
            >
              {t('nav.map')}
            </Link>
            <Link
              to={`/${community.slug}/about`}
              className={`font-medium transition-colors border-b-2 pb-1 ${isActive('about') ? '' : 'border-transparent'}`}
              style={{
                color: isActive('about') ? '#111827' : '#4b5563',
                borderColor: isActive('about') ? '#ea580c' : 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ea580c'}
              onMouseLeave={(e) => e.currentTarget.style.color = isActive('about') ? '#111827' : '#4b5563'}
            >
              {t('nav.about')}
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
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
