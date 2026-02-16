import { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Bell, Plus, ChevronDown, Settings, LogOut, Home, BarChart3 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';

const PlatformAdminLayout = () => {
  const { user, logout } = useAuth();
  const { ct, language, toggleLanguage } = useTranslation();
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserDisplayName = () => {
    const first = (user && (user.firstName || user.firstname)) || null;
    return first || (user?.email?.split('@')[0] || 'User');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#d6e6df]">
      {/* Platform Admin Navbar */}
      <nav className="bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <button
              onClick={() => navigate('/platform-admin/dashboard')}
              className="flex items-center space-x-2.5 hover:opacity-80 transition-opacity"
            >
              <span className="text-xl font-bold text-[#2D3B2D] italic tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>Community</span>
              <span className="bg-[#5B8C3E]/10 text-[#5B8C3E] text-xs font-semibold px-2.5 py-1 rounded-md border border-[#5B8C3E]/20">
                Admin
              </span>
            </button>

            {/* Right Side */}
            <div className="flex items-center space-x-3">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-[#2D3B2D] transition-colors"
              >
                {language === 'th' ? 'EN' : 'TH'}
              </button>

              {/* Notification Bell */}
              <button className="relative p-2 text-gray-400 hover:text-[#2D3B2D] transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 bg-[#D4842A] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-semibold">
                  3
                </span>
              </button>

              {/* User Info with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2.5 hover:bg-[#FAF8F3] rounded-xl px-3 py-1.5 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-[#5B8C3E] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {getUserDisplayName().charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold text-[#2D3B2D]">Platform Admin</span>
                    <span className="text-xs text-gray-400">{user?.email}</span>
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <button
                      onClick={() => {
                        navigate('/platform-admin/dashboard');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-[#2D3B2D] hover:bg-[#FAF8F3] transition-colors"
                    >
                      <Home className="h-4 w-4 text-gray-400" />
                      <span>{ct('แดชบอร์ดแพลตฟอร์ม', 'Platform Dashboard')}</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/platform-admin/overview');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-[#2D3B2D] hover:bg-[#FAF8F3] transition-colors"
                    >
                      <BarChart3 className="h-4 w-4 text-gray-400" />
                      <span>{ct('ภาพรวมแพลตฟอร์ม', 'Platform Overview')}</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-[#2D3B2D] hover:bg-[#FAF8F3] transition-colors"
                    >
                      <Settings className="h-4 w-4 text-gray-400" />
                      <span>{ct('ตั้งค่า', 'Settings')}</span>
                    </button>
                    <div className="border-t border-gray-100 my-1.5"></div>
                    <button
                      onClick={() => {
                        logout();
                        navigate('/');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
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
                className="flex items-center space-x-1.5 bg-[#D4842A] hover:bg-[#C0762A] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>{ct('สร้าง Community ใหม่', 'Create Community')}</span>
              </button>
            </div>
          </div>
        </div>
        {/* Orange gradient bottom line */}
        <div className="h-[3px] bg-gradient-to-r from-[#D4842A] via-[#E8A84C] to-[#D4842A]" />
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold text-[#2D3B2D] italic" style={{ fontFamily: 'Georgia, serif' }}>Community</span>
              <span className="bg-[#5B8C3E]/10 text-[#5B8C3E] text-[10px] font-semibold px-2 py-0.5 rounded border border-[#5B8C3E]/20">
                Admin
              </span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <button
                onClick={() => navigate('/')}
                className="hover:text-[#D4842A] transition-colors"
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
