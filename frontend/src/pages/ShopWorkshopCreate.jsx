import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, MapPin, Clock, Users } from 'lucide-react';

const ShopWorkshopCreate = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    seatLimit: '',
    price: '',
    categories: []
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">สร้าง Workshop ของคุณ</h1>
        <p className="text-gray-600 mb-6">บอกเล่าให้กับคนรู้ว่า Workshop นี้ทำอะไร</p>

        {message.text && (
          <div
            className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ Workshop</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="เช่น ย้อมผ้าธรรมชาติ"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">คำอธิบาย</label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="สถานที่จัด"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">บรรยากาศ Workshop (ตัวเลือก)</label>
            <div className="space-y-2 bg-green-50 p-4 rounded-lg">
              {['ไม่ต้องมีพื้นฐาน', 'งานทำมือพื้นฐาน', 'ทำงานร่วมกัน/กลุ่มเล็ก', 'ชวนเพื่อน/ครอบครัว'].map((c) => (
                <label key={c} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.categories.includes(c)}
                    onChange={() => toggleCategory(c)}
                  />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60"
            >
              <Save className="h-5 w-5 mr-2" />
              สร้าง Workshop
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopWorkshopCreate;
