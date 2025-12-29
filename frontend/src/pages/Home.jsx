import { Link } from 'react-router-dom';
import { MapPin, Calendar, Heart, Leaf, Users, Palette, HomeIcon, List, BookXIcon, Box, BoxesIcon, Sparkle, SparklesIcon } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const Home = () => {
  const { t } = useTranslation();
  
  const stats = [
    { number: '15+', label: t('stats.workshops') },
    { number: '20+', label: t('stats.locations') },
    { number: '100%', label: 'Eco-Friendly' }
  ];

  const features = [
    {
      icon: <Leaf className="h-6 w-6 text-green-600" />,
      title: 'เป็นมิตรกับสิ่งแวดล้อม',
      description: 'ทุกิจกรรมใช้วัตถุดิบธรรมชาติ ปลอดสารเคมี'
    },
    {
      icon: <Heart className="h-6 w-6 text-red-500" />,
      title: 'สืบสานวัฒนธรรม',
      description: 'สัมผัสวิถีชีวิตแบบ Slow Life ท่ามกลางธรรมชาติ'
    },
    {
      icon: <HomeIcon className="h-6 w-6 text-blue-500" />,
      title: 'ชุมชนเข้มแข็ง',
      description: 'รายได้ 100% กลับคืนสู่ผู้ประกอบการและชุมชน'
    },
    {
      icon: <Palette className="h-6 w-6 text-purple-500" />,
      title: 'Slow Life',
      description: 'หยุกพัก ผ่อนคลาย และใช้เวลากับสิ่งที่ตัวเองรัก'
    }
  ];

  const workshops = [
    {
      title: 'เวิร์กช็อปทำเกษตรอินทรีย์',
      description: 'เรียนรู้เทคนิคการทำเกษตรอินทรีย์แบบครบวงจร',
      price: 'ฟรี',
      duration: '3 ชั่วโมง'
    },
    {
      title: 'เวิร์กช็อปทำผ้าย้อมสีธรรมชาติ',
      description: 'สร้างสรรค์ผ้าย้อมสีจากพืชธรรมชาติในท้องถิ่น',
      price: '200฿',
      duration: '2 ชั่วโมง'
    },
    {
      title: 'เวิร์กช็อปทำอาหารท้องถิ่น',
      description: 'ปรุงอาหารพื้นบ้านล้านนาด้วยวัตถุดิบออร์แกนิก',
      price: '300฿',
      duration: '4 ชั่วโมง'
    }
  ];

  return (
    <div className="min-h-screen animate-fadeIn">
      <section className="relative bg-gradient-to-br from-cyan-900 via-teal-800 to-green-900 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div 
          className="inline-flex items-center justify-center inline-block space-x-2 bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-slideDown">
            <SparklesIcon/> <span className="text-sm font-medium">{t('hero.badge')}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-slideUp">
            {t('hero.title')}<br />
            {t('hero.subtitle')}
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed">
            เรียนรู้เกษตรอินทรีย์ ศิลปะพื้นบ้าน และวัฒนธรรมท้องถิ่น<br />
            ผ่านเวิร์กช็อปและกิจกรรมที่หลากหลาย ท่ามกลางธรรมชาติที่สวยงาม
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              to="/workshops"
              className="inline-flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <BoxesIcon /> <span>{t('hero.viewWorkshops')}</span>
            </Link>
            <Link
              to="/map"
              className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-8 py-3 rounded-full transition-all duration-200 border border-white/30"
            >
              <MapPin className="h-5 w-5" /> <span>{t('hero.exploreMap')}</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto animate-stagger">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold text-orange-400">{stat.number}</div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-4 animate-slideUp">
            <span className="inline-block bg-green-100 text-green-600 font-semibold text-sm px-4 py-2 rounded-full">{t('about.badge')}</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 animate-slideUp">
            {t('about.title')}<br />
            {t('about.subtitle')}
          </h2>
          
          <p className="text-gray-600 leading-relaxed max-w-3xl mb-6 animate-slideUp">
            {t('about.description')}
          </p>

          <Link
            to="/about"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 animate-slideUp"
          >
            {t('about.readMore')} →
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 animate-stagger">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="bg-white w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-slideUp">
            <span className="inline-block bg-orange-100 text-orange-600 font-semibold text-sm px-4 py-2 rounded-full">{t('workshopSection.badge')}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              {t('workshopSection.title')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('workshopSection.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-stagger">
            {workshops.map((workshop, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gradient-to-br from-green-400 to-teal-500"></div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 mb-2">{workshop.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{workshop.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-orange-600 font-bold text-lg">{workshop.price}</span>
                      <span className="text-gray-500 text-sm ml-2">• {workshop.duration}</span>
                    </div>
                    <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all transform hover:scale-105">
                      {t('workshopSection.viewDetails')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/workshops"
              className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold transition-colors"
            >
              {t('workshopSection.viewAll')} →
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center animate-slideUp">
          <span className="inline-block bg-orange-100 text-orange-600 font-semibold text-sm px-4 py-2 rounded-full">{t('explore.badge')}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            {t('explore.title')}
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('explore.description')}
          </p>
          <Link
            to="/map"
            className="inline-flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <MapPin className="h-5 w-5" />
            <span>{t('explore.viewMap')}</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
