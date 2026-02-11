import { Outlet } from 'react-router-dom';
import SimpleNavbar from '../components/SimpleNavbar';
import SimpleFooter from '../components/SimpleFooter';

/**
 * SimpleLayout - Layout สำหรับหน้าที่ไม่ได้อยู่ในชุมชน
 * เช่น Dashboard, Settings, Admin pages
 * จะแสดง Navbar แบบธรรมดา (ไม่มีเมนูชุมชน)
 */

const SimpleLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SimpleNavbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <SimpleFooter />
    </div>
  );
};

export default SimpleLayout;
