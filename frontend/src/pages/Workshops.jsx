import { useState } from 'react';
import { Search, Star, MapPin, Clock, Users as UsersIcon } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import workshopData from '../data/workshops';
import WorkshopModal from '../components/WorkshopModal';
import ETicketModal from '../components/ETicketModal';

const Workshops = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([]);
  const [activeWorkshop, setActiveWorkshop] = useState(null);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [showETicket, setShowETicket] = useState(false);

  const categories = [
    { id: 'all', name: 'ทั้งหมด', color: 'orange' },
    { id: 'creative', name: 'ผ้าและสิ่งทอ', color: 'gray' },
    { id: 'agriculture', name: 'เซรามิค', color: 'gray' },
    { id: 'art', name: 'อาหาร', color: 'gray' },
    { id: 'tech', name: 'งานกระดาษ', color: 'gray' }
  ];

  const priceRanges = [
    { id: 'free', label: '฿ 0-500 บาท' },
    { id: 'mid', label: '฿ 500-1,000 บาท' },
    { id: 'high', label: '฿ 1,000+ บาท' }
  ];

  const handlePriceRangeChange = (rangeId) => {
    setPriceRange(prev => 
      prev.includes(rangeId) 
        ? prev.filter(id => id !== rangeId)
        : [...prev, rangeId]
    );
  };

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

  const workshops = workshopData;

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8 animate-slideUp">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#111827' }}>
            {t('workshops.title')}
          </h1>
          <p className="mb-6" style={{ color: '#4b5563' }}>
            {t('workshops.description')}
          </p>

          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: '#9ca3af' }} />
            <input
              type="text"
              placeholder={t('workshops.searchPlaceholder')}
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
              <h3 className="font-semibold mb-4" style={{ color: '#111827' }}>{t('workshops.categories')}</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className="w-full text-left px-4 py-2 rounded-lg transition-all transform hover:scale-105"
                    style={{
                      backgroundColor: selectedCategory === category.name ? '#ffedd5' : 'transparent',
                      color: selectedCategory === category.name ? '#ea580c' : '#374151',
                      fontWeight: selectedCategory === category.name ? '500' : '400',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCategory !== category.name) {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCategory !== category.name) {
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
              <h3 className="font-semibold mb-4" style={{ color: '#111827' }}>{t('workshops.priceRange')}</h3>
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
            <div className="mb-6 animate-slideUp flex items-center justify-between">
              <p className="text-sm" style={{ color: '#4b5563' }}>
                {t('workshops.results')}: {workshops.length}
              </p>
              <p className="text-sm text-gray-400">*ข้อมูลจากตัวอย่างในระบบ</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-stagger">
              {workshops.map((workshop) => (
                <div
                  key={workshop.id}
                  className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all"
                >
                  <div className={`h-44 bg-gradient-to-br ${workshop.gradient || 'from-gray-200 to-gray-300'} relative`}>
                    <div className="absolute top-4 left-4 bg-white/80 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
                      {workshop.badge}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white/90 text-sm">
                        <Star className="h-4 w-4 text-yellow-300" />
                        <span>{workshop.rating}</span>
                      </div>
                      <span className="text-xs text-white/80">{workshop.level}</span>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="h-4 w-4 text-red-400" />
                      {workshop.location}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>{workshop.title}</h3>
                      <p className="text-sm text-gray-600">{workshop.shortDescription}</p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {workshop.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <UsersIcon className="h-4 w-4 text-gray-400" />
                        {t('workshops.seatsLeft')}: {workshop.seatsLeft}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xl text-orange-500">
                          {workshop.price === 0 ? t('workshops.free') : `฿${workshop.price}`}
                        </span>
                        <span className="text-sm ml-1 text-gray-500">{t('workshops.perPerson')}</span>
                      </div>
                      <button
                        className="px-5 py-2 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition"
                        onClick={() => handleOpenModal(workshop)}
                      >
                        {t('workshops.enrollNow')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center items-center space-x-2 animate-slideUp">
              <button className="w-10 h-10 rounded-full text-white flex items-center justify-center font-medium transition-all transform hover:scale-110" style={{ backgroundColor: '#111827' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1f2937'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#111827'}>
                1
              </button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all transform hover:scale-110" style={{ backgroundColor: '#ffffff', color: '#374151' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}>
                2
              </button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all transform hover:scale-110" style={{ backgroundColor: '#ffffff', color: '#374151' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}>
                →
              </button>
            </div>
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
