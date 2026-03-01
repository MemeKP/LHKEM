import { MapPin, X, Calendar, Clock, BookOpen, AlertCircle, Info, Store, Users, Minus, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';
import { workshopService } from '../services/workshopService';

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
  const { isAuthenticated, user } = useAuth(); 
  const navigate = useNavigate();
  const [guestCount, setGuestCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // FIX: Properly calculate seats using real backend variables
  const capacity = workshop?.capacity || workshop?.seatLimit || 0;
  const booked = workshop?.current_participants || workshop?.seatsBooked || 0;
  const availableSeats = Math.max(0, capacity - booked);

  const handleIncrement = () => {
    if (guestCount < availableSeats) {
      setGuestCount(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (guestCount > 1) {
      setGuestCount(prev => prev - 1);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      onClose();
      navigate('/login', { state: { from: `/workshops`, workshopId: workshop?._id || workshop?.id } });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const registrationPayload = {
        workshopId: String(workshop?._id || workshop?.id), 
        userId: String(user?.userId || user?._id || user?.id), 
        slots: guestCount, 
        note: ""
      };
      
      const response = await workshopService.registerForWorkshop(registrationPayload);
      
      const formattedBooking = {
        id: response._id || response.id, 
        workshop: workshop,              
        guestCount: guestCount,          
        bookingDate: new Date().toISOString(),
        status: response.status || 'pending'
      };
      
      onClose();
      if (onBookingSuccess) {
        onBookingSuccess(formattedBooking);
      }

    } catch (error) {
      const backendError = error.response?.data?.message || error.response?.data || error.message;
      alert(`${ct('ระบบปฏิเสธข้อมูลเนื่องจาก:\n\n', 'Backend rejected the data because:\n\n')}${JSON.stringify(backendError, null, 2)}`);
      console.error('Registration error:', error.response?.data || error);
      
      setSubmitError(ct('ไม่สามารถทำการจองได้ กรุณาลองใหม่อีกครั้ง', 'Could not complete booking. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isOpen) setGuestCount(1);
  }, [isOpen, workshop?._id]);

  if (!isOpen || !workshop) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden relative animate-slideUp">
        <button
          className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600 transition"
          onClick={onClose}
          aria-label={t('common.close') || ct('ปิด', 'Close')}
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
                {ct('โดยร้าน', 'By')} {workshop.host || workshop.shopName || ct('ไม่ระบุ', 'Unknown')}
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="text-left">
                <p className="text-3xl font-bold text-orange-500">
                  {workshop.price === 0 ? (t('workshops.free') || ct('ฟรี', 'Free')) : `${workshop.price}.-`}
                </p>
                <p className="text-xs text-gray-400">{ct('ต่อคน', 'per person')}</p>
              </div>
              <div className="text-right space-y-1">
                {/* FIX: Actually use availableSeats here */}
                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full inline-block">
                  {ct('ที่นั่งคงเหลือ', 'Seats left')} {availableSeats}
                </span>
                <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                  <Clock className="h-3 w-3" /> {workshop.duration || workshop.time || `${workshop.startTime} - ${workshop.endTime}`}
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
                  <p className="text-gray-600">{workshop.date || workshop.startDate ? new Date(workshop.date || workshop.startDate).toLocaleDateString('th-TH') : ct('โปรดตรวจสอบกับร้านค้า', 'Check with shop')}</p>
                  <p className="text-gray-400 text-sm">{workshop.time || `${workshop.startTime} - ${workshop.endTime}` || ct('โปรดตรวจสอบกับร้านค้า', 'Check with shop')}</p>
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
              <p className="text-gray-700">{ct('โปรดตรวจสอบเวลาทำการกับร้านค้าโดยตรง', 'Please check opening hours with the shop directly.')}</p>
            </div>
          </SectionCard>

          {/* What You'll Learn */}
          <SectionCard
            icon={<BookOpen className="h-5 w-5 text-orange-500" />}
            title={ct('สิ่งที่ได้เรียนรู้', 'What You\'ll Learn')}
          >
            <div className="space-y-2">
              <div className="px-4 py-3 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-700">
                  {workshop.learnings && workshop.learnings.length > 0 ? workshop.learnings[0] : workshop.description || ct('มาร่วมสนุกและเรียนรู้ไปด้วยกัน', 'Come join the fun and learn together.')}
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
            <p className="text-sm text-gray-700 mb-2">{workshop.customLocation || workshop.location?.address || workshop.location || ct('ใช้สถานที่ร้าน', 'Shop location')}</p>
          </SectionCard>
          
          {/* Contact Info */}
          <SectionCard
            icon={<Info className="h-5 w-5 text-blue-500" />}
            title={ct('ช่องทางติดต่อ', 'Contact Information')}
          >
            <p className="text-sm text-gray-700">
              {workshop.contactInfo || ct('โปรดติดต่อผ่านแพลตฟอร์มหรือร้านค้าโดยตรง', 'Please contact via platform or directly with the shop')}
            </p>
          </SectionCard>

          {/* Guest Count Selector */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">{ct('จำนวนที่นั่ง', 'Guests')}</p>
                {/* FIX: Actually use availableSeats here */}
                <p className="text-xs text-gray-500">{ct('สูงสุดเท่ากับ', 'Max')} {availableSeats} {ct('คน', 'people')}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={guestCount <= 1}
                  className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 transition"
                >
                  <Minus className="h-4 w-4" />
                </button>
                
                <span className="text-2xl font-bold text-gray-900 w-12 text-center">{guestCount}</span>
                
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={guestCount >= availableSeats}
                  className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 transition"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{ct('ค่าใช้จ่ายทั้งหมด', 'Total')}</p>
              <p className="text-2xl font-bold text-orange-600">
                {workshop.price === 0 ? (t('workshops.free') || ct('ฟรี', 'Free')) : `฿${workshop.price * guestCount}`}
              </p>
            </div>
          </div>

          {submitError && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
              {submitError}
            </div>
          )}

          <button
            onClick={handleEnroll}
            disabled={isSubmitting || availableSeats <= 0} 
            className={`w-full font-semibold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl ${
              isSubmitting || availableSeats <= 0
                ? 'bg-gray-400 cursor-not-allowed text-white' 
                : 'bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white'
            }`}
          >
            {isSubmitting 
              ? ct('กำลังดำเนินการ...', 'Processing...') 
              : availableSeats <= 0 
                ? ct('เต็มแล้ว', 'Full')
                : isAuthenticated 
                  ? ct('จองเลย', 'Book Now') 
                  : ct('เข้าสู่ระบบเพื่อจอง', 'Login to Book')
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkshopModal;