import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Store, MapPin, Clock, Phone, Search, Filter, ArrowRight } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { getShopsByCommunity } from '../services/shopService';

/**
 * Shops Page - แสดงรายการร้านค้าทั้งหมดในชุมชน
 * TODO: Backend API
 * - GET /api/communities/:id/shops - ดึงรายการร้านค้าในชุมชน
 */

const Shops = () => {
  const { t, ct } = useTranslation();
  const { community } = useOutletContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      if (!community?._id) return;
      try {
        const data = await getShopsByCommunity(community._id);
        setShops(data);
      } catch (error) {
        console.error('Failed to fetch shops:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, [community]);

  // Mock data for fallback
  const mockShops = [
    {
      id: 1,
      name: 'ร้านมีนา',
      name_en: 'Meena Shop',
      category: 'craft',
      category_en: 'Craft Shop',
      description: 'ร้านหัตถกรรมท้องถิ่น เปิดสอนทำงานฝีมือและของที่ระลึก',
      description_en: 'Local craft shop offering handmade workshops and souvenirs',
      location: 'ในชุมชนโหล่งฮิมคาว',
      location_en: 'In Loeng Him Kaw',
      phone: '089-123-4567',
      openTime: '09:00',
      closeTime: '17:00',
      workshopCount: 2,
      gradient: 'from-orange-300 via-orange-400 to-orange-500'
    },
    {
      id: 2,
      name: 'ร้านอาหารท้องถิ่น',
      name_en: 'Local Food Shop',
      category: 'food',
      category_en: 'Food Shop',
      description: 'ร้านอาหารพื้นเมือง สอนทำอาหารและขนมไทย',
      description_en: 'Local restaurant offering cooking classes and Thai desserts',
      location: 'ในชุมชนโหล่งฮิมคาว',
      location_en: 'In Loeng Him Kaw',
      phone: '089-234-5678',
      openTime: '08:00',
      closeTime: '18:00',
      workshopCount: 3,
      gradient: 'from-green-300 via-green-400 to-green-500'
    },
    {
      id: 3,
      name: 'ร้านผ้าทอมือ',
      name_en: 'Handwoven Textile',
      category: 'textile',
      category_en: 'Textile Shop',
      description: 'ร้านผ้าทอมือ สอนการทอผ้าและย้อมสีธรรมชาติ',
      description_en: 'Handwoven textile shop teaching weaving and natural dyeing',
      location: 'ในชุมชนโหล่งฮิมคาว',
      location_en: 'In Loeng Him Kaw',
      phone: '089-345-6789',
      openTime: '09:00',
      closeTime: '16:00',
      workshopCount: 1,
      gradient: 'from-blue-300 via-blue-400 to-blue-500'
    },
    {
      id: 4,
      name: 'ร้านของฝากท้องถิ่น',
      name_en: 'Local Souvenir Shop',
      category: 'souvenir',
      category_en: 'Souvenir Shop',
      description: 'ร้านจำหน่ายของฝากและผลิตภัณฑ์ชุมชน',
      description_en: 'Shop selling local souvenirs and community products',
      location: 'ในชุมชนโหล่งฮิมคาว',
      location_en: 'In Loeng Him Kaw',
      phone: '089-456-7890',
      openTime: '08:30',
      closeTime: '17:30',
      workshopCount: 0,
      gradient: 'from-purple-300 via-purple-400 to-purple-500'
    },
    {
      id: 5,
      name: 'ร้านกาแฟชุมชน',
      name_en: 'Community Coffee Shop',
      category: 'food',
      category_en: 'Food Shop',
      description: 'ร้านกาแฟและเบเกอรี่ สอนชงกาแฟและทำขนม',
      description_en: 'Coffee and bakery shop offering coffee brewing and baking classes',
      location: 'ในชุมชนโหล่งฮิมคาว',
      location_en: 'In Loeng Him Kaw',
      phone: '089-567-8901',
      openTime: '07:00',
      closeTime: '19:00',
      workshopCount: 2,
      gradient: 'from-amber-300 via-amber-400 to-amber-500'
    },
    {
      id: 6,
      name: 'ร้านเครื่องปั้นดินเผา',
      name_en: 'Pottery Shop',
      category: 'craft',
      category_en: 'Craft Shop',
      description: 'ร้านเครื่องปั้นดินเผา สอนการปั้นและเผาเครื่องปั้น',
      description_en: 'Pottery shop teaching clay molding and firing',
      location: 'ในชุมชนโหล่งฮิมคาว',
      location_en: 'In Loeng Him Kaw',
      phone: '089-678-9012',
      openTime: '09:00',
      closeTime: '17:00',
      workshopCount: 1,
      gradient: 'from-rose-300 via-rose-400 to-rose-500'
    }
  ];

  const categories = [
    { value: 'all', label: ct('ทั้งหมด', 'All') },
    { value: 'craft', label: ct('หัตถกรรม', 'Craft') },
    { value: 'food', label: ct('อาหาร', 'Food') },
    { value: 'textile', label: ct('ผ้า', 'Textile') },
    { value: 'souvenir', label: ct('ของฝาก', 'Souvenir') }
  ];

  const filteredShops = shops.filter(shop => {
    const matchesSearch = (shop.shopName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || shop.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf7ef] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf7ef] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link to={`/${community.slug}`} className="hover:text-gray-700">
              {ct(community.name, community.name_en)}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{ct('ร้านค้า', 'Shops')}</span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {ct('ร้านค้าในชุมชน', 'Community Shops')}
          </h1>
          <p className="text-lg text-gray-600">
            {ct('ค้นพบร้านค้าท้องถิ่นที่เปิดให้บริการเวิร์กช็อปและประสบการณ์ทางวัฒนธรรม', 
                'Discover local shops offering workshops and cultural experiences')}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={ct('ค้นหาร้านค้า...', 'Search shops...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {ct(`พบ ${filteredShops.length} ร้านค้า`, `Found ${filteredShops.length} shops`)}
          </p>
        </div>

        {/* Shops Grid */}
        {filteredShops.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {ct('ไม่พบร้านค้าที่ตรงกับการค้นหา', 'No shops found matching your search')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop, index) => {
              const gradients = [
                'from-orange-300 via-orange-400 to-orange-500',
                'from-green-300 via-green-400 to-green-500',
                'from-blue-300 via-blue-400 to-blue-500',
                'from-purple-300 via-purple-400 to-purple-500',
                'from-amber-300 via-amber-400 to-amber-500',
                'from-rose-300 via-rose-400 to-rose-500'
              ];
              const gradient = gradients[index % gradients.length];
              
              return (
              <Link
                key={shop._id}
                to={`/${community.slug}/shops/${shop._id}`}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                {/* Shop Image/Gradient */}
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

                {/* Shop Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition">
                    {shop.shopName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {shop.description || ct('ไม่มีคำอธิบาย', 'No description')}
                  </p>

                  {/* Location */}
                  {shop.location?.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <MapPin className="h-4 w-4" />
                      <span>{shop.location.address}</span>
                    </div>
                  )}

                  {/* Opening Hours */}
                  {shop.openTime && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <Clock className="h-4 w-4" />
                      <span>{shop.openTime}{shop.closeTime ? ` - ${shop.closeTime}` : ''}</span>
                    </div>
                  )}

                  {/* Phone */}
                  {shop.contact?.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <Phone className="h-4 w-4" />
                      <span>{shop.contact.phone}</span>
                    </div>
                  )}

                  {/* View Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm font-semibold text-orange-600">
                      {ct('ดูรายละเอียด', 'View Details')}
                    </span>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shops;
