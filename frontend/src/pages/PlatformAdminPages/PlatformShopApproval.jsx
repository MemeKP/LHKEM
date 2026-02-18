import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  MessageSquare,
  Facebook,
  Loader2,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useTranslation } from '../../hooks/useTranslation';
import { getShopForAdmin, approveShop, rejectShop } from '../../services/shopService';
import {
  fetchCommunityMap,
  getShopPinForAdmin,
  approveMapPin,
} from '../../services/mapPinService';

const statusStyles = {
  ACTIVE: 'bg-green-100 text-green-700 border border-green-200',
  PENDING: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  REJECTED: 'bg-red-100 text-red-700 border border-red-200',
};

const formatStatus = (status = '') => status.toUpperCase();

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-medium text-gray-900 text-right max-w-xs">{value || '-'}</span>
  </div>
);

const PlatformShopApproval = () => {
  const { ct } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id: communityId, shopId } = useParams();

  const {
    data: shop,
    isLoading: shopLoading,
    error: shopError,
  } = useQuery({
    queryKey: ['platform-shop', shopId],
    queryFn: () => getShopForAdmin(shopId),
    enabled: !!shopId,
    staleTime: 1000 * 30,
  });

  const {
    data: pin,
    isLoading: pinLoading,
  } = useQuery({
    queryKey: ['platform-shop-pin', shopId],
    queryFn: () => getShopPinForAdmin(shopId),
    enabled: !!shopId,
    staleTime: 1000 * 15,
  });

  const {
    data: mapData,
    isLoading: mapLoading,
  } = useQuery({
    queryKey: ['community-map', communityId],
    queryFn: () => fetchCommunityMap(communityId),
    enabled: !!communityId,
    staleTime: 1000 * 60,
  });

  const shopStatus = shop?.status || 'PENDING';
  const pinStatus = pin?.status || 'PENDING';

  const handleSuccessToast = (message) => {
    Swal.fire({
      icon: 'success',
      title: ct('สำเร็จ', 'Success'),
      text: message,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleErrorToast = (errorMessage) => {
    Swal.fire({
      icon: 'error',
      title: ct('เกิดข้อผิดพลาด', 'Error'),
      text: errorMessage,
    });
  };

  const approveShopMutation = useMutation({
    mutationFn: () => approveShop(shopId),
    onSuccess: () => {
      queryClient.invalidateQueries(['platform-shop', shopId]);
      queryClient.invalidateQueries(['platform-community', communityId]);
      handleSuccessToast(ct('อนุมัติร้านค้าเรียบร้อยแล้ว', 'Shop approved successfully.'));
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error.message;
      handleErrorToast(message);
    },
  });

  const rejectShopMutation = useMutation({
    mutationFn: () => rejectShop(shopId),
    onSuccess: () => {
      queryClient.invalidateQueries(['platform-shop', shopId]);
      queryClient.invalidateQueries(['platform-community', communityId]);
      handleSuccessToast(ct('ปฏิเสธร้านค้าเรียบร้อยแล้ว', 'Shop rejected successfully.'));
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error.message;
      handleErrorToast(message);
    },
  });

  const approvePinMutation = useMutation({
    mutationFn: () => approveMapPin(pin?.pinId),
    onSuccess: () => {
      queryClient.invalidateQueries(['platform-shop-pin', shopId]);
      queryClient.invalidateQueries(['community-map', communityId]);
      handleSuccessToast(ct('อนุมัติหมุดบนแผนที่เรียบร้อยแล้ว', 'Map pin approved successfully.'));
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error.message;
      handleErrorToast(message);
    },
    retry: 0,
  });

  const mapPins = useMemo(() => {
    if (!mapData?.pins?.length) return [];
    return mapData.pins.map((item) => ({
      id: item.id,
      x: item.positionX,
      y: item.positionY,
      isCurrent: pin?.hasPin && pin.pinId?.toString() === item.id.toString(),
    }));
  }, [mapData, pin]);

  if (shopLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF8F3]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">{ct('กำลังโหลดข้อมูลร้านค้า...', 'Loading shop data...')}</p>
        </div>
      </div>
    );
  }

  if (shopError || !shop) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF8F3]">
        <div className="text-center space-y-4">
          <p className="text-gray-700">{ct('ไม่พบข้อมูลร้านค้านี้', 'Unable to load shop data.')}</p>
          <button
            onClick={() => navigate(`/platform-admin/communities/${communityId}`)}
            className="px-4 py-2 text-sm font-semibold text-white bg-orange-500 rounded-lg"
          >
            {ct('กลับไปหน้าก่อนหน้า', 'Go back')}
          </button>
        </div>
      </div>
    );
  }

  const contact = shop.contact || {};
  const location = shop.location || {};
  const addressValue = shop.address || location.address || ct('ไม่ระบุที่อยู่', 'No address provided');
  const openTimeDisplay = shop.openTime || ct('ไม่ระบุ', 'Not specified');
  const closeTimeDisplay = shop.closeTime || ct('ไม่ระบุ', 'Not specified');

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <button
          onClick={() => navigate(`/platform-admin/communities/${communityId}`)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">{ct('กลับไปหน้าชุมชน', 'Back to community')}</span>
        </button>

        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-orange-500 font-semibold mb-1">
                {ct('การอนุมัติร้านค้า', 'Shop Approval')}
              </p>
              <h1 className="text-3xl font-bold text-gray-900">{shop.shopName}</h1>
              <p className="text-sm text-gray-500 mt-2">
                {ct('ชุมชน', 'Community')}: {communityId}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusStyles[shopStatus] || statusStyles.PENDING}`}>
                {ct('สถานะร้าน', 'Shop Status')}: {formatStatus(shopStatus)}
              </span>
              {pin?.hasPin && (
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${pinStatus === 'APPROVED' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}>
                  {ct('สถานะหมุด', 'Pin Status')}: {formatStatus(pinStatus)}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              disabled={shopStatus === 'ACTIVE' || approveShopMutation.isLoading}
              onClick={() => approveShopMutation.mutate()}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-green-600 text-white font-semibold shadow-sm hover:bg-green-700 disabled:opacity-50"
            >
              {approveShopMutation.isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              <CheckCircle className="h-4 w-4" />
              <span>{ct('อนุมัติร้าน', 'Approve Shop')}</span>
            </button>
            <button
              disabled={shopStatus === 'REJECTED' || rejectShopMutation.isLoading}
              onClick={() => rejectShopMutation.mutate()}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-red-500 text-white font-semibold shadow-sm hover:bg-red-600 disabled:opacity-50"
            >
              {rejectShopMutation.isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              <XCircle className="h-4 w-4" />
              <span>{ct('ปฏิเสธร้าน', 'Reject Shop')}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{ct('ข้อมูลร้านค้า', 'Shop Information')}</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {shop.description || ct('ไม่มีคำอธิบายร้านค้า', 'No description provided.')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label={ct('เวลาเปิด', 'Open time')} value={openTimeDisplay} />
                <InfoRow label={ct('เวลาปิด', 'Close time')} value={closeTimeDisplay} />
                <InfoRow label={ct('ที่อยู่', 'Address')} value={addressValue} />
                <InfoRow label={ct('รหัสร้าน', 'Shop ID')} value={shop._id} />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{ct('ช่องทางการติดต่อ', 'Contact')}</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100">
                  <Phone className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">{ct('โทรศัพท์', 'Phone')}</p>
                    <p className="text-sm font-medium text-gray-900">{contact.phone || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100">
                  <MessageSquare className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">LINE</p>
                    <p className="text-sm font-medium text-gray-900">{contact.line || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100">
                  <Facebook className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Facebook</p>
                    <p className="text-sm font-medium text-gray-900">{contact.facebook || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{ct('หมุดบนแผนที่', 'Map Pin')}</h2>
                {pin?.hasPin && (
                  <span className="text-sm text-gray-500">{ct('พิกัด', 'Coordinates')}: X {pin.position_x?.toFixed?.(2) ?? pin.position_x}, Y {pin.position_y?.toFixed?.(2) ?? pin.position_y}</span>
                )}
              </div>
              <div className="rounded-2xl border border-gray-100 overflow-hidden">
                <div className="relative w-full h-80 bg-gray-50">
                  {mapLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 space-y-3">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <p>{ct('กำลังโหลดแผนที่...', 'Loading community map...')}</p>
                    </div>
                  ) : mapData?.map_image ? (
                    <div
                      className="w-full h-full bg-cover bg-center relative"
                      style={{ backgroundImage: `url(${mapData.map_image})` }}
                    >
                      {mapPins.map((mapPin) => (
                        <div
                          key={mapPin.id}
                          className={`absolute w-3 h-3 rounded-full border-2 border-white ${mapPin.isCurrent ? 'bg-orange-500 shadow-lg' : 'bg-gray-400/80'}`}
                          style={{
                            top: `${mapPin.y}%`,
                            left: `${mapPin.x}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                        />
                      ))}

                      {pin?.hasPin && (
                        <div
                          className="absolute"
                          style={{
                            top: `${pin.position_y}%`,
                            left: `${pin.position_x}%`,
                            transform: 'translate(-50%, -100%)',
                          }}
                        >
                          <MapPin className="h-8 w-8 text-orange-500 drop-shadow-lg" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                      <MapPin className="h-10 w-10 text-gray-400 mb-3" />
                      <p>{ct('ยังไม่ได้อัปโหลดแผนที่ชุมชน', 'No community map uploaded yet.')}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {pin?.hasPin ? (
                  <>
                    <p className="text-sm text-gray-600">
                      {ct('ตรวจสอบตำแหน่งหมุดก่อนทำการอนุมัติ หากถูกต้องให้กดปุ่มด้านล่าง', 'Review the pin location before approving.')}
                    </p>
                    <button
                      disabled={pinStatus === 'APPROVED' || approvePinMutation.isLoading}
                      onClick={() => approvePinMutation.mutate()}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-50"
                    >
                      {approvePinMutation.isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      <CheckCircle className="h-4 w-4" />
                      <span>{pinStatus === 'APPROVED' ? ct('หมุดได้รับการอนุมัติแล้ว', 'Pin already approved') : ct('อนุมัติหมุดบนแผนที่', 'Approve map pin')}</span>
                    </button>
                  </>
                ) : (
                  <div className="rounded-2xl bg-gray-50 border border-dashed border-gray-200 p-4 text-center">
                    <p className="text-sm text-gray-500">
                      {ct('ร้านค้านี้ยังไม่ได้วางหมุดบนแผนที่', 'This shop has not placed a map pin yet.')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformShopApproval;
