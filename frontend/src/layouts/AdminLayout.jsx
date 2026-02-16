import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

/**
 * Admin Layout - Layout สำหรับหน้า Community Admin
 * มี Dropdown Navigation ตาม Figma: 1920w light.png
 * 
 * Menu Items:
 * 1. จัดการข้อมูลชุมชน (Dashboard)
 * 2. ดูแลอนุมัติ (Pending Approvals)
 * 3. ตั้งค่าชุมชน (Settings)
 * 4. ออกจากระบบ (Logout)
 */

const AdminLayout = () => {
  const location = useLocation();
  const { ct } = useTranslation();

  const getCurrentPageTitle = () => {
    const currentPath = location.pathname;
    if (currentPath.includes('/dashboard')) return ct('จัดการชุมชน', 'Dashboard');
    if (currentPath.includes('/info')) return ct('ดูข้อมูลชุมชน', 'Community Info');
    if (currentPath.includes('/settings')) return ct('ตั้งค่าชุมชน', 'Community Settings');
    if (currentPath.includes('/workshops')) return ct('ตรวจสอบ Workshop', 'Review Workshop');
    if (currentPath.includes('/events')) return ct('จัดการกิจกรรม', 'Manage Events');
    return ct('Community Admin', 'Community Admin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Title Bar */}
      <div className="bg-gradient-to-r from-orange-50 to-white border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h2 className="text-2xl font-bold" style={{ color: '#111827' }}>{getCurrentPageTitle()}</h2>
        </div>
      </div>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
