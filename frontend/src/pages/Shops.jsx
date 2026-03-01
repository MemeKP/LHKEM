import { useState, useEffect } from 'react';
import { data, Link, useOutletContext, useParams } from 'react-router-dom';
import { Store, MapPin, Clock, Phone, Search, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { getShopsByCommunity } from '../services/shopService';
import { getShopCoverImage } from '../utils/image';
import api from '../services/api';
import { useQuery } from '@tanstack/react-query';

const Shops = () => {
  const { t, ct } = useTranslation();
  const { community } = useOutletContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  // const [shops, setShops] = useState([]);
  // const [loading, setLoading] = useState(true);
  const { slug } = useParams();

  const { data: shops = [], isLoading } = useQuery({
    queryKey: ['communityShops', slug],
    queryFn: async () => {
      const res = await api.get(`/api/communities/${slug}/shops`); 
      return res.data;
    }
  });

  // useEffect(() => {
  //   const fetchShops = async () => {
  //     if (!community?._id) return;
  //     try {
  //       const data = await getShopsByCommunity(community._id);
  //       setShops(data);
  //     } catch (error) {
  //       console.error('Failed to fetch shops:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchShops();
  // }, [community]);


  const filteredShops = shops.filter(shop => {
    const matchesSearch = (shop.shopName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filteredShops.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedShops = filteredShops.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage((prev) => {
      if (filteredShops.length === 0) return 1;
      if (prev < 1) return 1;
      if (prev > totalPages) return totalPages;
      return prev;
    });
  }, [filteredShops.length, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(totalPages, prev + 1));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fdf7ef] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf7ef] py-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="mb-4 animate-slideUp" style={{ animationDelay: '0.05s' }}>
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-slideUp" style={{ animationDelay: '0.12s' }}>
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
        </div>

        {/* Results Count */}
        <div className="mb-2 animate-fadeIn" style={{ animationDelay: '0.18s' }}>
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
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedShops.map((shop, index) => {
              const gradients = [
                'from-orange-300 via-orange-400 to-orange-500',
                'from-green-300 via-green-400 to-green-500',
                'from-blue-300 via-blue-400 to-blue-500',
                'from-purple-300 via-purple-400 to-purple-500',
                'from-amber-300 via-amber-400 to-amber-500',
                'from-rose-300 via-rose-400 to-rose-500'
              ];
              const gradient = gradients[index % gradients.length];
              const coverImage = getShopCoverImage(shop);
              
              return (
              <Link
                key={shop._id}
                to={`/${community.slug}/shops/${shop._id}`}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group animate-slideUp"
                style={{ animationDelay: `${0.05 * index}s` }}
              >
                {/* Shop Image/Gradient */}
                <div className="relative h-48 overflow-hidden">
                  {coverImage ? (
                    <img 
                      src={coverImage} 
                      alt={shop.shopName} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement.innerHTML = `<div class=\"w-full h-full bg-gradient-to-br ${gradient}\"><div class=\"absolute inset-0 flex items-center justify-center\"><svg class=\"h-16 w-16 text-white/50\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6\" /></svg></div></div>`;
                      }}
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${gradient}`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Store className="h-16 w-16 text-white/50" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                  
                  <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-xs font-semibold text-gray-700">
                    {shop.status === 'ACTIVE' ? ct('เปิดให้บริการ', 'Active') : ct('รอการอนุมัติ', 'Pending')}
                  </div>
                </div>

                {/* Shop Info */}
                <div className="p-6 transition-transform duration-300 group-hover:-translate-y-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {shop.shopName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {shop.description || ct('ไม่มีคำอธิบาย', 'No description')}
                  </p>

                  {/* Location */}
                  {(shop.address || shop.location?.address) && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <MapPin className="h-4 w-4" />
                      <span>{shop.address || shop.location?.address}</span>
                    </div>
                  )}

                  {/* Opening Hours */}
                  {(shop.openTime || shop.closeTime) && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <Clock className="h-4 w-4" />
                      <span>
                        {shop.openTime || ct('ไม่ระบุ', 'N/A')}
                        {shop.closeTime ? ` - ${shop.closeTime}` : ''}
                      </span>
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
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              </Link>
            );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-6">
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
    </div>
  );
};

export default Shops;
