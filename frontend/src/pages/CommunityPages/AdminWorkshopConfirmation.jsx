import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowLeft, Store, Calendar, Clock, Users, DollarSign, MapPin } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Admin Workshop Confirmation - หน้ายืนยัน Workshop พร้อม Modal
 * ตาม Figma Design: Admin-confirm workshop.png
 * 
 * TODO: Backend APIs:
 * - GET /api/workshops/:id - ดึงรายละเอียด Workshop
 * - PATCH /api/workshops/:id/approve - อนุมัติ Workshop
 * - PATCH /api/workshops/:id/reject - ปฏิเสธ Workshop
 */

const AdminWorkshopConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ct } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [loading, setLoading] = useState(false);

  // TODO: Fetch from API
  const workshop = {
    id: id || '1',
    title: 'ย้อมผ้าครามธรรมชาติ',
    shop: {
      name: 'บ้านครามโหล่งฮิมคาว',
      owner: 'คุณสมชาย'
    },
    date: '15 มกราคม 2568',
    time: '10:00 - 13:00',
    location: 'โซน B ซอย 2 (บ้านจำกานฟ้า)',
    duration: '3 ชม.',
    price: 450,
    description: 'Workshop นี้จะพาคุณเรียนรู้กระบวนการย้อมผ้าด้วยสีครามจากธรรมชาติ ตั้งแต่การเตรียมน้ำย้อม การพับผ้าแบบต่างๆ ไปจนถึงการย้อมและการดูแลรักษาผ้าครามให้คงความสวยงาม',
    requirements: [
      'เสื้อผ้าที่สามารถเปื้อนได้',
      'ผ้าขาวสำหรับย้อม (ถ้ามี)',
      'ถุงมือยาง',
      'ผ้าเช็ดมือ'
    ],
    whatYouWillLearn: [
      'เรียนรู้ประวัติและความสำคัญของการย้อมผ้าคราม',
      'เทคนิคการพับผ้าเพื่อสร้างลวดลายต่างๆ',
      'กระบวนการย้อมผ้าด้วยสีครามธรรมชาติ',
      'วิธีการดูแลรักษาผ้าครามให้คงสภาพ'
    ],
    schedule: [
      { time: '10:00 - 10:30', activity: 'แนะนำ Workshop และประวัติผ้าคราม', detail: 'รู้จักกับผ้าครามและความสำคัญ' },
      { time: '10:30 - 12:00', activity: 'ฝึกปฏิบัติการพับและย้อมผ้า', detail: 'ลงมือทำจริงกับผ้าของตัวเอง' }
    ],
    enrolledHistory: [
      { date: '10 ม.ค. 2568', user: 'คุณสมหญิง ใจดี', participants: 2, status: 'เข้าร่วมแล้ว' },
      { date: '3 ม.ค. 2568', user: 'คุณวิชัย รักเรียน', participants: 1, status: 'เข้าร่วมแล้ว' }
    ]
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      // TODO: Call API - PATCH /api/workshops/:id/approve
      console.log('Approving workshop:', id, 'Note:', adminNote);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(ct('อนุมัติ Workshop สำเร็จ!', 'Workshop approved successfully!'));
      navigate('/community-admin/dashboard');
    } catch (error) {
      console.error('Failed to approve:', error);
      alert(ct('เกิดข้อผิดพลาด', 'An error occurred'));
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert(ct('กรุณาระบุเหตุผล', 'Please provide a reason'));
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API - PATCH /api/workshops/:id/reject
      console.log('Rejecting workshop:', id, 'Reason:', rejectReason);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(ct('ปฏิเสธ Workshop สำเร็จ', 'Workshop rejected successfully'));
      navigate('/community-admin/dashboard');
    } catch (error) {
      console.error('Failed to reject:', error);
      alert(ct('เกิดข้อผิดพลาด', 'An error occurred'));
    } finally {
      setLoading(false);
      setShowRejectModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/community-admin/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          {ct('กลับ', 'Back')}
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {ct('ตรวจสอบและอนุมัติ Workshop', 'Review and Approve Workshop')}
        </h1>
        <p className="text-gray-600 text-sm mb-8">
          {ct('ตรวจสอบรายละเอียด Workshop ก่อนอนุมัติให้แสดงบนเว็บไซต์', 'Review workshop details before approving for public display')}
        </p>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Workshop Info Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{workshop.title}</h2>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Store className="h-4 w-4" />
                    <span className="text-sm">{ct('โดยร้าน', 'By')} {workshop.shop.name}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-500">{ct('วันที่', 'Date')}</p>
                    <p className="text-sm font-semibold text-gray-900">{workshop.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">{ct('เวลา', 'Time')}</p>
                    <p className="text-sm font-semibold text-gray-900">{workshop.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-500">{ct('สถานที่', 'Location')}</p>
                    <p className="text-sm font-semibold text-gray-900">{workshop.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-500">{ct('ราคา', 'Price')}</p>
                    <p className="text-sm font-semibold text-gray-900">฿{workshop.price}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{ct('รายละเอียด', 'Description')}</h3>
                <p className="text-gray-700 leading-relaxed">{workshop.description}</p>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{ct('อุปกรณ์ที่ต้องเตรียม', 'Required Items')}</h3>
              <ul className="space-y-2">
                {workshop.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What You'll Learn */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{ct('สิ่งที่จะได้เรียนรู้', 'What You\'ll Learn')}</h3>
              <div className="space-y-2">
                {workshop.whatYouWillLearn.map((item, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{ct('รายละเอียดกำหนดการ', 'Schedule Details')}</h3>
              <div className="space-y-3">
                {workshop.schedule.map((item, index) => (
                  <div key={index} className="border-l-4 border-orange-500 pl-4 py-2">
                    <p className="font-semibold text-gray-900">{item.time}</p>
                    <p className="text-gray-700">{item.activity}</p>
                    <p className="text-sm text-gray-500">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Enrollment History */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{ct('ประวัติการลงทะเบียน', 'Enrollment History')}</h3>
              <div className="space-y-3">
                {workshop.enrolledHistory.map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{record.user}</p>
                      <p className="text-sm text-gray-500">{record.date} • {record.participants} {ct('ท่าน', 'person(s)')}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      {record.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {ct('ข้อความจาก Community Admin', 'Message from Admin')}
              </h3>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                placeholder={ct('เพิ่มข้อความหรือคำแนะนำ...', 'Add message or suggestions...')}
              />
            </div>

            {/* Action Buttons */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-sm p-6 border border-orange-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {ct('การดำเนินการโดย Community Admin', 'Admin Actions')}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {ct('กรุณาตรวจสอบข้อมูลทั้งหมดก่อนดำเนินการ Workshop นี้', 'Please review all information before proceeding')}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setShowModal(true)}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition shadow-sm"
                >
                  <CheckCircle className="h-5 w-5" />
                  {ct('อนุมัติ Workshop', 'Approve Workshop')}
                </button>

                <button
                  onClick={() => navigate(`/community-admin/workshops/${id}/edit`)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition shadow-sm"
                >
                  {ct('แก้ไข', 'Edit')}
                </button>

                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition shadow-sm"
                >
                  <XCircle className="h-5 w-5" />
                  {ct('ปฏิเสธ Workshop', 'Reject Workshop')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approve Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {ct('ยืนยันการอนุมัติ', 'Confirm Approval')}
              </h3>
              <p className="text-gray-600">
                {ct('คุณต้องการอนุมัติ Workshop นี้ใช่หรือไม่?', 'Do you want to approve this workshop?')}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>{workshop.title}</strong>
              </p>
              <p className="text-xs text-gray-500 mt-1">{ct('โดยร้าน', 'By')} {workshop.shop.name}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
              >
                {ct('ยกเลิก', 'Cancel')}
              </button>
              <button
                onClick={handleApprove}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
              >
                {loading ? ct('กำลังดำเนินการ...', 'Processing...') : ct('ยืนยัน', 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {ct('ปฏิเสธ Workshop', 'Reject Workshop')}
              </h3>
              <p className="text-gray-600">
                {ct('กรุณาระบุเหตุผลในการปฏิเสธ', 'Please provide a reason for rejection')}
              </p>
            </div>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent mb-6 resize-none"
              placeholder={ct('เช่น ข้อมูลไม่ครบถ้วน, รูปภาพไม่ชัดเจน...', 'e.g. Incomplete information, unclear images...')}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                disabled={loading}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
              >
                {ct('ยกเลิก', 'Cancel')}
              </button>
              <button
                onClick={handleReject}
                disabled={loading || !rejectReason.trim()}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
              >
                {loading ? ct('กำลังดำเนินการ...', 'Processing...') : ct('ยืนยันปฏิเสธ', 'Confirm Reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWorkshopConfirmation;
