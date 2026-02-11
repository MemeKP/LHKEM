import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Eye, Calendar, MapPin, Users, TrendingUp, DollarSign, Store, BarChart3, PieChart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { BarChart, Bar, PieChart as RechartsPie, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Community Admin Dashboard - UI Structure Only
 * 
 * TODO: Backend APIs needed:
 * - GET /api/communities/:id/dashboard - Dashboard statistics
 * - GET /api/communities/:id/shops - List of shops in community
 * - GET /api/workshops/pending - Pending workshops for approval
 * - PATCH /api/workshops/:id/approve - Approve workshop
 * - PATCH /api/workshops/:id/reject - Reject workshop
 * - GET /api/communities/:id/stats - Various statistics for charts
 */

const CommunityAdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // TODO: Fetch from API - GET /api/communities/:id/dashboard
  // Mock data for UI preview
  const stats = {
    totalShops: 12,        // จำนวนร้านค้าทั้งหมดในชุมชน
    totalWorkshops: 28,    // จำนวน Workshop ทั้งหมด
    pendingApprovals: 3,   // จำนวน Workshop รออนุมัติ
    totalParticipants: 156, // จำนวนผู้เข้าร่วมทั้งหมด
    monthlyRevenue: 45800  // รายได้รวมในเดือนนี้
  };

  // TODO: Fetch from API - GET /api/workshops/pending
  // Mock data for UI preview
  const pendingWorkshops = [
    {
      id: '1',
      title: 'ย้อมผ้าครามธรรมชาติ',
      description: 'เรียนรู้การย้อมผ้าด้วยสีครามจากธรรมชาติ ตั้งแต่การเตรียมน้ำย้อม การพับผ้า จนได้ผืนผ้าสวยงาม',
      shop: { name: 'บ้านครามโหล่งฮิมคาว', image: null },
      price: 450,
      seatLimit: 8,
      category: 'craft',
      duration: '3 ชม.',
      createdAt: new Date('2024-01-05')
    },
    {
      id: '2',
      title: 'ปั้นดินเผาล้านนา',
      description: 'สัมผัสประสบการณ์การปั้นดินเผาแบบล้านนา ทำภาชนะเครื่องใช้ด้วยมือของคุณเอง',
      shop: { name: 'เครื่องปั้นดินเผาบ้านมอญ', image: null },
      price: 380,
      seatLimit: 6,
      category: 'craft',
      duration: '2.5 ชม.',
      createdAt: new Date('2024-01-06')
    },
    {
      id: '3',
      title: 'ทำขนมไทยโบราณ',
      description: 'เรียนรู้วิธีทำขนมไทยโบราณจากคุณยาย พร้อมเคล็ดลับสูตรต้นตำรับ',
      shop: { name: 'ครัวคุณยายสมบูรณ์', image: null },
      price: 320,
      seatLimit: 10,
      category: 'cooking',
      duration: '2 ชม.',
      createdAt: new Date('2024-01-07')
    }
  ];
  // Structure: { id, title, description, shop: { name }, price, seatLimit, category, duration, createdAt }

  // TODO: Fetch from API - GET /api/communities/:id/shops
  // Mock data for UI preview
  const shops = [
    { id: '1', name: 'บ้านครามโหล่งฮิมคาว', category: 'งานฝีมือ', workshopCount: 5, status: 'active' },
    { id: '2', name: 'เครื่องปั้นดินเผาบ้านมอญ', category: 'งานฝีมือ', workshopCount: 3, status: 'active' },
    { id: '3', name: 'ครัวคุณยายสมบูรณ์', category: 'อาหาร', workshopCount: 4, status: 'active' },
    { id: '4', name: 'ศูนย์หัตถกรรมไม้', category: 'งานไม้', workshopCount: 2, status: 'active' },
    { id: '5', name: 'บ้านผ้าทอมือ', category: 'สิ่งทอ', workshopCount: 6, status: 'active' },
    { id: '6', name: 'สตูดิโอศิลปะล้านนา', category: 'ศิลปะ', workshopCount: 3, status: 'active' },
    { id: '7', name: 'โฮงเฮียนสมุนไพร', category: 'สมุนไพร', workshopCount: 2, status: 'active' },
    { id: '8', name: 'ร้านขนมไทยบ้านสวน', category: 'อาหาร', workshopCount: 3, status: 'inactive' }
  ];
  // Structure: { id, name, category, workshopCount, status }

  // Chart data
  const workshopCategoryData = [
    { name: 'งานฝีมือ', count: 12, fill: '#f97316' },
    { name: 'อาหาร', count: 7, fill: '#eab308' },
    { name: 'ศิลปะ', count: 4, fill: '#8b5cf6' },
    { name: 'สิ่งทอ', count: 5, fill: '#3b82f6' }
  ];

  const workshopStatusData = [
    { name: 'อนุมัติแล้ว', value: 22, fill: '#22c55e' },
    { name: 'รออนุมัติ', value: 3, fill: '#eab308' },
    { name: 'ปฏิเสธ', value: 3, fill: '#ef4444' }
  ];

  const trendData = [
    { month: 'ม.ค.', participants: 45 },
    { month: 'ก.พ.', participants: 52 },
    { month: 'มี.ค.', participants: 61 },
    { month: 'เม.ย.', participants: 58 },
    { month: 'พ.ค.', participants: 73 },
    { month: 'มิ.ย.', participants: 82 }
  ];

  const COLORS = ['#f97316', '#eab308', '#8b5cf6', '#3b82f6'];

  // TODO: Fetch from API - GET /api/events?community_id=xxx
  // Mock data for Events
  const upcomingEvents = [
    {
      id: '1',
      title: 'งานลอยกระทงโหล่งฮิมคาว 2567',
      description: 'ร่วมงานประเพณีลอยกระทงริมแม่น้ำคาว พร้อมกิจกรรมสาธิตงานฝีมือ การแสดงดนตรีพื้นบ้าน และตลาดนัดชุมชน',
      location: 'ริมแม่น้ำคาว โหล่งฮิมคาว',
      start_at: new Date('2024-11-15T18:00:00'),
      end_at: new Date('2024-11-15T22:00:00'),
      seat_limit: 200,
      deposit_amount: 0,
      status: 'OPEN',
      is_featured: true,
      is_pinned: true,
      images: []
    },
    {
      id: '2',
      title: 'ตลาดนัดหัตถกรรมล้านนา',
      description: 'ตลาดนัดรวมผลิตภัณฑ์งานฝีมือจากช่างฝีมือในชุมชน พร้อมสาธิตการทำงานและจำหน่ายสินค้าราคาพิเศษ',
      location: 'ลานกิจกรรมโหล่งฮิมคาว',
      start_at: new Date('2024-02-10T08:00:00'),
      end_at: new Date('2024-02-10T16:00:00'),
      seat_limit: 150,
      deposit_amount: 0,
      status: 'OPEN',
      is_featured: false,
      is_pinned: false,
      images: []
    },
    {
      id: '3',
      title: 'เทศกาลอาหารพื้นบ้านล้านนา',
      description: 'ชิมอาหารพื้นบ้านล้านนาต้นตำรับจากครัวคุณยาย พร้อมสาธิตการทำอาหารและเรียนรู้เคล็ดลับสูตรโบราณ',
      location: 'ครัวคุณยายสมบูรณ์',
      start_at: new Date('2024-03-20T10:00:00'),
      end_at: new Date('2024-03-20T15:00:00'),
      seat_limit: 80,
      deposit_amount: 100,
      status: 'OPEN',
      is_featured: true,
      is_pinned: false,
      images: []
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ภาพรวมของชุมชน</h1>
            <p className="text-gray-600 mt-1">จัดการ Workshop, Event และร้านค้าในชุมชนของคุณ</p>
          </div>
          <button
            onClick={() => navigate('/community-admin/events/create')}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
          >
            <Calendar className="h-5 w-5" />
            สร้าง Event ใหม่
          </button>
        </div>

        {/* Stats Cards - TODO: ข้อมูลจาก GET /api/communities/:id/dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">จำนวนร้านค้า</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalShops}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Store className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Workshop ทั้งหมด</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalWorkshops}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">รออนุมัติ</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingApprovals}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ผู้เข้าร่วม</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalParticipants}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">รายได้เดือนนี้</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">฿{stats.monthlyRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section - TODO: ข้อมูลจาก GET /api/communities/:id/stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Workshop by Category Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              Workshop แยกตามประเภท
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={workshopCategoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  labelStyle={{ color: '#111827', fontWeight: 600 }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {workshopCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Workshop Status Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-orange-500" />
              สถานะ Workshop
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPie>
                <Pie
                  data={workshopStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {workshopStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shops Table - TODO: ข้อมูลจาก GET /api/communities/:id/shops */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">ร้านค้าในชุมชน</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ลำดับ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ชื่อร้าน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ประเภท
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      จำนวน Workshop
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สถานะ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shops.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        ยังไม่มีข้อมูลร้านค้า
                      </td>
                    </tr>
                  ) : (
                    shops.map((shop, index) => (
                      <tr key={shop.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {shop.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {shop.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {shop.workshopCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            shop.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {shop.status === 'active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pending Workshops - TODO: ข้อมูลจาก GET /api/workshops/pending */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Workshop รออนุมัติ</h2>
              <button
                onClick={() => navigate('/community-admin/workshops/pending')}
                className="text-orange-600 hover:text-orange-700 font-medium text-sm"
              >
                ดูทั้งหมด
              </button>
            </div>

            {pendingWorkshops.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">ไม่มี Workshop รออนุมัติ</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingWorkshops.slice(0, 3).map((workshop) => (
                  <div
                    key={workshop.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-video bg-gray-200 rounded-lg mb-3"></div>
                    <h3 className="font-semibold text-gray-900 mb-2">{workshop.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{workshop.description}</p>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-gray-600">฿{workshop.price}</span>
                      <span className="text-gray-600">{workshop.seatLimit} ที่นั่ง</span>
                    </div>
                    <button
                      onClick={() => navigate(`/community-admin/workshops/${workshop.id}`)}
                      className="w-full px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      ตรวจสอบ
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Events Section - TODO: ข้อมูลจาก GET /api/events?community_id=xxx */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                กิจกรรมของชุมชน
              </h2>
              <button
                onClick={() => navigate('/community-admin/events')}
                className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center gap-1"
              >
                <span>ดู Event ทั้งหมด</span>
              </button>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">ยังไม่มีกิจกรรมที่กำลังจะมาถึง</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/community-admin/events/${event.id}`)}
                  >
                    {/* Event Image */}
                    <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-200 relative">
                      {event.images && event.images.length > 0 ? (
                        <img
                          src={event.images[0]}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Calendar className="h-16 w-16 text-orange-300" />
                        </div>
                      )}
                      {/* Status Badges */}
                      <div className="absolute top-3 right-3 flex gap-2">
                        {event.is_pinned && (
                          <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                            ปักหมุด
                          </span>
                        )}
                        {event.is_featured && (
                          <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                            แนะนำ
                          </span>
                        )}
                      </div>
                      {/* Status */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          event.status === 'OPEN' 
                            ? 'bg-green-100 text-green-800' 
                            : event.status === 'CLOSED'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {event.status === 'OPEN' ? 'เปิดรับสมัคร' : event.status === 'CLOSED' ? 'ปิดรับสมัคร' : 'ยกเลิก'}
                        </span>
                      </div>
                    </div>

                    {/* Event Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                      
                      {/* Event Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2 text-gray-600">
                          <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">{new Date(event.start_at).toLocaleDateString('th-TH', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</p>
                            <p className="text-xs">
                              {new Date(event.start_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                              {' - '}
                              {new Date(event.end_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>{event.seat_limit} ที่นั่ง</span>
                          </div>
                          {event.deposit_amount > 0 && (
                            <div className="flex items-center gap-1 text-orange-600 font-medium">
                              <DollarSign className="h-4 w-4" />
                              <span>฿{event.deposit_amount}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Trend Chart - TODO: ข้อมูลจาก GET /api/communities/:id/stats */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              แนวโน้มการเข้าร่วม Workshop
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  labelStyle={{ color: '#111827', fontWeight: 600 }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="participants" 
                  stroke="#f97316" 
                  strokeWidth={3}
                  dot={{ fill: '#f97316', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="ผู้เข้าร่วม"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityAdminDashboard;
