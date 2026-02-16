import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Image as ImageIcon, Plus, X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const PlatformCreateCommunity = () => {
  const { ct } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    location: '',
    locationDetails: '',
    contactEmail: '',
    coverImage: null,
    admins: [],
    adminEmail: '',
    workshopApproval: false
  });
  const [imagePreview, setImagePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, coverImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAdmin = () => {
    if (formData.adminEmail && formData.adminEmail.includes('@')) {
      setFormData(prev => ({
        ...prev,
        admins: [...prev.admins, prev.adminEmail],
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
    const communities = JSON.parse(localStorage.getItem('communities') || '[]');
    const newCommunity = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString()
    };
    communities.push(newCommunity);
    localStorage.setItem('communities', JSON.stringify(communities));
    navigate('/platform-admin/dashboard');
  };

  const inputClass = "w-full px-4 py-3 bg-[#FAF8F3] border border-gray-200 rounded-xl text-[#2D3B2D] placeholder-gray-400 focus:ring-2 focus:ring-[#D4842A]/30 focus:border-[#D4842A] outline-none transition-all";

  return (
    <div className="min-h-screen bg-[#FAF8F3] animate-fadeIn">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/platform-admin/dashboard')}
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
            {ct('สร้าง Community ใหม่', 'Create New Community')}
          </h1>
          <p className="text-gray-500">
            {ct('เพิ่มชุมชนใหม่เข้าสู่แพลตฟอร์ม LHKEM', 'Add a new community to the LHKEM platform')}
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
              placeholder={ct('เช่น หมู่บ้านเครื่องปั้นดินเผาบ้านช้าง', 'e.g., Ban Chang Pottery Village')}
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
              placeholder={ct('เช่น Loeng Him Kaw', 'e.g., Loeng Him Kaw')}
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
              placeholder={ct('เล่าเรื่องราวและมรดกทางวัฒนธรรมของชุมชนนี้...', 'Tell the cultural heritage story of this community...')}
              rows={4}
              className={`${inputClass} resize-none`}
            />
            <p className="text-xs text-gray-400 mt-1.5">
              {ct('บอกเล่าให้ผู้เยี่ยมชมรู้จักประเพณีและความสำคัญทางวัฒนธรรมของชุมชน', 'Help visitors understand the traditions and cultural significance')}
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
                placeholder={ct('เช่น เชียงใหม่, ประเทศไทย', 'e.g., Chiang Mai, Thailand')}
                className={`${inputClass} pl-10`}
                required
              />
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="mb-6">
            <div className="border-2 border-dashed border-[#D4842A]/30 rounded-2xl p-10 text-center bg-[#FDF8F0]">
              <MapPin className="h-10 w-10 text-[#D4842A]/50 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                {ct('แผนที่จะแสดงที่นี่ (Google Maps API)', 'Map will display here (Google Maps API)')}
              </p>
            </div>
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
              placeholder={ct('คำอธิบายอื่น ๆ เกี่ยวกับชุมชนและสิ่งที่ทำให้ชุมชนนี้พิเศษ...', 'Additional details about the community...')}
              rows={3}
              className={`${inputClass} resize-none`}
            />
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
              placeholder="contact@community.com"
              className={inputClass}
            />
          </div>

          {/* Cover Image */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#2D3B2D] mb-2">
              {ct('รูปภาพหน้าปก', 'Cover Image')}
            </label>
            <div className="border-2 border-dashed border-[#D4842A]/30 rounded-2xl p-8 text-center bg-[#FDF8F0] hover:border-[#D4842A]/60 transition-colors">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-xl" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, coverImage: null }));
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <>
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
                    id="cover-image"
                  />
                  <label
                    htmlFor="cover-image"
                    className="inline-block mt-4 px-5 py-2 bg-[#D4842A] text-white text-sm font-semibold rounded-xl cursor-pointer hover:bg-[#C0762A] transition-colors"
                  >
                    {ct('เลือกไฟล์', 'Choose File')}
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Community Admins */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-[#2D3B2D] mb-2">
              {ct('ผู้ดูแลชุมชน', 'Community Admins')}
            </label>
            
            {/* Checkbox */}
            <div className="flex items-start space-x-3 mb-4">
              <input
                type="checkbox"
                name="workshopApproval"
                checked={formData.workshopApproval}
                onChange={handleInputChange}
                className="mt-0.5 h-4 w-4 text-[#D4842A] focus:ring-[#D4842A] border-gray-300 rounded"
                id="workshop-approval"
              />
              <label htmlFor="workshop-approval" className="text-sm text-gray-600">
                {ct('ผู้ดูแลต้องเป็นคนยืนยันการสร้าง workshop', 'Admin must approve workshop creation')}
              </label>
            </div>

            {/* Admin List */}
            {formData.admins.length > 0 && (
              <div className="space-y-2 mb-4">
                {formData.admins.map((email, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#FAF8F3] rounded-xl">
                    <span className="text-sm text-[#2D3B2D]">{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAdmin(index)}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
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
              onClick={() => navigate('/platform-admin/dashboard')}
              className="px-8 py-3 border border-gray-200 text-[#2D3B2D] font-semibold rounded-xl hover:bg-[#FAF8F3] transition-colors text-sm"
            >
              {ct('ยกเลิก', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-[#D4842A] hover:bg-[#C0762A] text-white font-semibold rounded-xl transition-colors text-sm shadow-sm"
            >
              {ct('สร้างชุมชน', 'Create Community')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlatformCreateCommunity;
