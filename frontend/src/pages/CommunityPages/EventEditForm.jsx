import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, MapPin, Users, DollarSign, Save, Upload, X, Image as ImageIcon, Phone, MessageCircle, Facebook } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../services/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Event Edit Form - แก้ไข Event ที่มีอยู่แล้ว
 * 
 * ✅ Backend API: PUT /api/events/:id
 * ✅ Backend API: GET /api/events/:id - ดึงข้อมูล Event เพื่อแก้ไข
 * 
 * Event Schema fields:
 * - title (required)
 * - description (required)
 * - location (required)
 * - start_at (required)
 * - end_at (required)
 * - seat_limit (required)
 * - deposit_amount (optional)
 * - status (OPEN, CLOSED, CANCELLED)
 * - is_featured (boolean)
 * - is_pinned (boolean)
 * - images (string) - TODO: รอ Image Upload API
 * 
 * Additional fields (not sent to backend):
 * - event_type - ประเภทกิจกรรม
 * - workshops - Workshop ที่เข้าร่วม
 * - target_audience - กลุ่มเป้าหมาย
 * - cost_type - ประเภทค่าใช้จ่าย (free/paid)
 * - contact_phone - เบอร์ติดต่อ
 * - contact_line - Line ID
 * - contact_facebook - Facebook
 * - coordinator_name - ชื่อผู้ประสานงาน
 * - additional_info - ข้อมูลเพิ่มเติม
 */

const fetchEvent = async (eventId) => {
  const response = await api.get(`/api/events/${eventId}`);
  console.log("EVENT", response)
  return response.data;
};

const useEvent = (eventId) => {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: () => fetchEvent(eventId),
    enabled: !!eventId,
  });
};

const updateEventAPI  = async ({ eventId, payload }) => {
  const response = await api.patch(
    `/api/events/${eventId}`,
    payload,
     {headers: {
      'Content-Type': 'multipart/form-data',
    },}
  );
  return response.data;
};

const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEventAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};


const EventEditForm = () => {
  const { id } = useParams();
  const { mutateAsync: updateEvent } = useUpdateEvent();
  const { data: event, isLoading: eventLoading } = useEvent(id);
  const { user } = useAuth();
  const { ct } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL
  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    event_date: '',
    start_time: '',
    end_time: '',
    location: '',
    event_type: '',
    workshops: [],
    target_audience: '',
    cost_type: 'free',
    deposit_amount: '',
    contact_phone: '',
    contact_line: '',
    contact_facebook: '',
    coordinator_name: '',
    additional_info: '',
    seat_limit: '',
    status: 'OPEN',
    is_featured: false,
    is_pinned: false,
  });

  useEffect(() => {
    if (event) {
      const startDate = new Date(event.start_at);
      const endDate = new Date(event.end_at);

      setFormData({
        title: event.title || '',
        titleEn: event.title_en || '',
        description: event.description || '',
        descriptionEn: event.description_en || '',
        event_date: startDate.toISOString().split('T')[0],
        start_time: startDate.toTimeString().slice(0, 5),
        end_time: endDate.toTimeString().slice(0, 5),
        location: typeof event.location === 'string' ? event.location : (event.location?.full_address || ''),
        event_type: '',
        workshops: [],
        target_audience: event.target_audience || '',
        cost_type: event.deposit_amount > 0 ? 'paid' : 'free',
        deposit_amount: event.deposit_amount || '',
        contact_phone: event.contact?.phone || '',
        contact_line: event.contact?.line || '',
        contact_facebook: event.contact?.facebook || '',
        coordinator_name: event.contact?.coordinator_name || '',
        additional_info: event.additional_info || '',
        seat_limit: event.seat_limit || '',
        status: event.status || 'OPEN',
        is_featured: event.is_featured || false,
        is_pinned: event.is_pinned || false,
      });

      if (event.images && event.images.length > 0) {
        setImagePreview(event.images[0]);
      }
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.event_date || !formData.start_time || !formData.end_time) {
      alert("กรุณาระบุวันและเวลา");
      return;
    }

    try {
      setLoading(true);

      const startDateTime = new Date(`${formData.event_date}T${formData.start_time}`);
      const endDateTime = new Date(`${formData.event_date}T${formData.end_time}`);

      const fd = new FormData();

      fd.append("title", formData.title);
      fd.append("title_en", formData.titleEn || formData.title);
      fd.append("description", formData.description);
      fd.append("description_en", formData.descriptionEn || formData.description);

      fd.append("seat_limit", parseInt(formData.seat_limit) || 1);
      fd.append(
        "deposit_amount",
        formData.cost_type === "free"
          ? 0
          : parseFloat(formData.deposit_amount) || 0
      );

      fd.append("start_at", startDateTime.toISOString());
      fd.append("end_at", endDateTime.toISOString());

      fd.append("status", formData.status);
      fd.append("is_featured", formData.is_featured);
      fd.append("is_pinned", formData.is_pinned);

      fd.append("event_type", formData.event_type);
      fd.append("target_audience", formData.target_audience);
      fd.append("cost_type", formData.cost_type);

      fd.append("contact_phone", formData.contact_phone);
      fd.append("contact_line", formData.contact_line);
      fd.append("contact_facebook", formData.contact_facebook);
      fd.append("coordinator_name", formData.coordinator_name);
      fd.append("additional_info", formData.additional_info);


      fd.append(
        "location",
        JSON.stringify({
          full_address: formData.location || "ไม่ระบุ",
        })
      );

      if (imageFile) {
        fd.append("image", imageFile);
      }

      await updateEvent({
        eventId: id,
        payload: fd,
      });

      alert("แก้ไข Event สำเร็จ!");
      navigate(`/community-admin/events/${id}`);
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };


  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (eventLoading) {
    return <div className="min-h-screen bg-[#FAFAFA] py-8 flex items-center justify-center">
      <p className="text-[#666666]">กำลังโหลดข้อมูล...</p>
    </div>;
  }

  console.log("event:", event);


  return (
    <div className="min-h-screen bg-[#F5EFE7] py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-1">{ct('แก้ไขกิจกรรมของชุมชน', 'Edit Community Event')}</h1>
          <p className="text-[#666666] text-sm">{ct('แก้ไขข้อมูลกิจกรรมพิเศษหรือเทศกาลของชุมชน', 'Edit information for special events or community festivals')}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
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
            <p className="text-xs text-[#888888] mt-1">ภาษาไทย</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
              ชื่อภาษาอังกฤษ <span className="text-red-500">*</span>
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
            <p className="text-xs text-[#888888] mt-1">Event name (English)</p>
          </div>

          {/* 2. รูปภาพปกกิจกรรม */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
              รูปภาพปกกิจกรรม
            </label>
            <div className="border-2 border-dashed border-[#E0E0E0] rounded-lg p-8 text-center bg-[#FAFAFA]">
              {imagePreview ? (
                <div className="relative">
                  <img src={`${API_URL}${imagePreview}`} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
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
            <p className="text-xs text-[#888888] mt-1">ภาษาไทย</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
              คำอธิบายภาษาอังกฤษ <span className="text-red-500">*</span>
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
            <p className="text-xs text-[#888888] mt-1">Description (English)</p>
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
                    //name="event_date"
                    //value={formData.event_date}
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
            <div className="border-2 border-dashed border-[#E0E0E0] rounded-lg p-6 text-center bg-[#F0F9F4]">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-3">
                <MapPin className="h-6 w-6 text-[#4CAF50]" />
              </div>
              <p className="text-sm text-[#666666] mb-3">เลือกสถานที่บนแผนที่</p>
              <button
                type="button"
                className="px-4 py-2 bg-white border border-gray-300 text-[#666666] rounded-lg hover:bg-gray-50 transition text-sm font-medium"
              >
                เปิดแผนที่
              </button>
            </div>
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

          {/* Hidden fields for backend compatibility */}
          <input type="hidden" name="seat_limit" value={formData.seat_limit || "100"} />

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 bg-[#FFC107] hover:bg-[#FFB300] text-[#1A1A1A] font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/community-admin/events/${id}`)}
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

export default EventEditForm;
