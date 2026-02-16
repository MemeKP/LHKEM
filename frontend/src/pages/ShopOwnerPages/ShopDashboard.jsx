import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Users, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Camera, Settings as SettingsIcon, Bell, Calendar, TrendingUp, Star } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
// Frontend-only prototype: use localStorage instead of API

const ShopDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const initialDraft = JSON.parse(localStorage.getItem('shopDraft') || '{}');
  const initialWorkshops = Array.isArray(initialDraft.workshops) ? initialDraft.workshops : [];
  const [workshops, setWorkshops] = useState(initialWorkshops);
  const [activeTab, setActiveTab] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [profile, setProfile] = useState({
    name: initialDraft.name || '',
    description: initialDraft.description || '',
    openTime: initialDraft.openTime || '',
    closeTime: initialDraft.closeTime || '',
    contactLinks: initialDraft.contactLinks || { phone: '', line: '' , facebook: '', website: ''},
    location: initialDraft.location || { address: '' },
    iconUrl: initialDraft.iconUrl || '',
    coverUrl: initialDraft.coverUrl || '',
  });

  useEffect(() => {
    const hasSetup = localStorage.getItem('shopHasSetup') === 'true';
    if (!user?.shopId && !hasSetup) {
      navigate('/shop/create');
      return;
    }
  }, [user, navigate]);

  // no-op for prototype

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
    <div className="min-h-screen bg-[#FAF8F3] py-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="relative rounded-xl overflow-hidden animate-slideDown">
            <div className="aspect-[16/6] w-full bg-gray-200">
              {profile.coverUrl && (
                <img src={profile.coverUrl} alt="cover" className="w-full h-full object-cover" />
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 animate-slideUp">
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 rounded-full bg-white shadow ring-2 ring-white overflow-hidden flex items-center justify-center text-orange-600 text-3xl font-bold">
                {profile.iconUrl ? <img src={profile.iconUrl} alt="icon" className="h-full w-full object-cover" /> : (profile.name?.charAt(0) || 'S')}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile.name || t('shopDashboard.title')}</h1>
                <p className="text-gray-600">{profile.description}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSettings(s => !s)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
              >
                <SettingsIcon className="h-4 w-4" />
                {t('shopDashboard.manageProfile')}
              </button>
              <button
                onClick={() => navigate('/shop/workshops/create')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                {t('shopDashboard.createWorkshop')}
              </button>
            </div>
          </div>
        </div>

        {showSettings && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8 animate-scaleIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อร้าน</label>
                  <input name="name" value={profile.name} onChange={handleProfileChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">คำอธิบาย</label>
                  <textarea name="description" value={profile.description} onChange={handleProfileChange} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">เปิด</label>
                    <input name="openTime" value={profile.openTime} onChange={handleProfileChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ปิด</label>
                    <input name="closeTime" value={profile.closeTime} onChange={handleProfileChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ภาพหน้าปก</label>
                  <div className="aspect-[16/9] w-full bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    {profile.coverUrl ? <img src={profile.coverUrl} alt="cover" className="w-full h-full object-cover" /> : <div className="text-gray-400">ตัวอย่างภาพ</div>}
                  </div>
                  <label className="mt-2 inline-flex items-center px-3 py-2 bg-gray-800 text-white rounded-lg cursor-pointer hover:bg-gray-700">
                    <Camera className="h-4 w-4 mr-2" />
                    อัปโหลด
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImagePick('coverUrl', e.target.files?.[0])} />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon ร้าน</label>
                  <div className="h-20 w-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-orange-600 text-2xl font-bold">
                    {profile.iconUrl ? <img src={profile.iconUrl} alt="icon" className="h-full w-full object-cover" /> : (profile.name?.charAt(0) || 'S')}
                  </div>
                  <label className="mt-2 inline-flex items-center px-3 py-2 bg-gray-800 text-white rounded-lg cursor-pointer hover:bg-gray-700">
                    <Camera className="h-4 w-4 mr-2" />
                    อัปโหลด
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImagePick('iconUrl', e.target.files?.[0])} />
                  </label>
                </div>
                <div className="flex justify-end">
                  <button onClick={saveProfile} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 shadow-sm">บันทึก</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-stagger">
            <div className="bg-white rounded-xl shadow-sm p-6 animate-scaleIn border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Workshop ทั้งหมด</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalWorkshops}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 animate-scaleIn border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">ผู้เข้าร่วมทั้งหมด</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 animate-scaleIn border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Workshop ที่รออนุมัติ</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pendingApprovals}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Section */}
        <div className="mb-8 animate-slideUp">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">การแจ้งเตือน</h2>
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
            <h2 className="text-lg font-semibold text-gray-900">ข้อมูลเสริม</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-2">กลยุทธ์ของคุณได้ผล!</h3>
              <p className="text-sm text-gray-600 mb-3">
                การตั้งราคาและคำอธิบายที่ดีจะช่วยให้ Workshop ของคุณดึงดูดผู้เข้าร่วมมากขึ้น
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-2">Workshop ที่ได้รับความสนใจสูงสุด</h3>
              <p className="text-sm text-gray-600 mb-3">
                {workshops.length > 0 ? workshops[0].title : 'ยังไม่มี Workshop'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 pt-6 pb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Workshop ของร้านคุณ</h2>
          </div>
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              {['all', 'active', 'pending', 'closed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('shopDashboard.noWorkshops.title')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('shopDashboard.noWorkshops.description')}
                </p>
                <button
                  onClick={() => navigate('/shop/workshops/create')}
                  className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  {t('shopDashboard.createWorkshop')}
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
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{workshop.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">{workshop.description || 'ไม่มีคำอธิบาย'}</p>
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
                          <div className="text-xl font-bold text-orange-600">฿{workshop.price || 0}</div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/shop/workshops/${workshop.id}`)}
                              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors"
                            >
                              ดูรายละเอียด
                            </button>
                            <button
                              onClick={() => handleDeleteWorkshop(workshop.id)}
                              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium transition-colors"
                            >
                              ลบ
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
