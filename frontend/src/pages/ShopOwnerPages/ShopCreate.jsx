import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { MapPin, Clock, Phone, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const ShopCreate = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { token } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [communityId, setCommunityId] = useState('');
  
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
      facebook: ''
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

  const { data: communities = [] } = useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      const res = await api.get('/api/communities');
      return res.data;
    }
  });

  useEffect(() => {
    if (communities.length && !communityId) {
      setCommunityId(communities[0]._id);
    }
  }, [communities, communityId]);

  const createShopMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('กรุณาเข้าสู่ระบบก่อนสร้างร้าน');
      if (!communityId) throw new Error('เลือกชุมชนก่อน');
      const payload = {
        shopName: shopData.name,
        description: shopData.description,
        openTime: shopData.openTime,
        picture: shopData.coverUrl,
        contact: {
          line: shopData.contactLinks.line,
          facebook: shopData.contactLinks.facebook,
          phone: shopData.contactLinks.phone,
        },
        communityId,
      };
      return api.post('/api/shops', payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },
    onSuccess: (response) => {
      setMessage({ type: 'success', text: 'บันทึกโปรไฟล์ร้านเรียบร้อย' });
      // Get the community slug from the selected community
      const selectedCommunity = communities.find(c => c._id === communityId);
      const communitySlug = selectedCommunity?.slug || slug;
      navigate(`/${communitySlug}/shop/dashboard`);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || 'บันทึกร้านไม่สำเร็จ ลองใหม่อีกครั้ง';
      setMessage({ type: 'error', text: Array.isArray(msg) ? msg.join(', ') : msg });
    },
    onSettled: () => setSaving(false),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!communities.length) {
      setMessage({ type: 'error', text: 'ยังโหลดรายการชุมชนไม่เสร็จ กรุณาลองใหม่' });
      return;
    }
    setSaving(true);
    setMessage({ type: '', text: '' });
    createShopMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-[#F5EFE7] py-12 animate-fadeIn">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2F4F2F] mb-3">สร้างโปรไฟล์ร้านของคุณ</h1>
          <p className="text-[#6B6B6B] text-base">กรอกข้อมูลร้านของคุณเพื่อเริ่มต้นใช้งาน</p>
        </div>

        {message.text && (
          <div
            className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
          >
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
              {shopData.coverUrl ? (
                <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                  <img src={shopData.coverUrl} alt="shop cover" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="h-12 w-12 text-[#E07B39] mx-auto mb-3" />
                  <p className="text-sm text-[#9CA3AF] mb-1">อัปโหลดรูปหน้าปก หรือรูปตัวอย่างร้าน</p>
                  <p className="text-xs text-[#9CA3AF]">ควรเป็นรูปแนวนอน</p>
                </div>
              )}
            </div>
            <div className="mt-3">
              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#E07B39] text-[#E07B39] font-medium rounded-full cursor-pointer hover:bg-[#E07B39] hover:text-white transition-all hover:scale-105 shadow-sm">
                <ImageIcon className="h-4 w-4" />
                เลือกรูปภาพ
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImagePick('coverUrl', e.target.files?.[0])}
                />
              </label>
            </div>
          </div>

          {/* คำอธิบายร้าน */}
          <div className="animate-fadeIn" style={{animationDelay: '0.4s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-2">คำอธิบายร้านของคุณ</label>
            <textarea
              name="description"
              value={shopData.description}
              onChange={handleChange}
              rows="4"
              placeholder="เล่าเรื่องราวร้านของคุณ เช่น ประวัติ จุดเด่น สินค้าและบริการ"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all resize-none"
            />
            <p className="text-xs text-[#9CA3AF] mt-1">ไม่ต้องยาวมากก็ได้ แค่ให้ลูกค้ารู้จักร้านของคุณ</p>
          </div>

          {/* ชุมชน */}
          <div className="animate-fadeIn" style={{animationDelay: '0.45s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-2">เลือกชุมชน</label>
            <select
              name="community"
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
              required
            >
              {communities.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name || c.slug}
                </option>
              ))}
            </select>
            <p className="text-xs text-[#9CA3AF] mt-1">เลือกร้านสังกัดชุมชนในระบบ</p>
          </div>

          {/* ข้อมูลติดต่อ */}
          <div className="animate-fadeIn" style={{animationDelay: '0.5s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-3">📞 ข้อมูลติดต่อ</label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#6B6B6B] mb-1.5">📱 เบอร์โทรศัพท์</label>
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
              <div>
                <label className="block text-xs text-[#6B6B6B] mb-1.5">� LINE ID</label>
                <input
                  type="text"
                  name="contactLinks.line"
                  value={shopData.contactLinks.line}
                  onChange={handleChange}
                  placeholder="เช่น @shopname"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6B6B6B] mb-1.5">📘 Facebook</label>
                <input
                  type="text"
                  name="contactLinks.facebook"
                  value={shopData.contactLinks.facebook}
                  onChange={handleChange}
                  placeholder="https://facebook.com/yourshop"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
                />
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

          {/* Submit Button */}
          <div className="pt-4 animate-fadeIn" style={{animationDelay: '0.8s'}}>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 bg-[#E07B39] hover:bg-[#D66B29] text-white font-semibold rounded-full transition-all disabled:opacity-60 shadow-md hover:shadow-lg hover:scale-[1.02] transform"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกร้านของฉัน'}
            </button>
            <p className="text-center text-xs text-[#6B6B6B] mt-3">ข้อมูลจะถูกบันทึกและแสดงในหน้าร้านค้าทันที</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopCreate;
