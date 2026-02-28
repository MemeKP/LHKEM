import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, ArrowLeft, Info, Phone, MessageCircle, Facebook, Users, Tag, AlertCircle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useQuery } from '@tanstack/react-query';
import { getCommunityEventDetail } from '../services/eventService';
import { resolveImageUrl } from '../utils/image';

const EventDetail = () => {
  const { slug, id } = useParams();
  const { ct } = useTranslation();

  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['community-event', slug, id],
    queryFn: () => getCommunityEventDetail(slug, id),
    enabled: !!slug && !!id,
  });

  const startAt = event?.start_at ? new Date(event.start_at) : null;
  const endAt = event?.end_at ? new Date(event.end_at) : null;
  const dateLabel = startAt
    ? startAt.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : ct('ไม่ระบุวันที่', 'Date not specified');
  const timeLabel = startAt && endAt
    ? `${startAt.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} - ${endAt.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`
    : ct('ไม่ระบุเวลา', 'Time not specified');
  const coverImage = Array.isArray(event?.images) ? event?.images[0] : event?.images;
  const locationValue = typeof event?.location === 'string'
    ? event.location
    : event?.location?.full_address || ct('ไม่ระบุสถานที่', 'No location info');
  const costLabel = event?.deposit_amount && Number(event.deposit_amount) > 0
    ? `฿${Number(event.deposit_amount).toLocaleString('th-TH', { minimumFractionDigits: 0 })}`
    : ct('ฟรี', 'Free');
  const statusLabel = (event?.status || 'OPEN').toUpperCase();
  const statusBadge = {
    OPEN: 'bg-green-100 text-green-700',
    CLOSED: 'bg-gray-200 text-gray-700',
    CANCELLED: 'bg-red-100 text-red-700',
    PENDING: 'bg-yellow-100 text-yellow-700'
  }[statusLabel] || 'bg-gray-200 text-gray-700';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="space-y-3 text-center text-gray-500">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
          <p>{ct('กำลังโหลดข้อมูลกิจกรรม...', 'Loading event...')}</p>
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm max-w-md">
          <p className="text-lg font-semibold text-[#1A1A1A] mb-2">{ct('ไม่พบกิจกรรม', 'Event not found')}</p>
          <p className="text-[#666666] mb-4">{ct('กิจกรรมนี้อาจถูกลบ หรือยังไม่ถูกสร้าง', 'This event may be removed or not created yet')}</p>
          <Link
            to={`/${slug}/events`}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#1E293B] text-white rounded-lg font-semibold hover:bg-[#0F172A] transition"
          >
            <ArrowLeft className="h-4 w-4" />
            {ct('กลับหน้าชุมชน', 'Back to community')}
          </Link>
        </div>
      </div>
    );
  }

  const detailBlocks = [
    {
      label: ct('วันและเวลา', 'Date & Time'),
      value: `${dateLabel}\n${timeLabel}`,
      icon: <Clock className="h-4 w-4 text-orange-500" />,
    },
    {
      label: ct('สถานที่', 'Location'),
      value: locationValue,
      icon: <MapPin className="h-4 w-4 text-orange-500" />,
    },
    event?.event_type && {
      label: ct('ประเภทกิจกรรม', 'Event type'),
      value: event.event_type,
      icon: <Info className="h-4 w-4 text-orange-500" />,
    },
    event?.target_audience && {
      label: ct('กลุ่มเป้าหมาย', 'Audience'),
      value: event.target_audience,
      icon: <Users className="h-4 w-4 text-orange-500" />,
    },
  ].filter(Boolean);

  const highlightChips = [
    {
      label: ct('สถานะ', 'Status'),
      value: statusLabel,
      icon: <AlertCircle className="h-4 w-4" />,
      badge: statusBadge,
    },
    {
      label: ct('ค่าใช้จ่าย', 'Cost'),
      value: costLabel,
      icon: <Tag className="h-4 w-4" />,
      badge: 'bg-amber-100 text-amber-700'
    },
    event?.event_type && {
      label: ct('ประเภท', 'Type'),
      value: event.event_type,
      icon: <Info className="h-4 w-4" />,
      badge: 'bg-blue-100 text-blue-700'
    },
    event?.target_audience && {
      label: ct('กลุ่มเป้าหมาย', 'Audience'),
      value: event.target_audience,
      icon: <Users className="h-4 w-4" />,
      badge: 'bg-purple-100 text-purple-700'
    }
  ].filter(Boolean);

  const contactChips = [
    event.contact?.phone && {
      label: event.contact.phone,
      icon: <Phone className="h-4 w-4" />,
    },
    event.contact?.line && {
      label: `Line: ${event.contact.line}`,
      icon: <MessageCircle className="h-4 w-4" />,
    },
    event.contact?.facebook && {
      label: `Facebook: ${event.contact.facebook}`,
      icon: <Facebook className="h-4 w-4" />,
    },
    event.contact?.coordinator_name && {
      label: `${ct('ผู้ประสานงาน', 'Coordinator')}: ${event.contact.coordinator_name}`,
      icon: <Users className="h-4 w-4" />,
    },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-10 px-4 animate-fadeIn">
      <div className="max-w-6xl mx-auto space-y-8">
        <Link
          to={`/${slug}/events`}
          className="inline-flex items-center gap-2 text-[#666666] hover:text-[#1A1A1A] mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {ct('กลับหน้าชุมชน', 'Back to community')}
        </Link>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-orange-100 animate-fadeIn">
          <div className="relative h-[360px]">
            {coverImage ? (
              <img
                src={resolveImageUrl(coverImage)}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="h-full bg-gradient-to-br from-orange-200 via-amber-200 to-orange-300 flex items-center justify-center">
                <Calendar className="h-24 w-24 text-white/60" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute top-6 left-6 flex flex-wrap gap-2">
              <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${statusBadge}`}>
                {statusLabel}
              </span>
              {event?.is_featured && (
                <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-yellow-400 text-white">
                  {ct('แนะนำ', 'Featured')}
                </span>
              )}
              {event?.is_pinned && (
                <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-red-500 text-white">
                  {ct('ปักหมุด', 'Pinned')}
                </span>
              )}
            </div>
            <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3 text-white">
              <div className="text-sm font-semibold px-4 py-2 bg-white/20 backdrop-blur rounded-2xl w-fit">
                {dateLabel}
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-white/90">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15">
                  <Clock className="h-4 w-4" />
                  {timeLabel}
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15">
                  <MapPin className="h-4 w-4" />
                  <span className="line-clamp-1">{locationValue}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {highlightChips.map((chip) => (
                  <div key={chip.label} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${chip.badge} bg-opacity-80 animate-fadeIn`}>
                    {chip.icon}
                    <span>{chip.value}</span>
                  </div>
                ))}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[#1A1A1A] leading-tight">
                {ct(event.title, event.title_en)}
              </h1>
              <p className="text-[#5C5C5C] leading-relaxed whitespace-pre-line">
                {ct(event.description, event.description_en)}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {detailBlocks.map((block) => (
                <div key={block.label} className="border border-gray-100 rounded-2xl p-4 flex gap-3 bg-gray-50/40">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    {block.icon}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">{block.label}</p>
                    <p className="text-sm font-semibold text-gray-800 whitespace-pre-line">{block.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 animate-fadeIn">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                {ct('กำหนดการ', 'Schedule')}
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
                  <p className="text-xs uppercase tracking-wide text-orange-600 mb-1">{ct('เริ่ม', 'Starts')}</p>
                  <p className="text-base font-semibold text-gray-900">{startAt?.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) || '-'}</p>
                  <p className="text-sm text-gray-600">{startAt?.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) || '-'}</p>
                </div>
                <div className="rounded-2xl border border-orange-100 bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">{ct('สิ้นสุด', 'Ends')}</p>
                  <p className="text-base font-semibold text-gray-900">{endAt?.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) || '-'}</p>
                  <p className="text-sm text-gray-600">{endAt?.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) || '-'}</p>
                </div>
              </div>
            </div>

            {event.additional_info && (
              <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-6 animate-fadeIn">
                <h3 className="text-xl font-semibold text-[#8C4A00] mb-3">{ct('ข้อมูลเพิ่มเติม', 'Additional info')}</h3>
                <p className="text-sm text-[#7A4A0C] whitespace-pre-line">{event.additional_info}</p>
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 animate-fadeIn">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-orange-500" />
                {ct('ข้อมูลติดต่อ', 'Contact')}
              </h3>
              {contactChips.length > 0 ? (
                <div className="flex flex-wrap gap-3 text-sm text-[#666666]">
                  {contactChips.map((chip, index) => (
                    <span key={`${chip.label}-${index}`} className="inline-flex items-center gap-2 bg-[#F5F5F5] px-3 py-2 rounded-full">
                      {chip.icon}
                      <span>{chip.label}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">{ct('ยังไม่มีข้อมูลติดต่อ', 'No contact info')}</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 animate-fadeIn">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-500" />
                {ct('สถานที่จัดกิจกรรม', 'Event Location')}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{locationValue}</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 animate-fadeIn">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5 text-orange-500" />
                {ct('ข้อมูลค่าใช้จ่าย', 'Cost Detail')}
              </h3>
              <p className="text-3xl font-bold text-[#1A1A1A]">{costLabel}</p>
              <p className="text-sm text-gray-500 mt-1">{event?.deposit_amount > 0 ? ct('ชำระหน้างานหรือโอนตามเงื่อนไขที่แจ้ง', 'Pay on-site or via provided instructions') : ct('ไม่มีค่าใช้จ่ายเพิ่มเติม', 'No additional cost')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
