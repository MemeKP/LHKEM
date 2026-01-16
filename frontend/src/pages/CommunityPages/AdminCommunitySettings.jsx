import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Upload, MapPin, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Admin Community Settings - แก้ไขข้อมูลชุมชน
 * ตาม Figma: Admin-edit community info.png
 * 
 * TODO: Backend APIs:
 * - GET /api/communities/:id - ดึงข้อมูลชุมชน
 * - PATCH /api/communities/:id - อัพเดทข้อมูลชุมชน
 * - POST /api/communities/:id/images - อัพโหลดรูปภาพ
 */

const AdminCommunitySettings = () => {
  const navigate = useNavigate();
  const { ct } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // TODO: Fetch from API
  const [formData, setFormData] = useState({
    name: 'โหล่งฮิมคาว',
    name_en: 'Loeng Him Kaw',
    description: 'ชุมชนเล็กๆ ที่ซ่อนตัวอยู่อย่างเงียบสงบ ณ สันกำแพง เชียงใหม่ เป็นชุมชนที่เน้นวิถีชีวิตแบบ Slow Life และอนุรักษ์งานฝีมือพื้นบ้าน',
    description_en: 'A small community quietly nestled in San Kamphaeng, Chiang Mai, focusing on Slow Life lifestyle and preserving traditional crafts',
    location: 'บ้านมอญ, สันกำแพง',
    location_en: 'Ban Mon, San Kamphaeng',
    history: 'ชุมชนโหล่งฮิมคาวก่อตั้งขึ้นเมื่อกว่า 30 ปีที่แล้ว โดยกลุ่มศิลปินและช่างฝีมือที่ต้องการสร้างพื้นที่สำหรับการทำงานและแบ่งปันความรู้',
    history_en: 'Loeng Him Kaw community was established over 30 years ago by a group of artists and craftsmen who wanted to create a space for work and knowledge sharing',
    website: 'https://loenghimkaw.community.com',
    socialMedia: [
      { platform: 'Facebook', url: 'www.fb@loeng.com', id: 1 },
      { platform: 'Instagram', url: 'instagram.com/loeng', id: 2 },
      { platform: 'Line', url: 'line.me/loeng', id: 3 }
    ],
    coordinates: {
      lat: '18.7903',
      lng: '99.3661'
    }
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialMediaChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: prev.socialMedia.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleAddSocialMedia = () => {
    const newId = Math.max(...formData.socialMedia.map(s => s.id), 0) + 1;
    setFormData(prev => ({
      ...prev,
      socialMedia: [...prev.socialMedia, { platform: '', url: '', id: newId }]
    }));
  };

  const handleRemoveSocialMedia = (id) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: prev.socialMedia.filter(item => item.id !== id)
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      // TODO: Upload to API
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Call API - PATCH /api/communities/:id
      console.log('Updating community:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(ct('บันทึกข้อมูลสำเร็จ!', 'Successfully saved!'));
      navigate('/community-admin/dashboard');
    } catch (error) {
      console.error('Failed to update:', error);
      alert(ct('เกิดข้อผิดพลาด', 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (confirm(ct('คุณต้องการยกเลิกการแก้ไขใช่หรือไม่?', 'Do you want to cancel editing?'))) {
      navigate('/community-admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {ct('แก้ไขข้อมูลชุมชน', 'Edit Community Information')}
          </h1>
          <p className="text-gray-600 text-sm">
            {ct('อัพเดทข้อมูลและรายละเอียดของชุมชนให้เป็นปัจจุบัน', 'Update community information and details')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">{ct('ข้อมูลพื้นฐาน', 'Basic Information')}</h2>
            
            <div className="space-y-4">
              {/* Community Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {ct('ชื่อชุมชน', 'Community Name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder={ct('เช่น โหล่งฮิมคาว', 'e.g. Loeng Him Kaw')}
                  required
                />
              </div>

              {/* Community Name (English) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {ct('ชื่อชุมชน (ภาษาอังกฤษ)', 'Community Name (English)')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => handleInputChange('name_en', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g. Loeng Him Kaw"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {ct('ประวัติ / เรื่องราว', 'History / Story')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder={ct('เล่าเรื่องราวและประวัติของชุมชน...', 'Tell the story and history of the community...')}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{ct('คำอธิบายสั้นๆ สำหรับแสดงบนหน้าหลัก', 'Short description for display on homepage')}</p>
              </div>

              {/* Description (English) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {ct('ประวัติ / เรื่องราว (ภาษาอังกฤษ)', 'History / Story (English)')}
                </label>
                <textarea
                  value={formData.description_en}
                  onChange={(e) => handleInputChange('description_en', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="Tell the story and history of the community..."
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-orange-600" />
              {ct('ที่อยู่', 'Location')}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {ct('ที่อยู่', 'Address')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder={ct('บ้านมอญ, สันกำแพง', 'Ban Mon, San Kamphaeng')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {ct('ที่อยู่ (ภาษาอังกฤษ)', 'Address (English)')}
                </label>
                <input
                  type="text"
                  value={formData.location_en}
                  onChange={(e) => handleInputChange('location_en', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Ban Mon, San Kamphaeng"
                />
              </div>

              {/* Map Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {ct('ตำแหน่งบนแผนที่', 'Location on Map')}
                </label>
                <div className="border-2 border-orange-200 rounded-xl p-6 bg-orange-50 text-center">
                  <MapPin className="h-12 w-12 text-orange-500 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium mb-2">
                    {ct('ตำแหน่ง: บ้านมอญ, สันกำแพง, เชียงใหม่', 'Location: Ban Mon, San Kamphaeng, Chiang Mai')}
                  </p>
                  <button
                    type="button"
                    className="px-4 py-2 bg-white border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition font-medium text-sm"
                  >
                    {ct('เลือกตำแหน่ง', 'Select Location')}
                  </button>
                  <p className="text-xs text-gray-500 mt-3">
                    {ct('ละติจูด: 18.7903, ลองจิจูด: 99.3661', 'Latitude: 18.7903, Longitude: 99.3661')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">{ct('รูปภาพชุมชน', 'Community Images')}</h2>
            
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
                  <p className="text-gray-700 font-medium mb-2">
                    {ct('คลิกเพื่ออัพโหลดรูปภาพ', 'Click to upload image')}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    {ct('รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB', 'Supports JPG, PNG up to 5MB')}
                  </p>
                  <label className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg cursor-pointer transition">
                    {ct('เลือกไฟล์', 'Choose File')}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">{ct('รูปภาพจะแสดงบนหน้าหลักของชุมชน', 'Image will be displayed on community homepage')}</p>
          </div>

          {/* History */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">{ct('ประวัติชุมชน', 'Community History')}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {ct('ประวัติชุมชน (ฉบับเต็ม)', 'Full History')}
                </label>
                <textarea
                  value={formData.history}
                  onChange={(e) => handleInputChange('history', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder={ct('เล่าประวัติความเป็นมาของชุมชนอย่างละเอียด...', 'Tell the detailed history of the community...')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {ct('ประวัติชุมชน (ภาษาอังกฤษ)', 'Full History (English)')}
                </label>
                <textarea
                  value={formData.history_en}
                  onChange={(e) => handleInputChange('history_en', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="Tell the detailed history of the community..."
                />
              </div>
            </div>
          </div>

          {/* Website & Social Media */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">{ct('เว็บไซต์และโซเชียลมีเดีย', 'Website & Social Media')}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {ct('เว็บไซต์ชุมชน', 'Community Website')}
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="https://community.com"
                />
              </div>

              {/* Social Media List */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {ct('โซเชียลมีเดีย', 'Social Media')}
                </label>
                <div className="space-y-3">
                  {formData.socialMedia.map((social) => (
                    <div key={social.id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {social.platform.charAt(0) || '?'}
                        </span>
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={social.platform}
                          onChange={(e) => handleSocialMediaChange(social.id, 'platform', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder={ct('แพลตฟอร์ม', 'Platform')}
                        />
                        <input
                          type="text"
                          value={social.url}
                          onChange={(e) => handleSocialMediaChange(social.id, 'url', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="URL"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSocialMedia(social.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddSocialMedia}
                  className="mt-3 flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition font-medium border border-orange-200"
                >
                  <Plus className="h-5 w-5" />
                  {ct('เพิ่มโซเชียลมีเดีย', 'Add Social Media')}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              {ct('ยกเลิก', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="h-5 w-5" />
              {loading ? ct('กำลังบันทึก...', 'Saving...') : ct('บันทึกการเปลี่ยนแปลง', 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCommunitySettings;
