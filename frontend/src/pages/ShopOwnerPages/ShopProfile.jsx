import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Phone, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { getMyShop, updateShop, uploadShopImage } from '../../services/shopService';
import ShopMapPinModal from '../../components/ShopMapPinModal';
import { saveShopMapPin, getMyShopMapPin } from '../../services/mapPinService';

const ShopProfile = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [shopData, setShopData] = useState({
    shopName: '',
    description: '',
    address: '',
    openTime: '',
    closeTime: '',
    location: {
      address: '',
      lat: 0,
      lng: 0
    },
    contact: {
      phone: '',
      line: '',
      facebook: ''
    },
    coverUrl: '',
    iconUrl: '',
    images: []
  });
  const [shopId, setShopId] = useState(null);
  const [communityId, setCommunityId] = useState('');
  const [isPinModalOpen, setPinModalOpen] = useState(false);
  const [selectedPinPosition, setSelectedPinPosition] = useState(null);
  const [pinStatusMessage, setPinStatusMessage] = useState('');
  const [uploadingField, setUploadingField] = useState(null);

  const mapShopToState = (shop) => ({
    shopName: shop?.shopName || '',
    description: shop?.description || '',
    address: shop?.address || shop?.location?.address || '',
    openTime: shop?.openTime || '',
    closeTime: shop?.closeTime || '',
    location: {
      address: shop?.location?.address || shop?.address || '',
      lat: shop?.location?.lat || 0,
      lng: shop?.location?.lng || 0,
    },
    contact: shop?.contact || { phone: '', line: '', facebook: '' },
    coverUrl: shop?.coverUrl || '',
    iconUrl: shop?.iconUrl || '',
    images: shop?.images || [],
  });

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const shop = await getMyShop();
        setShopId(shop._id);
        setShopData(mapShopToState(shop));
        if (shop.communityId) {
          setCommunityId(shop.communityId);
        }
      } catch (error) {
        console.error('Failed to fetch shop:', error);
        if (error.response?.status === 404) {
          navigate(`/${slug}/shop/create`);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [navigate, slug]);

  useEffect(() => {
    if (!shopId) return;

    const loadPin = async () => {
      try {
        const result = await getMyShopMapPin();
        if (result?.communityId && !communityId) {
          setCommunityId(result.communityId);
        }
        if (result?.hasPin) {
          setSelectedPinPosition({
            x: result.position_x,
            y: result.position_y,
          });
          setPinStatusMessage(
            `${t('map-pin.status', { defaultValue: 'สถานะหมุด' })}: ${result.status || ''}`,
          );
        } else {
          setPinStatusMessage(t('map-pin.no-pin', { defaultValue: 'ยังไม่มีหมุดตำแหน่งร้าน' }));
        }
      } catch (error) {
        console.error('Failed to load shop pin', error);
      }
    };

    loadPin();
  }, [shopId, communityId, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'address') {
      setShopData(prev => ({
        ...prev,
        address: value,
        location: {
          ...prev.location,
          address: value,
        },
      }));
      return;
    }

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

  const clearTimeField = (field) => {
    setShopData((prev) => ({
      ...prev,
      [field]: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shopId) {
      setMessage({ type: 'error', text: 'ไม่พบข้อมูลร้านค้า' });
      return;
    }
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        ...shopData,
        openTime: shopData.openTime?.trim() ? shopData.openTime : null,
        closeTime: shopData.closeTime?.trim() ? shopData.closeTime : null,
      };
      await updateShop(shopId, payload);
      const refreshed = await getMyShop();
      setShopData(mapShopToState(refreshed));
      if (refreshed.communityId) {
        setCommunityId(refreshed.communityId);
      }
      setMessage({ type: 'success', text: 'บันทึกข้อมูลสำเร็จ' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Failed to update shop:', error);
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
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

  const handleImageUpload = async (type, file) => {
    if (!file) return;
    if (!shopId) {
      setMessage({ type: 'error', text: 'ไม่พบรหัสร้านค้า โปรดลองใหม่' });
      return;
    }

    const fieldKey = type === 'icon' ? 'iconUrl' : 'coverUrl';
    const previousValue = shopData[fieldKey];
    const previewUrl = URL.createObjectURL(file);

    setUploadingField(type);
    setShopData((prev) => ({ ...prev, [fieldKey]: previewUrl }));

    try {
      const updatedShop = await uploadShopImage(shopId, type, file);
      setShopData(mapShopToState(updatedShop));
      setMessage({ type: 'success', text: type === 'icon' ? 'อัปโหลดรูปไอคอนสำเร็จ' : 'อัปโหลดรูปหน้าปกสำเร็จ' });
      setTimeout(() => setMessage({ type: '', text: '' }), 2500);
    } catch (error) {
      console.error('Failed to upload image', error);
      const errorMsg = error?.response?.data?.message || error.message || 'อัปโหลดรูปไม่สำเร็จ';
      setMessage({ type: 'error', text: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg });
      setShopData((prev) => ({ ...prev, [fieldKey]: previousValue }));
    } finally {
      setUploadingField(null);
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleOpenPinModal = () => {
    if (!communityId) {
      setMessage({ type: 'error', text: 'ยังไม่ทราบชุมชนของร้าน กรุณาตรวจสอบอีกครั้ง' });
      return;
    }
    setPinModalOpen(true);
  };

  const handlePinConfirm = async (position) => {
    try {
      await saveShopMapPin({
        position_x: position.x,
        position_y: position.y,
      });
      setSelectedPinPosition(position);
      setPinStatusMessage('บันทึกหมุดตำแหน่งใหม่เรียบร้อย (สถานะ: รออนุมัติ)');
    } catch (error) {
      console.error('Failed to save map pin', error);
      const msg = error?.response?.data?.message || error.message || 'บันทึกหมุดไม่สำเร็จ';
      setMessage({ type: 'error', text: Array.isArray(msg) ? msg.join(', ') : msg });
    }
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
              name="shopName"
              value={shopData.shopName}
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
                  <img src={shopData.coverUrl} alt="cover" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="h-12 w-12 text-[#E07B39] mx-auto mb-3" />
                  <p className="text-sm text-[#9CA3AF] mb-1">อัปโหลดรูปหน้าปก หรือรูปตัวอย่างร้าน</p>
                  <p className="text-xs text-[#9CA3AF]">ควรเป็นรูปแนวนอน</p>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-3">
              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#E07B39] text-[#E07B39] font-medium rounded-full cursor-pointer hover:bg-[#E07B39] hover:text-white transition-all hover:scale-105 shadow-sm">
                <ImageIcon className="h-4 w-4" />
                {uploadingField === 'cover' ? 'กำลังอัปโหลด...' : 'เปลี่ยนรูปหน้าปก'}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('cover', e.target.files?.[0])} disabled={uploadingField === 'cover'} />
              </label>
              {shopData.coverUrl && (
                <button
                  type="button"
                  onClick={() => setShopData(prev => ({ ...prev, coverUrl: '' }))}
                  className="px-5 py-2.5 bg-red-50 text-red-600 font-medium rounded-full hover:bg-red-100 transition-all hover:scale-105"
                >
                  ลบรูป
                </button>
              )}
            </div>
            {uploadingField === 'cover' && (
              <p className="text-xs text-[#E07B39] mt-2">กำลังอัปโหลดรูปหน้าปก กรุณารอสักครู่...</p>
            )}
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

          {/* ที่อยู่ */}
          <div className="animate-fadeIn" style={{animationDelay: '0.45s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-2">📍 ที่อยู่ร้าน</label>
            <textarea
              name="address"
              value={shopData.address}
              onChange={handleChange}
              rows="3"
              placeholder="เช่น บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
              required
            />
            <p className="text-xs text-[#9CA3AF] mt-1">ข้อมูลนี้จะแสดงในหน้าร้านค้าและใช้กับหมุดบนแผนที่</p>
          </div>

          {/* ข้อมูลติดต่อ */}
          <div className="animate-fadeIn" style={{animationDelay: '0.5s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-3">📞 ข้อมูลติดต่อ</label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#9CA3AF] mb-1.5">📱 เบอร์โทรศัพท์</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                  <input
                    type="tel"
                    name="contact.phone"
                    value={shopData.contact.phone}
                    onChange={handleChange}
                    placeholder="เช่น 081-234-5678"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#9CA3AF] mb-1.5">� LINE ID</label>
                <input
                  type="text"
                  name="contact.line"
                  value={shopData.contact.line}
                  onChange={handleChange}
                  placeholder="เช่น @shopname"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-[#9CA3AF] mb-1.5">📘 ชื่อ Facebook</label>
                <input
                  type="text"
                  name="contact.facebook"
                  value={shopData.contact.facebook}
                  onChange={handleChange}
                  placeholder="เช่น ร้านมีนา"
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
                  onClick={handleOpenPinModal}
                  className="mt-2 px-4 py-2 bg-[#4CAF50] text-white rounded-full text-sm font-medium hover:bg-[#45A049] transition-all hover:scale-105"
                >
                  เปิดแผนที่
                </button>
                {selectedPinPosition && (
                  <p className="text-sm text-[#2F4F2F] mt-3">
                    X: {selectedPinPosition.x?.toFixed(1)}% • Y: {selectedPinPosition.y?.toFixed(1)}%
                  </p>
                )}
                {pinStatusMessage && (
                  <p className="text-xs text-[#256029] mt-1">{pinStatusMessage}</p>
                )}
              </div>
            </div>
            <p className="text-xs text-[#6B6B6B] mt-2">ตำแหน่งจะช่วยให้ลูกค้าหาร้านของคุณได้ง่าย ๆ ที่นี่</p>
          </div>

          {/* เวลาทำการ */}
          <div className="animate-fadeIn" style={{animationDelay: '0.7s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-3">🕐 เวลาทำการ</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                  <input
                    type="time"
                    name="openTime"
                    value={shopData.openTime}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-[#9CA3AF]">เวลาเปิด (เว้นว่างหากไม่แน่นอน)</p>
                  {shopData.openTime && (
                    <button
                      type="button"
                      onClick={() => clearTimeField('openTime')}
                      className="text-xs text-[#E07B39] hover:underline"
                    >
                      ล้าง
                    </button>
                  )}
                </div>
              </div>
              <div>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                  <input
                    type="time"
                    name="closeTime"
                    value={shopData.closeTime}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-[#9CA3AF]">เวลาปิด (เว้นว่างหากไม่แน่นอน)</p>
                  {shopData.closeTime && (
                    <button
                      type="button"
                      onClick={() => clearTimeField('closeTime')}
                      className="text-xs text-[#E07B39] hover:underline"
                    >
                      ล้าง
                    </button>
                  )}
                </div>
              </div>
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
      <ShopMapPinModal
        isOpen={isPinModalOpen}
        onClose={() => setPinModalOpen(false)}
        communityId={communityId}
        initialPosition={selectedPinPosition}
        onConfirm={handlePinConfirm}
      />
    </div>
  );
};

export default ShopProfile;
