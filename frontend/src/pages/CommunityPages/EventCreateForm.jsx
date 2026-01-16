import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, DollarSign, Save, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Event Create Form - ใช้ Backend API ที่มีอยู่แล้ว
 * 
 * ✅ Backend API: POST /api/events/:community_id/events
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
 */

const EventCreateForm = () => {
  const { user } = useAuth();
  const { ct } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    title_en: '',
    description: '',
    description_en: '',
    location: '',
    start_at: '',
    end_at: '',
    seat_limit: '',
    deposit_amount: '',
    status: 'OPEN',
    is_featured: false,
    is_pinned: false,
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
    setLoading(true);

    try {
      // TODO: เรียก API - POST /api/events/:community_id/events
      // ✅ Backend API พร้อมใช้งาน
      // const response = await api.post(`/api/events/${user.community_id}/events`, {
      //   ...formData,
      //   seat_limit: parseInt(formData.seat_limit),
      //   deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : 0,
      // });
      
      console.log('Form data to submit:', formData);
      
      // TODO: แสดง success message
      alert('สร้าง Event สำเร็จ!');
      navigate('/community-admin/dashboard');
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('เกิดข้อผิดพลาดในการสร้าง Event');
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

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{ct('สร้างกิจกรรมของชุมชน', 'Create Community Event')}</h1>
          <p className="text-gray-600 text-sm mt-1">{ct('กรอกข้อมูลกิจกรรมพิเศษหรือเทศกาลของชุมชน', 'Fill in information for special events or community festivals')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{ct('ข้อมูลพื้นฐาน', 'Basic Information')}</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อกิจกรรม (ไทย) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="เช่น งานลอยกระทงโหล่งฮิมคาว"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อกิจกรรม (English)
                  </label>
                  <input
                    type="text"
                    name="title_en"
                    value={formData.title_en}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g. Loy Krathong Festival"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  คำอธิบาย <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="อธิบายรายละเอียดกิจกรรม..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  คำอธิบาย (English)
                </label>
                <textarea
                  name="description_en"
                  value={formData.description_en}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Event description in English..."
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-orange-500" />
              {ct('รูปภาพกิจกรรม', 'Event Images')}
            </h2>
            <div className="border-2 border-dashed border-orange-200 rounded-xl p-8 text-center bg-orange-50">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium mb-2">{ct('คลิกเพื่ออัพโหลดรูปภาพ', 'Click to upload image')}</p>
                  <p className="text-sm text-gray-500 mb-4">{ct('รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB', 'Supports JPG, PNG up to 5MB')}</p>
                  <label className="inline-block px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg cursor-pointer transition">
                    {ct('เลือกไฟล์', 'Choose File')}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              {ct('วันและเวลา', 'Date & Time')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  วันเริ่มต้น <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="start_at"
                  value={formData.start_at}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  วันสิ้นสุด <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="end_at"
                  value={formData.end_at}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-orange-500" />
              {ct('สถานที่', 'Location')}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สถานที่จัดงาน <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="เช่น ริมแม่น้ำคาว โหล่งฮิมคาว"
                />
              </div>

              {/* Map Picker */}
              <div className="border-2 border-dashed border-green-200 rounded-xl p-8 text-center bg-green-50">
                <MapPin className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-700 font-medium mb-2">{ct('เลือกตำแหน่งบนแผนที่', 'Select location on map')}</p>
                <button
                  type="button"
                  className="px-4 py-2 bg-white border border-green-300 text-green-600 rounded-lg hover:bg-green-50 transition font-medium text-sm"
                >
                  {ct('เปิดแผนที่', 'Open Map')}
                </button>
                <p className="text-xs text-gray-500 mt-3">{ct('คลิกเพื่อเลือกตำแหน่งที่แม่นยำบนแผนที่', 'Click to select precise location on map')}</p>
              </div>
            </div>
          </div>

          {/* Capacity & Pricing */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{ct('จำนวนและค่าใช้จ่าย', 'Capacity & Pricing')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-1" />
                  จำนวนที่นั่ง <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="seat_limit"
                  value={formData.seat_limit}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="จำนวนผู้เข้าร่วมสูงสุด"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  ค่ามัดจำ (บาท)
                </label>
                <input
                  type="number"
                  name="deposit_amount"
                  value={formData.deposit_amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0 (ถ้าไม่มีค่ามัดจำ)"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{ct('การตั้งค่า', 'Settings')}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สถานะ
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="OPEN">เปิดรับสมัคร</option>
                  <option value="CLOSED">ปิดรับสมัคร</option>
                  <option value="CANCELLED">ยกเลิก</option>
                </select>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">แนะนำ (Featured)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_pinned"
                    checked={formData.is_pinned}
                    onChange={handleChange}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">ปักหมุด (Pinned)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/community-admin/dashboard')}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5" />
              {loading ? 'กำลังบันทึก...' : 'บันทึกกิจกรรม'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventCreateForm;
