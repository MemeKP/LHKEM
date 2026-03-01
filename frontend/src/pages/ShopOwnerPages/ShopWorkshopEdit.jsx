import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Users, Calendar, Plus, X, AlertCircle, Image as ImageIcon, Camera } from 'lucide-react';

import Swal from 'sweetalert2';
import { useMyShop } from '../../hooks/useMyShop';
import ShopPendingApprovalNotice from '../../components/ShopPendingApprovalNotice';
import api from '../../services/api'; // ADDED: API import

const WORKSHOP_CATEGORY_OPTIONS = [
  { value: 'งานฝีมือ', label: 'งานฝีมือ (Crafts)' },
  { value: 'ศิลปะ', label: 'ศิลปะ (Art)' },
  { value: 'อาหาร', label: 'อาหาร (Cooking)' },
  { value: 'วัฒนธรรม', label: 'วัฒนธรรม (Culture)' },
];

const ShopWorkshopEdit = () => {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const { data: shop, isLoading: shopLoading } = useMyShop();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: '',
    description: '',
    registrationStartDate: '',
    registrationEndDate: '',
    workshopDate: '',
    workshopStartTime: '',
    workshopEndTime: '',
    locationType: 'shop',
    customLocation: '',
    seatLimit: '',
    price: '',
    imageUrl: '',
    category: 'งานฝีมือ',
    categories: [],
    activities: [
      { id: 1, title: '', description: '', duration: '' }
    ]
  });

  const toDateInputValue = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  // FIX 1: Fetch real data from Backend instead of localStorage
  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        setLoading(true);
        // Using the management route to see PENDING workshops
        const res = await api.get(`/management/workshops/${id}`);
        const workshop = res.data?.data || res.data;

        if (workshop) {
          const resolvedWorkshopDate = workshop.workshopDate || workshop.date;
          setForm({
            title: workshop.title || '',
            description: workshop.description || '',
            registrationStartDate: workshop.startDate || '',
            registrationEndDate: workshop.endDate || '',
            workshopDate: toDateInputValue(resolvedWorkshopDate),
            workshopStartTime: workshop.startTime || '',
            workshopEndTime: workshop.endTime || '',
            locationType: workshop.locationType || 'shop',
            customLocation: workshop.customLocation || '',
            seatLimit: workshop.capacity || '', // Map capacity to seatLimit
            price: workshop.price || '',
            imageUrl: workshop.image || '', // Map image to imageUrl
            category: workshop.category || 'งานฝีมือ',
            categories: workshop.categories || [],
            activities: workshop.activities || [{ id: 1, title: '', description: '', duration: '' }]
          });
        }
      } catch (error) {
        console.error("Failed to load workshop:", error);
        Swal.fire({
          icon: 'error',
          title: 'โหลดข้อมูลไม่สำเร็จ',
          text: 'ไม่สามารถโหลดข้อมูลเวิร์กชอปได้ กรุณาลองใหม่',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchWorkshop();
  }, [id]);

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

  const handleActivityChange = (activityId, field, value) => {
    setForm(prev => ({
      ...prev,
      activities: prev.activities.map(a => 
        a.id === activityId ? { ...a, [field]: value } : a
      )
    }));
  };

  const handleLocationRadioChange = (nextType) => {
    setForm(prev => ({
      ...prev,
      locationType: nextType,
      customLocation: nextType === 'custom' ? prev.customLocation : ''
    }));
  };

  const addActivity = () => {
    setForm(prev => ({
      ...prev,
      activities: [...prev.activities, { id: Date.now(), title: '', description: '', duration: '' }]
    }));
  };

  const removeActivity = (activityId) => {
    setForm(prev => ({
      ...prev,
      activities: prev.activities.filter(a => a.id !== activityId)
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

  // FIX 2: Updated handleSubmit to send PATCH to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    Swal.fire({
      title: 'กำลังบันทึกการแก้ไข...',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const sanitizedCustomLocation = form.customLocation.trim();
      const eventDateIso = form.workshopDate
        ? new Date(`${form.workshopDate}T${form.workshopStartTime || '00:00'}:00`).toISOString()
        : new Date().toISOString();

      const payload = {
        title: form.title,
        description: form.description,
        startDate: form.registrationStartDate,
        endDate: form.registrationEndDate,
        workshopDate: form.workshopDate,
        startTime: form.workshopStartTime,
        endTime: form.workshopEndTime,
        locationType: form.locationType,
        customLocation: form.locationType === 'custom' ? sanitizedCustomLocation : '',
        capacity: Number(form.seatLimit), // Mapping back to backend schema
        price: Number(form.price),
        image: form.imageUrl, // Mapping back to backend schema
        category: form.category || 'งานฝีมือ',
        categories: form.categories,
        activities: form.activities,
        
        // CRITICAL REQUIREMENT: Reset status to PENDING on every edit
        approvalStatus: 'PENDING',
        
        // Update the main date field used for listing
        date: eventDateIso
      };

      // Ensure no /api prefix in URL
      await api.patch(`/management/workshops/${id}`, payload);

      Swal.close();
      await Swal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ',
        text: 'ส่งข้อมูลให้แอดมินตรวจสอบแล้ว',
      });

      navigate(`/${slug}/shop/dashboard`);

    } catch (error) {
      const errorMsg = error.response?.data?.message || 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง';
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'บันทึกไม่สำเร็จ',
        text: Array.isArray(errorMsg) ? errorMsg[0] : errorMsg,
      });
    } finally {
      setSaving(false);
    }
  };

  if (shopLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (shop && shop.status !== 'ACTIVE') {
    return (
      <ShopPendingApprovalNotice
        title="ร้านค้าของคุณยังรอการอนุมัติ"
        description="ไม่สามารถแก้ไข Workshop ได้จนกว่าร้านค้าจะได้รับการอนุมัติจากแพลตฟอร์ม"
        actions={[
          {
            label: 'กลับไปแดชบอร์ด',
            onClick: () => navigate(`/${slug}/shop/dashboard`),
            variant: 'secondary',
          },
          {
            label: 'แก้ไขข้อมูลร้าน',
            onClick: () => navigate(`/${slug}/shop/profile`),
            variant: 'primary',
          },
        ]}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F5EFE7] py-12 animate-fadeIn">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(`/${slug}/shop/workshops/${id}`)}
          className="mb-6 flex items-center gap-2 text-sm text-[#6B6B6B] hover:text-[#E07B39] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับ
        </button>
        
        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2F4F2F] mb-3">แก้ไขรายละเอียด Workshop</h1>
          <p className="text-[#6B6B6B] text-base">คุณสามารถแก้ไขข้อมูล Workshop ของคุณได้ตามต้องการ</p>
          <p className="text-sm text-red-500 font-medium mt-1">⚠️ เมื่อบันทึกแล้ว สถานะจะกลับเป็น "รออนุมัติ" เพื่อให้แอดมินตรวจสอบใหม่</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-6 border border-gray-100 animate-slideUp">
          
          {/* Form Fields - Same as Create but now wired to real state */}
          
          <div>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-2">ชื่อ Workshop</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] transition-all"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">รูปภาพ Workshop</label>
            <div className="relative aspect-video w-full bg-orange-50 border-2 border-dashed border-orange-300 rounded-xl overflow-hidden flex items-center justify-center">
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="workshop" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-orange-600">
                  <Camera className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">อัปโหลดรูปภาพ Workshop</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg cursor-pointer hover:bg-orange-600 shadow-sm transition-colors">
                <Camera className="h-4 w-4" />
                เปลี่ยนรูปภาพ
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImagePick(e.target.files?.[0])} />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-3">หมวดหมู่หลักของ Workshop</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {WORKSHOP_CATEGORY_OPTIONS.map(option => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${form.category === option.value ? 'border-[#E07B39] bg-[#FFF7ED]' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={option.value}
                    checked={form.category === option.value}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#E07B39] border-gray-300 focus:ring-[#E07B39]"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-2">คำอธิบาย Workshop</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07B39] transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#6B6B6B] mb-1.5">วันที่เปิดรับลงทะเบียน</label>
                <input
                  type="date"
                  name="registrationStartDate"
                  value={form.registrationStartDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E07B39] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-[#6B6B6B] mb-1.5">วันที่ปิดรับลงทะเบียน</label>
                <input
                  type="date"
                  name="registrationEndDate"
                  value={form.registrationEndDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E07B39] outline-none"
                />
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#6B6B6B] mb-1.5">เวลาเริ่มกิจกรรม</label>
              <input
                type="time"
                name="workshopStartTime"
                value={form.workshopStartTime}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E07B39] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-[#6B6B6B] mb-1.5">เวลาสิ้นสุดกิจกรรม</label>
              <input
                type="time"
                name="workshopEndTime"
                value={form.workshopEndTime}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E07B39] outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-3">📆 วันที่จัด Workshop</label>
            <input
              type="date"
              name="workshopDate"
              value={form.workshopDate}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E07B39] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-3">📍 สถานที่</label>
            <div className="space-y-3">
              <div className="flex gap-4 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="locationType"
                    value="shop"
                    checked={form.locationType === 'shop'}
                    onChange={() => handleLocationRadioChange('shop')}
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
                    onChange={() => handleLocationRadioChange('custom')}
                    className="w-4 h-4 text-[#E07B39] border-gray-300 focus:ring-[#E07B39]"
                  />
                  <span className="text-sm text-[#3D3D3D]">ระบุสถานที่เอง</span>
                </label>
              </div>
              {form.locationType === 'custom' && (
                <input
                  type="text"
                  name="customLocation"
                  value={form.customLocation}
                  onChange={handleChange}
                  placeholder="ระบุสถานที่จัด Workshop"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E07B39] outline-none"
                  required
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#6B6B6B] mb-1.5">ราคา (บาท)</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E07B39] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-[#6B6B6B] mb-1.5">จำนวนที่นั่ง</label>
                <input
                  type="number"
                  name="seatLimit"
                  value={form.seatLimit}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E07B39] outline-none"
                  required
                />
              </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#3D3D3D] mb-3">บรรยากาศ Workshop</label>
            <div className="grid grid-cols-2 gap-3">
              {['ไม่ต้องมีพื้นฐาน', 'งานทำมือพื้นฐาน', 'ทำงานร่วมกัน/กลุ่มเล็ก', 'ชวนเพื่อน/ครอบครัว'].map(option => (
                <label key={option} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={form.categories.includes(option)}
                    onChange={() => toggleCategory(option)}
                    className="w-4 h-4 text-[#E07B39] border-gray-300 rounded focus:ring-[#E07B39]"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(`/${slug}/shop/workshops/${id}`)}
              className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3.5 bg-[#E07B39] hover:bg-[#D66B29] text-white font-semibold rounded-full transition-all disabled:opacity-60 shadow-md transform hover:scale-[1.01]"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopWorkshopEdit;