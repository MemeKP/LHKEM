import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Image as ImageIcon, Plus, X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../services/api';
import { useQuery } from '@tanstack/react-query';
import Swal from 'sweetalert2'
import CommunityImageUploader from '../../components/CommunityImageUploader';
import { buildImageSlotsPayload } from '../../utils/communityImages';

const fetchCommunityDetail = async (id) => {
  const res = await api.get(`/api/platform-admin/communities/${id}/for-update`);
  return res.data; 
};

const updateCommunity = async ({ id, formData, coverSlot, gallerySlots }) => {
  const formDataToSend = new FormData();
  formDataToSend.append('name', formData.name);
  if (formData.name_en) formDataToSend.append('name_en', formData.name_en);
  if (formData.history) formDataToSend.append('history', formData.history);
  formDataToSend.append(
    'location',
    JSON.stringify({
      full_address: formData.location.full_address || '',
      province: formData.location.province || '',
      district: formData.location.district || '',
      sub_district: formData.location.sub_district || '',
      postal_code: formData.location.postal_code || '',
      coordinates: {
        lat: formData.location.coordinates?.lat || 0,
        lng: formData.location.coordinates?.lng || 0,
      },
    })
  );

  if (formData.contact_info) {
    formDataToSend.append(
      'contact_info',
      JSON.stringify({
        email: formData.contact_info.email || '',
        phone: formData.contact_info.phone || '',
        facebook: formData.contact_info.facebook || '',
        line: formData.contact_info.line || '',
        website: formData.contact_info.website || '',
      })
    );
  }

  if (formData.hero_section) {
    formDataToSend.append(
      'hero_section',
      JSON.stringify({
        description: formData.hero_section.description || ''
      })
    );
  }

  if (formData.admins && formData.admins.length > 0) {
     const adminList = formData.admins.map(a => (typeof a === 'string' ? a : a.email));
     formDataToSend.append('admins', JSON.stringify(adminList));
  }

  // formDataToSend.append('admin_permissions', JSON.stringify({
  //   can_approve_workshop: formData.workshopApproval
  // }));
  
  const manifest = buildImageSlotsPayload({
    coverSlot,
    gallerySlots,
    appendFile: (file) => formDataToSend.append('files', file),
  });

  formDataToSend.append('image_slots', JSON.stringify(manifest));

  const res = await api.patch(`/api/communities/${id}`, formDataToSend, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

const PlatformEditCommunity = () => {
  const { ct } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
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
    workshopApproval: true
  });
  const API_URL = import.meta.env.VITE_API_URL
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [mapImage, setMapImage] = useState(null);
  const [mapPreview, setMapPreview] = useState(null);
  const [existingMapUrl, setExistingMapUrl] = useState(null);
  const [galleryInitialImages, setGalleryInitialImages] = useState([]);
  const [gallerySlots, setGallerySlots] = useState([]);

  const { data: community, isLoading } = useQuery({
    queryKey: ['community-update', id],
    queryFn: () => fetchCommunityDetail(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });

  useEffect(() => {
    if (community && Object.keys(community).length > 0) {
      // console.log("API Data Received:", community);
      setFormData({
        name: community.name || '',
        name_en: community.name_en || '',
        history: community.history || '',
        hero_section: {
          description: community.hero_section?.description || community.hero_section?.description_en || '',
        },
        location: {
          full_address: community.location?.full_address || '',
          province: community.location?.province || '',
          district: community.location?.district || '',
          sub_district: community.location?.sub_district || '',
          postal_code: community.location?.postal_code || '',
          coordinates: {
            lat: community.location?.coordinates?.lat || 0,
            lng: community.location?.coordinates?.lng || 0
          }
        },
        contact_info: {
          phone: community.contact_info?.phone || '',
          email: community.contact_info?.email || '',
          facebook: community.contact_info?.facebook || '', 
        },
        admins: community.admins || [],
      });

      if (community.images && community.images.length > 0) {
        setExistingImage(community.images[0]);
        setGalleryInitialImages(community.images.slice(1, 5));
      } else {
        setGalleryInitialImages([]);
      }

      // Fetch existing community map
      const fetchCommunityMap = async () => {
        try {
          const res = await api.get(`/api/communities/${community._id}/communitymap`);
          if (res.data && res.data.map_image) {
            setExistingMapUrl(res.data.map_image);
          }
        } catch (error) {
          console.log('No existing map found', error);
        }
      };
      fetchCommunityMap();
    }
  }, [community]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const parts = name.split('.'); 
      if (parts.length === 2) {
        const [section, field] = parts;
        setFormData(prev => ({
          ...prev,
          [section]: {
            ...prev[section], 
            [field]: value    
          }
        }));
      }
      else if (parts.length === 3) {
        const [section, subsection, field] = parts;
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [subsection]: {
                    ...prev[section][subsection],
                    [field]: value
                }
            }
        }));
      }
    } 
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // const handleImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setFormData(prev => ({ ...prev, coverImage: file }));
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setImagePreview(reader.result);
  //       setExistingImage(null);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  // const handleRemoveImage = () => {
  //   setImagePreview(null);
  //   setExistingImage(null);
  //   setFormData(prev => ({ ...prev, coverImage: null }));
  // };

  // เมื่อ User เลือกไฟล์ใหม่
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setExistingImage(null);
    }
  };

  const handleRemoveImage = () => {
    setCoverImageFile(null);
    setImagePreview(null);
    setExistingImage(null);
  };

  const handleMapImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMapImage(file);
      setMapPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveMapImage = () => {
    setMapImage(null);
    setMapPreview(null);
  };

  const handleAddAdmin = () => {
    if (formData.admin_email && formData.admin_email.includes('@')) {
      setFormData(prev => ({
        ...prev,
        admins: [...prev.admins, prev.admin_email],
        admin_email: ''
      }));
    }
  };

  const handleRemoveAdmin = (index) => {
    setFormData(prev => ({
      ...prev,
      admins: prev.admins.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const coverSlot = coverImageFile
      ? { file: coverImageFile }
      : existingImage
        ? { existingUrl: existingImage }
        : null;

    try {
      await updateCommunity({
        id,
        formData,
        coverSlot,
        gallerySlots: gallerySlots?.length ? gallerySlots : [],
      });

      // Upload map image if provided 
      if (mapImage) {
        try {
          const mapFormData = new FormData();
          mapFormData.append('file', mapImage);
          await api.post(`/api/admin/communities/${id}/map`, mapFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } catch (error) {
          console.error('Failed to upload map:', error);
          await Swal.fire('คำเตือน', 'บันทึกข้อมูลสำเร็จ แต่ไม่สามารถอัปโหลดแผนที่ได้', 'warning');
        }
      }

      await Swal.fire('สำเร็จ', 'บันทึกข้อมูลเรียบร้อยแล้ว', 'success');
      navigate(`/platform-admin/communities/${id}`);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F5EFE7] animate-fadeIn">
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
              value={formData.name || ''}
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
              name="name_en"
              value={formData.name_en || ''}
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
              name="history"
              value={formData.history || ''}
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
                value={formData.location.full_address}
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
                  name="full_address"
                  value={formData.location.full_address || ''}
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
                    value={formData.location.province || ''}
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
                    value={formData.location.district || ''}
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
                  name="postal_code"
                  value={formData.location.postal_code || ''}
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

          {/* Community Map Upload */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {ct('รูปแผนที่ชุมชน (Interactive Map)', 'Community Map Image')}
            </label>
            <div className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center bg-orange-50">
              {mapPreview ? (
                <div className="relative">
                  <img
                    src={mapPreview}
                    alt="Map Preview"
                    className="max-h-64 mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveMapImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : existingMapUrl ? (
                <div className="relative">
                  <img
                    src={`${API_URL}${existingMapUrl}`}
                    alt="Existing Map"
                    className="max-h-64 mx-auto rounded-lg"
                  />
                  <label
                    htmlFor="map-image-edit"
                    className="absolute top-2 right-2 bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 cursor-pointer"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMapImageChange}
                    className="hidden"
                    id="map-image-edit"
                  />
                </div>
              ) : (
                <label className="cursor-pointer">
                  <MapPin className="h-12 w-12 text-orange-500 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {ct('อัปโหลดรูปแผนที่ชุมชน', 'Upload Community Map')}
                  </p>
                  <p className="text-xs text-gray-600">
                    {ct('คลิกเพื่อเลือกไฟล์รูปภาพ (PNG, JPG)', 'Click to select image file (PNG, JPG)')}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMapImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {ct('รูปแผนที่นี้จะใช้สำหรับปักหมุดร้านค้าและสถานที่ต่างๆ ในชุมชน', 'This map will be used for pinning shops and locations in the community')}
            </p>
          </div>

          {/* Additional Details */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {ct('คำอธิบาย', 'Description')}
            </label>
            <textarea
              name="hero_section.description"
              value={formData.hero_section.description || ''}
              onChange={handleInputChange}
              placeholder={ct('ทิศทาง เช่น เดินทางโดยรถยนต์หรือรถโดยสารจากเชียงใหม่...', 'Directions, e.g., Travel by car or bus from Chiang Mai...')}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              {ct('บอกเล่า ทิศทาง + ข้อมูลเพิ่มเติม', 'Share directions and additional information')}
            </p>
          </div>

          {/* Community Atmosphere Images */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {ct('บรรยากาศในชุมชน', 'Community Atmosphere')}
            </label>
            <CommunityImageUploader
              initialImages={galleryInitialImages}
              onChange={setGallerySlots}
            />
          </div>

          {/* Contact Email */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {ct('ข้อมูลติดต่อ', 'Contact Information')}
            </label>
            <input
              type="email"
              name="contact_info.email"
              value={formData.contact_info.email || ''}
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
                  src={
                    imagePreview
                      ? imagePreview
                      : existingImage
                        ? (existingImage.startsWith('/uploads') || existingImage.startsWith('uploads'))
                          ? `${API_URL}${existingImage.startsWith('/') ? '' : '/'}${existingImage}` 
                          : `${API_URL}/uploads/${existingImage}` 
                        : 'path/to/placeholder.jpg'
                  }
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
            {formData.admins && formData.admins.length > 0 && (
              <div className="space-y-2 mb-4">
                {formData.admins.map((admin, index) => {
                  const isObject = typeof admin === 'object' && admin !== null;
                  const email = isObject ? admin.email : admin;
                  let name = isObject ? admin.name : null;
                  if (name === 'Unknown' || !name) {
                    name = email;
                  }
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                          <span className="text-white font-semibold text-sm">
                            {name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {ct('ผู้ดูแล', 'Admin')} ({email})
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveAdmin(index)}
                        className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {/* Add Admin Input */}
            <div className="flex space-x-2">
              <input
                type="email"
                name="admin_email"
                value={formData.admin_email || ''}
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
