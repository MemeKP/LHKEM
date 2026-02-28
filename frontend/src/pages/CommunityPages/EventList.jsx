import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Plus, Search, Filter, Eye, Edit, Trash2, Clock, Image as ImageIcon, AlertCircle, Phone } from 'lucide-react';
import api from '../../services/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Event List Page - แสดงรายการ Event ทั้งหมดของชุมชน
 * 
 * TODO: Backend APIs needed:
 * - GET /api/events?community_id=xxx - ดึงรายการ Event ทั้งหมด
 * - DELETE /api/events/:id - ลบ Event
 */

const getLocationName = (location, fallback) => {
  if (!location) return fallback;
  if (typeof location === 'string') return location;
  return location.full_address || location.address || fallback;
};

const normalizeStatus = (status) => (status || 'OPEN').toUpperCase();

const statusFilters = [
  { id: 'ALL', label: { th: 'ทั้งหมด', en: 'All' } },
  { id: 'OPEN', label: { th: 'เปิดรับสมัคร', en: 'Open' } },
  { id: 'CLOSED', label: { th: 'ปิดรับสมัคร', en: 'Closed' } },
  { id: 'PENDING', label: { th: 'รอการตรวจสอบ', en: 'Pending' } },
  { id: 'CANCELLED', label: { th: 'ยกเลิก', en: 'Cancelled' } },
];

const statusLabels = {
  OPEN: { th: 'เปิดรับสมัคร', en: 'Open' },
  CLOSED: { th: 'ปิดรับสมัคร', en: 'Closed' },
  PENDING: { th: 'รอการตรวจสอบ', en: 'Pending' },
  CANCELLED: { th: 'ยกเลิก', en: 'Cancelled' },
};

const statusBadges = {
  OPEN: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-700',
  PENDING: 'bg-yellow-100 text-yellow-800',
  CANCELLED: 'bg-red-100 text-red-700',
  DEFAULT: 'bg-gray-100 text-gray-700',
};

const getPrimaryImage = (images) => {
  if (!images) return null;
  if (Array.isArray(images)) {
    return images.length > 0 ? images[0] : null;
  }
  return images;
};

const resolveStatusLabel = (status, locale = 'th') => {
  const normalized = normalizeStatus(status);
  return statusLabels[normalized]?.[locale] || status || '-';
};

const resolveBadgeClasses = (status) => {
  const normalized = normalizeStatus(status);
  return statusBadges[normalized] || statusBadges.DEFAULT;
};

const fetchEvents = async () => {
  const res = await api.get('/api/events')
  return res.data;
}

const deleteEvent = async (eventId) => {
  const res = await api.delete(`/api/events/${eventId}`);
  return res.data;
}

const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  });
};

const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

const EventList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { data: events = [], isLoading, isError } = useEvents();
  const { mutateAsync: deleteEvent } = useDeleteEvent();
  const API_URL = import.meta.env.VITE_API_URL;

  // TODO: Fetch from API - GET /api/events?community_id=xxx
  // Mock data for Events  
  /*
  const events = [
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
      registered: 145
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
      registered: 87
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
      registered: 62
    },
    {
      id: '4',
      title: 'Workshop ย้อมผ้าครามสำหรับเด็ก',
      description: 'กิจกรรมสอนเด็กๆ เรียนรู้การย้อมผ้าครามแบบง่ายๆ สนุกสนาน เหมาะสำหรับครอบครัว',
      location: 'บ้านครามโหล่งฮิมคาว',
      start_at: new Date('2024-01-05T09:00:00'),
      end_at: new Date('2024-01-05T12:00:00'),
      seat_limit: 30,
      deposit_amount: 50,
      status: 'CLOSED',
      is_featured: false,
      is_pinned: false,
      registered: 30
    }
  ];*/

  const statusOptions = [
    { value: 'all', label: 'ทั้งหมด' },
    { value: 'OPEN', label: 'เปิดรับสมัคร' },
    { value: 'CLOSED', label: 'ปิดรับสมัคร' },
    { value: 'CANCELLED', label: 'ยกเลิก' }
  ];

  /*
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesStatus;
  });*/
  const filteredEvents = events.filter(event => {
    const titleMatch = event.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const locationStr = event.location?.full_address || event.location?.address || '';
    const locationMatch = locationStr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = titleMatch || locationMatch;
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
 
  const handleDelete = async (eventId) => {
    if (!window.confirm('คุณต้องการลบ Event นี้ใช่หรือไม่? (การกระทำนี้ไม่สามารถย้อนกลับได้)')) return;

    try {
      await deleteEvent(eventId);
      alert('ลบ Event สำเร็จ!');
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('เกิดข้อผิดพลาดในการลบ Event');
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</div>;

  return (
    <div className="min-h-screen bg-[#F5EFE7] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A1A]">กิจกรรมของชุมชน</h1>
              <p className="text-[#666666] mt-1">จัดการและดูรายละเอียด Event ทั้งหมด</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/community-admin/dashboard')}
                className="px-6 py-3 bg-[#1E293B] hover:bg-[#0F172A] text-white font-semibold rounded-lg transition-colors"
              >
                กลับหน้าหลัก
              </button>
              <button
                onClick={() => navigate('/community-admin/events/create')}
                className="flex items-center gap-2 px-6 py-3 bg-[#FFC107] hover:bg-[#FFB300] text-[#1A1A1A] font-semibold rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5" />
                สร้าง Event ใหม่
              </button>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อ Event หรือสถานที่..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent appearance-none bg-white"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="h-16 w-16 text-[#CCCCCC] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">ไม่พบ Event</h3>
            <p className="text-[#666666]">
              {searchTerm || filterStatus !== 'all' 
                ? 'ไม่พบ Event ที่ตรงกับเงื่อนไขการค้นหา'
                : 'ยังไม่มี Event ในชุมชน'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, i) => (
              <div
                key={event._id || event.id || i}
                className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow border border-orange-50"
              >
                {/* Event Image */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-orange-50 to-orange-100">
                  {(() => {
                    const coverImage = getPrimaryImage(event.images);
                    if (!coverImage) {
                      return (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-16 w-16 text-orange-300" />
                        </div>
                      );
                    }
                    const coverSrc = coverImage.startsWith('http') ? coverImage : `${API_URL}${coverImage}`;
                    return (
                      <img
                        src={coverSrc}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    );
                  })()}

                  {/* Status */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${resolveBadgeClasses(event.status)}`}>
                      {resolveStatusLabel(event.status)}
                    </span>
                  </div>

                  {/* Feature Flags */}
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
                </div>

                {/* Event Info */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2 line-clamp-2">{event.title}</h3>
                  <p className="text-sm text-[#666666] mb-4 line-clamp-2">{event.description}</p>

                  {/* Event Details */}
                  <div className="space-y-3 text-sm mb-5">
                    <div className="flex items-start gap-2 text-[#666666]">
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
                    
                    <div className="flex items-center gap-2 text-[#666666]">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-1">{getLocationName(event.location)}</span>
                    </div>
                    {event.contact?.phone && (
                      <div className="flex items-center gap-2 text-[#666666]">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>{event.contact.phone}</span>
                      </div>
                    )}
                    {event.additional_info && (
                      <p className="text-xs text-[#999999] line-clamp-2 bg-[#F9F2E7] px-3 py-2 rounded-lg">
                        {event.additional_info}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/community-admin/events/${event._id}`)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-[#666666] font-medium rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      ดูรายละเอียด
                    </button>
                    <button
                      onClick={() => navigate(`/community-admin/events/${event._id}/edit`)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-[#FFC107] hover:bg-[#FFB300] text-[#1A1A1A] font-medium rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-[#E53935] hover:bg-[#D32F2F] text-white font-medium rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {filteredEvents.length > 0 && (
          <div className="mt-8 text-center text-[#666666]">
            แสดง {filteredEvents.length} Event จากทั้งหมด {events.length} รายการ
          </div>
        )}
      </div>
    </div>
  );
};

export default EventList;
