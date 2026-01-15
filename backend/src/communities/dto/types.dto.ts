export interface ParticipantsResult {
  _id: null;
  totalParticipants: number;
}

export interface RevenueResult {
  _id: null;
  totalRevenue: number;
}

export interface MonthlyStat {
  _id: number; // เดือน (1-12)
  revenue: number; 
  participants: number; 
}

export interface ChartResponse {
  revenueByMonth: { name: string; value: number }[];
  participantsByMonth: { name: string; value: number }[];
}

export interface LocationData {
  full_address: string;
  full_address_en?: string; 
  house_no?: string;
  village?: string;
  village_en?: string;      
  moo?: string;
  alley?: string;
  alley_en?: string;      
  road?: string;
  road_en?: string;         
  province: string;
  province_en?: string;     
  district?: string;
  district_en?: string;    
  sub_district?: string;
  sub_district_en?: string; 
  postal_code?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}