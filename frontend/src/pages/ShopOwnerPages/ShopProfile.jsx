import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, MapPin, Clock, Phone, Facebook, MessageCircle, Globe, Camera } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../services/api';

const ShopProfile = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [shopData, setShopData] = useState({
    name: '',
    description: '',
    openTime: '',
    closeTime: '',
    location: {
      address: '',
      lat: 0,
      lng: 0
    },
    contactLinks: {
      phone: '',
      line: '',
      facebook: '',
      website: ''
    },
    images: []
  });

  useEffect(() => {
    if (!user?.shopId) {
      setLoading(false);
      return;
    }
    const run = async () => {
      try {
        const response = await api.get(`/shops/${user.shopId}`);
        setShopData(response.data.shop);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setShopData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setShopData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put(`/shops/${user.shopId}`, shopData);
      setMessage({ type: 'success', text: t('shopProfile.saveSuccess') });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch {
      setMessage({ type: 'error', text: t('shopProfile.saveError') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const handleImageUpload = (type, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'cover') {
        setShopData(prev => ({ ...prev, coverImage: reader.result }));
      } else if (type === 'icon') {
        setShopData(prev => ({ ...prev, iconImage: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/shop/dashboard')}
          className="mb-6 text-sm text-gray-600 hover:text-orange-600 flex items-center gap-1"
        >
          ← กลับ
        </button>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">แก้ไขข้อมูลร้านของคุณ</h1>
          <p className="text-gray-600">คุณสามารถแก้ไขข้อมูลร้านของคุณได้ตามต้องการ</p>
          <p className="text-sm text-gray-500 mt-1">ข้อมูลที่แก้ไขจะถูกบันทึกทันที หลังจากกดปุ่มบันทึกข้อมูล</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 animate-slideUp">
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 animate-scaleIn">
            <h2 className="text-xl font-bold text-gray-900 mb-6">ชื่อร้าน</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อร้านของคุณ</label>
              <input
                type="text"
                name="name"
                value={shopData.name}
                onChange={handleChange}
                placeholder="ใส่ชื่อร้านของคุณ"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
              <p className="text-xs text-gray-500 mt-2">ชื่อร้านจะแสดงในหน้าร้านค้าและ Workshop</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 animate-scaleIn">
            <h2 className="text-xl font-bold text-gray-900 mb-6">รูปภาพ</h2>
            
            {/* Cover Image */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">รูปหน้าปก</label>
              <div className="relative aspect-[16/6] w-full bg-gray-100 rounded-xl overflow-hidden">
                {shopData.coverImage ? (
                  <img src={shopData.coverImage} alt="cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Camera className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-sm">อัปโหลดรูปหน้าปกร้าน</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg cursor-pointer hover:bg-orange-600 shadow-sm transition-colors">
                  <Camera className="h-4 w-4" />
                  เปลี่ยนรูปหน้าปก
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('cover', e.target.files?.[0])} />
                </label>
                {shopData.coverImage && (
                  <button
                    type="button"
                    onClick={() => setShopData(prev => ({ ...prev, coverImage: '' }))}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    ลบรูป
                  </button>
                )}
              </div>
            </div>

            {/* Icon Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">ไอคอนร้าน</label>
              <div className="flex items-center gap-4">
                <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                  {shopData.iconImage ? (
                    <img src={shopData.iconImage} alt="icon" className="w-full h-full object-cover" />
                  ) : (
                    shopData.name.charAt(0) || 'S'
                  )}
                </div>
                <div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg cursor-pointer hover:bg-gray-700 shadow-sm transition-colors">
                    <Camera className="h-4 w-4" />
                    เปลี่ยนไอคอน
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('icon', e.target.files?.[0])} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 animate-scaleIn">
            <h2 className="text-xl font-bold text-gray-900 mb-6">คำอธิบายร้าน</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">เกี่ยวกับร้านของคุณ</label>
              <textarea
                name="description"
                value={shopData.description}
                onChange={handleChange}
                rows="5"
                placeholder="บอกเล่าเกี่ยวกับร้านของคุณ เช่น ประวัติ จุดเด่น สินค้าและบริการ"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
              <p className="text-xs text-gray-500 mt-2">แนะนำให้เขียนอย่างน้อย 100 ตัวอักษร</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 animate-scaleIn">
            <h2 className="text-xl font-bold text-gray-900 mb-6">ที่อยู่ร้านค้า</h2>
            
            <div className="space-y-6">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ที่อยู่ร้าน</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    name="location.address"
                    value={shopData.location.address}
                    onChange={handleChange}
                    rows="3"
                    placeholder="ใส่ที่อยู่ร้านของคุณ"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              {/* Location Picker Placeholder */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📍 ตำแหน่งบนแผนที่</label>
                <div className="aspect-video w-full bg-green-50 border-2 border-dashed border-green-300 rounded-xl flex items-center justify-center">
                  <div className="text-center text-green-700">
                    <MapPin className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm font-medium">คลิกเพื่อเลือกตำแหน่งบนแผนที่</p>
                    <button
                      type="button"
                      className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
                    >
                      เปิดแผนที่
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">ตำแหน่งจะช่วยให้ลูกค้าหาร้านของคุณได้ง่ายขึ้น</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 animate-scaleIn">
            <h2 className="text-xl font-bold text-gray-900 mb-6">⏰ เวลาทำการ</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เวลาเปิด</label>
                <input
                  type="time"
                  name="openTime"
                  value={shopData.openTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เวลาปิด</label>
                <input
                  type="time"
                  name="closeTime"
                  value={shopData.closeTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 animate-scaleIn">
            <h2 className="text-xl font-bold text-gray-900 mb-6">ช่องทางติดต่อ</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('shopProfile.fields.phone')}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="contactLinks.phone"
                    value={shopData.contactLinks.phone}
                    onChange={handleChange}
                    placeholder="081-234-5678"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('shopProfile.fields.line')}
                </label>
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="contactLinks.line"
                    value={shopData.contactLinks.line}
                    onChange={handleChange}
                    placeholder="@shopname"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('shopProfile.fields.facebook')}
                </label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    name="contactLinks.facebook"
                    value={shopData.contactLinks.facebook}
                    onChange={handleChange}
                    placeholder="facebook.com/shopname"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('shopProfile.fields.website')}
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    name="contactLinks.website"
                    value={shopData.contactLinks.website}
                    onChange={handleChange}
                    placeholder="https://www.example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/shop/dashboard')}
              className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Save className="h-5 w-5" />
              {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
          
          <p className="text-center text-xs text-gray-500 mt-4">
            ข้อมูลที่แก้ไขจะถูกบันทึกและแสดงในหน้าร้านค้าทันที
          </p>
        </form>
      </div>
    </div>
  );
};

export default ShopProfile;
