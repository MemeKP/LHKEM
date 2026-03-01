import { X, Calendar, Clock, MapPin, Users, Download, MessageCircle, Store, Phone, Facebook, Mail } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getShopById } from '../services/shopService';
import { useTranslation } from '../hooks/useTranslation';

/**
 * E-Ticket Modal - แสดงตั๋วอิเล็กทรอนิกส์หลังจากจองเวิร์กช็อปสำเร็จ
 * ใช้แสดงรายละเอียดการจอง และให้ผู้ใช้สามารถบันทึกภาพหรือติดต่อร้านค้า
 */

const ETicketModal = ({ booking, isOpen, onClose }) => {
  const { ct } = useTranslation();

  if (!isOpen || !booking) return null;

  const { workshop, guestCount, bookingDate } = booking;
  const [isContactPanelOpen, setIsContactPanelOpen] = useState(false);
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

  const workshopShopId = useMemo(() => {
    if (!workshop) return null;
    if (typeof workshop.shopId === 'string') return workshop.shopId;
    if (workshop?.shopId?._id) return workshop.shopId._id;
    if (workshop?.shop?._id) return workshop.shop._id;
    return workshop?.shopId || workshop?.shop?.id || null;
  }, [workshop]);

  const { data: shopResponse } = useQuery({
    queryKey: ['eticket-shop-detail', workshopShopId],
    queryFn: () => getShopById(workshopShopId),
    enabled: Boolean(workshopShopId),
    staleTime: 1000 * 60 * 5,
  });

  const derivedShop = useMemo(() => {
    if (shopResponse?.data) return shopResponse.data;
    if (shopResponse) return shopResponse;
    if (typeof workshop?.shopId === 'object') return workshop.shopId;
    return workshop?.shop || null;
  }, [shopResponse, workshop]);

  const resolvedShopName =
    derivedShop?.shopName ||
    workshop?.shopName ||
    workshop?.host ||
    ct('ไม่มีชื่อร้าน', 'No Shop');

  const resolvedLocation =
    workshop?.customLocation ||
    workshop?.location?.address ||
    workshop?.location ||
    derivedShop?.address ||
    derivedShop?.location?.address ||
    ct('ยังไม่ระบุสถานที่ กรุณาติดต่อร้านค้า', 'Location not provided, please contact the shop.');

  const handleContactShop = () => {
    setIsContactPanelOpen(true);
  };

  const contactInfo = useMemo(() => {
    const phone =
      derivedShop?.owner?.phone ||
      derivedShop?.contact?.phone ||
      derivedShop?.phone ||
      workshop?.shopPhone ||
      '-';
    const line = derivedShop?.contact?.line || workshop?.shopLine || '';
    const facebook = derivedShop?.contact?.facebook || workshop?.shopFacebook || '';
    const email =
      derivedShop?.owner?.email ||
      derivedShop?.contact?.email ||
      derivedShop?.email ||
      workshop?.shopEmail ||
      '';

    return {
      phone,
      line,
      facebook,
      email,
    };
  }, [derivedShop, workshop]);

  const hasContactDetail = useMemo(() => {
    return Object.values(contactInfo).some((value) => value && value !== '-' && value.trim?.());
  }, [contactInfo]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose} // Added: Clicking the dark background will call onClose
    >
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative animate-slideUp"
        onClick={(e) => e.stopPropagation()} // Added: Stops the background click from triggering when clicking inside the white modal
      >
        {/* Close Button (Top Right) */}
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
              {workshop?.title || ct('ไม่มีชื่อกิจกรรม', 'No Title')}
            </h3>
            <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
              <Store className="h-4 w-4" />
              {ct('โดยร้าน', 'By')} {resolvedShopName}
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
                <p className="text-xs text-gray-500 mb-1">{ct('วันที่จอง (Booking Date)', 'Booking Date')}</p>
                <p className="text-sm font-semibold text-gray-900">{formattedDate}</p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">{ct('เวลาที่จอง (Booking Time)', 'Booking Time')}</p>
                <p className="text-sm font-semibold text-gray-900">{formattedTime}</p>
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
          </div>

          {/* Location */}
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{ct('สถานที่', 'Location')}</p>
                <p className="text-sm text-gray-700">
                  {resolvedLocation}
                </p>
                {workshop?.shop?.address && !workshop?.customLocation && (
                  <p className="text-xs text-gray-500 mt-1">
                    {ct('อ้างอิงจากที่อยู่ร้าน', 'Using shop address as venue')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <p className="text-sm text-gray-600 text-center">
              {ct('กรุณาติดต่อทางร้านค้าเพื่อดำเนินการชำระเงิน', 'Please contact the shop to complete payment')}
            </p>

            <button
              onClick={handleContactShop}
              className="w-full flex items-center justify-center gap-2 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-semibold py-3.5 rounded-2xl transition"
            >
              <MessageCircle className="h-5 w-5" />
              {ct('ติดต่อร้านค้า', 'Contact Shop')}
            </button>

            {/* Added: Explicit Close Button at the bottom */}
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 font-semibold py-2 transition"
            >
              {ct('ปิด', 'Close')}
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
      {isContactPanelOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4" onClick={() => setIsContactPanelOpen(false)}>
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-gray-400">{ct('ช่องทางติดต่อร้านค้า', 'Shop contact info')}</p>
                <p className="text-lg font-semibold text-gray-900">{resolvedShopName}</p>
              </div>
              <button
                onClick={() => setIsContactPanelOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
                aria-label={ct('ปิด', 'Close')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {hasContactDetail ? (
              <div className="space-y-3">
                {contactInfo.phone && contactInfo.phone !== '-' && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 bg-gray-50">
                    <Phone className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs uppercase text-gray-400">{ct('โทรศัพท์', 'Phone')}</p>
                      <p className="text-sm font-semibold text-gray-900">{contactInfo.phone}</p>
                    </div>
                  </div>
                )}
                {contactInfo.line && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 bg-gray-50">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs uppercase text-gray-400">Line</p>
                      <p className="text-sm font-semibold text-gray-900">{contactInfo.line}</p>
                    </div>
                  </div>
                )}
                {contactInfo.facebook && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 bg-gray-50">
                    <Facebook className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs uppercase text-gray-400">Facebook</p>
                      <p className="text-sm font-semibold text-gray-900 break-all">{contactInfo.facebook}</p>
                    </div>
                  </div>
                )}
                {contactInfo.email && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 bg-gray-50">
                    <Mail className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="text-xs uppercase text-gray-400">Email</p>
                      <p className="text-sm font-semibold text-gray-900 break-all">{contactInfo.email}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-yellow-100 bg-yellow-50 text-sm text-yellow-800">
                {ct('ร้านค้ายังไม่ได้ระบุช่องทางติดต่อ กรุณาใช้หมายเลขโทรศัพท์หลักของชุมชน', 'No contact info provided. Please reach out via the main community channels.')}
              </div>
            )}

            <button
              onClick={() => setIsContactPanelOpen(false)}
              className="w-full mt-2 py-3 rounded-2xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
            >
              {ct('ปิดหน้าต่างนี้', 'Close panel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ETicketModal;