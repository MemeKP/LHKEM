import { useState } from 'react';
import { Search, Star } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const Workshops = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([]);

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

  const workshops = [
    {
      id: 1,
      title: 'ย้อมผ้าครามธรรมชาติ',
      category: 'ผ้าและสิ่งทอ',
      location: 'บ้านคราม',
      price: 800,
      rating: 4.8,
      image: 'gradient-1'
    },
    {
      id: 2,
      title: 'เวิร์กช็อปทำเกษตรอินทรีย์',
      category: 'เซรามิค',
      location: 'เรื่อนดิน',
      price: 0,
      rating: 4.8,
      image: 'gradient-2'
    },
    {
      id: 3,
      title: 'ทำอาหารท้องถิ่น',
      category: 'อาหาร',
      location: 'ครัวแม่ศรี',
      price: 750,
      rating: 5.0,
      image: 'gradient-3'
    },
    {
      id: 4,
      title: 'Drip Coffee Workshop',
      category: 'อาหาร',
      location: 'Slow Bar Coffee',
      price: 650,
      rating: 4.7,
      image: 'gradient-4'
    }
  ];

  const handlePriceRangeChange = (rangeId) => {
    setPriceRange(prev => 
      prev.includes(rangeId) 
        ? prev.filter(id => id !== rangeId)
        : [...prev, rangeId]
    );
  };

  const getGradientClass = (gradient) => {
    const gradients = {
      'gradient-1': 'from-orange-400 to-pink-500',
      'gradient-2': 'from-green-400 to-teal-500',
      'gradient-3': 'from-purple-400 to-indigo-500',
      'gradient-4': 'from-blue-400 to-cyan-500'
    };
    return gradients[gradient] || 'from-gray-400 to-gray-500';
  };

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
            <div className="mb-6 animate-slideUp">
              <p className="text-sm" style={{ color: '#4b5563' }}>
                {t('workshops.results')}: {workshops.length}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-stagger">
              {workshops.map((workshop) => (
                <div
                  key={workshop.id}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all transform hover:scale-105"
                >
                  <div className={`h-48 bg-gradient-to-br ${getGradientClass(workshop.image)} relative`}>
                    <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900">{workshop.rating}</span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="mb-2">
                      <span className="inline-block text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: '#ffedd5', color: '#ea580c' }}>
                        {workshop.category}
                      </span>
                    </div>
                    
                    <h3 className="font-bold mb-2" style={{ color: '#111827' }}>{workshop.title}</h3>
                    <p className="text-sm mb-4" style={{ color: '#4b5563' }}>{workshop.location}</p>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-lg" style={{ color: '#ea580c' }}>
                          {workshop.price === 0 ? t('workshops.free') : `฿${workshop.price}`}
                        </span>
                        {workshop.price > 0 && (
                          <span className="text-sm ml-1" style={{ color: '#6b7280' }}>/คน</span>
                        )}
                      </div>
                      <button className="text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105" style={{ backgroundColor: '#111827' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1f2937'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#111827'}>
                        {t('workshops.viewDetails')}
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
    </div>
  );
};

export default Workshops;
