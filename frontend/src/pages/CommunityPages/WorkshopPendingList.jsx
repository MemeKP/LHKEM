import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, Clock, Users, DollarSign } from 'lucide-react';
import api from '../../services/api';

const WorkshopPendingList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [pendingWorkshops, setPendingWorkshops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        setIsLoading(true);
        const timestamp = new Date().getTime();
        // Ensure this matches your backend route
        const res = await api.get(`/management/workshops/pending?_t=${timestamp}`);
        setPendingWorkshops(Array.isArray(res.data) ? res.data : (res.data?.data || []));
      } catch (error) {
        console.error('Error fetching pending workshops:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPending();
  }, []);

  const categories = [
    { value: 'all', label: 'ทั้งหมด' },
    { value: 'งานฝีมือ', label: 'งานฝีมือ' },
    { value: 'อาหาร', label: 'ทำอาหาร' },
    { value: 'ศิลปะ', label: 'ศิลปะ' },
    { value: 'วัฒนธรรม', label: 'วัฒนธรรม' },
  ];

  const filteredWorkshops = pendingWorkshops.filter(workshop => {
    const matchesSearch = workshop.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || workshop.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อ Workshop..."
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

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredWorkshops.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">ไม่มี Workshop รออนุมัติ</h3>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkshops.map((workshop) => {
              // ✅ FIXED: Variables are now defined correctly inside the map loop
              const capacity = workshop.capacity || workshop.seatLimit || 0;
              const participants = workshop.current_participants || 0;
              const available = Math.max(0, capacity - participants);

              return (
                <div key={workshop._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 relative">
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="h-16 w-16 text-blue-300" />
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                        รออนุมัติ
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{workshop.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{workshop.description}</p>

                    <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span>฿{workshop.price}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="h-4 w-4" />
                        {/* Display Available / Total */}
                        <span>{available}/{capacity}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/community-admin/workshops/${workshop._id || workshop.id}/approve`)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      ตรวจสอบ
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkshopPendingList;