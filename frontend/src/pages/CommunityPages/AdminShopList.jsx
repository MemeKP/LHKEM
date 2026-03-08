import { useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Store, MapPin, Users, Search, List, AlertCircle, Filter } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { getAdminShopsByCommunity, approveShop } from '../../services/shopService';
import { getShopCoverImage } from '../../utils/image';
import Swal from 'sweetalert2';

const statusFilters = [
  { id: 'ALL', label: { th: 'ทั้งหมด', en: 'All' } },
  { id: 'PENDING', label: { th: 'รออนุมัติ', en: 'Pending' } },
  { id: 'ACTIVE', label: { th: 'อนุมัติแล้ว', en: 'Approved' } },
  { id: 'REJECTED', label: { th: 'ถูกปฏิเสธ', en: 'Rejected' } },
];

const statusBadges = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  DEFAULT: 'bg-gray-100 text-gray-700',
};

const statusLabels = {
  PENDING: { th: 'รออนุมัติ', en: 'Pending' },
  ACTIVE: { th: 'อนุมัติแล้ว', en: 'Approved' },
  REJECTED: { th: 'ถูกปฏิเสธ', en: 'Rejected' },
};

const normalizeStatus = (status) => (status || 'PENDING').toUpperCase();

const AdminShopList = () => {
  const { community } = useOutletContext();
  const { ct } = useTranslation();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const {
    data: shops = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['community-shops-admin', community?._id],
    queryFn: () => getAdminShopsByCommunity(community?._id),
    enabled: !!community?._id,
    staleTime: 1000 * 30,
  });

  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      const normalizedStatus = normalizeStatus(shop.status);
      const matchesStatus = statusFilter === 'ALL' || normalizedStatus === statusFilter;
      const keyword = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !keyword ||
        shop.shopName?.toLowerCase().includes(keyword) ||
        shop.ownerName?.toLowerCase().includes(keyword) ||
        shop.owner?.name?.toLowerCase().includes(keyword) ||
        shop.address?.toLowerCase().includes(keyword) ||
        shop.location?.address?.toLowerCase().includes(keyword) ||
        shop.description?.toLowerCase().includes(keyword);
      return matchesStatus && matchesSearch;
    });
  }, [shops, statusFilter, searchTerm]);

  const resolveStatusLabel = (status) => {
    const normalized = normalizeStatus(status);
    const label = statusLabels[normalized] || { th: 'ไม่ทราบสถานะ', en: 'Unknown' };
    return ct(label.th, label.en);
  };

  const resolveBadgeClasses = (status) => {
    const normalized = normalizeStatus(status);
    return statusBadges[normalized] || statusBadges.DEFAULT;
  };

  const resolveSecondaryCta = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === 'PENDING') return ct('อนุมัติ', 'Approve');
    if (normalized === 'REJECTED') return ct('พิจารณาใหม่', 'Revisit');
    return ct('จัดการ', 'Manage');
  };

  const handleApproveShop = async (shopId) => {
    const result = await Swal.fire({
      title: ct('ยืนยันการอนุมัติร้านค้า?', 'Approve this shop?'),
      text: ct('ร้านค้าจะปรากฏในแผนที่และรายการเมื่อตรวจสอบผ่าน', 'The shop will become visible on listings once approved.'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: ct('อนุมัติ', 'Approve'),
      cancelButtonText: ct('ยกเลิก', 'Cancel'),
      confirmButtonColor: '#1E293B'
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: ct('กำลังอนุมัติ...', 'Approving...'),
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      await approveShop(shopId);

      Swal.close();
      await Swal.fire({
        icon: 'success',
        title: ct('อนุมัติร้านค้าสำเร็จ', 'Shop approved'),
        timer: 2000,
        showConfirmButton: false,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['community-shops-admin', community?._id] }),
        queryClient.invalidateQueries({ queryKey: ['community-shops', community?._id] }),
        queryClient.invalidateQueries({ queryKey: ['community-pending-shops', community?._id] }),
      ]);
    } catch (error) {
      console.error('Failed to approve shop:', error);
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: ct('อนุมัติร้านค้าไม่สำเร็จ', 'Shop approval failed'),
        text: error.response?.data?.message || ct('กรุณาลองใหม่อีกครั้ง', 'Please try again later')
      });
    }
  };

  const handleSecondaryAction = (shop) => {
    const normalized = normalizeStatus(shop.status);
    if (normalized === 'PENDING') {
      handleApproveShop(shop._id);
    } else {
      navigate(`/community-admin/shops/${shop._id}/approval`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EFE7] py-10 animate-fadeIn">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between animate-slideUp">
          <div>
            <p className="text-base font-bold uppercase tracking-wide text-[#8E24AA] mb-1">
              {ct('ร้านค้าในชุมชน', 'Community Shops')}
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1A1A1A] mb-2">
              {ct('จัดการร้านค้าทั้งหมด', 'Manage Community Shops')}
            </h1>
            <p className="text-lg font-bold text-[#666666]">
              {ct('ดูสถานะร้านค้าและดำเนินการอนุมัติจากหน้ารวมนี้', 'Review every shop status and approve directly from here.')}
            </p>
          </div>
          <button
            onClick={() => navigate('/community-admin/dashboard')}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-300 text-base font-bold text-gray-800 hover:bg-white shadow-sm"
          >
            <List className="h-4 w-4" />
            {ct('กลับแดชบอร์ด', 'Back to dashboard')}
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-stretch animate-slideUp">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={ct('ค้นหาร้านค้า ชื่อ ที่อยู่ หรือเจ้าของ', 'Search by shop name, address, or owner')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8E24AA]/40 text-base font-bold"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="h-4 w-4 text-gray-500" />
            {statusFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setStatusFilter(filter.id)}
                className={`px-6 py-2.5 rounded-full text-base font-bold transition-colors border ${
                  statusFilter === filter.id
                    ? 'bg-[#8E24AA] text-white border-[#8E24AA]'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {ct(filter.label.th, filter.label.en)}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-lg font-bold text-gray-500 animate-slideUp">
            {ct('กำลังโหลดรายชื่อร้านค้า...', 'Loading shop list...')}
          </div>
        ) : isError ? (
          <div className="bg-white rounded-2xl border border-red-200 p-10 text-center text-lg font-bold text-red-600 animate-slideUp">
            {ct('ไม่สามารถโหลดรายชื่อร้านค้าได้', 'Unable to load shop list.')}
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 flex flex-col items-center text-center text-gray-500 animate-slideUp">
            <AlertCircle className="h-10 w-10 mb-3 text-gray-400" />
            <p className="text-lg font-bold">{ct('ไม่พบร้านค้าตามเงื่อนไขที่เลือก', 'No shops matched the selected filters.')}</p>
            <p className="text-base font-bold text-gray-400">{ct('ลองปรับสถานะหรือคำค้นหาใหม่', 'Try changing the status filter or search term')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-stagger">
            {filteredShops.map((shop) => {
              const coverImage = getShopCoverImage(shop);
              return (
              <div key={shop._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all p-5 flex flex-col gap-4 transform hover:-translate-y-1">
                {coverImage && (
                  <div className="w-full h-36 rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={coverImage}
                      alt={shop.shopName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{ct('ร้านค้า', 'Shop')}</p>
                      <h3 className="text-lg font-semibold text-[#1A1A1A] truncate">{shop.shopName}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold shrink-0 ${resolveBadgeClasses(shop.status)}`}>
                      {resolveStatusLabel(shop.status)}
                    </span>
                  </div>

                  <p className="text-sm text-[#666666] whitespace-pre-line wrap-break-word max-h-20 overflow-y-auto w-full leading-relaxed scrollbar-thin">
                    {shop.description || ct('ยังไม่มีคำอธิบาย', 'No description')}
                  </p>
                </div>
                <div className="space-y-2 text-sm text-[#555555]">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-[#8E24AA] mt-0.5 flex-shrink-0" />
                    <span className="text-sm break-words line-clamp-2" title={shop.address || shop.location?.address || ''}>{shop.address || shop.location?.address || ct('ยังไม่ระบุที่อยู่', 'No address provided')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#8E24AA]" />
                    <span>{shop.owner?.name || shop.ownerName || ct('ยังไม่ระบุเจ้าของ', 'Owner not specified')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <span>{ct('เปิด', 'Open')}: {shop.openTime || '-'}</span>
                    <span>•</span>
                    <span>{ct('ปิด', 'Close')}: {shop.closeTime || '-'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/community-admin/shops/${shop._id}/approval`)}
                    className="flex-1 px-6 py-2.5 bg-[#FFC107] hover:bg-[#FFB300] text-[#1A1A1A] text-base font-bold rounded-lg transition-all transform hover:-translate-y-0.5"
                  >
                    {ct('ดูรายละเอียด', 'View details')}
                  </button>
                  <button
                    onClick={() => handleSecondaryAction(shop)}
                    className="px-6 py-2.5 bg-[#1E293B] hover:bg-[#0F172A] text-white text-base font-bold rounded-lg transition-all transform hover:-translate-y-0.5"
                  >
                    {resolveSecondaryCta(shop.status)}
                  </button>
                </div>
              </div>
            );})}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminShopList;
