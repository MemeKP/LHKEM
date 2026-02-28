import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, DollarSign, Save, Upload, X, Image as ImageIcon, Phone, MessageCircle, Facebook } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';

/**
 * Event Create Form - สร้าง Event ใหม่สำหรับชุมชน
 * 
 * ✅ Backend API: POST /api/events
 * 
 * Event Schema fields (ส่งไปยัง Backend):
 * - title (required) - ชื่องาน/กิจกรรม
 * - description (required) - เล่าเกี่ยวกับกิจกรรม
 * - location (required) - สถานที่ (Object: full_address, province, coordinates)
 * - start_at (required) - วันและเวลาเริ่ม (ISO DateTime)
 * - end_at (required) - วันและเวลาสิ้นสุด (ISO DateTime)
 * - deposit_amount (optional) - ค่าใช้จ่าย/ค่าม��ดจำ
 * - is_featured (boolean) - แนะนำ
 * - is_pinned (boolean) - ปักหมุด
 * - images (string) - รูปภาพปก (TODO: รอ Image Upload API)
 * 
 * Additional fields (ไม่ส่งไปยัง Backend - สำหรับ UI เท่านั้น):
 * - event_type - ประเภทกิจกรรม (เทศกาล, Workshop, วัฒนธรรม, ตลาดนัด, อื่นๆ)
 * - workshops - Workshop ที่เข้าร่วม (array of workshop IDs)
 * - target_audience - กลุ่มเป้าหมาย
 * - cost_type - ประเภทค่าใช้จ่าย (free/paid)
 * - contact_phone - เบอร์โทรศัพท์ติดต่อ
 * - contact_line - Line ID
 * - contact_facebook - Facebook
 * - coordinator_name - ชื่อผู้ประสานงาน
 * - additional_info - ข้อมูลเพิ่มเติม
 */
const createEventAPI = async (payload) => {
  const response = await api.post('/api/events', payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data;
};

const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEventAPI,
    onSuccess: (data) => {
      console.log("Event Created for Community:", data.community_id);

      if (data?.community_id) {
        queryClient.invalidateQueries({ queryKey: ['events', 'pending'] });
        queryClient.invalidateQueries({ queryKey: ['events', data.community_id] });
      }
    },
  });
};

const EventCreateForm = () => {
  const { mutateAsync: createEvent } = useCreateEvent();
  const { user } = useAuth();
  const { ct } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    event_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    location: '',
    event_type: '',
    target_audience: '',
    cost_type: 'free', // 'free' or 'paid'
    deposit_amount: '',
    contact_phone: '',
    contact_line: '',
    contact_facebook: '',
    coordinator_name: '',
    additional_info: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.event_date || !formData.end_date || !formData.start_time || !formData.end_time) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณาระบุวันเริ่ม วันสิ้นสุด และเวลา',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    const startDateTime = new Date(`${formData.event_date}T${formData.start_time}`);
    const endDateTime = new Date(`${formData.end_date}T${formData.end_time}`);

    if (endDateTime < startDateTime) {
      Swal.fire({
        icon: 'warning',
        title: 'เวลาไม่ถูกต้อง',
        text: 'เวลาสิ้นสุดกิจกรรม ต้องอยู่หลังเวลาเริ่มกิจกรรม',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    try {
      setLoading(true);
      Swal.fire({
        title: 'กำลังสร้างกิจกรรม...',
        text: 'กรุณารอสักครู่ ระบบกำลังอัปโหลดข้อมูลและรูปภาพ',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const submitData = new FormData();
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      submitData.append('title', formData.title);
      submitData.append('title_en', formData.titleEn || formData.title);
      submitData.append('description', formData.description);
      submitData.append('description_en', formData.descriptionEn || formData.description);
      submitData.append('deposit_amount', formData.cost_type === 'free' ? 0 : (parseFloat(formData.deposit_amount) || 0));

      submitData.append('start_at', startDateTime.toISOString());
      submitData.append('end_at', endDateTime.toISOString());

      submitData.append('event_type', formData.event_type || '');
      submitData.append('target_audience', formData.target_audience || '');

      const contactData = {
        phone: formData.contact_phone,
        line: formData.contact_line,
        facebook: formData.contact_facebook,
        coordinator_name: formData.coordinator_name,
      };

      submitData.append('contact', JSON.stringify(contactData));

      submitData.append('additional_info', formData.additional_info || '');

      const locationData = {
        full_address: formData.location || "ไม่ระบุ",
      };
      submitData.append('location', JSON.stringify(locationData));

      await createEvent(submitData);

      Swal.close();
      await Swal.fire({
        icon: 'success',
        title: 'สำเร็จ!',
        text: 'สร้างกิจกรรมและอัปโหลดรูปสำเร็จแล้ว',
        timer: 2000,
        showConfirmButton: false
      });

      navigate('/community-admin/dashboard');

    } catch (error) {
      console.error('Failed to create event:', error);
      Swal.close();

      const msg = error?.response?.data?.message;
      const errorMessage = Array.isArray(msg) ? msg.join('\n') : (msg || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');

      Swal.fire({
        icon: 'error',
        title: 'สร้างกิจกรรมไม่สำเร็จ',
        text: errorMessage,
        confirmButtonColor: '#d33',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  return (
    <div className="min-h-screen bg-[#F5EFE7] py-8 animate-fadeIn">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 text-center animate-fadeIn">
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-1">{ct('สร้างกิจกรรมของชุมชน', 'Create Community Event')}</h1>
          <p className="text-[#666666] text-sm">{ct('กรอกข้อมูลกิจกรรมพิเศษหรือเทศกาลของชุมชน', 'Fill in information for special events or community festivals')}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 transition-all duration-300 hover:shadow-xl">
          {/* 1. ชื่องาน/กิจกรรม */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
              ชื่องาน / กิจกรรม <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-[#1A1A1A]"
              placeholder="ระบุชื่องาน / กิจกรรม"
            />
            <p className="text-xs text-[#888888] mt-1">{ct('ภาษาไทย', 'Thai')}</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
              {ct('ชื่อภาษาอังกฤษ', 'Event Name (English)')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="titleEn"
              value={formData.titleEn}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-[#1A1A1A]"
              placeholder="Enter event name in English"
            />
            <p className="text-xs text-[#888888] mt-1">{ct('ใช้สำหรับแสดงผลในภาษาอังกฤษ', 'Used for English interfaces')}</p>
          </div>

          {/* 2. รูปภาพปกกิจกรรม */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
              รูปภาพปกกิจกรรม
            </label>
            <div className="border-2 border-dashed border-[#E0E0E0] rounded-lg p-8 text-center bg-[#FAFAFA]">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="w-12 h-12 bg-[#FFF3E0] rounded-lg flex items-center justify-center mx-auto mb-3">
                    <ImageIcon className="h-6 w-6 text-[#F57C00]" />
                  </div>
                  <p className="text-sm text-[#666666] mb-1">อัพโหลดรูปภาพ</p>
                  <p className="text-xs text-[#999999] mb-4">JPG, PNG ขนาดไม่เกิน 5MB</p>
                  <label className="inline-block px-5 py-2 bg-white border border-gray-300 text-[#666666] text-sm font-medium rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    เลือกไฟล์
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* 3. เล่าเกี่ยวกับกิจกรรม */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
              เล่าเกี่ยวกับกิจกรรม ว่าทำอะไรบ้าง <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-[#1A1A1A] resize-none"
              placeholder="อธิบายรายละเอียดกิจกรรม..."
            />
            <p className="text-xs text-[#888888] mt-1">{ct('ภาษาไทย', 'Thai')}</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
              {ct('คำอธิบายภาษาอังกฤษ', 'Description (English)')} <span className="text-red-500">*</span>
            </label>
            <textarea
              name="descriptionEn"
              value={formData.descriptionEn}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-[#1A1A1A] resize-none"
              placeholder="Describe the event in English..."
            />
            <p className="text-xs text-[#888888] mt-1">{ct('ใช้สำหรับผู้ใช้ภาษาอังกฤษ', 'For English-speaking visitors')}</p>
          </div>

          {/* 4. วันและเวลา */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">
              วันและเวลา <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#666666] mb-1.5">
                    วันที่จัดกิจกรรม
                  </label>
                  <input
                    type="date"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#666666] mb-1.5">
                    วันที่สิ้นสุดกิจกรรม
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-[#1A1A1A]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#666666] mb-1.5">
                    เวลาเริ่ม
                  </label>
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#666666] mb-1.5">
                    เวลาสิ้นสุด
                  </label>
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-[#1A1A1A]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 5. สถานที่ */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
              สถานที่ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-[#1A1A1A] mb-3"
              placeholder="ระบุสถานที่"
            />
          </div>

          {/* 6. ประเภทกิจกรรม */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
              ประเภทกิจกรรม
            </label>
            <select
              name="event_type"
              value={formData.event_type}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-[#1A1A1A]"
            >
              <option value="">เลือกประเภทกิจกรรม</option>
              <option value="festival">เทศกาล</option>
              <option value="workshop">Workshop</option>
              <option value="cultural">กิจกรรมทางวัฒนธรรม</option>
              <option value="market">ตลาดนัด</option>
              <option value="other">อื่นๆ</option>
            </select>
          </div>

          {/* 8. กลุ่มเป้าหมาย */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
              กลุ่มเป้าหมาย
            </label>
            <input
              type="text"
              name="target_audience"
              value={formData.target_audience}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-[#1A1A1A]"
              placeholder="เช่น นักท่องเที่ยว, ครอบครัว, เยาวชน"
            />
          </div>

          {/* 9. ค่าใช้จ่าย */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">
              ค่าใช้จ่าย
            </label>
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="cost_type"
                  value="free"
                  checked={formData.cost_type === 'free'}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#FFC107] border-gray-300 focus:ring-[#FFC107]"
                />
                <span className="text-sm text-[#666666]">ฟรี</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="cost_type"
                  value="paid"
                  checked={formData.cost_type === 'paid'}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#FFC107] border-gray-300 focus:ring-[#FFC107]"
                />
                <span className="text-sm text-[#666666]">มีค่าใช้จ่าย</span>
              </label>
            </div>
            {formData.cost_type === 'paid' && (
              <input
                type="number"
                name="deposit_amount"
                value={formData.deposit_amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-[#1A1A1A]"
                placeholder="ระบุจำนวนเงิน (บาท)"
              />
            )}
          </div>

          {/* 10. ข้อมูลติดต่อ */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">
              ข้อมูลติดต่อ
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#666666] mb-1.5">
                  เบอร์โทรศัพท์
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
                  <input
                    type="tel"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-[#1A1A1A]"
                    placeholder="0XX-XXX-XXXX"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#666666] mb-1.5">
                  Line / Facebook
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
                    <input
                      type="text"
                      name="contact_line"
                      value={formData.contact_line}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-[#1A1A1A]"
                      placeholder="Line ID"
                    />
                  </div>
                  <div className="relative">
                    <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
                    <input
                      type="text"
                      name="contact_facebook"
                      value={formData.contact_facebook}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-[#1A1A1A]"
                      placeholder="Facebook"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#666666] mb-1.5">
                  ชื่อผู้ประสานงาน
                </label>
                <input
                  type="text"
                  name="coordinator_name"
                  value={formData.coordinator_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-[#1A1A1A]"
                  placeholder="ระบุชื่อผู้ประสานงาน"
                />
              </div>
            </div>
          </div>

          {/* 11. ข้อมูลเพิ่มเติม */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
              ข้อมูลเพิ่มเติม
            </label>
            <textarea
              name="additional_info"
              value={formData.additional_info}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent text-[#1A1A1A] resize-none"
              placeholder="ข้อมูลเพิ่มเติม (ถ้ามี)"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 bg-[#FFC107] hover:bg-[#FFB300] text-[#1A1A1A] font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังบันทึก...' : 'สร้างกิจกรรม'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/community-admin/dashboard')}
              className="px-8 py-2.5 bg-white border border-gray-300 text-[#666666] font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventCreateForm;