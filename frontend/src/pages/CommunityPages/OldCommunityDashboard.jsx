import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Eye, Calendar, MapPin, Users, TrendingUp, DollarSign, Store } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../services/api';

const CommunityAdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [workshops, setWorkshops] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user?.communityId) return;

    try {
      const [workshopsRes, eventsRes, statsRes] = await Promise.all([
        api.get(`/workshops?communityId=${user.communityId}`),
        api.get(`/events?communityId=${user.communityId}`),
        api.get(`/communities/${user.communityId}/stats`)
      ]);

      setWorkshops(workshopsRes.data.workshops || []);
      setEvents(eventsRes.data.events || []);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (workshopId) => {
    try {
      await api.post(`/workshops/${workshopId}/approve`);
      setWorkshops(workshops.map(w => 
        w.id === workshopId ? { ...w, status: 'ACTIVE' } : w
      ));
    } catch (error) {
      console.error('Failed to approve workshop:', error);
    }
  };

  const handleReject = async (workshopId) => {
    try {
      await api.post(`/workshops/${workshopId}/reject`);
      setWorkshops(workshops.map(w => 
        w.id === workshopId ? { ...w, status: 'REJECTED' } : w
      ));
    } catch (error) {
      console.error('Failed to reject workshop:', error);
    }
  };

  const filteredWorkshops = workshops.filter(w => {
    if (activeTab === 'pending') return w.status === 'PENDING';
    if (activeTab === 'approved') return w.status === 'ACTIVE';
    if (activeTab === 'rejected') return w.status === 'REJECTED';
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
            <h1 className="text-3xl font-bold text-gray-900">{t('communityAdmin.title')}</h1>
            <p className="text-gray-600 mt-1">{t('communityAdmin.subtitle')}</p>
          </div>
          <button
            onClick={() => navigate('/community/events/create')}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
          >
            <Calendar className="h-5 w-5" />
            {t('communityAdmin.createEvent')}
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('communityAdmin.stats.totalShops')}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalShops}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Store className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('communityAdmin.stats.totalWorkshops')}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalWorkshops}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('communityAdmin.stats.pendingApprovals')}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingApprovals}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('communityAdmin.stats.monthlyRevenue')}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">฿{stats.monthlyRevenue.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              {['pending', 'approved', 'rejected'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t(`communityAdmin.tabs.${tab}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('communityAdmin.workshopApprovals')}
            </h2>

            {filteredWorkshops.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{t('communityAdmin.noWorkshops')}</p>
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{workshop.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{workshop.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">{t('communityAdmin.host')}</p>
                            <p className="font-semibold text-gray-900">{workshop.host}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">{t('communityAdmin.price')}</p>
                            <p className="font-semibold text-gray-900">฿{workshop.price}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">{t('communityAdmin.seats')}</p>
                            <p className="font-semibold text-gray-900">{workshop.seatLimit}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">{t('communityAdmin.category')}</p>
                            <p className="font-semibold text-gray-900">{workshop.category}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => navigate(`/workshops/${workshop.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('communityAdmin.view')}
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        {workshop.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(workshop.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title={t('communityAdmin.approve')}
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleReject(workshop.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title={t('communityAdmin.reject')}
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('communityAdmin.events')}
              </h2>
              <button
                onClick={() => navigate('/community/events')}
                className="text-orange-600 hover:text-orange-700 font-medium text-sm"
              >
                {t('communityAdmin.viewAll')}
              </button>
            </div>

            {events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{t('communityAdmin.noEvents')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.slice(0, 4).map((event) => (
                  <div
                    key={event.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(event.eventDate).toLocaleDateString('th-TH')}
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

export default CommunityAdminDashboard;