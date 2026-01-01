// User Types
export type UserRole = 'TOURIST' | 'SHOP_OWNER' | 'COMMUNITY_ADMIN' | 'PLATFORM_ADMIN';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone?: string;
  shopId?: string;
  communityId?: string;
  createdAt: string;
}

// Community Types
export interface Community {
  id: string;
  name: string;
  description: string;
  history: string;
  culturalHighlights: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  images: string[];
  contactInfo: {
    phone?: string;
    email?: string;
    facebook?: string;
    line?: string;
  };
  adminId: string;
  createdAt: string;
}

// Shop Types
export interface Shop {
  id: string;
  ownerId: string;
  communityId: string;
  name: string;
  description: string;
  images: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  openTime: string;
  closeTime: string;
  contactLinks: {
    line?: string;
    facebook?: string;
    phone?: string;
    website?: string;
  };
  status: 'ACTIVE' | 'INACTIVE';
  rating: number;
  reviewCount: number;
  createdAt: string;
}

// Workshop Types
export type WorkshopStatus = 'PENDING' | 'ACTIVE' | 'CLOSED' | 'CANCELLED' | 'REJECTED';

export interface Workshop {
  id: string;
  shopId: string;
  communityId: string;
  title: string;
  description: string;
  category: string;
  price: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  startDateTime: string;
  endDateTime: string;
  duration: string;
  seatLimit: number;
  seatsBooked: number;
  status: WorkshopStatus;
  images: string[];
  whatYouWillLearn: string[];
  requirements: string[];
  host: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

// Event Types
export type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface CommunityEvent {
  id: string;
  communityId: string;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  eventDate: string;
  endDate?: string;
  images: string[];
  status: EventStatus;
  organizer: string;
  createdBy: string;
  createdAt: string;
}

// Enrollment/Booking Types
export type EnrollmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';

export interface Enrollment {
  id: string;
  workshopId: string;
  userId: string;
  participants: number;
  totalPrice: number;
  status: EnrollmentStatus;
  paymentStatus: PaymentStatus;
  enrollmentDate: string;
  notes?: string;
  workshopTitle?: string;
  workshopDate?: string;
}

// Review Types
export interface Review {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'SHOP' | 'WORKSHOP';
  rating: number;
  comment: string;
  images?: string[];
  userName: string;
  userAvatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export type NotificationType = 'BOOKING' | 'CANCELLATION' | 'UPDATE' | 'REMINDER' | 'APPROVAL';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  relatedId?: string;
  relatedType?: 'WORKSHOP' | 'EVENT' | 'ENROLLMENT';
  createdAt: string;
}

// Dashboard Stats Types
export interface ShopStats {
  totalWorkshops: number;
  activeWorkshops: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  pendingApprovals: number;
}

export interface CommunityStats {
  totalShops: number;
  totalWorkshops: number;
  totalEvents: number;
  pendingApprovals: number;
  totalVisitors: number;
  monthlyRevenue: number;
}

export interface PlatformStats {
  totalCommunities: number;
  totalShops: number;
  totalWorkshops: number;
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
}

// Filter/Search Types
export interface WorkshopFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  dateFrom?: string;
  dateTo?: string;
  communityId?: string;
  status?: WorkshopStatus;
  searchQuery?: string;
}

export interface ShopFilters {
  communityId?: string;
  category?: string;
  rating?: number;
  status?: string;
  searchQuery?: string;
}