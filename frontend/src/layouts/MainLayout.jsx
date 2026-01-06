import { Outlet, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useQuery, } from '@tanstack/react-query';
import axios from 'axios';

const fetchComm = async (slug) => {
  if (!slug) {
    return null;
  }
  const res = await axios.get(`/api/communities/${slug}`);
  return res.data;
}

const MainLayout = () => {
  const { slug } = useParams();
  
  const { data: community, isLoading, isError } = useQuery({
    queryKey: ['community', slug],
    queryFn: () => fetchComm(slug),
    enabled: !!slug,
  });
  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Somethig wrong in this page</div>
  if (!community) return <div>Community not found</div>

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
