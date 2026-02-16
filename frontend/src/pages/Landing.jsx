import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useTranslation } from '../hooks/useTranslation';

/**
 * Landing Page - หน้าแรกของแพลตฟอร์ม
 * แสดงรายการชุมชนทั้งหมดให้ผู้ใช้เลือก
 * 
 * TODO: Backend API
 * - GET /api/communities - ดึงรายการชุมชนทั้งหมด ✅ พร้อมใช้งาน
 */

const fetchCommunities = async () => {
  const res = await api.get('/api/communities');
  return res.data;
};

const Landing = () => {
  const navigate = useNavigate();
  const { t, ct, language } = useTranslation();

  const { data: communities = [], isLoading } = useQuery({
    queryKey: ['communities'],
    queryFn: fetchCommunities,
    initialData: []
  });

  const handleCommunityClick = (slug) => {
    navigate(`/${slug}`);
  };

  // Platform stats - TODO: อาจจะมี API สำหรับดึงสถิติรวม
  const platformStats = [
    { number: communities.length > 0 ? `${communities.length}+` : '0', label: ct('ชุมชน', 'Communities') },
    { number: '50+', label: ct('กิจกรรม', 'Activities') },
    { number: '15+', label: ct('ร้านค้า', 'Shops') }
  ];

  return (
    <div className="min-h-screen bg-[#fdf7ef]">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-orange-100 border border-orange-200 px-4 py-2 rounded-full text-sm font-semibold text-orange-700 mb-6">
            <Sparkles className="h-4 w-4" />
            <span>{ct('สำรวจชุมชนท้องถิ่น', 'Explore Local Communities')}</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            <>
              {ct('สำรวจชุมชนท้องถิ่น', 'Explore Local Communities')}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                {ct('และ ประสบการณ์วัฒนธรรม', 'and Cultural Experiences')}
              </span>
            </>
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            {ct(
              'ค้นพบกิจกรรมเวิร์กช็อปและประสบการณ์ทางวัฒนธรรมที่น่าสนใจจากชุมชนท้องถิ่นทั่วประเทศ ร่วมสัมผัสวิถีชีวิตและภูมิปัญญาท้องถิ่นอันงดงาม',
              'Discover exciting workshops and cultural experiences from local communities across the country. Experience the beautiful local way of life and wisdom.'
            )}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
            {platformStats.map((stat, index) => (
              <div key={index} className="text-center p-8 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-orange-200 hover:border-orange-300 transform hover:scale-105">
                <div className="text-4xl font-bold text-orange-600 mb-2">{stat.number}</div>
                <div className="text-gray-700 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={() => {
              const element = document.getElementById('communities-section');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-full shadow-lg transition-all hover:shadow-xl"
          >
            {ct('เริ่มสำรวจชุมชน', 'Start Exploring')}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Communities Section */}
      <section id="communities-section" className="py-20 px-4 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              {ct('ชุมชนของเรา', 'Our Communities')}
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {ct('เลือกชุมชนที่คุณสนใจ', 'Choose Your Community')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {ct(
                'แต่ละชุมชนมีเอกลักษณ์และกิจกรรมที่น่าสนใจรอคุณอยู่',
                'Each community has unique characteristics and exciting activities waiting for you'
              )}
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">
                {ct('กำลังโหลดชุมชน...', 'Loading communities...')}
              </p>
            </div>
          )}

          {/* No Communities */}
          {!isLoading && communities.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
              <p className="text-gray-600 text-lg">
                {ct('ยังไม่มีชุมชนในระบบ', 'No communities available yet')}
              </p>
            </div>
          )}

          {/* Community Cards */}
          {!isLoading && communities.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {communities.map((community) => (
                <div
                  key={community._id}
                  onClick={() => handleCommunityClick(community.slug)}
                  className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-gray-200 hover:border-orange-300 transform hover:scale-105 animate-fadeIn"
                >
                  {/* Community Image */}
                  <div className="aspect-video bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300 relative overflow-hidden">
                    {community.hero_section?.image ? (
                      <img
                        src={community.hero_section.image}
                        alt={language === 'th' ? community.name : community.name_en}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="h-20 w-20 text-orange-400" />
                      </div>
                    )}
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Community Info */}
                  <div className="p-6">
                    {/* Community Name */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {ct(community.name, community.name_en || community.name)}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                      {ct(
                        community.hero_section?.description || community.history,
                        community.hero_section?.description_en || community.history_en || community.hero_section?.description
                      )}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {community.workshops?.length || 0} {ct('กิจกรรม', 'activities')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>
                          {community.events?.length || 0} {ct('อีเวนต์', 'events')}
                        </span>
                      </div>
                    </div>

                    {/* Location */}
                    {community.location?.address && (
                      <div className="flex items-start gap-2 text-sm text-gray-500 mb-4">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {ct(community.location.address, community.location.address_en || community.location.address)}
                        </span>
                      </div>
                    )}

                    {/* CTA Button */}
                    <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-orange-500 hover:to-orange-600 text-white font-semibold py-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg group-hover:from-orange-500 group-hover:to-orange-600">
                      {ct('เข้าชมชุมชน', 'Visit Community')}
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-12 text-center text-white shadow-2xl border-4 border-orange-400 animate-scaleIn">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {ct('พร้อมที่จะ เริ่มต้น แล้วหรือยัง?', 'Ready to Get Started?')}
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            {ct(
              'สมัครสมาชิกวันนี้เพื่อเข้าถึงกิจกรรมและประสบการณ์พิเศษจากชุมชนท้องถิ่น',
              'Sign up today to access special activities and experiences from local communities'
            )}
          </p>
          <button
            onClick={() => navigate('/register')}
            className="inline-flex items-center gap-2 bg-white text-orange-600 hover:bg-gray-100 font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 border-2 border-white hover:border-gray-200"
          >
            {ct('สมัครสมาชิกฟรี', 'Sign Up Free')}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
