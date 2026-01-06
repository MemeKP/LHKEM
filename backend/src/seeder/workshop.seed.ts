/*import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Workshop, WorkshopDocument } from "src/workshops/schemas/workshop.schema"; 
import { Community, CommunityDocument } from "src/communities/schemas/community.schema";

@Injectable()
export class WorkshopSeeder {
    constructor(
        @InjectModel(Workshop.name)
        private readonly workshopModel: Model<WorkshopDocument>,
        @InjectModel(Community.name)
        private readonly communityModel: Model<CommunityDocument>,
    ) { }

    async seed() {
        const COMMUNITY_ID = new Types.ObjectId('6952c7d7a6db8eb05e1908ed');

        const communityExists = await this.communityModel.findById(COMMUNITY_ID);
        if (!communityExists) {
            console.error('Community not found! Please run Community Seeder first.');
            return;
        }

        console.log('Seeding workshops for:', communityExists.name);

        await this.workshopModel.deleteMany({ community: COMMUNITY_ID });

        const workshopsData = Array.from({ length: 5 }).map(() => {
            const name = faker.commerce.productName(); // สุ่มชื่อกิจกรรม เช่น "Handmade Soap"
            
            return {
                community: COMMUNITY_ID, 
                title: name,
                description: faker.lorem.paragraph(),
                price: parseFloat(faker.commerce.price({ min: 100, max: 1000 })),
                duration: `${faker.number.int({ min: 1, max: 4 })} ชั่วโมง`,
                max_participants: faker.number.int({ min: 5, max: 20 }),
                
                images: [
                   faker.image.urlLoremFlickr({ category: 'crafts' }), 
                ],
                
                location: {
                   address: 'ภายในชุมชนโหล่งฮิมคาว',
                   coordinates: {
                       lat: 18.785231, 
                       lng: 99.047719
                   }
                },
                
                category: faker.helpers.arrayElement(['Art', 'Food', 'Culture', 'Craft']),
                is_active: true,
            };
        });

        const createdWorkshops = await this.workshopModel.insertMany(workshopsData);
        
        const workshopIds = createdWorkshops.map(w => w._id);
        
        await this.communityModel.findByIdAndUpdate(
            COMMUNITY_ID,
            { 
                $set: { workshops: workshopIds } 
            }
        );

        console.log(`Successfully seeded ${createdWorkshops.length} workshops for Loeng Him Kaw`);
    }
}*/