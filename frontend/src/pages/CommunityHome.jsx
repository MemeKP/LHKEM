import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { MapPin, Calendar, Heart, Leaf, Users, Palette, HomeIcon, List, BookXIcon, Box, BoxesIcon, Sparkle, SparklesIcon, Clock, Users as UsersIcon, Star } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import workshopData from '../data/workshops';
import WorkshopModal from '../components/WorkshopModal';
import api from '../services/api';
import { useQuery } from '@tanstack/react-query';

const fetchPopularWorkshops = async (communityId) => {
  const res = await api.get(`/api/communities/${communityId}/workshops`, {
    params: { limit: 3 }
  });
  return res.data;
}

const CommunityHome = () => {
  const { t, ct } = useTranslation();
  const { community } = useOutletContext()
  const highlights = community.cultural_highlights || []
  const workshopCount = community.workshops?.length || 0;

  // ไว้แมชไอคอนกับชื่อไฮไลท
  const getIcon = (title) => {
    if (!title) return <Star className="h-4 w-4 text-yellow-300" />
    const text = title.toLowerCase()
    if (text.includes('สิ่งแวดล้อม') || text.includes('environment') || text.includes('eco')) {
      return <Leaf className="h-5 w-5 text-green-600" />
    }
    if (text.includes('วัฒนธรรม') || text.includes('culture')) {
      return <Heart className="h-5 w-5 text-rose-500" />
    }
    if (text.includes('ชุมชน') || text.includes('craft')) {
      return <Palette className="h-5 w-5 text-indigo-500" />
    }
    if (text.includes('หยุดพัก') || text.includes('slow life')) {
      return <SparklesIcon className="h-5 w-5 text-yellow-500" />
    }
  }

  const { data: workshops, isLoading } = useQuery({
    queryKey: ['popular-workshops', community._id],
    queryFn: () => fetchPopularWorkshops(community._id),
    enabled: !!community._id,
    initialData: []
  })

  const stats = [
  { 
    number: workshopCount > 0 ? `${workshopCount}+` : '0', 
    label: t('stats.workshops') 
  },
  { 
    // ส่วน locations ตอนนี้ยังไม่มี collection ร้านค้าแยก
    number: '1', 
    label: t('stats.locations') 
  },
  { 
    // ให้ static เหมือนกันหมด
    number: '100%', 
    label: 'Eco-Friendly' 
  }
];

  const workshopCards = workshopData.slice(0, 3);
  const [activeWorkshop, setActiveWorkshop] = useState(null);

  const handleOpenModal = (workshop) => setActiveWorkshop(workshop);
  const handleCloseModal = () => setActiveWorkshop(null);

  return (
    <div className="min-h-screen bg-[#fdf7ef] animate-fadeIn">
      <section className=" relative py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-[#0f3c4c] via-[#115b52] to-[#1d7a58] text-white rounded-[32px] p-10 shadow-xl">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center space-x-2 bg-white/15 border border-white/20 px-4 py-1 rounded-full text-sm font-medium mb-6">
                <SparklesIcon className="h-4 w-4" />
                <span>{t('hero.badge')}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
                {ct(community.hero_section.title, community.hero_section.title_en)}
              </h1>
              <p className="text-lg text-white/80 mb-8 line-clamp-2">
              {ct(community.hero_section.description, community.hero_section.description_en)}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to={`/${community.slug}/workshops`}
                  className="inline-flex items-center justify-center gap-2 bg-orange-400 hover:bg-orange-500 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition"
                >
                  <BoxesIcon className="h-5 w-5" />
                  {t('hero.viewWorkshops')}
                </Link>
                <Link
                  to={`/${community.slug}/map`}
                  className="inline-flex items-center justify-center gap-2 border border-white/40 text-white px-8 py-3 rounded-full hover:bg-white/10 transition"
                >
                  <MapPin className="h-5 w-5" />
                  {t('hero.exploreMap')}
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 text-center">
                  <div className="text-3xl font-bold text-orange-300">{stat.number}</div>
                  <p className="text-sm text-white/80">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 bg-green-50 px-4 py-2 rounded-full mb-6">
              {t('homeHighlight.badge')}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f2f3a] mb-4 leading-tight">
              {ct(community.name, community.name_en)}
            </h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed line-clamp-4">
              {ct(community.history, community.history_en)}
            </p>
            <Link
              to={`/${community.slug}/about`}
              className="inline-flex items-center justify-center gap-2 bg-[#0f2f3a] text-white px-6 py-3 rounded-full hover:bg-[#112f3d] transition shadow-lg"
            >
              {t('homeHighlight.button')}
              <span>→</span>
            </Link>
          </div>

          {highlights.length === 0 ?
            (
              <p className="text-gray-500">ไม่มีข้อมูลจุดเด่น</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {highlights.map((feature, index) => (
                  <div key={index} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition">
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                      {getIcon(feature.title)}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {ct(feature.title, feature.title_en)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {ct(feature.desc, feature.desc_en)}
                    </p>
                  </div>
                ))}
              </div>)}
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold">
              {t('workshopSection.badge')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-3">{t('workshopSection.title')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">{t('workshopSection.description')}</p>
          </div>

          {isLoading ? (
            <div className="text-center py-20 text-gray-400">{t('workshops.loading')}</div>
          ) : workshops.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed">
              {t('workshops.noData')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workshopCards.map((card) => (
                <div key={card.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition">
                  <div className={`h-44 bg-gradient-to-br ${card.gradient || 'from-gray-200 via-gray-300 to-gray-400'} relative`}>
                    <div className="absolute top-4 left-4 bg-white/85 text-xs font-semibold text-gray-700 px-3 py-1 rounded-full">
                      {card.badge}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white">
                        <Star className="h-4 w-4 text-yellow-300" />
                        <span className="text-sm font-semibold">{card.rating}</span>
                      </div>
                      <span className="text-xs text-white/80">{card.level}</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="h-4 w-4 text-red-400" />
                      {ct(card.location, card.location_en)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{ct(card.title, card.title_en)}</h3>
                      <p className="text-sm text-gray-600">{ct(card.shortDescription, card.shortDescription_en)}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {card.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <UsersIcon className="h-4 w-4 text-gray-400" />
                        {t('workshops.seatsLeft')}: {card.seatsLeft}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold text-gray-900">
                        {card.price === 0 ? t('workshops.free') : `฿${card.price}`}
                        <span className="text-sm text-gray-500 ml-1">{t('workshops.perPerson')}</span>
                      </p>
                      <button
                        className="px-5 py-2 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition"
                        onClick={() => handleOpenModal(card)}
                      >
                        {t('workshops.enrollNow')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>)}

          <div className="text-center mt-10">
            <Link to={`/${community.slug}/workshops`} className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 rounded-full text-gray-700 hover:border-gray-400 transition">
              {t('workshopSection.viewAll')}
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl border border-gray-100 p-10 text-center">
          <span className="inline-block bg-orange-50 text-orange-600 font-semibold text-sm px-4 py-2 rounded-full mb-4">
            {t('explore.badge')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{t('explore.title')}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">{t('explore.description')}</p>
          <div className="h-64 rounded-2xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 mb-8">
            Interactive Map Component (Coming Soon)
          </div>
          <Link
            to={`/${community.slug}/map`}
            className="inline-flex items-center justify-center gap-2 bg-orange-400 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-500 transition"
          >
            <MapPin className="h-5 w-5" />
            {t('explore.viewMap')}
          </Link>
        </div>
      </section>

      <WorkshopModal workshop={activeWorkshop} isOpen={!!activeWorkshop} onClose={handleCloseModal} />
    </div>
  );
};

export default CommunityHome;
