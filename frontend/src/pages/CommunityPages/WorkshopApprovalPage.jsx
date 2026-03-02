import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Edit, MapPin, Clock, Users, DollarSign, Calendar, ArrowLeft, MessageSquare } from 'lucide-react';
import api from '../../services/api';

/* Shop Owner Approval Page */

const WorkshopApprovalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workshop, setWorkshop] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        setLoading(true);
        const timestamp = new Date().getTime();
        const response = await api.get(`/management/workshops/${id}?_t=${timestamp}`);
        setWorkshop(response.data?.data || response.data);
      } catch (error) {
        console.error('Failed to fetch workshop:', error);
        alert('ไม่สามารถดึงข้อมูล Workshop ได้');
        navigate('/community-admin/workshops/pending');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchWorkshop();
  }, [id, navigate]);

  const handleApprove = async () => {
    if (!window.confirm('คุณต้องการอนุมัติ Workshop นี้ใช่หรือไม่?')) return;
    
    setActionLoading(true);
    try {
      await api.patch(`/management/workshops/${id}/approve`, { adminMessage });
      alert('อนุมัติ Workshop สำเร็จ!');
      navigate('/community-admin/workshops/pending');
    } catch (error) {
      console.error('Failed to approve workshop:', error);
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการอนุมัติ');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('กรุณาระบุเหตุผลในการปฏิเสธ');
      return;
    }

    setActionLoading(true);
    try {
      await api.patch(`/management/workshops/${id}/reject`, { 
        reason: rejectReason,
        adminMessage: adminMessage 
      });
      alert('ปฏิเสธ Workshop เรียบร้อยแล้ว');
      navigate('/community-admin/workshops/pending');
    } catch (error) {
      console.error('Failed to reject workshop:', error);
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการปฏิเสธ');
    } finally {
      setActionLoading(false);
      setShowRejectModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!workshop) return null;

  // ✅ UNIVERSAL DATA EXTRACTION LOGIC
  const capacity = workshop.capacity || workshop.seatLimit || workshop.maxSeats || 0;
  const participants = workshop.current_participants || workshop.enrolled || workshop.participants || 0;
  const seatsAvailable = Math.max(0, capacity - participants);

  const shopData = workshop.shop || workshop.shopId || workshop.shop_id || {};
  const displayShopName = shopData.shopName || shopData.name || workshop.shopName || workshop.host || 'ไม่ระบุร้านค้า';
  const displayShopImage = shopData.image || shopData.picture || workshop.imageUrl || workshop.image || null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <button
          onClick={() => navigate('/community-admin/workshops/pending')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          กลับไปรายการ Workshop
        </button>

        {/* Status Badge */}
        <div className="mb-6">
          <span className={`inline-block px-4 py-2 font-semibold rounded-full ${
            (workshop.approvalStatus || workshop.status) === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
          }`}>
            {(workshop.approvalStatus || workshop.status) === 'PENDING' ? 'รออนุมัติ' : (workshop.approvalStatus || workshop.status)}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{workshop.title}</h1>
              
              <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                    {displayShopImage && <img src={displayShopImage} alt="" className="w-full h-full object-cover" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{displayShopName}</p>
                  <p className="text-sm text-gray-600">ผู้จัดเวิร์กชอป</p>
                </div>
              </div>

              {/* Image Section */}
              <div className="aspect-video bg-gray-200 rounded-lg mb-6 overflow-hidden">
                {displayShopImage ? (
                    <img src={displayShopImage} alt={workshop.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">ไม่มีรูปภาพประกอบ</div>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">คำอธิบาย</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{workshop.description || '-'}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm">ราคา</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">฿{workshop.price?.toLocaleString() || 0}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">ที่ว่าง</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{seatsAvailable} / {capacity}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">ระยะเวลา</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{workshop.duration || workshop.time || `${workshop.startTime || ''} - ${workshop.endTime || ''}`}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">สถานที่</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2">{workshop.customLocation || workshop.location?.address || workshop.location || 'ใช้สถานที่ร้าน'}</p>
                </div>
              </div>

              {/* Requirements */}
              {workshop.requirements?.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">อุปกรณ์ที่ต้องเตรียม</h3>
                    <ul className="space-y-2">
                    {workshop.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{req}</span>
                        </li>
                    ))}
                    </ul>
                </div>
              )}
            </div>

            {/* History */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ประวัติการดำเนินการ</h3>
              <div className="space-y-4">
                {workshop.history?.length > 0 ? (
                  workshop.history.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.action}</p>
                        <p className="text-sm text-gray-600">{item.user}</p>
                        <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString('th-TH')}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">สร้างเมื่อ: {workshop.createdAt ? new Date(workshop.createdAt).toLocaleString('th-TH') : 'ไม่ระบุ'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-orange-500" />
                ข้อความถึงผู้จัดงาน
              </h3>
              <textarea
                rows={4}
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="เพิ่มข้อความหรือคำแนะนำสำหรับร้านค้า... (จะถูกบันทึกเมื่อกดอนุมัติหรือปฏิเสธ)"
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">การดำเนินการ</h3>
              <div className="space-y-3">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="h-5 w-5" />
                  {actionLoading ? 'กำลังอนุมัติ...' : 'อนุมัติ Workshop'}
                </button>

                <button
                  onClick={() => navigate(`/community-admin/workshops/${id}/edit`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
                >
                  <Edit className="h-5 w-5" />
                  แก้ไขข้อมูลเอง
                </button>

                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  <XCircle className="h-5 w-5" />
                  ปฏิเสธ Workshop
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">ปฏิเสธ Workshop</h3>
            <p className="text-gray-600 mb-4">กรุณาระบุเหตุผลในการปฏิเสธ (เหตุผลนี้จะถูกส่งไปให้ผู้จัดงานแก้ไข)</p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-4"
              placeholder="เช่น ข้อมูลไม่ครบถ้วน, รูปภาพไม่ชัดเจน..."
            />

            <div className="flex gap-3">
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg disabled:opacity-50"
              >
                {actionLoading ? 'กำลังดำเนินการ...' : 'ยืนยันปฏิเสธ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopApprovalPage;