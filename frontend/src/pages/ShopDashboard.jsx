import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Users, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import api from '../services/api';

const ShopDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [workshops, setWorkshops] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user?.shopId) return;

    try {
      const [workshopsRes, statsRes] = await Promise.all([
        api.get(`/shops/${user.shopId}/workshops`),
        api.get(`/shops/${user.shopId}/stats`)
      ]);

      setWorkshops(workshopsRes.data.workshops || []);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkshop = async (id) => {
    if (!confirm(t('shopDashboard.confirmDelete'))) return;

    try {
      await api.delete(`/workshops/${id}`);
      setWorkshops(workshops.filter(w => w.id !== id));
    } catch (error) {
      console.error('Failed to delete workshop:', error);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('shopDashboard.title')}</h1>
            <p className="text-gray-600 mt-1">{t('shopDashboard.subtitle')}</p>
          </div>
          <button
            onClick={() => navigate('/shop/workshops/create')}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            {t('shopDashboard.createWorkshop')}
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
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

            <div className="bg-white rounded-lg shadow-sm p-6">
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

            <div className="bg-white rounded-lg shadow-sm p-6">
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

            <div className="bg-white rounded-lg shadow-sm p-6">
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
              <div className="space-y-4">
                {filteredWorkshops.map((workshop) => (
                  <div
                    key={workshop.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{workshop.title}</h3>
                          {getStatusBadge(workshop.status)}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4">{workshop.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">{t('shopDashboard.price')}</p>
                            <p className="font-semibold text-gray-900">฿{workshop.price}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">{t('shopDashboard.seats')}</p>
                            <p className="font-semibold text-gray-900">
                              {workshop.seatsBooked}/{workshop.seatLimit}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">{t('shopDashboard.duration')}</p>
                            <p className="font-semibold text-gray-900">{workshop.duration}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">{t('shopDashboard.rating')}</p>
                            <p className="font-semibold text-gray-900">⭐ {workshop.rating.toFixed(1)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => navigate(`/workshops/${workshop.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('shopDashboard.view')}
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => navigate(`/shop/workshops/${workshop.id}/edit`)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title={t('shopDashboard.edit')}
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteWorkshop(workshop.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={t('shopDashboard.delete')}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
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
