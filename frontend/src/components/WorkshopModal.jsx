import { MapPin, X, Calendar, Clock, BookOpen, AlertCircle, Info, Store, Users, Minus, Plus, Phone, MessageCircle, Facebook, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';

import { workshopService } from '../services/workshopService';
import { getShopById } from '../services/shopService';
import { resolveImageUrl } from '../utils/image';
import { useQuery } from '@tanstack/react-query';
import { formatNumericDate } from '../utils/dateFormatter';

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

  const workshopImage = useMemo(() => {
    return resolveImageUrl(
      workshop?.image ||
      workshop?.imageUrl ||
      workshop?.coverImage ||
      (Array.isArray(workshop?.images) ? workshop.images[0] : null)
    );
  }, [workshop]);

  const workshopShopId = useMemo(() => {
    if (typeof workshop?.shopId === 'string') return workshop.shopId;
    if (workshop?.shopId?._id) return workshop.shopId._id;
    if (workshop?.shop?._id) return workshop.shop._id;
    return workshop?.shopId || workshop?.shop?._id || workshop?.shopId?._id || null;
  }, [workshop]);

  const { data: shopData } = useQuery({
    queryKey: ['workshop-shop-detail', workshopShopId],
    queryFn: () => getShopById(workshopShopId),
    enabled: !!workshopShopId,
    staleTime: 1000 * 60 * 5,
  });

  const derivedShop = useMemo(() => {
    if (shopData?.data) return shopData.data;
    if (shopData) return shopData;
    if (typeof workshop?.shopId === 'object') return workshop.shopId;
    return workshop?.shop || null;
  }, [shopData, workshop]);

  const ownerDisplayName = useMemo(() => {
    const owner = derivedShop?.owner || workshop?.shopOwner || {};

    const stitchedNames = [
      [owner?.firstname, owner?.lastname],
      [owner?.firstName, owner?.lastName],
      [owner?.givenName, owner?.familyName],
      [workshop?.shopOwner?.firstname, workshop?.shopOwner?.lastname],
      [workshop?.shopOwner?.firstName, workshop?.shopOwner?.lastName],
    ]
      .map((pair) => pair.filter(Boolean).join(' ').trim())
      .filter((value) => Boolean(value && value.length));

    const otherCandidates = [
      owner?.name,
      derivedShop?.ownerName,
      derivedShop?.contactName,
      workshop?.shopOwnerName,
      workshop?.shopOwnerFullName,
    ].filter(Boolean);

    return stitchedNames[0] || otherCandidates[0] || ct('ไม่ระบุ', 'N/A');
  }, [derivedShop, workshop, ct]);

  const ownerInfo = useMemo(() => {
    return {
      name: ownerDisplayName,
      phone: derivedShop?.owner?.phone || derivedShop?.contact?.phone || derivedShop?.phone || workshop?.shopPhone || '-',
      email: derivedShop?.owner?.email || derivedShop?.contact?.email || derivedShop?.email || workshop?.shopEmail || '-',
      line: derivedShop?.contact?.line,
      facebook: derivedShop?.contact?.facebook,
    };
  }, [derivedShop, workshop, ownerDisplayName]);

  const formattedTimeRange = useMemo(() => {
    if (!workshop?.startTime && !workshop?.endTime && !workshop?.time) {
      return ct('โปรดตรวจสอบกับร้านค้า', 'Check with shop');
    }
    if (workshop?.time) return workshop.time;
    return `${workshop?.startTime || '--:--'} - ${workshop?.endTime || '--:--'}`;
  }, [workshop, ct]);

  const resolvedWorkshopDate = useMemo(() => {
    return (
      workshop?.workshopDate ||
      workshop?.date ||
      workshop?.startDate ||
      workshop?.endDate ||
      null
    );
  }, [workshop]);

  const formattedWorkshopDate = useMemo(() => {
    if (!resolvedWorkshopDate) {
      return ct('โปรดตรวจสอบกับร้านค้า', 'Check with shop');
    }
    const formatted = formatNumericDate(resolvedWorkshopDate);
    if (formatted === '-') {
      return ct('โปรดตรวจสอบกับร้านค้า', 'Check with shop');
    }
    return formatted;
  }, [resolvedWorkshopDate, ct]);

  const registrationStartDate = workshop?.startDate || workshop?.registrationStartDate;
  const registrationEndDate = workshop?.endDate || workshop?.registrationEndDate;

  const formattedRegistrationWindow = useMemo(() => {
    const start = registrationStartDate ? formatNumericDate(registrationStartDate) : null;
    const end = registrationEndDate ? formatNumericDate(registrationEndDate) : null;

    if (!start && !end) {
      return ct('โปรดตรวจสอบช่วงรับสมัครกับร้านค้าโดยตรง', 'Please confirm the registration window with the shop.');
    }

    if (start && end) {
      return `${start} - ${end}`;
    }

    return start || end || ct('โปรดตรวจสอบช่วงรับสมัครกับร้านค้าโดยตรง', 'Please confirm the registration window with the shop.');
  }, [workshop, ct]);

  const registrationEndDateObj = useMemo(() => {
    if (!registrationEndDate) return null;
    const parsed = new Date(registrationEndDate);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed;
  }, [registrationEndDate]);

  const shopHoursInfo = useMemo(() => {
    const open = derivedShop?.openTime?.trim();
    const close = derivedShop?.closeTime?.trim();
    const hasHours = Boolean(open || close);
    return {
      hasHours,
      label: hasHours
        ? `${open || '--:--'} - ${close || '--:--'}`
        : ct('โปรดตรวจสอบเวลาทำการกับร้านค้าโดยตรง', 'Please check opening hours with the shop directly.'),
    };
  }, [derivedShop, ct]);

  const normalizedUserRole = typeof user?.role === 'string' ? user.role.toUpperCase() : null;
  const isTourist = normalizedUserRole === 'TOURIST';
  const isNonTouristAuthenticated = isAuthenticated && !isTourist;

  // 1. Calculate seats
  // ลูกค้ามองเห็นที่นั่งว่าง = capacity - confirmed (ไม่รวม pending เพราะยังไม่แน่ว่าจะ confirm)
  const capacity = workshop?.capacity || workshop?.seatLimit || 0;
  const confirmedSeats = workshop?.current_participants || workshop?.seatsBooked || 0;
  const pendingSeats = Math.max(0, workshop?.pendingRegistrationSeat || 0);
  const availableSeats = Math.max(0, capacity - confirmedSeats);

  // 2. Registration status checks
  const isRegistrationStatusOpen = String(workshop?.registrationStatus || 'OPEN').toUpperCase() === 'OPEN';

  const isRegistrationClosed = useMemo(() => {
    if (!isRegistrationStatusOpen) return true; // If status is not OPEN, it is closed
    if (!registrationEndDateObj) return false;  // If there's no end date, relies purely on status
    
    const endOfDay = new Date(registrationEndDateObj);
    endOfDay.setHours(23, 59, 59, 999);
    return Date.now() > endOfDay.getTime(); // If today is past the end date, it is closed
  }, [registrationEndDateObj, isRegistrationStatusOpen]);

  // 3. Functions that rely on availableSeats
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

  useEffect(() => {
    setGuestCount((prev) => {
      const safeMax = Math.max(availableSeats, 1);
      return Math.min(prev, safeMax);
    });
  }, [availableSeats]);

  const isSeatRequestInvalid = availableSeats <= 0 || guestCount > availableSeats;

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      onClose();
      navigate('/login', { state: { from: `/workshops`, workshopId: workshop?._id || workshop?.id } });
      return;
    }

    if (!isTourist) {
      setSubmitError(ct('สิทธิ์การจองจำกัดเฉพาะบัญชีนักท่องเที่ยวเท่านั้น', 'Only tourist accounts can place bookings.'));
      return;
    }

    if (isRegistrationClosed) {
      setSubmitError(ct('เกินวันปิดรับสมัครแล้ว ไม่สามารถจองได้', 'Registration for this workshop is closed.'));
      return;
    }

    if (isSeatRequestInvalid) {
      setSubmitError(ct('มีที่นั่งไม่เพียงพอสำหรับจำนวนที่เลือก', 'Not enough seats are available for your selection.'));
      return;
    }

    // SweetAlert ยืนยันก่อนจอง
    const totalPrice = workshop.price === 0 ? ct('ฟรี', 'Free') : `฿${workshop.price * guestCount}`;
    const confirm = await Swal.fire({
      icon: 'question',
      title: ct('ยืนยันการจอง', 'Confirm Booking'),
      html: `
        <div style="text-align:left; font-size:14px; line-height:1.7">
          <p><b>${ct('Workshop:', 'Workshop:')}</b> ${workshop.title}</p>
          <p><b>${ct('จำนวนที่นั่ง:', 'Seats:')}</b> ${guestCount} ${ct('ที่', 'seat(s)')}</p>
          <p><b>${ct('ค่าใช้จ่ายรวม:', 'Total:')}</b> ${totalPrice}</p>
          <p style="color:#f97316; font-size:12px; margin-top:8px">${ct('⚠️ การจองต้องรอการยืนยันจากทางร้านค้าก่อน', '⚠️ Booking requires shop owner confirmation.')}</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: ct('ยืนยันและจอง', 'Confirm & Book'),
      cancelButtonText: ct('ยกเลิก', 'Cancel'),
      confirmButtonColor: '#f97316',
    });

    if (!confirm.isConfirmed) return;
    
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
      const backendError = error.response?.data?.message || error.message || ct('เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ', 'An unknown error occurred');
      console.error('Registration error:', error.response?.data || error);
      
      await Swal.fire({
        icon: 'error',
        title: ct('การจองไม่สำเร็จ', 'Booking Failed'),
        text: typeof backendError === 'string'
          ? backendError
          : ct('ไม่สามารถทำการจองได้ กรุณาลองใหม่อีกครั้ง', 'Could not complete booking. Please try again.'),
        confirmButtonColor: '#f97316',
      });
      setSubmitError(typeof backendError === 'string' ? backendError : ct('ไม่สามารถทำการจองได้', 'Booking failed.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isOpen) setGuestCount(1);
  }, [isOpen, workshop?._id]);

  if (!isOpen || !workshop) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pt-20 sm:p-6 sm:pt-24 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white w-full max-w-2xl max-h-[85vh] flex flex-col rounded-[32px] shadow-2xl relative animate-slideUp overflow-hidden my-auto">
        <button
          className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-all z-10"
          onClick={onClose}
          aria-label={t('common.close') || ct('ปิด', 'Close')}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 space-y-5 overflow-y-auto flex-1 animate-stagger scrollbar-hide">
          {/* Header */}
          <div className="rounded-[28px] border border-gray-100 bg-white shadow-sm p-5 space-y-4">
            {workshopImage && (
              <div className="h-48 rounded-2xl overflow-hidden relative">
                <img src={workshopImage} alt={workshop.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
            )}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 leading-snug mb-2">{workshop.title}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Store className="h-4 w-4" />
                {ct('โดยร้าน', 'By')} {derivedShop?.shopName || workshop.host || workshop.shopName || ct('ไม่ระบุร้านค้า', 'Unknown Shop')}
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="text-left">
                <p className="text-3xl font-bold text-orange-500">
                  {workshop.price === 0 ? (t('workshops.free') || ct('ฟรี', 'Free')) : `${workshop.price}.-`}
                </p>
                <p className="text-xs text-gray-500">{ct('ต่อคน', 'per person')}</p>
              </div>
              <div className="text-right space-y-1">
                <span className={`text-xs font-medium px-3 py-1 rounded-full inline-flex items-center gap-1 ${
                  availableSeats <= 0 ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                }`}>
                  {availableSeats <= 0 ? ct('ที่นั่งเต็มแล้ว', 'Fully Booked') : `${ct('ที่นั่งว่าง', 'Seats left')} ${availableSeats}`}
                </span>
                {pendingSeats > 0 && (
                  <p className="text-xs text-yellow-600 flex items-center gap-1 justify-end">
                    <AlertCircle className="h-3 w-3" />
                    {ct('รอยืนยัน', 'Pending confirmation')}: {pendingSeats}
                  </p>
                )}
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
                  <p className="text-gray-600">{formattedWorkshopDate}</p>
                  <p className="text-gray-400 text-sm">{formattedTimeRange}</p>
                </div>
              )}

              <div className="rounded-2xl border border-blue-100 bg-white p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{ct('วันที่จัดกิจกรรม', 'Event date')}</p>
                <p className="text-base font-semibold text-gray-900">{formattedWorkshopDate}</p>
                <p className="text-xs text-gray-500 mt-1">{ct('ช่วงเวลา', 'Time')} : {formattedTimeRange}</p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{ct('ช่วงรับสมัคร', 'Registration window')}</p>
                <p className="text-base font-semibold text-gray-900">{formattedRegistrationWindow}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={<BookOpen className="h-5 w-5 text-indigo-500" />}
            title={ct('เกี่ยวกับ Workshop', 'About this Workshop')}
          >
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line wrap-break-word max-h-48 overflow-y-auto scrollbar-thin w-full">
              {workshop.description || ct('กิจกรรมสนุกที่รอให้คุณมาสัมผัส', 'An immersive experience awaits you.')}
            </p>
            {Array.isArray(workshop.requirements) && workshop.requirements.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-500 mb-2">{ct('สิ่งที่ควรเตรียมมา', 'Bring along')}</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  {workshop.requirements.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </SectionCard>

          {/* Time Slots */}
          <SectionCard
            icon={<Clock className="h-5 w-5 text-green-600" />}
            title={ct('เวลาทำการของร้าน', 'Shop Opening Hours')}
          >
            <div className="rounded-2xl border p-4 bg-white border-gray-100">
              <p className="text-sm font-semibold text-gray-900">{ct('เวลาเปิดทำการ', 'Opening hours')}</p>
              <p className="text-gray-700 mt-1">{shopHoursInfo.label}</p>
              {!shopHoursInfo.hasHours && (
                <p className="text-xs text-gray-500 mt-2">{ct('ยังไม่มีข้อมูลเวลาเปิด-ปิด โปรดติดต่อร้านโดยตรง', 'No opening hours provided yet. Please contact the shop directly.')}</p>
              )}
            </div>
          </SectionCard>

          {/* Location */}
          <SectionCard
            icon={<MapPin className="h-5 w-5 text-red-500" />}
            title={ct('สถานที่', 'Location')}
          >
            <p className="text-sm text-gray-700 mb-2 whitespace-pre-line wrap-break-word max-h-24 overflow-y-auto scrollbar-thin w-full">{workshop.customLocation || workshop.location?.address || workshop.location || ct('ใช้สถานที่ร้าน', 'Shop location')}</p>
          </SectionCard>
          
          {/* Shop & Contact Info */}
          <SectionCard
            icon={<Info className="h-5 w-5 text-blue-500" />}
            title={ct('ช่องทางติดต่อ', 'Contact Information')}
          >
            <div className="space-y-4 text-sm text-gray-700">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
                <p className="text-base font-semibold text-gray-900">{derivedShop?.shopName || ct('ไม่ระบุร้านค้า', 'Unknown Shop')}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {ct('เจ้าของร้าน', 'Shop owner')}: <span className="font-semibold text-gray-900">{ownerInfo.name || ct('ไม่ระบุ', 'N/A')}</span>
                </p>
                {derivedShop?.description && <p className="text-gray-600 mt-1 whitespace-pre-line wrap-break-word max-h-48 overflow-y-auto scrollbar-thin w-full">{derivedShop.description}</p>}
                <div className="flex items-start gap-2 text-gray-600 mt-3">
                  <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                  <span className="whitespace-pre-line wrap-break-word max-h-24 overflow-y-auto scrollbar-thin w-full">
                    {derivedShop?.address ||
                      derivedShop?.location?.address ||
                      workshop.customLocation ||
                      workshop.location ||
                      ct('ใช้สถานที่ร้าน', 'Shop location')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ownerInfo.phone && ownerInfo.phone !== '-' && (
                  <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
                    <Phone className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs uppercase text-gray-400">{ct('โทรศัพท์', 'Phone')}</p>
                      <p className="font-semibold text-gray-900">{ownerInfo.phone}</p>
                    </div>
                  </div>
                )}
                {ownerInfo.line && (
                  <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs uppercase text-gray-400">Line</p>
                      <p className="font-semibold text-gray-900">{ownerInfo.line}</p>
                    </div>
                  </div>
                )}
                {ownerInfo.facebook && (
                  <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
                    <Facebook className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs uppercase text-gray-400">Facebook</p>
                      <p className="font-semibold text-gray-900 break-all">{ownerInfo.facebook}</p>
                    </div>
                  </div>
                )}
                {ownerInfo.email && ownerInfo.email !== '-' && (
                  <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
                    <Mail className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="text-xs uppercase text-gray-400">Email</p>
                      <p className="font-semibold text-gray-900 break-all">{ownerInfo.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
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

          {isNonTouristAuthenticated && (
            <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-xl text-sm border border-yellow-100">
              {ct('บัญชีประเภทนี้มีไว้เพื่อจัดการระบบ จึงไม่สามารถจองกิจกรรมได้ กรุณาใช้บัญชีนักท่องเที่ยวเพื่อทำการจอง', 'This account type is for management only. Please use a tourist account to book workshops.')}
            </div>
          )}

          {submitError && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
              {submitError}
            </div>
          )}

          <button
            onClick={handleEnroll}
            disabled={
              isSubmitting ||
              isSeatRequestInvalid ||
              isNonTouristAuthenticated ||
              isRegistrationClosed
            } 
            className={`w-full font-semibold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl ${
              isSubmitting || isSeatRequestInvalid || isNonTouristAuthenticated || isRegistrationClosed
                ? 'bg-gray-400 cursor-not-allowed text-white' 
                : 'bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white'
            }`}
          >
            {isSubmitting 
              ? ct('กำลังดำเนินการ...', 'Processing...') 
              : isRegistrationClosed
                ? (!isRegistrationStatusOpen ? ct('ปิดรับสมัคร', 'Closed') : ct('ปิดรับสมัครแล้ว (เลยกำหนดการ)', 'Registration closed (Past Date)'))
                : isSeatRequestInvalid
                  ? (availableSeats <= 0
                      ? ct('เต็มแล้ว', 'Full')
                      : ct('ที่นั่งไม่พอ', 'Not enough seats'))
                  : isAuthenticated 
                    ? isTourist
                      ? ct('จองเลย', 'Book Now')
                      : ct('สงวนสิทธิ์สำหรับนักท่องเที่ยว', 'Tourist accounts only')
                    : ct('เข้าสู่ระบบเพื่อจอง', 'Login to Book')
            }
          </button>
          {(isRegistrationClosed || isSeatRequestInvalid) && (
            <p className="mt-2 text-center text-xs text-red-600">
              {isRegistrationClosed
                ? ct('เกินวันปิดรับสมัครแล้ว ไม่สามารถจองได้', 'Bookings are closed because the registration deadline has passed.')
                : ct('มีที่นั่งไม่เพียงพอสำหรับจำนวนที่เลือก', 'Not enough seats are available for the selected guest count.')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkshopModal;