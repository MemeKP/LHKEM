import { useState, useEffect } from 'react';
import { Search, Star, MapPin, Clock, Users as UsersIcon } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import WorkshopModal from '../components/WorkshopModal';
import ETicketModal from '../components/ETicketModal';
import { workshopService } from '../services/workshopService';

const Workshops = () => {
  const { t, ct } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([]);
  const [activeWorkshop, setActiveWorkshop] = useState(null);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [showETicket, setShowETicket] = useState(false);

  const [workshops, setWorkshops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handlePriceRangeChange = (rangeId) => {
    setPriceRange(prev => 
      prev.includes(rangeId) 
        ? prev.filter(id => id !== rangeId)
        : [...prev, rangeId]
    );
  };

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

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">{ct('กำลังโหลดเวิร์กชอป...', 'Loading workshops...')}</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  const filteredWorkshops = workshops.filter(w => {
    if (!w) return false;
    const safeTitle = w.title || ''; 
    const matchesSearch = safeTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = true;
    if (selectedCategory !== 'all') {
      const activeCategoryObj = categories.find(c => c.id === selectedCategory);
      matchesCategory = activeCategoryObj && (w.category === activeCategoryObj.value || w.categories?.includes(activeCategoryObj.value));
    }

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8 animate-slideUp">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#111827' }}>
            {t('workshops.title') || ct('ค้นหาเวิร์กชอป', 'Discover Workshops')}
          </h1>
          <p className="mb-6" style={{ color: '#4b5563' }}>
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
              <h3 className="font-semibold mb-4" style={{ color: '#111827' }}>
                {t('workshops.categories') || ct('หมวดหมู่', 'Categories')}
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="w-full text-left px-4 py-2 rounded-lg transition-all transform hover:scale-105"
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

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-600">
              <h3 className="font-semibold mb-4" style={{ color: '#111827' }}>
                {t('workshops.priceRange') || ct('ช่วงราคา', 'Price Range')}
              </h3>
              <div className="space-y-3">
                {priceRanges.map((range) => (
                  <label key={range.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={priceRange.includes(range.id)}
                      onChange={() => handlePriceRangeChange(range.id)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: '#ea580c', borderColor: '#d1d5db' }}
                    />
                    <span className="text-sm" style={{ color: '#374151' }}>{range.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <main className="flex-1">
            {filteredWorkshops.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
                <p className="text-lg text-gray-500">
                  {ct('ขณะนี้ไม่มีเวิร์กชอปที่เปิดให้บริการ', 'There are no workshops available at this moment.')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-stagger">
              {filteredWorkshops.map((workshop) => {
                
                const capacity = workshop.capacity || workshop.seatLimit || 0;
                const participants = workshop.current_participants || 0;
                const seatsLeft = capacity - participants;
                
                const isRegistrationOpen = workshop.registrationStatus === 'OPEN' || !workshop.registrationStatus;
                const isFull = seatsLeft <= 0;
                const canEnroll = isRegistrationOpen && !isFull;

                return (
                <div
                  key={workshop._id}
                  className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all"
                >
                  <div className={`h-44 bg-gradient-to-br from-orange-200 to-orange-300 relative`}>
                    {(workshop.image || workshop.imageUrl) && (
                      <img 
                        src={workshop.image || workshop.imageUrl} 
                        alt={workshop.title} 
                        className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-overlay"
                      />
                    )}
                    <div className="absolute top-4 left-4 bg-white/80 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full z-10">
                      {workshop.category || ct('เวิร์กชอป', 'Workshop')}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
                      <div className="flex items-center gap-2 text-white/90 text-sm drop-shadow-md">
                        <Star className="h-4 w-4 text-yellow-300" />
                        <span className="font-semibold">5.0</span>
                      </div>
                      <span className="text-xs text-white/90 font-bold drop-shadow-md">
                        {isRegistrationOpen ? ct('เปิดรับสมัคร', 'Open') : ct('ปิดรับสมัคร', 'Closed')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>{workshop.title || ct('ไม่มีชื่อ', 'Untitled')}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{workshop.description || ct('ไม่มีคำอธิบาย', 'No description provided.')}</p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {workshop.date ? new Date(workshop.date).toLocaleDateString('th-TH') : ct('ไม่ระบุ', 'N/A')}
                      </div>
                      <div className="flex items-center gap-1">
                        <UsersIcon className="h-4 w-4 text-gray-400" />
                        {t('workshops.seatsLeft') || ct('เหลือ', 'Left')}: {Math.max(0, seatsLeft)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xl text-orange-500">
                          {workshop.price === 0 ? (t('workshops.free') || ct('ฟรี', 'Free')) : `฿${workshop.price}`}
                        </span>
                        <span className="text-sm ml-1 text-gray-500">{t('workshops.perPerson') || ct('/คน', '/person')}</span>
                      </div>
                      <button
                        className="px-5 py-2 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!canEnroll}
                        onClick={() => handleOpenModal(workshop)}
                      >
                        {!isRegistrationOpen ? ct('ปิดรับสมัคร', 'Closed') : isFull ? ct('เต็มแล้ว', 'Full') : (t('workshops.enrollNow') || ct('สมัครเลย', 'Enroll'))}
                      </button>
                    </div>
                  </div>
                </div>
              )})}
            </div>
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