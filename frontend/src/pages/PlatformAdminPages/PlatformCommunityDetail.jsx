import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Store, Users, Calendar, TrendingUp, AlertCircle, CheckCircle, Edit, XCircle, UserPlus } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';
import api from '../../services/api';
import { useQuery } from '@tanstack/react-query';


const fetchCommunityDetail = async (id) => {
  const res = await api.get(`/api/platform-admin/communities/${id}`);
  return res.data;
};

const PlatformCommunityDetail = () => {
  const { ct } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [community, setCommunity] = useState(null);

  const { data: communities, isLoading, error } = useQuery({
    queryKey: ['platform-community', id],
    queryFn: () => fetchCommunityDetail(id),
    enabled: !!id,
  });

  useEffect(() => {
    // Mock community data
    const mockCommunity = {
      id: id,
      name: 'ชุมชนโหล่งฮิมคาว',
      location: 'เชียงใหม่',
      locationBadge: 'กำลังดำเนินการ',
      description: 'ชุมชนท้องถิ่นที่มีวัฒนธรรมและประเพณีที่เก่าแก่ มีการทำงานร่วมกันของชาวบ้านในการอนุรักษ์วัฒนธรรม .slow life',
      stats: {
        shops: { current: 3, total: 4 },
        admins: 3,
        workshops: 18,
        participants: 334,
        growth: '+25%'
      },
      alerts: [
        { type: 'warning', message: 'ร้านหนึ่งยังไม่ได้ยืนยันตัวตนภายใน 45 วัน', time: '15 นาทีที่แล้ว' },
        { type: 'success', message: 'Workshop ได้รับอนุมัติแล้ว 75%', time: 'ก่อนหน้านี้' }
      ],
      shopsList: [
        { name: 'ร้านหนึ่งในชุมชนหมู่บ้าน', workshops: 8, members: 124, status: 'active' },
        { name: 'ร้านหนึ่งในชุมชนหมู่บ้าน', workshops: 6, members: 88, status: 'active' },
        { name: 'ร้านหนึ่งในชุมชนหมู่บ้าน', workshops: 4, members: 67, status: 'active' },
        { name: 'ร้านหนึ่งในชุมชนหมู่บ้าน', workshops: 2, members: 45, status: 'pending' }
      ],
      workshopsEvents: [
        { type: 'workshop', label: 'Workshop ทั้งหมด', count: 18, color: 'green' },
        { type: 'pending', label: 'รอการอนุมัติ', count: 3, color: 'orange' },
        { type: 'ongoing', label: 'กำลังดำเนินการ', count: 5, color: 'orange' },
        { type: 'completed', label: 'เสร็จสิ้น', count: 1, color: 'gray' }
      ],
      admins: [
        { name: 'กฤษณพงศ์ ไชย', email: 'krissapong@gmail.com', role: 'Community Admin', joinDate: '2567' },
        { name: 'กฤษณพงศ์ สุขสันต์', email: 'krissapong@gmail.com', role: 'Community Admin', joinDate: '2567' },
        { name: 'กฤษณพงศ์ วิจิตร', email: 'krissapong@gmail.com', role: 'Community Admin', joinDate: '2567' }
      ],
      participantTypeData: [
        { name: 'คนในพื้นที่', value: 60, color: '#16a34a' },
        { name: 'นักท่องเที่ยว', value: 40, color: '#f97316' }
      ],
      popularActivityData: [
        { name: 'แกะสลัก', value: 5 },
        { name: 'เครื่องปั้น', value: 8 },
        { name: 'ทำเนียม', value: 7 },
        { name: 'วัฒนธรรม', value: 2 }
      ]
    };

    setCommunity(mockCommunity);
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF8F3]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">{ct('กำลังโหลด...', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF8F3]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">{ct('เกิดข้อผิดพลาด', 'Error loading community')}</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, value, label, sublabel, color = 'orange' }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color === 'green' ? 'bg-green-50' : 'bg-orange-50'}`}>
          <Icon className={`h-5 w-5 ${color === 'green' ? 'text-green-600' : 'text-orange-500'}`} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${color === 'green' ? 'text-green-600' : 'text-orange-500'}`}>
        {value}
      </p>
      <p className="text-sm font-medium text-gray-900 mt-1">{label}</p>
      {sublabel && <p className="text-xs text-gray-500 mt-0.5">{sublabel}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F3] animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/platform-admin/dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">{ct('กลับไปหน้าแดชบอร์ด', 'Back to Dashboard')}</span>
        </button>

        {/* Community Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <h1 className="text-3xl font-bold text-gray-900">{communities.name}</h1>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {/* {community.locationBadge} */} ดด
                </span>
              </div>
              <div className="flex items-center text-gray-600 mb-3">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{communities.location}</span>
              </div>
              {/* <p className="text-gray-600 max-w-3xl">{communities.hero_section.description}</p> */} 
              <p className="text-gray-600 max-w-3xl">{communities.hero_section}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/platform-admin/communities/${id}/edit`)}
                className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>{ct('แก้ไขข้อมูล Community', 'Edit Community')}</span>
              </button>
              <button className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
                <XCircle className="h-4 w-4" />
                <span>{ct('ปิด Community', 'Close Community')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <StatCard
            icon={Store}
            value={`${communities.stats.shops.current}/${communities.stats.shops.total}`}
            label={ct('ร้าน Shop', 'Shops')}
            sublabel={ct('ทั้งหมด', 'Total')}
            color="green"
          />
          <StatCard
            icon={Users}
            value={communities.stats.admins}
            label={ct('Community Admin', 'Community Admin')}
            sublabel={ct('ผู้ดูแล', 'Admins')}
            color="orange"
          />
          <StatCard
            icon={Calendar}
            value={communities.stats.workshopsAndEventsCount}
            label={ct('Workshop / Event', 'Workshop / Event')}
            sublabel={ct('กิจกรรมทั้งหมด', 'Total Events')}
            color="orange"
          />
          <StatCard
            icon={Users}
            value={communities.stats.participants}
            label={ct('ผู้เข้าร่วมทั้งหมด', 'Total Participants')}
            sublabel={ct('สมาชิก', 'Members')}
            color="orange"
          />
          <StatCard
            icon={TrendingUp}
            value={communities.stats.growth}
            label={ct('แนวโน้มการเติบโต', 'Growth Trend')}
            sublabel={ct('ต่อเดือน', 'Per Month')}
            color="green"
          />
        </div>

        {/* Alert Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {community.alerts.map((alert, index) => (
            <div
              key={index}
              className={`rounded-xl p-4 flex items-start space-x-3 ${alert.type === 'warning' ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'
                }`}
            >
              {alert.type === 'warning' ? (
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`text-sm font-medium ${alert.type === 'warning' ? 'text-orange-900' : 'text-green-900'}`}>
                  {alert.message}
                </p>
                <p className={`text-xs mt-1 ${alert.type === 'warning' ? 'text-orange-600' : 'text-green-600'}`}>
                  {alert.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Shops Table */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{ct('ร้านใน Community นี้', 'Shops in Community')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-sm font-semibold text-gray-900 pb-3">{ct('ชื่อร้าน', 'Shop')}</th>
                    <th className="text-center text-sm font-semibold text-gray-900 pb-3">{ct('Workshop', 'Workshop')}</th>
                    <th className="text-center text-sm font-semibold text-gray-900 pb-3">{ct('ผู้เข้าร่วม', 'Members')}</th>
                    <th className="text-center text-sm font-semibold text-gray-900 pb-3">{ct('สถานะ', 'Status')}</th>
                    <th className="text-center text-sm font-semibold text-gray-900 pb-3">{ct('แอคชั่น', 'Action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {community.shopsList.map((shop, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 text-sm text-gray-900">{shop.name}</td>
                      <td className="py-3 text-sm text-orange-600 text-center font-medium">{shop.workshops}</td>
                      <td className="py-3 text-sm text-gray-900 text-center">{shop.members}</td>
                      <td className="py-3 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${shop.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                          {shop.status === 'active' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                          {ct('ดูข้อมูล', 'View')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Workshop & Event */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{ct('Workshop & Event', 'Workshop & Event')}</h2>
            <div className="space-y-3">
              {community.workshopsEvents.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${item.color === 'green' ? 'bg-green-50' : item.color === 'orange' ? 'bg-orange-50' : 'bg-gray-100'
                      }`}>
                      <Calendar className={`h-4 w-4 ${item.color === 'green' ? 'text-green-600' : item.color === 'orange' ? 'text-orange-500' : 'text-gray-500'
                        }`} />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.label}</span>
                  </div>
                  <span className={`text-lg font-bold ${item.color === 'green' ? 'text-green-600' : item.color === 'orange' ? 'text-orange-500' : 'text-gray-500'
                    }`}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-orange-500 hover:text-orange-600 font-medium text-sm py-2 transition-colors">
              {ct('ดูรายละเอียดทั้งหมด', 'View All Details')} →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Community Admins */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{ct('ผู้ดูแล Community', 'Community Admins')}</h2>
              <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors">
                <UserPlus className="h-4 w-4" />
                <span>{ct('เพิ่ม Admin', 'Add Admin')}</span>
              </button>
            </div>
            <div className="space-y-3">
              {community.admins.map((admin, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{admin.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{admin.name}</p>
                      <p className="text-xs text-gray-500">{admin.email}</p>
                      <p className="text-xs text-gray-400">{ct('เข้าร่วมเมื่อ', 'Joined')} {admin.joinDate}</p>
                    </div>
                  </div>
                  <button className="text-red-500 hover:text-red-600">
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Demographics */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{ct('ผู้เข้าร่วม', 'Participants')}</h2>

            {/* Participant Type Pie Chart */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{ct('ประเภทผู้เข้าร่วม', 'Participant Types')}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={community.participantTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {community.participantTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center space-x-6 mt-2">
                {community.participantTypeData.map((item, index) => (
                  <div key={index} className="text-center">
                    <p className="text-sm text-gray-600">{item.name}</p>
                    <p className="text-lg font-bold" style={{ color: item.color }}>{item.value}%</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Activity Types Bar Chart */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{ct('ประเภทกิจกรรมยอดนิยม', 'Popular Activity Types')}</h3>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={community.popularActivityData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                  <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformCommunityDetail;
