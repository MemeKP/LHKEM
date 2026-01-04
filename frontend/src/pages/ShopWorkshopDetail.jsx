import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, CheckCircle } from 'lucide-react';

const ShopWorkshopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const workshop = useMemo(() => {
    const draft = JSON.parse(localStorage.getItem('shopDraft') || '{}');
    return (draft.workshops || []).find(w => w.id === id) || null;
  }, [id]);

  const enrollments = useMemo(() => ([
    { id: 'e1', name: 'สมหมาย ใจดี', contact: '081-234-5678', date: '2026-01-10', status: 'ยืนยันแล้ว' },
    { id: 'e2', name: 'สมหญิง รักสุข', contact: 'somying@email.com', date: '2026-01-11', status: 'ยืนยันแล้ว' },
    { id: 'e3', name: 'ประเสริฐ เงินทอง', contact: '089-765-4321', date: '2026-01-12', status: 'ยืนยันแล้ว' },
    { id: 'e4', name: 'วิไล วรยมน', contact: '062-111-2222', date: '2026-01-13', status: 'ยืนยันแล้ว' },
    { id: 'e5', name: 'สุธีย์ เมฆ', contact: '091-333-4444', date: '2026-01-14', status: 'รอตอบรับ' },
  ]), []);

  if (!workshop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  const seatsLeft = Math.max(0, (workshop.seatLimit || 0) - (workshop.seatsBooked || 0));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/shop/dashboard')}
          className="mb-6 text-sm text-gray-600 hover:text-orange-600"
        >
          ← กลับแดชบอร์ดร้าน
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{workshop.title}</h1>
              <p className="text-gray-600 mt-1">{workshop.description}</p>
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{workshop.date || '-'} {workshop.time || ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{workshop.location || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{workshop.seatsBooked}/{workshop.seatLimit} ที่นั่ง • เหลือ {seatsLeft} ที่นั่ง</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">ราคา</p>
              <p className="text-2xl font-bold text-gray-900">฿{workshop.price}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600">ยอดดู</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">42 ครั้ง</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600">ผู้จองทั้งหมด</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{enrollments.length} คน</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600">ที่นั่งคงเหลือ</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{seatsLeft} ที่นั่ง</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">รายชื่อผู้ลงทะเบียน</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm text-gray-600">ลำดับ</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-600">ชื่อ</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-600">เบอร์/อีเมล</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-600">วันที่ลงทะเบียน</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-600">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e, idx) => (
                  <tr key={e.id} className="border-t">
                    <td className="px-4 py-2 text-sm">{idx + 1}</td>
                    <td className="px-4 py-2 text-sm">{e.name}</td>
                    <td className="px-4 py-2 text-sm">{e.contact}</td>
                    <td className="px-4 py-2 text-sm">{e.date}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${e.status === 'ยืนยันแล้ว' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                        <CheckCircle className="h-3 w-3" />
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">จัดการ Workshop</h2>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg">เปิดรับ Workshop</button>
            <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg">ปิดรับสมัคร</button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg">ยกเลิก Workshop</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopWorkshopDetail;
