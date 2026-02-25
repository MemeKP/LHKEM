export interface CommunityAlert {
  type: 'warning' | 'success' | 'info';
  message: string;
  time: string;
}

export interface CommunityDetailResponseDto {
  id: string;
  name: string;
  location?: string;

  stats: {
    shops: {
      current: number;
      total: number;
    };

    admins: number;
    workshops: number;
    participants: number;
    growth: string;
    workshopsAndEventsCount: number;
  };
  is_active: boolean;
  alerts: CommunityAlert[];
  shopsList: {
    id: string;
    name: string;      
    workshops: number; 
    members: number;  
    status: string;    
  }[];
  workshopsEvents: {
    label: string;
    count: number;
    color: string;
  }[];
  admins: {
    id: string;
    name: string;
    email: string;
    joinDate: string;
    userId?: string;
  }[];
  participantTypeData: {
    name: string;
    value: number;
    color: string;
  }[];
  popularActivityData: {
    name: string;
    value: number;
  }[];
}
