import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Image as ImageIcon, Plus, X } from 'lucide-react';
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
    // Mock existing community data
    const mockCommunity = {
      id: id,
      name: 'ชุมชนโหล่งฮิมคาว',
      nameEn: 'Loeng Him Kaw',
      description: 'ชุมชนท้องถิ่นที่มีวัฒนธรรมและประเพณีที่เก่าแก่',
      location: 'เชียงใหม่, ประเทศไทย',
      locationDetails: 'เดินทางโดยรถยนต์หรือรถโดยสารจากเชียงใหม่',
      contactEmail: 'loenghimkaw@community.com',
      coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      admins: ['admin1@lhkem.com', 'admin2@lhkem.com', 'admin3@lhkem.com']
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
    // Save to localStorage for demo
    console.log('Updating community:', formData);
    navigate(`/platform-admin/communities/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] animate-fadeIn">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/platform-admin/communities/${id}`)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">{ct('กลับไปหน้าแดชบอร์ด', 'Back to Dashboard')}</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {ct('แก้ไขรายละเอียด Community', 'Edit Community Details')}
          </h1>
          <p className="text-gray-600">
            {ct('อัพเดทข้อมูลชุมชนและผู้ดูแลของคุณได้ที่นี่', 'Update your community information and admins here')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8">
          {/* Community Name */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {ct('ชื่อชุมชน', 'Community Name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder={ct('เช่น โหล่งฮิมคาว', 'e.g., Loeng Him Kaw')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Community Name (English) */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {ct('ชื่อชุมชนภาษาอังกฤษ', 'Community Name (English)')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nameEn"
              value={formData.nameEn}
              onChange={handleInputChange}
              placeholder="Loeng Him Kaw"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {ct('ประวัติ / เรื่องราว', 'History / Story')}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder={ct('เล่าเรื่องราวและเอกลักษณ์ของชุมชนของคุณ...', 'Tell the story and identity of your community...')}
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              {ct('บอกเล่าเรื่องราวและเอกลักษณ์ของชุมชน', 'Share the story and unique identity of your community')}
            </p>
          </div>

          {/* Location */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {ct('ที่ตั้ง', 'Location')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder={ct('เช่น เชียงใหม่, ประเทศไทย', 'e.g., Chiang Mai, Thailand')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Map Picker */}
          <div className="mb-6">
            <div className="border-2 border-orange-300 rounded-lg p-6 bg-orange-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-6 w-6 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {ct('ตำแหน่งปัจจุบัน: เชียงใหม่, ประเทศไทย', 'Current Location: Chiang Mai, Thailand')}
                    </p>
                    <p className="text-xs text-gray-600">
                      {ct('คลิกเพื่อเปลี่ยนตำแหน่ง', 'Click to change location')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-white border border-orange-500 text-orange-500 font-medium rounded-lg hover:bg-orange-50 transition-colors"
                >
                  {ct('เปลี่ยนตำแหน่ง', 'Change Location')}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {ct('ตำแหน่งที่เลือกจะใช้ใน 1 ที่', 'Selected location will be used in 1 place')}
            </p>
          </div>

          {/* Additional Details */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {ct('คำอธิบาย', 'Description')}
            </label>
            <textarea
              name="locationDetails"
              value={formData.locationDetails}
              onChange={handleInputChange}
              placeholder={ct('ทิศทาง เช่น เดินทางโดยรถยนต์หรือรถโดยสารจากเชียงใหม่...', 'Directions, e.g., Travel by car or bus from Chiang Mai...')}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              {ct('บอกเล่า ทิศทาง + ข้อมูลเพิ่มเติม', 'Share directions and additional information')}
            </p>
          </div>

          {/* Contact Email */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {ct('ข้อมูลติดต่อ', 'Contact Information')}
            </label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleInputChange}
              placeholder="loenghimkaw@community.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Cover Image */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {ct('รูปภาพหน้าปก', 'Cover Image')}
            </label>
            {(existingImage || imagePreview) ? (
              <div className="relative rounded-lg overflow-hidden">
                <img 
                  src={imagePreview || existingImage} 
                  alt="Cover" 
                  className="w-full h-64 object-cover"
                />
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  <label
                    htmlFor="cover-image-edit"
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    {ct('เปลี่ยนรูป', 'Change Image')}
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
                  >
                    {ct('ลบ', 'Delete')}
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
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {ct('คลิกเพื่ออัปโหลดรูปภาพหรือลากไฟล์มาวาง', 'Click to upload or drag and drop')}
                </p>
                <p className="text-xs text-gray-600">
                  PNG, JPG or JPEG (MAX. 5MB)
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
                  className="inline-block mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg cursor-pointer hover:bg-orange-600 transition-colors"
                >
                  {ct('เลือกไฟล์', 'Choose File')}
                </label>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {ct('กำลังแสดงรูปปัจจุบัน', 'Currently showing existing image')}
            </p>
          </div>

          {/* Community Admins */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {ct('ผู้ดูแลชุมชน', 'Community Admins')}
            </label>
            
            {/* Admin List */}
            {formData.admins.length > 0 && (
              <div className="space-y-2 mb-4">
                {formData.admins.map((email, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{email}</p>
                        <p className="text-xs text-gray-500">{ct('ผู้ดูแล', 'Admin')}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAdmin(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <X className="h-5 w-5" />
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
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={handleAddAdmin}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>{ct('เพิ่ม', 'Add')}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(`/platform-admin/communities/${id}`)}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              {ct('ยกเลิก', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
            >
              {ct('บันทึกการเปลี่ยนแปลงและอัพเดท', 'Save Changes and Update')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlatformEditCommunity;
