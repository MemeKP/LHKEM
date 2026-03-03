import { useState, useEffect } from 'react';
import { Link, useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Phone, Facebook, Globe, ArrowLeft, Store, Calendar, Users, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import WorkshopModal from '../components/WorkshopModal';
import ETicketModal from '../components/ETicketModal';
import { getShopById } from '../services/shopService';
import { workshopService } from '../services/workshopService';
import { getShopCoverImage } from '../utils/image';
import { formatNumericDate } from '../utils/dateFormatter';
import { getWorkshopAvailabilityState } from '../utils/workshopAvailability';

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
  const [shopWorkshops, setShopWorkshops] = useState([]);
  const [workshopsLoading, setWorkshopsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

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

  const normalizeId = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      if (value._id) return value._id;
      if (value.id) return value.id;
      if (typeof value.toString === 'function') return value.toString();
    }
    return String(value);
  };

  useEffect(() => {
    const fetchShopWorkshops = async () => {
      try {
        setWorkshopsLoading(true);
        const data = await workshopService.getAllWorkshops();
        const list = Array.isArray(data) ? data : (data?.data || []);
        const filtered = list.filter((workshop) => {
          const workshopShopId = normalizeId(workshop.shopId) || normalizeId(workshop.shop);
          const matchesShop = workshopShopId === normalizeId(shopId);
          const isActive = (workshop.approvalStatus || 'ACTIVE') === 'ACTIVE';
          return matchesShop && isActive;
        });
        setShopWorkshops(filtered);
      } catch (error) {
        console.error('Failed to fetch shop workshops:', error);
        setShopWorkshops([]);
      } finally {
        setWorkshopsLoading(false);
      }
    };

    if (shopId) {
      fetchShopWorkshops();
    }
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

  const pageSize = 3;
  const totalPages = Math.max(1, Math.ceil(shopWorkshops.length / pageSize));
  const paginatedWorkshops = shopWorkshops.slice((currentPage - 1) * pageSize, (currentPage - 1) * pageSize + pageSize);

  useEffect(() => {
    setCurrentPage((prev) => {
      if (shopWorkshops.length === 0) return 1;
      if (prev < 1) return 1;
      if (prev > totalPages) return totalPages;
      return prev;
    });
  }, [shopWorkshops.length, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [shopId]);

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(totalPages, prev + 1));

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
  const contact = displayShop.contact || {};

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8">
            <p className="text-xl md:text-2xl text-[#3D3D3D] leading-relaxed whitespace-pre-line break-words max-h-56 overflow-y-auto pr-1">
              {displayShop.description || ct('ไม่มีคำอธิบาย', 'No description available')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <div className="flex items-start gap-3 p-5 bg-gray-50 rounded-2xl">
                  <MapPin className="h-6 w-6 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-[#1F2F2F] mb-1">
                      {ct('ที่อยู่', 'Address')}
                    </p>
                    <p className="text-base text-[#555555] whitespace-pre-line break-words max-h-32 overflow-y-auto pr-1">
                      {shopAddress || ct('ไม่ระบุที่อยู่', 'No address provided')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-5 bg-gray-50 rounded-2xl">
                  <Clock className="h-6 w-6 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-base font-semibold text-[#1F2F2F] mb-1">
                      {ct('เวลาทำการ', 'Opening Hours')}
                    </p>
                    <p className="text-base text-[#555555]">
                      {formattedHours}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-5 bg-gray-50 rounded-2xl">
                  <Phone className="h-6 w-6 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-base font-semibold text-[#1F2F2F] mb-1">
                      {ct('โทรศัพท์', 'Phone')}
                    </p>
                    <a href={`tel:${contact.phone || ''}`} className="text-base text-[#E07B39] hover:text-[#D66B29]">
                      {contact.phone || ct('ไม่ระบุ', 'N/A')}
                    </a>
                  </div>
                </div>

                {contact.line && (
                  <div className="flex items-start gap-3 p-5 bg-gray-50 rounded-2xl">
                    <div className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0 font-bold">L</div>
                    <div>
                      <p className="text-base font-semibold text-[#1F2F2F] mb-1">
                        {ct('LINE ID', 'LINE ID')}
                      </p>
                      <p className="text-base text-[#555555]">
                        {contact.line}
                      </p>
                    </div>
                  </div>
                )}

                {contact.facebook && (
                  <div className="flex items-start gap-3 p-5 bg-gray-50 rounded-2xl">
                    <Facebook className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-base font-semibold text-[#1F2F2F] mb-1">
                        {ct('Facebook', 'Facebook')}
                      </p>
                      <p className="text-base text-[#555555]">
                        {contact.facebook}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm mb-6">
                <h3 className="text-xl font-semibold text-[#2F4F2F] mb-4 flex items-center gap-2">
                  <Clock className="h-6 w-6 text-orange-500" />
                  {ct('เวลาทำการของร้าน', 'Shop hours')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base text-[#3D3D3D]">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wide text-gray-400">{ct('เปิดเวลา', 'Opens')}</span>
                    <span className="font-semibold text-[#1F2937]">
                      {displayShop.openTime?.trim() || ct('ไม่ระบุ', 'Not specified')}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wide text-gray-400">{ct('ปิดเวลา', 'Closes')}</span>
                    <span className="font-semibold text-[#1F2937]">
                      {displayShop.closeTime?.trim() || ct('ไม่ระบุ', 'Not specified')}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/${community.slug}/map`)}
                className="w-full md:w-auto px-10 py-4 bg-[#E07B39] hover:bg-[#D66B29] text-white text-lg font-semibold rounded-full transition shadow-lg hover:shadow-xl"
              >
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

          {workshopsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-3xl border border-gray-100 p-6 animate-pulse">
                  <div className="h-40 bg-gray-100 rounded-2xl mb-4" />
                  <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : shopWorkshops.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {ct('ยังไม่มีเวิร์กช็อปในขณะนี้', 'No workshops available at the moment')}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paginatedWorkshops.map((workshop, index) => {
                  const eventDate = workshop.workshopDate || workshop.date;
                  const formattedDate = eventDate ? formatNumericDate(eventDate) : ct('ไม่ระบุ', 'N/A');
                  const timeRange = workshop.startTime
                    ? `${workshop.startTime}${workshop.endTime ? ` - ${workshop.endTime}` : ''}`
                    : workshop.endTime
                      ? workshop.endTime
                      : ct('ไม่ระบุเวลา', 'Time TBD');
                  const { seatsLeft, isFull, isRegistrationClosed } = getWorkshopAvailabilityState(workshop);
                  const locationLabel = workshop.locationType === 'custom'
                    ? (workshop.customLocation || ct('สถานที่จะประกาศภายหลัง', 'Location to be announced'))
                    : (workshop.location?.address || shopAddress || displayShop.shopName);
                  const isRegistrationStatusOpen = workshop.registrationStatus === 'OPEN' || !workshop.registrationStatus;
                  const isRegistrationOpen = isRegistrationStatusOpen && !isRegistrationClosed;

                  return (
                    <div
                      key={workshop._id || `${workshop.title}-${index}`}
                      className="group bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
                    >
                      <div className="relative h-48 overflow-hidden">
                        {workshop.image ? (
                          <img
                            src={workshop.image}
                            alt={workshop.title}
                            className="w-full h-full object-cover scale-105 group-hover:scale-110 transition duration-500"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-200 via-amber-200 to-orange-300 flex items-center justify-center">
                            <Calendar className="h-12 w-12 text-white/70" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute top-4 left-4">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-800">
                            {workshop.category || ct('เวิร์กชอป', 'Workshop')}
                          </span>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-sm font-semibold">
                          <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs">
                            {formattedDate}
                          </span>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {timeRange}
                          </div>
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="h-4 w-4 text-orange-500" />
                          <span className="line-clamp-1">{locationLabel}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                            {workshop.title || ct('ไม่มีชื่อ', 'Untitled')}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {workshop.description || ct('ยังไม่มีคำอธิบาย', 'Description coming soon')}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 gap-3 rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50/60 to-amber-50 p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                              <Clock className="h-4 w-4 text-orange-500" />
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-orange-600">{ct('วันที่จัด', 'Date')}</p>
                              <p className="text-sm font-semibold text-gray-900">{formattedDate}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                              <Users className="h-4 w-4 text-orange-500" />
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-orange-600">{ct('ที่นั่งคงเหลือ', 'Seats left')}</p>
                              <p className="text-sm font-semibold text-gray-900">{Math.max(0, seatsLeft)}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                              <Users className="h-4 w-4 text-blue-500" />
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-orange-600">{ct('สถานะลงทะเบียน', 'Registration status')}</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {isRegistrationClosed
                                  ? ct('ปิดรับสมัครแล้ว', 'Registration closed')
                                  : isFull
                                    ? ct('เต็มแล้ว', 'Full')
                                    : isRegistrationOpen
                                      ? ct('เปิดรับสมัคร', 'Open')
                                      : ct('ปิดรับสมัคร', 'Closed')}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <div>
                            <p className="text-sm text-gray-400">{t('workshops.perPerson') || ct('/คน', '/person')}</p>
                            <p className="text-2xl font-bold text-orange-500">
                              {workshop.price === 0 ? (t('workshops.free') || ct('ฟรี', 'Free')) : `฿${workshop.price}`}
                            </p>
                          </div>
                          <button
                            className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition shadow-lg ${
                              (isRegistrationClosed || isFull) ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-500'
                            }`}
                            onClick={() => handleOpenModal(workshop)}
                          >
                            {isRegistrationClosed
                              ? ct('ปิดรับสมัครแล้ว', 'Registration closed')
                              : isRegistrationStatusOpen
                                ? (isFull ? ct('เต็มแล้ว', 'Full') : (t('workshops.enrollNow') || ct('สมัครเลย', 'Enroll Now')))
                                : ct('ปิดรับสมัคร', 'Closed')}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-8">
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`p-3 rounded-full border transition ${currentPage === 1 ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="text-sm font-semibold text-gray-600">
                    {ct('หน้า', 'Page')} {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`p-3 rounded-full border transition ${currentPage === totalPages ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </>
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
