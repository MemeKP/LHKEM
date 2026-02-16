import { X, Calendar, Clock, MapPin, Users, Download, MessageCircle, Store } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

/**
 * E-Ticket Modal - แสดงตั๋วอิเล็กทรอนิกส์หลังจากจองเวิร์กช็อปสำเร็จ
 * ใช้แสดงรายละเอียดการจอง และให้ผู้ใช้สามารถบันทึกภาพหรือติดต่อร้านค้า
 */

const ETicketModal = ({ booking, isOpen, onClose }) => {
  const { ct } = useTranslation();

  if (!isOpen || !booking) return null;

  const { workshop, guestCount, bookingDate } = booking;
  const bookingDateObj = new Date(bookingDate);
  const formattedDate = bookingDateObj.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = bookingDateObj.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleSaveImage = () => {
    // TODO: Implement screenshot/download functionality
    alert(ct('กำลังบันทึกภาพ E-ticket...', 'Saving E-ticket image...'));
  };

  const handleContactShop = () => {
    // TODO: Implement contact shop functionality (open chat/phone)
    alert(ct('กำลังเปิดช่องทางติดต่อร้าน...', 'Opening shop contact...'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative animate-slideUp">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full text-gray-600 hover:text-gray-900 transition shadow-md"
          onClick={onClose}
          aria-label={ct('ปิด', 'Close')}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Orange Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-8 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
          <div className="relative">
            <h2 className="text-2xl font-bold mb-2">Workshop</h2>
            <div className="w-16 h-1 bg-white/50 mx-auto rounded-full"></div>
          </div>
        </div>

        {/* Ticket Content */}
        <div className="p-6 space-y-5">
          {/* Workshop Title */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {workshop.title}
            </h3>
            <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
              <Store className="h-4 w-4" />
              {ct('โดยร้าน', 'By')} {workshop.host}
            </p>
          </div>

          {/* Booking Details */}
          <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
            {/* Date */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">{ct('วันที่ (Date)', 'Date')}</p>
                <p className="text-sm font-semibold text-gray-900">{ct('อาทิตย์, 19 ม.ค. 69', 'Sunday, Jan 19, 2026')}</p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">{ct('เวลา (Time)', 'Time')}</p>
                <p className="text-sm font-semibold text-gray-900">{ct('10:00 - 11:30 น.', '10:00 - 11:30')}</p>
              </div>
            </div>

            {/* Guests */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">{ct('จำนวน (Guests)', 'Guests')}</p>
                <p className="text-sm font-semibold text-gray-900">
                  {guestCount} {ct('ท่าน', 'person(s)')}
                </p>
              </div>
            </div>

            {/* Total Price */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="h-5 w-5 flex items-center justify-center">
                  <span className="text-orange-600 font-bold">฿</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">{ct('ค่าใช้จ่ายทั้งหมด', 'Total')}</p>
                <p className="text-lg font-bold text-orange-600">
                  {ct('ค่าเข้าชมฟรี', 'Free')} {guestCount} {ct('ท่าน', 'person(s)')}
                </p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{ct('สถานที่', 'Location')}</p>
                <p className="text-sm text-gray-700">
                  {ct('โซน B ซอย 2', 'Zone B Soi 2')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {ct('(บ้านจำกานฟ้า) ในชุมชนคาว', '(Baan Jamkan Fah) in Loeng Him Kaw')}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleSaveImage}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 rounded-2xl transition shadow-lg"
            >
              <Download className="h-5 w-5" />
              {ct('บันทึกภาพ (Save Ticket)', 'Save Ticket')}
            </button>
            
            <button
              onClick={handleContactShop}
              className="w-full flex items-center justify-center gap-2 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-semibold py-3.5 rounded-2xl transition"
            >
              <MessageCircle className="h-5 w-5" />
              {ct('ติดต่อร้านค้า', 'Contact Shop')}
            </button>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              {ct('กรุณานำ E-ticket นี้มาแสดงในวันเข้าร่วมกิจกรรม', 'Please present this E-ticket on the workshop day')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ETicketModal;
