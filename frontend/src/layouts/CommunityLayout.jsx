import { Outlet, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/**
 * CommunityLayout - Layout สำหรับหน้าที่อยู่ภายในชุมชน
 * จะแสดง Navbar พร้อมเมนูชุมชน (Home, Workshops, Map, About)
 */

const fetchCommunity = async (slug) => {
  const res = await api.get(`/api/communities/${slug}`);
  return res.data;
};

const CommunityLayout = () => {
  const { slug } = useParams();

  const { data: community, isLoading, error } = useQuery({
    queryKey: ['community', slug],
    queryFn: () => fetchCommunity(slug),
    enabled: !!slug,
    retry: 1
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูลชุมชน...</p>
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบชุมชน</h2>
          <p className="text-gray-600 mb-6">ไม่พบชุมชนที่คุณกำลังค้นหา กรุณาตรวจสอบ URL อีกครั้ง</p>
          <a href="/" className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
            กลับหน้าแรก
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar community={community} />
      <main className="flex-grow">
        <Outlet context={{ community }} />
      </main>
      <Footer community={community} />
    </div>
  );
};

export default CommunityLayout;
