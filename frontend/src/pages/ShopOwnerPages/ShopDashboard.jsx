import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Users, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Camera, Settings as SettingsIcon, Bell, Calendar, TrendingUp, Star } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useMyShop } from '../../hooks/useMyShop';
import { resolveImageUrl } from '../../utils/image';

const ShopDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { slug } = useParams();
  const { data: shop, isLoading: shopLoading, clearShopCache } = useMyShop();
  const isPendingShop = !shopLoading && shop && shop.status !== 'ACTIVE';

  // Clear shop cache when user changes
  useEffect(() => {
    return () => {
      clearShopCache();
    };
  }, [clearShopCache]);

  useEffect(() => {
    if (!shopLoading && !shop) {
      navigate('/shop/create');
    }
  }, [shop, shopLoading, navigate]);

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

  const workshops = [];
  const activeTab = 'all';

  const stats = useMemo(() => {
    const active = workshops.filter(w => w.status === 'ACTIVE');
    const pending = workshops.filter(w => w.status === 'PENDING');
    return {
      totalWorkshops: workshops.length,
      activeWorkshops: active.length,
      totalBookings: workshops.reduce((sum, w) => sum + (w.seatsBooked || 0), 0),
      totalRevenue: workshops.reduce((sum, w) => sum + ((w.seatsBooked || 0) * (w.price || 0)), 0),
      averageRating: 0,
      pendingApprovals: pending.length,
      pendingWorkshops: pending
    };
  }, [workshops]);
  const handleDeleteWorkshop = async (id) => {
    if (!confirm(t('shopDashboard.confirmDelete'))) return;

    const draft = JSON.parse(localStorage.getItem('shopDraft') || '{}');
    const updated = {
      ...draft,
      workshops: (draft.workshops || []).filter(w => w.id !== id)
    };
    localStorage.setItem('shopDraft', JSON.stringify(updated));
    setWorkshops(updated.workshops);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: { ...(prev[parent]||{}), [child]: value }
      }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImagePick = (key, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile(prev => ({ ...prev, [key]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = () => {
    const draft = JSON.parse(localStorage.getItem('shopDraft') || '{}');
    const updated = { ...draft, ...profile };
    localStorage.setItem('shopDraft', JSON.stringify(updated));
    setShowSettings(false);
  };

  const getStatusBadge = (status) => {
    const config = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: t('shopDashboard.status.pending') },
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: t('shopDashboard.status.active') },
      CLOSED: { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle, label: t('shopDashboard.status.closed') },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: t('shopDashboard.status.cancelled') },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle, label: t('shopDashboard.status.rejected') }
    };

    const { bg, text, icon: Icon, label } = config[status] || config.PENDING;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
        <Icon className="h-3 w-3" />
        {label}
      </span>
    );
  };

  const filteredWorkshops = workshops.filter(w => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return w.status === 'ACTIVE';
    if (activeTab === 'pending') return w.status === 'PENDING';
    if (activeTab === 'closed') return w.status === 'CLOSED';
    return true;
  });

  // always render directly in prototype

  return (
    <div className="min-h-screen bg-[#F5EFE7] py-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="relative rounded-xl overflow-hidden animate-slideDown">
            <div className="aspect-[16/6] w-full bg-gray-200">
              {profile.coverUrl && (
                <img 
                // src={profile.coverUrl} 
                src={resolveImageUrl(profile.coverUrl)}
                alt="cover" 
                className="w-full h-full object-cover" />
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 animate-slideUp">
            <div>
              <h1 className="text-3xl font-bold text-[#2F4F2F]">{profile.name || t('shopDashboard.title')}</h1>
              <p className="text-[#6B6B6B]">{profile.description}</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => navigate(`/${slug}/shop/profile`)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#E07B39] text-[#E07B39] font-medium rounded-full hover:bg-[#E07B39] hover:text-white transition-all hover:scale-105 shadow-sm"
              >
                <SettingsIcon className="h-4 w-4" />
                แก้ไขข้อมูลร้าน
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
                สร้าง Workshop ใหม่
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
                <p className="text-xs font-semibold text-[#6B6B6B]">Workshop ทั้งหมด</p>
              </div>
              <p className="text-2xl font-bold text-[#3D3D3D]">{stats.totalWorkshops}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 animate-fadeIn border border-gray-100 hover:shadow-md transition-all hover:scale-[1.02]" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#E8F5E9] rounded-lg">
                  <Users className="h-5 w-5 text-[#4CAF50]" />
                </div>
                <p className="text-xs font-semibold text-[#6B6B6B]">ผู้เข้าร่วมทั้งหมด</p>
              </div>
              <p className="text-2xl font-bold text-[#3D3D3D]">{stats.totalBookings}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 animate-fadeIn border border-gray-100 hover:shadow-md transition-all hover:scale-[1.02]" style={{animationDelay: '0.4s'}}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#E3F2FD] rounded-lg">
                  <TrendingUp className="h-5 w-5 text-[#2196F3]" />
                </div>
                <p className="text-xs font-semibold text-[#6B6B6B]">Workshop ที่รออนุมัติ</p>
              </div>
              <p className="text-2xl font-bold text-[#3D3D3D]">{stats.pendingApprovals}</p>
            </div>
          </div>
        )}

        {/* Notifications Section */}
        <div className="mb-8 animate-slideUp">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-[#2F4F2F]">การแจ้งเตือน</h2>
          </div>
          <div className="space-y-3">
            {stats.pendingApprovals > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900">Workshop ที่รอการยืนยัน</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    คุณมี Workshop ที่รอการยืนยันจากแอดมิน {stats.pendingApprovals} รายการ
                  </p>
                </div>
              </div>
            )}
            {workshops.filter(w => w.status === 'ACTIVE').length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">Workshop ที่เปิดสอนอยู่</p>
                  <p className="text-sm text-green-700 mt-1">
                    กำลังเปิดสอน Workshop อยู่ {workshops.filter(w => w.status === 'ACTIVE').length} รายการ ตรวจสอบผู้เข้าร่วมได้ที่รายละเอียด Workshop
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-8 animate-slideUp">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-[#2F4F2F]">ข้อมูลเสริม</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-[#2F4F2F] mb-2">กลยุทธ์ของคุณได้ผล!</h3>
              <p className="text-sm text-[#6B6B6B] mb-3">
                การตั้งราคาและคำอธิบายที่ดีจะช่วยให้ Workshop ของคุณดึงดูดผู้เข้าร่วมมากขึ้น
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-[#2F4F2F] mb-2">เคล็ดลับ</h3>
              <p className="text-sm text-[#6B6B6B]">
                ลูกค้ามักจะชอบ Workshop ที่มีรูปภาพสวยและคำอธิบายชัดเจน
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 pt-6 pb-4">
            <h2 className="text-xl font-bold text-[#2F4F2F] mb-4">Workshop ของร้านคุณ</h2>
          </div>
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              {['all', 'active', 'pending', 'closed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                    activeTab === tab
                      ? 'border-[#E07B39] text-[#E07B39]'
                      : 'border-transparent text-[#6B6B6B] hover:text-[#3D3D3D] hover:border-gray-300'
                  }`}
                >
                  {t(`shopDashboard.tabs.${tab}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {filteredWorkshops.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#2F4F2F] mb-2">
                  {t('shopDashboard.noWorkshops.title')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('shopDashboard.noWorkshops.description')}
                </p>
                <button
                  onClick={() => {
                    if (isPendingShop) return;
                    navigate(`/${slug}/shop/workshops/create`);
                  }}
                  disabled={isPendingShop}
                  className={`inline-flex items-center px-6 py-3 font-semibold rounded-full shadow-md transition-all ${
                    isPendingShop
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#4CAF50] text-white hover:bg-[#45A049] hover:scale-105'
                  }`}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  {isPendingShop ? t('shopDashboard.pending.waitApproval', 'รอการอนุมัติร้าน') : t('shopDashboard.createWorkshop')}
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-stagger">
                {filteredWorkshops.map((workshop) => (
                  <div key={workshop.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow animate-scaleIn">
                    <div className="flex gap-4">
                      <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        {workshop.imageUrl && (
                          <img src={workshop.imageUrl} alt={workshop.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-[#2F4F2F] mb-1">{workshop.title}</h3>
                            <p className="text-sm text-[#6B6B6B] line-clamp-2">{workshop.description || 'ไม่มีคำอธิบาย'}</p>
                          </div>
                          {getStatusBadge(workshop.status)}
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-600 mt-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{workshop.rating ? Number(workshop.rating).toFixed(1) : '4.9'} คะแนน</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{workshop.duration ? `${workshop.duration} นาที` : '180 นาที'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{workshop.seatsBooked || 0} / {workshop.seatLimit || 10} คน</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-xl font-bold text-[#E07B39]">฿{workshop.price || 0}</div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                if (isPendingShop) return;
                                navigate(`/${slug}/shop/workshops/${workshop.id}`);
                              }}
                              disabled={isPendingShop}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                isPendingShop
                                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                  : 'bg-[#E07B39] text-white hover:bg-[#D66B29] hover:scale-105 shadow-sm'
                              }`}
                            >
                              {isPendingShop ? t('shopDashboard.pending.disabled', 'รออนุมัติ') : 'ดูรายละเอียด'}
                            </button>
                            <button
                              onClick={() => {
                                if (isPendingShop) return;
                                handleDeleteWorkshop(workshop.id);
                              }}
                              disabled={isPendingShop}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                isPendingShop
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-red-50 text-red-600 hover:bg-red-100 hover:scale-105'
                              }`}
                            >
                              {t('delete', 'ลบ')}
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
