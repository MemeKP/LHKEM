export const mockUsers = [
  {
    id: '1',
    email: 'tourist@test.com',
    password: 'test123',
    role: 'TOURIST',
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    phone: '081-234-5678',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'shop@test.com',
    password: 'test123',
    role: 'SHOP_OWNER',
    firstName: 'สมหญิง',
    lastName: 'ขายดี',
    shopId: 'shop-1',
    communityId: 'comm-1',
    phone: '082-345-6789',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '3',
    email: 'community@test.com',
    password: 'test123',
    role: 'COMMUNITY_ADMIN',
    firstName: 'สมศักดิ์',
    lastName: 'ดูแลชุมชน',
    communityId: 'comm-1',
    phone: '083-456-7890',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '4',
    email: 'admin@test.com',
    password: 'test123',
    role: 'PLATFORM_ADMIN',
    firstName: 'ผู้ดูแล',
    lastName: 'ระบบ',
    phone: '084-567-8901',
    createdAt: '2025-01-01T00:00:00Z'
  }
];

export const mockEnrollments = [
  {
    id: 'enroll-1',
    userId: '1',
    workshopId: 'ws-1',
    workshopTitle: 'การทอผ้าพื้นเมือง',
    enrollmentDate: '2025-12-20T10:00:00Z',
    workshopDate: '2026-01-15T09:00:00Z',
    status: 'confirmed',
    participants: 2,
    totalPrice: 600,
    paymentStatus: 'paid'
  },
  {
    id: 'enroll-2',
    userId: '1',
    workshopId: 'ws-2',
    workshopTitle: 'การทำเครื่องปั้นดินเผา',
    enrollmentDate: '2025-12-25T14:30:00Z',
    workshopDate: '2026-01-20T13:00:00Z',
    status: 'pending',
    participants: 1,
    totalPrice: 400,
    paymentStatus: 'pending'
  },
  {
    id: 'enroll-3',
    userId: '1',
    workshopId: 'ws-3',
    workshopTitle: 'การทำขนมไทยโบราณ',
    enrollmentDate: '2025-11-10T08:00:00Z',
    workshopDate: '2025-12-05T10:00:00Z',
    status: 'completed',
    participants: 3,
    totalPrice: 900,
    paymentStatus: 'paid'
  }
];
