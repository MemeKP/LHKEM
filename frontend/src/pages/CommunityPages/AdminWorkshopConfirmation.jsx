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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api'; 

const AdminWorkshopConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { ct } = useTranslation();
  
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [rejectType, setRejectType] = useState('REJECT'); 

  const { data: workshopData, isLoading: isFetching } = useQuery({
    queryKey: ['workshop-detail', id],
    queryFn: async () => {
      const res = await api.get(`/management/workshops/${id}`);
      return res.data?.data || res.data;
    },
    enabled: !!id,
  });

  const handleApprove = async () => {
    setLoading(true);
    try {
      await api.patch(`/management/workshops/${id}`, {
        approvalStatus: 'ACTIVE',
        registrationStatus: 'OPEN',
        adminNote: adminNote,
        rejectReason: '' // Clear any previous rejection reasons
      });
      alert(ct('อนุมัติ Workshop สำเร็จ!', 'Workshop approved successfully!'));
      queryClient.invalidateQueries(['community-workshops']);
      navigate('/community-admin/dashboard');
    } catch (error) {
      console.error('Failed to approve:', error);
      alert(ct('เกิดข้อผิดพลาดในการอนุมัติ', 'An error occurred'));
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
      const targetStatus = rejectType === 'REVISION' ? 'CHANGE' : 'REJECTED'; 

      // Payload explicitly includes rejectReason
      await api.patch(`/management/workshops/${id}`, {
        approvalStatus: targetStatus,
        rejectReason: rejectReason, 
        adminNote: adminNote
      });
      
      const successMsg = rejectType === 'REVISION' 
        ? ct('ส่งคำขอแก้ไขสำเร็จ', 'Revision request sent') 
        : ct('ปฏิเสธ Workshop สำเร็จ', 'Workshop rejected successfully');
        
      alert(successMsg);
      queryClient.invalidateQueries(['community-workshops']);
      navigate('/community-admin/dashboard');
    } catch (error) {
      console.error('Failed to update status:', error);
      alert(ct('เกิดข้อผิดพลาด', 'An error occurred'));
    } finally {
      setLoading(false);
      setShowRejectModal(false);
    }
  };

  if (isFetching) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F5EFE7]">กำลังโหลดข้อมูล...</div>;
  }

  if (!workshopData) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F5EFE7]">ไม่พบข้อมูล Workshop</div>;
  }

  const coverImage = workshopData.image || workshopData.imageUrl;
  const shopName = workshopData.shopId?.shopName || workshopData.shopName || ct('ไม่ระบุร้านค้า', 'Unknown Shop');
  const price = workshopData.price || 0;
  const seats = workshopData.seatLimit || workshopData.seats || 0;
  
  const requirements = Array.isArray(workshopData.requirements) ? workshopData.requirements : [];

  const infoItems = [
    { label: ct('ร้านค้า', 'Shop'), value: shopName, icon: Store },
    { label: ct('วันจัด Workshop', 'Workshop Date'), value: workshopData.date ? new Date(workshopData.date).toLocaleDateString('th-TH') : ct('ไม่ระบุ', 'N/A'), icon: Calendar },
    { label: ct('ช่วงเวลา', 'Time'), value: workshopData.startTime ? `${workshopData.startTime} - ${workshopData.endTime}` : ct('ไม่ระบุ', 'N/A'), icon: Clock },
    { label: ct('สถานที่จัดงาน', 'Venue'), value: workshopData.location || ct('ไม่ระบุ', 'N/A'), icon: MapPin },
    { label: ct('จำนวนที่นั่ง', 'Seats'), value: `${seats} ${ct('ที่นั่ง', 'seats')}`, icon: Users },
    { label: ct('ราคาค่าสมัคร', 'Price'), value: `฿${price}`, icon: DollarSign }
  ];

  return (
    <div className="min-h-screen bg-[#F5EFE7] py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button
          onClick={() => navigate('/community-admin/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          {ct('กลับไปหน้า Dashboard', 'Back to Dashboard')}
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {ct('ตรวจสอบและอนุมัติ Workshop', 'Review and Approve Workshop')}
        </h1>
        <p className="text-gray-600 text-sm mb-8">
          {ct('ตรวจสอบรายละเอียด Workshop ก่อนอนุมัติให้แสดงบนเว็บไซต์', 'Review workshop details before approving for public display')}
        </p>

        <div className="space-y-6">
          <section className="bg-white rounded-[28px] shadow-sm border border-[#F2E4D4] p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/2">
                <div className="w-full h-64 bg-[#F7EFD8] rounded-2xl overflow-hidden flex items-center justify-center text-[#C9B799] text-sm font-medium">
                  {coverImage ? (
                    <img src={coverImage} alt={workshopData.title} className="w-full h-full object-cover" />
                  ) : (
                    ct('ไม่มีรูปภาพหน้าปก', 'No cover image')
                  )}
                </div>
              </div>

              <div className="lg:flex-1 space-y-5">
                <div>
                  <span className="inline-flex px-4 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                    {workshopData.approvalStatus === 'PENDING' ? ct('รอการอนุมัติ', 'Pending Approval') : workshopData.approvalStatus}
                  </span>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mt-3">
                    {workshopData.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {ct('จัดโดย', 'Hosted by')} {shopName}
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
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[28px] shadow-sm border border-[#F2E4D4] p-6 lg:p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">{ct('รายละเอียด Workshop', 'Workshop Details')}</h3>
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#FFF8EA] border border-[#F4E4C4]">
                <p className="text-sm font-semibold text-[#B48433] mb-1">{ct('คำอธิบาย', 'Description')}</p>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{workshopData.description || ct('ไม่มีคำอธิบาย', 'No description')}</p>
              </div>

              {requirements.length > 0 && (
                <div className="p-5 rounded-2xl bg-[#FAF5EE] border border-[#E8DCCB]">
                  <p className="text-sm font-semibold text-[#B48433] mb-3">{ct('สิ่งที่ต้องเตรียมมา', 'Requirements')}</p>
                  <ul className="space-y-2">
                    {requirements.map((req, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-700">
                        <CheckCircle className="h-4 w-4 text-[#9CC47F]" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          <section className="bg-gradient-to-br from-[#FFF4DA] via-[#FFE7C1] to-[#FFDDB1] rounded-[28px] border border-[#F3C992] p-6 lg:p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{ct('การดำเนินการโดยชุมชน', 'Community Admin Actions')}</h3>
            <div className="bg-white/60 border border-[#F3C992] rounded-2xl p-4 mb-6">
              <p className="text-sm font-semibold text-gray-800 mb-2">{ct('ข้อความถึงผู้จัด (แสดงให้ผู้จัดเห็น)', 'Note to facilitator')}</p>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[#E2C9A5] bg-white/80 focus:ring-2 focus:ring-[#E2A754] resize-none text-sm"
                placeholder={ct('ระบุคำแนะนำเพิ่มเติมเพื่อแจ้งผู้จัดหากจำเป็น...', 'Add instructions for the facilitator if needed...')}
              />
            </div>
            
            <div className="grid md:grid-cols-3 gap-3">
              <button
                onClick={() => setShowModal(true)}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#2F7B4D] hover:bg-[#25633E] text-white font-semibold rounded-xl transition shadow-sm"
              >
                <CheckCircle className="h-5 w-5" />
                {ct('อนุมัติ Workshop', 'Approve Workshop')}
              </button>

              <button
                onClick={() => {
                  setRejectType('REVISION');
                  setShowRejectModal(true);
                }}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#F4A236] hover:bg-[#E38E1D] text-white font-semibold rounded-xl transition shadow-sm"
              >
                <ClipboardList className="h-5 w-5" />
                {ct('ขอให้แก้ไข', 'Request Changes')}
              </button>

              <button
                onClick={() => {
                  setRejectType('REJECT');
                  setShowRejectModal(true);
                }}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#C14949] hover:bg-[#A63A3A] text-white font-semibold rounded-xl transition shadow-sm"
              >
                <XCircle className="h-5 w-5" />
                {ct('ปฏิเสธ Workshop', 'Reject Workshop')}
              </button>
            </div>
          </section>
        </div>
      </div>

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
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl"
              >
                {ct('ยกเลิก', 'Cancel')}
              </button>
              <button
                onClick={handleApprove}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-xl disabled:opacity-50"
              >
                {loading ? ct('กำลังดำเนินการ...', 'Processing...') : ct('ยืนยัน', 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${rejectType === 'REVISION' ? 'bg-orange-100' : 'bg-red-100'}`}>
                <XCircle className={`h-10 w-10 ${rejectType === 'REVISION' ? 'text-orange-600' : 'text-red-600'}`} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {rejectType === 'REVISION' ? ct('ขอให้แก้ไข Workshop', 'Request Changes') : ct('ปฏิเสธ Workshop', 'Reject Workshop')}
              </h3>
              <p className="text-gray-600 text-sm">
                {ct('โปรดระบุเหตุผลเพื่อให้เจ้าของร้านทราบและดำเนินการแก้ไข', 'Provide a reason so the shop owner can fix the issues')}
              </p>
            </div>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 mb-6 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#E2A754] resize-none"
              placeholder={ct('ระบุเหตุผล...', 'Enter reason...')}
            />

            <div className="flex gap-3">
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl"
              >
                {ct('ยกเลิก', 'Cancel')}
              </button>
              <button
                onClick={handleReject}
                disabled={loading || !rejectReason.trim()}
                className={`flex-1 px-4 py-3 text-white font-semibold rounded-xl disabled:opacity-50 ${rejectType === 'REVISION' ? 'bg-orange-500' : 'bg-red-600'}`}
              >
                {loading ? ct('กำลังดำเนินการ...', 'Processing...') : ct('ยืนยันส่ง', 'Submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWorkshopConfirmation;