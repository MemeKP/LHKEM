import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, MapPin, Clock, Phone, Facebook, MessageCircle, Globe, Camera } from 'lucide-react';
// translations not used in this prototype

const ShopCreate = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [shopData, setShopData] = useState({
    name: '',
    description: '',
    openTime: '',
    closeTime: '',
    iconUrl: '',
    coverUrl: '',
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

  const handleImagePick = (key, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setShopData(prev => ({ ...prev, [key]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

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
      const draft = {
        id: `shop-${Date.now()}`,
        ...shopData,
        createdAt: new Date().toISOString(),
        workshops: []
      };
      localStorage.setItem('shopDraft', JSON.stringify(draft));
      localStorage.setItem('shopHasSetup', 'true');
      setMessage({ type: 'success', text: 'บันทึกโปรไฟล์ร้านเรียบร้อย' });
      navigate('/shop/dashboard');
    } catch {
      setMessage({ type: 'error', text: 'บันทึกร้านไม่สำเร็จ ลองใหม่อีกครั้ง' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-8 animate-fadeIn">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          สร้างโปรไฟล์ร้านของคุณ
        </h1>
        <p className="text-gray-600 mb-6">กรอกข้อมูลร้าน เพื่อให้ผู้ใช้รู้จักร้านของคุณมากขึ้น</p>

        {message.text && (
          <div
            className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 animate-slideUp bg-white rounded-xl shadow-sm p-6 space-y-6 border border-gray-100">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">ภาพหน้าปกร้าน (พื้นหลัง)</label>
            <div className="aspect-[16/6] w-full bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              {shopData.coverUrl ? (
                <img src={shopData.coverUrl} alt="shop cover" className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400">ตัวอย่างภาพพื้นหลัง</div>
              )}
            </div>
            <div>
              <label className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg cursor-pointer hover:bg-gray-700">
                <Camera className="h-4 w-4 mr-2" />
                อัปโหลดภาพพื้นหลัง
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImagePick('coverUrl', e.target.files?.[0])}
                />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Icon ร้าน (โปรไฟล์)</label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                  {shopData.iconUrl ? (
                    <img src={shopData.iconUrl} alt="shop icon" className="h-full w-full object-cover" />
                  ) : (
                    (shopData.name?.charAt(0) || 'S')
                  )}
                </div>
              </div>
              <label className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg cursor-pointer hover:bg-gray-700">
                <Camera className="h-4 w-4 mr-2" />
                อัปโหลด Icon
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImagePick('iconUrl', e.target.files?.[0])}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อร้าน</label>
            <input
              type="text"
              name="name"
              value={shopData.name}
              onChange={handleChange}
              placeholder="เช่น บ้านมัดย้อม"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">คำอธิบายร้านของคุณ</label>
            <input
              type="text"
              name="description"
              value={shopData.description}
              onChange={handleChange}
              placeholder="เล่าเรื่องราวร้านของคุณ คร่าวๆ"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ข้อมูลติดต่อ</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  name="contactLinks.phone"
                  value={shopData.contactLinks.phone}
                  onChange={handleChange}
                  placeholder="081-234-5678"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="contactLinks.line"
                  value={shopData.contactLinks.line}
                  onChange={handleChange}
                  placeholder="@shopline"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ที่ตั้งหน้าร้าน</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="location.address"
                value={shopData.location.address}
                onChange={handleChange}
                placeholder="เช่น โหล่งฮิมคาว อ.สันกำแพง จ.เชียงใหม่"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">เวลาทำการ</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="openTime"
                  value={shopData.openTime}
                  onChange={handleChange}
                  placeholder="เช่น 09:00"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="closeTime"
                  value={shopData.closeTime}
                  onChange={handleChange}
                  placeholder="เช่น 17:00"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60"
            >
              <Save className="h-5 w-5 mr-2" />
              บันทึกร้านของฉัน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopCreate;
