import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Phone, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../services/api';

const ShopProfile = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { slug } = useParams();
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
    <div className="min-h-screen bg-[#F5EFE7] py-12 animate-fadeIn">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(`/${slug}/shop/dashboard`)}
          className="mb-6 flex items-center gap-2 text-sm text-[#6B6B6B] hover:text-[#E07B39] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับ
        </button>
        
        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2F4F2F] mb-3">แก้ไขข้อมูลร้านของคุณ</h1>
          <p className="text-[#6B6B6B] text-base">คุณสามารถแก้ไขข้อมูลร้านของคุณได้ตามต้องการ</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-6 border border-gray-100 animate-slideUp" style={{animationDelay: '0.1s'}}>
          {/* ชื่อร้าน */}
          <div className="animate-fadeIn" style={{animationDelay: '0.2s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-2">ชื่อร้าน</label>
            <input
              type="text"
              name="name"
              value={shopData.name}
              onChange={handleChange}
              placeholder="ใส่ชื่อร้านของคุณ"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
              required
            />
            <p className="text-xs text-[#9CA3AF] mt-1">ชื่อร้านจะแสดงในหน้าร้านค้าและ Workshop</p>
          </div>

          {/* รูปหน้าปก */}
          <div className="animate-fadeIn" style={{animationDelay: '0.3s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-2">รูปหน้าปก</label>
            <div className="border-2 border-dashed border-[#E07B39] rounded-xl p-8 bg-[#FFF7ED] hover:bg-[#FFEDD5] transition-colors">
              {shopData.coverImage ? (
                <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                  <img src={shopData.coverImage} alt="cover" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="h-12 w-12 text-[#E07B39] mx-auto mb-3" />
                  <p className="text-sm text-[#9CA3AF] mb-1">อัปโหลดรูปหน้าปก หรือรูปตัวอย่างร้าน</p>
                  <p className="text-xs text-[#9CA3AF]">ควรเป็นรูปแนวนอน</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#E07B39] text-[#E07B39] font-medium rounded-full cursor-pointer hover:bg-[#E07B39] hover:text-white transition-all hover:scale-105 shadow-sm">
                <ImageIcon className="h-4 w-4" />
                เปลี่ยนรูปหน้าปก
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('cover', e.target.files?.[0])} />
              </label>
              {shopData.coverImage && (
                <button
                  type="button"
                  onClick={() => setShopData(prev => ({ ...prev, coverImage: '' }))}
                  className="px-5 py-2.5 bg-red-50 text-red-600 font-medium rounded-full hover:bg-red-100 transition-all hover:scale-105"
                >
                  ลบรูป
                </button>
              )}
            </div>
          </div>

          {/* คำอธิบายร้าน */}
          <div className="animate-fadeIn" style={{animationDelay: '0.4s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-2">คำอธิบายร้านของคุณ</label>
            <textarea
              name="description"
              value={shopData.description}
              onChange={handleChange}
              rows="5"
              placeholder="เล่าเรื่องราวร้านของคุณ เช่น ประวัติ จุดเด่น สินค้าและบริการ"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all resize-none"
              required
            />
            <p className="text-xs text-[#9CA3AF] mt-1">แนะนำให้เขียนอย่างน้อย 100 ตัวอักษร</p>
          </div>

          {/* ข้อมูลติดต่อ */}
          <div className="animate-fadeIn" style={{animationDelay: '0.5s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-3">📞 ข้อมูลติดต่อ</label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#9CA3AF] mb-1.5">อีเมล</label>
                <input
                  type="text"
                  name="contactLinks.line"
                  value={shopData.contactLinks.line}
                  onChange={handleChange}
                  placeholder="mail@example.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-[#9CA3AF] mb-1.5">📱 เบอร์โทรศัพท์</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                  <input
                    type="tel"
                    name="contactLinks.phone"
                    value={shopData.contactLinks.phone}
                    onChange={handleChange}
                    placeholder="เช่น 081-234-5678"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ตำแหน่งร้าน */}
          <div className="animate-fadeIn" style={{animationDelay: '0.6s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-3">📍 ตำแหน่งร้าน</label>
            <div className="bg-[#E8F5E9] border-2 border-dashed border-[#4CAF50] rounded-xl p-6 hover:bg-[#C8E6C9] transition-colors">
              <div className="text-center">
                <MapPin className="h-10 w-10 text-[#4CAF50] mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-[#2F4F2F] mb-4">เลือกตำแหน่งบนแผนที่</h3>
                <button
                  type="button"
                  className="mt-2 px-4 py-2 bg-[#4CAF50] text-white rounded-full text-sm font-medium hover:bg-[#45A049] transition-all hover:scale-105"
                >
                  เปิดแผนที่
                </button>
              </div>
            </div>
            <p className="text-xs text-[#6B6B6B] mt-2">ตำแหน่งจะช่วยให้ลูกค้าหาร้านของคุณได้ง่าย ๆ ที่นี่</p>
          </div>

          {/* เวลาทำการ */}
          <div className="animate-fadeIn" style={{animationDelay: '0.7s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-3">🕐 เวลาทำการ</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
              <input
                type="text"
                name="openTime"
                value={shopData.openTime}
                onChange={handleChange}
                placeholder="เช่น 09:00 - 17:00"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 animate-fadeIn" style={{animationDelay: '0.8s'}}>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 bg-[#E07B39] hover:bg-[#D66B29] text-white font-semibold rounded-full transition-all disabled:opacity-60 shadow-md hover:shadow-lg hover:scale-[1.02] transform"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไขข้อมูล'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/${slug}/shop/dashboard`)}
              className="w-full mt-3 py-3 text-[#6B6B6B] font-medium hover:text-[#3D3D3D] transition-colors"
            >
              ยกเลิก
            </button>
            <p className="text-center text-xs text-[#9CA3AF] mt-3">ข้อมูลที่แก้ไขจะถูกบันทึกและแสดงในหน้าร้านค้าทันที</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopProfile;
