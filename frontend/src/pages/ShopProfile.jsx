import { useState, useEffect } from 'react';
import { Link, useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Phone, Facebook, Globe, ArrowLeft, Store, Calendar, Users, Star } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import WorkshopModal from '../components/WorkshopModal';
import ETicketModal from '../components/ETicketModal';
import { getShopById } from '../services/shopService';
import { getShopCoverImage } from '../utils/image';

/**
 * ShopProfile - หน้าโปรไฟล์ร้านค้าสำหรับลูกค้า
 * แสดงข้อมูลร้าน, เวิร์กช็อปที่เปิดสอน, ข้อมูลติดต่อ
 * TODO: Backend API
 * - GET /api/shops/:id - ดึงข้อมูลร้านค้า
 * - GET /api/shops/:id/workshops - ดึงเวิร์กช็อปของร้าน
 */

const ShopProfile = () => {
  const { t, ct } = useTranslation();
  const { community } = useOutletContext();
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [activeWorkshop, setActiveWorkshop] = useState(null);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [showETicket, setShowETicket] = useState(false);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const data = await getShopById(shopId);
        setShop(data);
      } catch (error) {
        console.error('Failed to fetch shop:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [shopId]);

  // Mock shop data for fallback
  const mockShop = {
    id: shopId,
    name: 'ร้านมีนา',
    name_en: 'Meena Shop',
    category: 'ร้านหัตถกรรม',
    category_en: 'Craft Shop',
    description: 'ร้านหัตถกรรมท้องถิ่นที่มีประวัติยาวนานกว่า 30 ปี เปิดสอนทำงานฝีมือและของที่ระลึกต่างๆ ด้วยเทคนิคดั้งเดิมที่สืบทอดมาจากรุ่นสู่รุ่น พร้อมทั้งจำหน่ายผลิตภัณฑ์หัตถกรรมคุณภาพสูง',
    description_en: 'A local craft shop with over 30 years of history, offering handmade workshops and souvenirs using traditional techniques passed down through generations, along with high-quality craft products.',
    location: {
      address: 'ซอย 5 ถนนหลัก ตำบลโหล่งฮิมคาว',
      address_en: 'Soi 5, Main Road, Loeng Him Kaw',
      lat: 0,
      lng: 0
    },
    contactLinks: {
      phone: '089-123-4567',
      facebook: 'https://facebook.com/meenashop',
      line: '@meenashop',
      website: 'https://meenashop.com'
    },
    openTime: '09:00',
    closeTime: '17:00',
    openDays: 'จันทร์ - เสาร์',
    openDays_en: 'Monday - Saturday',
    gradient: 'from-orange-300 via-orange-400 to-orange-500'
  };

  // Mock workshops offered by this shop
  const mockWorkshops = [
    {
      id: 1,
      title: 'ย้อมสีธรรมชาติบนผ้าฝ้าย',
      title_en: 'Natural Dyeing on Cotton',
      shortDescription: 'เรียนรู้การย้อมสีธรรมชาติจากพืชท้องถิ่น',
      shortDescription_en: 'Learn natural dyeing from local plants',
      price: 350,
      duration: '2 ชั่วโมง',
      seatsLeft: 8,
      rating: 4.8,
      level: 'เริ่มต้น',
      badge: 'ยอดนิยม',
      gradient: 'from-blue-400 via-blue-500 to-blue-600',
      location: 'ร้านมีนา',
      location_en: 'Meena Shop'
    },
    {
      id: 2,
      title: 'สานตะกร้าไม้ไผ่',
      title_en: 'Bamboo Basket Weaving',
      shortDescription: 'สานตะกร้าไม้ไผ่ด้วยเทคนิคดั้งเดิม',
      shortDescription_en: 'Weave bamboo baskets with traditional techniques',
      price: 250,
      duration: '3 ชั่วโมง',
      seatsLeft: 5,
      rating: 4.9,
      level: 'กลาง',
      badge: 'แนะนำ',
      gradient: 'from-green-400 via-green-500 to-green-600',
      location: 'ร้านมีนา',
      location_en: 'Meena Shop'
    }
  ];

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf7ef] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-[#fdf7ef] flex items-center justify-center">
        <div className="text-center">
          <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">{ct('ไม่พบข้อมูลร้านค้า', 'Shop not found')}</p>
        </div>
      </div>
    );
  }

  const displayShop = shop || mockShop;
  const coverImage = getShopCoverImage(displayShop);
  const shopAddress = displayShop.address || displayShop.location?.address;
  const formattedHours = displayShop.openTime
    ? displayShop.closeTime
      ? `${displayShop.openTime} - ${displayShop.closeTime}`
      : displayShop.openTime
    : ct('ไม่ระบุ', 'Not specified');

  return (
    <div className="min-h-screen bg-[#fdf7ef]">
      {/* Cover Banner */}
      <section className="relative h-64 md:h-80 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 overflow-hidden">
        {coverImage ? (
          <>
            <img 
              src={coverImage} 
              alt={displayShop.shopName} 
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </>
        ) : (
          <>
            <div className={`absolute inset-0 bg-gradient-to-br ${mockShop.gradient} opacity-60`}></div>
            <div className="absolute inset-0 bg-black/30"></div>
          </>
        )}
        <div className="relative h-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-8">
          <Link
            to={`/${community.slug}/shops`}
            className="absolute top-6 left-4 sm:left-6 lg:left-8 inline-flex items-center gap-2 text-white/90 hover:text-white bg-black/30 hover:bg-black/50 px-4 py-2 rounded-full transition backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{ct('กลับไปหน้าร้านค้า', 'Back to Shops')}</span>
          </Link>
          <div>
            <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white mb-2">
              {displayShop.status === 'ACTIVE' ? ct('เปิดให้บริการ', 'Active') : ct('รอการอนุมัติ', 'Pending')}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              {displayShop.shopName}
            </h1>
          </div>
        </div>
      </section>

      {/* Hero Section with Shop Info */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Shop Description */}
          <div className="mb-6">
            <p className="text-lg text-[#3D3D3D] leading-relaxed">
              {displayShop.description || ct('ไม่มีคำอธิบาย', 'No description available')}
            </p>
          </div>

          {/* Contact Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
            <div>
              {/* Contact Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Location */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <MapPin className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#2F4F2F] mb-1">
                      {ct('ที่อยู่', 'Address')}
                    </p>
                    <p className="text-sm text-[#6B6B6B]">
                      {shopAddress || ct('ไม่ระบุที่อยู่', 'No address provided')}
                    </p>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <Clock className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#2F4F2F] mb-1">
                      {ct('เวลาทำการ', 'Opening Hours')}
                    </p>
                    <p className="text-sm text-[#6B6B6B]">
                      {formattedHours}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <Phone className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#2F4F2F] mb-1">
                      {ct('โทรศัพท์', 'Phone')}
                    </p>
                    <a href={`tel:${displayShop.contact?.phone}`} className="text-sm text-[#E07B39] hover:text-[#D66B29]">
                      {displayShop.contact?.phone || ct('ไม่ระบุ', 'N/A')}
                    </a>
                  </div>
                </div>

                {/* LINE ID */}
                {displayShop.contact?.line && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0 font-bold">L</div>
                    <div>
                      <p className="text-sm font-semibold text-[#2F4F2F] mb-1">
                        {ct('LINE ID', 'LINE ID')}
                      </p>
                      <p className="text-sm text-[#6B6B6B]">
                        {displayShop.contact.line}
                      </p>
                    </div>
                  </div>
                )}

                {/* Facebook */}
                {displayShop.contact?.facebook && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <Facebook className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-[#2F4F2F] mb-1">
                        {ct('Facebook', 'Facebook')}
                      </p>
                      <p className="text-sm text-[#6B6B6B]">
                        {displayShop.contact.facebook}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Call to Action Button */}
              <button 
                onClick={() => navigate(`/${community.slug}/map`)}
                className="w-full md:w-auto px-8 py-3 bg-[#E07B39] hover:bg-[#D66B29] text-white font-semibold rounded-full transition shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
              >
                <MapPin className="h-5 w-5" />
                {ct('ดูบนแผนที่', 'View on Map')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Workshops Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <span className="inline-block bg-[#FFF7ED] text-[#E07B39] px-4 py-2 rounded-full text-sm font-semibold mb-4">
              {ct('กิจกรรมเวิร์กช็อป', 'Workshops')}
            </span>
            <h2 className="text-3xl font-bold text-[#2F4F2F] mb-3">
              {ct('กิจกรรมเวิร์กช็อปที่เปิดสอน', 'Workshops Offered')}
            </h2>
            <p className="text-[#6B6B6B]">
              {ct('เรียนรู้ทักษะใหม่ๆ จากผู้เชี่ยวชาญของร้าน', 'Learn new skills from our expert instructors')}
            </p>
          </div>

          {mockWorkshops.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {ct('ยังไม่มีเวิร์กช็อปในขณะนี้', 'No workshops available at the moment')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockWorkshops.map((workshop) => (
                <div key={workshop.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition">
                  <div className={`h-44 bg-gradient-to-br ${workshop.gradient} relative`}>
                    <div className="absolute top-4 left-4 bg-white/85 text-xs font-semibold text-gray-700 px-3 py-1 rounded-full">
                      {workshop.badge}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white">
                        <Star className="h-4 w-4 text-yellow-300" />
                        <span className="text-sm font-semibold">{workshop.rating}</span>
                      </div>
                      <span className="text-xs text-white/80">{workshop.level}</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="h-4 w-4 text-red-400" />
                      {ct(workshop.location, workshop.location_en)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#2F4F2F]">{ct(workshop.title, workshop.title_en)}</h3>
                      <p className="text-sm text-[#6B6B6B]">{ct(workshop.shortDescription, workshop.shortDescription_en)}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {workshop.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        {t('workshops.seatsLeft')}: {workshop.seatsLeft}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold text-[#2F4F2F]">
                        {workshop.price === 0 ? t('workshops.free') : `฿${workshop.price}`}
                        <span className="text-sm text-[#9CA3AF] ml-1">{t('workshops.perPerson')}</span>
                      </p>
                      <button
                        className="px-5 py-2 bg-[#2F4F2F] text-white rounded-full text-sm font-semibold hover:bg-[#1F3F1F] transition hover:scale-105"
                        onClick={() => handleOpenModal(workshop)}
                      >
                        {t('workshops.enrollNow')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

export default ShopProfile;
