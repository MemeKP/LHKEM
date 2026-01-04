import { MapPin, X, Calendar, Clock, BookOpen, AlertCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../hooks/useAuth';

const SectionCard = ({ icon, title, children }) => (
  <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-5 space-y-4 animate-scaleIn">
    <div className="flex items-center gap-2 text-gray-900 font-semibold">
      {icon}
      <span>{title}</span>
    </div>
    {children}
  </div>
);

const WorkshopModal = ({ workshop, isOpen, onClose }) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleEnroll = () => {
    if (!isAuthenticated) {
      onClose();
      navigate('/login', { state: { from: `/workshops`, workshopId: workshop.id } });
      return;
    }
    
    console.log('Enrolling in workshop:', workshop.id);
  };

  if (!isOpen || !workshop) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden relative animate-slideUp">
        <button
          className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600 transition"
          onClick={onClose}
          aria-label={t('common.close')}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 space-y-5 max-h-[85vh] overflow-y-auto animate-stagger">
          <div className="rounded-[28px] border border-gray-100 bg-white shadow-sm p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('workshops.modal.hostedBy')} {workshop.host}</p>
                <h3 className="text-2xl font-bold text-gray-900 leading-snug">{workshop.title}</h3>
              </div>
              <div className="text-right space-y-1">
                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full inline-block">
                  {t('workshops.modal.seatsLeftLabel')}: {workshop.seatsLeft}
                </span>
                <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                  <Clock className="h-3 w-3" /> {workshop.duration}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 flex flex-col">
                <span className="inline-flex items-center gap-1 text-red-500 font-medium">
                  <MapPin className="h-4 w-4" />
                  {workshop.location}
                </span>
                <span className="text-xs text-gray-400 mt-1">{workshop.badge}</span>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-orange-500">
                  {workshop.price === 0 ? t('workshops.free') : `฿${workshop.price}`}
                </p>
                <p className="text-xs text-gray-400">{t('workshops.perPerson')}</p>
              </div>
            </div>
          </div>

          <SectionCard
            icon={<Calendar className="h-5 w-5 text-blue-600" />}
            title={t('workshops.modal.scheduleTitle')}
          >
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-semibold">
                {t('workshops.modal.scheduleTitle')}
              </span>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              {workshop.sessions.map((session, index) => (
                <div
                  key={index}
                  className={`rounded-2xl border p-4 ${index === 0 ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}`}
                >
                  <p className="font-semibold text-gray-900">{session.title}</p>
                  <p className="text-gray-600">{session.detail}</p>
                  <p className="text-gray-400 text-sm">{session.time}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            icon={<BookOpen className="h-5 w-5 text-orange-500" />}
            title={t('workshops.modal.learnTitle')}
          >
            <ul className="space-y-3 text-sm text-gray-700">
              {workshop.learnings.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-orange-500 mt-1">
                    <AlertCircle className="h-4 w-4" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            icon={<MapPin className="h-5 w-5 text-green-600" />}
            title={t('workshops.modal.locationTitle')}
          >
            <p className="text-sm text-gray-700">{workshop.location}</p>
            <div className="w-full h-40 rounded-2xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
              {workshop.mapNote || t('workshops.modal.mapNote')}
            </div>
          </SectionCard>

          <div className="flex items-center gap-3 text-sm text-gray-500 bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <Info className="h-5 w-5 text-blue-500" />
            <p>{t('workshops.modal.seatsLeftLabel')}: {workshop.seatsLeft}</p>
          </div>

          <button
            onClick={handleEnroll}
            className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-semibold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl"
          >
            {isAuthenticated ? t('workshops.modal.cta') : t('auth.loginButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkshopModal;
