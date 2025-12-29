import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gray-900 p-2 rounded-full">
                <span className="text-white font-bold text-sm">LHK</span>
              </div>
              <span className="text-gray-900 font-semibold">โหล่งฮิมคาว</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              ชุมชนหัตถกรรมเชิงนิเวศในสันกำแพง เชียงใหม่ ที่ผสานวิถีชีวิตแบบ Slow Life กับงานคราฟต์ที่เป็นมิตรกับสิ่งแวดล้อม
            </p>
          </div>

          <div>
            <h3 className="text-gray-900 font-semibold mb-4">เมนูผลิต</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-orange-600 text-sm transition-colors">
                  หน้าแรก
                </Link>
              </li>
              <li>
                <Link to="/workshops" className="text-gray-600 hover:text-orange-600 text-sm transition-colors">
                  เวิร์กช็อปทั้งหมด
                </Link>
              </li>
              <li>
                <Link to="/map" className="text-gray-600 hover:text-orange-600 text-sm transition-colors">
                  แผนที่ชุมชน
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-orange-600 text-sm transition-colors">
                  เกี่ยวกับโหล่งฮิมคาว
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 font-semibold mb-4">ติดต่อเรา</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <span className="text-gray-600 text-sm">📍</span>
                <span className="text-gray-600 text-sm">
                  บ้านมอญ ซอย 11 ต.สันกลาง อ.สันกำแพง จ.เชียงใหม่ 50130
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-600" />
                <span className="text-gray-600 text-sm"> - </span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-600" />
                <a 
                  href="mailto:info@loenghimkaw.com" 
                  className="text-gray-600 hover:text-orange-600 text-sm transition-colors"
                >
                  info@loenghimkaw.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 font-semibold mb-4">ติดตามเรา</h3>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/LoangHimKao/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <Facebook className="h-5 w-5 text-gray-700 hover:text-blue-600 transition-colors" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <Instagram className="h-5 w-5 text-gray-700 hover:text-pink-600 transition-colors" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 Loeng Him Kaw Community. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
