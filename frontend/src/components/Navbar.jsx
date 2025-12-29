import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, toggleLanguage, t } = useTranslation();
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

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
                className="flex items-center space-x-1"
                style={{ color: '#4b5563' }}
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">{language} / {language === 'TH' ? 'EN' : 'TH'}</span>
              </button>
              <Link
                to="/login"
                className="block font-medium"
                style={{ color: '#374151' }}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="block text-white font-semibold px-6 py-2 rounded-full text-center transition-colors"
                style={{ backgroundColor: '#f97316' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f97316'}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.register')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
