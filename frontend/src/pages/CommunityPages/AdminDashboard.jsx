import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Store, FileText, Users, Eye, AlertCircle, CheckCircle, XCircle, Edit, Plus, List } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { ct } = useTranslation();
  const [activeTab, setActiveTab] = useState('workshops');

  // TODO: Fetch from API
  const pendingCounts = {
    workshops: 2,
    events: 1,
    shops: 1,
    total: 4
  };

  // Mock data - Workshop รออนุมัติ
  const pendingWorkshops = [
    {
      id: 'w1',
      title: 'Workshop ย้อมผ้าครามธรรมชาติ',
      shop: 'บ้านครามโหล่งฮิมคาว',
      description: 'เรียนรู้การย้อมผ้าด้วยสีครามจากธรรมชาติ ตั้งแต่การเตรียมน้ำย้อม การพับผ้า จนได้ผืนผ้าสวยงาม',
      price: 450,
      seats: 8,
      duration: '3 ชม.',
      submittedAt: '2024-01-15T10:30:00',
      status: 'รออนุมัติ'
    },
    {
      id: 'w2',
      title: 'Workshop เครื่องปั้นดินเผาล้านนา',
      shop: 'เครื่องปั้นดินเผาบ้านมอญ',
      description: 'สัมผัสประสบการณ์การปั้นดินเผาแบบล้านนา ทำภาชนะเครื่องใช้ด้วยมือของคุณเอง',
      price: 380,
      seats: 6,
      duration: '2.5 ชม.',
      submittedAt: '2024-01-16T14:20:00',
      status: 'รออนุมัติ'
    }
  ];

  // Mock data - Event รออนุมัติ
  const pendingEvents = [
    {
      id: 'e1',
      title: 'Event ตลาดนัดหัตถกรรมล้านนา',
      organizer: 'ชุมชนโหล่งฮิมคาว',
      description: 'ตลาดนัดรวมผลิตภัณฑ์งานฝีมือจากช่างฝีมือในชุมชน',
      date: '2024-02-10',
      time: '08:00 - 16:00',
      location: 'ลานกิจกรรมโหล่งฮิมคาว',
      submittedAt: '2024-01-14T09:15:00',
      status: 'รออนุมัติ'
    }
  ];

  // Mock data - ร้านค้ารออนุมัติ
  const pendingShops = [
    {
      id: 's1',
      name: 'ร้านหัตถกรรมไม้ล้านนา',
      owner: 'คุณสมชาย ใจดี',
      category: 'งานไม้',
      description: 'ร้านจำหน่ายและสอนงานไม้แกะสลักล้านนา',
      submittedAt: '2024-01-13T16:45:00',
      status: 'รออนุมัติ'
    }
  ];

  const tabs = [
    { id: 'workshops', label: ct('Workshop', 'Workshop'), count: pendingCounts.workshops, icon: FileText },
    { id: 'events', label: ct('กิจกรรม', 'Events'), count: pendingCounts.events, icon: Calendar },
    { id: 'shops', label: ct('ร้านค้า', 'Shops'), count: pendingCounts.shops, icon: Store }
  ];

  const getStatusColor = (status) => {
    if (status === 'รออนุมัติ') return 'bg-yellow-100 text-yellow-800';
    if (status === 'อนุมัติแล้ว') return 'bg-green-100 text-green-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Action Buttons */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {ct('ศูนย์รวมการจัดการชุมชน', 'Community Management Hub')}
            </h1>
            <p className="text-gray-600">
              {ct('จัดการและอนุมัติข้อมูลต่างๆ ของชุมชน', 'Manage and approve community submissions')}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/community-admin/settings')}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition shadow-sm"
            >
              <Edit className="h-4 w-4" />
              {ct('แก้ไข', 'Edit')}
            </button>
            <button
              onClick={() => navigate('/community-admin/events/create')}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition shadow-sm"
            >
              <Plus className="h-4 w-4" />
              {ct('สร้างอีเว้นท์', 'Create Event')}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <span className="text-4xl font-bold text-white">{pendingCounts.total}</span>
            </div>
            <p className="text-sm font-semibold text-white/90">{ct('รออนุมัติทั้งหมด', 'All Pending')}</p>
          </div>

          <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-4xl font-bold text-gray-900">{pendingCounts.workshops}</span>
            </div>
            <p className="text-sm font-semibold text-gray-600">Workshop {ct('รออนุมัติ', 'Pending')}</p>
          </div>

          <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-4xl font-bold text-gray-900">{pendingCounts.events}</span>
            </div>
            <p className="text-sm font-semibold text-gray-600">{ct('กิจกรรมรออนุมัติ', 'Events Pending')}</p>
          </div>

          <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Store className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-4xl font-bold text-gray-900">{pendingCounts.shops}</span>
            </div>
            <p className="text-sm font-semibold text-gray-600">{ct('ร้านค้ารออนุมัติ', 'Shops Pending')}</p>
          </div>
        </div>

        {/* การแจ้งเตือนด่วน */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-5 mb-8 rounded-2xl shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900 mb-1">
                {ct('การแจ้งเตือนด่วน', 'Urgent Notifications')}
              </h3>
              <p className="text-sm text-gray-700">
                {ct('มีรายการรออนุมัติ: Workshop ย้อมผ้าครามธรรมชาติ ส่งมาเมื่อ 15 ม.ค. 2568 เวลา 10:30 น. กรุณาตรวจสอบ', 'Pending approval: Natural Indigo Dyeing Workshop submitted on Jan 15, 2024 at 10:30 AM. Please review.')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Quick Actions for Events */}
        <div className="bg-blue-50 border border-blue-200 p-5 mb-8 rounded-2xl shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900 mb-1">
                {ct('จัดการกิจกรรม (Event)', 'Event Management')}
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                {ct('สร้างกิจกรรมใหม่หรือดูรายการกิจกรรมทั้งหมดของชุมชน', 'Create new events or view all community events')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/community-admin/events/create')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                >
                  <Plus className="h-4 w-4" />
                  {ct('สร้างกิจกรรมใหม่', 'Create Event')}
                </button>
                <button
                  onClick={() => navigate('/community-admin/events')}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-blue-600 text-sm font-medium rounded-lg border border-blue-200 transition"
                >
                  <List className="h-4 w-4" />
                  {ct('ดูกิจกรรมทั้งหมด', 'View All Events')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        activeTab === tab.id ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Workshop Tab */}
            {activeTab === 'workshops' && (
              <div className="space-y-4">
                {pendingWorkshops.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">{ct('ไม่มี Workshop รออนุมัติ', 'No pending workshops')}</p>
                  </div>
                ) : (
                  pendingWorkshops.map((workshop) => (
                    <div key={workshop.id} className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-orange-300 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-bold">
                              {ct('รออนุมัติ', 'Pending')}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                              {ct('ส่งเมื่อ', 'Submitted')}: {new Date(workshop.submittedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })} {new Date(workshop.submittedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} {ct('น.', '')}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{workshop.title}</h3>
                          <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                            <Store className="h-4 w-4" />
                            {ct('โดยร้าน', 'By')} <span className="font-semibold">{workshop.shop}</span>
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed mb-4">{workshop.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-gray-700">
                              <span className="font-semibold">฿{workshop.price}</span>
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="flex items-center gap-1 text-gray-700">
                              <Users className="h-4 w-4" />
                              {workshop.seats} {ct('ที่นั่ง', 'seats')}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-700">{workshop.duration}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end pt-4 border-t-2 border-gray-100">
                        <button
                          onClick={() => navigate(`/community-admin/workshops/${workshop.id}/approve`)}
                          className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                        >
                          {ct('ตรวจสอบ', 'Review')}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="space-y-4">
                {pendingEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">{ct('ไม่มีกิจกรรมรออนุมัติ', 'No pending events')}</p>
                  </div>
                ) : (
                  pendingEvents.map((event) => (
                    <div key={event.id} className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-green-300 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-bold">
                              {ct('รออนุมัติ', 'Pending')}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                              {ct('ส่งเมื่อ', 'Submitted')}: {new Date(event.submittedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })} {new Date(event.submittedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} {ct('น.', '')}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                          <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {ct('จัดโดย', 'Organized by')} <span className="font-semibold">{event.organizer}</span>
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed mb-4">{event.description}</p>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                              <Calendar className="h-4 w-4 text-green-600" />
                              <span className="font-medium">{new Date(event.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                              <span className="text-green-600">⏰</span>
                              <span className="font-medium">{event.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                              <span className="text-green-600">📍</span>
                              <span className="font-medium truncate">{event.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/community-admin/events/${event.id}`)}
                            className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                          >
                            {ct('ดูรายละเอียด', 'View Details')}
                          </button>
                          <button
                            onClick={() => navigate(`/community-admin/events/${event.id}/edit`)}
                            className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
                          >
                            {ct('แก้ไข', 'Edit')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Shops Tab */}
            {activeTab === 'shops' && (
              <div className="space-y-4">
                {pendingShops.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">{ct('ไม่มีร้านค้ารออนุมัติ', 'No pending shops')}</p>
                  </div>
                ) : (
                  pendingShops.map((shop) => (
                    <div key={shop.id} className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-purple-300 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-bold">
                              {ct('รออนุมัติ', 'Pending')}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                              {ct('ส่งเมื่อ', 'Submitted')}: {new Date(shop.submittedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })} {new Date(shop.submittedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} {ct('น.', '')}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{shop.name}</h3>
                          <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {ct('เจ้าของ', 'Owner')}: <span className="font-semibold">{shop.owner}</span>
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed mb-4">{shop.description}</p>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-lg">
                              <Store className="h-3.5 w-3.5" />
                              {shop.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/community-admin/shops/${shop.id}/approve`)}
                            className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                          >
                            {ct('ตรวจสอบ', 'Review')}
                          </button>
                          <button
                            className="px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
                          >
                            {ct('ดูข้อมูล', 'View Info')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* การจัดการล่าสุด */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{ct('การจัดการล่าสุด', 'Recent Actions')}</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {ct('อนุมัติ Workshop "ทำขนมไทยโบราณ"', 'Approved Workshop "Traditional Thai Desserts"')}
                </p>
                <p className="text-xs text-gray-500">2 {ct('ชั่วโมงที่แล้ว', 'hours ago')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {ct('ปฏิเสธ Event "งานวัดประจำปี" - ข้อมูลไม่ครบถ้วน', 'Rejected Event "Annual Temple Fair" - Incomplete information')}
                </p>
                <p className="text-xs text-gray-500">5 {ct('ชั่วโมงที่แล้ว', 'hours ago')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {ct('อนุมัติร้านค้า "บ้านผ้าทอมือ"', 'Approved Shop "Handwoven Fabric House"')}
                </p>
                <p className="text-xs text-gray-500">{ct('เมื่อวาน', 'Yesterday')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
