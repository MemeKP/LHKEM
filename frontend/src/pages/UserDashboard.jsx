import { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, CheckCircle, XCircle, AlertCircle, ChevronRight, Ticket, Store, Trash2 } from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import api, { withQuery } from '../services/api';
import ETicketModal from '../components/ETicketModal';
import BookingDetailModal from '../components/BookingDetailModal';
import { formatNumericDate, formatNumericDateTime } from '../utils/dateFormatter';

const CARDS_PER_PAGE = 6;

const UserDashboard = () => {
  const { user, loading } = useAuth();
  const { t, ct } = useTranslation();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showETicket, setShowETicket] = useState(false);
  const [showBookingDetail, setShowBookingDetail] = useState(false);
  const [activeEnrollment, setActiveEnrollment] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [removingEnrollmentId, setRemovingEnrollmentId] = useState(null);
  const [cancellingEnrollmentId, setCancellingEnrollmentId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const fallbackWorkshopImage = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80';

  useEffect(() => {
    if (!loading && user && user.role && user.role !== 'TOURIST') {
      // Redirect other roles to their dashboards
      const roleRedirects = {
        SHOP_OWNER: '/shop/dashboard',
        COMMUNITY_ADMIN: '/community-admin/dashboard',
        PLATFORM_ADMIN: '/platform-admin/dashboard',
      };

      const redirectPath = roleRedirects[user.role] || '/';
      navigate(redirectPath, { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchEnrollments = async () => {
      // FIX: Use user.userId or user._id depending on your auth payload
      const userId = user?.userId || user?.id || user?._id;
      
      if (userId) {
        try {
          setIsFetching(true);
          setFetchError(null);
          const response = await api.get(withQuery('/enroll', { userId }));

          // Safety check for data structure
          const data = response.data?.enrollments || response.data || [];
          setEnrollments(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error('Failed to fetch enrollments:', error);
          setFetchError(error?.response?.data?.message || error.message || ct('ลบการจองไม่สำเร็จ', 'Failed to load enrollments'));
        } finally {
          setIsFetching(false);
        }
      }
    };

    fetchEnrollments();
  }, [user]);

  const getExplorePath = () => {
    // 1. Try to find the slug from the user's existing enrollments
    if (enrollments.length > 0) {
      const firstEnrollment = enrollments[0];
      // Check for populated community slug: workshopId -> communityId -> slug
      const slug = firstEnrollment.workshopId?.communityId?.slug || 
                   firstEnrollment.workshopId?.community?.slug;
      
      if (slug) return `/${slug}/workshops`;
    }

    // 2. Fallback: If no enrollments, default to your main community
    return '/loeng-him-kaw/workshops'; 
  };

  // Updated to handle formatting for the E-Ticket Modal
  const handleViewETicket = (enrollment) => {
    if (showBookingDetail) {
      handleCloseBookingDetail();
    }
    const formattedBooking = {
      id: enrollment._id,
      // Map MongoDB workshopId object to the 'workshop' property expected by the ticket modal
      workshop: enrollment.workshopId || { title: enrollment.workshopTitle || 'Workshop' },
      guestCount: enrollment.slots || enrollment.participants || 1,
      bookingDate: enrollment.createdAt,
      status: (enrollment.status || 'pending').toLowerCase()
    };
    setSelectedBooking(formattedBooking);
    setShowETicket(true);
  };
  
  const handleCloseETicket = () => {
    setShowETicket(false);
    setSelectedBooking(null);
  };

  const handleOpenBookingDetail = (enrollment) => {
    setActiveEnrollment(enrollment);
    setShowBookingDetail(true);
  };

  const handleCloseBookingDetail = () => {
    setShowBookingDetail(false);
    setActiveEnrollment(null);
  };

  const handleRemoveEnrollment = async (enrollment) => {
    const enrollmentId = enrollment?._id || enrollment?.id;
    if (!enrollmentId) return;

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

    try {
      setActionFeedback(null);
      setRemovingEnrollmentId(enrollmentId);
      await api.delete(`/enroll/${enrollmentId}`);
      setEnrollments((prev) => prev.filter((entry) => (entry._id || entry.id) !== enrollmentId));
      setActionFeedback({ type: 'success', message: ct('ลบการจองเรียบร้อย', 'Booking removed successfully.') });
      Swal.fire({
        icon: 'success',
        title: ct('ลบการจองเรียบร้อย', 'Booking removed successfully.'),
        timer: 1800,
        showConfirmButton: false,
      });
      if (activeEnrollment && (activeEnrollment._id || activeEnrollment.id) === enrollmentId) {
        handleCloseBookingDetail();
      }
    } catch (error) {
      console.error('Failed to remove enrollment', error);
      const message = error?.response?.data?.message || error.message || ct('ลบการจองไม่สำเร็จ', 'Failed to remove booking.');
      setActionFeedback({ type: 'error', message });
      Swal.fire({
        icon: 'error',
        title: ct('ลบการจองไม่สำเร็จ', 'Failed to remove booking.'),
        text: message,
      });
    } finally {
      setRemovingEnrollmentId(null);
    }
  };

  const mergeEnrollmentData = (currentEnrollment = {}, serverUpdate = {}) => {
    const merged = { ...(currentEnrollment || {}), ...(serverUpdate || {}) };

    if (!serverUpdate || typeof serverUpdate.workshopId !== 'object') {
      merged.workshopId = currentEnrollment?.workshopId;
    }

    if (!serverUpdate || typeof serverUpdate.workshop !== 'object') {
      merged.workshop = currentEnrollment?.workshop;
    }

    return merged;
  };

  const handleCancelEnrollment = async (enrollment) => {
    const enrollmentId = enrollment?._id || enrollment?.id;
    if (!enrollmentId) return;

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

    try {
      setActionFeedback(null);
      setCancellingEnrollmentId(enrollmentId);
      const response = await api.patch(`/enroll/${enrollmentId}/cancel`);

      const updatedEnrollment = response?.data || response || {};

      setEnrollments((prev) =>
        prev.map((entry) => {
          if ((entry._id || entry.id) === enrollmentId) {
            const merged = mergeEnrollmentData(entry, {
              ...updatedEnrollment,
              status: updatedEnrollment?.status || entry.status || 'CANCEL',
            });
            return merged;
          }
          return entry;
        })
      );

      if (activeEnrollment && (activeEnrollment._id || activeEnrollment.id) === enrollmentId) {
        setActiveEnrollment((prev) =>
          prev
            ? mergeEnrollmentData(prev, {
                ...updatedEnrollment,
                status: updatedEnrollment?.status || prev.status || 'CANCEL',
              })
            : prev
        );
      }

      const successMessage = ct(
        'ยกเลิกการจองแล้ว กรุณาติดต่อร้านค้าเพื่อยืนยันการคืนเงิน',
        'Booking cancelled. Please contact the shop to confirm refunds.'
      );
      setActionFeedback({ type: 'success', message: successMessage });
      Swal.fire({
        icon: 'success',
        title: ct('ยกเลิกการจองสำเร็จ', 'Booking cancelled'),
        text: successMessage,
      });
    } catch (error) {
      console.error('Failed to cancel enrollment', error);
      const message =
        error?.response?.data?.message ||
        error.message ||
        ct('ยกเลิกการจองไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', 'Unable to cancel booking. Please try again.');
      setActionFeedback({ type: 'error', message });
      Swal.fire({
        icon: 'error',
        title: ct('ยกเลิกการจองไม่สำเร็จ', 'Unable to cancel booking'),
        text: message,
      });
    } finally {
      setCancellingEnrollmentId(null);
    }
  };

  const getStatusBadge = (status) => {
    // Normalizing status to lowercase for matching
    const s = (status || 'pending').toLowerCase();
    const statusConfig = {
      confirmed: { bg: '#dcfce7', text: '#166534', icon: CheckCircle, label: t('dashboard.status.confirmed') },
      active: { bg: '#dcfce7', text: '#166534', icon: CheckCircle, label: t('dashboard.status.confirmed') },
      pending: { bg: '#fef3c7', text: '#92400e', icon: AlertCircle, label: t('dashboard.status.pending') },
      completed: { bg: '#e0e7ff', text: '#3730a3', icon: CheckCircle, label: t('dashboard.status.completed') },
      cancelled: { bg: '#fee2e2', text: '#991b1b', icon: XCircle, label: t('dashboard.status.cancelled') },
      cancel: { bg: '#ffe4e6', text: '#9f1239', icon: XCircle, label: ct('ยกเลิกการจองร้านค้า', 'Cancelled by you') },
      rejected: { bg: '#fee2e2', text: '#991b1b', icon: XCircle, label: t('dashboard.status.cancelled') }
    };

    const config = statusConfig[s] || statusConfig.pending;
    const Icon = config.icon;
    const label = config.label || (s === 'cancel' ? ct('ยกเลิกการจองร้านค้า', 'Cancelled by you') : s);

    return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: config.bg, color: config.text }}>
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </span>
    );
  };

  const formatDate = (dateString) => formatNumericDateTime(dateString);

  const formatDateOnly = (dateString) => formatNumericDate(dateString);

  const getWorkshop = (enrollment) => {
    const candidate = enrollment?.workshopId;
    return candidate && typeof candidate === 'object' ? candidate : null;
  };

  const getWorkshopTitle = (enrollment) => {
    const workshop = getWorkshop(enrollment);
    return (
      workshop?.title ||
      workshop?.name ||
      enrollment.workshopTitle ||
      enrollment.title ||
      ct('ไม่มีชื่อเวิร์กช็อป', 'Untitled Workshop')
    );
  };

  const getWorkshopDateValue = (enrollment) => {
    const workshop = getWorkshop(enrollment);
    return (
      workshop?.date ||
      workshop?.startDate ||
      workshop?.schedule?.start ||
      enrollment.workshopDate ||
      enrollment.date
    );
  };

  const getWorkshopTimeRange = (enrollment) => {
    const workshop = getWorkshop(enrollment);
    const start = workshop?.startTime || workshop?.startDate;
    const end = workshop?.endTime || workshop?.endDate;

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

    const formattedStart = formatTime(start);
    const formattedEnd = formatTime(end);

    if (formattedStart && formattedEnd) {
      return `${formattedStart} - ${formattedEnd}`;
    }
    return formattedStart || formattedEnd || '-';
  };

  const getWorkshopTimestamp = (enrollment) => {
    const value = getWorkshopDateValue(enrollment);
    const timestamp = value ? new Date(value).getTime() : null;
    return Number.isFinite(timestamp) ? timestamp : null;
  };

  const getWorkshopImage = (enrollment) => {
    const workshop = getWorkshop(enrollment) || {};
    return (
      workshop.image ||
      workshop.coverImage ||
      workshop.heroImage ||
      (Array.isArray(workshop.images) && workshop.images[0]) ||
      fallbackWorkshopImage
    );
  };

  const getWorkshopHost = (enrollment) => {
    const workshop = getWorkshop(enrollment) || {};
    return (
      workshop.shop?.shopName ||
      workshop.shop?.name ||
      workshop.shopId?.name ||
      workshop.host ||
      workshop.hostName ||
      enrollment.shopName ||
      ct('ไม่ทราบผู้จัด', 'Unknown host')
    );
  };

  const getWorkshopShopLocation = (enrollment) => {
    const workshop = getWorkshop(enrollment) || {};
    return (
      workshop.shop?.location?.address ||
      workshop.shop?.address ||
      workshop.location?.address ||
      workshop.location?.customLocation ||
      workshop.customLocation ||
      enrollment.location ||
      null
    );
  };

  const getWorkshopLocation = (enrollment) => {
    const workshop = getWorkshop(enrollment) || {};
    return (
      workshop.location?.customLocation ||
      workshop.location?.address ||
      workshop.locationName ||
      workshop.address ||
      workshop.locationType ||
      enrollment.location ||
      ct('ไม่พบสถานที่', 'Location not specified')
    );
  };

  const getReservedSeats = (enrollment) => (
    enrollment.slots ||
    enrollment.participants ||
    enrollment.ticketCount ||
    enrollment.quantity ||
    1
  );

  const getWorkshopCapacity = (enrollment) => {
    const workshop = getWorkshop(enrollment) || {};
    return (
      workshop.capacity ||
      workshop.maxParticipants ||
      workshop.maxSeats ||
      workshop.limit ||
      null
    );
  };

  const getWorkshopCommunitySlug = (enrollment) => (
    enrollment.workshopId?.communityId?.slug ||
    enrollment.workshopId?.community?.slug ||
    enrollment.workshopId?.communitySlug ||
    enrollment.communitySlug
  );

  const getWorkshopDetailPath = (enrollment) => {
    const slug = getWorkshopCommunitySlug(enrollment) || 'loeng-him-kaw';
    const workshopId = enrollment.workshopId?._id || enrollment.workshopId?.id || enrollment.workshopId?.slug || enrollment.workshopId;

    if (slug && workshopId && typeof workshopId === 'string') {
      return `/${slug}/workshops/${workshopId}`;
    }

    return getExplorePath();
  };

  const getWorkshopRegistrationStatus = (enrollment) => {
    const workshop = getWorkshop(enrollment);
    return workshop?.registrationStatus || enrollment?.registrationStatus || null;
  };

  const getRegistrationDeadline = (enrollment) => {
    const workshop = getWorkshop(enrollment);
    return (
      workshop?.registrationEndDate ||
      workshop?.registrationDeadline ||
      workshop?.endDate ||
      workshop?.date ||
      null
    );
  };

  const canCancelEnrollment = (enrollment) => {
    if (!enrollment) return false;
    const statusKey = (enrollment.status || 'pending').toLowerCase();
    if (!['confirmed', 'active'].includes(statusKey)) {
      return false;
    }

    const registrationStatus = (getWorkshopRegistrationStatus(enrollment) || '').toLowerCase();
    const isRegistrationOpen = !registrationStatus || registrationStatus === 'open';

    const deadlineValue = getRegistrationDeadline(enrollment);
    let beforeDeadline = true;
    if (deadlineValue) {
      const deadlineDate = new Date(deadlineValue);
      beforeDeadline = Number.isFinite(deadlineDate.getTime()) ? deadlineDate > new Date() : true;
    }

    return isRegistrationOpen && beforeDeadline;
  };

  const filterEnrollments = () => {
    const now = new Date();
    
    return enrollments.filter(e => {
      // Extract date from populated workshopId or flat field
      const workshopDate = new Date(e.workshopId?.date || e.workshopDate || e.date);
      const statusKey = (e.status || 'pending').toLowerCase();
      const isPast = workshopDate <= now || statusKey === 'completed';

      if (activeTab === 'upcoming') return !isPast && !['cancelled', 'rejected'].includes(statusKey);
      if (activeTab === 'past') return isPast;
      return true; // 'all'
    });
  };

  const sortedEnrollments = useMemo(() => {
    const sorted = [...filterEnrollments()];
    sorted.sort((a, b) => {
      const timeA = getWorkshopTimestamp(a);
      const timeB = getWorkshopTimestamp(b);

      if (activeTab === 'past') {
        return (timeB ?? -Infinity) - (timeA ?? -Infinity);
      }

      return (timeA ?? Infinity) - (timeB ?? Infinity);
    });

    return sorted;
  }, [enrollments, activeTab]);

  const totalPages = Math.ceil(sortedEnrollments.length / CARDS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedEnrollments = useMemo(() => {
    const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
    return sortedEnrollments.slice(startIndex, startIndex + CARDS_PER_PAGE);
  }, [sortedEnrollments, currentPage]);

  const startEntry = sortedEnrollments.length === 0 ? 0 : (currentPage - 1) * CARDS_PER_PAGE + 1;
  const endEntry = Math.min(currentPage * CARDS_PER_PAGE, sortedEnrollments.length);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (loading || isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 animate-slideUp">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('dashboard.title')}</h1>
          <p className="text-gray-600">
            {t('dashboard.welcome')}, {user?.firstName || user?.firstname || user?.email}
          </p>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 animate-slideUp">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-4 transition-all duration-300 hover:-translate-y-1">
              <div className="p-3 bg-blue-100 rounded-lg"><Calendar className="h-6 w-6 text-blue-600" /></div>
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.stats.total')}</p>
                <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 transition-all duration-300 hover:-translate-y-1">
              <div className="p-3 bg-green-100 rounded-lg"><CheckCircle className="h-6 w-6 text-green-600" /></div>
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.stats.upcoming')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {enrollments.filter(e => new Date(e.workshopId?.date || e.date) > new Date() && e.status !== 'cancelled').length}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 transition-all duration-300 hover:-translate-y-1">
              <div className="p-3 bg-purple-100 rounded-lg"><Users className="h-6 w-6 text-purple-600" /></div>
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.stats.completed')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {enrollments.filter(e => e.status === 'completed' || new Date(e.workshopId?.date || e.date) < new Date()).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm animate-slideUp delay-100">
          {fetchError && (
            <div className="mx-6 mt-6 mb-2 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              {ct('ไม่สามารถโหลดรายการจองได้ โปรดลองใหม่อีกครั้ง', 'Unable to load your bookings right now. Please try again.')}
              <div className="text-xs text-red-500 mt-1 break-all">{fetchError}</div>
            </div>
          )}
          {actionFeedback && (
            <div
              className={`mx-6 mt-4 mb-2 rounded-2xl border p-4 text-sm ${
                actionFeedback.type === 'success'
                  ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                  : 'border-red-100 bg-red-50 text-red-700'
              }`}
            >
              {actionFeedback.message}
            </div>
          )}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              {['upcoming', 'past', 'all'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === tab ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  {t(`dashboard.tabs.${tab}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {sortedEnrollments.length === 0 ? (
              <div className="text-center py-12 animate-fadeIn">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('dashboard.noEnrollments.title')}</h3>
                <p className="text-gray-600 mb-6">{t('dashboard.noEnrollments.description')}</p>
                <button
                  onClick={() => navigate(getExplorePath())} // UPDATED: Now uses the helper
                  className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {t('dashboard.noEnrollments.button')}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            ) : (
              <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedEnrollments.map((enrollment, index) => (
                  <div
                    key={enrollment._id || enrollment.id}
                    className="flex flex-col bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-slideUp"
                  >
                    <div className="relative h-44">
                      <img
                        src={getWorkshopImage(enrollment)}
                        alt={getWorkshopTitle(enrollment)}

                        className="h-full w-full object-cover"

                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = fallbackWorkshopImage;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute top-4 left-4">
                        {getStatusBadge(enrollment.status)}
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-xs text-white/80 mb-1">
                          {formatDateOnly(getWorkshopDateValue(enrollment))}
                        </p>
                        <h3 className="text-xl font-semibold text-white leading-tight line-clamp-2">
                          {getWorkshopTitle(enrollment)}
                        </h3>
                        <div className="mt-1 text-[13px] text-white/80 flex items-center gap-2">
                          <Store className="h-4 w-4 text-white/80" />
                          <span className="line-clamp-1">{getWorkshopHost(enrollment)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col flex-1 p-5 gap-5">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {getWorkshopTitle(enrollment)}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <Store className="h-4 w-4 text-amber-500" />

                          {getWorkshopHost(enrollment)}
                        </p>
                      </div>

                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-orange-500" />
                          <span>{formatDateOnly(getWorkshopDateValue(enrollment))}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-green-500" />
                          <span>{getWorkshopTimeRange(enrollment)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-purple-500" />
                          <span className="line-clamp-1">{getWorkshopLocation(enrollment) || getWorkshopShopLocation(enrollment) || ct('ไม่พบสถานที่', 'Location not specified')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span>
                            {ct('ที่นั่งที่จอง', 'Seats booked')}: {getReservedSeats(enrollment)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-rose-500" />
                          <span>{t('dashboard.enrolled')} {formatDate(enrollment.createdAt || enrollment.enrollmentDate)}</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-3 border-t border-gray-100 flex flex-col gap-4">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <p className="text-xs text-gray-500">{t('dashboard.totalPrice')}</p>
                            <p className="text-2xl font-bold text-gray-900">฿{(enrollment.totalPrice || 0).toLocaleString()}</p>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <div>{getStatusBadge(enrollment.status)}</div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                          <button
                            onClick={() => handleViewETicket(enrollment)}
                            className={`px-4 py-2.5 text-sm font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 ${
                              ['confirmed', 'active'].includes((enrollment.status || '').toLowerCase())
                                ? 'text-white bg-orange-500 hover:bg-orange-600'
                                : 'text-orange-600 border border-orange-200 bg-white hover:bg-orange-50'
                            }`}
                            title={['confirmed', 'active'].includes((enrollment.status || '').toLowerCase())
                              ? undefined
                              : ct('ตัวยังรอการยืนยัน แต่สามารถเปิดดู E-ticket ได้', 'Booking pending but ticket preview available')}
                          >
                            <Ticket className="h-4 w-4" />
                            {ct('ดู E-Ticket', 'View E-Ticket')}
                          </button>
                          <button
                            onClick={() => handleOpenBookingDetail(enrollment)}
                            className="px-4 py-2.5 text-sm font-semibold text-orange-600 border border-orange-200 rounded-2xl hover:bg-orange-50 transition-all duration-200"
                          >
                            {t('dashboard.viewDetails')}
                          </button>
                          {canCancelEnrollment(enrollment) && (
                            <button
                              onClick={() => handleCancelEnrollment(enrollment)}
                              disabled={cancellingEnrollmentId === (enrollment._id || enrollment.id)}
                              className={`px-4 py-2.5 text-sm font-semibold rounded-2xl border flex items-center justify-center gap-2 transition-all duration-200 ${
                                cancellingEnrollmentId === (enrollment._id || enrollment.id)
                                  ? 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed'
                                  : 'text-amber-700 border-amber-200 bg-white hover:bg-amber-50'
                              }`}
                            >
                              <AlertCircle className="h-4 w-4" />
                              {cancellingEnrollmentId === (enrollment._id || enrollment.id)
                                ? ct('กำลังยกเลิก...', 'Cancelling...')
                                : ct('ยกเลิกการจอง', 'Cancel booking')}
                            </button>
                          )}
                          {['rejected', 'cancelled', 'cancel'].includes((enrollment.status || '').toLowerCase()) && (
                            <button
                              onClick={() => handleRemoveEnrollment(enrollment)}
                              disabled={removingEnrollmentId === (enrollment._id || enrollment.id)}
                              className={`px-4 py-2.5 text-sm font-semibold rounded-2xl border flex items-center justify-center gap-2 transition-all duration-200 ${
                                removingEnrollmentId === (enrollment._id || enrollment.id)
                                  ? 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed'
                                  : 'text-rose-600 border-rose-200 bg-white hover:bg-rose-50'
                              }`}
                            >
                              <Trash2 className="h-4 w-4" />
                              {removingEnrollmentId === (enrollment._id || enrollment.id)
                                ? ct('กำลังลบ...', 'Removing...')
                                : ct('ลบการจอง', 'Remove booking')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-8 flex flex-col gap-4 animate-fadeIn">
                  <div className="text-sm text-gray-500 text-center">
                    {ct('แสดง', 'Showing')} {startEntry}-{endEntry} {ct('จากทั้งหมด', 'of')} {sortedEnrollments.length} {ct('การจอง', 'bookings')}
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-2xl border text-sm font-semibold flex items-center gap-2 transition ${currentPage === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                      aria-label={ct('หน้าก่อนหน้า', 'Previous page')}
                    >
                      {ct('ก่อนหน้า', 'Prev')}
                    </button>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-3 py-1 rounded-xl bg-orange-50 text-orange-600 font-semibold">
                        {currentPage}
                      </span>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-600">{totalPages}</span>
                    </div>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-2xl border text-sm font-semibold flex items-center gap-2 transition ${currentPage === totalPages ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                      aria-label={ct('หน้าถัดไป', 'Next page')}
                    >
                      {ct('ถัดไป', 'Next')}
                    </button>
                  </div>
                </div>
              )}
              </>
            )}
          </div>
        </div>
      </div>
      
      <ETicketModal 
        booking={selectedBooking}
        isOpen={showETicket}
        onClose={handleCloseETicket}
      />
      <BookingDetailModal
        enrollment={activeEnrollment}
        isOpen={showBookingDetail}
        onClose={handleCloseBookingDetail}
        onViewETicket={() => {
          if (activeEnrollment) {
            handleViewETicket(activeEnrollment);
          }
        }}
        onRemoveEnrollment={handleRemoveEnrollment}
        isRemovingEnrollment={Boolean(activeEnrollment && removingEnrollmentId === (activeEnrollment._id || activeEnrollment.id))}
        onCancelEnrollment={handleCancelEnrollment}
        isCancellingEnrollment={Boolean(activeEnrollment && cancellingEnrollmentId === (activeEnrollment._id || activeEnrollment.id))}
        canUserCancel={Boolean(activeEnrollment && canCancelEnrollment(activeEnrollment))}
      />
    </div>
  );
};

export default UserDashboard;