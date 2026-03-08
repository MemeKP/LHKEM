import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import Swal from 'sweetalert2';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const navigate = useNavigate();
  const { t, ct } = useTranslation();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    role: 'TOURIST',
    email: '',
    firstname: '',
    lastname: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const safeMessage = (value, fallbackTH, fallbackEN) => {
    if (Array.isArray(value)) {
      const joined = value.filter(Boolean).join('\n');
      if (joined.trim().length > 0) return joined;
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
    return ct(fallbackTH, fallbackEN);
  };

  const safeTranslate = (key, fallbackTH, fallbackEN) => {
    if (!key) return ct(fallbackTH, fallbackEN);
    const translated = t(key);
    if (translated && translated !== key) {
      return translated;
    }
    return ct(fallbackTH, fallbackEN);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: t('common.error') || ct('ข้อมูลไม่ถูกต้อง', 'Invalid information'),
        text: t('auth.passwordMismatch') || ct('รหัสผ่านไม่ตรงกัน กรุณาลองอีกครั้ง', 'Passwords do not match. Please try again.'),
        confirmButtonText: t('common.ok') || ct('ตกลง', 'OK'),
        confirmButtonColor: '#f97316',
      });
      return;
    }
    const payload = {
      email: formData.email,
      firstname: formData.firstname,
      lastname: formData.lastname,
      phone: formData.phone,
      password: formData.password,
      role: formData.role,
    };
    try {
      const res = await register(payload);
      if (res.success) {
        const successTitle = safeTranslate('auth.registerSuccessTitle', 'สมัครสมาชิกสำเร็จ', 'Registration successful');
        const successMessage = safeTranslate('auth.registerSuccessMessage', 'บัญชีของคุณพร้อมใช้งานแล้ว', 'Your account is ready to use.');
        const continueLabel = safeTranslate('common.continue', 'ดำเนินการต่อ', 'Continue');
        await Swal.fire({
          icon: 'success',
          title: successTitle,
          text: successMessage,
          confirmButtonText: continueLabel,
          confirmButtonColor: '#16a34a',
        });

        if (formData.role === 'SHOP_OWNER') {
          navigate('/loeng-him-kaw/shop/dashboard');
        } else if (formData.role === 'COMMUNITY_ADMIN') {
          navigate('/community-admin/dashboard');
        } else if (formData.role === 'PLATFORM_ADMIN') {
          navigate('/platform-admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: t('common.error') || ct('เกิดข้อผิดพลาด', 'Something went wrong'),
          text: safeMessage(
            res?.message,
            'ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง',
            'Unable to complete the action. Please try again.'
          ),
          confirmButtonText: t('common.ok') || ct('ตกลง', 'OK'),
          confirmButtonColor: '#d33',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t('common.error') || ct('เกิดข้อผิดพลาด', 'Something went wrong'),
        text: safeMessage(
          error?.response?.data?.message ?? error?.message,
          'ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง',
          'Unable to register. Please try again.'
        ),
        confirmButtonText: t('common.ok') || ct('ตกลง', 'OK'),
        confirmButtonColor: '#d33',
      });
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
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">{t('auth.registerTitle')}</h2>
          <p className="text-lg font-bold text-gray-800 mb-8">
            {t('auth.registerDescription')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-3">
                {t('auth.role') || 'บทบาท'}
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'TOURIST' })}
                  className={`px-4 py-3 rounded-lg border-2 text-lg font-bold transition-all duration-200 ${
                    formData.role === 'TOURIST'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-orange-300'
                  }`}
                >
                  {t('auth.roleTourist') || 'นักท่องเที่ยว'}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'SHOP_OWNER' })}
                  className={`px-4 py-3 rounded-lg border-2 text-lg font-bold transition-all duration-200 ${
                    formData.role === 'SHOP_OWNER'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-orange-300'
                  }`}
                >
                  {t('auth.roleShop') || 'ร้านค้า'}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'COMMUNITY_ADMIN' })}
                  className={`px-4 py-3 rounded-lg border-2 text-lg font-bold transition-all duration-200 ${
                    formData.role === 'COMMUNITY_ADMIN'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-orange-300'
                  }`}
                >
                  {t('auth.roleAdmin') || 'ผู้ดูแล'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-lg font-bold text-gray-800 mb-2">
                {t('auth.email')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tourist@email.com"
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">
                  {t('auth.firstName')}
                </label>
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  placeholder="นิรันดร์"
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">
                  {t('auth.lastName')}
                </label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  placeholder="แม่ศรี"
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-lg font-bold text-gray-800 mb-2">
                {t('auth.phone')}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0812345678"
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
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
                placeholder="••••••••"
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-bold text-gray-800 mb-2">
                {t('auth.confirmPassword')}
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold py-3 rounded-lg transition-all transform hover:scale-105"
            >
              {t('auth.registerButton')}
            </button>

            <p className="text-center text-lg font-bold text-gray-800">
              {t('auth.haveAccount')}{' '}
              <Link to="/login" className="text-orange-600 hover:text-orange-700 border-b-2 border-transparent hover:border-orange-600">
                {t('auth.loginButton')}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
