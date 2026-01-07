import { Outlet, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useQuery, } from '@tanstack/react-query';
import axios from 'axios';

const fetchComm = async (slug) => {
  // If no slug, get first community as default
  if (!slug) {
    const res = await axios.get('/api/communities');
    const communities = res.data;
    return Array.isArray(communities) && communities.length > 0 ? communities[0] : null;
  }
  const res = await axios.get(`/api/communities/${slug}`);
  return res.data;
}

const MainLayout = () => {
  const { slug } = useParams();
  
  const { data: community, isLoading, isError } = useQuery({
    queryKey: ['community', slug || 'default'],
    queryFn: () => fetchComm(slug),
  });
  
  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  if (isError) return <div className="flex items-center justify-center min-h-screen">Something wrong in this page</div>
  if (!community) return <div className="flex items-center justify-center min-h-screen">Community not found</div>

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar community={community}/>
      <main className="flex-grow">
        <Outlet context={{ community }} />
      </main>
      <Footer community={community}/>
    </div>
  );
};

export default MainLayout;
