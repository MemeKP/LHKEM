import { useState } from 'react';
import { BarChart, Bar, PieChart as RechartsPie, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Store, Calendar, Award } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Admin Community Info - ภาพรวมสถิติและข้อมูลชุมชน
 * ตาม Figma: Admin-dashboard.png
 * หน้าแสดงข้อมูลและสถิติของชุมชน (ดูอย่างเดียว)
 * 
 * TODO: Backend APIs:
 * - GET /api/communities/:id/dashboard/stats - สถิติภาพรวม
 * - GET /api/communities/:id/dashboard/charts - ข้อมูล charts
 * - GET /api/communities/:id/dashboard/top-workshops - Workshop ยอดนิยม
 */

const AdminCommunityInfo = () => {
  const { ct } = useTranslation();
  const [timeRange, setTimeRange] = useState('month'); // week, month, year

  // TODO: Fetch from API
  const stats = {
    totalVisitors: 324,
    totalWorkshops: 2847,
    totalEvents: 42,
    totalShops: 15
  };

  // Workshop by Category
  const workshopCategoryData = [
    { name: ct('งานฝีมือ', 'Crafts'), value: 45, fill: '#16a34a' },
    { name: ct('อาหาร', 'Food'), value: 30, fill: '#f97316' },
    { name: ct('ศิลปะ', 'Art'), value: 15, fill: '#eab308' },
    { name: ct('อื่นๆ', 'Others'), value: 10, fill: '#8b5cf6' }
  ];

  // Workshop Status
  const workshopStatusData = [
    { name: ct('อนุมัติแล้ว', 'Approved'), value: 42, fill: '#16a34a' },
    { name: ct('รออนุมัติ', 'Pending'), value: 15, fill: '#eab308' }
  ];

  // Top Workshops
  const topWorkshops = [
    { rank: 1, name: ct('ย้อมผ้าครามธรรมชาติ', 'Natural Indigo Dyeing'), participants: 156, rating: 4.8 },
    { rank: 2, name: ct('ทำขนมไทยโบราณ', 'Traditional Thai Desserts'), participants: 142, rating: 4.7 },
    { rank: 3, name: ct('ปั้นดินเผาล้านนา', 'Lanna Pottery'), participants: 128, rating: 4.9 },
    { rank: 4, name: ct('ทอผ้าพื้นเมือง', 'Traditional Weaving'), participants: 115, rating: 4.6 },
    { rank: 5, name: ct('แกะสลักไม้', 'Wood Carving'), participants: 98, rating: 4.5 }
  ];

  // Engagement by Category
  const engagementData = [
    { category: ct('งานฝีมือ', 'Crafts'), value: 85 },
    { category: ct('อาหาร', 'Food'), value: 72 },
    { category: ct('ศิลปะ', 'Art'), value: 68 },
    { category: ct('วัฒนธรรม', 'Culture'), value: 54 }
  ];


  // Growth Metrics
  const growthMetrics = [
    { label: ct('จำนวนผู้เข้าชม', 'Total Visitors'), value: '48,500', change: '+12.5%', trend: 'up' },
    { label: ct('Workshop ที่จัด', 'Workshops Held'), value: '1,154', change: '+8.3%', trend: 'up' },
    { label: ct('ผู้เข้าร่วม', 'Participants'), value: '7,396', change: '+15.2%', trend: 'up' },
    { label: ct('อัตราความพึงพอใจ', 'Satisfaction Rate'), value: '87%', change: '+2.1%', trend: 'up' }
  ];

  return (
    <div className="min-h-screen bg-[#F5EFE7] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {ct('ภาพรวมของชุมชน', 'Community Dashboard')}
          </h1>
          <p className="text-gray-600">
            {ct('สถิติและข้อมูลสำคัญของชุมชนโหล่งฮิมคาว', 'Statistics and key metrics for Loeng Him Kaw community')}
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex justify-end mb-6">
          <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
            {['week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                  timeRange === range
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {range === 'week' && ct('สัปดาห์', 'Week')}
                {range === 'month' && ct('เดือน', 'Month')}
                {range === 'year' && ct('ปี', 'Year')}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.totalVisitors}</span>
            </div>
            <p className="text-sm text-gray-600">{ct('ผู้เข้าชม', 'Visitors')}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.totalWorkshops}</span>
            </div>
            <p className="text-sm text-gray-600">Workshop</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.totalEvents}</span>
            </div>
            <p className="text-sm text-gray-600">{ct('กิจกรรม', 'Events')}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Store className="h-8 w-8 text-pink-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.totalShops}</span>
            </div>
            <p className="text-sm text-gray-600">{ct('ร้านค้า', 'Shops')}</p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Workshop by Category - Bar Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {ct('จำนวน Workshop แยกตามประเภท', 'Workshops by Category')}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workshopCategoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#f97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top 5 Workshops */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {ct('Workshop ยอดนิยม 5 อันดับแรก', 'Top 5 Workshops')}
            </h3>
            <div className="space-y-3">
              {topWorkshops.map((workshop) => (
                <div key={workshop.rank} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      workshop.rank === 1 ? 'bg-yellow-500' :
                      workshop.rank === 2 ? 'bg-gray-400' :
                      workshop.rank === 3 ? 'bg-orange-600' : 'bg-gray-300'
                    }`}>
                      {workshop.rank}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{workshop.name}</p>
                      <p className="text-xs text-gray-500">{workshop.participants} {ct('คน', 'participants')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold text-gray-900">{workshop.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Workshop Status - Pie Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {ct('สถานะ Workshop', 'Workshop Status')}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={workshopStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {workshopStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </div>

          {/* Engagement by Category */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {ct('ความนิยมแต่ละประเภท', 'Engagement by Category')}
            </h3>
            <div className="space-y-4">
              {engagementData.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.category}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${item.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Growth Metrics */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {ct('การเติบโตของชุมชนในรอบ 6 เดือน', 'Community Growth (Last 6 Months)')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {growthMetrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-600">{metric.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCommunityInfo;
