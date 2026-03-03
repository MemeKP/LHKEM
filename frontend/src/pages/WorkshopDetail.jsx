import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Calendar, Star, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import api from '../services/api';
import ETicketModal from '../components/ETicketModal';

const WorkshopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t, ct } = useTranslation();
  const [workshop, setWorkshop] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [participants, setParticipants] = useState(1);
  const [showETicket, setShowETicket] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    fetchWorkshopDetails();
  }, [id]);

  const fetchWorkshopDetails = async () => {
    try {
      const [workshopRes, reviewsRes] = await Promise.all([
        api.get(`/workshops/${id}`),
        api.get(`/workshops/${id}/reviews`)
      ]);

      setWorkshop(workshopRes.data.workshop || workshopRes.data.data || workshopRes.data);
      setReviews(reviewsRes.data.reviews || []);
    } catch (error) {
      console.error('Failed to fetch workshop:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/workshops/${id}` } });
      return;
    }

    setEnrolling(true);

    try {
      const payload = {
        workshopId: String(id), 
        userId: String(user?.userId || user?._id || user?.id), 
        slots: participants, 
        note: ""
      };
      
      const response = await api.post('/enroll', payload);
      
      setBookingData({
        workshop: {
          title: workshop.title,
          host: workshop.host || workshop.shopName || ct('ไม่ระบุชื่อร้าน', 'Shop Name'),
          date: workshop.date || workshop.startDate,
          time: workshop.time || `${workshop.startTime} - ${workshop.endTime}`,
          location: workshop.location || workshop.customLocation
        },
        guestCount: participants,
        bookingDate: new Date().toISOString()
      });
      setShowETicket(true);
      fetchWorkshopDetails(); // Refresh the data to update the seats!

    } catch (error) {
      const backendError = error.response?.data?.message || error.response?.data || error.message;
      alert(`${ct('ระบบปฏิเสธข้อมูลเนื่องจาก:\n\n', 'Backend rejected the data because:\n\n')}${JSON.stringify(backendError, null, 2)}`);
      console.error('Registration error:', error);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('workshopDetail.notFound') || ct('ไม่พบเวิร์กชอป', 'Workshop Not Found')}</h2>
          <button
            onClick={() => navigate('/workshops')}
            className="text-orange-600 hover:text-orange-700"
          >
            {t('workshopDetail.backToWorkshops') || ct('กลับไปหน้าเวิร์กชอป', 'Back to Workshops')}
          </button>
        </div>
      </div>
    );
  }

  const capacity = workshop?.capacity || workshop?.seatLimit || 0;
  const confirmedSeats = workshop?.current_participants || workshop?.seatsBooked || 0;
  const pendingSeats = Math.max(0, workshop?.pendingRegistrationSeat || 0);
  const booked = confirmedSeats + pendingSeats;
  const seatsAvailable = Math.max(0, capacity - booked);
  const isFull = seatsAvailable <= 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          {t('common.back') || ct('กลับ', 'Back')}
        </button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="aspect-video bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center relative">
            {(workshop.image || workshop.imageUrl || workshop.picture) && (
              <img 
                src={workshop.image || workshop.imageUrl || workshop.picture} 
                alt={workshop.title} 
                className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
              />
            )}
            <div className="text-white text-center z-10 drop-shadow-md">
              <h1 className="text-4xl font-bold mb-2">{workshop.title}</h1>
              <p className="text-orange-100">{workshop.category || ct('เวิร์กชอป', 'Workshop')}</p>
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="font-semibold">{workshop.rating?.toFixed(1) || '5.0'}</span>
                    <span className="text-gray-500">({workshop.reviewCount || 0} {t('workshopDetail.reviews') || ct('รีวิว', 'reviews')})</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users className="h-5 w-5" />
                    <span>{confirmedSeats}/{capacity} {t('workshopDetail.enrolled') || ct('คนเข้าร่วม', 'enrolled')}</span>
                    {pendingSeats > 0 && (
                      <span className="ml-2 text-xs font-medium text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                        {ct('รอยืนยัน', 'Pending')} {pendingSeats}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 mb-6 whitespace-pre-wrap">{workshop.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('workshopDetail.date') || ct('วันที่', 'Date')}</p>
                      <p className="font-semibold text-gray-900">
                        {workshop.date || workshop.startDate ? new Date(workshop.date || workshop.startDate).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : ct('ไม่ระบุ', 'N/A')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Clock className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('workshopDetail.duration') || ct('เวลา', 'Time')}</p>
                      <p className="font-semibold text-gray-900">{workshop.time || `${workshop.startTime} - ${workshop.endTime}` || ct('ไม่ระบุเวลา', 'N/A')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <MapPin className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('workshopDetail.location') || ct('สถานที่', 'Location')}</p>
                      <p className="font-semibold text-gray-900">{workshop.customLocation || workshop.location?.address || workshop.location || ct('ใช้สถานที่ร้าน', 'Shop')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Users className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('workshopDetail.host') || ct('ผู้จัด', 'Host')}</p>
                      <p className="font-semibold text-gray-900">{workshop.host || workshop.shopName || ct('ไม่ระบุ', 'Unknown')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="ml-8 w-80">
                <div className="bg-gray-50 rounded-lg p-6 sticky top-8">
                  <div className="text-center mb-6">
                    <p className="text-4xl font-bold text-gray-900">{workshop.price === 0 ? (t('workshops.free') || ct('ฟรี', 'Free')) : `฿${workshop.price}`}</p>
                    <p className="text-gray-600">{t('workshopDetail.perPerson') || ct('ต่อคน', 'per person')}</p>
                  </div>

                  {!isFull && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('workshopDetail.participants') || ct('จำนวนผู้เข้าร่วม', 'Participants')}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={seatsAvailable}
                        value={participants}
                        onChange={(e) => setParticipants(Math.min(Math.max(1, parseInt(e.target.value) || 1), seatsAvailable))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {t('workshopDetail.seatsAvailable') || ct('ที่นั่งคงเหลือ', 'Seats Available')}: {seatsAvailable}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleEnroll}
                    disabled={isFull || enrolling}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      isFull
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    {enrolling ? (t('common.loading') || ct('กำลังดำเนินการ...', 'Loading...')) : isFull ? (t('workshopDetail.full') || ct('เต็มแล้ว', 'Full')) : (t('workshopDetail.enrollNow') || ct('จองเลย', 'Enroll Now'))}
                  </button>

                  {!isFull && workshop.price > 0 && (
                    <p className="text-center text-sm text-gray-600 mt-4">
                      {t('workshopDetail.total') || ct('ยอดรวม', 'Total')}: ฿{(workshop.price * participants).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {(workshop.whatYouWillLearn && workshop.whatYouWillLearn.length > 0) && (
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('workshopDetail.whatYouWillLearn') || ct('สิ่งที่คุณจะได้เรียนรู้', 'What You Will Learn')}
                </h2>
                <ul className="space-y-3">
                  {workshop.whatYouWillLearn.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(workshop.requirements && workshop.requirements.length > 0) && (
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('workshopDetail.requirements') || ct('สิ่งที่ต้องเตรียมมา', 'Requirements')}
                </h2>
                <ul className="space-y-2">
                  {workshop.requirements.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-orange-500">•</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {reviews.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('workshopDetail.reviewsTitle') || ct('รีวิว', 'Reviews')} ({reviews.length})
                </h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold">
                            {review.userName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{review.userName}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('th-TH')}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ETicketModal
        booking={bookingData}
        isOpen={showETicket}
        onClose={() => setShowETicket(false)}
      />
    </div>
  );
};

export default WorkshopDetail;