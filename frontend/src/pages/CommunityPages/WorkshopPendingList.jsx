import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, Clock, Users, DollarSign } from 'lucide-react';

/**
 * Workshop Pending List - รายการ Workshop ที่รออนุมัติ
 * 
 * TODO: Backend APIs needed:
 * - GET /api/workshops/pending - ดึงรายการ Workshop ที่รออนุมัติ
 * - GET /api/workshops?status=pending&community_id=xxx - อีกแบบหนึ่ง
 * 
 * Workshop Structure (รอ Backend สร้าง Schema):
 * {
 *   id: string,
 *   title: string,
 *   description: string,
 *   image: string,
 *   price: number,
 *   seatLimit: number,
 *   duration: string,
 *   shop: {
 *     id: string,
 *     name: string,
 *     image: string
 *   },
 *   category: string,
 *   status: 'pending',
 *   createdAt: Date
 * }
 */

const WorkshopPendingList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // TODO: Fetch from API - GET /api/workshops/pending
  const pendingWorkshops = [];

  const categories = [
    { value: 'all', label: 'ทั้งหมด' },
    { value: 'craft', label: 'งานฝีมือ' },
    { value: 'cooking', label: 'ทำอาหาร' },
    { value: 'art', label: 'ศิลปะ' },
    { value: 'culture', label: 'วัฒนธรรม' },
  ];

  const filteredWorkshops = pendingWorkshops.filter(workshop => {
    const matchesSearch = workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workshop.shop.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || workshop.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">เวิร์กช็อปที่รออนุมัติ</h1>
              <p className="text-gray-600 mt-1">ตรวจสอบและอนุมัติ Workshop จากร้านค้าในชุมชน</p>
            </div>
            <button
              onClick={() => navigate('/community-admin/dashboard')}
              className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors"
            >
              กลับหน้าหลัก
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อ Workshop หรือร้านค้า..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Workshop Cards - TODO: ข้อมูลจาก GET /api/workshops/pending */}
        {filteredWorkshops.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ไม่มี Workshop รออนุมัติ
              </h3>
              <p className="text-gray-600">
                {searchTerm || filterCategory !== 'all' 
                  ? 'ไม่พบ Workshop ที่ตรงกับเงื่อนไขการค้นหา'
                  : 'ยังไม่มี Workshop ที่รอการอนุมัติในขณะนี้'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkshops.map((workshop) => (
              <div
                key={workshop.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Workshop Image */}
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 relative">
                  {workshop.image ? (
                    <img
                      src={workshop.image}
                      alt={workshop.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="h-16 w-16 text-blue-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                      รออนุมัติ
                    </span>
                  </div>
                </div>

                {/* Workshop Info */}
                <div className="p-5">
                  {/* Shop Info */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      {workshop.shop.image ? (
                        <img
                          src={workshop.shop.image}
                          alt={workshop.shop.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-gray-500 font-semibold">
                          {workshop.shop.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">{workshop.shop.name}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {workshop.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {workshop.description}
                  </p>

                  {/* Meta Info */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>฿{workshop.price}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{workshop.seatLimit} ที่</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{workshop.duration}</span>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="mb-4">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      {categories.find(c => c.value === workshop.category)?.label || workshop.category}
                    </span>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => navigate(`/community-admin/workshops/${workshop.id}`)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    ตรวจสอบ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {filteredWorkshops.length > 0 && (
          <div className="mt-8 text-center text-gray-600">
            แสดง {filteredWorkshops.length} Workshop จากทั้งหมด {pendingWorkshops.length} รายการ
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkshopPendingList;
