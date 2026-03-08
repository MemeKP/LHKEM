import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import Swal from 'sweetalert2';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, ct } = useTranslation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const showErrorAlert = (message) => {
    Swal.fire({
      icon: 'error',
      title: t('common.error') || ct('เกิดข้อผิดพลาด', 'Something went wrong'),
      text: message || ct('ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง', 'Unable to complete the action. Please try again.'),
      confirmButtonText: t('common.ok') || ct('ตกลง', 'OK'),
      confirmButtonColor: '#d33',
    });
  };

  const extractErrorMessage = (fallback, error) => {
    const msg = error?.response?.data?.message ?? error?.message ?? fallback;
    return Array.isArray(msg) ? msg.join('\n') : msg;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Redirect based on user role
        const userRole = result.user?.role;
        const from = location.state?.from?.pathname;
        let redirectPath;
        
        if (userRole === 'COMMUNITY_ADMIN') {
          // Community Admin: return to previous page if public, otherwise dashboard
          const protectedPaths = ['/dashboard', '/settings', '/shop', '/platform-admin'];
          const isProtectedPath = from && protectedPaths.some(path => from.startsWith(path));
          redirectPath = (from && !isProtectedPath) ? from : '/community-admin/dashboard';
        } else if (userRole === 'SHOP_OWNER') {
          // Shop Owner: fetch their shop's community and redirect to shop dashboard
          const protectedPaths = ['/dashboard', '/settings', '/platform-admin', '/community-admin'];
          const isProtectedPath = from && protectedPaths.some(path => from.startsWith(path));
          
          // Fetch shop owner's community slug
          try {
            const shopResponse = await api.get('/api/shops/me', {
              headers: { Authorization: `Bearer ${result.token}` }
            });
            
            if (shopResponse.data?.communityId) {
              const communityResponse = await api.get(`/api/communities/${shopResponse.data.communityId}`);
              const shopSlug = communityResponse.data.slug;
              
              // If on community page, stay there; otherwise go to shop dashboard
              if (from && !isProtectedPath) {
                redirectPath = from;
              } else {
                redirectPath = `/${shopSlug}/shop/dashboard`;
              }
            } else {
              // No shop found, redirect to create shop page (no slug needed)
              redirectPath = '/shop/create';
            }
          } catch (error) {
            console.error('Failed to fetch shop community:', error);
            // Fallback to create shop page
            redirectPath = '/shop/create';
          }
        } else if (userRole === 'PLATFORM_ADMIN') {
          // Platform Admin: return to previous page if public, otherwise admin dashboard
          const protectedPaths = ['/dashboard', '/settings', '/shop', '/community-admin'];
          const isProtectedPath = from && protectedPaths.some(path => from.startsWith(path));
          redirectPath = (from && !isProtectedPath) ? from : '/platform-admin/dashboard';
        } else {
          // Tourist/User: return to previous page if it was public, otherwise go to landing
          const protectedPaths = ['/dashboard', '/settings', '/community-admin', '/shop', '/platform-admin'];
          const isProtectedPath = from && protectedPaths.some(path => from.startsWith(path));
          
          if (from && !isProtectedPath) {
            // Return to the public page they were viewing
            redirectPath = from;
          } else {
            // Go to landing page for protected or undefined paths
            redirectPath = '/';
          }
        }
        
        navigate(redirectPath, { replace: true });
      } else {
        showErrorAlert(t('auth.loginErrorMessage') || result.message || 'กรุณาตรวจสอบอีเมลหรือรหัสผ่านอีกครั้ง');
      }
    } catch (error) {
      const message = extractErrorMessage(t('auth.loginErrorMessage') || 'ไม่สามารถเข้าสู่ระบบได้', error);
      showErrorAlert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex animate-fadeIn">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="/images/login_bg.jpg"
          alt={t('auth.communityName')}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-12 text-white">
          <h1 className="text-5xl font-bold mb-4">
            {t('auth.welcomeTitle')}<br />
            {t('auth.communityName')}
          </h1>
          <p className="text-xl font-bold opacity-90">
            {t('auth.welcomeDescription')}
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-white relative">
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="w-full max-w-md animate-slideUp">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">{t('auth.loginTitle')}</h2>
          <p className="text-lg font-bold text-gray-800 mb-8">
            {t('auth.loginDescription')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-2">
                {t('auth.email')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tourist@test.com"
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-lg font-bold text-gray-800 mb-2">
                {t('auth.password')}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="test123"
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-lg text-orange-600 hover:text-orange-700 font-bold"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-3 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? t('common.loading') : t('auth.loginButton')}
            </button>

            <p className="text-center text-lg font-bold text-gray-800">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="text-orange-600 hover:text-orange-700 border-b-2 border-transparent hover:border-orange-600">
                {t('auth.registerButton')}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
