import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Community } from 'src/communities/schemas/community.schema';
import { Shop } from 'src/shops/schemas/shop.schema';
import { User } from 'src/users/schemas/users.schema';
import { Workshop } from 'src/workshops/schemas/workshop.schema';

@Injectable()
export class DashboardService {
    constructor(
        @InjectModel(Event.name) private readonly eventModel: Model<any>,
        @InjectModel(Workshop.name) private readonly workshopModel: Model<any>,
        @InjectModel(Shop.name) private readonly shopModel: Model<Shop>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Community.name) private readonly communityModel: Model<Community>,
    ) { }

    private calculateGrowth(current: number, previous: number) {
        if (previous === 0) {
            return { change: current > 0 ? '+100%' : '0%', trend: current >= 0 ? 'up' : 'down' };
        }
        const percentChange = ((current - previous) / previous) * 100;
        const trend = percentChange >= 0 ? 'up' : 'down';
        const sign = percentChange > 0 ? '+' : '';
        return {
            change: `${sign}${percentChange.toFixed(1)}%`,
            trend
        };
    }

    async getDashboardStats(communityId?: string, timeRange: string = 'month') {
        const matchCondition = communityId
            ? { community_id: new Types.ObjectId(communityId) }
            : {};

        const [
            totalEvents,
            totalWorkshops,
            totalShops,
            workshopCategoryRaw,
            workshopStatusRaw,
            topWorkshopsRaw
        ] = await Promise.all([
            this.eventModel.countDocuments(matchCondition),
            this.workshopModel.countDocuments(matchCondition),
            this.shopModel.countDocuments(matchCondition),

            this.workshopModel.aggregate([
                { $match: matchCondition },
                { $group: { _id: "$category", count: { $sum: 1 } } }
            ]),

            this.workshopModel.aggregate([
                { $match: matchCondition },
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ]),

            this.workshopModel.find(matchCondition)
                .sort({ participants: -1 })
                .limit(5)
                .select('title participants rating')
        ]);

        const categoryColors = {
            'Crafts': '#16a34a', 'Food': '#f97316', 'Art': '#eab308', 'Others': '#8b5cf6'
        };
        const statusColors = {
            'APPROVED': '#16a34a', 'PENDING': '#eab308'
        };

        return {
            stats: {
                totalVisitors: 324, // เก็บยอดวิวที่ไหนดี???
                totalWorkshops,
                totalEvents,
                totalShops
            },
            workshopCategoryData: workshopCategoryRaw.map(item => ({
                name: item._id || 'Others',
                value: item.count,
                fill: categoryColors[item._id] || categoryColors['Others']
            })),
            workshopStatusData: workshopStatusRaw.map(item => ({
                name: item._id === 'APPROVED' ? 'อนุมัติแล้ว' : 'รออนุมัติ',
                value: item.count,
                fill: statusColors[item._id] || '#cbd5e1'
            })),
            topWorkshops: topWorkshopsRaw.map((ws, index) => ({
                rank: index + 1,
                name: ws.title || ws.name,
                participants: ws.participants || 0,
                rating: ws.rating || 0
            })),
            // Mock data ไปก่อนสำหรับข้อมูลที่ต้องคำนวณซับซ้อน
            engagementData: [
                { category: 'งานฝีมือ', value: 85 },
                { category: 'อาหาร', value: 72 },
                { category: 'ศิลปะ', value: 68 },
                { category: 'วัฒนธรรม', value: 54 }
            ],
            growthMetrics: [
                { label: 'จำนวนผู้เข้าชม', value: '48,500', change: '+12.5%', trend: 'up' },
                { label: 'Workshop ที่จัด', value: totalWorkshops.toString(), change: '+8.3%', trend: 'up' },
                { label: 'ผู้เข้าร่วม', value: '7,396', change: '+15.2%', trend: 'up' },
                { label: 'อัตราความพึงพอใจ', value: '87%', change: '+2.1%', trend: 'up' }
            ]
        };
    }

    private calculateGrowthData(current: number, previous: number) {
        if (previous === 0) {
            return {
                change: current > 0 ? '+100.0%' : '0.0%',
                trend: current > 0 ? 'up' : 'neutral'
            };
        }
        const percentChange = ((current - previous) / previous) * 100;
        const trend = percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'neutral';
        const sign = percentChange > 0 ? '+' : '';

        return {
            change: `${sign}${percentChange.toFixed(1)}%`,
            trend
        };
    }

    async getPlatformOverviewStats(timeFilter: string, communityFilter: string) {
        const now = new Date();

        let currDateMatch: any = {};
        let prevDateMatch: any = {};

        if (timeFilter === 'month') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

            currDateMatch = { createdAt: { $gte: startOfMonth } };
            prevDateMatch = { createdAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth } };

        } else if (timeFilter === 'year') {
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const startOfPrevYear = new Date(now.getFullYear() - 1, 0, 1);
            const endOfPrevYear = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);

            currDateMatch = { createdAt: { $gte: startOfYear } };
            prevDateMatch = { createdAt: { $gte: startOfPrevYear, $lte: endOfPrevYear } };

        } else {
            // 'all' (ทั้งหมด): เพื่อให้มี % Growth ให้ดู จะเทียบยอดรวมปัจจุบัน กับยอดรวมเมื่อ 30 วันที่แล้ว
            const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            currDateMatch = {}; // ไม่ฟิลเตอร์วันที่ = ดึงทั้งหมด
            prevDateMatch = { createdAt: { $lt: thirtyDaysAgo } };
        }

        // 2. จัดการเงื่อนไข Filter ชุมชน
        let currCommMatch: any = { ...currDateMatch };
        let prevCommMatch: any = { ...prevDateMatch };

        if (communityFilter === 'new') {
            const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            currCommMatch.createdAt = { $gte: thirtyDaysAgo };
            prevCommMatch.createdAt = { $gte: new Date(thirtyDaysAgo.getTime() - (30 * 24 * 60 * 60 * 1000)), $lt: thirtyDaysAgo };
            currCommMatch.is_active = true;
            prevCommMatch.is_active = true;

        } else if (communityFilter === 'active') {
            currCommMatch.is_active = true;
            prevCommMatch.is_active = true;
        }
        const [
            currCommCount, prevCommCount,
            currShopCount, prevShopCount,
            currWsCount, prevWsCount,
            currEvCount, prevEvCount,
            currUserCount, prevUserCount
        ] = await Promise.all([
            this.communityModel.countDocuments(currCommMatch),
            this.communityModel.countDocuments(prevCommMatch),

            this.shopModel.countDocuments(currDateMatch),
            this.shopModel.countDocuments(prevDateMatch),

            this.workshopModel.countDocuments(currDateMatch),
            this.workshopModel.countDocuments(prevDateMatch),

            this.eventModel.countDocuments(currDateMatch),
            this.eventModel.countDocuments(prevDateMatch),

            this.userModel.countDocuments(currDateMatch),
            this.userModel.countDocuments(prevDateMatch),
        ]);

        const commGrowth = this.calculateGrowthData(currCommCount, prevCommCount);
        const shopGrowth = this.calculateGrowthData(currShopCount, prevShopCount);
        const activityGrowth = this.calculateGrowthData(currWsCount + currEvCount, prevWsCount + prevEvCount);
        const userGrowth = this.calculateGrowthData(currUserCount, prevUserCount);

        return {
            stats: {
                totalCommunities: currCommCount,
                totalShops: currShopCount,
                totalWorkshops: currWsCount + currEvCount,
                totalParticipants: currUserCount
            },
            growth: {
                communities: commGrowth,
                shops: shopGrowth,
                workshops: activityGrowth,
                participants: userGrowth
            },
            overview: [
                {
                    label: 'ชุมชนทั้งหมด',
                    value: currCommCount,
                    change: commGrowth.change,
                    trend: commGrowth.trend
                },
                {
                    label: 'ร้านค้าทั้งหมด',
                    value: currShopCount,
                    change: shopGrowth.change,
                    trend: shopGrowth.trend
                },
                {
                    label: 'กิจกรรมและเวิร์กชอป',
                    value: currWsCount + currEvCount,
                    change: activityGrowth.change,
                    trend: activityGrowth.trend
                },
                {
                    label: 'ผู้ใช้งานทั้งหมด',
                    value: currUserCount,
                    change: userGrowth.change,
                    trend: userGrowth.trend
                }
            ]
        };
    }

    async getCommunitiesOverviewList() {
        const communitiesList = await this.communityModel.aggregate([
            { $match: { is_active: true } },

            {
                $lookup: {
                    from: 'shops',
                    localField: '_id',
                    foreignField: 'communityId',
                    as: 'shopsData'
                }
            },

            {
                $lookup: {
                    from: 'workshops',
                    localField: '_id',
                    foreignField: 'communityId',
                    as: 'workshopsData'
                }
            },

            {
                $lookup: {
                    from: 'events',
                    localField: '_id',
                    foreignField: 'community_id',
                    as: 'eventsData'
                }
            },

            {
                $project: {
                    id: '$_id',
                    name: { $ifNull: ['$name', '$name_en'] },
                    location: { $ifNull: ['$province', '$location.province'] },

                    shops: { $size: '$shopsData' },

                    workshops: {
                        $add: [{ $size: '$workshopsData' }, { $size: '$eventsData' }]
                    },

                    members: { $sum: '$workshopsData.current_participants' }
                }
            },

            // เรียงลำดับจากชุมชนที่มีคนเข้าร่วมเยอะสุดไปน้อยสุด (ถ้า workshop ขาด current_participants จะยังใช้ไม่ได้)
            { $sort: { members: -1 } }
        ]);

        return communitiesList;
    }

    // !!!! pie chart จัดกลุ่ม Workshop ตาม Category (ยังไม่แน่ใจว่าต้องใช้ event หรือ workshop)
    async getActivityTypesData() {

        const categoryRaw = await this.workshopModel.aggregate([
            // เอาเฉพาะอันที่ไม่ได้ถูกยกเลิก 
            { $match: { status: { $ne: 'CANCELLED' } } },
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        const totalActivities = categoryRaw.reduce((sum, item) => sum + item.count, 0);

        const categoryMapping = {
            'CRAFTS': { name: 'งานฝีมือ', color: '#f97316' },   // ส้ม
            'FOOD': { name: 'อาหาร', color: '#16a34a' },       // เขียว
            'ART': { name: 'ศิลปะ', color: '#eab308' },        // เหลือง
            'CULTURE': { name: 'วัฒนธรรม', color: '#3b82f6' }, // ฟ้า
            'OTHER': { name: 'อื่นๆ', color: '#8b5cf6' }        // ม่วง
        };

        const activityData = categoryRaw.map(item => {
            const cat = categoryMapping[item._id] || categoryMapping['OTHER'];

            // คำนวณเปอร์เซ็นต์ (ปัดเศษ)
            const percent = totalActivities > 0
                ? Math.round((item.count / totalActivities) * 100)
                : 0;

            return {
                name: cat.name,
                value: percent,
                actualCount: item.count,
                color: cat.color
            };
        }).sort((a, b) => b.value - a.value); // เรียงจากเปอร์เซ็นต์มากไปน้อย

        // ป้องกันกรณีไม่มีข้อมูลเลย ให้ส่งข้อมูลเปล่าๆ ไปโชว์กราฟเทาๆ
        if (activityData.length === 0) {
            return [{ name: 'ไม่มีข้อมูล', value: 100, color: '#e5e7eb' }];
        }

        return activityData;
    }

    // คิดผู้เข้าร่วมแค่ของ workshop (เพิ่ม shop, event ได้)
    async getTopCommunitiesByParticipants(limit: number = 3) {
        const topCommunities = await this.communityModel.aggregate([
            { $match: { is_active: true } },

            {
                $lookup: {
                    from: 'workshops',
                    localField: '_id',
                    foreignField: 'communityId',
                    as: 'workshopsData'
                }
            },

            {
                $project: {
                    _id: 0,
                    name: { $ifNull: ['$name', '$name_en'] },
                    location: { $ifNull: ['$province', '$location.full_address', 'ไม่ระบุ'] },
                    count: { $sum: '$workshopsData.current_participants' }
                }
            },

            { $sort: { count: -1 } },
            { $limit: limit }
        ]);

        return topCommunities;
    }

    async getMostActiveCommunities(limit: number = 5) {
        const activeCommunities = await this.communityModel.aggregate([
            { $match: { is_active: true } },

            {
                $lookup: {
                    from: 'workshops',
                    localField: '_id',
                    foreignField: 'communityId',
                    as: 'workshopsData'
                }
            },

            {
                $lookup: {
                    from: 'events',
                    localField: '_id',
                    foreignField: 'community_id',
                    as: 'eventsData'
                }
            },

            {
                $project: {
                    _id: 0,
                    name: { $ifNull: ['$name', '$name_en'] },
                    location: { $ifNull: ['$province', '$location.full_address', 'ไม่ระบุ'] },
                    count: {
                        $add: [{ $size: '$workshopsData' }, { $size: '$eventsData' }]
                    }
                }
            },

            { $sort: { count: -1 } },
            { $limit: limit }
        ]);

        return activeCommunities;
    }

    async getParticipationTrends(monthsLimit: number = 6) {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - monthsLimit + 1, 1);

        const trendsRaw = await this.workshopModel.aggregate([
            {
                $match: {
                    date: { $gte: startDate },
                    status: { $ne: 'CANCELLED' }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" }
                    },
                    value: { $sum: "$current_participants" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        const thaiMonths = [
            '', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
            'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
        ];

        const monthlyData = [] as { month: string; value: number }[];
        for (let i = monthsLimit - 1; i >= 0; i--) {
            // คำนวณหาปีและเดือนเป้าหมาย (ไล่จาก 5 เดือนที่แล้ว มาจนถึงเดือนปัจจุบัน)
            const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const targetYear = targetDate.getFullYear();
            const targetMonth = targetDate.getMonth() + 1;
            const found = trendsRaw.find(t => t._id.year === targetYear && t._id.month === targetMonth);

            monthlyData.push({
                month: thaiMonths[targetMonth],
                value: found ? found.value : 0
            });
        }

        return monthlyData;
    }
}