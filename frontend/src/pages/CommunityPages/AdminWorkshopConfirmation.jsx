import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  Store,
  Calendar,
  Clock,
  Users,
  DollarSign,
  MapPin,
  Building2,
  Bell,
  ClipboardList
} from 'lucide-react';
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
    statusLabel: ct('รอการอนุมัติ', 'Pending Approval'),
    statusColor: '#F4A236',
    shop: {
      name: 'บ้านครามโหล่งฮิมคาว',
      owner: 'คุณสมชาย'
    },
    communityName: 'ชุมชนโหล่งฮิมคาว',
    date: '15 มกราคม 2568',
    time: '10:00 - 13:00',
    location: 'โซน B ซอย 2 (บ้านจำกานฟ้า)',
    duration: '3 ชม.',
    price: 450,
    seats: 30,
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
    targetAudience: [
      'ผู้ที่อยากเรียนรู้การย้อมผ้าครามแบบดั้งเดิม',
      'นักออกแบบสิ่งทอและงานคราฟต์',
      'นักท่องเที่ยวที่มองหาประสบการณ์ใหม่'
    ],
    atmosphereNotes: [
      'บรรยากาศสบาย ๆ ในบ้านไม้ของชุมชน',
      'มีการเสิร์ฟชาสมุนไพรโฮมเมด',
      'จำกัดจำนวนผู้เข้าร่วมเพื่อดูแลอย่างใกล้ชิด'
    ],
    schedule: [
      { time: '10:00 - 10:30', activity: 'แนะนำ Workshop และประวัติผ้าคราม', detail: 'รู้จักกับผ้าครามและความสำคัญ' },
      { time: '10:30 - 12:00', activity: 'ฝึกปฏิบัติการพับและย้อมผ้า', detail: 'ลงมือทำจริงกับผ้าของตัวเอง' }
    ],
    enrolledHistory: [
      { date: '10 ม.ค. 2568', user: 'คุณสมหญิง ใจดี', participants: 2, status: 'เข้าร่วมแล้ว' },
      { date: '3 ม.ค. 2568', user: 'คุณวิชัย รักเรียน', participants: 1, status: 'เข้าร่วมแล้ว' }
    ],
    editHistory: [
      {
        date: '12 ม.ค. 2568 • 10:20 น.',
        action: ct('แก้ไขรายละเอียดกำหนดการ', 'Schedule updated'),
        detail: ct('ปรับเวลาเริ่มต้นให้เร็วขึ้น 30 นาทีเพื่อรองรับกิจกรรมพิเศษ', 'Start time moved 30 minutes earlier for additional activity')
      },
      {
        date: '9 ม.ค. 2568 • 18:45 น.',
        action: ct('อัปโหลดรูปภาพหน้าปกใหม่', 'Cover image updated'),
        detail: ct('เพิ่มรูปบรรยากาศย้อมผ้าชุดล่าสุด', 'Added latest workshop ambience photo')
      }
    ],
    notificationHistory: [
      {
        date: '11 ม.ค. 2568 • 09:00 น.',
        channel: 'Email',
        detail: ct('แจ้งผู้ลงทะเบียนเรื่องการเตรียมอุปกรณ์', 'Sent equipment checklist to registrants')
      },
      {
        date: '8 ม.ค. 2568 • 17:30 น.',
        channel: 'LINE OA',
        detail: ct('ส่ง Broadcast แจ้งเตือนรอบสุดท้าย', 'Broadcast reminder about remaining seats')
      }
    ]
  };

  const infoItems = [
    {
      label: ct('ร้านค้า', 'Shop'),
      value: workshop.shop.name,
      icon: Store
    },
    {
      label: ct('ชุมชน', 'Community'),
      value: workshop.communityName,
      icon: Building2
    },
    {
      label: ct('วันจัด Workshop', 'Workshop Date'),
      value: workshop.date,
      icon: Calendar
    },
    {
      label: ct('ช่วงเวลา', 'Time'),
      value: workshop.time,
      icon: Clock
    },
    {
      label: ct('สถานที่จัดงาน', 'Venue'),
      value: workshop.location,
      icon: MapPin
    },
    {
      label: ct('จำนวนที่นั่ง', 'Seats'),
      value: `${workshop.seats} ${ct('ที่นั่ง', 'seats')}`,
      icon: Users
    },
    {
      label: ct('ราคาค่าสมัคร', 'Price'),
      value: `฿${workshop.price}`,
      icon: DollarSign
    }
  ];

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
    <div className="min-h-screen bg-[#F5EFE7] py-10">
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
        <div className="space-y-6">
          {/* Hero Card */}
          <section className="bg-white rounded-[28px] shadow-sm border border-[#F2E4D4] p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/2">
                <div className="w-full h-64 bg-[#F7EFD8] rounded-2xl flex items-center justify-center text-[#C9B799] text-sm font-medium">
                  {ct('รออัปโหลดรูปภาพหน้าปก', 'Cover image pending upload')}
                </div>
              </div>

              <div className="lg:flex-1 space-y-5">
                <div>
                  <span
                    className="inline-flex px-4 py-1 rounded-full text-sm font-semibold"
                    style={{ backgroundColor: '#FEF3C7', color: workshop.statusColor }}
                  >
                    {workshop.statusLabel}
                  </span>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mt-3">
                    {workshop.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {ct('จัดโดย', 'Hosted by')} {workshop.shop.name}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  {infoItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-2xl border border-[#F2E4D4] bg-[#FFFCF6]">
                      <div className="w-9 h-9 rounded-full bg-[#F5E4C8] flex items-center justify-center text-[#B48433]">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{item.label}</p>
                        <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Workshop Details */}
          <section className="bg-white rounded-[28px] shadow-sm border border-[#F2E4D4] p-6 lg:p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">{ct('รายละเอียด Workshop', 'Workshop Details')}</h3>
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#FFF8EA] border border-[#F4E4C4]">
                <p className="text-sm font-semibold text-[#B48433] mb-1">{ct('คำอธิบาย', 'Description')}</p>
                <p className="text-gray-700 leading-relaxed">{workshop.description}</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF5EE] border border-[#E8DCCB]">
                <p className="text-sm font-semibold text-[#B48433] mb-3">{ct('ผู้ที่เข้าร่วม', 'Target Participants')}</p>
                <ul className="space-y-2">
                  {workshop.targetAudience.map((audience, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-4 w-4 text-[#9CC47F]" />
                      {audience}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-[#E9F7EF] border border-[#CCE7D1]">
                <p className="text-sm font-semibold text-[#2A7F53] mb-3">{ct('บรรยากาศ Workshop', 'Workshop Atmosphere')}</p>
                <ul className="space-y-2 text-gray-700">
                  {workshop.atmosphereNotes.map((note, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-[#2A7F53] font-semibold">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Edit History */}
          <section className="bg-white rounded-[28px] shadow-sm border border-[#F2E4D4] p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <ClipboardList className="h-5 w-5 text-[#B48433]" />
              <h3 className="text-xl font-semibold text-gray-900">{ct('ประวัติการแก้ไข', 'Edit History')}</h3>
            </div>
            <div className="space-y-6">
              {workshop.editHistory.map((entry, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="w-3 h-3 rounded-full bg-[#B48433]" />
                    {index !== workshop.editHistory.length - 1 && <span className="w-px flex-1 bg-[#E5D7C4]" />}
                  </div>
                  <div className="flex-1 p-4 border border-[#F2E4D4] rounded-2xl bg-[#FFFBF4]">
                    <p className="text-xs text-gray-500">{entry.date}</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{entry.action}</p>
                    <p className="text-sm text-gray-700 mt-1">{entry.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Notifications */}
          <section className="bg-white rounded-[28px] shadow-sm border border-[#F2E4D4] p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="h-5 w-5 text-[#B48433]" />
              <h3 className="text-xl font-semibold text-gray-900">{ct('ประวัติการแจ้งผู้ลงทะเบียน', 'Registrant Notifications')}</h3>
            </div>
            <div className="space-y-4">
              {workshop.notificationHistory.map((note, index) => (
                <div key={index} className="p-4 rounded-2xl border border-[#E8DCCB] bg-[#FFFCF6]">
                  <p className="text-xs text-gray-500">{note.date}</p>
                  <p className="text-sm font-semibold text-gray-900">{note.channel}</p>
                  <p className="text-sm text-gray-700 mt-1">{note.detail}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Admin Actions */}
          <section className="bg-gradient-to-br from-[#FFF4DA] via-[#FFE7C1] to-[#FFDDB1] rounded-[28px] border border-[#F3C992] p-6 lg:p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{ct('การดำเนินการโดยชุมชน', 'Community Admin Actions')}</h3>
            <p className="text-sm text-gray-700 mb-6">{ct('กรุณาตรวจสอบข้อมูลและตัดสินใจว่าจะอนุมัติ ขอให้แก้ไข หรือปฏิเสธ Workshop นี้', 'Review every section before deciding to approve, request changes, or reject this workshop')}</p>
            <div className="bg-white/60 border border-[#F3C992] rounded-2xl p-4 mb-6">
              <p className="text-sm font-semibold text-gray-800 mb-2">{ct('ข้อความถึงผู้จัด', 'Message to facilitator')}</p>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-[#E2C9A5] bg-white/80 focus:ring-2 focus:ring-[#E2A754] focus:border-transparent resize-none text-sm"
                placeholder={ct('ระบุคำแนะนำเพิ่มเติมเพื่อแจ้งผู้จัดหากจำเป็น...', 'Add instructions for the facilitator if needed...')}
              />
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <button
                onClick={() => setShowModal(true)}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#2F7B4D] hover:bg-[#25633E] text-white font-semibold rounded-xl transition shadow-sm disabled:opacity-60"
              >
                <CheckCircle className="h-5 w-5" />
                {ct('อนุมัติ Workshop', 'Approve Workshop')}
              </button>
              <button
                onClick={() => navigate(`/community-admin/workshops/${id}/edit`)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#F4A236] hover:bg-[#E38E1D] text-white font-semibold rounded-xl transition shadow-sm"
              >
                {ct('ขอให้แก้ไข', 'Request Changes')}
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#C14949] hover:bg-[#A63A3A] text-white font-semibold rounded-xl transition shadow-sm disabled:opacity-60"
              >
                <XCircle className="h-5 w-5" />
                {ct('ปฏิเสธ Workshop', 'Reject Workshop')}
              </button>
            </div>
          </section>
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
