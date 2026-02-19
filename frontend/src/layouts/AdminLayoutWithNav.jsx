import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

/**
 * AdminLayoutWithNav - Layout for Community Admin pages
 * Includes Navbar with Community Admin dropdown and Footer
 */

// const fetchDefaultCommunity = async () => {
//   // TODO: Get community from user's profile or default community
//   // For now, fetch the first community or a default one
//   const res = await api.get('/api/communities');
//   return res.data[0] || { slug: 'loeng-him-kaw', name: 'โหล่งฮิมคาว' };
// };

const fetchMyCommunity = async () => {
  const res = await api.get('/api/communities/my-community')
  return res.data
}

const AdminLayoutWithNav = () => {
  const { data: community, isLoading, isError } = useQuery({
    queryKey: ['admin-community'],
    queryFn: fetchMyCommunity,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF8F3]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (isError || !community) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF8F3]">
        <div className="text-center">
          <p className="text-gray-600">ไม่สามารถโหลดข้อมูลได้</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3]">
      <Navbar community={community} />
      <main className="flex-grow">
        <Outlet context={{ community }} />
      </main>
      <Footer community={community} />
    </div>
  );
};

export default AdminLayoutWithNav;
