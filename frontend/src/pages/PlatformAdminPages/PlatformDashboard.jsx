import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, Heart, Calendar, Plus, MapPin, Store, User as UserIcon, ChevronRight, Clock, Sparkles } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../services/api';
import { useQuery } from '@tanstack/react-query';

const fetchDashboardData = async () => {
  const res = await api.get('/api/platform-admin/dashboard')
  return res.data;
}

const usePlatformDashboard = () => {
  return useQuery({
    queryKey: ['platform-dashboard'],
    queryFn: fetchDashboardData,
    refetchInterval: 30000, // re ทุกๆ 30 วิ
  })
}

const PlatformDashboard = () => {
  const { data, isLoading, error } = usePlatformDashboard();
  const { ct } = useTranslation();
  const navigate = useNavigate();
  // const [communities, setCommunities] = useState([]);
  // const [stats, setStats] = useState({
  //   totalCommunities: 4,
  //   newCommunities: 4,
  //   totalParticipants: 161,
  //   totalEvents: 74
  // });  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F3]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F3]">
        <div className="text-center text-red-500">
          <p>เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-orange-500 underline"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }
  const { stats, communities, activities } = data;
  
  // const [activities, setActivities] = useState([]);
  // useEffect(() => {
  //   // Mock data for communities
  //   const mockCommunities = [
  //     {
  //       id: '1',
  //       name: 'ชุมชนโหล่งฮิมคาว',
  //       location: 'เชียงใหม่',
  //       image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
  //       stats: { shops: 25, members: 20 },
  //       status: 'NEW'
  //     },
  //     {
  //       id: '2',
  //       name: 'ชุมชนหัตถกรรมท้องถิ่น',
  //       location: 'ปัว',
  //       image: 'https://images.unsplash.com/photo-1582719471137-c3967ffb1c42?w=400',
  //       stats: { shops: 42, members: 13 },
  //       status: 'NEW'
  //     },
  //     {
  //       id: '3',
  //       name: 'ชุมชนเกษตรอินทรีย์',
  //       location: 'ภูเก็ต',
  //       image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400',
  //       stats: { shops: 75, members: 114 },
  //       status: null
  //     },
  //     {
  //       id: '4',
  //       name: 'ชุมชนตลาดท้องถิ่น',
  //       location: 'เชียงราย',
  //       image: 'https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=400',
  //       stats: { shops: 48, members: 75 },
  //       status: 'NEW'
  //     }
  //   ];

  useEffect(() => {
    const mockCommunities = [
      {
        id: '1',
        name: 'ชุมชนโหล่งฮิมคาว',
        location: 'เชียงใหม่',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
        description: 'ชุมชนท่องเที่ยวเชิงวัฒนธรรมที่มีวิถีชีวิต แบบโลว์ไลฟ์',
        stats: { shops: 45, members: 20 },
        status: 'ใหม่'
      },
      {
        id: '2',
        name: 'ชุมชนหัตถกรรมท้องถิ่น',
        location: 'ปัว',
        image: 'https://images.unsplash.com/photo-1582719471137-c3967ffb1c42?w=400',
        description: 'เรียนรู้และสัมผัสงานฝีมือจากท้องถิ่น',
        stats: { shops: 32, members: 13 },
        status: 'ใหม่'
      },
      {
        id: '3',
        name: 'ชุมชนเกษตรอินทรีย์',
        location: 'ลำปาง',
        image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400',
        description: 'เรียนรู้การทำเกษตรอินทรีย์และวิถีชีวิตใกล้ธรรมชาติ',
        stats: { shops: 28, members: 18 },
        status: 'ใหม่'
      },
      {
        id: '4',
        name: 'ชุมชนตลาดท้องถิ่น',
        location: 'แม่ฮ่องสอน',
        image: 'https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=400',
        description: 'สัมผัสวัฒนธรรมตลาดท้องถิ่นและอาหารพื้นบ้าน',
        stats: { shops: 56, members: 25 },
        status: 'ใหม่'
      }
    ];

    const mockActivities = [
      {
        id: 1,
        type: 'member',
        message: 'สมชาย ใจดี เข้าร่วมชุมชนโหล่งฮิมคาว',
        time: '15 นาทีที่แล้ว',
        icon: UserIcon,
        color: 'blue'
      },
      {
        id: 2,
        type: 'workshop',
        message: 'Workshop "การทอผ้าพื้นเมือง" ถูกสร้างขึ้นในชุมชนหัตถกรรมท้องถิ่น',
        time: '2 ชั่วโมงที่แล้ว',
        icon: Calendar,
        color: 'green'
      },
      {
        id: 3,
        type: 'event',
        message: 'Event "ตลาดนัดชุมชน" ถูกเพิ่มในชุมชนตลาดท้องถิ่น',
        time: '5 ชั่วโมงที่แล้ว',
        icon: Sparkles,
        color: 'orange'
      },
      {
        id: 4,
        type: 'member',
        message: 'สมหญิง รักษ์ดี เข้าร่วมชุมชน เกษตรอินทรีย์',
        time: '1 วันที่แล้ว',
        icon: UserIcon,
        color: 'blue'
      },
      {
        id: 5,
        type: 'community',
        message: 'ชุมชนใหม่ "ชุมชนงานปั้น" ถูกเพิ่มเข้าระบบ',
        time: '2 วันที่แล้ว',
        icon: Heart,
        color: 'pink'
      }
    ];


  const iconBgMap = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    orange: 'bg-orange-50',
    pink: 'bg-pink-50',
  };
  const iconColorMap = {
    blue: 'text-blue-500',
    green: 'text-green-600',
    orange: 'text-orange-500',
    pink: 'text-pink-500',
  };

  const StatCard = ({ icon: Icon, value, label, iconBg, iconColor, valueColor }) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/60 hover:shadow-md transition-shadow">
      <div className={`inline-flex p-2.5 rounded-xl mb-3 ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );

  const CommunityCard = ({ community }) => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100/60 hover:shadow-md transition-all">
      <div className="relative h-44">
        <img
          src={community.image}
          alt={community.name}
          className="w-full h-full object-cover"
        />
        {community.status && (
          <span className="absolute top-3 right-3 bg-[#5B8C3E] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
            {community.status}
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-[#2D3B2D] mb-1">{community.name}</h3>
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
          <span>{community.location}</span>
        </div>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{community.description}</p>
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <Store className="h-3.5 w-3.5 mr-1 text-gray-400" />
            <span>{community.stats.shops}</span>
          </div>
          <div className="flex items-center">
            <UserIcon className="h-3.5 w-3.5 mr-1 text-gray-400" />
            <span>{community.stats.members}</span>
          </div>
        </div>
        <button
          onClick={() => navigate(`/platform-admin/communities/${community.id}`)}
          className="w-full bg-[#D4842A] hover:bg-[#C0762A] text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center space-x-2"
        >
          <span>{ct('จัดการ', 'Manage')}</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const CreateCommunityCard = () => (
    <div
      onClick={() => navigate('/platform-admin/communities/create')}
      className="bg-[#FDF8F0] rounded-2xl border-2 border-dashed border-[#D4842A]/30 hover:border-[#D4842A]/60 cursor-pointer transition-all h-full flex flex-col items-center justify-center p-8 min-h-[400px]"
    >
      <div className="bg-[#D4842A]/10 p-4 rounded-full mb-4">
        <Plus className="h-8 w-8 text-[#D4842A]" />
      </div>
      <h3 className="text-lg font-bold text-[#2D3B2D] mb-2">
        {ct('สร้าง Community ใหม่', 'Create New Community')}
      </h3>
      <p className="text-sm text-gray-500 text-center">
        {ct('เพิ่มพื้นที่ชุมชนใหม่เข้าสู่ระบบ', 'Add a new community to the platform')}
      </p>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const Icon = activity.icon;
    return (
      <div className="flex items-start space-x-3 p-3 hover:bg-[#FAF8F3] rounded-xl transition-colors">
        <div className={`p-2 rounded-xl ${iconBgMap[activity.color] || 'bg-orange-50'}`}>
          <Icon className={`h-4 w-4 ${iconColorMap[activity.color] || 'text-orange-500'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#2D3B2D] leading-snug">{activity.message}</p>
          <div className="flex items-center mt-1">
            <Clock className="h-3 w-3 text-gray-400 mr-1" />
            <p className="text-xs text-gray-400">{activity.time}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-[3px] bg-[#5B8C3E] rounded-full" />
              <span className="text-[#5B8C3E] text-sm">✦</span>
            </div>
            <h1 className="text-3xl font-bold text-[#2D3B2D] mb-1">
              Platform Overview
            </h1>
            <p className="text-gray-500">
              {ct('จัดการและดูภาพรวมของทุกชุมชนในระบบ', 'Manage and view all communities in the system')}
            </p>
          </div>
          <button
            onClick={() => navigate('/platform-admin/overview')}
            className="bg-[#D4842A] hover:bg-[#C0762A] text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm"
          >
            {ct('ดูรายละเอียด', 'View Details')}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <StatCard
            icon={Users}
            value={stats.totalCommunities}
            label={ct('จำนวนชุมชนทั้งหมด', 'Total Communities')}
            iconBg="bg-orange-50"
            iconColor="text-[#D4842A]"
            valueColor="text-[#D4842A]"
          />
          <StatCard
            icon={TrendingUp}
            value={stats.newCommunities}
            label={ct('ชุมชนที่กำลังดำเนินการ', 'Active Communities')}
            iconBg="bg-green-50"
            iconColor="text-[#5B8C3E]"
            valueColor="text-[#5B8C3E]"
          />
          <StatCard
            icon={Heart}
            value={stats.totalParticipants}
            label={ct('ผู้เข้าร่วมทั้งหมด', 'Total Participants')}
            iconBg="bg-orange-50"
            iconColor="text-[#D4842A]"
            valueColor="text-[#D4842A]"
          />
          <StatCard
            icon={Calendar}
            value={stats.totalEvents}
            label="Events / Workshops"
            iconBg="bg-green-50"
            iconColor="text-[#5B8C3E]"
            valueColor="text-[#5B8C3E]"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Communities Grid */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-[#2D3B2D] mb-1">
              Community {ct('ทั้งหมด', 'All')}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {communities.length} {ct('ชุมชนในระบบ', 'communities in system')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {communities.map((community) => (
                <CommunityCard key={community.id} community={community} />
              ))}
              <CreateCommunityCard />
            </div>
          </div>

          {/* Activities Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100/60 p-6 sticky top-24">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg">✦</span>
                <h3 className="text-lg font-bold text-[#2D3B2D]">
                  {ct('กิจกรรมล่าสุด', 'Recent Activities')}
                </h3>
              </div>
              <p className="text-sm text-gray-400 mb-5">
                {ct('อัพเดตล่าสุดจากทุกชุมชน', 'Latest updates from all communities')}
              </p>
              <div className="space-y-1">
                {activities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
              <button className="w-full mt-5 bg-[#FAF8F3] hover:bg-[#F0EDE5] text-[#2D3B2D] font-medium text-sm py-2.5 rounded-xl transition-colors border border-gray-200/60">
                {ct('ดูกิจกรรมทั้งหมด', 'View All Activities')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformDashboard;
