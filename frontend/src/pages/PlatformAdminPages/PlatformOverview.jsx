import { useState, useEffect } from 'react';
import { Users, Store, Calendar, TrendingUp, AlertCircle, Info, ChevronRight, MapPin, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip, CartesianGrid } from 'recharts';

const PlatformOverview = () => {
  const { ct } = useTranslation();
  const navigate = useNavigate();
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
    const mockAlerts = [
      {
        icon: '⚠️',
        title: 'ชุมชนตลาดท้องถิ่น',
        detail: 'ผู้เข้าร่วมลดลง 15% ในเดือนที่ผ่านมา',
      },
      {
        icon: '⏰',
        title: 'ชุมชนโหล่งฮิมคาว',
        detail: 'กำลังจะถึงเป้า >35% ในเดือนหน้า',
      },
      {
        icon: '📋',
        title: 'ชุมชนเกษตรอินทรีย์',
        detail: 'ไม่มี workshop ใหม่เปิดมา 30 วัน',
      }
    ];

    const mockCommunities = [
      { name: 'ชุมชนโหล่งฮิมคาว', location: 'เชียงใหม่', shops: 12, workshops: 18, members: 245, trend: 'up' },
      { name: 'ชุมชนหัตถกรรมท้องถิ่น', location: 'ปัว', shops: 9, workshops: 12, members: 156, trend: 'up' },
      { name: 'ชุมชนเกษตรอินทรีย์', location: 'ลำปาง', shops: 6, workshops: 10, members: 128, trend: 'flat' },
      { name: 'ชุมชนตลาดท้องถิ่น', location: 'แม่ฮ่องสอน', shops: 15, workshops: 8, members: 98, trend: 'down' }
    ];

    const mockActivityData = [
      { name: 'แกะสลัก', value: 28, color: '#D4842A' },
      { name: 'เกษตร', value: 22, color: '#5B8C3E' },
      { name: 'งานฝีมือ', value: 35, color: '#C9A96E' },
      { name: 'วัฒนธรรม', value: 15, color: '#8B6F47' }
    ];

    const mockParticipantRanking = [
      { name: 'ชุมชนโหล่งฮิมคาว', location: 'เชียงใหม่', count: 245 },
      { name: 'ชุมชนหัตถกรรมท้องถิ่น', location: 'ปัว', count: 156 },
      { name: 'ชุมชนเกษตรอินทรีย์', location: 'ลำปาง', count: 128 }
    ];

    const mockActivityRanking = [
      { name: 'ชุมชนโหล่งฮิมคาว', location: 'เชียงใหม่', count: 18 },
      { name: 'ชุมชนหัตถกรรมท้องถิ่น', location: 'ปัว', count: 12 },
      { name: 'ชุมชนเกษตรอินทรีย์', location: 'ลำปาง', count: 10 }
    ];

    const mockMonthlyData = [
      { month: 'ม.ค.', value: 320 },
      { month: 'ก.พ.', value: 400 },
      { month: 'มี.ค.', value: 450 },
      { month: 'เม.ย.', value: 520 }
    ];

    setAlerts(mockAlerts);
    setCommunities(mockCommunities);
    setActivityData(mockActivityData);
    setParticipantRanking(mockParticipantRanking);
    setActivityRanking(mockActivityRanking);
    setMonthlyData(mockMonthlyData);
  }, []);

  const StatCard = ({ icon: Icon, value, label, iconBg, iconColor, valueColor }) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/60 hover:shadow-md transition-shadow">
      <div className={`inline-flex p-2.5 rounded-xl mb-3 ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );

  const trendIcon = (trend) => {
    if (trend === 'up') return <span className="text-[#5B8C3E]">↗</span>;
    if (trend === 'down') return <span className="text-red-400">↘</span>;
    return <span className="text-gray-400">—</span>;
  };

  return (
    <div className="min-h-screen bg-[#d6e6df] animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-[3px] bg-[#5B8C3E] rounded-full" />
            <span className="text-[#5B8C3E] text-sm">✦</span>
          </div>
          <h1 className="text-3xl font-bold text-[#2D3B2D] mb-1">
            {ct('ภาพรวมแพลตฟอร์ม', 'Platform Overview')}
          </h1>
          <p className="text-gray-500">
            {ct('ข้อมูลและสถิติของทุกชุมชนในระบบ', 'Data and statistics of all communities')}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3 mb-6">
          <Filter className="h-4 w-4 text-gray-400" />
          <select className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-[#2D3B2D] focus:ring-2 focus:ring-[#D4842A]/30 focus:border-[#D4842A] outline-none">
            <option>{ct('ทั้งหมด', 'All')}</option>
            <option>{ct('เดือนนี้', 'This Month')}</option>
            <option>{ct('ปีนี้', 'This Year')}</option>
          </select>
          <select className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-[#2D3B2D] focus:ring-2 focus:ring-[#D4842A]/30 focus:border-[#D4842A] outline-none">
            <option>{ct('ทุกชุมชน', 'All Communities')}</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <StatCard
            icon={Users}
            value={stats.totalCommunities}
            label="Community ทั้งหมด"
            iconBg="bg-orange-50"
            iconColor="text-[#D4842A]"
            valueColor="text-[#D4842A]"
          />
          <StatCard
            icon={Store}
            value={stats.totalShops}
            label="Shop ทั้งหมด"
            iconBg="bg-green-50"
            iconColor="text-[#5B8C3E]"
            valueColor="text-[#5B8C3E]"
          />
          <StatCard
            icon={Calendar}
            value={stats.totalWorkshops}
            label="Workshop / Event"
            iconBg="bg-green-50"
            iconColor="text-[#5B8C3E]"
            valueColor="text-[#5B8C3E]"
          />
          <StatCard
            icon={TrendingUp}
            value={stats.totalParticipants}
            label={ct('ผู้เข้าร่วมทั้งหมด', 'Total Participants')}
            iconBg="bg-orange-50"
            iconColor="text-[#D4842A]"
            valueColor="text-[#D4842A]"
          />
        </div>

        {/* สิ่งที่ต้องใส่ใจ */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-[#2D3B2D] mb-4">{ct('สิ่งที่ต้องใส่ใจ', 'Things to Watch')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-4 border border-gray-100/60 shadow-sm flex items-start space-x-3"
              >
                <div className="p-2 bg-orange-50 rounded-xl flex-shrink-0">
                  <Info className="h-4 w-4 text-[#D4842A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#2D3B2D]">{alert.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{alert.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Communities Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100/60">
            <h2 className="text-lg font-bold text-[#2D3B2D] mb-5">{ct('ภาพรวมแต่ละ Community', 'Community Overview')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">{ct('ชุมชน', 'Community')}</th>
                    <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">{ct('ที่ตั้ง', 'Location')}</th>
                    <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Shop</th>
                    <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">{ct('กิจกรรม', 'Activities')}</th>
                    <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">{ct('ผู้เข้าร่วม', 'Members')}</th>
                    <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">{ct('แนวโน้ม', 'Trend')}</th>
                    <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {communities.map((community, index) => (
                    <tr key={index} className="border-b border-gray-50 hover:bg-[#FAF8F3]/50 transition-colors">
                      <td className="py-3.5 text-sm font-medium text-[#2D3B2D]">{community.name}</td>
                      <td className="py-3.5 text-sm text-gray-500 text-center">
                        <div className="flex items-center justify-center">
                          <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                          {community.location}
                        </div>
                      </td>
                      <td className="py-3.5 text-sm text-[#2D3B2D] text-center">{community.shops}</td>
                      <td className="py-3.5 text-sm text-[#2D3B2D] text-center">{community.workshops}</td>
                      <td className="py-3.5 text-sm text-[#D4842A] text-center font-semibold">{community.members}</td>
                      <td className="py-3.5 text-center text-lg">{trendIcon(community.trend)}</td>
                      <td className="py-3.5 text-center">
                        <button
                          onClick={() => navigate(`/platform-admin/communities/${index + 1}`)}
                          className="px-3.5 py-1.5 bg-[#5B8C3E] hover:bg-[#4A7A32] text-white text-xs font-semibold rounded-lg transition-colors"
                        >
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
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/60">
            <h2 className="text-lg font-bold text-[#2D3B2D] mb-4">{ct('ประเภทกิจกรรม', 'Activity Types')}</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={activityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {activityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {activityData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-[#2D3B2D]">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Participant Ranking */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/60">
            <div className="flex items-center space-x-2 mb-5">
              <Users className="h-5 w-5 text-[#D4842A]" />
              <h2 className="text-lg font-bold text-[#2D3B2D]">{ct('ผู้เข้าร่วมมากที่สุด', 'Most Participants')}</h2>
            </div>
            <div className="space-y-3">
              {participantRanking.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3.5 bg-[#FAF8F3] rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-full bg-[#D4842A] flex items-center justify-center">
                      <span className="text-white font-bold text-xs">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#2D3B2D]">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.location}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-[#D4842A]">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Ranking */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/60">
            <div className="flex items-center space-x-2 mb-5">
              <Calendar className="h-5 w-5 text-[#5B8C3E]" />
              <h2 className="text-lg font-bold text-[#2D3B2D]">{ct('กิจกรรมที่มีคนทำที่สุด', 'Most Active')}</h2>
            </div>
            <div className="space-y-3">
              {activityRanking.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3.5 bg-[#FAF8F3] rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-full bg-[#5B8C3E] flex items-center justify-center">
                      <span className="text-white font-bold text-xs">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#2D3B2D]">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.location}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-[#5B8C3E]">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/60">
          <h2 className="text-lg font-bold text-[#2D3B2D] mb-5">{ct('แนวโน้มการมีส่วนร่วม', 'Participation Trends')}</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede5" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 13 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 13 }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #f0ede5', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              />
              <Legend
                formatter={() => ct('ผู้เข้าร่วม', 'Participants')}
                iconType="square"
                wrapperStyle={{ paddingTop: '12px' }}
              />
              <Bar dataKey="value" fill="#D4842A" radius={[8, 8, 0, 0]} name={ct('ผู้เข้าร่วม', 'Participants')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PlatformOverview;
