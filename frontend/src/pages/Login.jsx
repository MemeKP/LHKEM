import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login:', formData);
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
          src="/path/to/login-image.jpg"
          alt={t('auth.communityName')}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-12 text-white">
          <h1 className="text-4xl font-bold mb-4">
            {t('auth.welcomeTitle')}<br />
            {t('auth.communityName')}
          </h1>
          <p className="text-lg opacity-90">
            {t('auth.welcomeDescription')}
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative">
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="w-full max-w-md animate-slideUp">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.loginTitle')}</h2>
          <p className="text-gray-600 mb-8">
            {t('auth.loginDescription')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.email')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tourist@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.password')}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105"
            >
              {t('auth.loginButton')}
            </button>

            <p className="text-center text-sm text-gray-600">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="text-orange-600 hover:text-orange-700 font-medium">
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
