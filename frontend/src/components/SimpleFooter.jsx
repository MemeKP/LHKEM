import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

/**
 * SimpleFooter - Footer สำหรับหน้าที่ไม่ได้อยู่ในชุมชน
 * ไม่ต้องการข้อมูล community
 */

const SimpleFooter = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t-2 border-gray-200 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Platform Info */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4 group">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-full shadow-md group-hover:shadow-lg transition-all duration-200">
                <span className="text-white font-bold text-sm">LHKEM</span>
              </div>
              <span className="text-gray-900 font-semibold group-hover:text-orange-600 transition-colors duration-200">Platform</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {t('footer.platformDescription') || 'แพลตฟอร์มเชื่อมโยงชุมชนท้องถิ่นกับนักท่องเที่ยว ผ่านกิจกรรมเวิร์กช็อปและประสบการณ์ทางวัฒนธรรม'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">{t('footer.quickLinks') || 'ลิงก์ด่วน'}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-orange-600 text-sm transition-all duration-200 hover:translate-x-1 inline-block">
                  {t('footer.home') || 'หน้าแรก'}
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-600 hover:text-orange-600 text-sm transition-all duration-200 hover:translate-x-1 inline-block">
                  {t('nav.login') || 'เข้าสู่ระบบ'}
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-600 hover:text-orange-600 text-sm transition-all duration-200 hover:translate-x-1 inline-block">
                  {t('nav.register') || 'สมัครสมาชิก'}
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">{t('footer.about') || 'เกี่ยวกับ'}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {t('footer.aboutDescription') || 'LHKEM Platform เป็นแพลตฟอร์มที่รวบรวมชุมชนท้องถิ่นและกิจกรรมทางวัฒนธรรม เพื่อส่งเสริมการท่องเที่ยวเชิงวัฒนธรรมและสนับสนุนเศรษฐกิจชุมชน'}
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} LHKEM Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SimpleFooter;
