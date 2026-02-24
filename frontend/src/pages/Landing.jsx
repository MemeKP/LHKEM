import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Calendar, ArrowRight, StoreIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useTranslation } from '../hooks/useTranslation';

const fetchCommunities = async () => {
  const res = await api.get('/api/communities');
  return res.data;
};

const Landing = () => {
  const navigate = useNavigate();
  const { t, ct, language } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState('ทั้งหมด');
  const [shopCounts, setShopCounts] = useState({});

  const { data: communities = [], isLoading } = useQuery({
    queryKey: ['communities'],
    queryFn: fetchCommunities,
    initialData: []
  });

  useEffect(() => {
    if (!communities.length) {
      setShopCounts({});
      return;
    }

    const loadShopCounts = async () => {
      const results = await Promise.all(
        communities.map(async (community) => {
          try {
            const res = await api.get(`/api/shops/community/${community._id}`);
            const activeCount = Array.isArray(res.data)
              ? res.data.filter((shop) => (shop.status || '').toUpperCase() === 'ACTIVE').length
              : 0;
            return [community._id, activeCount];
          } catch (error) {
            console.error('Failed to fetch shops for community:', community._id, error);
            return [community._id, 0];
          }
        })
      );

      setShopCounts(Object.fromEntries(results));
    };

    loadShopCounts();
  }, [communities]);

  const { data: platformStats } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const communitiesRes = await api.get('/api/communities');

      const totalWorkshops = communitiesRes.data.reduce((sum, comm) =>
        sum + (comm.workshops?.length || 0), 0
      );

      // Count active shops from all communities
      let totalShops = 0;
      for (const comm of communitiesRes.data) {
        try {
          const shopsRes = await api.get(`/api/shops/community/${comm._id}`);
          totalShops += shopsRes.data.filter(shop => shop.status === 'ACTIVE').length;
        } catch (err) {
          console.error('Failed to fetch shops for community:', comm._id);
        }
      }

      return [
        { number: `${communitiesRes.data.length}`, label: ct('ชุมชน', 'Communities') },
        { number: `${totalWorkshops}`, label: ct('กิจกรรม', 'Workshops') },
        { number: `${totalShops}`, label: ct('ร้านค้า', 'Shops') }
      ];
    },
    initialData: [
      { number: '0', label: ct('ชุมชน', 'Communities') },
      { number: '0', label: ct('กิจกรรม', 'Workshops') },
      { number: '0', label: ct('ร้านค้า', 'Shops') }
    ]
  });

  const handleCommunityClick = (slug) => {
    navigate(`/${slug}`);
  };

  // Filter tags
  const filterTags = [
    'ทั้งหมด', 'กิจกรรม', 'เครื่องจักร', 'ร้าน', 'ร้านอาหาร', 'ท่องเที่ยว', 'สถานที่',
    'วัด', 'ศาลา', 'ผลิตภัณฑ์', 'ผ้า', 'งานฝีมือ', 'จักสาน'
  ];

  const API_URL = import.meta.env.VITE_API_URL

  return (

    <div className="min-h-screen bg-[#F5EFE7]">
      {/* Hero Section */}
      <section className="relative py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-[#2F4F2F] mb-3 tracking-wide animate-fadeIn">
            THE COMMUNITY
          </h1>
          <p className="text-sm text-[#6B6B6B] mb-8 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            {ct('ยินดีต้อนรับสู่ โหล่งฮิมคาว', 'Welcome to Loeng Him Kaw')}
          </p>

          {/* Thai Description */}
          <h2 className="text-2xl md:text-3xl font-bold text-[#2F4F2F] mb-2 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            {ct('สำรวจชุมชนท้องถิ่น', 'Explore Local Communities')}
          </h2>
          <h3 className="text-xl text-[#E07B39] md:text-2xl font-semibold mb-6 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            {ct('และ ', 'and ')}
            <span className="text-[#6B6B6B]">
              {ct('ประสบการณ์วัฒนธรรม', 'Cultural Experiences')}
            </span>
          </h3>

          {/* Description */}
          <p className="text-base font-semibold max-w-2xl mx-auto mb-8 leading-relaxed animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            {ct(
              'แพลตฟอร์มที่รวมชมชนท้องถิ่นต่างๆไว้ในที่เดียว เพื่อให้คุณสัมผัส วิถึชีวิต วัฒนธรรม และภูมิปัญญาท้องถิ่น',
              'A platform that brings together local communities in one place, allowing you to experience the local way of life, culture, and traditional knowledge.'
            )}
          </p>

          {/* CTA Button */}
          <button
            onClick={() => {
              const element = document.getElementById('communities-section');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 bg-[#E07B39] hover:bg-[#D66B29] text-white font-semibold px-8 py-3 rounded-full shadow-md transition-all hover:scale-105 hover:shadow-lg mb-12 animate-fadeIn"
            style={{ animationDelay: '0.5s' }}
          >
            {ct('เริ่มสำรวจชุมชน', 'Start Exploring')}
          </button>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
            {platformStats.map((stat, index) => (
              <div key={index} className="text-center animate-fadeIn" style={{ animationDelay: `${0.6 + index * 0.1}s` }}>
                <div className="text-3xl font-bold text-[#E07B39] mb-1 hover:scale-110 transition-transform">{stat.number}</div>
                <div className="text-sm text-[#6B6B6B]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Communities Section */}
      <section id="communities-section" className="py-16 px-4 bg-[#EBE4D8]">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#2F4F2F] mb-2">
              {ct('ชุมชนของเรา', 'Our Communities')}
            </h2>
            <p className="text-[#6B6B6B] font-semibold mb-6">
              {ct(
                'เลือกชุมชนที่คุณสนใจ เพื่อค้นพบกิจกรรมและประสบการณ์ที่น่าสนใจ',
                'Choose your community to discover exciting activities and experiences'
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {communities.map((community, index) => {
                const imgSrc = community.images?.length > 0 ? community.images[0] : null;
                const imgSrcFullUrl = imgSrc ? `${API_URL}${imgSrc}` : null;

                return (
                  <div
                    key={community._id}
                    className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Community Image */}
                    <div className="aspect-video bg-gray-200 relative overflow-hidden">
                      {imgSrcFullUrl ? (
                        <img
                          src={imgSrcFullUrl}
                          alt={language === 'th' ? community.name : community.name_en}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none'; // ซ่อนรูปถ้าโหลดไม่ได้
                          
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <MapPin className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Community Info */}
                    <div className="p-5">
                      {/* Community Name */}
                      <h3 className="text-xl font-bold text-[#3D3D3D] mb-2 group-hover:text-[#E07B39] transition-colors">
                        {ct(community.name, community.name_en || community.name)}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-[#6B6B6B] mb-4 line-clamp-2">
                        {ct(
                          community.hero_section?.description || community.history,
                          community.hero_section?.description_en || community.history_en || community.hero_section?.description
                        )}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-[#6B6B6B] mb-4">
                        <div className="flex items-center gap-1">
                          <StoreIcon className="h-3.5 w-3.5" />
                          <span>{shopCounts[community._id] ?? 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{community.events?.length || 0}</span>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <button
                        onClick={() => handleCommunityClick(community.slug)}
                        className="w-full bg-[#E07B39] hover:bg-[#D66B29] text-white font-medium py-2.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105"
                      >
                        {ct('เข้าชมชุมชน', 'Visit Community')}
                      </button>
                    </div>
                  </div>
                ); 
              })}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4 bg-[#F5EFE7]">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl p-10 text-center shadow-md hover:shadow-xl transition-all duration-300 animate-fadeIn">
          <h2 className="text-2xl md:text-3xl font-bold text-[#2F4F2F] mb-3">
            {ct('พร้อมที่จะ เริ่มต้น แล้วหรือยัง?', 'Ready to Get Started?')}
          </h2>
          <p className="text-base text-[#6B6B6B] font-semibold mb-6">
            {ct(
              'สำรวจชุมชนท้องถิ่นและค้นพบกิจกรรมที่น่าสนใจรอคุณอยู่',
              'Explore local communities and discover exciting activities waiting for you'
            )}
          </p>
          <button
            onClick={() => {
              const element = document.getElementById('communities-section');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 bg-[#E07B39] hover:bg-[#D66B29] text-white font-semibold px-8 py-3 rounded-full shadow-md transition-all hover:scale-105 hover:shadow-lg"
          >
            {ct('สำรวจชุมชน', 'Explore Communities')}
          </button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
