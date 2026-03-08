import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Plus, ChevronDown, Settings, LogOut, Home, Menu, X, LayoutDashboard, BarChart3 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';

const PlatformAdminLayout = () => {
  const { user, logout } = useAuth();
  const { ct, language, toggleLanguage } = useTranslation();
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const getUserDisplayName = () => {
    const first = (user && (user.firstName || user.firstname)) || null;
    return first || (user?.email?.split('@')[0] || 'User');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navAction = (path) => {
    navigate(path);
    setShowUserDropdown(false);
    setShowMobileMenu(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3]">
      {/* Platform Admin Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo + Home */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navAction('/platform-admin/dashboard')}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                title="Home"
              >
                <Home className="h-5 w-5 text-orange-500" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-gray-900">Community</span>
                <span className="bg-orange-500 text-white text-sm font-bold px-2.5 py-1 rounded">
                  Admin
                </span>
              </div>
            </div>

            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center gap-4">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="px-3 py-1.5 text-base font-bold text-gray-700 hover:text-orange-500 transition-colors"
              >
                {language?.toUpperCase() === 'TH' ? 'TH / EN' : 'EN / TH'}
              </button>

              {/* User Info with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
                >
                  <div className="flex flex-col items-end">
                    <span className="text-base font-bold text-gray-900">
                      {ct('Platform Admin', 'Platform Admin')}
                    </span>
                    <span className="text-sm font-bold text-gray-500">{user?.email}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                    <span className="text-white font-bold text-base">
                      {getUserDisplayName().charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Desktop Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => navAction('/platform-admin/dashboard')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-base font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      <span>{ct('แดชบอร์ดแพลตฟอร์ม', 'Platform Dashboard')}</span>
                    </button>
                    <button
                      onClick={() => navAction('/platform-admin/overview')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-base font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <BarChart3 className="h-5 w-5" />
                      <span>{ct('ภาพรวมแพลตฟอร์ม', 'Platform Overview')}</span>
                    </button>
                    <button
                      onClick={() => navAction('/settings')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-base font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="h-5 w-5" />
                      <span>{ct('ตั้งค่า', 'Settings')}</span>
                    </button>
                    <div className="border-t border-gray-200 my-2"></div>
                    <button
                      onClick={() => {
                        logout();
                        navAction('/');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-base font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>{ct('ออกจากระบบ', 'Logout')}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Create Community Button */}
              <button
                onClick={() => navAction('/platform-admin/communities/create')}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-base font-bold px-5 py-2.5 rounded-full transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>{ct('สร้าง Community', 'Create Community')}</span>
              </button>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {showMobileMenu && (
          <div ref={mobileMenuRef} className="md:hidden border-t border-gray-200 bg-white shadow-lg animate-slideDown">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-white font-bold text-base">
                    {getUserDisplayName().charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900">{getUserDisplayName()}</p>
                  <p className="text-sm font-bold text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="py-2">
              <button
                onClick={() => navAction('/platform-admin/dashboard')}
                className="w-full flex items-center gap-3 px-4 py-3 text-base font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LayoutDashboard className="h-5 w-5 text-orange-500" />
                <span>{ct('แดชบอร์ด', 'Dashboard')}</span>
              </button>
              <button
                onClick={() => navAction('/platform-admin/overview')}
                className="w-full flex items-center gap-3 px-4 py-3 text-base font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <BarChart3 className="h-5 w-5 text-orange-500" />
                <span>{ct('ภาพรวม', 'Overview')}</span>
              </button>
              <button
                onClick={() => navAction('/platform-admin/communities/create')}
                className="w-full flex items-center gap-3 px-4 py-3 text-base font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Plus className="h-5 w-5 text-green-600" />
                <span>{ct('สร้าง Community', 'Create Community')}</span>
              </button>
              <button
                onClick={() => navAction('/settings')}
                className="w-full flex items-center gap-3 px-4 py-3 text-base font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="h-5 w-5 text-gray-500" />
                <span>{ct('ตั้งค่า', 'Settings')}</span>
              </button>

              <div className="px-4 py-2">
                <button
                  onClick={toggleLanguage}
                  className="w-full text-center px-3 py-2 text-base font-bold text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {language?.toUpperCase() === 'TH' ? '🇹🇭 TH / EN' : '🇬🇧 EN / TH'}
                </button>
              </div>

              <div className="border-t border-gray-200 my-1"></div>
              <button
                onClick={() => {
                  logout();
                  navAction('/');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-base font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>{ct('ออกจากระบบ', 'Logout')}</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-extrabold text-gray-900">Community</span>
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                Admin
              </span>
            </div>
            
            <div className="flex items-center space-x-6 text-base font-bold text-gray-600">
              <button
                onClick={() => navigate('/')}
                className="hover:text-orange-500 transition-colors"
              >
                {ct('กลับสู่หน้าหลัก', 'Back to Home')}
              </button>
              <span>© 2025 LHKEM Platform</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PlatformAdminLayout;
