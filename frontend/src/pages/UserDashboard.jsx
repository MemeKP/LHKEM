import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, CheckCircle, XCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import api from '../services/api';

const UserDashboard = () => {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');


  useEffect(() => {
    const fetchEnrollments = async () => {
      if (user?.id) {
        try {
          const response = await api.get(`/users/${user.id}/enrollments`);
          setEnrollments(response.data.enrollments || []);
        } catch (error) {
          console.error('Failed to fetch enrollments:', error);
        }
      }
    };

    fetchEnrollments();
  }, [user]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: {
        bg: '#dcfce7',
        text: '#166534',
        icon: CheckCircle,
        label: t('dashboard.status.confirmed')
      },
      pending: {
        bg: '#fef3c7',
        text: '#92400e',
        icon: AlertCircle,
        label: t('dashboard.status.pending')
      },
      completed: {
        bg: '#e0e7ff',
        text: '#3730a3',
        icon: CheckCircle,
        label: t('dashboard.status.completed')
      },
      cancelled: {
        bg: '#fee2e2',
        text: '#991b1b',
        icon: XCircle,
        label: t('dashboard.status.cancelled')
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium"
        style={{ backgroundColor: config.bg, color: config.text }}
      >
        <Icon className="h-4 w-4" />
        <span>{config.label}</span>
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus) => {
    const isPaid = paymentStatus === 'paid';
    return (
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
        style={{
          backgroundColor: isPaid ? '#dcfce7' : '#fef3c7',
          color: isPaid ? '#166534' : '#92400e'
        }}
      >
        {isPaid ? t('dashboard.payment.paid') : t('dashboard.payment.pending')}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filterEnrollments = () => {
    const now = new Date();
    
    switch (activeTab) {
      case 'upcoming':
        return enrollments.filter(e => 
          new Date(e.workshopDate) > now && e.status !== 'cancelled'
        );
      case 'past':
        return enrollments.filter(e => 
          new Date(e.workshopDate) <= now || e.status === 'completed'
        );
      case 'all':
      default:
        return enrollments;
    }
  };

  const filteredEnrollments = filterEnrollments();

  if (loading) {
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('dashboard.title')}
          </h1>
          <p className="text-gray-600">
            {t('dashboard.welcome')}, {user?.firstName || user?.email}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.stats.total')}</p>
                <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.stats.upcoming')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {enrollments.filter(e => 
                    new Date(e.workshopDate) > new Date() && e.status !== 'cancelled'
                  ).length}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.stats.completed')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {enrollments.filter(e => e.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              {['upcoming', 'past', 'all'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t(`dashboard.tabs.${tab}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {filteredEnrollments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('dashboard.noEnrollments.title')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('dashboard.noEnrollments.description')}
                </p>
                <button
                  onClick={() => navigate('/workshops')}
                  className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {t('dashboard.noEnrollments.button')}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEnrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex-1 mb-4 md:mb-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {enrollment.workshopTitle}
                          </h3>
                          {getStatusBadge(enrollment.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{formatDate(enrollment.workshopDate)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{enrollment.participants} {t('dashboard.participants')}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{t('dashboard.enrolled')}: {formatDate(enrollment.enrollmentDate)}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="text-gray-600 mr-2">{t('dashboard.payment.label')}:</span>
                            {getPaymentBadge(enrollment.paymentStatus)}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{t('dashboard.totalPrice')}</p>
                          <p className="text-2xl font-bold text-gray-900">
                            ฿{enrollment.totalPrice}
                          </p>
                        </div>
                        <button
                          className="px-4 py-2 text-sm font-medium text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
                        >
                          {t('dashboard.viewDetails')}
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

export default UserDashboard;
