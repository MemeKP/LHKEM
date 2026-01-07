import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, DollarSign, Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';

/**
 * Event List Page - แสดงรายการ Event ทั้งหมดของชุมชน
 * 
 * TODO: Backend APIs needed:
 * - GET /api/events?community_id=xxx - ดึงรายการ Event ทั้งหมด
 * - DELETE /api/events/:id - ลบ Event
 */

const EventList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // TODO: Fetch from API - GET /api/events?community_id=xxx
  // Mock data for Events
  const events = [
    {
      id: '1',
      title: 'งานลอยกระทงโหล่งฮิมคาว 2567',
      description: 'ร่วมงานประเพณีลอยกระทงริมแม่น้ำคาว พร้อมกิจกรรมสาธิตงานฝีมือ การแสดงดนตรีพื้นบ้าน และตลาดนัดชุมชน',
      location: 'ริมแม่น้ำคาว โหล่งฮิมคาว',
      start_at: new Date('2024-11-15T18:00:00'),
      end_at: new Date('2024-11-15T22:00:00'),
      seat_limit: 200,
      deposit_amount: 0,
      status: 'OPEN',
      is_featured: true,
      is_pinned: true,
      registered: 145
    },
    {
      id: '2',
      title: 'ตลาดนัดหัตถกรรมล้านนา',
      description: 'ตลาดนัดรวมผลิตภัณฑ์งานฝีมือจากช่างฝีมือในชุมชน พร้อมสาธิตการทำงานและจำหน่ายสินค้าราคาพิเศษ',
      location: 'ลานกิจกรรมโหล่งฮิมคาว',
      start_at: new Date('2024-02-10T08:00:00'),
      end_at: new Date('2024-02-10T16:00:00'),
      seat_limit: 150,
      deposit_amount: 0,
      status: 'OPEN',
      is_featured: false,
      is_pinned: false,
      registered: 87
    },
    {
      id: '3',
      title: 'เทศกาลอาหารพื้นบ้านล้านนา',
      description: 'ชิมอาหารพื้นบ้านล้านนาต้นตำรับจากครัวคุณยาย พร้อมสาธิตการทำอาหารและเรียนรู้เคล็ดลับสูตรโบราณ',
      location: 'ครัวคุณยายสมบูรณ์',
      start_at: new Date('2024-03-20T10:00:00'),
      end_at: new Date('2024-03-20T15:00:00'),
      seat_limit: 80,
      deposit_amount: 100,
      status: 'OPEN',
      is_featured: true,
      is_pinned: false,
      registered: 62
    },
    {
      id: '4',
      title: 'Workshop ย้อมผ้าครามสำหรับเด็ก',
      description: 'กิจกรรมสอนเด็กๆ เรียนรู้การย้อมผ้าครามแบบง่ายๆ สนุกสนาน เหมาะสำหรับครอบครัว',
      location: 'บ้านครามโหล่งฮิมคาว',
      start_at: new Date('2024-01-05T09:00:00'),
      end_at: new Date('2024-01-05T12:00:00'),
      seat_limit: 30,
      deposit_amount: 50,
      status: 'CLOSED',
      is_featured: false,
      is_pinned: false,
      registered: 30
    }
  ];

  const statusOptions = [
    { value: 'all', label: 'ทั้งหมด' },
    { value: 'OPEN', label: 'เปิดรับสมัคร' },
    { value: 'CLOSED', label: 'ปิดรับสมัคร' },
    { value: 'CANCELLED', label: 'ยกเลิก' }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (eventId) => {
    if (!confirm('คุณต้องการลบ Event นี้ใช่หรือไม่?')) return;
    
    try {
      // TODO: Call API - DELETE /api/events/:id
      console.log('Deleting event:', eventId);
      alert('ลบ Event สำเร็จ!');
      // Refresh list
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('เกิดข้อผิดพลาดในการลบ Event');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">กิจกรรมของชุมชน</h1>
              <p className="text-gray-600 mt-1">จัดการและดูรายละเอียด Event ทั้งหมด</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/community-admin/dashboard')}
                className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors"
              >
                กลับหน้าหลัก
              </button>
              <button
                onClick={() => navigate('/community-admin/events/create')}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5" />
                สร้าง Event ใหม่
              </button>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อ Event หรือสถานที่..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">ไม่พบ Event</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'all' 
                ? 'ไม่พบ Event ที่ตรงกับเงื่อนไขการค้นหา'
                : 'ยังไม่มี Event ในชุมชน'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Event Image */}
                <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-200 relative">
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="h-16 w-16 text-orange-300" />
                  </div>
                  
                  {/* Status Badges */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {event.is_pinned && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                        ปักหมุด
                      </span>
                    )}
                    {event.is_featured && (
                      <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                        แนะนำ
                      </span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      event.status === 'OPEN' 
                        ? 'bg-green-100 text-green-800' 
                        : event.status === 'CLOSED'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {event.status === 'OPEN' ? 'เปิดรับสมัคร' : event.status === 'CLOSED' ? 'ปิดรับสมัคร' : 'ยกเลิก'}
                    </span>
                  </div>
                </div>

                {/* Event Info */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                  {/* Event Details */}
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-start gap-2 text-gray-600">
                      <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{new Date(event.start_at).toLocaleDateString('th-TH', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</p>
                        <p className="text-xs">
                          {new Date(event.start_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                          {' - '}
                          {new Date(event.end_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{event.registered}/{event.seat_limit}</span>
                      </div>
                      {event.deposit_amount > 0 && (
                        <div className="flex items-center gap-1 text-orange-600 font-medium">
                          <DollarSign className="h-4 w-4" />
                          <span>฿{event.deposit_amount}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/community-admin/events/${event.id}`)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      ดูรายละเอียด
                    </button>
                    <button
                      onClick={() => navigate(`/community-admin/events/${event.id}/edit`)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {filteredEvents.length > 0 && (
          <div className="mt-8 text-center text-gray-600">
            แสดง {filteredEvents.length} Event จากทั้งหมด {events.length} รายการ
          </div>
        )}
      </div>
    </div>
  );
};

export default EventList;
