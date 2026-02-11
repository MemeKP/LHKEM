import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Edit, MapPin, Clock, Users, DollarSign, Calendar, ArrowLeft, MessageSquare } from 'lucide-react';

/**
 * Workshop Approval Page - หน้ารายละเอียด Workshop สำหรับอนุมัติ
 * 
 * TODO: Backend APIs needed:
 * - GET /api/workshops/:id - ดึงรายละเอียด Workshop
 * - PATCH /api/workshops/:id/approve - อนุมัติ Workshop
 * - PATCH /api/workshops/:id/reject - ปฏิเสธ Workshop (พร้อมเหตุผล)
 * - GET /api/workshops/:id/history - ประวัติการแก้ไข
 * 
 * Workshop Detail Structure (รอ Backend):
 * {
 *   id, title, description, image, price, seatLimit, duration,
 *   shop: { id, name, image },
 *   category, status, createdAt, updatedAt,
 *   requirements: string[],
 *   categories: string[],
 *   schedule: { day, time }[],
 *   location: string,
 *   history: [{ action, user, timestamp, changes }]
 * }
 */

const WorkshopApprovalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);

  // TODO: Fetch from API - GET /api/workshops/:id
  // Mock data for UI preview
  const workshop = {
    id: id,
    title: 'ย้อมผ้าครามธรรมชาติ',
    description: 'Workshop นี้จะพาคุณเรียนรู้กระบวนการย้อมผ้าด้วยสีครามจากธรรมชาติ ตั้งแต่การเตรียมน้ำย้อม การพับผ้าแบบต่างๆ ไปจนถึงการย้อมและการดูแลรักษาผ้าครามให้คงความสวยงาม คุณจะได้สัมผัสประสบการณ์การทำงานฝีมือด้วยมือของคุณเอง และนำผืนผ้าที่ย้อมเองกลับบ้านไปได้',
    shop: {
      id: '1',
      name: 'บ้านครามโหล่งฮิมคาว',
      image: null
    },
    price: 450,
    seatLimit: 8,
    duration: '3 ชั่วโมง',
    location: 'บ้านครามโหล่งฮิมคาว บ้านมอญ ซอย 11',
    category: 'งานฝีมือ',
    status: 'PENDING',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    requirements: [
      'เสื้อผ้าที่สามารถเปื้อนได้',
      'ผ้าขาวสำหรับย้อม (ถ้ามี)',
      'ถุงมือยาง',
      'ผ้าเช็ดมือ'
    ],
    categories: ['งานฝีมือ', 'ย้อมผ้า', 'วัฒนธรรมล้านนา', 'สีธรรมชาติ'],
    schedule: [
      { day: 'วันเสาร์', time: '09:00 - 12:00' },
      { day: 'วันอาทิตย์', time: '13:00 - 16:00' }
    ],
    history: [
      {
        action: 'สร้าง Workshop',
        user: 'บ้านครามโหล่งฮิมคาว',
        timestamp: new Date('2024-01-05T10:30:00'),
        changes: 'สร้าง Workshop ใหม่'
      },
      {
        action: 'แก้ไขรายละเอียด',
        user: 'บ้านครามโหล่งฮิมคาว',
        timestamp: new Date('2024-01-05T14:20:00'),
        changes: 'อัปเดตคำอธิบายและเพิ่มรูปภาพ'
      }
    ]
  };

  const handleApprove = async () => {
    if (!confirm('คุณต้องการอนุมัติ Workshop นี้ใช่หรือไม่?')) return;
    
    setLoading(true);
    try {
      // TODO: Call API - PATCH /api/workshops/:id/approve
      console.log('Approving workshop:', id);
      alert('อนุมัติ Workshop สำเร็จ!');
      navigate('/community-admin/workshops/pending');
    } catch (error) {
      console.error('Failed to approve workshop:', error);
      alert('เกิดข้อผิดพลาดในการอนุมัติ');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('กรุณาระบุเหตุผลในการปฏิเสธ');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API - PATCH /api/workshops/:id/reject
      console.log('Rejecting workshop:', id, 'Reason:', rejectReason);
      alert('ปฏิเสธ Workshop สำเร็จ!');
      navigate('/community-admin/workshops/pending');
    } catch (error) {
      console.error('Failed to reject workshop:', error);
      alert('เกิดข้อผิดพลาดในการปฏิเสธ');
    } finally {
      setLoading(false);
      setShowRejectModal(false);
    }
  };

  // Remove loading state since we have mock data

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
          <span className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 font-semibold rounded-full">
            รออนุมัติ
          </span>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Workshop Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{workshop.title}</h1>
              
              {/* Shop Info */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">{workshop.shop.name}</p>
                  <p className="text-sm text-gray-600">ร้านค้า</p>
                </div>
              </div>

              {/* Image */}
              <div className="aspect-video bg-gray-200 rounded-lg mb-6"></div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">คำอธิบาย</h3>
                <p className="text-gray-700 leading-relaxed">{workshop.description}</p>
              </div>

              {/* Meta Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm">ราคา</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">฿{workshop.price}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">ที่นั่ง</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{workshop.seatLimit}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">ระยะเวลา</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{workshop.duration}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">สถานที่</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2">{workshop.location}</p>
                </div>
              </div>

              {/* Requirements */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">อุปกรณ์ที่ต้องเตรียม</h3>
                <ul className="space-y-2">
                  {workshop.requirements?.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">ประเภท Workshop</h3>
                <div className="flex flex-wrap gap-2">
                  {workshop.categories?.map((cat, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* History */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ประวัติการแก้ไข</h3>
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
                  <p className="text-gray-500 text-center py-4">ยังไม่มีประวัติการแก้ไข</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Admin Message */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-orange-500" />
                ข้อความจาก Community Admin
              </h3>
              <textarea
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="เพิ่มข้อความหรือคำแนะนำสำหรับร้านค้า..."
              />
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">การดำเนินการ</h3>
              <div className="space-y-3">
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="h-5 w-5" />
                  อนุมัติ Workshop
                </button>

                <button
                  onClick={() => navigate(`/community-admin/workshops/${id}/edit`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
                >
                  <Edit className="h-5 w-5" />
                  แก้ไข
                </button>

                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  <XCircle className="h-5 w-5" />
                  ปฏิเสธ Workshop
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>หมายเหตุ:</strong> การอนุมัติ Workshop จะทำให้ Workshop แสดงบนเว็บไซต์และเปิดให้ผู้ใช้ลงทะเบียนได้ทันที
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">ปฏิเสธ Workshop</h3>
            <p className="text-gray-600 mb-4">กรุณาระบุเหตุผลในการปฏิเสธ Workshop นี้</p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-4"
              placeholder="เช่น ข้อมูลไม่ครบถ้วน, รูปภาพไม่ชัดเจน..."
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleReject}
                disabled={loading || !rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'กำลังดำเนินการ...' : 'ยืนยันปฏิเสธ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopApprovalPage;
