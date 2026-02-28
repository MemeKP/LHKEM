import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, ArrowLeft, Info, Phone, MessageCircle, Facebook, Users, DollarSign } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import api from '../services/api';
import { useQuery } from '@tanstack/react-query';
import { resolveImageUrl } from '../utils/image';

const EventDetail = () => {
  const { slug, id } = useParams();
  const { ct } = useTranslation();
  const { data: event, isLoading } = useQuery({
    queryKey: ['event-detail', id],
    queryFn: async () => {
      const res = await api.get(`/api/events/public-detail/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm max-w-md">
          <p className="text-lg font-semibold text-[#1A1A1A] mb-2">{ct('ไม่พบกิจกรรม', 'Event not found')}</p>
          <p className="text-[#666666] mb-4">{ct('กิจกรรมนี้อาจถูกลบ หรือยังไม่ถูกสร้าง', 'This event may be removed or not created yet')}</p>
          <Link
            to={`/${slug}`}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#1E293B] text-white rounded-lg font-semibold hover:bg-[#0F172A] transition"
          >
            <ArrowLeft className="h-4 w-4" />
            {ct('กลับหน้าชุมชน', 'Back to community')}
          </Link>
        </div>
      </div>
    );
  } 

  const startDate = event.start_at ? new Date(event.start_at) : null;
  const seatsLeft = event.seat_limit - (event.participants?.length || 0);

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to={`/${slug}/events`} className="inline-flex items-center gap-2 text-[#666666] hover:text-[#1A1A1A] mb-4">
          <ArrowLeft className="h-4 w-4" />
          {ct('กลับไปที่รายการกิจกรรม', 'Back to events list')}
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-56 bg-gradient-to-br from-orange-400 to-amber-500 relative flex items-center justify-center">
            {event.images?.[0] ? (
              <img src={resolveImageUrl(event.images[0])} className="w-full h-full object-cover" />
            ) : (
              <Calendar className="h-20 w-20 text-white/70" />
            )}
            {startDate && (
              <div className="absolute top-4 left-4 bg-white/90 px-4 py-2 rounded-full text-sm font-semibold text-gray-700">
                {startDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            )}
          </div>

          <div className="p-6 space-y-4">
            <div className="flex flex-col gap-2">
              {startDate && (
                <div className="flex items-center gap-3 text-sm text-[#666666]">
                  <Clock className="h-4 w-4" />
                  <span>{startDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
              <h1 className="text-2xl font-bold text-[#1A1A1A]">{ct(event.title, event.title_en)}</h1>
              <p className="text-[#666666] leading-relaxed">{ct(event.description, event.description_en)}</p>
            </div>

            {event.location?.full_address && (
              <div className="flex items-center gap-2 text-sm text-[#666666]">
                <MapPin className="h-4 w-4" />
                <span>{event.location.full_address}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#F9FAFB] rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm text-[#666666]">
                <Users className="h-4 w-4" />
                <span>{ct(`ที่นั่งเหลือ: ${seatsLeft} ที่`, `Seats remaining: ${seatsLeft}`)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#666666]">
                <DollarSign className="h-4 w-4" />
                <span>{event.deposit_amount ? `${event.deposit_amount} บาท` : ct('ฟรี', 'Free')}</span>
              </div>
            </div>

            {event.contact && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-[#1A1A1A]">{ct('ข้อมูลติดต่อ', 'Contact')}</h3>
                <div className="flex flex-wrap gap-3 text-sm text-[#666666]">
                  {event.contact.phone && (
                    <span className="inline-flex items-center gap-2 bg-[#F5F5F5] px-3 py-2 rounded-full">
                      <Phone className="h-4 w-4" /> {event.contact.phone}
                    </span>
                  )}
                  {event.contact.line && (
                    <span className="inline-flex items-center gap-2 bg-[#F5F5F5] px-3 py-2 rounded-full">
                      <MessageCircle className="h-4 w-4" /> Line: {event.contact.line}
                    </span>
                  )}
                  {event.contact.facebook && (
                    <span className="inline-flex items-center gap-2 bg-[#F5F5F5] px-3 py-2 rounded-full">
                      <Facebook className="h-4 w-4" /> {event.contact.facebook}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
