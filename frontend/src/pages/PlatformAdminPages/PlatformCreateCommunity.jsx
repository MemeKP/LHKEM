import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Image as ImageIcon, Plus, X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../services/api';
import { useMutation } from '@tanstack/react-query';

// เหลือต่อ map

const createCommunity = async (formData) => {
  const formDataToSend = new FormData();
  formDataToSend.append('name', formData.name);

  if (formData.history)
    formDataToSend.append('history', formData.history);

  if (formData.nameEn)
    formDataToSend.append('name_en', formData.nameEn);
  formDataToSend.append(
    'location',
    JSON.stringify({
      full_address: formData.location.full_address,
      province: formData.location.province,
      district: formData.location.district,
      sub_district: formData.location.sub_district,
      postal_code: formData.location.postal_code,
      coordinates: {
        lat: formData.location.coordinates?.lat || null,
        lng: formData.location.coordinates?.lng || null,
      },
    })
  );
  formDataToSend.append(
    'contact_info',
    JSON.stringify({
      email: formData.contactEmail,
      phone: formData.phone,
    })
  );

  if (formData.hero_section) {
    formDataToSend.append(
      'hero_section',
      JSON.stringify({
        description: formData.hero_section.description || ''
      })
    )
  }

  if (formData.admins.length > 0) {
    formDataToSend.append('admins', JSON.stringify(formData.admins));
  }

  if (formData.coverImage) {
    formDataToSend.append('images', formData.coverImage);
  }

  formDataToSend.append('admin_permissions', JSON.stringify({
    can_approve_workshop: formData.workshopApproval
  }));

  const res = await api.post('/api/communities', formDataToSend, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data
};
const PlatformCreateCommunity = () => {
  const { ct } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    hero_section: {
      description: ''
    },
    history: '',
    location: {
      full_address: '',
      district: '',
      sub_district: '',
      postal_code: '',
      province: '',
      coordinates: {
        lat: 0,
        lng: 0,
      },
    },
    contact_info: {
      phone: '',
      email: '',
      facebook: '',
      line: '',
      website: '',
    },
    images: null,
    admins: [],
    admin_email: '',
    workshopApproval: false
  });

  const [imagePreview, setImagePreview] = useState(null);

  const mutation = useMutation({
    mutationFn: createCommunity,
    onSuccess: () => {
      navigate('/platform-admin/dashboard');
    },
    onError: (error) => {
      console.log(error.response?.data);
    }

  });

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

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   // Save to localStorage for demo
  //   const communities = JSON.parse(localStorage.getItem('communities') || '[]');
  //   const newCommunity = {
  //     id: Date.now().toString(),
  //     ...formData,
  //     createdAt: new Date().toISOString()
  //   };
  //   communities.push(newCommunity);
  //   localStorage.setItem('communities', JSON.stringify(communities));
  //   navigate('/platform-admin/dashboard');
  // };
  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] animate-fadeIn">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/platform-admin/dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">{ct('กลับไปหน้าแดชบอร์ด', 'Back to Dashboard')}</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {ct('สร้าง Community ใหม่', 'Create New Community')}
          </h1>
          <p className="text-gray-600">
            {ct('เพิ่มชุมชนใหม่เข้าสู่แพลตฟอร์ม LHKEM', 'Add a new community to the LHKEM platform')}
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
              placeholder={ct('เช่น หมู่บ้านเกษตรอินทรีย์บ้านสวนป่า', 'e.g., Organic Farm Village')}
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
              placeholder="e.g., Loeng Him Kaw"
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
              name="history"
              value={formData.history}
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
          {/* <div className="mb-6">
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
          </div> */}
          {/* Location */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {ct('ที่ตั้ง', 'Location')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <div className="mb-4">
                <input
                  type="text"
                  name="fullAddress"
                  value={formData.location.full_address}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      location: {
                        ...prev.location,
                        full_address: e.target.value
                      }
                    }))
                  }
                  placeholder="เช่น 123 หมู่ 4 ต.สุเทพ"
                  className="w-full px-8 py-3 border rounded-lg "
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    จังหวัด *
                  </label>
                  <input
                    type="text"
                    name="province"
                    value={formData.location.province}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          province: e.target.value
                        }
                      }))
                    }
                    required
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    อำเภอ / เขต
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.location.district}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          district: e.target.value
                        }
                      }))
                    }
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">
                  รหัสไปรษณีย์
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.location.postal_code}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      location: {
                        ...prev.location,
                        postal_code: e.target.value
                      }
                    }))
                  }
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </div>
              <input
                type="hidden"
                value={formData.location.coordinates.lat}
              />
              <input
                type="hidden"
                value={formData.location.coordinates.lng}
              />
            </div>
          </div>
          <div className="mb-6">
            <div
              className="cursor-pointer border-2 border-orange-300 rounded-lg p-8 text-center bg-orange-50"
            >
              <MapPin className="h-12 w-12 text-orange-500 mx-auto mb-3" />
              <p className="text-sm font-medium">
                {formData.lat && formData.lng
                  ? `Lat: ${formData.lat}, Lng: ${formData.lng}`
                  : 'คลิกเพื่อเลือกตำแหน่งบนแผนที่'}
              </p>
            </div>
          </div>

          {/* Map Picker */}
          {/* <div className="mb-6">
            <div className="border-2 border-orange-300 rounded-lg p-8 text-center bg-orange-50">
              <MapPin className="h-12 w-12 text-orange-500 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900 mb-1">
                {ct('เลือกตำแหน่งที่ตั้ง (Google Maps API)', 'Select Location (Google Maps API)')}
              </p>
              <p className="text-xs text-gray-600">
                {ct('คลิกเพื่อเปิดแผนที่และเลือกตำแหน่ง', 'Click to open map and select location')}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {ct('ตำแหน่งที่เลือกจะใช้ใน 1 ที่', 'Selected location will be used in 1 place')}
            </p>
          </div> */}

          {/* Additional Details */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {ct('คำอธิบาย', 'Description')}
            </label>
            <textarea
              name="heroSection"
              value={formData.hero_section.description}
              onChange={(e) => setFormData({
                ...formData,
                hero_section: {
                  ...formData.hero_section,
                  description: e.target.value
                }
              })}
              placeholder={ct('คำอธิบายสั้น ๆ เกี่ยวกับชุมชนและสิ่งที่ทำให้ชุมชนนี้พิเศษ...', 'A brief description of the community and what makes it special...')}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
            />
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
              placeholder="contact@community.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Cover Image */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {ct('รูปภาพหน้าปก', 'Cover Image')}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, coverImage: null }));
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
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
                    id="cover-image"
                  />
                  <label
                    htmlFor="cover-image"
                    className="inline-block mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg cursor-pointer hover:bg-orange-600 transition-colors"
                  >
                    {ct('เลือกไฟล์', 'Choose File')}
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Community Admins */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {ct('ผู้ดูแลชุมชน', 'Community Admins')}
            </label>

            {/* Checkbox */}
            <div className="flex items-start space-x-3 mb-4 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                name="workshopApproval"
                checked={formData.workshopApproval}
                onChange={handleInputChange}
                className="mt-1 h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                id="workshop-approval"
              />
              <label htmlFor="workshop-approval" className="text-sm text-gray-700">
                {ct('ผู้ดูแลชื่อนี้เป็นผู้ที่มีสิทธิ์อนุมัติการสร้าง workshop', 'This admin has permission to approve workshop creation')}
              </label>
            </div>

            {/* Admin List */}
            {formData.admins.length > 0 && (
              <div className="space-y-2 mb-4">
                {formData.admins.map((email, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-900">{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAdmin(index)}
                      className="text-red-500 hover:text-red-600"
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
              onClick={() => navigate('/platform-admin/dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              {ct('ยกเลิก', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
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
