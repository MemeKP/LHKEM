import { useMemo } from 'react';
import Swal from 'sweetalert2';
import { X, Calendar, Clock, MapPin, Store, Users, Ticket, AlertCircle, CheckCircle, XCircle, Trash2 } from 'lucide-react';

import { useTranslation } from '../hooks/useTranslation';
import { formatNumericDate, formatNumericDateTime } from '../utils/dateFormatter';

const fallbackWorkshopImage = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80';

const statusConfig = {
  confirmed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  active: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  completed: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: CheckCircle },
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertCircle },
  cancelled: { bg: 'bg-rose-100', text: 'text-rose-700', icon: XCircle },
  cancel: { bg: 'bg-rose-100', text: 'text-rose-700', icon: XCircle },
  rejected: { bg: 'bg-rose-100', text: 'text-rose-700', icon: XCircle },
};

const formatTime = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return typeof value === 'string' ? value : null;
  }
  return date.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getWorkshopFromEnrollment = (enrollment) => {
  if (!enrollment) return null;
  if (enrollment.workshop) return enrollment.workshop;
  const candidate = enrollment.workshopId;
  return candidate && typeof candidate === 'object' ? candidate : null;
};

const BookingDetailModal = ({
  enrollment,
  isOpen,
  onClose,
  onViewETicket,
  onRemoveEnrollment,
  isRemovingEnrollment = false,
  onCancelEnrollment,
  isCancellingEnrollment = false,
  canUserCancel = false,
}) => {
  const { t, ct } = useTranslation();

  const workshop = useMemo(() => getWorkshopFromEnrollment(enrollment), [enrollment]);
  const statusKey = useMemo(() => (enrollment?.status || 'pending').toLowerCase(), [enrollment]);
  const status = statusConfig[statusKey] || statusConfig.pending;
  const isRemovable = ['rejected', 'cancelled', 'cancel'].includes(statusKey);
  const StatusIcon = status.icon;

  const statusDisplayLabel = useMemo(() => {
    const specialLabels = {
      cancel: ct('ยกเลิกการจองโดยคุณ', 'Cancelled by you'),
      cancelled: ct('ยกเลิกโดยร้านค้า', 'Cancelled by shop'),
      rejected: ct('ร้านค้าปฏิเสธการจอง', 'Booking rejected'),
    };

    if (specialLabels[statusKey]) {
      return specialLabels[statusKey];
    }

    const translated = t(`dashboard.status.${statusKey}`);
    if (translated && translated !== `dashboard.status.${statusKey}`) {
      return translated;
    }

    const fallbackLabels = {
      confirmed: ct('ยืนยันแล้ว', 'Confirmed'),
      active: ct('ยืนยันแล้ว', 'Confirmed'),
      pending: ct('รอการยืนยัน', 'Pending'),
      completed: ct('เสร็จสิ้น', 'Completed'),
    };

    return fallbackLabels[statusKey] || statusKey;
  }, [statusKey, t, ct]);

  const workshopImage = useMemo(() => {
    if (!workshop) return fallbackWorkshopImage;
    return (
      workshop.image ||
      workshop.coverImage ||
      workshop.heroImage ||
      (Array.isArray(workshop.images) && workshop.images[0]) ||
      fallbackWorkshopImage
    );
  }, [workshop]);

  const dateValue = useMemo(() => {
    if (!workshop && !enrollment) return null;
    return (
      workshop?.date ||
      workshop?.startDate ||
      workshop?.schedule?.start ||
      enrollment?.workshopDate ||
      enrollment?.date ||
      null
    );
  }, [workshop, enrollment]);

  const timeRange = useMemo(() => {
    if (!workshop) return '-';
    const start = formatTime(workshop.startTime || workshop.startDate || workshop.schedule?.start);
    const end = formatTime(workshop.endTime || workshop.endDate || workshop.schedule?.end);
    if (start && end) return `${start} - ${end}`;
    return start || end || '-';
  }, [workshop]);

  const reservedSeats = useMemo(() => (
    enrollment?.slots ||
    enrollment?.participants ||
    enrollment?.ticketCount ||
    enrollment?.quantity ||
    1
  ), [enrollment]);

  const capacity = useMemo(() => (
    workshop?.capacity ||
    workshop?.maxParticipants ||
    workshop?.maxSeats ||
    workshop?.limit ||
    null
  ), [workshop]);

  const handleModalCancel = async () => {
    if (!onCancelEnrollment) return;
    const result = await Swal.fire({
      icon: 'question',
      title: ct('ยืนยันการยกเลิกการจอง?', 'Cancel this booking?'),
      text: ct('ต้องการยกเลิกการจองนี้หรือไม่? กรุณาติดต่อร้านค้าเพื่อยืนยันการคืนเงิน', 'Do you want to cancel this booking? Please contact the shop to confirm refunds.'),
      showCancelButton: true,
      confirmButtonText: ct('ยืนยันการยกเลิก', 'Confirm cancellation'),
      cancelButtonText: ct('ย้อนกลับ', 'Go back'),
      reverseButtons: true,
      focusCancel: true,
    });
    if (!result.isConfirmed) return;
    onCancelEnrollment(enrollment, { skipConfirm: true });
  };

  const handleModalRemove = async () => {
    if (!onRemoveEnrollment) return;
    const result = await Swal.fire({
      icon: 'warning',
      title: ct('ยืนยันการลบการจอง?', 'Remove this booking?'),
      text: ct('โปรดตรวจสอบการคืนเงินให้เรียบร้อยก่อนออกจากการลงทะเบียนนี้ หากดำเนินการคืนเงินเสร็จแล้ว สามารถลบการจองนี้ได้เลย', 'Please make sure your refund is confirmed before leaving this registration. If the refund is complete you may remove this booking.'),
      showCancelButton: true,
      confirmButtonText: ct('ยืนยันการลบ', 'Remove booking'),
      cancelButtonText: ct('ย้อนกลับ', 'Go back'),
      reverseButtons: true,
      focusCancel: true,
    });
    if (!result.isConfirmed) return;
    onRemoveEnrollment(enrollment, { skipConfirm: true });
  };

  if (!isOpen || !enrollment) {
    return null;
  }

  const canViewTicket = ['confirmed', 'active'].includes(statusKey);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 py-8 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-[32px] shadow-2xl overflow-hidden relative animate-slideUp">
        <button
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition"
          onClick={onClose}
          aria-label={t('common.close') || ct('ปิด', 'Close')}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="max-h-[85vh] overflow-y-auto">
          <div className="h-56 relative">
            <img src={workshopImage} alt={workshop?.title || 'Workshop cover'} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-5 left-6 right-6 flex flex-col gap-2 text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur">
                <StatusIcon className="h-4 w-4" />
                <span>{statusDisplayLabel}</span>
              </div>
              <h2 className="text-2xl font-semibold leading-snug">{workshop?.title || enrollment?.workshopTitle || ct('ไม่มีชื่อเวิร์กช็อป', 'Untitled Workshop')}</h2>
              <p className="text-sm text-white/80 flex items-center gap-2">
                <Store className="h-4 w-4" />
                {workshop?.shop?.shopName || workshop?.shopName || ct('ไม่ทราบผู้จัด', 'Unknown host')}
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-3xl border border-gray-100 bg-gray-50 p-4 space-y-2">
                <p className="text-xs uppercase text-gray-500 tracking-wide">{ct('วันที่จัดกิจกรรม', 'Event date')}</p>
                <p className="text-base font-semibold text-gray-900">{formatNumericDate(dateValue)}</p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span>{timeRange}</span>
                </p>
              </div>
              <div className="rounded-3xl border border-gray-100 bg-white p-4 space-y-2">
                <p className="text-xs uppercase text-gray-500 tracking-wide">{ct('สถานที่', 'Location')}</p>
                <p className="text-sm text-gray-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-rose-600" />
                  <span className="line-clamp-2">
                    {workshop?.location?.customLocation ||
                      workshop?.location?.address ||
                      workshop?.customLocation ||
                      workshop?.locationName ||
                      workshop?.shop?.address ||
                      ct('ไม่พบสถานที่', 'Location not specified')}
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-5 space-y-4">
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                {ct('รายละเอียดการจอง', 'Booking details')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p className="text-xs uppercase text-gray-400">{ct('จำนวนที่จอง', 'Seats booked')}</p>
                  <p className="text-base font-semibold text-gray-900">
                    {reservedSeats}
                    {capacity ? ` / ${capacity}` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-400">{ct('วันที่จอง', 'Booked on')}</p>
                  <p className="text-base font-semibold text-gray-900">{formatNumericDateTime(enrollment?.createdAt || enrollment?.enrollmentDate)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-400">{ct('ราคารวม', 'Total price')}</p>
                  <p className="text-base font-semibold text-gray-900">฿{(enrollment?.totalPrice || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-400">{ct('รหัสการจอง', 'Booking ID')}</p>
                  <p className="text-base font-semibold text-gray-900">{enrollment?._id || enrollment?.id || '-'}</p>
                </div>
              </div>
            </div>

            {statusKey === 'cancel' && (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 flex gap-3 items-start">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div className="text-sm text-amber-900">
                  {ct('คุณได้ยกเลิกการเข้าร่วมแล้ว กรุณาติดต่อร้านค้าเพื่อยืนยันการคืนเงิน', 'You have cancelled this booking. Please contact the shop to confirm refunds.')}
                </div>
              </div>
            )}

            {workshop?.description && (
              <div className="rounded-3xl border border-gray-100 bg-gray-50 p-5">
                <p className="text-sm font-semibold text-gray-900 mb-2">{ct('รายละเอียดเวิร์กช็อป', 'Workshop description')}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{workshop.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text}`}>
            <StatusIcon className="h-4 w-4" />
            <span>{statusDisplayLabel}</span>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              {ct('ปิดหน้าต่าง', 'Close')}
            </button>
            <button
              onClick={onViewETicket}
              className={`px-4 py-2.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                canViewTicket
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-white text-orange-600 border border-orange-200 hover:bg-orange-50'
              }`}
              title={!canViewTicket ? ct('ตัวยังรอการยืนยัน แต่สามารถเปิดดู E-ticket ได้', 'Booking pending but ticket preview available') : undefined}
            >
              <Ticket className="h-4 w-4" />
              {ct('ดู E-Ticket', 'View E-Ticket')}
            </button>
            {canUserCancel && (
              <button
                onClick={handleModalCancel}
                disabled={isCancellingEnrollment}
                className={`px-4 py-2.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors border ${
                  isCancellingEnrollment
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
                }`}
              >
                <AlertCircle className="h-4 w-4" />
                {isCancellingEnrollment ? ct('กำลังยกเลิก...', 'Cancelling...') : ct('ยกเลิกการจอง', 'Cancel booking')}
              </button>
            )}
            {isRemovable && (
              <button
                onClick={handleModalRemove}
                disabled={isRemovingEnrollment}
                className={`px-4 py-2.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors border ${
                  isRemovingEnrollment
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50'
                }`}
              >
                <Trash2 className="h-4 w-4" />
                {isRemovingEnrollment ? ct('กำลังลบ...', 'Removing...') : ct('ลบการจอง', 'Remove booking')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailModal;
