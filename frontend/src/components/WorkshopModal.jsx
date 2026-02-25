import { MapPin, X, Calendar, Clock, BookOpen, AlertCircle, Info, Store, Users, Minus, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

const SectionCard = ({ icon, title, children }) => (
  <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-5 space-y-4 animate-scaleIn">
    <div className="flex items-center gap-2 text-gray-900 font-semibold">
      {icon}
      <span>{title}</span>
    </div>
    {children}
  </div>
);

const WorkshopModal = ({ workshop, isOpen, onClose, onBookingSuccess }) => {
  const { t, ct } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [guestCount, setGuestCount] = useState(1);

  const handleIncrement = () => {
    if (guestCount < workshop.seatsLeft) {
      setGuestCount(guestCount + 1);
    }
  };

  const handleDecrement = () => {
    if (guestCount > 1) {
      setGuestCount(guestCount - 1);
    }
  };

  const handleEnroll = () => {
    if (!isAuthenticated) {
      onClose();
      navigate('/login', { state: { from: `/workshops`, workshopId: workshop.id } });
      return;
    }
    
    // Create booking and show E-ticket
    const booking = {
      id: Date.now(),
      workshop,
      guestCount,
      bookingDate: new Date().toISOString(),
      status: 'pending'
    };
    
    // Save to localStorage (temporary until backend is ready)
    const existingBookings = JSON.parse(localStorage.getItem('workshopBookings') || '[]');
    existingBookings.push(booking);
    localStorage.setItem('workshopBookings', JSON.stringify(existingBookings));
    
    onClose();
    if (onBookingSuccess) {
      onBookingSuccess(booking);
    }
  };

  if (!isOpen || !workshop) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden relative animate-slideUp">
        <button
          className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600 transition"
          onClick={onClose}
          aria-label={t('common.close')}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 space-y-5 max-h-[85vh] overflow-y-auto animate-stagger">
          {/* Header */}
          <div className="rounded-[28px] border border-gray-100 bg-white shadow-sm p-5 space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 leading-snug mb-2">{workshop.title}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Store className="h-4 w-4" />
                {ct('โดยร้าน', 'By')} {workshop.host}
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="text-left">
                <p className="text-3xl font-bold text-orange-500">
                  {workshop.price === 0 ? t('workshops.free') : `${workshop.price}.-`}
                </p>
                <p className="text-xs text-gray-400">{ct('ต่อคน', 'per person')}</p>
              </div>
              <div className="text-right space-y-1">
                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full inline-block">
                  {ct('ที่นั่งคงเหลือ', 'Seats left')} {workshop.seatsLeft}
                </span>
                <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                  <Clock className="h-3 w-3" /> {workshop.duration}
                </p>
              </div>
            </div>
          </div>

          {/* Workshop Details */}
          <SectionCard
            icon={<Calendar className="h-5 w-5 text-blue-600" />}
            title={ct('วันและเวลาที่จัดกิจกรรม', 'Workshop Schedule')}
          >
            <div className="space-y-3 text-sm text-gray-700">
              {workshop.sessions && workshop.sessions.length > 0 ? (
                workshop.sessions.map((session, index) => (
                  <div
                    key={index}
                    className={`rounded-2xl border p-4 ${index === 0 ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}`}
                  >
                    <p className="font-semibold text-gray-900">{session.title}</p>
                    <p className="text-gray-600">{session.detail}</p>
                    <p className="text-gray-400 text-sm">{session.time}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border p-4 bg-blue-50 border-blue-200">
                  <p className="font-semibold text-gray-900">{ct('รอบที่จัดกิจกรรม (Workshop)', 'Workshop Session')}</p>
                  <p className="text-gray-600">{ct('เปิดรับ: จันทร์ - ศุกร์', 'Open: Monday - Friday')}</p>
                  <p className="text-gray-400 text-sm">{ct('รอบเช้า: 10:00 - 15:30 น.', 'Morning: 10:00 - 15:30')}</p>
                </div>
              )}
            </div>
          </SectionCard>
          
          {/* Time Slots */}
          <SectionCard
            icon={<Clock className="h-5 w-5 text-green-600" />}
            title={ct('เวลาทำการของร้าน', 'Shop Opening Hours')}
          >
            <div className="rounded-2xl border p-4 bg-white border-gray-100">
              <p className="text-gray-700">{ct('เปิดทำการ: 10:00 - 17:00 น.', 'Open: 10:00 - 17:00')}</p>
              <p className="text-gray-500 text-sm">{ct('(หยุดวันอาทิตย์)', '(Closed on Sunday)')}</p>
            </div>
          </SectionCard>

          {/* What You'll Learn */}
          <SectionCard
            icon={<BookOpen className="h-5 w-5 text-orange-500" />}
            title={ct('สิ่งที่ได้เรียนรู้', 'What You\'ll Learn')}
          >
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 bg-orange-50 text-orange-700 rounded-xl text-sm font-medium">
                {ct('ดูตัวอย่างผลงาน', 'View Sample Work')}
              </button>
              <div className="px-4 py-3 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-700">
                  {workshop.learnings && workshop.learnings.length > 0 ? workshop.learnings[0] : ct('ผ้าย้อมคราม ทำด้วยตัวเอง ทำง่ายได้ผ้าผืนละ 1 ชิ้น', 'Learn natural indigo dyeing. Easy DIY process, create 1 piece of fabric')}
                </p>
              </div>
              {workshop.learnings && workshop.learnings.length > 1 && (
                <ul className="space-y-2 text-sm text-gray-700 px-2">
                  {workshop.learnings.slice(1).map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </SectionCard>

          {/* Location */}
          <SectionCard
            icon={<MapPin className="h-5 w-5 text-red-500" />}
            title={ct('สถานที่', 'Location')}
          >
            <p className="text-sm text-gray-700 mb-2">{ct('โซน B ซอย 2 (บ้านจำกานฟ้า) ในชุมชนคาว', 'Zone B Soi 2 (Baan Jamkan Fah) in Loeng Him Kaw')}</p>
            <div className="w-full h-40 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
              {ct('[ Google Map Area ]', '[ Google Map Area ]')}
            </div>
          </SectionCard>
          
          {/* Contact Info */}
          <SectionCard
            icon={<Info className="h-5 w-5 text-blue-500" />}
            title={ct('ช่องทางติดต่อ', 'Contact Information')}
          >
            <p className="text-sm text-gray-700">
              {ct('Facebook : ตัวอย่างเพจร้านที่เปิดสอนงาน + เบอร์', 'Facebook: Sample shop page + phone number')}
            </p>
          </SectionCard>

          {/* Guest Count Selector */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">{ct('จำนวนที่นั่ง', 'Guests')}</p>
                <p className="text-xs text-gray-500">{ct('สูงสุดเท่ากับ', 'Max')} {workshop.seatsLeft} {ct('คน', 'people')}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDecrement}
                  disabled={guestCount <= 1}
                  className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-2xl font-bold text-gray-900 w-12 text-center">{guestCount}</span>
                <button
                  onClick={handleIncrement}
                  disabled={guestCount >= workshop.seatsLeft}
                  className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{ct('ค่าใช้จ่ายทั้งหมด', 'Total')}</p>
              <p className="text-2xl font-bold text-orange-600">
                {workshop.price === 0 ? t('workshops.free') : `฿${workshop.price * guestCount}`}
              </p>
            </div>
          </div>

          <button
            onClick={handleEnroll}
            className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-semibold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl"
          >
            {isAuthenticated ? ct('จองเลย', 'Book Now') : ct('เข้าสู่ระบบเพื่อจอง', 'Login to Book')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkshopModal;
