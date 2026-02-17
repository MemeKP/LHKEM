import { useState, useEffect } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { MapPin, Calendar, Heart, Leaf, Users, Palette, HomeIcon, List, BookXIcon, Box, BoxesIcon, Sparkle, SparklesIcon, Clock, Users as UsersIcon, Star, Store, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import workshopData from '../data/workshops';
import WorkshopModal from '../components/WorkshopModal';
import ETicketModal from '../components/ETicketModal';
import api from '../services/api';
import { useQuery } from '@tanstack/react-query';
import { communityEventsMock } from '../data/eventsMock';
import { getShopsByCommunity } from '../services/shopService';

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
  const params = useParams();
  const [activeWorkshop, setActiveWorkshop] = useState(null);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [showETicket, setShowETicket] = useState(false);
  const [shops, setShops] = useState([]);

  useEffect(() => {
    const fetchCommunity = async () => {
      const response = await api.get(`/api/communities/${params.slug}`);
      const communityData = response.data;

      // Fetch shops for this community
      if (communityData._id) {
        try {
          const shopsData = await getShopsByCommunity(communityData._id);
          setShops(shopsData.slice(0, 3)); // Show only first 3 shops on home page
        } catch (error) {
          console.error('Failed to fetch shops:', error);
        }
      }
    };
    fetchCommunity();
  }, [params.slug]);
  const API_URL = import.meta.env.VITE_API_URL;

  console.log("images: ", `${API_URL}/uploads/${community.images?.[1]}`)

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
  const eventCards = communityEventsMock.map((ev) => ({
    ...ev,
    title: ct(ev.title, ev.title_en),
    description: ct(ev.description, ev.description_en),
    date: ct(ev.date, ev.date_en),
    location: ct(ev.location, ev.location_en),
  }));

  const handleOpenModal = (workshop) => setActiveWorkshop(workshop);
  const handleCloseModal = () => setActiveWorkshop(null);

  const handleBookingSuccess = (booking) => {
    setCurrentBooking(booking);
    setShowETicket(true);
  };

  const handleCloseETicket = () => {
    setShowETicket(false);
    setCurrentBooking(null);
  };

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
                {ct(
                  community.hero_section?.title
                    ? community.hero_section.title
                    : `${community.name} ชุมชนแห่งความสุข`,
                  community.hero_section?.title_en
                    ? community.hero_section.title_en
                    : `${community.name_en} Community of Happiness`
                )}
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

      {/* Image Gallery Section */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-block bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              {ct('ภาพบรรยากาศ', 'Gallery')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {ct('สัมผัสบรรยากาศชุมชน', 'Experience Our Community')}
            </h2>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 gap-4">
            {/* Top Large Image - Full Width */}
            <div className="h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow relative">
              <img
                src={`${API_URL}/uploads/${community.images?.[1]}`}
                alt={ct('รูปภาพหลัก', 'Main Image')}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Bottom Row: 1 Large Left + 2 Small Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[700px] md:h-[850px]">
              {/* Large image - Left side */}
              <div className="h-full rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow relative">
                <img
                  src={`${API_URL}/uploads/${community.images?.[0]}`}
                  alt={ct('รูปภาพหลัก 2', 'Main Image 2')}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Small images - Right side, stacked */}
              <div className="grid grid-rows-2 gap-4 h-full">
                <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow relative">
                  <img
                    src={`${API_URL}/uploads/${community.images?.[2]}`}
                    alt={ct('รูปภาพ 2', 'Image 2')}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow relative">
                  <img
                    src={`${API_URL}/uploads/${community.images?.[3]}`}
                    alt={ct('รูปภาพ 3', 'Image 3')}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
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

      {/* Map Section - Enlarged */}
      <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-block bg-orange-50 text-orange-600 font-semibold text-sm px-4 py-2 rounded-full mb-4">
              {t('explore.badge')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{t('explore.title')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">{t('explore.description')}</p>
          </div>

          {/* Larger Map Placeholder */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
            <div className="h-96 md:h-[500px] bg-gradient-to-br from-blue-100 via-green-50 to-yellow-50 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">
                  {ct('แผนที่ชุมชนแบบอินเทอร์แอคทีฟ', 'Interactive Community Map')}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {ct('(กำลังพัฒนา)', '(Coming Soon)')}
                </p>
              </div>
            </div>

            {/* View Full Map Button Overlay */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <Link
                to={`/${community.slug}/map`}
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition shadow-xl border-2 border-gray-200"
              >
                <MapPin className="h-5 w-5" />
                {t('explore.viewMap')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              {ct('กิจกรรมในชุมชน', 'Community Events')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {ct('กำลังจะจัดขึ้น', 'Upcoming Events')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {ct('ติดตามกิจกรรมพิเศษ เทศกาล และงานชุมชนที่กำลังจะเกิดขึ้น', 'See festivals and special events happening in the community')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventCards.map((event) => (
              <Link
                to={`/${community.slug}/events/${event.id}`}
                key={event.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition block"
              >
                <div className={`relative h-44 bg-gradient-to-br ${event.gradient}`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Calendar className="h-16 w-16 text-white/60" />
                  </div>
                  <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-xs font-semibold text-gray-700">
                    {event.date}
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 leading-snug line-clamp-2">
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-semibold text-orange-600">{ct('ดูรายละเอียด', 'View details')}</span>
                    <button className="px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition">
                      {ct('เข้าร่วม', 'Join')}
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to={`/${community.slug}/events`}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-gray-300 rounded-full text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition font-semibold"
            >
              {ct('ดู Event ทั้งหมด', 'View All Events')}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Shops Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-green-50 text-green-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              {ct('ร้านค้าในชุมชน', 'Local Shops')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {ct('ร้านค้าและผู้ให้บริการ', 'Shops & Service Providers')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {ct('ร้านค้าท้องถิ่นที่เปิดให้บริการเวิร์กช็อปและประสบการณ์ทางวัฒนธรรม', 'Local shops offering workshops and cultural experiences')}
            </p>
          </div>

          {/* Shops Grid */}
          <div className="relative">
            {shops.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <Store className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {ct('ยังไม่มีร้านค้าในชุมชนนี้', 'No shops available yet')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shops.map((shop, index) => {
                  const gradients = [
                    'from-orange-300 via-orange-400 to-orange-500',
                    'from-green-300 via-green-400 to-green-500',
                    'from-blue-300 via-blue-400 to-blue-500'
                  ];
                  const gradient = gradients[index % gradients.length];
                  
                  return (
                    <Link key={shop._id} to={`/${community.slug}/shops/${shop._id}`} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition group">
                      <div className="relative h-48 overflow-hidden">
                        {shop.coverUrl ? (
                          <img src={shop.coverUrl} alt={shop.shopName} className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${gradient}`}>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Store className="h-16 w-16 text-white/50" />
                            </div>
                          </div>
                        )}
                        <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-xs font-semibold text-gray-700">
                          {shop.status === 'ACTIVE' ? ct('เปิดให้บริการ', 'Active') : ct('รอการอนุมัติ', 'Pending')}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition">
                          {shop.shopName}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {shop.description || ct('ไม่มีคำอธิบาย', 'No description')}
                        </p>
                        {shop.location?.address && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                            <MapPin className="h-4 w-4" />
                            <span className="line-clamp-1">{shop.location.address}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          {shop.openTime && (
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="h-4 w-4" />
                              <span>{shop.openTime}</span>
                            </div>
                          )}
                          <span className="px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-semibold group-hover:bg-gray-800 transition">
                            {ct('ดูร้าน', 'View Shop')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* View All Shops Button */}
          <div className="text-center mt-10">
            <Link
              to={`/${community.slug}/shops`}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-gray-300 rounded-full text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition font-semibold"
            >
              {ct('ดูร้านค้าทั้งหมด', 'View All Shops')}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Workshop Section */}
      <section className="py-20 px-4 bg-[#fdf7ef]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              {t('workshopSection.badge')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {t('workshopSection.title')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('workshopSection.description')}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <p className="text-gray-500 mt-4">{t('workshops.loading')}</p>
            </div>
          ) : workshopCards.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">{t('workshops.noData')}</p>
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

      <WorkshopModal
        workshop={activeWorkshop}
        isOpen={!!activeWorkshop}
        onClose={handleCloseModal}
        onBookingSuccess={handleBookingSuccess}
      />
      <ETicketModal
        booking={currentBooking}
        isOpen={showETicket}
        onClose={handleCloseETicket}
      />
    </div>
  );
};

export default CommunityHome;
