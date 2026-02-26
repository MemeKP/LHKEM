import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, MapPin, Users, DollarSign, Edit, ArrowLeft, Clock, Info, Phone, MessageCircle, Facebook } from 'lucide-react';
import api from '../../services/api';
import { useQuery } from '@tanstack/react-query';

/**
 * Event Detail Page - แสดงรายละเอียด Event และสามารถแก้ไขได้
 * 
 * TODO: Backend APIs needed:
 * - GET /api/events/:id - ดึงรายละเอียด Event
 * - GET /api/events/:id/participants - ดึงรายชื่อผู้ลงทะเบียน
 */
const useEvent = (eventId) => {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const res = await api.get(`/api/events/${eventId}`);
      return res.data;
    },
    enabled: !!eventId,
  });
};

const fetchParticipants = async (eventId) => {
  const res = await api.get(`/api/events/${eventId}/participants`);
  return res.data;
};

const useEventParticipants = (eventId) => {
  return useQuery({
    queryKey: ['event-participants', eventId],
    queryFn: () => fetchParticipants(eventId),
    enabled: !!eventId,
  });
};

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: event, isLoading, isError } = useEvent(id);
  const {
    data: participants = [],
  } = useEventParticipants(id);

  const getLocationName = (location) => {
    if (!location) return 'ไม่ระบุสถานที่';
    if (typeof location === 'string') return location;
    return location.full_address || location.address || 'ไม่ระบุสถานที่';
  };

  // TODO: Fetch from API - GET /api/events/:id
  // Mock data for Event detail
  /*
  const event = {
    id: id,
    title: 'งานลอยกระทงโหล่งฮิมคาว 2567',
    description: 'ร่วมงานประเพณีลอยกระทงริมแม่น้ำคาว พร้อมกิจกรรมสาธิตงานฝีมือ การแสดงดนตรีพื้นบ้าน และตลาดนัดชุมชน มาร่วมสืบสานประเพณีไทยและสัมผัสวัฒนธรรมล้านนาอันงดงาม พร้อมชมการแสดงพื้นบ้านและลิ้มลองอาหารท้องถิ่น',
    location: 'ริมแม่น้ำคาว โหล่งฮิมคาว บ้านมอญ ซอย 11 ต.สันกลาง อ.สันกำแพง จ.เชียงใหม่',
    start_at: new Date('2024-11-15T18:00:00'),
    end_at: new Date('2024-11-15T22:00:00'),
    seat_limit: 200,
    deposit_amount: 0,
    status: 'OPEN',
    is_featured: true,
    is_pinned: true,
    registered: 145,
    created_by: 'Community Admin',
    created_at: new Date('2024-01-01T10:00:00'),
    updated_at: new Date('2024-01-05T14:30:00'),
    images: []
  };*/

  // TODO: Fetch from API - GET /api/events/:id/participants
  /*
  const participants = [
    { id: '1', name: 'สมชาย ใจดี', email: 'somchai@example.com', phone: '081-234-5678', registered_at: new Date('2024-01-02') },
    { id: '2', name: 'สมหญิง รักสงบ', email: 'somying@example.com', phone: '082-345-6789', registered_at: new Date('2024-01-03') },
    { id: '3', name: 'วิชัย มั่นคง', email: 'wichai@example.com', phone: '083-456-7890', registered_at: new Date('2024-01-04') }
  ];*/

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'OPEN':
        return 'เปิดรับสมัคร';
      case 'CLOSED':
        return 'ปิดรับสมัคร';
      case 'CANCELLED':
        return 'ยกเลิก';
      default:
        return status;
    }
  };

  if (isLoading) return <div className="p-10 text-center">กำลังโหลดข้อมูล...</div>;
  if (isError || !event) return <div className="p-10 text-center text-red-500">ไม่พบข้อมูลกิจกรรม</div>;

  const registeredCount = participants?.length || 0;
  const seatLimit = event.seat_limit || 0;
  const remainingSeats = seatLimit - registeredCount;
  const API_URL = import.meta.env.VITE_API_URL

  return (
    <div className="min-h-screen bg-[#F5EFE7] py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/community-admin/events')}
          className="flex items-center gap-2 text-[#666666] hover:text-[#1A1A1A] mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          กลับไปรายการ Event
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(event.status)}`}>
                  {getStatusText(event.status)}
                </span>
                {event.is_pinned && (
                  <span className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full">
                    ปักหมุด
                  </span>
                )}
                {event.is_featured && (
                  <span className="px-3 py-1 bg-yellow-500 text-white text-sm font-semibold rounded-full">
                    แนะนำ
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-[#1A1A1A] mb-1">{event.title}</h1>
              {event.title_en && (
                <p className="text-lg text-[#8C8C8C] mb-1">{event.title_en}</p>
              )}
              <p className="text-[#666666]">สร้างโดย {event.created_by?.firstname
                ? `${event.created_by.firstname} ${event.created_by.lastname}`
                : 'ไม่ระบุตัวตน'}</p>
            </div>
            <button
              onClick={() => navigate(`/community-admin/events/${id}/edit`)}
              className="flex items-center gap-2 px-6 py-3 bg-[#FFC107] hover:bg-[#FFB300] text-[#1A1A1A] font-semibold rounded-lg transition-colors"
            >
              <Edit className="h-5 w-5" />
              แก้ไข Event
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Image */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-200">
                {event.images && event.images.length > 0 ? (
                  <img
                    src={`${API_URL}${event.images}`} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="h-24 w-24 text-orange-300" />
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-[#FFC107]" />
                รายละเอียด
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-[#555555] mb-1">ภาษาไทย</p>
                  <p className="text-[#666666] leading-relaxed whitespace-pre-line">{event.description}</p>
                </div>
                {event.description_en && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm font-semibold text-[#555555] mb-1">English</p>
                    <p className="text-[#666666] leading-relaxed whitespace-pre-line">{event.description_en}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information Sections */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">ข้อมูลเพิ่มเติม</h2>
              <div className="space-y-4">
                {/* Event Type */}
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A] mb-1">ประเภทกิจกรรม</p>
                  <p className="text-[#666666]">{event.event_type || 'ไม่ระบุ'}</p>
                </div>
                
                {/* Target Audience */}
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A] mb-1">กลุ่มเป้าหมาย</p>
                  <p className="text-[#666666]">{event.target_audience || 'ไม่ระบุ'}</p>
                </div>

                {/* Additional Info */}
                {event.additional_info && (
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A] mb-1">ข้อมูลเพิ่มเติม</p>
                    <p className="text-[#666666] whitespace-pre-line">{event.additional_info}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">ข้อมูลติดต่อ</h2>
              <div className="space-y-3">
                {event.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#999999]" />
                    <span className="text-[#666666]">{event.contact_phone}</span>
                  </div>
                )}
                {event.contact_line && (
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-[#999999]" />
                    <span className="text-[#666666]">Line: {event.contact_line}</span>
                  </div>
                )}
                {event.contact_facebook && (
                  <div className="flex items-center gap-2">
                    <Facebook className="h-4 w-4 text-[#999999]" />
                    <span className="text-[#666666]">Facebook: {event.contact_facebook}</span>
                  </div>
                )}
                {event.coordinator_name && (
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A] mb-1">ผู้ประสานงาน</p>
                    <p className="text-[#666666]">{event.coordinator_name}</p>
                  </div>
                )}
                {!event.contact_phone && !event.contact_line && !event.contact_facebook && !event.coordinator_name && (
                  <p className="text-[#999999] text-sm">ไม่มีข้อมูลติดต่อ</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Event Info */}
          <div className="space-y-6">
            {/* Date & Time */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#FFC107]" />
                วันและเวลา
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-[#666666] mb-1">วันที่</p>
                  <p className="font-medium text-[#1A1A1A]">
                    {new Date(event.start_at).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#666666] mb-1">เวลา</p>
                  <p className="font-medium text-[#1A1A1A] flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {new Date(event.start_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                    {' - '}
                    {new Date(event.end_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#FFC107]" />
                สถานที่
              </h3>
              <p className="text-[#666666] leading-relaxed">{getLocationName(event.location)}</p>
            </div>

            {/* Capacity & Pricing */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">ค่าใช้จ่าย</h3>
              <div className="space-y-3">
                {event.deposit_amount > 0 && (
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-2 text-[#666666]">
                      <DollarSign className="h-4 w-4" />
                      <span>ค่ามัดจำ</span>
                    </div>
                    <span className="font-semibold text-[#FFC107]">฿{event.deposit_amount}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-[#F5F5F5] rounded-lg p-4 text-sm text-[#666666]">
              <div className="space-y-2">
                <div>
                  <span className="font-medium">สร้างเมื่อ:</span>{' '}
                  {event.createdAt 
                    ? new Date(event.createdAt).toLocaleDateString('th-TH', { 
                        year: 'numeric', month: 'long', day: 'numeric', 
                        hour: '2-digit', minute: '2-digit' 
                      })
                    : '-'
                  }
                </div>
                <div>
                  <span className="font-medium">แก้ไขล่าสุด:</span>{' '}
                  {event.updatedAt
                    ? new Date(event.updatedAt).toLocaleDateString('th-TH', {
                      year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })
                    : '-'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
