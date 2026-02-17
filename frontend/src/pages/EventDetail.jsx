import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, ArrowLeft, Info, Phone, MessageCircle, Facebook, Users, DollarSign } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { communityEventsMock } from '../data/eventsMock';

const EventDetail = () => {
  const { slug, id } = useParams();
  const { ct } = useTranslation();

  const event = useMemo(() => communityEventsMock.find((ev) => ev.id === id), [id]);

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

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to={`/${slug}/events`}
          className="inline-flex items-center gap-2 text-[#666666] hover:text-[#1A1A1A] mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          {ct('กลับไปที่รายการกิจกรรม', 'Back to events list')}
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className={`h-56 bg-gradient-to-br ${event.gradient} relative flex items-center justify-center`}>
            <Calendar className="h-20 w-20 text-white/70" />
            <div className="absolute top-4 left-4 bg-white/90 px-4 py-2 rounded-full text-sm font-semibold text-gray-700">
              {ct(event.date, event.date_en)}
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 text-sm text-[#666666]">
                <Clock className="h-4 w-4" />
                <span>{event.time}</span>
              </div>
              <h1 className="text-2xl font-bold text-[#1A1A1A] leading-tight">{ct(event.title, event.title_en)}</h1>
              <p className="text-[#666666] leading-relaxed">{ct(event.description, event.description_en)}</p>
            </div>

            <div className="flex items-center gap-2 text-sm text-[#666666]">
              <MapPin className="h-4 w-4" />
              <span>{ct(event.location, event.location_en)}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#F9FAFB] rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm text-[#666666]">
                <Users className="h-4 w-4" />
                <span>{ct('ที่นั่งเหลือ: จำกัดที่', 'Seats remaining: up to')} 100</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#666666]">
                <DollarSign className="h-4 w-4" />
                <span>{ct('ค่าใช้จ่าย: ฟรี', 'Cost: Free')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[#1A1A1A]">{ct('ข้อมูลติดต่อ', 'Contact')}</h3>
              <div className="flex flex-wrap gap-3 text-sm text-[#666666]">
                <span className="inline-flex items-center gap-2 bg-[#F5F5F5] px-3 py-2 rounded-full">
                  <Phone className="h-4 w-4" /> 081-234-5678
                </span>
                <span className="inline-flex items-center gap-2 bg-[#F5F5F5] px-3 py-2 rounded-full">
                  <MessageCircle className="h-4 w-4" /> Line: @community
                </span>
                <span className="inline-flex items-center gap-2 bg-[#F5F5F5] px-3 py-2 rounded-full">
                  <Facebook className="h-4 w-4" /> Facebook: Community Page
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
