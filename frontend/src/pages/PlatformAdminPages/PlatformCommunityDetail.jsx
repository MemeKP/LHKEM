import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Store, Users, Calendar, TrendingUp, Info, CheckCircle, Edit, XCircle, UserPlus, Eye, Trash2, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const PlatformCommunityDetail = () => {
  const { ct } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [community, setCommunity] = useState(null);

  useEffect(() => {
    const mockCommunity = {
      id: id,
      name: 'ชุมชนโหล่งฮิมคาว',
      location: 'เชียงใหม่',
      locationBadge: 'กำลังดำเนินการ',
      description: 'ชุมชนท่องเที่ยวเชิงวัฒนธรรมที่เน้นงานหัตถกรรมท้องถิ่นและวิถีชีวิตแบบ slow life',
      stats: {
        shops: { current: 3, total: 4 },
        admins: 3,
        workshops: 18,
        participants: 334,
        growth: '+25%'
      },
      alerts: [
        { message: 'ร้านหนึ่งชุมชนไม่มีกิจกรรมใหม่ในรอบ 45 วัน' },
        { message: 'Workshop ในเดือนนี้เพิ่มขึ้น 25%' }
      ],
      shopsList: [
        { name: 'ร้านจักสานบ้านสุดา', workshops: 8, members: 124, status: 'active' },
        { name: 'ร้านผ้าทอมือพื้นเมือง', workshops: 6, members: 98, status: 'active' },
        { name: 'ร้านเครื่องปั้นดินเผา', workshops: 4, members: 67, status: 'active' },
        { name: 'ร้านภาพชุมชน', workshops: 2, members: 45, status: 'pending' }
      ],
      workshopsEvents: [
        { label: 'Workshop ทั้งหมด', count: 18, icon: Calendar, iconBg: 'bg-green-50', iconColor: 'text-[#5B8C3E]', valueColor: 'text-[#5B8C3E]' },
        { label: 'รอการอนุมัติ', count: 3, icon: Info, iconBg: 'bg-orange-50', iconColor: 'text-[#D4842A]', valueColor: 'text-[#D4842A]' },
        { label: 'กำลังดำเนินการ', count: 5, icon: TrendingUp, iconBg: 'bg-orange-50', iconColor: 'text-[#D4842A]', valueColor: 'text-[#D4842A]' },
        { label: 'ถูกยกเลิก', count: 1, icon: XCircle, iconBg: 'bg-gray-50', iconColor: 'text-gray-400', valueColor: 'text-gray-400' }
      ],
      admins: [
        { name: 'คุณสมชาย ใจดี', email: 'somchai@lhkem.com', role: 'Community Leader', joinDate: 'เข้าร่วม 15 ม.ค. 2567' },
        { name: 'คุณมาลี สุขสันต์', email: 'malee@lhkem.com', role: 'Co-Admin', joinDate: 'เข้าร่วม 1 มี.ค. 2567' },
        { name: 'คุณสมศรี วิไล', email: 'somsri@lhkem.com', role: 'Co-Admin', joinDate: 'เข้าร่วม 12 มิ.ย. 2567' }
      ],
      participantTypeData: [
        { name: 'คนในพื้นที่', value: 60, color: '#5B8C3E' },
        { name: 'นักท่องเที่ยว', value: 40, color: '#D4842A' }
      ],
      popularActivityData: [
        { name: 'แกะสลัก', value: 5, color: '#D4842A' },
        { name: 'เกษตร', value: 4, color: '#D4842A' },
        { name: 'งานฝีมือ', value: 7, color: '#D4842A' },
        { name: 'วัฒนธรรม', value: 2, color: '#D4842A' }
      ]
    };

    setCommunity(mockCommunity);
  }, [id]);

  if (!community) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF8F3]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#D4842A] border-t-transparent mb-4"></div>
          <p className="text-gray-500">{ct('กำลังโหลด...', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, value, label, sublabel, iconBg, iconColor, valueColor }) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/60 hover:shadow-md transition-shadow">
      <div className={`inline-flex p-2.5 rounded-xl mb-3 ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      <p className="text-sm font-medium text-[#2D3B2D] mt-1">{label}</p>
      {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F3] animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/platform-admin/dashboard')}
          className="flex items-center space-x-2 text-gray-500 hover:text-[#2D3B2D] mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">{ct('กลับไปหน้าแดชบอร์ด', 'Back to Dashboard')}</span>
        </button>

        {/* Community Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/60 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-[3px] bg-[#5B8C3E] rounded-full" />
                <span className="text-[#5B8C3E] text-sm">✦</span>
              </div>
              <h1 className="text-2xl font-bold text-[#2D3B2D] mb-2">{community.name}</h1>
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex items-center text-gray-500">
                  <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                  <span className="text-sm">{community.location}</span>
                </div>
                <span className="bg-[#5B8C3E]/10 text-[#5B8C3E] text-xs font-semibold px-3 py-1 rounded-full">
                  {community.locationBadge}
                </span>
              </div>
              <p className="text-sm text-gray-500 max-w-2xl">{community.description}</p>
            </div>
            <div className="flex space-x-3 flex-shrink-0">
              <button
                onClick={() => navigate(`/platform-admin/communities/${id}/edit`)}
                className="flex items-center space-x-2 bg-[#D4842A] hover:bg-[#C0762A] text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
              >
                <Edit className="h-4 w-4" />
                <span>{ct('แก้ไขข้อมูล Community', 'Edit Community')}</span>
              </button>
              <button className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm">
                <XCircle className="h-4 w-4" />
                <span>{ct('ปิด Community', 'Close')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={Store}
            value={`${community.stats.shops.current}/${community.stats.shops.total}`}
            label={ct('จำนวน Shop', 'Shops')}
            sublabel={ct('ร้านที่อนุมัติ', 'Approved')}
            iconBg="bg-green-50"
            iconColor="text-[#5B8C3E]"
            valueColor="text-[#5B8C3E]"
          />
          <StatCard
            icon={Users}
            value={community.stats.admins}
            label="Community Admin"
            sublabel={ct('ผู้ดูแล', 'Admins')}
            iconBg="bg-orange-50"
            iconColor="text-[#D4842A]"
            valueColor="text-[#D4842A]"
          />
          <StatCard
            icon={Calendar}
            value={community.stats.workshops}
            label="Workshop / Event"
            sublabel={ct('กิจกรรมทั้งหมด', 'Total')}
            iconBg="bg-green-50"
            iconColor="text-[#5B8C3E]"
            valueColor="text-[#5B8C3E]"
          />
          <StatCard
            icon={Users}
            value={community.stats.participants}
            label={ct('ผู้เข้าร่วมทั้งหมด', 'Participants')}
            sublabel={ct('สมาชิก', 'Members')}
            iconBg="bg-orange-50"
            iconColor="text-[#D4842A]"
            valueColor="text-[#D4842A]"
          />
          <StatCard
            icon={TrendingUp}
            value={community.stats.growth}
            label={ct('แนวโน้มการเติบโต', 'Growth')}
            sublabel={ct('ต่อเดือน', 'Per Month')}
            iconBg="bg-green-50"
            iconColor="text-[#5B8C3E]"
            valueColor="text-[#5B8C3E]"
          />
        </div>

        {/* สัญญาณที่ควรดูแล */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#2D3B2D] mb-4">{ct('สัญญาณที่ควรดูแล', 'Things to Watch')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {community.alerts.map((alert, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-4 border border-gray-100/60 shadow-sm flex items-center space-x-3"
              >
                <div className="p-2 bg-orange-50 rounded-xl flex-shrink-0">
                  <Info className="h-4 w-4 text-[#D4842A]" />
                </div>
                <p className="text-sm text-[#2D3B2D]">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Shops Table */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/60">
            <h2 className="text-lg font-bold text-[#2D3B2D] mb-5">{ct('ร้านใน Community นี้', 'Shops in Community')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">{ct('ชื่อร้าน', 'Shop')}</th>
                    <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Workshop</th>
                    <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">{ct('ผู้เข้าร่วม', 'Members')}</th>
                    <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">{ct('สถานะ', 'Status')}</th>
                    <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {community.shopsList.map((shop, index) => (
                    <tr key={index} className="border-b border-gray-50 hover:bg-[#FAF8F3]/50 transition-colors">
                      <td className="py-3.5 text-sm font-medium text-[#2D3B2D]">{shop.name}</td>
                      <td className="py-3.5 text-sm text-[#2D3B2D] text-center">{shop.workshops}</td>
                      <td className="py-3.5 text-sm text-[#D4842A] text-center font-semibold">{shop.members}</td>
                      <td className="py-3.5 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                          shop.status === 'active' ? 'bg-green-50' : 'bg-gray-50'
                        }`}>
                          {shop.status === 'active' ? (
                            <CheckCircle className="h-4 w-4 text-[#5B8C3E]" />
                          ) : (
                            <Info className="h-4 w-4 text-gray-400" />
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
                        <button className="text-[#5B8C3E] hover:text-[#4A7A32] text-xs font-semibold flex items-center justify-center space-x-1 mx-auto">
                          <Eye className="h-3.5 w-3.5" />
                          <span>{ct('ดูร้าน', 'View')}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Workshop & Event */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/60">
            <h2 className="text-lg font-bold text-[#2D3B2D] mb-5">Workshop & Event</h2>
            <div className="space-y-3">
              {community.workshopsEvents.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-3.5 bg-[#FAF8F3] rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl ${item.iconBg}`}>
                        <Icon className={`h-4 w-4 ${item.iconColor}`} />
                      </div>
                      <span className="text-sm font-medium text-[#2D3B2D]">{item.label}</span>
                    </div>
                    <span className={`text-lg font-bold ${item.valueColor}`}>{item.count}</span>
                  </div>
                );
              })}
            </div>
            <button className="w-full mt-5 bg-[#FAF8F3] hover:bg-[#F0EDE5] text-[#2D3B2D] font-medium text-sm py-2.5 rounded-xl transition-colors border border-gray-200/60 flex items-center justify-center space-x-1">
              <span>{ct('ดูรายละเอียดทั้งหมด', 'View All Details')}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Community Admins */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/60">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#2D3B2D]">{ct('ผู้ดูแล Community', 'Community Admins')}</h2>
              <button className="flex items-center space-x-1.5 bg-[#5B8C3E] hover:bg-[#4A7A32] text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors">
                <UserPlus className="h-3.5 w-3.5" />
                <span>{ct('เพิ่ม Admin', 'Add Admin')}</span>
              </button>
            </div>
            <div className="space-y-3">
              {community.admins.map((admin, index) => (
                <div key={index} className="flex items-center justify-between p-3.5 bg-[#FAF8F3] rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#D4842A] flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">{admin.name.charAt(4) || admin.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#2D3B2D]">{admin.email}</p>
                      <p className="text-xs text-gray-400">{admin.role} • {admin.joinDate}</p>
                    </div>
                  </div>
                  <button className="text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Demographics */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/60">
            <h2 className="text-lg font-bold text-[#2D3B2D] mb-5">{ct('ผู้เข้าร่วม', 'Participants')}</h2>
            
            {/* Participant Type Pie Chart */}
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={community.participantTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {community.participantTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center space-x-8 mt-3">
                {community.participantTypeData.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-600">{item.name}</span>
                    <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Activity Types */}
            <div>
              <h3 className="text-sm font-semibold text-[#2D3B2D] mb-3">{ct('ประเภทกิจกรรมยอดนิยม', 'Popular Activities')}</h3>
              <div className="space-y-2.5">
                {community.popularActivityData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 w-20">{item.name}</span>
                    <div className="flex-1 mx-3 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#D4842A]"
                        style={{ width: `${(item.value / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-[#D4842A] w-6 text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformCommunityDetail;
