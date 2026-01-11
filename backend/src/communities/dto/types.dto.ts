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