import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Users, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Camera, Settings as SettingsIcon, Bell, Calendar, TrendingUp, Star, Edit3 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useTranslation } from '../../hooks/useTranslation';

import { useMyShop } from '../../hooks/useMyShop';
import { resolveImageUrl } from '../../utils/image';
import api from '../../services/api';

const ShopDashboard = () => {
  const { t, ct } = useTranslation();
  const navigate = useNavigate();
  const { slug } = useParams();
  
  const { data: shop, isLoading: shopLoading, clearShopCache } = useMyShop();
  const isPendingShop = !shopLoading && shop && shop.status !== 'ACTIVE';

  const [activeTab, setActiveTab] = useState('all');
  const [workshops, setWorkshops] = useState([]);
  const [isLoadingWorkshops, setIsLoadingWorkshops] = useState(false);

  // Clear cache
  useEffect(() => {
    return () => {
      clearShopCache();
    };
  }, [clearShopCache]);

  // Loading
  useEffect(() => {
    if (!shopLoading && !shop) {
      navigate('/shop/create');
    }
  }, [shop, shopLoading, navigate]);

  // Fetch Shop's Workshops (WITH CACHE BUSTING)
  useEffect(() => {
    const fetchShopWorkshops = async () => {
      if (!shop?._id) return;
      
      setIsLoadingWorkshops(true);
      try {
        // Force fresh data by appending a timestamp to the URL
        const timestamp = new Date().getTime();
        const res = await api.get(`/management/workshops/shop/${shop._id}?_t=${timestamp}`);
        const data = res.data?.data || res.data || [];
        setWorkshops(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch shop workshops:', error);
      } finally {
        setIsLoadingWorkshops(false);
      }
    };

    fetchShopWorkshops();
  }, [shop?._id]);

  const profile = {
    name: shop?.shopName || '',
    description: shop?.description || '',
    openTime: shop?.openTime || '',
    contactLinks: shop?.contact || { phone: '', line: '', facebook: '', website: '' },
    location: shop?.location || { address: '' },
    iconUrl: shop?.iconUrl || '',
    coverUrl: shop?.picture || '',
    status: shop?.status || 'PENDING',
  };

  const stats = useMemo(() => {
    const active = workshops.filter(w => (w.approvalStatus || w.status) === 'ACTIVE');
    const pending = workshops.filter(w => (w.approvalStatus || w.status || 'PENDING') === 'PENDING');
    
    return {
      totalWorkshops: workshops.length,
      activeWorkshops: active.length,
      totalBookings: workshops.reduce((sum, w) => sum + (w.current_participants || w.seatsBooked || 0), 0),
      totalRevenue: workshops.reduce((sum, w) => sum + ((w.current_participants || w.seatsBooked || 0) * (w.price || 0)), 0),
      averageRating: 0,
      pendingApprovals: pending.length,
      pendingWorkshops: pending
    };
  }, [workshops]);

  const getWorkshopImage = (workshop = {}) => {
    const candidates = [
      workshop.image,
      Array.isArray(workshop.images) ? workshop.images[0] : null,
      workshop.imageUrl,
      workshop.picture,
    ];

    for (const candidate of candidates) {
      const resolved = resolveImageUrl(candidate);
      if (resolved) return resolved;
    }

    return null;
  };

  const handleDeleteWorkshop = async (workshopId) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: ct('ยืนยันการลบ Workshop?', 'Delete this workshop?'),
      text: ct('การลบครั้งนี้จะลบข้อมูลการลงทะเบียนทั้งหมดด้วย คุณแน่ใจหรือไม่?', 'Deleting will remove all registrations for this workshop. Are you sure?'),
      showCancelButton: true,
      confirmButtonText: ct('ลบ Workshop', 'Delete workshop'),
      cancelButtonText: ct('ยกเลิก', 'Cancel'),
      reverseButtons: true,
      focusCancel: true,
    });
    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: ct('กำลังลบ...', 'Deleting...'),
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      await api.delete(`/management/workshops/${workshopId}`);

      setWorkshops((prev) => prev.filter((w) => (w._id || w.id) !== workshopId));

      Swal.fire({
        icon: 'success',
        title: ct('ลบ Workshop แล้ว', 'Workshop deleted'),
        text: ct('ระบบลบข้อมูลเรียบร้อย', 'The workshop and its registrations have been removed.'),
        confirmButtonText: ct('เรียบร้อย', 'Done'),
      });
    } catch (error) {
      console.error('Delete failed:', error);
      const message = error?.response?.data?.message || error.message || ct('ไม่สามารถลบข้อมูลได้ กรุณาลองใหม่อีกครั้ง', 'Unable to delete data. Please try again.');
      Swal.fire({
        icon: 'error',
        title: ct('ลบไม่สำเร็จ', 'Delete failed'),
        text: message,
        confirmButtonText: ct('ลองใหม่', 'Try again'),
      });
    }
  };
  
  const renderBadges = (approvalStatus, registrationStatus) => {
    let approvalBadge = null;
    let regBadge = null;

    switch (approvalStatus) {
      case 'PENDING':
        approvalBadge = <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200"><Clock className="h-3 w-3" /> {ct('รออนุมัติ', 'Pending Approval')}</span>;
        break;
      case 'CHANGE':
        approvalBadge = <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200"><Edit3 className="h-3 w-3" /> {ct('ต้องแก้ไข', 'Revision Needed')}</span>;
        break;
      case 'REJECTED':
        approvalBadge = <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200"><AlertCircle className="h-3 w-3" /> {ct('ไม่อนุมัติ', 'Rejected')}</span>;
        break;
      case 'ACTIVE':
        approvalBadge = <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"><CheckCircle className="h-3 w-3" /> {ct('อนุมัติ', 'Approved')}</span>;
        break;
      default:
        approvalBadge = null;
    }

    if (approvalStatus === 'ACTIVE') {
       if (registrationStatus === 'OPEN') {
          regBadge = <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><Users className="h-3 w-3" /> {ct('เปิดรับสมัคร', 'Open')}</span>;
       } else {
          regBadge = <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"><XCircle className="h-3 w-3" /> {ct('ปิดรับสมัคร', 'Closed')}</span>;
       }
    }

    return (
      <div className="flex flex-col gap-2 items-end">
        {approvalBadge}
        {regBadge}
      </div>
    );
  };

  const filteredWorkshops = workshops.filter(w => {
    const approval = (w.approvalStatus || w.status || 'PENDING').toUpperCase();
    const registration = (w.registrationStatus || 'CLOSED').toUpperCase();
    
    switch (activeTab) {
      case 'all':
        return true;
      case 'active':
        return approval === 'ACTIVE' && registration === 'OPEN';
      case 'pending':
        return approval === 'PENDING';
      case 'revision':
        return approval === 'CHANGE' || approval === 'REJECTED';
      case 'closed':
        return approval === 'ACTIVE' && registration !== 'OPEN';
      default:
        return true;
    }
  });

  const dashboardTabs = [
    { id: 'all', label: ct('ทั้งหมด', 'All') },
    { id: 'active', label: ct('เปิดรับสมัคร', 'Active') },
    { id: 'pending', label: ct('รอตรวจสอบ', 'Pending') },
    { id: 'revision', label: ct('ต้องแก้ไข', 'Needs Revision') },
    { id: 'closed', label: ct('ปิดรับสมัคร', 'Closed') }
  ];

  return (
    <div className="min-h-screen bg-[#F5EFE7] py-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="relative rounded-xl overflow-hidden animate-slideDown">
            <div className="aspect-[16/6] w-full bg-gray-200">
              {profile.coverUrl && (
                <img 
                src={resolveImageUrl(profile.coverUrl)}
                alt="cover" 
                className="w-full h-full object-cover" />
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 animate-slideUp">
            <div>
              <h1 className="text-3xl font-bold text-[#2F4F2F]">{profile.name || t('shopDashboard.title')}</h1>
              <p className="text-[#6B6B6B] whitespace-pre-line wrap-break-word max-h-48 overflow-y-auto scrollbar-thin w-full max-w-2xl ">{profile.description}</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => navigate(`/${slug}/shop/profile`)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#E07B39] text-[#E07B39] font-medium rounded-full hover:bg-[#E07B39] hover:text-white transition-all hover:scale-105 shadow-sm"
              >
                <SettingsIcon className="h-4 w-4" />
                {ct('แก้ไขข้อมูลร้าน', 'Edit Shop Profile')}
              </button>
              <button
                onClick={() => {
                  if (isPendingShop) return;
                  navigate(`/${slug}/shop/workshops/create`);
                }}
                disabled={isPendingShop}
                className={`flex items-center gap-2 px-5 py-2.5 font-medium rounded-full shadow-md transition-all hover:shadow-lg ${
                  isPendingShop
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#4CAF50] text-white hover:bg-[#45A049] hover:scale-105'
                }`}
              >
                <Plus className="h-4 w-4" />
                {ct('สร้าง Workshop ใหม่', 'Create Workshop')}
              </button>
            </div>
          </div>
        </div>

        {isPendingShop && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
            <AlertCircle className="h-6 w-6 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                {t('shopDashboard.pending.inlineTitle', 'ร้านค้าของคุณกำลังรอตรวจสอบ')}
              </p>
              <p className="text-sm text-amber-800">
                {t(
                  'shopDashboard.pending.inlineDescription',
                  'คุณสามารถแก้ไขข้อมูลร้านได้ แต่การสร้าง/จัดการ Workshop จะเปิดให้ใช้งานหลังจากได้รับการอนุมัติ'
                )}
              </p>
            </div>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-stagger">
            <div className="bg-white rounded-xl shadow-sm p-5 animate-fadeIn border border-gray-100 hover:shadow-md transition-all hover:scale-[1.02]" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#FFF7ED] rounded-lg">
                  <Calendar className="h-5 w-5 text-[#E07B39]" />
                </div>
                <p className="text-xs font-semibold text-[#6B6B6B]">{ct('Workshop ทั้งหมด', 'Total Workshops')}</p>
              </div>
              <p className="text-2xl font-bold text-[#3D3D3D]">{stats.totalWorkshops}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 animate-fadeIn border border-gray-100 hover:shadow-md transition-all hover:scale-[1.02]" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#E8F5E9] rounded-lg">
                  <Users className="h-5 w-5 text-[#4CAF50]" />
                </div>
                <p className="text-xs font-semibold text-[#6B6B6B]">{ct('ผู้เข้าร่วมทั้งหมด', 'Total Participants')}</p>
              </div>
              <p className="text-2xl font-bold text-[#3D3D3D]">{stats.totalBookings}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 animate-fadeIn border border-gray-100 hover:shadow-md transition-all hover:scale-[1.02]" style={{animationDelay: '0.4s'}}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#E3F2FD] rounded-lg">
                  <TrendingUp className="h-5 w-5 text-[#2196F3]" />
                </div>
                <p className="text-xs font-semibold text-[#6B6B6B]">{ct('Workshop ที่รออนุมัติ', 'Pending Workshops')}</p>
              </div>
              <p className="text-2xl font-bold text-[#3D3D3D]">{stats.pendingApprovals}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 pt-6 pb-4">
            <h2 className="text-xl font-bold text-[#2F4F2F] mb-4">{ct('Workshop ของร้านคุณ', 'Your Workshops')}</h2>
          </div>
          <div className="border-b border-gray-200 overflow-x-auto">
            <div className="flex space-x-8 px-6 whitespace-nowrap min-w-max">
              {dashboardTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                    activeTab === tab.id
                      ? 'border-[#E07B39] text-[#E07B39]'
                      : 'border-transparent text-[#6B6B6B] hover:text-[#3D3D3D] hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {isLoadingWorkshops ? (
               <div className="flex justify-center py-10">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
               </div>
            ) : filteredWorkshops.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#2F4F2F] mb-2">
                  {ct('ไม่มีข้อมูล Workshop ในหมวดหมู่นี้', 'No workshops in this category')}
                </h3>
              </div>
            ) : (
              <div className="space-y-4 animate-stagger">
                {filteredWorkshops.map((workshop) => (
                  <div key={workshop._id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow animate-scaleIn">
                    <div className="flex gap-4">
                      <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        {(() => {
                          const imageSrc = getWorkshopImage(workshop);
                          if (imageSrc) {
                            return (
                              <img
                                src={imageSrc}
                                alt={workshop.title}
                                className="w-full h-full object-cover"
                              />
                            );
                          }
                          return (
                            <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
                              <Camera className="h-6 w-6" />
                              <span className="mt-1 text-xs">{ct('ยังไม่มีรูป', 'No image')}</span>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1 ">
                            <h3 className="text-lg font-semibold text-[#2F4F2F] mb-1">{workshop.title}</h3>
                            <p className="text-sm text-[#6B6B6B] whitespace-pre-line wrap-break-word max-h-48 overflow-y-auto scrollbar-thin w-full max-w-2xl">{workshop.description || ct('ไม่มีคำอธิบาย', 'No description')}</p>
                          </div>
                          {renderBadges(workshop.approvalStatus, workshop.registrationStatus)}
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-600 mt-3">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{workshop.current_participants || 0} / {workshop.capacity || 10} {ct('คน', 'people')}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-xl font-bold text-[#E07B39]">฿{workshop.price || 0}</div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                if (isPendingShop) return;
                                navigate(`/${slug}/shop/workshops/${workshop._id}`);
                              }}
                              disabled={isPendingShop}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                isPendingShop
                                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                  : 'bg-[#E07B39] text-white hover:bg-[#D66B29] hover:scale-105 shadow-sm'
                              }`}
                            >
                              {isPendingShop ? ct('รออนุมัติ', 'Pending') : ct('ดูรายละเอียด', 'View Details')}
                            </button>
                            <button
                              onClick={() => {
                                if (isPendingShop) return;
                                handleDeleteWorkshop(workshop._id);
                              }}
                              disabled={isPendingShop}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                isPendingShop
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-red-50 text-red-600 hover:bg-red-100 hover:scale-105'
                              }`}
                            >
                              {ct('ลบ', 'Delete')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDashboard;