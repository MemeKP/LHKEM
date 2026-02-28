import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, MapPin, Edit, ArrowLeft, Clock, Info, Phone, MessageCircle, Facebook, Globe, Target, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';

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

const useToggleEventStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, status }) => {
      const res = await api.patch(`/api/events/${eventId}`, { status });
      return res.data;
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'community'] });
    }
  });
};

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: event, isLoading, isError } = useEvent(id);
  const { mutateAsync: toggleStatus, isPending: isToggling } = useToggleEventStatus();

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
    switch ((status || '').toUpperCase()) {
      case 'OPEN':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'OPEN':
        return 'เปิดรับสมัคร';
      case 'CLOSED':
        return 'ปิดรับสมัคร';
      case 'CANCELLED':
        return 'ยกเลิก';
      case 'PENDING':
        return 'รอการตรวจสอบ';
      default:
        return status;
    }
  };

  const handleToggleStatus = async () => {
    if (!event) return;
    const nextStatus = event.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      await Swal.fire({
        title: nextStatus === 'OPEN' ? 'เปิด Event นี้?' : 'ปิด Event นี้?',
        text: nextStatus === 'OPEN' ? 'ผู้คนจะสามารถลงทะเบียนได้อีกครั้ง' : 'ผู้คนจะไม่สามารถลงทะเบียนเพิ่มเติมได้',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: nextStatus === 'OPEN' ? 'เปิดใช้งาน' : 'ปิดรับ',
        cancelButtonText: 'ยกเลิก',
      }).then(async (result) => {
        if (!result.isConfirmed) return;
        await toggleStatus({ eventId: id, status: nextStatus });
        Swal.fire({
          icon: 'success',
          title: 'อัปเดตสำเร็จ',
          text: nextStatus === 'OPEN' ? 'เปิด Event แล้ว' : 'ปิด Event แล้ว',
          timer: 1800,
          showConfirmButton: false,
        });
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'ไม่สามารถอัปเดตสถานะได้',
        text: error?.response?.data?.message || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ',
      });
    }
  };

  if (isLoading) return <div className="p-10 text-center animate-fadeIn">กำลังโหลดข้อมูล...</div>;
  if (isError || !event) return <div className="p-10 text-center text-red-500">ไม่พบข้อมูลกิจกรรม</div>;

  const API_URL = import.meta.env.VITE_API_URL;

  const renderContactItem = (icon, label, value) => (
    <div className="flex items-center gap-2 text-[#666666]" key={label}>
      {icon}
      <span>{value}</span>
    </div>
  );

  const primaryImage = Array.isArray(event.images) ? event.images[0] : event.images;
  const locationDisplay = getLocationName(event.location);
  const startAt = new Date(event.start_at);
  const endAt = new Date(event.end_at);
  const formattedDate = startAt.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
  const formattedTimeRange = `${startAt.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} - ${endAt.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`;
  const highlightItems = [
    { label: 'ประเภทกิจกรรม', value: event.event_type || 'ไม่ระบุ' },
    { label: 'กลุ่มเป้าหมาย', value: event.target_audience || 'ไม่ระบุ' },
    { label: 'ค่าใช้จ่าย', value: event.cost_type === 'paid' ? 'มีค่าใช้จ่าย' : 'ฟรี' },
    { label: 'สถานะ', value: getStatusText(event.status) }
  ];

  return (
    <div className="min-h-screen bg-[#F5EFE7] py-8 animate-fadeIn">
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
        <div className="bg-gradient-to-br from-[#FFF5E1] via-white to-white rounded-2xl shadow-sm p-6 lg:p-8 mb-8 border border-orange-100 transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                  {getStatusText(event.status)}
                </span>
                {event.is_pinned && (
                  <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                    ปักหมุด
                  </span>
                )}
                {event.is_featured && (
                  <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                    แนะนำ
                  </span>
                )}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[#1A1A1A] mb-2">{event.title}</h1>
              {event.title_en && (
                <p className="text-lg text-[#8C8C8C] mb-2">{event.title_en}</p>
              )}
              <div className="flex flex-wrap gap-3 text-sm text-[#444444]">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/70 rounded-full border border-orange-100">
                  <Calendar className="h-4 w-4 text-[#FFA000]" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/70 rounded-full border border-orange-100">
                  <Clock className="h-4 w-4 text-[#FFA000]" />
                  <span>{formattedTimeRange}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/70 rounded-full border border-orange-100">
                  <MapPin className="h-4 w-4 text-[#FFA000]" />
                  <span className="line-clamp-1">{locationDisplay}</span>
                </div>
              </div>
              <p className="text-[#666666] text-sm mt-3">
                {event.created_by?.firstname
                  ? `สร้างโดย ${event.created_by.firstname} ${event.created_by.lastname}`
                  : 'สร้างโดยไม่ระบุ'}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleToggleStatus}
                disabled={isToggling}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold border transition-colors ${event.status === 'OPEN'
                    ? 'bg-white text-[#1A1A1A] border-gray-200 hover:bg-gray-50'
                    : 'bg-[#1E293B] text-white border-[#1E293B] hover:bg-[#0F172A]'} ${isToggling ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <AlertTriangle className="h-4 w-4" />
                {event.status === 'OPEN' ? 'ปิดรับกิจกรรม' : 'เปิดกิจกรรม'}
              </button>
              <button
                onClick={() => navigate(`/community-admin/events/${id}/edit`)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#FFC107] hover:bg-[#FFB300] text-[#1A1A1A] font-semibold rounded-lg transition-colors"
              >
                <Edit className="h-5 w-5" />
                แก้ไข Event
              </button>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            {highlightItems.map((item) => (
              <div key={item.label} className="bg-white/80 rounded-xl border border-white/60 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-[#A07B4F] font-semibold">{item.label}</p>
                <p className="text-sm text-[#1A1A1A] font-medium mt-1 line-clamp-2">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Image */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-fadeIn">
              <div className="relative aspect-[16/9] bg-gradient-to-br from-orange-100 to-orange-200">
                {primaryImage ? (
                  <img
                    src={`${API_URL}${primaryImage}`}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="h-24 w-24 text-orange-300" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
                  <p className="text-sm font-semibold uppercase tracking-wide mb-1">สถานที่</p>
                  <p className="text-lg font-medium leading-snug">{locationDisplay}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-7 transition-all duration-300 hover:shadow-lg">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 transition-all duration-300 hover:shadow-lg">
                <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-[#FFC107]" />
                  ประเภท & กลุ่มเป้าหมาย
                </h2>
                <div className="space-y-3 text-sm text-[#555555]">
                  <div>
                    <p className="font-semibold text-[#1A1A1A] mb-1">ประเภทกิจกรรม</p>
                    <p className="text-[#666666]">{event.event_type || 'ไม่ระบุ'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A1A1A] mb-1">กลุ่มเป้าหมาย</p>
                    <p className="text-[#666666]">{event.target_audience || 'ไม่ระบุ'}</p>
                  </div>
                  {event.workshops?.length > 0 && (
                    <div>
                      <p className="font-semibold text-[#1A1A1A] mb-1">เชื่อมกับ Workshop</p>
                      <ul className="list-disc list-inside text-[#666666]">
                        {event.workshops.map((w) => (
                          <li key={w}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 transition-all duration-300 hover:shadow-lg">
                <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-[#FFC107]" />
                  ข้อมูลเพิ่มเติม
                </h2>
                <div className="space-y-3 text-sm text-[#555555]">
                  {/* Quick Meta Chips */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.event_type && (
                      <div className="bg-[#FFF2CC] rounded-full px-3 py-1 text-xs font-semibold text-[#A06A00]">
                        {event.event_type}
                      </div>
                    )}
                    {event.target_audience && (
                      <div className="bg-[#FFE7D4] rounded-full px-3 py-1 text-xs font-semibold text-[#A04D00]">
                        {event.target_audience}
                      </div>
                    )}
                    {event.cost_type === 'paid' && (
                      <div className="bg-[#FFC107] rounded-full px-3 py-1 text-xs font-semibold text-[#1A1A1A]">
                        มีค่าใช้จ่าย
                      </div>
                    )}
                  </div>
                  {event.description_en && (
                    <div>
                      <p className="font-semibold text-[#1A1A1A] mb-1">คำอธิบายภาษาอังกฤษ</p>
                      <p className="text-[#666666] whitespace-pre-line">{event.description_en}</p>
                    </div>
                  )}
                  {event.additional_info && (
                    <div>
                      <p className="font-semibold text-[#1A1A1A] mb-1">ข้อมูลเพิ่มเติม</p>
                      <p className="text-[#666666] whitespace-pre-line">{event.additional_info}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6 transition-all duration-300 hover:shadow-lg animate-fadeIn">
              <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">ข้อมูลติดต่อ</h2>
              <div className="space-y-3">
                {event.contact?.phone && renderContactItem(<Phone className="h-4 w-4 text-[#999999]" />, 'phone', event.contact.phone)}
                {event.contact?.line && renderContactItem(<MessageCircle className="h-4 w-4 text-[#999999]" />, 'line', `Line: ${event.contact.line}`)}
                {event.contact?.facebook && renderContactItem(<Facebook className="h-4 w-4 text-[#999999]" />, 'facebook', `Facebook: ${event.contact.facebook}`)}
                {event.contact?.coordinator_name && (
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A] mb-1">ผู้ประสานงาน</p>
                    <p className="text-[#666666]">{event.contact.coordinator_name}</p>
                  </div>
                )}
                {!event.contact?.phone && !event.contact?.line && !event.contact?.facebook && !event.contact?.coordinator_name && (
                  <p className="text-[#999999] text-sm">ไม่มีข้อมูลติดต่อ</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Event Info */}
          <div className="space-y-6">
            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-sm p-6 transition-all duration-300 hover:shadow-lg">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#FFC107]" />
                วันและเวลา
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FFF2CC] flex items-center justify-center text-[#A06A00] font-semibold">เริ่ม</div>
                  <div>
                    <p className="text-sm text-[#666666]">{formattedDate}</p>
                    <p className="text-base font-semibold text-[#1A1A1A]">{startAt.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FFE7D4] flex items-center justify-center text-[#A04D00] font-semibold">จบ</div>
                  <div>
                    <p className="text-sm text-[#666666]">{endAt.toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long'
                    })}</p>
                    <p className="text-base font-semibold text-[#1A1A1A]">{endAt.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="bg-[#FFF7ED] rounded-xl p-4 text-sm text-[#8C4A00]">
                  <p className="font-semibold mb-1">ช่วงเวลารวม</p>
                  <p>{formattedTimeRange}</p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl shadow-sm p-6 transition-all duration-300 hover:shadow-lg">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#FFC107]" />
                สถานที่
              </h3>
              <p className="text-[#666666] leading-relaxed">{locationDisplay}</p>
            </div>

            {/* Metadata */}
            <div className="bg-[#F5F5F5] rounded-2xl p-5 text-sm text-[#666666] transition-all duration-300 hover:shadow-inner">
              <div className="space-y-2">
                <div>
                  <span className="font-medium">สร้างเมื่อ:</span>{' '}
                  {event.createdAt
                    ? new Date(event.createdAt).toLocaleDateString('th-TH', {
                      year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })
                    : '-'}
                </div>
                <div>
                  <span className="font-medium">แก้ไขล่าสุด:</span>{' '}
                  {event.updatedAt
                    ? new Date(event.updatedAt).toLocaleDateString('th-TH', {
                      year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })
                    : '-'}
                </div>
                <div>
                  <span className="font-medium">สร้างโดย:</span>{' '}
                  {event.created_by?.firstname
                    ? `${event.created_by.firstname} ${event.created_by.lastname}`
                    : 'ไม่ระบุ'}
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
