import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Store, Users, Calendar, TrendingUp, AlertCircle, CheckCircle, Edit, XCircle, UserPlus } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip, LabelList } from 'recharts';
import api from '../../services/api';
import { useQuery } from '@tanstack/react-query';
import Swal from 'sweetalert2';


const fetchCommunityDetail = async (id) => {
  const res = await api.get(`/api/platform-admin/communities/${id}`);
  return res.data;
};

const PlatformCommunityDetail = () => {
  const { ct } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [community, setCommunity] = useState(null);
  const [formData, setFormData] = useState({
    admins: [],
    admin_email: '',
    workshopApproval: true
  });


  const { data: communities, isLoading, error, refetch } = useQuery({
    queryKey: ['platform-community', id],
    queryFn: () => fetchCommunityDetail(id),
    enabled: !!id,
  });

  const handleCloseCommunity = async () => {
    const result = await Swal.fire({
      title: 'คุณแน่ใจไหม?',
      text: "การลบนี้ไม่สามารถกู้คืนได้! ข้อมูลร้านค้าและกิจกรรมทั้งหมดในชุมชนนี้อาจได้รับผลกระทบ",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ปิดเลย!',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        await api.patch(`/api/communities/${id}/close`);

        await Swal.fire(
          'ปิดสำเร็จ!',
          'ชุมชนถูกปิดเรียบร้อยแล้ว',
          'success'
        );

        navigate('/platform-admin/dashboard');

      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'ไม่สามารถลบชุมชนได้', 'error');
      }
    }
  };

  const handleAddAdmin = async () => {
    const { value: email } = await Swal.fire({
      title: ct('เพิ่มผู้ดูแล', 'Add Community Admin'),
      input: 'email',
      inputLabel: ct('กรุณาระบุอีเมลของผู้ใช้งาน', 'Enter user email address'),
      inputPlaceholder: 'user@example.com',
      showCancelButton: true,
      confirmButtonText: ct('เพิ่ม', 'Add'),
      cancelButtonText: ct('ยกเลิก', 'Cancel'),
      confirmButtonColor: '#16a34a',
      showLoaderOnConfirm: true, 
      preConfirm: async (email) => {
        try {
          await api.post(`/api/communities/${id}/admins`, { 
            email
          });
          return email;
        } catch (error) {
          Swal.showValidationMessage(
            error.response?.data?.message || 'ไม่สามารถเพิ่มผู้ดูแลได้'
          );
        }
      }
    });
    if (email) {
      await Swal.fire({
        icon: 'success',
        title: ct('สำเร็จ', 'Success'),
        text: ct(`เพิ่ม ${email} เรียบร้อยแล้ว`, `Added ${email} successfully`),
        timer: 1500,
        showConfirmButton: false
      });
      
      refetch(); 
    }
};

const handleDeleteAdmin = async (adminId, adminEmail) => {
    const result = await Swal.fire({
      title: 'คุณแน่ใจไหม?',
      text: `ต้องการลบสิทธิ์ผู้ดูแลของ ${adminEmail} ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', 
      cancelButtonColor: '#6b7280', 
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/communities/${id}/admins/${adminId}`);

        await Swal.fire(
          'ลบสำเร็จ!',
          'ผู้ใช้งานถูกลบสิทธิ์เรียบร้อยแล้ว',
          'success'
        );
        refetch();
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'ไม่สามารถลบผู้ดูแลได้', 'error');
      }
    }
  };

  useEffect(() => {
    if (communities) {
      setCommunity(communities);
      setFormData(prev => ({
        ...prev,
        admins: communities.admins?.map(a => a.email) || []
      }));
    }
  }, [communities]);

  const StatCard = ({ icon: Icon, value, label, sublabel, color = 'orange' }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color === 'green' ? 'bg-green-50' : 'bg-orange-50'}`}>
          <Icon className={`h-5 w-5 ${color === 'green' ? 'text-green-600' : 'text-orange-500'}`} />
        </div>
      </div>
      <p className={`text-3xl font-extrabold ${color === 'green' ? 'text-green-600' : 'text-orange-500'}`}>
        {value}
      </p>
      <p className="text-lg font-bold text-gray-900 mt-1">{label}</p>
      {sublabel && <p className="text-sm font-bold text-gray-500 mt-0.5">{sublabel}</p>}
    </div>
  );
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF8F3]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mb-4"></div>
          <p className="text-lg font-bold text-gray-700">{ct('กำลังโหลด...', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF8F3]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mb-4"></div>
          <p className="text-lg font-bold text-gray-700">{ct('เกิดข้อผิดพลาด', 'Error loading community')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5EFE7] animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/platform-admin/dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-lg font-bold">{ct('กลับไปหน้าแดชบอร์ด', 'Back to Dashboard')}</span>
        </button>

        {/* Community Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900">{communities.name}</h1>
                {communities.is_active ? (
                  <span className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-full">
                    {ct('กำลังดำเนินการ', 'Active')}
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-700 text-sm font-bold px-3 py-1 rounded-full">
                    {ct('ปิดใช้งาน', 'Closed')}
                  </span>
                )}
              </div>
              <div className="flex items-center text-lg font-bold text-gray-600 mb-3">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{communities.location}</span>
              </div>
              <p className="text-base font-bold text-gray-600 max-w-3xl">{communities.hero_section}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                onClick={() => navigate(`/platform-admin/communities/${id}/edit`)}
                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-base font-bold px-4 py-3 rounded-lg transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>{ct('แก้ไข Community', 'Edit Community')}</span>
              </button>
              <button onClick={handleCloseCommunity} className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white text-base font-bold px-4 py-3 rounded-lg transition-colors">
                <XCircle className="h-4 w-4" />
                <span>{ct('ปิด Community', 'Close Community')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <StatCard
            icon={Store}
            value={`${communities.stats.shops.current}/${communities.stats.shops.total}`}
            label={ct('ร้าน Shop', 'Shops')}
            sublabel={ct('ทั้งหมด', 'Total')}
            color="green"
          />
          <StatCard
            icon={Users}
            value={communities.stats.admins}
            label={ct('Community Admin', 'Community Admin')}
            sublabel={ct('ผู้ดูแล', 'Admins')}
            color="orange"
          />
          <StatCard
            icon={Calendar}
            value={communities.stats.workshopsAndEventsCount}
            label={ct('Workshop / Event', 'Workshop / Event')}
            sublabel={ct('กิจกรรมทั้งหมด', 'Total Events')}
            color="orange"
          />
          <StatCard
            icon={Users}
            value={communities.stats.participants}
            label={ct('ผู้เข้าร่วมทั้งหมด', 'Total Participants')}
            sublabel={ct('สมาชิก', 'Members')}
            color="orange"
          />
          <StatCard
            icon={TrendingUp}
            value={communities.stats.growth}
            label={ct('แนวโน้มการเติบโต', 'Growth Trend')}
            sublabel={ct('ต่อเดือน', 'Per Month')}
            color="green"
          />
        </div>



        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Shops Table */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-4">{ct('ร้านใน Community นี้', 'Shops in Community')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-base font-bold text-gray-900 pb-3">{ct('ชื่อร้าน', 'Shop')}</th>
                    <th className="text-center text-base font-bold text-gray-900 pb-3">{ct('Workshop', 'Workshop')}</th>
                    <th className="text-center text-base font-bold text-gray-900 pb-3">{ct('ผู้เข้าร่วม', 'Members')}</th>
                    <th className="text-center text-base font-bold text-gray-900 pb-3">{ct('สถานะ', 'Status')}</th>
                    <th className="text-center text-base font-bold text-gray-900 pb-3">{ct('แอคชั่น', 'Action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {communities.shopsList.map((shop, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 text-base font-bold text-gray-900">{shop.name}</td>
                      <td className="py-3 text-base font-bold text-orange-600 text-center">{shop.workshops}</td>
                      <td className="py-3 text-base font-bold text-gray-900 text-center">{shop.members}</td>
                      <td className="py-3 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${shop.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                          {shop.status === 'active' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => navigate(`/platform-admin/communities/${id}/shops/${shop.id}/approval`)}
                          className="text-green-600 hover:text-green-700 text-base font-bold"
                        >
                          {ct('ดูข้อมูล', 'View')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Workshop & Event */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-4">{ct('Workshop & Event', 'Workshop & Event')}</h2>
            <div className="space-y-3">
              {communities.workshopsEvents && communities.workshopsEvents.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${item.color === 'green' ? 'bg-green-50' : item.color === 'orange' ? 'bg-orange-50' : 'bg-gray-100'
                      }`}>
                      <Calendar className={`h-4 w-4 ${item.color === 'green' ? 'text-green-600' : item.color === 'orange' ? 'text-orange-500' : 'text-gray-500'
                        }`} />
                    </div>
                    <span className="text-base font-bold text-gray-900">{item.label}</span>
                  </div>
                  <span className={`text-2xl font-extrabold ${item.color === 'green' ? 'text-green-600' : item.color === 'orange' ? 'text-orange-500' : 'text-gray-500'
                    }`}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-orange-500 hover:text-orange-600 text-base font-bold py-2 transition-colors">
              {ct('ดูรายละเอียดทั้งหมด', 'View All Details')} →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Community Admins */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-extrabold text-gray-900">{ct('ผู้ดูแล Community', 'Community Admins')}</h2>
              <button onClick={handleAddAdmin} className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white text-base font-bold px-3 py-1.5 rounded-lg transition-colors">
                <UserPlus className="h-4 w-4" />
                <span>{ct('เพิ่ม Admin', 'Add Admin')}</span>
              </button>
            </div>
            <div className="space-y-3">
              {communities.admins.map((admin, index) => (
                <div key={admin.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                      <span className="text-white font-bold text-base">{admin.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-base font-bold text-gray-900">{admin.name}</p>
                      <p className="text-sm font-bold text-gray-500">{admin.email}</p>
                      <p className="text-sm font-bold text-gray-400">{ct('เข้าร่วมเมื่อ', 'Joined')} {admin.joinDate}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                   className="text-red-500 hover:text-red-600">
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Demographics */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-4">{ct('ผู้เข้าร่วม', 'Participants')}</h2>

            {/* Participant Type Pie Chart */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">{ct('ประเภทผู้เข้าร่วม', 'Participant Types')}</h3>

              {communities.participantTypeData && communities.participantTypeData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={communities.participantTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {communities.participantTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Legend ด้านล่าง */}
                  <div className="flex justify-center space-x-6 mt-2">
                    {communities.participantTypeData.map((item, index) => (
                      <div key={index} className="text-center">
                        <p className="text-base font-bold text-gray-700">{item.name}</p>
                        <p className="text-2xl font-extrabold" style={{ color: item.color }}>{item.value}%</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-40 flex items-center justify-center text-lg font-bold text-gray-400">
                  ไม่มีข้อมูล
                </div>
              )}
            </div>

            {/* Popular Activity Types Bar Chart */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{ct('ประเภทกิจกรรม', 'Events Types')}</h3>

              {communities.popularActivityData && communities.popularActivityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart 
                    data={communities.popularActivityData} 
                    layout="vertical" 
                    margin={{ left: 10, right: 60, top: 10, bottom: 10 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={120} 
                      tick={{ fontSize: 12, fontWeight: 500 }} 
                    />
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `${props.payload.count} งาน (${props.payload.percentage}%)`, 
                        'จำนวนกิจกรรม'
                      ]}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                      {communities.popularActivityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || "#f97316"} />
                      ))}
                      <LabelList 
                        dataKey="percentage" 
                        position="right" 
                        formatter={(val) => `${val}%`}
                        style={{ fontSize: 14, fill: '#666666', fontWeight: 600 }}
                        offset={10}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-32 flex items-center justify-center text-lg font-bold text-gray-400">
                  ไม่มีข้อมูลกิจกรรม
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformCommunityDetail;
