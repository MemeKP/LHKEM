import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { SiFacebook, SiInstagram, SiLine } from '@icons-pack/react-simple-icons';
import { getLogo } from '../utils/getLogo';
import { useTranslation } from '../hooks/useTranslation';

const Footer = ({ community }) => {
  const { t, ct } = useTranslation();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              {/* <div className="bg-gray-900 p-2 rounded-full">
                <span className="text-white font-bold text-sm">LHK</span>
              </div> */}
              <div className="bg-gray-900 p-2 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {getLogo(community)}
                </span>
              </div>
              <span className="text-gray-900 font-semibold">{ct(community.name, community.name_en)}</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
              {ct(community.hero_section.description, community.hero_section.description_en)}
            </p>
          </div>

          <div>
            <h3 className="text-gray-900 font-semibold mb-4">{t('footer.menu')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to={`/${community.slug}`} className="text-gray-600 hover:text-orange-600 text-sm transition-colors">
                  {t('footer.home')}
                </Link>
              </li>
              <li>
                <Link to={`/${community.slug}/workshops`} className="text-gray-600 hover:text-orange-600 text-sm transition-colors">
                  {t('footer.allWorkshops')}
                </Link>
              </li>
              <li>
                <Link to={`/${community.slug}/map`} className="text-gray-600 hover:text-orange-600 text-sm transition-colors">
                  {t('footer.communityMap')}
                </Link>
              </li>
              <li>
                <Link to={`/${community.slug}/about`} className="text-gray-600 hover:text-orange-600 text-sm transition-colors">
                  {t('footer.about')} {ct(community.name, community.name_en)}
                </Link>
              </li>
            </ul>
          </div>

          {/* <div>
            <h3 className="text-gray-900 font-semibold mb-4">ติดต่อเรา</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <span className="text-gray-600 text-sm">📍</span>
                <span className="text-gray-600 text-sm">
                  {community.location.full_address}
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
          </div> */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-3">

              {community.location?.full_address && (
                <li className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-600 text-sm break-words">
                    {ct(community.location.full_address, community.location.full_address_en)}
                  </span>
                </li>
              )}

              {community.contact_info?.phone && (
                <li className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-600 flex-shrink-0" />
                  <a
                    href={`tel:${community.contact_info.phone}`}
                    className="text-gray-600 hover:text-orange-600 text-sm transition-colors"
                  >
                    {community.contact_info.phone}
                  </a>
                </li>
              )}

              {community.contact_info?.email && (
                <li className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-600 flex-shrink-0" />
                  <a
                    href={`mailto:${community.contact_info.email}`}
                    className="text-gray-600 hover:text-orange-600 text-sm transition-colors"
                  >
                    {community.contact_info.email}
                  </a>
                </li>
              )}

              {community.contact_info?.facebook?.link && (
                <li className="flex items-center space-x-2">
                  <Facebook className="h-4 w-4 text-gray-600 flex-shrink-0" />
                  <a
                    href={community.contact_info.facebook.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-600 text-sm transition-colors"
                  >
                    {community.contact_info.facebook.name || 'Facebook'}
                  </a>
                </li>
              )}

              {community.contact_info?.line?.link && (
                <li className="flex items-center space-x-2">
                  <SiLine className="h-4 w-4 text-gray-600 flex-shrink-0" />
                  <a
                    href={community.contact_info.line.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-600 text-sm transition-colors"
                  >
                    {community.contact_info.line.name || 'Line'}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* <div>
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
          </div> */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">{t('footer.followUs')}</h3>
            <div className="flex space-x-4">
              {community.contact_info?.facebook?.link && (
                <a
                  href={community.contact_info.facebook.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow group"
                  title="ติดตามเราบน Facebook"
                >
                  <SiFacebook className="h-5 w-5 text-gray-700 group-hover:text-[#1877F2] transition-colors" />
                </a>
              )}

              {community.contact_info?.instagram?.link && (
                <a
                  href={community.contact_info.instagram.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow group"
                  title="ติดตามเราบน Instagram"
                >
                  <SiInstagram className="h-5 w-5 text-gray-700 group-hover:text-[#E4405F] transition-colors" />
                </a>
              )}

              {community.contact_info?.line?.link && (
                <a
                  href={community.contact_info.line.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow group"
                  title="เพิ่มเพื่อนบน Line"
                >
                  <SiLine className="h-5 w-5 text-gray-700 group-hover:text-[#06C755] transition-colors" />
                </a>
              )}
            </div>
          </div>

        </div>

        {/* <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 Loeng Him Kaw Community. All rights reserved.
          </p>
        </div> */}
        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} {ct(community.name, community.name_en) || 'Community'}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
