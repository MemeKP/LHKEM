import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, CheckCircle, Camera, Save, Edit } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const ShopWorkshopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const workshop = useMemo(() => {
    const draft = JSON.parse(localStorage.getItem('shopDraft') || '{}');
    return (draft.workshops || []).find(w => w.id === id) || null;
  }, [id]);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(() => ({
    title: workshop?.title || '',
    description: workshop?.description || '',
    date: workshop?.date || '',
    time: workshop?.time || '',
    location: workshop?.location || '',
    seatLimit: workshop?.seatLimit ?? '',
    price: workshop?.price ?? '',
    categories: Array.isArray(workshop?.categories) ? workshop?.categories : [],
    imageUrl: workshop?.imageUrl || ''
  }));

  const enrollments = useMemo(() => ([
    { id: 'e1', name: 'สมหมาย ใจดี', contact: '081-234-5678', date: '2026-01-10', status: 'ยืนยันแล้ว' },
    { id: 'e2', name: 'สมหญิง รักสุข', contact: 'somying@email.com', date: '2026-01-11', status: 'ยืนยันแล้ว' },
    { id: 'e3', name: 'ประเสริฐ เงินทอง', contact: '089-765-4321', date: '2026-01-12', status: 'ยืนยันแล้ว' },
    { id: 'e4', name: 'วิไล วรยมน', contact: '062-111-2222', date: '2026-01-13', status: 'ยืนยันแล้ว' },
    { id: 'e5', name: 'สุธีย์ เมฆ', contact: '091-333-4444', date: '2026-01-14', status: 'รอตอบรับ' },
  ]), []);

  if (!workshop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  const seatsLeft = Math.max(0, (workshop.seatLimit || 0) - (workshop.seatsBooked || 0));
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const toggleCategory = (c) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(c)
        ? prev.categories.filter(x => x !== c)
        : [...prev.categories, c]
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
  const handleSaveEdit = (e) => {
    e.preventDefault();
    const draft = JSON.parse(localStorage.getItem('shopDraft') || '{}');
    const workshops = Array.isArray(draft.workshops) ? draft.workshops : [];
    const idx = workshops.findIndex(w => w.id === id);
    if (idx !== -1) {
      const updated = {
        ...workshops[idx],
        ...form,
        seatLimit: Number(form.seatLimit || 0),
        price: Number(form.price || 0),
        updatedAt: new Date().toISOString()
      };
      workshops[idx] = updated;
      localStorage.setItem('shopDraft', JSON.stringify({ ...draft, workshops }));
    }
    setEditMode(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 animate-fadeIn">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/shop/dashboard')}
          className="mb-6 text-sm text-gray-600 hover:text-orange-600"
        >
          ← {t('shopWorkshopDetail.back')}
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 animate-slideUp">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                {workshop.imageUrl ? (
                  <img src={workshop.imageUrl} alt={workshop.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-400">{t('shopWorkshopDetail.imagePlaceholder')}</div>
                )}
              </div>
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <h1 className="text-2xl font-bold text-gray-900">{workshop.title}</h1>
                  <button
                    onClick={() => setEditMode(true)}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                  >
                    <Edit className="h-4 w-4" />
                    {t('shopWorkshopDetail.edit')}
                  </button>
                </div>
                <div className="mt-3">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${workshop.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : workshop.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                    {workshop.status === 'ACTIVE' ? t('shopDashboard.status.active') : workshop.status === 'PENDING' ? t('shopDashboard.status.pending') : t('shopDashboard.status.closed')}
                  </span>
                </div>
                <div className="space-y-2 mt-4 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{workshop.date || '-'} {workshop.time || ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{workshop.location || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{workshop.seatsBooked || 0} / {workshop.seatLimit || 0}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div className="text-gray-500 text-sm">{t('shopWorkshopDetail.price')}</div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {Number(workshop.price) === 0 ? t('workshops.free') : `฿${workshop.price}`}
                    </p>
                    <p className="text-xs text-gray-400">{t('shopWorkshopDetail.perPerson')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 animate-stagger">
          <div className="bg-white rounded-lg shadow-sm p-6 animate-scaleIn">
            <p className="text-sm text-gray-600">{t('shopWorkshopDetail.views')}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">42 ครั้ง</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 animate-scaleIn">
            <p className="text-sm text-gray-600">{t('shopWorkshopDetail.totalEnrollments')}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{enrollments.length} คน</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 animate-scaleIn">
            <p className="text-sm text-gray-600">{t('shopWorkshopDetail.seatsLeft')}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{seatsLeft} ที่นั่ง</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 animate-scaleIn">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('shopWorkshopDetail.notifyTitle')}</h2>
          <p className="text-gray-600 mb-4">{t('shopWorkshopDetail.notifyDesc')}</p>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg">{t('shopWorkshopDetail.notifyButton')}</button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 animate-scaleIn">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('shopWorkshopDetail.enrollmentListTitle')}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm text-gray-600">{t('shopWorkshopDetail.table.index')}</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-600">{t('shopWorkshopDetail.table.name')}</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-600">{t('shopWorkshopDetail.table.contact')}</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-600">{t('shopWorkshopDetail.table.date')}</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-600">{t('shopWorkshopDetail.table.status')}</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e, idx) => (
                  <tr key={e.id} className="border-t">
                    <td className="px-4 py-2 text-sm">{idx + 1}</td>
                    <td className="px-4 py-2 text-sm">{e.name}</td>
                    <td className="px-4 py-2 text-sm">{e.contact}</td>
                    <td className="px-4 py-2 text-sm">{e.date}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${e.status === 'ยืนยันแล้ว' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                        <CheckCircle className="h-3 w-3" />
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 animate-scaleIn">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('shopWorkshopDetail.manageTitle')}</h2>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg">{t('shopWorkshopDetail.manageOpen')}</button>
            <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg">{t('shopWorkshopDetail.manageClose')}</button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg">{t('shopWorkshopDetail.manageCancel')}</button>
          </div>
        </div>

        {editMode && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6 animate-slideUp">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('shopWorkshopDetail.editTitle')}</h2>
            <form onSubmit={handleSaveEdit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('shopWorkshopDetail.form.title')}</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">{t('shopWorkshopDetail.form.imageLabel')}</label>
                <div className="relative aspect-video w-full bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt="workshop" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-400">{t('shopWorkshopDetail.form.noImage')}</div>
                  )}
                </div>
                <label className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg cursor-pointer hover:bg-gray-700 w-fit">
                  {t('shopWorkshopDetail.form.upload')}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImagePick(e.target.files?.[0])} />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('shopWorkshopDetail.form.description')}</label>
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
                  placeholder={t('shopWorkshopDetail.form.location')}
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
                    placeholder={t('shopWorkshopDetail.form.seatLimit')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="relative">
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder={t('shopWorkshopDetail.form.priceBaht')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('shopWorkshopDetail.form.categoriesLabel')}</label>
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
                <button type="submit" className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors">
                  <Save className="h-5 w-5 mr-2" />
                  {t('shopWorkshopDetail.form.save')}
                </button>
                <button type="button" onClick={() => setEditMode(false)} className="ml-3 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                  {t('shopWorkshopDetail.form.cancel')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopWorkshopDetail;
