import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Calendar, Store, FileText, Users, Eye, AlertCircle, CheckCircle, XCircle, Edit, Plus, List } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

/**
 * Admin Dashboard - ศูนย์รวมการจัดการชุมชน (หน้าหลัก)
 * รวม: Workshop รออนุมัติ, Event รออนุมัติ, ร้านค้ารออนุมัติ
 * หน้าหลักสำหรับจัดการและอนุมัติข้อมูลต่างๆ ของชุมชน
 * 
 * TODO: Backend APIs:
 * - GET /api/workshops/pending?community_id=xxx
 * - GET /api/events/pending?community_id=xxx  
 * - GET /api/shops/pending?community_id=xxx
 */

const usePendingData = () => {
  // shop
  const shopsQuery = useQuery({
    queryKey: ['shops', 'pending'],
    queryFn: async () => (await api.get('/api/shop/pending')).data,
  })
  // workshop

  // event
  const eventsQuery = useQuery({
    queryKey: ['events', 'pending'],
    queryFn: async () => (await api.get('/api/events/pending')).data,
  });

  return { eventsQuery, shopsQuery };
};

const AdminDashboard = () => {
  const { eventsQuery, shopsQuery } = usePendingData();
  const navigate = useNavigate();
  const { ct } = useTranslation();
  const [activeTab, setActiveTab] = useState('workshops');
  const [taskTab, setTaskTab] = useState('events'); // Tab for Events/Shops section
  const isLoading = eventsQuery.isLoading;
  const { community } = useOutletContext()

  if (isLoading) return <div className="p-8 text-center">กำลังโหลดข้อมูล...</div>;

  const pendingEvents = eventsQuery.data || [];
  const pendingShops = shopsQuery.data || []

  const pendingCounts = {
    events: pendingEvents.length,
    shops: pendingShops.length,
    // total: pendingWorkshops.length + pendingEvents.length + pendingShops.length
  };

  // TODO: Fetch from API
  /*
  const pendingCounts = {
    workshops: 2,
    events: 1,
    shops: 1,
    total: 4
  };*/

  // Mock data - Workshop รออนุมัติ
  const pendingWorkshops = [
    {
      id: 'w1',
      title: 'กองสอนทอผ้าครามจังหวัดน่าน',
      shop: 'บ้านครามโหล่งฮิมคาว',
      description: 'เรียนรู้การย้อมผ้าด้วยสีครามจากธรรมชาติ ตั้งแต่การเตรียมน้ำย้อม การพับผ้า จนได้ผืนผ้าสวยงาม',
      price: 450,
      seats: 8,
      duration: '3 ชม.',
      submittedAt: '2024-01-15T10:30:00',
      status: 'รออนุมัติ',
      image: null
    },
    {
      id: 'w2',
      title: 'Workshop เครื่องปั้นดินเผาแบบล้านนา',
      shop: 'เครื่องปั้นดินเผาบ้านมอญ',
      description: 'สัมผัสประสบการณ์การปั้นดินเผาแบบล้านนา ทำภาชนะเครื่องใช้ด้วยมือของคุณเอง',
      price: 380,
      seats: 6,
      duration: '2.5 ชม.',
      submittedAt: '2024-01-16T14:20:00',
      status: 'รออนุมัติ',
      image: null
    }
  ];

  // Mock data - ร้านค้ารออนุมัติ
  // const pendingShops = [
  //   {
  //     id: 's1',
  //     name: 'ร้านหัตถกรรมไม้ล้านนา',
  //     owner: 'คุณสมชาย ใจดี',
  //     category: 'งานไม้',
  //     description: 'ร้านจำหน่ายและสอนงานไม้แกะสลักล้านนา',
  //     submittedAt: '2024-01-13T16:45:00',
  //     status: 'รออนุมัติ'
  //   }
  // ];

  const tabs = [
    { id: 'workshops', label: ct('Workshop', 'Workshop'), count: pendingCounts.workshops, icon: FileText },
    { id: 'events', label: ct('กิจกรรม', 'Events'), count: pendingCounts.events, icon: Calendar },
    { id: 'shops', label: ct('ร้านค้า', 'Shops'), count: pendingCounts.shops, icon: Store }
  ];

  // const getStatusColor = (status) => {
  //   if (status === 'รออนุมัติ') return 'bg-yellow-100 text-yellow-800';
  //   if (status === 'อนุมัติแล้ว') return 'bg-green-100 text-green-800';
  //   return 'bg-red-100 text-red-800';
  // };

  const getStatusColor = (status) => {
    // ปรับตาม enum ของ back (PENDING, APPROVED)
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EFE7] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Action Buttons */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-1">
              {ct(community?.name, community?.name_en)}
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/community-admin/settings')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#E53935] hover:bg-[#D32F2F] text-white font-semibold rounded-lg transition shadow-sm"
            >
              <Edit className="h-4 w-4" />
              {ct('แก้ไข', 'Edit')}
            </button>
            <button
              onClick={() => navigate('/community-admin/events/create')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1E293B] hover:bg-[#0F172A] text-white font-semibold rounded-lg transition shadow-sm"
            >
              <Plus className="h-4 w-4" />
              {ct('สร้างอีเว้นท์', 'Create Event')}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#FFF3E0] rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-[#F57C00]" />
              </div>
              <span className="text-2xl font-bold text-[#1A1A1A]">{pendingCounts.total}</span>
            </div>
            <p className="text-sm font-medium text-[#666666]">{ct('รออนุมัติทั้งหมด', 'To Review')}</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#FFF9C4] rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-[#F9A825]" />
              </div>
              <span className="text-2xl font-bold text-[#1A1A1A]">{pendingCounts.workshops}</span>
            </div>
            <p className="text-sm font-medium text-[#666666]">{ct('รออนุมัติ', 'Workshops Pending')}</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#E3F2FD] rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-[#1976D2]" />
              </div>
              <span className="text-2xl font-bold text-[#1A1A1A]">{pendingCounts.events}</span>
            </div>
            <p className="text-sm font-medium text-[#666666]">{ct('กิจกรรม', 'Events')}</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#F3E5F5] rounded-lg flex items-center justify-center">
                <Store className="h-5 w-5 text-[#8E24AA]" />
              </div>
              <span className="text-2xl font-bold text-[#1A1A1A]">{pendingCounts.shops}</span>
            </div>
            <p className="text-sm font-medium text-[#666666]">{ct('ร้านค้า', 'Shops')}</p>
          </div>
        </div>

        {/* Workshop Section Title with CTA */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1A1A1A]">
            {ct('Workshop ที่ต้องจัดการ', 'Workshops to Manage')}
          </h2>
          <button
            onClick={() => navigate('/community-admin/workshops/pending')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-[#1A1A1A] text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            <List className="h-4 w-4" />
            {ct('ดูทั้งหมด', 'View all')}
          </button>
        </div>

        {/* Workshop Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {pendingWorkshops.map((workshop) => (
            <div key={workshop.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all">
              {/* Workshop Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-200">
                {workshop.image ? (
                  <img src={workshop.image} alt={workshop.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="h-16 w-16 text-blue-300" />
                  </div>
                )}
                {/* Pending Badge */}
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 bg-[#E53935] text-white rounded-md text-xs font-semibold">
                    {ct('รออนุมัติ', 'Pending')}
                  </span>
                </div>
              </div>

              {/* Workshop Info */}
              <div className="p-4">
                <span className="inline-block px-2 py-1 bg-[#FFF3E0] text-[#F57C00] rounded text-xs font-medium mb-2">
                  {ct('ร้านค้าของฉัน', 'My Shop')}
                </span>
                <h3 className="text-base font-bold text-[#1A1A1A] mb-2 line-clamp-2">
                  {workshop.title}
                </h3>
                <p className="text-sm text-[#666666] mb-3 line-clamp-2">
                  {workshop.description}
                </p>

                {/* Workshop Details */}
                <div className="flex items-center gap-3 text-sm text-[#666666] mb-4">
                  <span className="flex items-center gap-1">
                    <span className="font-semibold text-[#1A1A1A]">฿{workshop.price}</span>
                  </span>
                  <span>•</span>
                  <span>{workshop.duration}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/community-admin/workshops/${workshop.id}/approve`)}
                    className="flex-1 px-4 py-2 bg-[#FFC107] hover:bg-[#FFB300] text-[#1A1A1A] text-sm font-semibold rounded-lg transition-all"
                  >
                    {ct('ตรวจสอบรายละเอียด', 'Review')}
                  </button>
                  <button
                    className="px-4 py-2 bg-[#1E293B] hover:bg-[#0F172A] text-white text-sm font-semibold rounded-lg transition-all"
                  >
                    {ct('อนุมัติ', 'Approve')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* งานที่ต้องจัดการ Section Title with CTA */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1A1A1A]">
            {ct('งานที่ต้องจัดการ', 'Tasks to Manage')}
          </h2>
          <button
            onClick={() => navigate('/community-admin/events')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-[#1A1A1A] text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            <List className="h-4 w-4" />
            {ct('ดูอีเว้นท์ทั้งหมด', 'View all events')}
          </button>
        </div>

        {/* Tasks Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6 border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex space-x-1 px-2 py-2">
              <button
                onClick={() => setTaskTab('events')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${taskTab === 'events'
                    ? 'bg-[#4CAF50] text-white'
                    : 'text-[#666666] hover:bg-gray-100'
                  }`}
              >
                <Calendar className="h-4 w-4" />
                {ct('อีเว้นท์', 'Events')}
              </button>
              <button
                onClick={() => setTaskTab('shops')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${taskTab === 'shops'
                    ? 'bg-[#4CAF50] text-white'
                    : 'text-[#666666] hover:bg-gray-100'
                  }`}
              >
                <Store className="h-4 w-4" />
                {ct('ร้านค้า', 'Shops')}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Events Tab */}
            {taskTab === 'events' && (
              <div>
                {pendingEvents.length === 0 ? (
                  <div className="bg-[#F5F5F5] rounded-xl p-8 flex flex-col items-center justify-center min-h-[280px]">
                    <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mb-4">
                      <Calendar className="h-8 w-8 text-[#90CAF9]" />
                    </div>
                    <span className="inline-block px-3 py-1 bg-[#E3F2FD] text-[#1976D2] rounded-md text-xs font-semibold mb-2">
                      {ct('ไม่มี', 'None')}
                    </span>
                    <h3 className="text-base font-bold text-[#1A1A1A] mb-2">
                      {ct('งานอีเว้นท์ที่ต้องจัดการ', 'Events to Manage')}
                    </h3>
                    <p className="text-sm text-[#666666] text-center mb-4">
                      {ct('ยังไม่มีงานอีเว้นท์ที่ต้องจัดการในขณะนี้', 'No events to manage at the moment')}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingEvents.map((event) => (
                      <div key={event.id} className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all">
                        <span className="inline-block px-3 py-1 bg-[#E3F2FD] text-[#1976D2] rounded-md text-xs font-semibold mb-3">
                          {ct('อีเว้นท์', 'Event')}
                        </span>
                        <h3 className="text-base font-bold text-[#1A1A1A] mb-2">{event.title}</h3>
                        <p className="text-sm text-[#666666] mb-4 line-clamp-2">{event.description}</p>
                        <div className="flex items-center gap-3 text-sm text-[#666666] mb-4">
                          <span className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            {event.start_at ? (
                              new Date(event.start_at).toLocaleDateString('th-TH', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric' 
                              })
                            ) : (
                              'ไม่ระบุวันที่'
                            )}
                          </span>
                          <span>•</span>
                          <span>{event.time}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/community-admin/events/${event._id || event.id}`)}
                            className="flex-1 px-4 py-2 bg-[#FFC107] hover:bg-[#FFB300] text-[#1A1A1A] text-sm font-semibold rounded-lg transition-all"
                          >
                            {ct('ดูรายละเอียด', 'View Details')}
                          </button>
                          <button className="px-4 py-2 bg-[#1E293B] hover:bg-[#0F172A] text-white text-sm font-semibold rounded-lg transition-all">
                            {ct('อนุมัติ', 'Approve')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Shops Tab */}
            {taskTab === 'shops' && (
              <div>
                {pendingShops.length === 0 ? (
                  <div className="bg-[#F5F5F5] rounded-xl p-8 flex flex-col items-center justify-center min-h-[280px]">
                    <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mb-4">
                      <Store className="h-8 w-8 text-[#CE93D8]" />
                    </div>
                    <span className="inline-block px-3 py-1 bg-[#F3E5F5] text-[#8E24AA] rounded-md text-xs font-semibold mb-2">
                      {ct('ไม่มี', 'None')}
                    </span>
                    <h3 className="text-base font-bold text-[#1A1A1A] mb-2">
                      {ct('ร้านค้าที่ต้องจัดการ', 'Shops to Manage')}
                    </h3>
                    <p className="text-sm text-[#666666] text-center mb-4">
                      {ct('ยังไม่มีร้านค้าที่ต้องจัดการในขณะนี้', 'No shops to manage at the moment')}
                    </p>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-[#FFC107] hover:bg-[#FFB300] text-[#1A1A1A] text-sm font-semibold rounded-lg transition-all">
                        {ct('ดูรายละเอียด', 'View Details')}
                      </button>
                      <button className="px-4 py-2 bg-[#1E293B] hover:bg-[#0F172A] text-white text-sm font-semibold rounded-lg transition-all">
                        {ct('อนุมัติ', 'Approve')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingShops.map((shop) => (
                      <div key={shop.id} className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all">
                        <span className="inline-block px-3 py-1 bg-[#F3E5F5] text-[#8E24AA] rounded-md text-xs font-semibold mb-3">
                          {ct('ร้านค้า', 'Shop')}
                        </span>
                        <h3 className="text-base font-bold text-[#1A1A1A] mb-2">{shop.name}</h3>
                        <p className="text-sm text-[#666666] mb-4 line-clamp-2">{shop.description}</p>
                        <div className="flex items-center gap-3 text-sm text-[#666666] mb-4">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {shop.owner}
                          </span>
                          <span>•</span>
                          <span>{shop.category}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/community-admin/shops/${shop.id}/approve`)}
                            className="flex-1 px-4 py-2 bg-[#FFC107] hover:bg-[#FFB300] text-[#1A1A1A] text-sm font-semibold rounded-lg transition-all"
                          >
                            {ct('ดูรายละเอียด', 'View Details')}
                          </button>
                          <button className="px-4 py-2 bg-[#1E293B] hover:bg-[#0F172A] text-white text-sm font-semibold rounded-lg transition-all">
                            {ct('อนุมัติ', 'Approve')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>


      </div>
    </div>
  );
};

export default AdminDashboard;
