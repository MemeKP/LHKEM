import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Users, Calendar, Plus, X, Image as ImageIcon } from 'lucide-react';

const ShopWorkshopCreate = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [form, setForm] = useState({
    title: '',
    description: '',
    registrationStartDate: '',
    registrationEndDate: '',
    workshopStartTime: '',
    workshopEndTime: '',
    locationType: 'shop', // 'shop' or 'custom'
    customLocation: '',
    seatLimit: '',
    price: '',
    imageUrl: '',
    categories: [],
    activities: [
      { id: 1, title: '', description: '', duration: '' }
    ]
  });

  const toggleCategory = (c) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(c)
        ? prev.categories.filter(x => x !== c)
        : [...prev.categories, c]
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleActivityChange = (id, field, value) => {
    setForm(prev => ({
      ...prev,
      activities: prev.activities.map(a => 
        a.id === id ? { ...a, [field]: value } : a
      )
    }));
  };

  const addActivity = () => {
    setForm(prev => ({
      ...prev,
      activities: [...prev.activities, { id: Date.now(), title: '', description: '', duration: '' }]
    }));
  };

  const removeActivity = (id) => {
    setForm(prev => ({
      ...prev,
      activities: prev.activities.filter(a => a.id !== id)
    }));
  };

  const handleImagePick = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, imageUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const draft = JSON.parse(localStorage.getItem('shopDraft') || '{}');
      const newWorkshop = {
        id: `wk-${Date.now()}`,
        ...form,
        seatLimit: Number(form.seatLimit || 0),
        price: Number(form.price || 0),
        seatsBooked: 0,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };
      const workshops = Array.isArray(draft.workshops) ? draft.workshops : [];
      const updated = { ...draft, workshops: [newWorkshop, ...workshops] };
      localStorage.setItem('shopDraft', JSON.stringify(updated));
      localStorage.setItem('shopHasSetup', 'true');
      setMessage({ type: 'success', text: 'สร้าง Workshop สำเร็จ' });
      navigate(`/${slug}/shop/dashboard`);
    } catch {
      setMessage({ type: 'error', text: 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง' });
    } finally {
      setSaving(false);
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
          <h1 className="text-3xl md:text-4xl font-bold text-[#2F4F2F] mb-3">สร้าง Workshop ของคุณ</h1>
          <p className="text-[#6B6B6B] text-base">บอกเล่าให้กับคนรู้ว่า Workshop นี้ทำอะไร</p>
        </div>

        {message.text && (
          <div
            className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-6 border border-gray-100 animate-slideUp" style={{animationDelay: '0.1s'}}>
          {/* Workshop Title */}
          <div className="animate-fadeIn" style={{animationDelay: '0.2s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-2">ชื่อ Workshop</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="เช่น ทดลองสานตะกร้าไม้ไผ่แบบดั้งเดิม"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Workshop Image */}
          <div className="animate-fadeIn" style={{animationDelay: '0.3s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-2">รูปภาพ Workshop</label>
            <div className="border-2 border-dashed border-[#E07B39] rounded-xl p-8 bg-[#FFF7ED] hover:bg-[#FFEDD5] transition-colors">
              {form.imageUrl ? (
                <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                  <img src={form.imageUrl} alt="workshop" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="h-12 w-12 text-[#E07B39] mx-auto mb-3" />
                  <p className="text-sm text-[#6B6B6B] mb-1">อัปโหลดรูปภาพ Workshop</p>
                  <p className="text-xs text-[#9CA3AF]">รองรับไฟล์ JPG, PNG</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#E07B39] text-[#E07B39] font-medium rounded-full cursor-pointer hover:bg-[#E07B39] hover:text-white transition-all hover:scale-105 shadow-sm">
                <ImageIcon className="h-4 w-4" />
                เลือกรูปภาพ
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImagePick(e.target.files?.[0])} />
              </label>
              {form.imageUrl && (
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, imageUrl: '' }))}
                  className="px-5 py-2.5 bg-red-50 text-red-600 font-medium rounded-full hover:bg-red-100 transition-all hover:scale-105"
                >
                  ลบรูป
                </button>
              )}
            </div>
          </div>

          {/* Workshop Description */}
          <div className="animate-fadeIn" style={{animationDelay: '0.4s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-2">คำอธิบาย Workshop</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="อธิบายรายละเอียด Workshop ของคุณ เช่น สิ่งที่จะได้เรียนรู้ กิจกรรมที่จะทำ"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Registration Period */}
          <div className="animate-fadeIn" style={{animationDelay: '0.5s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-3">📅 ระยะเวลาการลงทะเบียน</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#6B6B6B] mb-1.5">วันที่เปิดรับลงทะเบียน</label>
                <input
                  type="date"
                  name="registrationStartDate"
                  value={form.registrationStartDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6B6B6B] mb-1.5">วันที่ปิดรับลงทะเบียน</label>
                <input
                  type="date"
                  name="registrationEndDate"
                  value={form.registrationEndDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Workshop Time */}
          <div className="animate-fadeIn" style={{animationDelay: '0.6s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-3">⏰ ช่วงเวลาทำ Workshop</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#6B6B6B] mb-1.5">เวลาเริ่มกิจกรรม</label>
                <input
                  type="time"
                  name="workshopStartTime"
                  value={form.workshopStartTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6B6B6B] mb-1.5">เวลาสิ้นสุดกิจกรรม</label>
                <input
                  type="time"
                  name="workshopEndTime"
                  value={form.workshopEndTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="animate-fadeIn" style={{animationDelay: '0.7s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-3">📍 สถานที่</label>
            <div className="space-y-3">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="locationType"
                    value="shop"
                    checked={form.locationType === 'shop'}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#E07B39] border-gray-300 focus:ring-[#E07B39]"
                  />
                  <span className="text-sm text-[#3D3D3D]">ใช้สถานที่ร้าน</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="locationType"
                    value="custom"
                    checked={form.locationType === 'custom'}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#E07B39] border-gray-300 focus:ring-[#E07B39]"
                  />
                  <span className="text-sm text-[#3D3D3D]">ระบุสถานที่เอง</span>
                </label>
              </div>
              {form.locationType === 'custom' && (
                <div>
                  <input
                    type="text"
                    name="customLocation"
                    value={form.customLocation}
                    onChange={handleChange}
                    placeholder="ระบุสถานที่จัด Workshop"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Seat Limit */}
          <div className="animate-fadeIn" style={{animationDelay: '0.8s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-3">👥 จำนวนที่รับ</label>
            <div>
              <label className="block text-xs text-[#6B6B6B] mb-1.5">จำนวนที่นั่ง</label>
              <input
                type="number"
                name="seatLimit"
                value={form.seatLimit}
                onChange={handleChange}
                placeholder="เช่น 20"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Price */}
          <div className="animate-fadeIn" style={{animationDelay: '0.9s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-3">💰 ค่าสมัคร</label>
            <div>
              <label className="block text-xs text-[#6B6B6B] mb-1.5">ราคา</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="฿0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] focus:border-transparent transition-all"
              />
              <p className="text-xs text-[#9CA3AF] mt-1.5">ใส่ 0 ถ้าเป็น Workshop ฟรี</p>
            </div>
          </div>

          {/* Workshop Atmosphere */}
          <div className="animate-fadeIn" style={{animationDelay: '1.1s'}}>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-3">บรรยากาศ Workshop</label>
            <div className="grid grid-cols-2 gap-3">
              {['ไม่ต้องมีพื้นฐาน', 'งานทำมือพื้นฐาน', 'ทำงานร่วมกัน/กลุ่มเล็ก', 'ชวนเพื่อน/ครอบครัว'].map((c) => (
                <label key={c} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={form.categories.includes(c)}
                    onChange={() => toggleCategory(c)}
                    className="w-4 h-4 text-[#E07B39] border-gray-300 rounded focus:ring-[#E07B39]"
                  />
                  <span className="text-sm text-gray-700">{c}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 animate-fadeIn" style={{animationDelay: '1.2s'}}>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 bg-[#E07B39] hover:bg-[#D66B29] text-white font-semibold rounded-full transition-all disabled:opacity-60 shadow-md hover:shadow-lg hover:scale-[1.02] transform"
            >
              {saving ? 'กำลังบันทึก...' : 'สร้าง Workshop'}
            </button>
            <p className="text-center text-xs text-[#6B6B6B] mt-3">
              Workshop จะถูกส่งไปยังแอดมินเพื่อตรวจสอบก่อนเผยแพร่
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopWorkshopCreate;
