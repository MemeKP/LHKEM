export const mockShops = [
  {
    id: 'shop-1',
    ownerId: '2',
    communityId: 'comm-1',
    name: 'ร้านหัตถกรรมโหล่งฮิมคาว',
    description: 'ร้านขายของฝากและหัตถกรรมท้องถิ่น ผลิตภัณฑ์จากธรรมชาติ 100%',
    images: ['/images/shop1.jpg'],
    location: {
      lat: 18.8123456,
      lng: 99.0123456,
      address: '123 ถนนสันกำแพง อ.สันกำแพง จ.เชียงใหม่ 50130'
    },
    openTime: '09:00',
    closeTime: '18:00',
    contactLinks: {
      line: '@longhimkaw',
      facebook: 'facebook.com/longhimkaw',
      phone: '081-234-5678'
    },
    status: 'ACTIVE',
    rating: 4.8,
    reviewCount: 45,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'shop-2',
    ownerId: '2',
    communityId: 'comm-1',
    name: 'ร้านมัดย้อมธรรมชาติ',
    description: 'สอนและจำหน่ายผ้ามัดย้อมจากสีธรรมชาติ',
    images: ['/images/shop2.jpg'],
    location: {
      lat: 18.8133456,
      lng: 99.0133456,
      address: '456 ถนนสันกำแพง อ.สันกำแพง จ.เชียงใหม่ 50130'
    },
    openTime: '08:00',
    closeTime: '17:00',
    contactLinks: {
      line: '@naturaldye',
      phone: '082-345-6789'
    },
    status: 'ACTIVE',
    rating: 4.9,
    reviewCount: 67,
    createdAt: '2025-01-01T00:00:00Z'
  }
];

export const mockWorkshops = [
  {
    id: 'ws-1',
    shopId: 'shop-1',
    communityId: 'comm-1',
    title: 'Workshop มัดย้อมผ้าสีธรรมชาติ',
    description: 'เรียนรู้การมัดย้อมผ้าด้วยสีจากธรรมชาติ ใช้เวลา 3 ชั่วโมง',
    category: 'หัตถกรรม',
    price: 500,
    location: {
      lat: 18.8123456,
      lng: 99.0123456,
      address: 'ร้านหัตถกรรมโหล่งฮิมคาว'
    },
    startDateTime: '2025-02-15T09:00:00Z',
    endDateTime: '2025-02-15T12:00:00Z',
    duration: '3 ชั่วโมง',
    seatLimit: 15,
    seatsBooked: 8,
    status: 'ACTIVE',
    images: ['/images/workshop1.jpg'],
    whatYouWillLearn: [
      'เทคนิคการมัดผ้าแบบต่างๆ',
      'การสกัดสีจากธรรมชาติ',
      'กระบวนการย้อมผ้า',
      'การดูแลรักษาผ้ามัดย้อม'
    ],
    requirements: [
      'ไม่จำเป็นต้องมีประสบการณ์',
      'แนะนำให้ใส่เสื้อผ้าที่สามารถเปื้อนได้'
    ],
    host: 'คุณสมหญิง ขายดี',
    rating: 4.7,
    reviewCount: 23,
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  },
  {
    id: 'ws-2',
    shopId: 'shop-1',
    communityId: 'comm-1',
    title: 'Workshop ปั้นดินเผา',
    description: 'สร้างสรรค์ผลงานดินเผาด้วยมือของคุณเอง',
    category: 'หัตถกรรม',
    price: 800,
    location: {
      lat: 18.8123456,
      lng: 99.0123456,
      address: 'ร้านหัตถกรรมโหล่งฮิมคาว'
    },
    startDateTime: '2025-02-20T13:00:00Z',
    endDateTime: '2025-02-20T17:00:00Z',
    duration: '4 ชั่วโมง',
    seatLimit: 10,
    seatsBooked: 3,
    status: 'ACTIVE',
    images: ['/images/workshop2.jpg'],
    whatYouWillLearn: [
      'เทคนิคการปั้นดิน',
      'การใช้เครื่องมือต่างๆ',
      'การตกแต่งและเคลือบ',
      'กระบวนการเผา'
    ],
    requirements: [
      'เหมาะสำหรับผู้เริ่มต้น',
      'อายุ 12 ปีขึ้นไป'
    ],
    host: 'คุณสมหญิง ขายดี',
    rating: 4.9,
    reviewCount: 18,
    createdAt: '2025-01-12T00:00:00Z',
    updatedAt: '2025-01-12T00:00:00Z'
  },
  {
    id: 'ws-3',
    shopId: 'shop-2',
    communityId: 'comm-1',
    title: 'Workshop ทำกระเป๋าผ้า',
    description: 'เรียนรู้การเย็บกระเป๋าผ้าด้วยตัวเอง',
    category: 'หัตถกรรม',
    price: 600,
    location: {
      lat: 18.8133456,
      lng: 99.0133456,
      address: 'ร้านมัดย้อมธรรมชาติ'
    },
    startDateTime: '2025-02-18T10:00:00Z',
    endDateTime: '2025-02-18T13:00:00Z',
    duration: '3 ชั่วโมง',
    seatLimit: 12,
    seatsBooked: 12,
    status: 'CLOSED',
    images: ['/images/workshop3.jpg'],
    whatYouWillLearn: [
      'การเลือกผ้า',
      'เทคนิคการเย็บพื้นฐาน',
      'การออกแบบลายผ้า',
      'การตกแต่งกระเป๋า'
    ],
    requirements: [
      'ไม่จำเป็นต้องมีประสบการณ์',
      'อุปกรณ์จัดเตรียมให้ทั้งหมด'
    ],
    host: 'คุณสมชาย ใจดี',
    rating: 4.6,
    reviewCount: 31,
    createdAt: '2025-01-08T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z'
  }
];

export const mockEvents = [
  {
    id: 'event-1',
    communityId: 'comm-1',
    title: 'งานประเพณีลอยกระทง',
    description: 'งานประเพณีลอยกระทงประจำปี พร้อมกิจกรรมมากมาย',
    location: {
      lat: 18.8123456,
      lng: 99.0123456,
      address: 'ริมแม่น้ำคาว ชุมชนโหล่งฮิมคาว'
    },
    eventDate: '2025-11-15T18:00:00Z',
    endDate: '2025-11-15T22:00:00Z',
    images: ['/images/event1.jpg'],
    status: 'UPCOMING',
    organizer: 'ชุมชนโหล่งฮิมคาว',
    createdBy: '3',
    createdAt: '2025-01-05T00:00:00Z'
  },
  {
    id: 'event-2',
    communityId: 'comm-1',
    title: 'เทศกาลหัตถกรรมท้องถิ่น',
    description: 'จัดแสดงและจำหน่ายผลิตภัณฑ์หัตถกรรมจากชุมชน',
    location: {
      lat: 18.8123456,
      lng: 99.0123456,
      address: 'ลานกิจกรรมชุมชนโหล่งฮิมคาว'
    },
    eventDate: '2025-03-01T09:00:00Z',
    endDate: '2025-03-03T18:00:00Z',
    images: ['/images/event2.jpg'],
    status: 'UPCOMING',
    organizer: 'ชุมชนโหล่งฮิมคาว',
    createdBy: '3',
    createdAt: '2025-01-10T00:00:00Z'
  }
];

export const mockReviews = [
  {
    id: 'review-1',
    userId: '1',
    targetId: 'ws-1',
    targetType: 'WORKSHOP',
    rating: 5,
    comment: 'Workshop สนุกมาก ได้เรียนรู้เยอะ ครูสอนดีมาก แนะนำเลยค่ะ',
    userName: 'สมชาย ใจดี',
    createdAt: '2025-01-20T10:00:00Z',
    updatedAt: '2025-01-20T10:00:00Z'
  },
  {
    id: 'review-2',
    userId: '1',
    targetId: 'shop-1',
    targetType: 'SHOP',
    rating: 5,
    comment: 'ร้านน่ารัก บรรยากาศดี ของสวยมาก',
    userName: 'สมชาย ใจดี',
    createdAt: '2025-01-21T14:30:00Z',
    updatedAt: '2025-01-21T14:30:00Z'
  },
  {
    id: 'review-3',
    userId: '1',
    targetId: 'ws-2',
    targetType: 'WORKSHOP',
    rating: 4,
    comment: 'สนุกดีครับ แต่เวลาน้อยไปนิด อยากให้เพิ่มเวลาอีกหน่อย',
    userName: 'สมชาย ใจดี',
    createdAt: '2025-01-22T16:00:00Z',
    updatedAt: '2025-01-22T16:00:00Z'
  }
];

export const mockCommunities = [
  {
    id: 'comm-1',
    name: 'โหล่งฮิมคาว',
    description: 'ชุมชนท่องเที่ยวเชิงนิเวศริมแม่น้ำคาว',
    history: 'โหล่งฮิมคาว คือชุมชนเล็กๆ ริมแม่น้ำคาว ในอำเภอสันกำแพง จังหวัดเชียงใหม่ ที่รวมตัวกันของกลุ่มช่างฝีมือและศิลปิน มีการอนุรักษ์และสืบทอดภูมิปัญญาท้องถิ่นมาอย่างยาวนาน',
    culturalHighlights: [
      'หัตถกรรมผ้ามัดย้อมสีธรรมชาติ',
      'งานปั้นดินเผา',
      'ผลิตภัณฑ์จากไม้',
      'อาหารพื้นเมือง'
    ],
    location: {
      lat: 18.8123456,
      lng: 99.0123456,
      address: 'อ.สันกำแพง จ.เชียงใหม่ 50130'
    },
    images: ['/images/community1.jpg', '/images/community2.jpg'],
    contactInfo: {
      phone: '053-123-456',
      email: 'info@longhimkaw.com',
      facebook: 'facebook.com/longhimkaw',
      line: '@longhimkaw'
    },
    adminId: '3',
    createdAt: '2024-01-01T00:00:00Z'
  }
];
