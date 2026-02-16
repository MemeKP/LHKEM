import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, CheckCircle, Calendar, DollarSign, X, Download, Share2, Pause, Edit } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const ShopWorkshopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const workshop = useMemo(() => {
    const draft = JSON.parse(localStorage.getItem('shopDraft') || '{}');
    return (draft.workshops || []).find(w => w.id === id) || null;
  }, [id]);

  const enrollments = useMemo(() => ([
    { id: 'e1', name: 'สมหมาย ใจดี', email: 'sommai@email.com', phone: '081-234-5678', date: '2026-01-10', status: 'ยืนยันแล้ว' },
    { id: 'e2', name: 'สมหญิง รักสุข', email: 'somying@email.com', phone: '082-345-6789', date: '2026-01-11', status: 'ยืนยันแล้ว' },
    { id: 'e3', name: 'ประเสริฐ เงินทอง', email: 'prasert@email.com', phone: '089-765-4321', date: '2026-01-12', status: 'ยืนยันแล้ว' },
    { id: 'e4', name: 'วิไล วรยมน', email: 'wilai@email.com', phone: '062-111-2222', date: '2026-01-13', status: 'ยืนยันแล้ว' },
    { id: 'e5', name: 'สุธีย์ เมฆ', email: 'sutee@email.com', phone: '091-333-4444', date: '2026-01-14', status: 'รอตอบรับ' },
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
    <div className="min-h-screen bg-[#FAF8F3] py-8 animate-fadeIn">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/shop/dashboard')}
          className="mb-6 text-sm text-gray-600 hover:text-orange-600 flex items-center gap-1"
        >
          ← กลับ
        </button>

        {/* Workshop Preview Modal Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 animate-slideUp border border-gray-100">
          <div className="flex items-start justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{workshop.title}</h1>
            <button className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-video w-full bg-gray-100 rounded-xl overflow-hidden">
              {workshop.imageUrl ? (
                <img src={workshop.imageUrl} alt={workshop.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-2">📸</div>
                    <p className="text-sm">ไม่มีรูปภาพ</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                เปิดรับสมัคร
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">{workshop.date || '15 มกราคม 2568'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">{workshop.time || '09:00 - 12:00'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">{workshop.location || 'ร้านหัตถกรรมบ้านสุขคำ'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Users className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">{workshop.seatsBooked || 5} / {workshop.seatLimit || 10} คน</span>
                </div>
              </div>
              
              <button 
                onClick={() => navigate(`/shop/workshops/${id}/edit`)}
                className="w-full mt-4 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors"
              >
                แก้ไขข้อมูล Workshop
              </button>
              
              <p className="text-xs text-gray-500 text-center">สามารถแก้ไขข้อมูลก่อนอนุมัติ</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 animate-stagger">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">ยอดจอง</p>
                <p className="text-3xl font-bold text-gray-900">{workshop.seatsBooked || 42} ครั้ง</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">ผู้เข้าร่วม</p>
                <p className="text-3xl font-bold text-gray-900">{enrollments.length} คน</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">ที่ว่างคงเหลือ</p>
                <p className="text-3xl font-bold text-gray-900">เหลือ {seatsLeft} ที่นั่ง</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Participant List */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 animate-slideUp border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">รายชื่อผู้ลงทะเบียน</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ลำดับ</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ชื่อ</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">อีเมล</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">เบอร์โทร</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">วันที่ลงทะเบียน</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e, idx) => (
                  <tr key={e.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm text-gray-700">{idx + 1}</td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{e.name}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{e.email}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{e.phone}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{new Date(e.date).toLocaleDateString('th-TH')}</td>
                    <td className="px-4 py-4 text-sm">
                      {e.status === 'รอตอบรับ' ? (
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 font-medium transition-colors">
                            ยืนยัน
                          </button>
                          <button className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 font-medium transition-colors">
                            ปฏิเสธ
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-green-50 text-green-700 font-medium">
                          <CheckCircle className="h-3 w-3" />
                          {e.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 animate-slideUp border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">แจ้งข้อมูลผู้ลงทะเบียน</h2>
          <p className="text-sm text-gray-600 mb-6">
            ใช้ปุ่มนี้เพื่อแจ้งเตือนผู้เข้าร่วมเกี่ยวกับข้อมูลสำคัญเพิ่มเติม
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors">
              <Download className="h-4 w-4" />
              ส่งเอกสารให้ผู้เข้าร่วมทั้งหมด
            </button>
            <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
              <Share2 className="h-4 w-4" />
              ส่งเอกสารให้ผู้เข้าร่วมที่เลือก
            </button>
          </div>
        </div>

        {/* Workshop Management Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 animate-slideUp border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">จัดการ Workshop</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => navigate(`/shop/workshops/${id}/edit`)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
            >
              <Edit className="h-4 w-4" />
              แก้ไข Workshop
            </button>
            <button className="flex items-center justify-center gap-2 px-6 py-3 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 font-medium transition-colors">
              <X className="h-4 w-4" />
              ยกเลิก
            </button>
            <button className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
              <Pause className="h-4 w-4" />
              ปิดรับ Workshop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopWorkshopDetail;
