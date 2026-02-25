import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import CommunityAssignmentNotice from '../components/CommunityAssignmentNotice';

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

const fallbackCommunity = {
  slug: '',
  name: 'Community',
  name_en: 'Community',
  hero_section: { description: '', description_en: '' },
  contact_info: {},
  location: {},
};

const assignmentSensitiveKeys = [
  ['community-stats'],
  ['workshop-by-category'],
  ['top-workshops'],
  ['workshop-status'],
  ['category-engagement'],
  ['community-growth'],
  ['community-shops'],
  ['community-pending-shops'],
  ['setting'],
];

const AdminLayoutWithNav = () => {
  const queryClient = useQueryClient();
  const {
    data: community,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['admin-community'],
    queryFn: fetchMyCommunity,
    retry: false,
    refetchInterval: 60000,
  });

  const noAssignment = (!isLoading && !community && !isError) || (isError && error?.response?.status === 404);

  if (noAssignment) {
    assignmentSensitiveKeys.forEach((queryKey) => {
      queryClient.removeQueries({ queryKey, exact: false });
    });
  }

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

  if (isError && !noAssignment) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF8F3]">
        <div className="text-center">
          <p className="text-gray-600">ไม่สามารถโหลดข้อมูลได้</p>
        </div>
      </div>
    );
  }

  const hasCommunity = !noAssignment && !!community;
  const resolvedCommunity = hasCommunity ? community : fallbackCommunity;
  const outletContext = { community: hasCommunity ? community : null, hasCommunity };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3]">
      <Navbar community={resolvedCommunity} />
      <main className="flex-grow">
        {hasCommunity ? (
          <Outlet context={outletContext} />
        ) : (
          <CommunityAssignmentNotice />
        )}
      </main>
      <Footer community={resolvedCommunity} />
    </div>
  );
};

export default AdminLayoutWithNav;
