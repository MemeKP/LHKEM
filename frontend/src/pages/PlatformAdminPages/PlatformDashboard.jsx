import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, Heart, Calendar, Plus, MapPin, Store, User as UserIcon, ChevronRight, Image as ImageIcon } from 'lucide-react';
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
  const API_URL = import.meta.env.VITE_API_URL

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
  // console.log("DASHBOARD DATA:", data);
  // console.log("COMMUNITIES:", communities);
  // console.log("images: ", `${API_URL}/uploads/${communities.image?.[1]}`)

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http://') || img.startsWith('https://')) {
      return img;
    }
    const cleanPath = img.startsWith('/') ? img : `/${img}`;
    if (!cleanPath.startsWith('/uploads')) {
      return `${API_URL}${cleanPath}`;
    }
    return `${API_URL}${cleanPath}`;
  };

  const StatCard = ({ icon: Icon, value, label, color = 'orange' }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-3xl font-bold ${color === 'green' ? 'text-green-600' : 'text-orange-500'}`}>
            {value.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mt-1">{label}</p>
        </div>
        <div className={`p-3 rounded-lg ${color === 'green' ? 'bg-green-50' : 'bg-orange-50'}`}>
          <Icon className={`h-6 w-6 ${color === 'green' ? 'text-green-600' : 'text-orange-500'}`} />
        </div>
      </div>
    </div>
  );

  const CommunityCard = ({ community }) => {
    const imageSrc = getImageUrl(community.image);
    const shopCount = community.stats?.shops ?? 0;
    const adminCount = community.stats?.admins ?? community.stats?.members ?? 0;

    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
        <div className="relative h-48">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={community.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-300 to-rose-400">
              <ImageIcon className="w-12 h-12 text-white opacity-75" />
            </div>
          )}

          {community.status === 'NEW' && (
            <span className="absolute top-3 right-3 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              NEW
            </span>
          )}
        </div>
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{community.name}</h3>
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{community.location}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Store className="h-4 w-4 mr-1" />
                <span>{shopCount} {ct('ร้าน', 'shops')}</span>
              </div>
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 mr-1" />
                <span>{adminCount} {ct('แอดมิน', 'admins')}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate(`/platform-admin/communities/${community.id}`)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >

            <span>{ct('จัดการ', 'Manage')}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  };

  const CreateCommunityCard = () => (
    <div
      onClick={() => navigate('/platform-admin/communities/create')}
      className="bg-white rounded-xl border-2 border-dashed border-orange-300 hover:border-orange-500 cursor-pointer transition-all h-full flex flex-col items-center justify-center p-8 min-h-[400px]"
    >
      <div className="bg-orange-50 p-4 rounded-full mb-4">
        <Plus className="h-8 w-8 text-orange-500" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        {ct('สร้าง Community ใหม่', 'Create New Community')}
      </h3>
      <p className="text-sm text-gray-600 text-center">
        {ct('เพิ่มชุมชนใหม่เข้าสู่ระบบ', 'Add a new community to the platform')}
      </p>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const Icon = activity.icon;
    return (
      <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
        <div className={`p-2 rounded-lg ${activity.color === 'green' ? 'bg-green-50' : 'bg-orange-50'}`}>
          <Icon className={`h-4 w-4 ${activity.color === 'green' ? 'text-green-600' : 'text-orange-500'}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-900">{activity.message}</p>
          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5EFE7] animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {ct('Platform Overview', 'Platform Overview')}
            </h1>
            <p className="text-gray-600">
              {ct('จัดการและดูภาพรวมของชุมชนทั้งหมดในระบบ', 'Manage and view all communities in the system')}
            </p>
          </div>
          <button
            onClick={() => navigate('/platform-admin/overview')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            {ct('ดูรายละเอียด', 'View Details')}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            value={stats.totalCommunities}
            label={ct('จำนวนชุมชนทั้งหมด', 'Total Communities')}
            color="orange"
          />
          <StatCard
            icon={TrendingUp}
            value={stats.newCommunities}
            label={ct('ชุมชนที่เพิ่งเข้าร่วมระบบ', 'New Communities')}
            color="green"
          />
          <StatCard
            icon={Heart}
            value={stats.totalParticipants}
            label={ct('ผู้เข้าร่วมทั้งหมด', 'Total Participants')}
            color="orange"
          />
          <StatCard
            icon={Calendar}
            value={stats.totalEvents}
            label={ct('Events / Workshops', 'Events / Workshops')}
            color="orange"
          />
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {ct('Community ทั้งหมด', 'All Communities')}
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            {communities.length} {ct('ชุมชนในระบบ', 'communities in system')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {communities.map((community) => (
              <CommunityCard key={community.id} community={community} />
            ))}
            <CreateCommunityCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformDashboard;
