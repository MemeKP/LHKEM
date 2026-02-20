import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Calendar, Store, FileText, Users, Eye, AlertCircle, CheckCircle, XCircle, Edit, Plus, List, MapPin } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { getShopsByCommunity, getPendingShops } from '../../services/shopService';

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

const usePendingData = (communityId) => {
  // shop
  const shopsQuery = useQuery({
    queryKey: ['community-shops', communityId],
    queryFn: async () => {
      if (!communityId) return [];
      return await getShopsByCommunity(communityId);
    },
    enabled: !!communityId,
  });

  const pendingShopsQuery = useQuery({
    queryKey: ['community-pending-shops', communityId],
    queryFn: async () => {
      if (!communityId) return [];
      return await getPendingShops(communityId);
    },
    enabled: !!communityId,
  });
  // workshop

  // event
  const eventsQuery = useQuery({
    queryKey: ['events', 'pending'],
    queryFn: async () => (await api.get('/api/events/pending')).data,
  });

  return { eventsQuery, shopsQuery, pendingShopsQuery };
};

const AdminDashboard = () => {
  const { community } = useOutletContext();
  const { eventsQuery, shopsQuery, pendingShopsQuery } = usePendingData(community?._id);
  const navigate = useNavigate();
  const { ct } = useTranslation();
  const [activeTab, setActiveTab] = useState('workshops');
  const [taskTab, setTaskTab] = useState('events'); // Tab for Events/Shops section
  const isLoading = eventsQuery.isLoading || shopsQuery.isLoading || pendingShopsQuery.isLoading;

  if (isLoading) return <div className="p-8 text-center">กำลังโหลดข้อมูล...</div>;

  const pendingEvents = eventsQuery.data || [];
  const communityShops = shopsQuery.data || [];
  const pendingShops = pendingShopsQuery.data || communityShops.filter(
    (shop) => ((shop.status || 'PENDING').toUpperCase()) !== 'ACTIVE'
  );

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

  const pendingCounts = {
    workshops: pendingWorkshops.length,
    events: pendingEvents.length,
    shops: pendingShops.length,
    total: pendingWorkshops.length + pendingEvents.length + pendingShops.length,
  };

  // TODO: Fetch from API
  /*
  const pendingCounts = {
    workshops: 2,
    events: 1,
    shops: 1,
    total: 4
  };*/

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
    switch ((status || '').toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusLabel = (status) => {
    const value = status || 'PENDING';
    if (value === 'ACTIVE') return ct('อนุมัติแล้ว', 'Approved');
    if (value === 'REJECTED') return ct('ถูกปฏิเสธ', 'Rejected');
    return ct('รออนุมัติ', 'Pending');
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
            <p className="text-sm font-medium text-[#666666]">{ct('Workshops รออนุมัติ', 'Workshops Pending')}</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#FFF9C4] rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-[#F9A825]" />
              </div>
              <span className="text-2xl font-bold text-[#1A1A1A]">{pendingCounts.workshops}</span>
            </div>
            <p className="text-sm font-medium text-[#666666]">{ct('Workshops รอการแก้ไข', 'Workshops Review')}</p>
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
            <p className="text-sm font-medium text-[#666666]">{ct('ร้านค้าที่รอการอนุมัติ', 'Shops Pending')}</p>
          </div>
        </div>

        {/* Community Shops Overview */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">{ct('ร้านค้าในชุมชน', 'Community Shop')}</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/community-admin/shops')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-[#1A1A1A] text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                <List className="h-4 w-4" />
                {ct('ดูร้านค้าทั้งหมด', 'View all shops')}
              </button>
            </div>
          </div>

          {communityShops.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-8 text-center">
              <Store className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">{ct('ยังไม่มีร้านค้าในชุมชนของคุณ', 'No shops have been created in this community yet.')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {communityShops.slice(0, 6).map((shop) => (
                <div key={shop._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{ct('ร้านค้า', 'Shop')}</p>
                      <h3 className="text-lg font-semibold text-[#1A1A1A]">{shop.shopName}</h3>
                      <p className="text-sm text-[#666666] line-clamp-2">{shop.description || ct('ยังไม่มีคำอธิบาย', 'No description')}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(shop.status)}`}>
                      {statusLabel(shop.status)}
                    </span>
                  </div>
                  <div className="text-sm text-[#666666] flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#8E24AA]" />
                      <span className="line-clamp-1">{shop.address || shop.location?.address || ct('ยังไม่ระบุที่อยู่', 'No address provided')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#8E24AA]" />
                      <span>{shop.owner?.name || shop.ownerName || ct('ยังไม่ระบุเจ้าของร้าน', 'Owner not specified')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{ct('เปิด', 'Open')}: {shop.openTime || '-'}</span>
                      <span>•</span>
                      <span>{ct('ปิด', 'Close')}: {shop.closeTime || '-'}</span>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => navigate(`/community-admin/shops/${shop._id}/approval`)}
                      className="px-4 py-2 bg-[#1E293B] text-white rounded-full text-sm font-semibold hover:bg-[#0F172A] transition"
                    >
                      {ct('ตรวจสอบ', 'Review')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                <p className="text-sm text-[#8E24AA] font-medium mb-4">
                  {ct('รายชื่อต่อไปนี้ยังไม่ผ่านการอนุมัติ โปรดตรวจสอบและดำเนินการ', 'These shops are still pending approval. Review the details and approve or reject each one.')}
                </p>
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
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingShops.map((shop) => (
                      <div key={shop._id || shop.id} className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all">
                        <span className="inline-block px-3 py-1 bg-[#F3E5F5] text-[#8E24AA] rounded-md text-xs font-semibold mb-3">
                          {ct('ร้านค้า', 'Shop')}
                        </span>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-base font-bold text-[#1A1A1A]">{shop.shopName}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(shop.status)}`}>
                            {statusLabel(shop.status)}
                          </span>
                        </div>
                        <p className="text-xs text-orange-600 mb-2">
                          {ct('สถานะ: ต้องตรวจสอบและอนุมัติก่อนจะปรากฏในแผนที่และหน้า Workshop', 'Pending approval: approve to show this shop on the map and listings.')}
                        </p>
                        <p className="text-sm text-[#666666] mb-4 line-clamp-2">{shop.description || ct('ยังไม่มีคำอธิบาย', 'No description')}</p>
                        <div className="flex items-center gap-3 text-sm text-[#666666] mb-4">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {shop.owner?.name || shop.ownerName || ct('ไม่ระบุ', 'Unknown')}
                          </span>
                          <span>•</span>
                          <span>{shop.address ? shop.address.split(',')[0] : ct('ไม่ระบุที่อยู่', 'No address')}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/community-admin/shops/${shop._id}/approval`)}
                            className="flex-1 px-4 py-2 bg-[#FFC107] hover:bg-[#FFB300] text-[#1A1A1A] text-sm font-semibold rounded-lg transition-all"
                          >
                            {ct('ดูรายละเอียด', 'View Details')}
                          </button>
                          <button
                            onClick={() => navigate(`/community-admin/shops/${shop._id}/approval`)}
                            className="px-4 py-2 bg-[#1E293B] hover:bg-[#0F172A] text-white text-sm font-semibold rounded-lg transition-all"
                          >
                            {ct('ไปยังหน้าการอนุมัติ', 'Go to approval')}
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
