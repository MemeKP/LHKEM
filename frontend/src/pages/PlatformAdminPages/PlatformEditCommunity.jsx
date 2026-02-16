import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Image as ImageIcon, Plus, X, Trash2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const PlatformEditCommunity = () => {
  const { ct } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    location: '',
    locationDetails: '',
    contactEmail: '',
    coverImage: null,
    admins: [],
    adminEmail: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  useEffect(() => {
    const mockCommunity = {
      id: id,
      name: 'ชุมชนโหล่งฮิมคาว',
      nameEn: 'Loeng Him Kaw',
      description: 'ชุมชนท้องถิ่นที่มีวัฒนธรรมและประเพณีที่เก่าแก่',
      location: 'เชียงใหม่, ประเทศไทย',
      locationDetails: 'เดินทางโดยรถยนต์หรือรถโดยสารจากเชียงใหม่',
      contactEmail: 'loenghimkaw@community.com',
      coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      admins: [
        { email: 'somchai@lhkem.com', role: 'Community Leader' },
        { email: 'malee@lhkem.com', role: 'Co-Admin' },
        { email: 'somsri@lhkem.com', role: 'Co-Admin' }
      ]
    };

    setFormData({
      name: mockCommunity.name,
      nameEn: mockCommunity.nameEn,
      description: mockCommunity.description,
      location: mockCommunity.location,
      locationDetails: mockCommunity.locationDetails,
      contactEmail: mockCommunity.contactEmail,
      coverImage: null,
      admins: mockCommunity.admins,
      adminEmail: ''
    });
    setExistingImage(mockCommunity.coverImage);
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, coverImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setExistingImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setExistingImage(null);
    setFormData(prev => ({ ...prev, coverImage: null }));
  };

  const handleAddAdmin = () => {
    if (formData.adminEmail && formData.adminEmail.includes('@')) {
      setFormData(prev => ({
        ...prev,
        admins: [...prev.admins, { email: prev.adminEmail, role: 'Co-Admin' }],
        adminEmail: ''
      }));
    }
  };

  const handleRemoveAdmin = (index) => {
    setFormData(prev => ({
      ...prev,
      admins: prev.admins.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Updating community:', formData);
    navigate(`/platform-admin/communities/${id}`);
  };

  const inputClass = "w-full px-4 py-3 bg-[#FAF8F3] border border-gray-200 rounded-xl text-[#2D3B2D] placeholder-gray-400 focus:ring-2 focus:ring-[#D4842A]/30 focus:border-[#D4842A] outline-none transition-all";

  return (
    <div className="min-h-screen bg-[#FAF8F3] animate-fadeIn">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/platform-admin/communities/${id}`)}
          className="flex items-center space-x-2 text-gray-500 hover:text-[#2D3B2D] mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">{ct('กลับไปหน้าแดชบอร์ด', 'Back to Dashboard')}</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-[3px] bg-[#5B8C3E] rounded-full" />
            <span className="text-[#5B8C3E] text-sm">✦</span>
          </div>
          <h1 className="text-3xl font-bold text-[#2D3B2D] mb-1">
            {ct('แก้ไขรายละเอียด Community', 'Edit Community Details')}
          </h1>
          <p className="text-gray-500">
            {ct('คุณสามารถปรับแก้ข้อมูลของชุมชนนี้ได้ตลอดเวลา', 'You can update community information anytime')}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {ct('ข้อมูลอัปเดตล่าสุดจะแสดงผลทันที', 'Latest updates will be reflected immediately')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100/60 p-8">
          {/* Community Name */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#2D3B2D] mb-2">
              {ct('ชื่อชุมชน', 'Community Name')} <span className="text-[#D4842A]">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder={ct('ชุมชนโหล่งฮิมคาว', 'Loeng Him Kaw Community')}
              className={inputClass}
              required
            />
          </div>

          {/* Community Name (English) */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#2D3B2D] mb-2">
              {ct('ชื่อชุมชนภาษาอังกฤษ', 'Community Name (English)')} <span className="text-[#D4842A]">*</span>
            </label>
            <input
              type="text"
              name="nameEn"
              value={formData.nameEn}
              onChange={handleInputChange}
              placeholder="Loeng Him Kaw"
              className={inputClass}
              required
            />
          </div>

          {/* History / Story */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#2D3B2D] mb-2">
              {ct('ประวัติ / เรื่องราว', 'History / Story')}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder={ct('เล่าเรื่องราวและมรดกทางวัฒนธรรมของชุมชนนี้...', 'Tell the cultural heritage story...')}
              rows={4}
              className={`${inputClass} resize-none`}
            />
            <p className="text-xs text-gray-400 mt-1.5">
              {ct('เล่าเรื่องราว ประวัติ และเอกลักษณ์ของชุมชน', 'Share the history and identity of the community')}
            </p>
          </div>

          {/* Location */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#2D3B2D] mb-2">
              {ct('ที่ตั้ง', 'Location')} <span className="text-[#D4842A]">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder={ct('เชียงใหม่, ประเทศไทย', 'Chiang Mai, Thailand')}
                className={`${inputClass} pl-10`}
                required
              />
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="mb-6">
            <div className="border-2 border-dashed border-[#D4842A]/30 rounded-2xl p-8 text-center bg-[#FDF8F0]">
              <MapPin className="h-10 w-10 text-[#D4842A]/50 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-1">
                {ct('ตำแหน่งปัจจุบัน:', 'Current position:')} {formData.location}
              </p>
              <button
                type="button"
                className="mt-2 px-4 py-2 bg-white border border-gray-200 text-[#2D3B2D] text-sm font-medium rounded-xl hover:bg-[#FAF8F3] transition-colors"
              >
                {ct('เปลี่ยนตำแหน่ง', 'Change Location')}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              {ct('เลือกตำแหน่งที่ตั้ง ๆ ใหม่', 'Select a new location')}
            </p>
          </div>

          {/* Description / Directions */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#2D3B2D] mb-2">
              {ct('คำอธิบาย', 'Description')}
            </label>
            <textarea
              name="locationDetails"
              value={formData.locationDetails}
              onChange={handleInputChange}
              placeholder={ct('คำอธิบายอื่น ๆ เกี่ยวกับชุมชนและสิ่งที่ทำให้ชุมชนนี้พิเศษ...', 'Additional details...')}
              rows={3}
              className={`${inputClass} resize-none`}
            />
            <p className="text-xs text-gray-400 mt-1.5">
              {ct('อย่างน้อย ๆ ว่าชุมชนมีอะไรพิเศษ', 'What makes this community special')}
            </p>
          </div>

          {/* Contact Email */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#2D3B2D] mb-2">
              {ct('ข้อมูลติดต่อ', 'Contact Information')}
            </label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleInputChange}
              placeholder="loenghimkaw@community.com"
              className={inputClass}
            />
          </div>

          {/* Cover Image */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#2D3B2D] mb-2">
              {ct('รูปภาพหน้าปก', 'Cover Image')}
            </label>
            {(existingImage || imagePreview) ? (
              <div className="relative rounded-2xl overflow-hidden">
                <img 
                  src={imagePreview || existingImage} 
                  alt="Cover" 
                  className="w-full h-52 object-cover"
                />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  <label
                    htmlFor="cover-image-edit"
                    className="px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 text-[#2D3B2D] text-sm font-medium rounded-xl cursor-pointer hover:bg-white transition-colors"
                  >
                    {ct('เปลี่ยนรูปภาพ', 'Change Image')}
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-4 py-2 bg-red-500/90 backdrop-blur-sm text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-colors flex items-center space-x-1"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>{ct('ลบรูป', 'Remove')}</span>
                  </button>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="cover-image-edit"
                />
              </div>
            ) : (
              <div className="border-2 border-dashed border-[#D4842A]/30 rounded-2xl p-8 text-center bg-[#FDF8F0] hover:border-[#D4842A]/60 transition-colors">
                <ImageIcon className="h-10 w-10 text-[#D4842A]/50 mx-auto mb-3" />
                <p className="text-sm font-medium text-[#2D3B2D] mb-1">
                  {ct('คลิกเพื่ออัปโหลดหรือลากไฟล์มาวาง', 'Click to upload or drag and drop')}
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG {ct('ขนาดไม่เกิน', 'max')} 5MB
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="cover-image-new"
                />
                <label
                  htmlFor="cover-image-new"
                  className="inline-block mt-4 px-5 py-2 bg-[#D4842A] text-white text-sm font-semibold rounded-xl cursor-pointer hover:bg-[#C0762A] transition-colors"
                >
                  {ct('เลือกไฟล์', 'Choose File')}
                </label>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1.5">
              {ct('กำลังแสดงรูป ขนาดที่แนะนำ', 'Recommended size for display')}
            </p>
          </div>

          {/* Community Admins */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-[#2D3B2D] mb-3">
              {ct('ผู้ดูแลชุมชน', 'Community Admins')}
            </label>
            
            {/* Admin List */}
            {formData.admins.length > 0 && (
              <div className="space-y-2 mb-4">
                {formData.admins.map((admin, index) => (
                  <div key={index} className="flex items-center justify-between p-3.5 bg-[#FAF8F3] rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-[#D4842A] flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-xs">
                          {admin.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#2D3B2D]">{admin.email}</p>
                        <p className="text-xs text-gray-400">{admin.role}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAdmin(index)}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Admin Input */}
            <div className="flex space-x-2">
              <input
                type="email"
                name="adminEmail"
                value={formData.adminEmail}
                onChange={handleInputChange}
                placeholder="admin@example.com"
                className={`flex-1 ${inputClass}`}
              />
              <button
                type="button"
                onClick={handleAddAdmin}
                className="flex items-center space-x-1.5 bg-[#5B8C3E] hover:bg-[#4A7A32] text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>{ct('เพิ่ม', 'Add')}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(`/platform-admin/communities/${id}`)}
              className="px-8 py-3 border border-gray-200 text-[#2D3B2D] font-semibold rounded-xl hover:bg-[#FAF8F3] transition-colors text-sm"
            >
              {ct('ยกเลิก', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-[#D4842A] hover:bg-[#C0762A] text-white font-semibold rounded-xl transition-colors text-sm shadow-sm"
            >
              {ct('บันทึกการเปลี่ยนแปลง', 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlatformEditCommunity;
