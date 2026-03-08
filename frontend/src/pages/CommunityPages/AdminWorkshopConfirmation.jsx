import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  Store,
  Calendar,
  Clock,
  Users,
  DollarSign,
  MapPin,
  Building2,
  Bell,
  ClipboardList,
  Mail,
  Phone,
  MessageCircle,
  Facebook
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import api from '../../services/api'; 
import { getShopForAdmin } from '../../services/shopService';

const AdminWorkshopConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { ct } = useTranslation();
  
  const [adminNote, setAdminNote] = useState('');

  const { data: workshopData, isLoading: isFetching } = useQuery({
    queryKey: ['workshop-detail', id],
    queryFn: async () => {
      const res = await api.get(`/management/workshops/${id}`);
      return res.data?.data || res.data;
    },
    enabled: !!id,
  });

  const workshopShopId = typeof workshopData?.shopId === 'string'
    ? workshopData.shopId
    : workshopData?.shopId?._id || workshopData?.shopId?.id;

  const { data: shopData, isFetching: isFetchingShop, isError: isShopError } = useQuery({
    queryKey: ['admin-shop-detail', workshopShopId],
    queryFn: async () => {
      const res = await getShopForAdmin(workshopShopId);
      return res?.data?.data || res?.data || res;
    },
    enabled: !!workshopShopId,
    staleTime: 1000 * 60 * 5,
    onError: () => {
      Swal.fire({
        icon: 'warning',
        title: ct('โหลดข้อมูลร้านค้าไม่สำเร็จ', 'Failed to load shop info'),
        text: ct('ระบบยังแสดงข้อมูลจาก Workshop ที่ส่งมาให้', 'Showing submitted shop info instead'),
      });
    },
  });

  const invalidateWorkshopCaches = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['community-workshops'] }),
      queryClient.invalidateQueries({ queryKey: ['community-admin-pending-workshops'] }),
      queryClient.invalidateQueries({ queryKey: ['workshop-detail', id] }),
    ]);
  };

  const handleApprove = async () => {
    const confirm = await Swal.fire({
      title: ct('ยืนยันการอนุมัติ?', 'Approve this workshop?'),
      text: ct('Workshops ที่อนุมัติแล้วจะแสดงบนหน้าเว็บไซต์ทันที', 'Approved workshops will immediately appear on the website.'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: ct('อนุมัติ', 'Approve'),
      cancelButtonText: ct('ยกเลิก', 'Cancel'),
      confirmButtonColor: '#2F7B4D'
    });

    if (!confirm.isConfirmed) return;

    try {
      Swal.fire({
        title: ct('กำลังอนุมัติ...', 'Approving...'),
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      await api.patch(`/management/workshops/${id}`, {
        approvalStatus: 'ACTIVE',
        registrationStatus: 'OPEN',
        adminNote,
        rejectReason: '',
      });

      await invalidateWorkshopCaches();
      Swal.fire({
        icon: 'success',
        title: ct('อนุมัติสำเร็จ', 'Workshop approved'),
        timer: 1800,
        showConfirmButton: false,
      });
      navigate('/community-admin/dashboard');
    } catch (error) {
      console.error('Failed to approve:', error);
      Swal.fire({
        icon: 'error',
        title: ct('อนุมัติไม่สำเร็จ', 'Approval failed'),
        text: error.response?.data?.message || ct('กรุณาลองใหม่ภายหลัง', 'Please try again later'),
      });
    }
  };

  const handleUpdateStatus = async (mode) => {
    const { value: reason } = await Swal.fire({
      title: mode === 'REVISION'
        ? ct('ขอให้แก้ไขรายละเอียด', 'Request changes')
        : ct('ปฏิเสธ Workshop', 'Reject workshop'),
      input: 'textarea',
      inputLabel: ct('เหตุผล', 'Reason'),
      inputPlaceholder: ct('ระบุเหตุผลเพื่อแจ้งผู้จัด...', 'Provide a reason...'),
      inputValidator: (value) => (!value?.trim() ? ct('กรุณาระบุเหตุผล', 'Please provide a reason') : undefined),
      icon: mode === 'REVISION' ? 'warning' : 'error',
      showCancelButton: true,
      confirmButtonText: ct('ยืนยัน', 'Submit'),
      cancelButtonText: ct('ยกเลิก', 'Cancel'),
      confirmButtonColor: mode === 'REVISION' ? '#F4A236' : '#C14949',
    });

    if (!reason) return;

    try {
      Swal.fire({
        title: ct('กำลังบันทึก...', 'Processing...'),
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const approvalStatus = mode === 'REVISION' ? 'CHANGE' : 'REJECTED';
      await api.patch(`/management/workshops/${id}`, {
        approvalStatus,
        rejectReason: reason,
        adminNote,
      });

      await invalidateWorkshopCaches();
      Swal.fire({
        icon: 'success',
        title: mode === 'REVISION'
          ? ct('ส่งคำขอแก้ไขแล้ว', 'Revision request sent')
          : ct('ปฏิเสธเรียบร้อย', 'Workshop rejected'),
        timer: 1800,
        showConfirmButton: false,
      });
      navigate('/community-admin/dashboard');
    } catch (error) {
      console.error('Failed to update status:', error);
      Swal.fire({
        icon: 'error',
        title: ct('ดำเนินการไม่สำเร็จ', 'Action failed'),
        text: error.response?.data?.message || ct('กรุณาลองใหม่ภายหลัง', 'Please try again later'),
      });
    }
  };

  if (isFetching) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F5EFE7]">กำลังโหลดข้อมูล...</div>;
  }

  if (!workshopData) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F5EFE7]">ไม่พบข้อมูล Workshop</div>;
  }

  const coverImage = workshopData.image || workshopData.imageUrl;
  const shopName = workshopData.shopId?.shopName || workshopData.shopName || ct('ไม่ระบุร้านค้า', 'Unknown Shop');
  const price = Number(workshopData.price) || 0;
  const capacity = workshopData.capacity ?? workshopData.seatLimit ?? workshopData.seats ?? 0;
  const currentParticipants = workshopData.current_participants ?? workshopData.currentParticipants ?? workshopData.bookedSeats ?? 0;
  const remainingSeats = capacity ? Math.max(capacity - currentParticipants, 0) : 0;

  const requirements = Array.isArray(workshopData.requirements) ? workshopData.requirements : [];

  const formatDate = (value) => {
    if (!value) return ct('ไม่ระบุ', 'N/A');
    return new Date(value).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const resolvedWorkshopDate = workshopData.workshopDate || workshopData.date || workshopData.startDate || workshopData.endDate;
  const formattedWorkshopDate = formatDate(resolvedWorkshopDate);

  const formatTimeRange = () => {
    if (!workshopData.startTime && !workshopData.endTime) return ct('ไม่ระบุ', 'N/A');
    return `${workshopData.startTime || '--:--'} - ${workshopData.endTime || '--:--'}`;
  };

  const shopDataFromWorkshop = typeof workshopData.shopId === 'object' ? workshopData.shopId : null;
  const mergedShopData = shopData || shopDataFromWorkshop || {};

  const shopInfo = {
    name: mergedShopData.shopName || workshopData.shopName || ct('ไม่ระบุร้านค้า', 'Unknown Shop'),
    owner: mergedShopData.owner?.name || mergedShopData.ownerName || mergedShopData.contactName || workshopData.shopOwnerName || ct('ไม่ระบุ', 'N/A'),
    phone: mergedShopData.owner?.phone || mergedShopData.contact?.phone || mergedShopData.phone || workshopData.shopPhone || '-',
    line: mergedShopData.contact?.line || mergedShopData.line || '-',
    facebook: mergedShopData.contact?.facebook || mergedShopData.facebook || '-',
    address: mergedShopData.address || mergedShopData.location?.address || workshopData.location || ct('ไม่ระบุที่อยู่', 'No address provided'),
    cover: mergedShopData.coverUrl || mergedShopData.picture || mergedShopData.images?.[0],
    description: mergedShopData.description || workshopData.shopDescription || ct('ยังไม่มีคำอธิบาย', 'No description'),
  };

  const shopInfoNote = !workshopShopId
    ? ct('Workshop นี้ไม่ได้แนบข้อมูลร้านค้าไว้', 'This workshop was submitted without shop info')
    : isShopError
      ? ct('แสดงข้อมูลร้านจาก Workshop เนื่องจากโหลดจากระบบไม่สำเร็จ', 'Showing embedded shop data because fetch failed')
      : null;

  const locationText = workshopData.locationType === 'custom'
    ? (workshopData.customLocation || workshopData.location || ct('ไม่ระบุสถานที่', 'No venue specified'))
    : (shopInfo.address || workshopData.location || ct('ใช้สถานที่ร้าน', 'Shop location'));

  const highlightMetrics = [
    {
      label: ct('ราคาต่อคน', 'Price per seat'),
      value: price ? `฿${price.toLocaleString('th-TH')}` : '฿0',
      icon: DollarSign,
      accent: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: ct('จำนวนที่นั่ง', 'Seat capacity'),
      value: capacity ? `${currentParticipants}/${capacity} ${ct('คน', 'people')}` : ct('ไม่ระบุ', 'N/A'),
      icon: Users,
      accent: 'bg-blue-50 text-blue-600',
    },
    {
      label: ct('หมวดหมู่', 'Category'),
      value: workshopData.category || '-',
      icon: Bell,
      accent: 'bg-amber-50 text-amber-600',
    },
  ];

  const scheduleDetails = [
    {
      label: ct('วันที่จัดเวิร์กช็อป', 'Workshop Date'),
      value: formattedWorkshopDate,
      icon: Calendar,
    },
    {
      label: ct('เวลาจัดเวิร์กช็อป', 'Workshop Time'),
      value: formatTimeRange(),
      icon: Clock,
    },
    {
      label: ct('สถานที่จัดงาน', 'Venue'),
      value: locationText,
      icon: MapPin,
    },
    {
      label: ct('ระยะเวลารับสมัคร', 'Registration window'),
      value: `${formatDate(workshopData.startDate)} - ${formatDate(workshopData.endDate)}`,
      icon: Building2,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5EFE7] py-10 animate-fadeIn">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/community-admin/dashboard')}
          className="flex items-center gap-2 text-lg font-bold text-gray-600 hover:text-gray-900 mb-8 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          {ct('กลับไปหน้า Dashboard', 'Back to Dashboard')}
        </button>

        <div className="space-y-8">
          <section className="grid lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-5">
              <div className="rounded-[32px] border border-[#F2E4D4] bg-white shadow-sm overflow-hidden h-full min-h-[260px] flex items-center justify-center">
                {coverImage ? (
                  <img src={coverImage} alt={workshopData.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-base font-bold text-gray-400">{ct('ไม่มีรูปภาพหน้าปก', 'No cover image')}</div>
                )}
              </div>
            </div>

            <div className="lg:col-span-7 bg-white rounded-[32px] border border-[#F2E4D4] shadow-sm p-8 lg:p-10 flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-4 py-1 text-sm font-bold rounded-full bg-yellow-100 text-yellow-800">
                  {workshopData.approvalStatus === 'PENDING' ? ct('รอการอนุมัติ', 'Pending Approval') : workshopData.approvalStatus}
                </span>
                <span className="px-4 py-1 text-sm font-bold rounded-full bg-[#F5EFE7] text-gray-700 border border-[#F2E4D4]">
                  {shopInfo.name}
                </span>
                <span className="ml-auto px-4 py-1 text-sm font-bold rounded-full bg-white border border-gray-200 text-gray-500">
                  {ct('คงเหลือ', 'Seats left')}: {capacity ? remainingSeats : ct('ไม่ระบุ', 'N/A')}
                </span>
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-2">{workshopData.title}</h1>
                <p className="text-lg font-bold text-gray-600 max-w-3xl max-h-20 overflow-y-auto scrollbar-thin leading-relaxed whitespace-pre-line wrap-break-word">
                  {workshopData.shortDescription || workshopData.description?.slice(0, 160) || ct('ไม่มีคำอธิบาย', 'No description')}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-base font-bold text-gray-600 mt-3">
                  <MapPin className="h-4 w-4 text-[#B48433]" />
                  <span className="font-bold text-gray-700">{locationText || ct('ไม่ระบุสถานที่', 'No venue specified')}</span>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {highlightMetrics.map((metric, index) => (
                  <div key={metric.label} className={`flex items-center gap-3 rounded-2xl border border-[#F2E4D4] bg-white px-4 py-3 animate-slideUp`} style={{ animationDelay: `${0.05 * index}s` }}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${metric.accent}`}>
                      <metric.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wide text-gray-600">{metric.label}</p>
                      <p className="text-base font-bold text-gray-900">{metric.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-[28px] border border-[#F2E4D4] p-6 lg:p-7 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{ct('รายละเอียด Workshop', 'Workshop Details')}</h3>
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-[#FFF8EA] border border-[#F4E4C4] ">
                    <p className="text-base font-bold text-[#B48433] mb-1">{ct('คำอธิบาย', 'Description')}</p>
                    <p className="text-base font-bold text-gray-700 leading-relaxed wrap-break-word whitespace-pre-wrap max-h-48 overflow-y-auto scrollbar-thin pr-1">{workshopData.description || ct('ไม่มีคำอธิบาย', 'No description')}</p>
                  </div>
                  {requirements.length > 0 && (
                    <div className="p-5 rounded-2xl bg-[#FAF5EE] border border-[#E8DCCB]">
                      <p className="text-base font-bold text-[#B48433] mb-3">{ct('สิ่งที่ต้องเตรียมมา', 'Requirements')}</p>
                      <ul className="space-y-2">
                        {requirements.map((req, index) => (
                          <li key={index} className="flex items-center gap-2 text-base font-bold text-gray-700">
                            <CheckCircle className="h-4 w-4 text-[#9CC47F]" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-[28px] border border-[#F2E4D4] p-6 lg:p-7 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 mb-5">{ct('ข้อมูลการจัดเวิร์กช็อป', 'Workshop Logistics')}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {scheduleDetails.map((item) => (
                    <div key={item.label} className="flex items-start gap-3 rounded-2xl border border-[#F2E4D4] bg-[#FFFCF6] p-4">
                      <div className="w-10 h-10 rounded-xl bg-[#F5E4C8] text-[#B48433] flex items-center justify-center">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-600">{item.label}</p>
                        <p className="text-base font-bold text-gray-900 whitespace-pre-line">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-[28px] border border-[#E3D7C6] shadow-sm overflow-hidden">
                {shopInfo.cover && (
                  <div className="h-40 w-full bg-gray-100">
                    <img src={shopInfo.cover} alt={shopInfo.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-gray-600">{ct('ข้อมูลร้านค้า', 'Shop Information')}</p>
                    <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{shopInfo.name}</h3>
                    <p className="text-base font-bold text-gray-600 max-h-16 overflow-y-auto scrollbar-thin leading-relaxed whitespace-pre-line wrap-break-word">{shopInfo.description}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-[#B48433]" />
                      <p className="text-base font-bold text-gray-700">{ct('ผู้ติดต่อ', 'Contact')}: <span className="font-bold">{shopInfo.owner}</span></p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-[#B48433]" />
                      <p className="text-base font-bold text-gray-700 break-all">{shopInfo.phone}</p>
                    </div>
                    {shopInfo.line && shopInfo.line !== '-' && (
                      <div className="flex items-center gap-3">
                        <MessageCircle className="h-4 w-4 text-[#B48433]" />
                        <p className="text-base font-bold text-gray-700 break-all">Line: {shopInfo.line}</p>
                      </div>
                    )}
                    {shopInfo.facebook && shopInfo.facebook !== '-' && (
                      <div className="flex items-center gap-3">
                        <Facebook className="h-4 w-4 text-[#B48433]" />
                        <p className="text-base font-bold text-gray-700 break-all">Facebook: {shopInfo.facebook}</p>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-[#B48433]" />
                      <p className="text-base font-bold text-gray-700 wrap-break-word max-h-16 overflow-y-auto scrollbar-thin leading-relaxed">
                        {shopInfo.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-br from-[#FFF4DA] via-[#FFE7C1] to-[#FFDDB1] rounded-[28px] border border-[#F3C992] p-6 lg:p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{ct('การดำเนินการโดยชุมชน', 'Community Admin Actions')}</h3>

            <div className="grid md:grid-cols-3 gap-3">
              <button
                onClick={handleApprove}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#2F7B4D] hover:bg-[#25633E] text-white text-lg font-bold rounded-xl transition shadow-sm"
              >
                <CheckCircle className="h-5 w-5" />
                {ct('อนุมัติ', 'Approve')}
              </button>

              <button
                onClick={() => handleUpdateStatus('REVISION')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#F4A236] hover:bg-[#E38E1D] text-white text-lg font-bold rounded-xl transition shadow-sm"
              >
                <ClipboardList className="h-5 w-5" />
                {ct('ขอแก้ไข', 'Request')}
              </button>

              <button
                onClick={() => handleUpdateStatus('REJECT')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#C14949] hover:bg-[#A63A3A] text-white text-lg font-bold rounded-xl transition shadow-sm"
              >
                <XCircle className="h-5 w-5" />
                {ct('ปฏิเสธ', 'Reject')}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminWorkshopConfirmation;