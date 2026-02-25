// Stats Card
export class DashboardStatsDto {
  totalCommunities: number;
  newCommunities: number; // ชุมชนที่ status = 'NEW' หรือสร้างใน 30 วันล่าสุด
  totalParticipants: number;
  totalEvents: number; // รวม Event + Workshop
}

// Activity Item
export class ActivityItemDto {
  id: string;
  type: string;
  message: string;
  time: Date; 
  color: string;
}

// Community Card
export class CommunitySummaryDto {
  id: string;
  name: string;
  location: string;
  image: string;
  status: string | null;
  stats: {
    shops: number;
    members?: number;
    admins?: number;
  };
}

// Response หลักรวมทุกอย่าง
export class PlatformDashboardResponseDto {
  stats: DashboardStatsDto;
  communities: CommunitySummaryDto[];
  activities: ActivityItemDto[];
}