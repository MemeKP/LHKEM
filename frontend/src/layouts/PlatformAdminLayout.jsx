import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Plus, ChevronDown, Settings, LogOut, Home } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';

const PlatformAdminLayout = () => {
  const { user, logout } = useAuth();
  const { ct, language, toggleLanguage } = useTranslation();
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const getUserDisplayName = () => {
    const first = (user && (user.firstName || user.firstname)) || null;
    return first || (user?.email?.split('@')[0] || 'User');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3]">
      {/* Platform Admin Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">Community</span>
              <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">
                Admin
              </span>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors"
              >
                {language?.toUpperCase() === 'TH' ? 'TH / EN' : 'EN / TH'}
              </button>

              {/* User Info with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
                >
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-gray-900">
                      {ct('Platform Admin', 'Platform Admin')}
                    </span>
                    <span className="text-xs text-gray-500">{user?.email}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {getUserDisplayName().charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => {
                        navigate('/platform-admin/dashboard');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Home className="h-4 w-4" />
                      <span>{ct('แดชบอร์ดแพลตฟอร์ม', 'Platform Dashboard')}</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/platform-admin/overview');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Home className="h-4 w-4" />
                      <span>{ct('ภาพรวมแพลตฟอร์ม', 'Platform Overview')}</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span>{ct('ตั้งค่า', 'Settings')}</span>
                    </button>
                    <div className="border-t border-gray-200 my-2"></div>
                    <button
                      onClick={() => {
                        logout();
                        navigate('/');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{ct('ออกจากระบบ', 'Logout')}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Create Community Button */}
              <button
                onClick={() => navigate('/platform-admin/communities/create')}
                className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-full transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>{ct('สร้าง Community ใหม่', 'Create Community')}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">Community</span>
              <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
                Admin
              </span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
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
