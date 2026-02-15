import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

/**
 * SimpleFooter - Footer สำหรับหน้าที่ไม่ได้อยู่ในชุมชน
 * ไม่ต้องการข้อมูล community
 */

const SimpleFooter = () => {
  const { t, ct } = useTranslation();

  return (
    <footer className="bg-white border-t border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Platform Info */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gray-900 p-2 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">LHK</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">LHKEM Platform</span>
                <span className="text-xs text-gray-500">Loang Him Kao</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {ct(
                'แพลตฟอร์มเชื่อมโยงชุมชนท้องถิ่นกับนักท่องเที่ยว ผ่านกิจกรรมเวิร์กช็อปและประสบการณ์ทางวัฒนธรรม',
                'A platform connecting local communities with travelers through workshops and cultural experiences'
              )}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">{ct('ลิงก์ด่วน', 'Quick Links')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm transition-colors inline-block">
                  {ct('หน้าแรก', 'Home')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-600 hover:text-gray-900 text-sm transition-colors inline-block">
                  {t('nav.login')}
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-600 hover:text-gray-900 text-sm transition-colors inline-block">
                  {t('nav.register')}
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">{ct('เกี่ยวกับ', 'About')}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {ct(
                'แพลตฟอร์มรวบรวมชุมชนท้องถิ่นและกิจกรรมทางวัฒนธรรม เพื่อส่งเสริมการท่องเที่ยวเชิงวัฒนธรรมและสนับสนุนเศรษฐกิจชุมชน',
                'A curated platform for local communities and cultural activities to promote cultural tourism and support local economies'
              )}
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
