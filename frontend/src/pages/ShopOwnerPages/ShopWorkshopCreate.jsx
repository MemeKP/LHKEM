import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Users, Calendar, Plus, X, Image as ImageIcon } from 'lucide-react';

import Swal from 'sweetalert2';

import { useMyShop } from '../../hooks/useMyShop';
import { useTranslation } from '../../hooks/useTranslation';

import ShopPendingApprovalNotice from '../../components/ShopPendingApprovalNotice';
import api from '../../services/api'; // ADDED: For backend connection

const WORKSHOP_CATEGORY_OPTIONS = [
  { value: 'งานฝีมือ', label: 'งานฝีมือ (Crafts)' },
  { value: 'ศิลปะ', label: 'ศิลปะ (Art)' },
  { value: 'อาหาร', label: 'อาหาร (Cooking)' },
  { value: 'วัฒนธรรม', label: 'วัฒนธรรม (Culture)' },
];

const ShopWorkshopCreate = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { data: shop, isLoading: shopLoading } = useMyShop();
  const { ct } = useTranslation();

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    registrationStartDate: '',
    registrationEndDate: '',
    workshopDate: '',
    workshopStartTime: '',
    workshopEndTime: '',
    locationType: 'shop', // 'shop' or 'custom'
    customLocation: '',
    seatLimit: '',
    price: '',
    imageUrl: '',
    category: 'งานฝีมือ',
    categories: [],
    activities: [
      { id: 1, title: '', description: '', duration: '' }
    ]
  });

  const toggleCategory = (c) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(c)
        ? prev.categories.filter(x => x !== c)
        : [...prev.categories, c]
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleActivityChange = (id, field, value) => {
    setForm(prev => ({
      ...prev,
      activities: prev.activities.map(a => 
        a.id === id ? { ...a, [field]: value } : a
      )
    }));
  };

  const handleLocationTypeChange = (nextType) => {
    setForm(prev => ({
      ...prev,
      locationType: nextType,
      customLocation: nextType === 'custom' ? prev.customLocation : ''
    }));
  };

  const addActivity = () => {
    setForm(prev => ({
      ...prev,
      activities: [...prev.activities, { id: Date.now(), title: '', description: '', duration: '' }]
    }));
  };

  const removeActivity = (id) => {
    setForm(prev => ({
      ...prev,
      activities: prev.activities.filter(a => a.id !== id)
    }));
  };

  const handleImagePick = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, imageUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // CRITICAL FIX: Updated handleSubmit to post to real backend instead of localStorage
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!shop?._id) {
      Swal.fire({
        icon: 'error',
        title: ct('ไม่พบข้อมูลร้านค้า', 'Shop not found'),
        text: ct('กรุณากลับไปสร้างโปรไฟล์ร้านก่อนสร้าง Workshop', 'Please create your shop profile before creating a workshop'),
      });
      return;
    }

    const { registrationStartDate, registrationEndDate, workshopDate, workshopStartTime, workshopEndTime } = form;

    if (!registrationStartDate || !registrationEndDate || !workshopDate) {
      Swal.fire({
        icon: 'warning',
        title: ct('กรุณาเลือกวันที่ให้ครบ', 'Please select all dates'),
        text: ct('โปรดระบุวันเปิดรับสมัคร วันปิดรับสมัคร และวันจัดกิจกรรมให้ครบถ้วน', 'Please specify registration start, registration end, and workshop dates.'),
        confirmButtonText: ct('ตกลง', 'OK'),
      });
      return;
    }

    if (!workshopStartTime || !workshopEndTime) {
      Swal.fire({
        icon: 'warning',
        title: ct('กรุณากรอกเวลาให้ครบ', 'Please provide both start and end times'),
        text: ct('ระบุเวลาเริ่มและเวลาสิ้นสุดของกิจกรรมให้ครบถ้วนก่อนบันทึก', 'Please enter both the start and end times before saving.'),
        confirmButtonText: ct('ตกลง', 'OK'),
      });
      return;
    }

    const start = new Date(registrationStartDate);
    const end = new Date(registrationEndDate);
    const workshop = new Date(workshopDate);
    const minGap = 7 * 24 * 60 * 60 * 1000; // 7 days
    const latestAllowedEnd = new Date(workshop.getTime() - minGap);

    const toMinutes = (time) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    const startMinutes = toMinutes(workshopStartTime);
    const endMinutes = toMinutes(workshopEndTime);

    if (startMinutes >= endMinutes) {
      Swal.fire({
        icon: 'warning',
        title: ct('เวลาเริ่มต้องอยู่ก่อนเวลาสิ้นสุด', 'Start time must be before end time'),
        text: ct('กรุณาตรวจสอบช่วงเวลาให้ถูกต้องก่อนบันทึก', 'Please ensure the workshop start time occurs before the end time.'),
        confirmButtonText: ct('เข้าใจแล้ว', 'Understood'),
      });
      return;
    }

    if (end < start) {
      Swal.fire({
        icon: 'warning',
        title: ct('วันปิดรับสมัครไม่ถูกต้อง', 'Invalid registration deadline'),
        text: ct('วันปิดรับสมัครต้องไม่อยู่ก่อนวันเปิดรับสมัคร', 'Registration end date cannot be before the start date.'),
        confirmButtonText: ct('ตกลง', 'OK'),
      });
      return;
    }

    if (end > workshop) {
      Swal.fire({
        icon: 'warning',
        title: ct('วันปิดรับสมัครต้องไม่เกินวันจัดงาน', 'Deadline cannot exceed event date'),
        text: ct('กรุณากำหนดวันปิดรับสมัครให้ก่อนหรือในวันจัดกิจกรรม', 'Please keep the registration cutoff on or before the workshop date.'),
        confirmButtonText: ct('ตกลง', 'OK'),
      });
      return;
    }

    if (end > latestAllowedEnd) {
      Swal.fire({
        icon: 'warning',
        title: ct('กรุณาปิดรับสมัครล่วงหน้า 7 วัน', 'Close registration at least 7 days early'),
        text: ct('เพื่อเตรียมงานให้พร้อม กรุณากำหนดวันปิดรับสมัครอย่างน้อย 7 วันก่อนวันจัดกิจกรรม', 'Please set the registration deadline at least seven days before the workshop so the shop can prepare.'),
        confirmButtonText: ct('เข้าใจแล้ว', 'Understood'),
      });
      return;
    }

    setSaving(true);
    Swal.fire({
      title: ct('กำลังบันทึก Workshop...', 'Saving workshop...'),
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      // 1. Construct standard ISO Date for the required backend 'date' field
      const eventDateIso = form.workshopDate
        ? new Date(`${form.workshopDate}T${form.workshopStartTime || '00:00'}:00`).toISOString()
        : new Date().toISOString();

      // 2. Map the frontend UI fields to match your CreateWorkshopDto exactly
      const sanitizedCustomLocation = form.customLocation.trim();

      const payload = {
        title: form.title,
        description: form.description,
        price: Number(form.price || 0),
        capacity: Number(form.seatLimit || 0), // Mapping 'seatLimit' to 'capacity'
        date: eventDateIso, 
        workshopDate: form.workshopDate,
        // Ensure a valid category is sent to bypass the @IsIn decorator
        category: form.category || 'งานฝีมือ', 
        // Pass the extra UI fields to the backend
        startDate: form.registrationStartDate,
        endDate: form.registrationEndDate,
        startTime: form.workshopStartTime,
        endTime: form.workshopEndTime,
        locationType: form.locationType,
        customLocation: form.locationType === 'custom' ? sanitizedCustomLocation : '',
        image: form.imageUrl, // Base64
        // 3. Attach MongoDB Relational IDs
        shopId: String(shop._id), 
        communityId: String(shop.community?._id || shop.community || shop.communityId), 
      };

      // 4. Send to the secured management route
      await api.post('/management/workshops', payload);

      Swal.close();
      await Swal.fire({
        icon: 'success',
        title: 'สร้าง Workshop สำเร็จ',
        text: 'ส่งคำขอไปยังแอดมินเพื่ออนุมัติแล้ว',
      });

      navigate(`/${slug}/shop/dashboard`);

    } catch (error) {
      const backendError = error.response?.data?.message || error.message;
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'บันทึกไม่สำเร็จ',
        text: Array.isArray(backendError) ? backendError[0] : backendError,
      });
      console.error('Creation error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (shopLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5EFE7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (shop && shop.status !== 'ACTIVE') {
    return (
      <ShopPendingApprovalNotice
        title="ร้านค้าของคุณยังรอการอนุมัติ"
        description="ไม่สามารถสร้าง Workshop ได้จนกว่าร้านค้าจะได้รับการอนุมัติจากแพลตฟอร์ม"
        actions={[
          {
            label: 'กลับไปแดชบอร์ด',
            onClick: () => navigate(`/${slug}/shop/dashboard`),
            variant: 'secondary',
          },
          {
            label: 'แก้ไขข้อมูลร้าน',
            onClick: () => navigate(`/${slug}/shop/profile`),
            variant: 'primary',
          },
        ]}
      >
        <p>กรุณาตรวจสอบให้ข้อมูลร้านครบถ้วนและรอการตรวจสอบจากทีมแพลตฟอร์ม</p>
      </ShopPendingApprovalNotice>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5EFE7] py-12 animate-fadeIn">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(`/${slug}/shop/dashboard`)}
          className="mb-6 flex items-center gap-2 text-sm text-[#6B6B6B] hover:text-[#E07B39] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับ
        </button>
        
        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2F4F2F] mb-3">สร้าง Workshop ของคุณ</h1>
          <p className="text-[#6B6B6B] text-base">บอกเล่าให้กับคนรู้ว่า Workshop นี้ทำอะไร</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-6 border border-gray-100 animate-slideUp" style={{animationDelay: '0.1s'}}>
          {/* Workshop Title */}
          <div className="animate-fadeIn" style={{animationDelay: '0.2s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-2">ชื่อ Workshop</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="เช่น ทดลองสานตะกร้าไม้ไผ่แบบดั้งเดิม"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Workshop Image */}
          <div className="animate-fadeIn" style={{animationDelay: '0.3s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-2">รูปภาพ Workshop</label>
            <div className="border-2 border-dashed border-[#E07B39] rounded-xl p-8 bg-[#FFF7ED] hover:bg-[#FFEDD5] transition-colors">
              {form.imageUrl ? (
                <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                  <img src={form.imageUrl} alt="workshop" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="h-12 w-12 text-[#E07B39] mx-auto mb-3" />
                  <p className="text-sm text-[#6B6B6B] mb-1">อัปโหลดรูปภาพ Workshop</p>
                  <p className="text-xs text-[#9CA3AF]">รองรับไฟล์ JPG, PNG</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#E07B39] text-[#E07B39] font-medium rounded-full cursor-pointer hover:bg-[#E07B39] hover:text-white transition-all hover:scale-105 shadow-sm">
                <ImageIcon className="h-4 w-4" />
                เลือกรูปภาพ
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImagePick(e.target.files?.[0])} />
              </label>
              {form.imageUrl && (
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, imageUrl: '' }))}
                  className="px-5 py-2.5 bg-red-50 text-red-600 font-medium rounded-full hover:bg-red-100 transition-all hover:scale-105"
                >
                  ลบรูป
                </button>
              )}
            </div>
          </div>

          {/* Workshop Description */}
          <div className="animate-fadeIn" style={{animationDelay: '0.4s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-2">คำอธิบาย Workshop</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="อธิบายรายละเอียด Workshop ของคุณ เช่น สิ่งที่จะได้เรียนรู้ กิจกรรมที่จะทำ"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all resize-none"
              required
            />
          </div>

          {/* Registration Period */}
          <div className="animate-fadeIn" style={{animationDelay: '0.5s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-3">📅 ระยะเวลาการลงทะเบียน</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#6B6B6B] mb-1.5">วันที่เปิดรับลงทะเบียน</label>
                <input
                  type="date"
                  name="registrationStartDate"
                  value={form.registrationStartDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-[#6B6B6B] mb-1.5">วันที่ปิดรับลงทะเบียน</label>
                <input
                  type="date"
                  name="registrationEndDate"
                  value={form.registrationEndDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Workshop Event Date */}
          <div className="animate-fadeIn" style={{animationDelay: '0.65s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-3">📆 วันที่จัด Workshop</label>
            <input
              type="date"
              name="workshopDate"
              value={form.workshopDate}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Workshop Time */}
          <div className="animate-fadeIn" style={{animationDelay: '0.6s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-3">⏰ ช่วงเวลาทำ Workshop</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#6B6B6B] mb-1.5">เวลาเริ่มกิจกรรม</label>
                <input
                  type="time"
                  name="workshopStartTime"
                  value={form.workshopStartTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-[#6B6B6B] mb-1.5">เวลาสิ้นสุดกิจกรรม</label>
                <input
                  type="time"
                  name="workshopEndTime"
                  value={form.workshopEndTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="animate-fadeIn" style={{animationDelay: '0.7s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-3">📍 สถานที่</label>
            <div className="space-y-3">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="locationType"
                    value="shop"
                    checked={form.locationType === 'shop'}
                    onChange={() => handleLocationTypeChange('shop')}
                    className="w-4 h-4 text-[#E07B39] border-gray-300 focus:ring-[#E07B39]"
                  />
                  <span className="text-sm text-[#3D3D3D]">ใช้สถานที่ร้าน</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="locationType"
                    value="custom"
                    checked={form.locationType === 'custom'}
                    onChange={() => handleLocationTypeChange('custom')}
                    className="w-4 h-4 text-[#E07B39] border-gray-300 focus:ring-[#E07B39]"
                  />
                  <span className="text-sm text-[#3D3D3D]">ระบุสถานที่เอง</span>
                </label>
              </div>
              {form.locationType === 'custom' && (
                <div>
                  <input
                    type="text"
                    name="customLocation"
                    value={form.customLocation}
                    onChange={handleChange}
                    placeholder="ระบุสถานที่จัด Workshop"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
                    required={form.locationType === 'custom'}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Seat Limit */}
          <div className="animate-fadeIn" style={{animationDelay: '0.8s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-3">👥 จำนวนที่รับ</label>
            <div>
              <label className="block text-xs text-[#6B6B6B] mb-1.5">จำนวนที่นั่ง</label>
              <input
                type="number"
                name="seatLimit"
                value={form.seatLimit}
                onChange={handleChange}
                placeholder="เช่น 20"
                min="1"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Price */}
          <div className="animate-fadeIn" style={{animationDelay: '0.9s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-3">💰 ค่าสมัคร</label>
            <div>
              <label className="block text-xs text-[#6B6B6B] mb-1.5">ราคา (บาท)</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="฿0"
                min="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
                required
              />
              <p className="text-xs text-[#9CA3AF] mt-1.5">ใส่ 0 ถ้าเป็น Workshop ฟรี</p>
            </div>
          </div>

          {/* Workshop Category */}
          <div className="animate-fadeIn" style={{animationDelay: '1.0s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-3">หมวดหมู่หลักของ Workshop</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {WORKSHOP_CATEGORY_OPTIONS.map(option => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${form.category === option.value ? 'border-[#E07B39] bg-[#FFF7ED]' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={option.value}
                    checked={form.category === option.value}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#E07B39] border-gray-300 focus:ring-[#E07B39]"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 animate-fadeIn" style={{animationDelay: '1.2s'}}>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 bg-[#E07B39] hover:bg-[#D66B29] text-white font-semibold rounded-full transition-all disabled:opacity-60 shadow-md hover:shadow-lg hover:scale-[1.02] transform"
            >
              {saving ? 'กำลังบันทึก...' : 'สร้าง Workshop'}
            </button>
            <p className="text-center text-xs text-[#6B6B6B] mt-3">
              Workshop จะถูกส่งไปยังแอดมินเพื่อตรวจสอบก่อนเผยแพร่
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopWorkshopCreate;