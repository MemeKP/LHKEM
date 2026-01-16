import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, MapPin, Clock, Users, Camera, Calendar, Plus, X } from 'lucide-react';

const ShopWorkshopCreate = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '',
    location: '',
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
      navigate('/shop/dashboard');
    } catch {
      setMessage({ type: 'error', text: 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง' });
    } finally {
      setSaving(false);
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">สร้าง Workshop ของคุณ</h1>
          <p className="text-gray-600">บอกเล่าให้กับคนรู้ว่า Workshop นี้ทำอะไร</p>
        </div>

        {message.text && (
          <div
            className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-8 border border-gray-100">
          {/* Workshop Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ Workshop</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="เช่น ทดลองสานตะกร้าไม้ไผ่แบบดั้งเดิม"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Workshop Image */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">รูปภาพ Workshop</label>
            <div className="relative aspect-video w-full bg-orange-50 border-2 border-dashed border-orange-300 rounded-xl overflow-hidden flex items-center justify-center">
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="workshop" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-orange-600">
                  <Camera className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">อัปโหลดรูปภาพ Workshop</p>
                  <p className="text-xs text-gray-500 mt-1">รองรับไฟล์ JPG, PNG</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg cursor-pointer hover:bg-orange-600 shadow-sm transition-colors">
                <Camera className="h-4 w-4" />
                เลือกรูปภาพ
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImagePick(e.target.files?.[0])} />
              </label>
              {form.imageUrl && (
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, imageUrl: '' }))}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  ลบรูป
                </button>
              )}
            </div>
          </div>

          {/* Workshop Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">คำอธิบาย Workshop</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="อธิบายรายละเอียด Workshop ของคุณ เช่น สิ่งที่จะได้เรียนรู้ กิจกรรมที่จะทำ"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Date, Time, Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">📅 เวลาจัด</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">วันที่จัด</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">เวลาเริ่ม</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="time"
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">ระยะเวลา (นาที)</label>
                <input
                  type="number"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="180"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">📍 สถานที่</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="ใส่สถานที่จัด"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Capacity & Price */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="number"
                name="seatLimit"
                value={form.seatLimit}
                onChange={handleChange}
                placeholder="จำนวนที่นั่ง"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="relative">
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="ราคา (บาท)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Activity Schedule Section */}
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">ประกอบกิจกรรม (ทำอะไรบ้าง)</h3>
                <p className="text-sm text-gray-600 mt-1">บอกรายละเอียดกิจกรรมที่จะทำใน Workshop</p>
              </div>
              <button
                type="button"
                onClick={addActivity}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                เพิ่ม
              </button>
            </div>
            
            <div className="space-y-4">
              {form.activities.map((activity, index) => (
                <div key={activity.id} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        value={activity.title}
                        onChange={(e) => handleActivityChange(activity.id, 'title', e.target.value)}
                        placeholder="ชื่อกิจกรรม เช่น แนะนำเครื่องมือและวัสดุ"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    {form.activities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeActivity(activity.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <textarea
                    value={activity.description}
                    onChange={(e) => handleActivityChange(activity.id, 'description', e.target.value)}
                    placeholder="รายละเอียดกิจกรรม"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
                  />
                  <input
                    type="text"
                    value={activity.duration}
                    onChange={(e) => handleActivityChange(activity.id, 'duration', e.target.value)}
                    placeholder="ระยะเวลา เช่น 30 นาที"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Workshop Atmosphere */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">บรรยากาศ Workshop</label>
            <div className="grid grid-cols-2 gap-3">
              {['ไม่ต้องมีพื้นฐาน', 'งานทำมือพื้นฐาน', 'ทำงานร่วมกัน/กลุ่มเล็ก', 'ชวนเพื่อน/ครอบครัว'].map((c) => (
                <label key={c} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={form.categories.includes(c)}
                    onChange={() => toggleCategory(c)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">{c}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-8 py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all disabled:opacity-60 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Save className="h-5 w-5 mr-2" />
              {saving ? 'กำลังบันทึก...' : 'สร้าง Workshop'}
            </button>
          </div>
          
          <p className="text-center text-xs text-gray-500">
            Workshop จะถูกส่งไปยังแอดมินเพื่อตรวจสอบก่อนเผยแพร่
          </p>
        </form>
      </div>
    </div>
  );
};

export default ShopWorkshopCreate;
