import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Users, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Camera, Settings as SettingsIcon } from 'lucide-react';
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
    return {
      totalWorkshops: workshops.length,
      activeWorkshops: active.length,
      totalBookings: workshops.reduce((sum, w) => sum + (w.seatsBooked || 0), 0),
      totalRevenue: workshops.reduce((sum, w) => sum + ((w.seatsBooked || 0) * (w.price || 0)), 0),
      averageRating: 0,
      pendingApprovals: workshops.filter(w => w.status === 'PENDING').length
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
    <div className="min-h-screen bg-gray-50 py-8 animate-fadeIn">
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
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
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
                  <button onClick={saveProfile} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">บันทึก</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-stagger">
            <div className="bg-white rounded-lg shadow-sm p-6 animate-scaleIn">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('shopDashboard.stats.totalWorkshops')}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalWorkshops}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 animate-scaleIn">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('shopDashboard.stats.activeWorkshops')}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeWorkshops}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 animate-scaleIn">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('shopDashboard.stats.totalBookings')}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalBookings}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 animate-scaleIn">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('shopDashboard.stats.totalRevenue')}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">฿{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger">
                {filteredWorkshops.map((workshop) => (
                  <div key={workshop.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 animate-scaleIn transition-transform hover:scale-[1.01]">
                    <div className="relative aspect-video bg-gray-100">
                      {workshop.imageUrl && (
                        <img src={workshop.imageUrl} alt={workshop.title} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute top-3 left-3 px-2 py-1 bg-white rounded-full text-xs font-semibold shadow">
                        {workshop.rating ? Number(workshop.rating).toFixed(1) : '4.9'}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-orange-600">งานช่าง</span>
                        {getStatusBadge(workshop.status)}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{workshop.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {workshop.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-700 mt-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{workshop.duration ? `${workshop.duration} นาที` : '3 ชม.'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>สูงสุด {workshop.seatLimit || 8} คน</span>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-orange-600 font-bold">฿{workshop.price || 880}</div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/shop/workshops/${workshop.id}`)}
                            className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 text-sm"
                          >
                            {t('shopDashboard.view')}
                          </button>
                          <button
                            onClick={() => handleDeleteWorkshop(workshop.id)}
                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm"
                          >
                            {t('shopDashboard.delete')}
                          </button>
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
