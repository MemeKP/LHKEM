import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import slugify from "slugify";
import { Community, CommunityDocument } from "src/communities/schemas/community.schema";

@Injectable()
export class CommunitySeeder {
    constructor(
        @InjectModel(Community.name)
        private readonly communityModel: Model<CommunityDocument>,
    ) { }

    async seed() {
        const exists = await this.communityModel.countDocuments();
        if (exists > 0) {
            console.log('This community already seed')
            return;
        }

        const communities = Array.from({ length: 5 }).map(() => {
            const name = faker.location.city();

            return {
                community_id: faker.string.uuid(), name,
                history: faker.lorem.paragraph(),
                hero_section: {
                    title: `สัมผัสวิถี Slow Life ที่${name}`,
                    description: faker.lorem.sentences(2)
                },
                cultural_highlights: {
                    title: 'ชุมชนเข้มแข็ง',
                    desc: faker.lorem.sentence()
                },
                images: [],
                videos: [],
                location: {
                    address: faker.location.streetAddress(),
                    province: faker.location.state(),
                    postal_code: faker.location.zipCode(),
                    coordinates: {
                        lat: faker.location.latitude(),
                        lng: faker.location.longitude()
                    }
                },
                contact_info: {
                    facebook: 'โหล่งฮิมคาว'
                },
                slug: slugify(name, { lower: true }),
            }
        })
        await this.communityModel.insertMany(communities);
        console.log('Community seeded successfully');
    }
}

