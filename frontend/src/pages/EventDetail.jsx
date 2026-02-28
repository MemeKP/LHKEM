import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, ArrowLeft, Info, Phone, MessageCircle, Facebook, Users } from 'lucide-react';
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
      value: typeof event.location === 'string'
        ? event.location
        : event.location?.full_address || ct('ไม่ระบุสถานที่', 'No location info'),
      icon: <MapPin className="h-4 w-4 text-orange-500" />,
    },
    event.event_type && {
      label: ct('ประเภทกิจกรรม', 'Event type'),
      value: event.event_type,
      icon: <Info className="h-4 w-4 text-orange-500" />,
    },
    event.target_audience && {
      label: ct('กลุ่มเป้าหมาย', 'Audience'),
      value: event.target_audience,
      icon: <Users className="h-4 w-4 text-orange-500" />,
    },
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
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          to={`/${slug}/events`}
          className="inline-flex items-center gap-2 text-[#666666] hover:text-[#1A1A1A] mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {ct('กลับหน้าชุมชน', 'Back to community')}
        </Link>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-orange-100">
          <div className="relative">
            {coverImage ? (
              <img
                src={resolveImageUrl(coverImage)}
                alt={event.title}
                className="w-full h-[320px] object-cover"
              />
            ) : (
              <div className="h-[320px] bg-gradient-to-br from-orange-200 via-amber-200 to-orange-300 flex items-center justify-center">
                <Calendar className="h-20 w-20 text-white/60" />
              </div>
            )}
            <div className="absolute bottom-6 left-6 bg-white/90 rounded-2xl px-4 py-2 text-sm font-semibold text-gray-800 shadow">
              {dateLabel}
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div>
              <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 mb-3">
                {event.status || 'OPEN'}
              </span>
              <h1 className="text-3xl font-bold text-[#1A1A1A] mb-3">{ct(event.title, event.title_en)}</h1>
              <p className="text-[#666666] leading-relaxed whitespace-pre-line">
                {ct(event.description, event.description_en)}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {detailBlocks.map((block) => (
                <div key={block.label} className="border border-gray-100 rounded-2xl p-4 flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                    {block.icon}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">{block.label}</p>
                    <p className="text-sm font-semibold text-gray-800 whitespace-pre-line">{block.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {event.additional_info && (
              <div className="bg-[#FFF7ED] rounded-2xl p-5 border border-orange-100">
                <p className="text-sm font-semibold text-[#8C4A00] mb-1">{ct('ข้อมูลเพิ่มเติม', 'Additional info')}</p>
                <p className="text-sm text-[#7A4A0C] whitespace-pre-line">{event.additional_info}</p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">{ct('ข้อมูลติดต่อ', 'Contact')}</h3>
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
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
