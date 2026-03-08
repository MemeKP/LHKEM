import { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { Search, MapPin, Clock, Users as UsersIcon, ChevronLeft, ChevronRight } from 'lucide-react';

import { useTranslation } from '../hooks/useTranslation';
import WorkshopModal from '../components/WorkshopModal';
import ETicketModal from '../components/ETicketModal';
import { workshopService } from '../services/workshopService';
import { formatNumericDate } from '../utils/dateFormatter';
import { getWorkshopAvailabilityState } from '../utils/workshopAvailability';

const Workshops = () => {
  const { t, ct } = useTranslation();
  const { community } = useOutletContext() || {};
  const { slug } = useParams();

  const [selectedCategory, setSelectedCategory] = useState('all'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([]);
  const [activeWorkshop, setActiveWorkshop] = useState(null);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [showETicket, setShowETicket] = useState(false);

  const [workshops, setWorkshops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const categories = [
    { id: 'all', name: ct('ทั้งหมด', 'All'), value: 'all' },
    { id: 'creative', name: ct('งานฝีมือ', 'Crafts'), value: 'งานฝีมือ' }, 
    { id: 'art', name: ct('ศิลปะ', 'Art'), value: 'ศิลปะ' },
    { id: 'cooking', name: ct('อาหาร', 'Cooking'), value: 'อาหาร' },
    { id: 'culture', name: ct('วัฒนธรรม', 'Culture'), value: 'วัฒนธรรม' }
  ];

  const priceRanges = [
    { id: 'free', label: ct('0-500 บาท', '0-500 THB') },
    { id: 'mid', label: ct('500-1,000 บาท', '500-1,000 THB') },
    { id: 'high', label: ct('1,000+ บาท', '1,000+ THB') }
  ];

  const handleOpenModal = async (workshop) => {
    setActiveWorkshop(workshop);

    if (workshop && (workshop._id || workshop.id)) {
      try {
        const targetId = workshop._id || workshop.id;
        // Fix: Use the workshopService instead of the missing 'api' import
        await workshopService.incrementView(targetId);
      } catch (err) {
        console.warn('Could not update view count:', err);
      }
    }
  };
  
  const handleCloseModal = () => setActiveWorkshop(null);
  
  const handleBookingSuccess = (booking) => {
    setCurrentBooking(booking);
    setShowETicket(true);
  };
  
  const handleCloseETicket = () => {
    setShowETicket(false);
    setCurrentBooking(null);
  };

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        setIsLoading(true);
        const data = await workshopService.getAllWorkshops();
        setWorkshops(Array.isArray(data) ? data : (data?.data || []));
      } catch (err) {
        console.error("Failed to fetch workshops:", err);
        setError(ct('ไม่สามารถโหลดข้อมูลเวิร์กชอปได้ในขณะนี้', 'Could not load workshops at this time.'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  const normalizeId = useMemo(() => (value) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      if (value._id) return value._id;
      if (value.id) return value.id;
      if (typeof value.toString === 'function') return value.toString();
    }
    return String(value);
  }, []);

  const currentCommunityId = normalizeId(community?._id) || normalizeId(community?.id);

  const filteredWorkshops = workshops.filter(w => {
    if (!w) return false;
    const safeTitle = w.title || ''; 
    const matchesSearch = safeTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const workshopCommunityId = normalizeId(w.communityId) || normalizeId(w.community_id) || normalizeId(w.community);
    const workshopCommunitySlug = w.communitySlug || w.community?.slug;

    const matchesCommunity = currentCommunityId
      ? workshopCommunityId === currentCommunityId
      : slug
        ? (workshopCommunitySlug === slug)
        : true;

    let matchesCategory = true;
    if (selectedCategory !== 'all') {
      const activeCategoryObj = categories.find(c => c.id === selectedCategory);
      matchesCategory = activeCategoryObj && (w.category === activeCategoryObj.value || w.categories?.includes(activeCategoryObj.value));
    }

    return matchesSearch && matchesCategory && matchesCommunity;
  });

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filteredWorkshops.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedWorkshops = filteredWorkshops.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage((prev) => {
      if (filteredWorkshops.length === 0) return 1;
      if (prev < 1) return 1;
      if (prev > totalPages) return totalPages;
      return prev;
    });
  }, [filteredWorkshops.length, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-lg font-bold text-gray-700">{ct('กำลังโหลดเวิร์กชอป...', 'Loading workshops...')}</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-lg font-bold text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8 animate-slideUp">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ color: '#111827' }}>
            {t('workshops.title') || ct('ค้นหาเวิร์กชอป', 'Discover Workshops')}
          </h1>
          <p className="text-xl font-bold mb-6" style={{ color: '#4b5563' }}>
            {t('workshops.description') || ct('ค้นพบและเรียนรู้ทักษะใหม่ๆ จากเวิร์กชอปที่น่าสนใจ', 'Discover and learn new skills from engaging workshops')}
          </p>

          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: '#9ca3af' }} />
            <input
              type="text"
              placeholder={t('workshops.searchPlaceholder') || ct('ค้นหาเวิร์กชอป...', 'Search workshops...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border rounded-full focus:outline-none transition-all"
              style={{ borderColor: '#d1d5db' }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px #f97316';
                e.currentTarget.style.borderColor = 'transparent';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 space-y-6 animate-slideUp">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-600">
              <h3 className="text-xl font-extrabold mb-4" style={{ color: '#111827' }}>
                {t('workshops.categories') || ct('หมวดหมู่', 'Categories')}
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="w-full text-left px-4 py-2 rounded-lg text-lg font-bold transition-all transform hover:scale-105"
                    style={{
                      backgroundColor: selectedCategory === category.id ? '#ffedd5' : 'transparent',
                      color: selectedCategory === category.id ? '#ea580c' : '#374151',
                      fontWeight: selectedCategory === category.id ? '500' : '400',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCategory !== category.id) {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCategory !== category.id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

          </aside>

          <main className="flex-1">
            {filteredWorkshops.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
                <p className="text-xl font-bold text-gray-700">
                  {ct('ขณะนี้ไม่มีเวิร์กชอปที่เปิดให้บริการ', 'There are no workshops available at this moment.')}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8 animate-stagger">
                  {paginatedWorkshops.map((workshop) => {
                    const { seatsLeft, pendingSeats, isFull, isRegistrationClosed } = getWorkshopAvailabilityState(workshop);
                    const isRegistrationStatusOpen = workshop.registrationStatus === 'OPEN' || !workshop.registrationStatus;
                    const isRegistrationOpen = isRegistrationStatusOpen && !isRegistrationClosed;

                    const formattedDate = workshop.workshopDate || workshop.date
                      ? formatNumericDate(workshop.workshopDate || workshop.date)
                      : ct('ไม่ระบุ', 'N/A');

                    return (
                      <div
                        key={workshop._id}
                        className="group relative bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col"
                      >
                        <div className="relative h-48 overflow-hidden">
                          {workshop.image || workshop.imageUrl ? (
                            <img
                              src={workshop.image || workshop.imageUrl}
                              alt={workshop.title}
                              className="w-full h-full object-cover scale-105 group-hover:scale-110 transition duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100 flex items-center justify-center">
                              <Clock className="h-12 w-12 text-orange-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                          <div className="absolute top-4 left-4">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-base font-bold bg-white/90 text-gray-800">
                              {workshop.category || ct('เวิร์กชอป', 'Workshop')}
                            </span>
                          </div>
                          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-base font-bold drop-shadow">
                            <span className={`px-3 py-1 rounded-full text-base font-bold ${isRegistrationOpen ? 'bg-green-500/80' : 'bg-gray-500/80'}`}>
                              {isRegistrationClosed
                                ? ct('ปิดรับสมัครแล้ว', 'Registration closed')
                                : isRegistrationOpen
                                  ? ct('เปิดรับสมัคร', 'Open')
                                  : ct('ปิดรับสมัคร', 'Closed')}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 p-6 space-y-5">
                          <div>
                            <h3 className="text-2xl font-extrabold text-gray-900 mb-2 line-clamp-2">
                              {workshop.title || ct('ไม่มีชื่อ', 'Untitled')}
                            </h3>
                            <p className="text-lg font-bold text-gray-700 line-clamp-2">
                              {workshop.description || ct('ไม่มีคำอธิบาย', 'No description provided.')}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 gap-3 rounded-2xl border border-orange-100 bg-orange-50/40 p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                                <Clock className="h-4 w-4 text-orange-500" />
                              </div>
                              <div>
                                <p className="text-sm uppercase tracking-wide font-bold text-orange-700">{ct('วันที่จัด', 'Date')}</p>
                                <p className="text-lg font-bold text-gray-900">{formattedDate}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                                <UsersIcon className="h-4 w-4 text-orange-500" />
                              </div>
                              <div>
                                <p className="text-sm uppercase tracking-wide font-bold text-orange-700">{ct('ที่นั่งคงเหลือ', 'Seats left')}</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-lg font-bold text-gray-900">{Math.max(0, seatsLeft)}</p>
                                  {pendingSeats > 0 && (
                                    <span className="text-[10px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">
                                      {ct('รอยืนยัน', 'Pending')} {pendingSeats}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {workshop.location && (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                                  <MapPin className="h-4 w-4 text-orange-500" />
                                </div>
                                <div>
                                  <p className="text-sm uppercase tracking-wide font-bold text-orange-700">{ct('สถานที่', 'Location')}</p>
                                  <p className="text-lg font-bold text-gray-900 line-clamp-1">{workshop.location?.address || workshop.location}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <div>
                              <div className="text-lg font-bold text-gray-600">{t('workshops.perPerson') || ct('/คน', '/person')}</div>
                              <div className="text-4xl font-extrabold text-orange-500">
                                {workshop.price === 0 ? (t('workshops.free') || ct('ฟรี', 'Free')) : `฿${workshop.price}`}
                              </div>
                            </div>
                            <button
                              className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-lg font-bold transition-all shadow-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-500 ${
                                (isRegistrationClosed || isFull) ? 'opacity-80' : ''
                              }`}
                              onClick={() => handleOpenModal(workshop)}
                            >
                              {isRegistrationClosed
                                ? ct('ปิดรับสมัครแล้ว', 'Registration closed')
                                : !isRegistrationStatusOpen
                                  ? ct('ปิดรับสมัคร', 'Closed')
                                  : isFull
                                    ? ct('เต็มแล้ว', 'Full')
                                    : (t('workshops.enrollNow') || ct('สมัครเลย', 'Enroll'))}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <button
                      type="button"
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`p-3 rounded-full border transition ${currentPage === 1 ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-lg font-bold text-gray-700">
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
          </main>
        </div>
      </div>

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

export default Workshops;