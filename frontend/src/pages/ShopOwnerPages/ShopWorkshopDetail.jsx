import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Users, CheckCircle, Calendar, DollarSign, Edit, X, Pause, Eye, Mail, AlertCircle, Edit3 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useMyShop } from '../../hooks/useMyShop';
import ShopPendingApprovalNotice from '../../components/ShopPendingApprovalNotice';
import api from '../../services/api';

const ShopWorkshopDetail = () => {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const { t, ct } = useTranslation();
  const { data: shop, isLoading: shopLoading } = useMyShop();
  
  const [workshop, setWorkshop] = useState(null);
  const [enrollments, setEnrollments] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Workshop Data & Enrollments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const timestamp = new Date().getTime();
        const workshopRes = await api.get(`/management/workshops/${id}?_t=${timestamp}`);
        setWorkshop(workshopRes.data?.data || workshopRes.data);

        try {
          // The backend now automatically includes .fetchedUser, so we just set it directly!
          const enrollRes = await api.get(`/management/workshops/${id}/enrollments?_t=${timestamp}`);
          setEnrollments(Array.isArray(enrollRes.data) ? enrollRes.data : (enrollRes.data?.data || []));
        } catch (enrollErr) {
          console.warn('Enrollment fetch failed:', enrollErr);
          setEnrollments([]); 
        }

      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleUpdateEnrollmentStatus = async (enrollmentId, newStatus) => {
    try {
      await api.patch(`/management/workshops/enrollments/${enrollmentId}/status`, { 
        status: newStatus 
      });
      setEnrollments(prev => prev.map(e => 
        (e._id === enrollmentId || e.id === enrollmentId) ? { ...e, status: newStatus } : e
      ));
      alert(ct('อัปเดตสถานะสำเร็จ', 'Status updated successfully'));
    } catch (error) {
      console.error('Failed to update status:', error);
      alert(ct('ไม่สามารถอัปเดตสถานะได้', 'Failed to update status'));
    }
  };

  const handleUpdateWorkshopStatus = async (newRegStatus, newAppStatus) => {
    const isCancel = newAppStatus === 'REJECTED';
    const msg = isCancel ? 'ต้องการยกเลิกถาวรใช่หรือไม่?' : 'ต้องการเปลี่ยนสถานะการรับสมัครใช่หรือไม่?';
    
    if (!window.confirm(ct(msg, 'Confirm status change?'))) return;

    try {
      const payload = {
        registrationStatus: newRegStatus,
        approvalStatus: newAppStatus || workshop.approvalStatus 
      };

      await api.patch(`/management/workshops/${id}`, payload);
      setWorkshop(prev => ({ ...prev, ...payload }));
      alert(ct('อัปเดตสถานะสำเร็จ', 'Status updated'));
    } catch (error) {
      console.error('Status update failed:', error);
      alert(ct('เกิดข้อผิดพลาดในการอัปเดตสถานะ', 'Failed to update status'));
    }
  };

  if (shopLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5EFE7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{ct('กำลังโหลดข้อมูล...', 'Loading data...')}</p>
        </div>
      </div>
    );
  }

  if (shop && shop.status !== 'ACTIVE') {
    return (
      <ShopPendingApprovalNotice
        title={ct('ร้านค้าของคุณยังรอการอนุมัติ', 'Your shop is pending approval')}
        description={ct('ไม่สามารถดูรายละเอียด Workshop ได้จนกว่าร้านค้าจะได้รับการอนุมัติ', 'Cannot view workshop details until shop is approved')}
        actions={[
          { label: ct('กลับไปแดชบอร์ด', 'Back to Dashboard'), onClick: () => navigate(`/${slug}/shop/dashboard`), variant: 'secondary' },
          { label: ct('แก้ไขข้อมูลร้าน', 'Edit Shop Profile'), onClick: () => navigate(`/${slug}/shop/profile`), variant: 'primary' },
        ]}
      />
    );
  }

  if (!workshop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5EFE7]">
        <div className="text-center">
          <p className="mt-4 text-gray-600">{ct('ไม่พบข้อมูล Workshop', 'Workshop not found')}</p>
          <button onClick={() => navigate(`/${slug}/shop/dashboard`)} className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg">
            {ct('กลับหน้าหลัก', 'Back to Home')}
          </button>
        </div>
      </div>
    );
  }

  const capacity = workshop.capacity || workshop.seatLimit || 0;
  
  const confirmedEnrollments = enrollments.filter(e => e.status === 'CONFIRMED' || e.status === 'ยืนยันแล้ว');
  
  const participants = confirmedEnrollments.reduce((sum, e) => {
    const bookedSeats = Number(e.slots) || Number(e.guestCount) || 1;
    return sum + bookedSeats;
  }, 0);
  
  const seatsLeft = Math.max(0, capacity - participants);
  const totalViews = workshop.views || 0; 

  return (
    <div className="min-h-screen bg-[#F5EFE7] py-12 animate-fadeIn">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button
          onClick={() => navigate(`/${slug}/shop/dashboard`)}
          className="mb-6 flex items-center gap-2 text-sm text-[#6B6B6B] hover:text-[#E07B39] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> {ct('กลับ', 'Back')}
        </button>

        {workshop.approvalStatus === 'CHANGE' && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
            <div className="p-2 bg-orange-100 rounded-full text-orange-600">
              <Edit3 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-orange-900">{ct('ต้องแก้ไข', 'Revision Needed')}</h3>
              <p className="text-sm text-orange-800 mt-1 whitespace-pre-wrap">
                <span className="font-semibold">{ct('เหตุผล: ', 'Reason: ')}</span> 
                {workshop.rejectReason || ct('ไม่มีการระบุเหตุผล', 'No reason provided.')}
              </p>
            </div>
          </div>
        )}

        {workshop.approvalStatus === 'REJECTED' && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
            <div className="p-2 bg-red-100 rounded-full text-red-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900">{ct('ไม่อนุมัติ', 'Workshop Rejected')}</h3>
              <p className="text-sm text-red-800 mt-1 whitespace-pre-wrap">
                <span className="font-semibold">{ct('เหตุผล: ', 'Reason: ')}</span> 
                {workshop.rejectReason || ct('ไม่มีการระบุเหตุผล', 'No reason provided.')}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 animate-slideUp border border-gray-100">
          <div className="flex items-start justify-between mb-6">
            <h1 className="text-3xl font-bold text-[#2F4F2F]">{workshop.title}</h1>
            <button onClick={() => navigate(`/${slug}/shop/dashboard`)} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-video w-full bg-gray-100 rounded-xl overflow-hidden">
              {(workshop.image || workshop.imageUrl) ? (
                <img src={workshop.image || workshop.imageUrl} alt={workshop.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-2">📸</div>
                    <p className="text-sm">{ct('ไม่มีรูปภาพ', 'No Image')}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {workshop.approvalStatus === 'PENDING' && <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">{ct('รออนุมัติ', 'Pending')}</span>}
                {workshop.approvalStatus === 'CHANGE' && <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800">{ct('ต้องแก้ไข', 'Needs Revision')}</span>}
                {workshop.approvalStatus === 'REJECTED' && <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">{ct('ไม่อนุมัติ', 'Rejected')}</span>}
                {workshop.approvalStatus === 'ACTIVE' && <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">{ct('อนุมัติแล้ว', 'Approved')}</span>}

                {workshop.approvalStatus === 'ACTIVE' && (
                  workshop.registrationStatus === 'OPEN' 
                    ? <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">{ct('เปิดรับสมัคร', 'Open')}</span>
                    : <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{ct('ปิดรับสมัคร', 'Closed')}</span>
                )}
              </div>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">
                    {workshop.startDate ? new Date(workshop.startDate).toLocaleDateString('th-TH') : (workshop.date ? new Date(workshop.date).toLocaleDateString('th-TH') : ct('ไม่ระบุ', 'N/A'))}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">
                    {workshop.startTime && workshop.endTime ? `${workshop.startTime} - ${workshop.endTime}` : (workshop.time || ct('ไม่ระบุเวลา', 'Time not specified'))}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">{workshop.customLocation || workshop.location || ct('ใช้สถานที่ร้าน', 'Shop Location')}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Users className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">{participants} / {capacity} {ct('คน', 'people')}</span>
                </div>
              </div>
              
              <button 
                onClick={() => navigate(`/${slug}/shop/workshops/${id}/edit`)}
                className="w-full mt-4 px-6 py-3 bg-[#E07B39] text-white rounded-full hover:bg-[#D66B29] font-semibold transition-all hover:scale-105 shadow-md"
              >
                {ct('แก้ไขข้อมูล Workshop', 'Edit Workshop Details')}
              </button>
              
              <p className="text-xs text-gray-500 text-center">{ct('สามารถแก้ไขข้อมูลก่อนอนุมัติ', 'Details can be edited before approval')}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 animate-stagger">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B6B6B] mb-1">{ct('ยอดเข้าดู', 'Views')}</p>
                <p className="text-3xl font-bold text-[#3D3D3D]">{totalViews} {ct('ครั้ง', 'times')}</p>
              </div>
              <div className="p-3 bg-[#FFF7ED] rounded-lg">
                <Eye className="h-6 w-6 text-[#E07B39]" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B6B6B] mb-1">{ct('ผู้เข้าร่วมที่ยืนยันแล้ว', 'Confirmed Participants')}</p>
                <p className="text-3xl font-bold text-[#3D3D3D]">{participants} {ct('คน', 'people')}</p>
              </div>
              <div className="p-3 bg-[#E8F5E9] rounded-lg">
                <Users className="h-6 w-6 text-[#4CAF50]" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B6B6B] mb-1">{ct('ที่ว่างคงเหลือ', 'Seats Left')}</p>
                <p className="text-3xl font-bold text-[#3D3D3D]">{ct('เหลือ', 'Left')} {seatsLeft} {ct('ที่นั่ง', 'seats')}</p>
              </div>
              <div className="p-3 bg-[#FFF7ED] rounded-lg">
                <Calendar className="h-6 w-6 text-[#E07B39]" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 animate-slideUp border border-gray-100">
          <h2 className="text-xl font-bold text-[#2F4F2F] mb-6">{ct('รายชื่อผู้ลงทะเบียน', 'Registered Participants')}</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{ct('ลำดับ', 'No.')}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{ct('ชื่อ', 'Name')}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{ct('อีเมล', 'Email')}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{ct('เบอร์โทร', 'Phone')}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{ct('จำนวนที่จอง', 'Seats')}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{ct('วันที่ลงทะเบียน', 'Registration Date')}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{ct('สถานะ', 'Status')}</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      {ct('ยังไม่มีผู้ลงทะเบียน', 'No participants registered yet')}
                    </td>
                  </tr>
                ) : (
                  enrollments.map((e, idx) => {
                    // Extracting the fetched user data strictly from the new backend process
                    const userData = e.fetchedUser || e;
                    const userName = userData?.name || userData?.displayName || userData?.username || ct('ไม่ระบุชื่อ', 'Unknown Name');
                    const userEmail = userData?.email || '-';
                    const userPhone = userData?.phone || userData?.phoneNumber || '-';
                    const bookedSeats = e.slots || e.guestCount || 1;

                    return (
                      <tr key={e._id || idx} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm text-gray-700">{idx + 1}</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{userName}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{userEmail}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{userPhone}</td>
                        <td className="px-4 py-4 text-sm text-gray-900 font-medium">{bookedSeats}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {e.createdAt ? new Date(e.createdAt).toLocaleDateString('th-TH') : (e.date ? new Date(e.date).toLocaleDateString('th-TH') : '-')}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          {e.status === 'PENDING' || e.status === 'รอตอบรับ' ? (
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleUpdateEnrollmentStatus(e._id, 'CONFIRMED')}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 font-medium transition-colors"
                              >
                                {ct('ยืนยัน', 'Confirm')}
                              </button>
                              <button 
                                onClick={() => handleUpdateEnrollmentStatus(e._id, 'REJECTED')}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 font-medium transition-colors"
                              >
                                {ct('ปฏิเสธ', 'Reject')}
                              </button>
                            </div>
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                              e.status === 'CONFIRMED' || e.status === 'ยืนยันแล้ว' ? 'bg-green-50 text-green-700' : 
                              e.status === 'REJECTED' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              <CheckCircle className="h-3 w-3" />
                              {e.status === 'CONFIRMED' ? ct('ยืนยันแล้ว', 'Confirmed') : e.status === 'REJECTED' ? ct('ปฏิเสธแล้ว', 'Rejected') : e.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 animate-slideUp border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{ct('แจ้งข้อมูลผู้ลงทะเบียน', 'Notify Registrants')}</h2>
          <p className="text-sm text-gray-600 mb-6">
            {ct('ใช้ปุ่มนี้เพื่อแจ้งเตือนผู้เข้าร่วมเกี่ยวกับข้อมูลสำคัญเพิ่มเติม', 'Use these buttons to notify participants about important updates.')}
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 px-6 py-3 border border-[#2E7D32] text-[#2E7D32] rounded-full font-semibold hover:bg-[#E8F5E9] transition-colors">
              <Mail className="h-4 w-4" />
              {ct('ส่งอีเมลถึงผู้ลงทะเบียนทั้งหมด', 'Send Email to All Registrants')}
            </button>
            <button className="flex items-center gap-2 px-6 py-3 border border-[#D1D5DB] text-[#4B5563] rounded-full font-semibold hover:bg-gray-50 transition-colors">
              <Mail className="h-4 w-4" />
              {ct('ส่งข้อความถึงผู้ลงทะเบียนทั้งหมด', 'Send Message to All Registrants')}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 animate-slideUp border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{ct('จัดการ Workshop', 'Manage Workshop')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <button 
              onClick={() => navigate(`/${slug}/shop/workshops/${id}/edit`)}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-[#2E7D32] text-[#2E7D32] rounded-full font-semibold hover:bg-[#E8F5E9] transition-colors"
            >
              <Edit className="h-4 w-4" />
              {ct('แก้ไข Workshop', 'Edit Workshop')}
            </button>
            
            <button 
              onClick={() => handleUpdateWorkshopStatus(workshop.registrationStatus === 'OPEN' ? 'CLOSED' : 'OPEN')}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-[#F57C00] text-[#F57C00] rounded-full font-semibold hover:bg-[#FFF3E0] transition-colors"
            >
              <Pause className="h-4 w-4" />
              {workshop.registrationStatus === 'OPEN' ? ct('พักกิจกรรม (ปิดรับสมัคร)', 'Pause (Close Registration)') : ct('เปิดรับสมัครใหม่', 'Re-open Registration')}
            </button>

            <button 
              onClick={() => handleUpdateWorkshopStatus('CLOSED', 'REJECTED')}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-[#D32F2F] text-[#D32F2F] rounded-full font-semibold hover:bg-[#FFEBEE] transition-colors"
            >
              <X className="h-4 w-4" />
              {ct('ยกเลิกกิจกรรมถาวร', 'Cancel Workshop Permanently')}
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ShopWorkshopDetail;