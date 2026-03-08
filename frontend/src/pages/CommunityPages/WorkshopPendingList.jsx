import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Eye, Clock, Users, DollarSign } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../services/api';

/* Shop Owner Pending List */

const WorkshopPendingList = () => {
  const navigate = useNavigate();
  const { community } = useOutletContext() || {};
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const {
    data: pendingWorkshops = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['community-admin-pending-workshops', community?._id],
    queryFn: async () => {
      if (!community?._id) return [];
      const res = await api.get('/management/workshops/pending', {
        params: { communityId: community._id },
      });
      const data = res.data?.data || res.data || [];
      if (!Array.isArray(data)) return [];
      return data;
    },
    onError: (error) => {
      console.error('Error fetching pending workshops:', error);
      Swal.fire({
        icon: 'error',
        title: 'ไม่สามารถโหลดข้อมูลได้',
        text: 'กรุณาลองใหม่ในภายหลัง',
      });
    },
    enabled: !!community?._id,
    staleTime: 1000 * 30,
  });

  const categories = [
    { value: 'all', label: 'ทั้งหมด' },
    { value: 'งานฝีมือ', label: 'งานฝีมือ' },
    { value: 'อาหาร', label: 'ทำอาหาร' },
    { value: 'ศิลปะ', label: 'ศิลปะ' },
    { value: 'วัฒนธรรม', label: 'วัฒนธรรม' },
  ];

  const pendingOnly = pendingWorkshops.filter((workshop) =>
    (workshop.approvalStatus || 'PENDING').toUpperCase() === 'PENDING'
  );

  const filteredWorkshops = pendingOnly.filter(workshop => {
    const matchesSearch = workshop.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || workshop.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleViewWorkshop = (id) => {
    navigate(`/community-admin/workshops/${id}/approve`);
  };

  return (
    <div className="min-h-screen bg-[#F5EFE7] py-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 animate-slideUp" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">เวิร์กช็อปที่รออนุมัติ</h1>
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

        {(!community?._id && !isLoading) ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center animate-slideUp">
            <h3 className="text-xl font-bold text-gray-900 mb-2">ยังไม่ได้ระบุตัวตนชุมชน</h3>
            <p className="font-semibold text-gray-700">กรุณาเลือกหรือผูกชุมชนก่อนจึงจะเห็นรายการ Workshop</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : isError ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center animate-slideUp">
            <h3 className="text-xl font-bold text-gray-900 mb-2">เกิดข้อผิดพลาดในการโหลดข้อมูล</h3>
            <p className="font-semibold text-gray-700">กรุณารีเฟรชหน้าหรือกลับมาตรวจสอบใหม่อีกครั้ง</p>
          </div>
        ) : filteredWorkshops.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">ไม่มี Workshop รออนุมัติ</h3>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkshops.map((workshop, index) => (
              <div
                key={workshop._id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slideUp"
                style={{ animationDelay: `${0.05 * (index + 1)}s` }}
              >
                <div className="aspect-video relative bg-gray-100">
                  {workshop.image || workshop.imageUrl ? (
                    <img
                      src={workshop.image || workshop.imageUrl}
                      alt={workshop.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                      <Users className="h-16 w-16 text-blue-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                      รออนุมัติ
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{workshop.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{workshop.description}</p>

                  <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>฿{workshop.price}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{workshop.capacity} ที่</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewWorkshop(workshop._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      ตรวจสอบ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkshopPendingList;