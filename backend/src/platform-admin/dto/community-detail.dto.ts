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

  alerts: CommunityAlert[];
}
