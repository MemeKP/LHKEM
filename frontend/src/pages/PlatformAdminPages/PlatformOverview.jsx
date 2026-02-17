import { useState, useEffect } from 'react';
import { Users, Store, Calendar, TrendingUp, AlertCircle, CheckCircle, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// หน้านี้ยังงง กี้้ด้ดๆๆๆ ;____;

const PlatformOverview = () => {
  const { ct } = useTranslation();
  const [stats, setStats] = useState({
    totalCommunities: 4,
    totalShops: 41,
    totalWorkshops: 48,
    totalParticipants: 627
  });
  const [alerts, setAlerts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [participantRanking, setParticipantRanking] = useState([]);
  const [activityRanking, setActivityRanking] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    // Mock data
    const mockAlerts = [
      {
        type: 'warning',
        title: 'ชุมชนพบปัญหาติดตั้ง',
        detail: 'ชุมชนเพิ่งเข้าร่วม: 3/5 ในเดือนที่ผ่านมา',
        time: '15 นาทีที่แล้ว'
      },
      {
        type: 'success',
        title: 'ชุมชนใหม่ในโหมดการ',
        detail: 'สำรวจทั้งสิ้น: 3/5 ในเดือนที่ผ่านมา',
        time: '2 ชั่วโมงที่แล้ว'
      },
      {
        type: 'warning',
        title: 'ชุมชนขอการซ่อมบำรุง',
        detail: 'ในที่ workshop ไม่ได้ผล 23 วัน',
        time: 'ก่อนหน้านี้'
      }
    ];

    const mockCommunities = [
      { name: 'ชุมชนโหล่งฮิมคาว', location: 'เชียงใหม่', shops: 12, workshops: 16, members: 345, status: 'active' },
      { name: 'ชุมชนหัตถกรรมท้องถิ่น', location: 'ปัว', shops: 9, workshops: 12, members: 156, status: 'active' },
      { name: 'ชุมชนเกษตรอินทรีย์', location: 'ภูเก็ต', shops: 6, workshops: 10, members: 128, status: 'pending' },
      { name: 'ชุมชนตลาดท้องถิ่น', location: 'เชียงราย', shops: 15, workshops: 8, members: 86, status: 'active' }
    ];

    const mockActivityData = [
      { name: 'แกะสลัก', value: 28, color: '#f97316' },
      { name: 'เครื่องปั้น', value: 22, color: '#16a34a' },
      { name: 'ทอผ้า', value: 35, color: '#eab308' },
      { name: 'วัฒนธรรม', value: 15, color: '#8b5cf6' }
    ];

    const mockParticipantRanking = [
      { name: 'ชุมชนโหล่งฮิมคาว', location: 'เชียงใหม่', count: 245 },
      { name: 'ชุมชนหัตถกรรมท้องถิ่น', location: 'ปัว', count: 156 },
      { name: 'ชุมชนเกษตรอินทรีย์', location: 'ภูเก็ต', count: 128 }
    ];

    const mockActivityRanking = [
      { name: 'ชุมชนโหล่งฮิมคาว', location: 'เชียงใหม่', count: 18 },
      { name: 'ชุมชนหัตถกรรมท้องถิ่น', location: 'ปัว', count: 12 },
      { name: 'ชุมชนเกษตรอินทรีย์', location: 'ภูเก็ต', count: 10 }
    ];

    const mockMonthlyData = [
      { month: 'ม.ค.', value: 400 },
      { month: 'ก.พ.', value: 450 },
      { month: 'มี.ค.', value: 500 },
      { month: 'เม.ย.', value: 550 }
    ];

    setAlerts(mockAlerts);
    setCommunities(mockCommunities);
    setActivityData(mockActivityData);
    setParticipantRanking(mockParticipantRanking);
    setActivityRanking(mockActivityRanking);
    setMonthlyData(mockMonthlyData);
  }, []);

  const StatCard = ({ icon: Icon, value, label, color = 'orange' }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-3xl font-bold ${color === 'green' ? 'text-green-600' : 'text-orange-500'}`}>
            {value}
          </p>
          <p className="text-sm text-gray-600 mt-1">{label}</p>
        </div>
        <div className={`p-3 rounded-lg ${color === 'green' ? 'bg-green-50' : 'bg-orange-50'}`}>
          <Icon className={`h-6 w-6 ${color === 'green' ? 'text-green-600' : 'text-orange-500'}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F3] animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {ct('ภาพรวมแพลตฟอร์ม', 'Platform Overview')}
          </h1>
          <p className="text-gray-600">
            {ct('ข้อมูลและสถิติของชุมชนทั้งหมดในระบบ', 'Data and statistics of all communities in the system')}
          </p>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mb-6">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
            <option>{ct('ทั้งหมด', 'All')}</option>
            <option>{ct('เดือนนี้', 'This Month')}</option>
            <option>{ct('ปีนี้', 'This Year')}</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
            <option>{ct('ทุกชุมชน', 'All Communities')}</option>
            <option>{ct('ชุมชนใหม่', 'New Communities')}</option>
            <option>{ct('ชุมชนที่ใช้งาน', 'Active Communities')}</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            value={stats.totalCommunities}
            label={ct('Community ทั้งหมด', 'Total Communities')}
            color="orange"
          />
          <StatCard
            icon={Store}
            value={stats.totalShops}
            label={ct('ร้าน ทั้งหมด', 'Total Shops')}
            color="green"
          />
          <StatCard
            icon={Calendar}
            value={stats.totalWorkshops}
            label={ct('Workshop / Event', 'Workshop / Event')}
            color="orange"
          />
          <StatCard
            icon={TrendingUp}
            value={stats.totalParticipants}
            label={ct('ผู้เข้าร่วมทั้งหมด', 'Total Participants')}
            color="orange"
          />
        </div>

        {/* Alert Boxes (สิ่งที่ต้องใส่ใจ) */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{ct('สิ่งที่ต้องใส่ใจ', 'Things to watch')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`rounded-xl p-4 flex items-start space-x-3 ${
                  alert.type === 'warning' ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'
                }`}
              >
                {alert.type === 'warning' ? (
                  <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${alert.type === 'warning' ? 'text-orange-900' : 'text-green-900'}`}>
                    {alert.title}
                  </p>
                  <p className={`text-xs mt-1 ${alert.type === 'warning' ? 'text-orange-700' : 'text-green-700'}`}>
                    {alert.detail}
                  </p>
                  <p className={`text-xs mt-1 ${alert.type === 'warning' ? 'text-orange-600' : 'text-green-600'}`}>
                    {alert.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Communities Table */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{ct('ภาพรวมแต่ละ Community', 'Overview of Each Community')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-sm font-semibold text-gray-900 pb-3">{ct('ชุมชน', 'Community')}</th>
                    <th className="text-center text-sm font-semibold text-gray-900 pb-3">{ct('ที่ตั้ง', 'Location')}</th>
                    <th className="text-center text-sm font-semibold text-gray-900 pb-3">{ct('Shop', 'Shop')}</th>
                    <th className="text-center text-sm font-semibold text-gray-900 pb-3">{ct('กิจกรรม', 'Activities')}</th>
                    <th className="text-center text-sm font-semibold text-gray-900 pb-3">{ct('ผู้เข้าร่วม', 'Members')}</th>
                    <th className="text-center text-sm font-semibold text-gray-900 pb-3">{ct('แอคชั่น', 'Action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {communities.map((community, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 text-sm text-gray-900">{community.name}</td>
                      <td className="py-3 text-sm text-gray-600 text-center">{community.location}</td>
                      <td className="py-3 text-sm text-gray-900 text-center">{community.shops}</td>
                      <td className="py-3 text-sm text-gray-900 text-center">{community.workshops}</td>
                      <td className="py-3 text-sm text-orange-600 text-center font-medium">{community.members}</td>
                      <td className="py-3 text-center">
                        <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors">
                          {ct('จัดการ', 'Manage')} →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Type Pie Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{ct('ประเภทกิจกรรม', 'Activity Types')}</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={activityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {activityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {activityData.map((item, index) => (
                <div key={index} className="text-center">
                  <p className="text-sm text-gray-600">{item.name}</p>
                  <p className="text-lg font-bold" style={{ color: item.color }}>{item.value}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Participant Ranking */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-bold text-gray-900">{ct('ผู้เข้าร่วมมากที่สุด', 'Most Participants')}</h2>
            </div>
            <div className="space-y-3">
              {participantRanking.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.location}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-orange-500">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Ranking */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-bold text-gray-900">{ct('กิจกรรมที่มีคนทำที่สุด', 'Most Active Communities')}</h2>
            </div>
            <div className="space-y-3">
              {activityRanking.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.location}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-orange-500">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{ct('แนวโน้มการมีส่วนร่วม', 'Participation Trends')}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#f97316" radius={[8, 8, 0, 0]} name={ct('ผู้เข้าร่วม', 'Participants')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PlatformOverview;
