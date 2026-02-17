import { Model, Types } from 'mongoose';
import { CommunityDocument } from '../communities/schemas/community.schema';
import { CommunitiesService } from 'src/communities/communities.service';
import { LocationData } from 'src/communities/dto/types.dto';
import { UserDocument } from 'src/users/schemas/users.schema';
import { ShopDocument } from 'src/shops/schemas/shop.schema';
import { EventDocument } from 'src/events/schemas/event.schema';
import * as bcrypt from 'bcrypt';

function getEnglishLocation(location: LocationData): LocationData {
  return {
    ...location,
    full_address_en: 'Ban Mon, Soi 11, San Klang, San Kamphaeng, Chiang Mai 50130',
    alley_en: 'Soi 11',
    sub_district_en: 'San Klang',
    district_en: 'San Kamphaeng',
    province_en: 'Chiang Mai',
  };
}
export async function seedCommunity(
  communityModel: Model<CommunityDocument>,
  communityService: CommunitiesService,
) {
  const COMMUNITY_ID = new Types.ObjectId('6952c7d7a6db8eb05e1908ed');

  const exists = await communityModel.findById(COMMUNITY_ID);
  if (exists) {
    console.log('Community already seeded');
    return exists;
  }

  const thaiData = {
    name: 'โหล่งฮิมคาว',
    name_en: 'Loeng Him Kaw',
    slug: 'loeng-him-kaw',
    is_active: true,

    history:
      'โหล่งฮิมคาว มีที่ตั้งอยู่ที่บ้านมอญ ตำบลสันกลาง อำเภอสันกำแพง จังหวัดเชียงใหม่คำว่า “โหล่ง” แปลว่า ย่าน ชุมชน หรือที่พื้นที่ว่างกว้าง ส่วนคำว่า “ฮิมคาว” คือ ริมคาว ซึ่ง “คาว” มาจากแม่น้ำคาว ทำให้ความหมายของโหล่งฮิมคาวคือชุมชนริมแม่น้ำคาว ชัชวาลย์ ทองดีเลิศ ประธานชุมชนโหล่งฮิมคาวและเป็นผู้ก่อตั้งโฮงเฮียนสืบสานภูมิปัญญาล้านนา เล่าว่า “จุดเริ่มต้นของชุมชนนี้ต้องย้อนกลับไปตั้งแต่ปี พ.ศ. 2529 สมัยรัฐบาลชาติชายตอนนั้นพื้นที่แถวนี้เป็นเพียงพื้นที่ป่าและนาเปล่า ๆ สำหรับเลี้ยงควายทั่วพื้นที่เป็นดินลูกรัง และถูกทิ้งให้รกร้าง ทำให้เกิดแนวคิดที่อยากจะสร้างพื้นที่สีเขียวจึงชักชวนเพื่อนคนที่รู้จักและรักในธรรมชาติ ศิลปะและวัฒนธรรม มาร่วมกันสร้างหมู่บ้าน และกลายเป็นชุมชนยอดฮิตของผู้ที่สนใจในงานฝีมือ วิถีชีวิต และวัฒนธรรมล้านนา”',

    hero_section: {
      title: 'สัมผัสวิถี Slow Life ที่โหล่งฮิมคาว',
      description:
        'เริ่มต้นเรียนรู้งานหัตถกรรมพื้นบ้าน ย้อมผ้าครามธรรมชาติ ปั้นดิน ทำอาหารล้านนา กับช่างฝีมือในชุมชนริมแม่น้ำคาว สันกำแพง',
    },

    cultural_highlights: [
      { title: 'เป็นมิตรกับสิ่งแวดล้อม', desc: 'รักษาธรรมชาติอย่างยั่งยืน' },
      { title: 'สืบสานวัฒนธรรม', desc: 'เรียนรู้จากช่างฝีมือท้องถิ่น' },
      { title: 'ชุมชนเข้มแข็ง', desc: 'รายได้ 100% กลับสู่ผู้ประกอบการในชุมชน' },
      { title: 'Slow Life', desc: 'หยุดพัก ผ่อนคลายและใช้เวลากับสิ่งที่รัก' },
    ],

    images: [
      'communities/lhkem-1.jpg',
      'communities/lhkem-2.png',
      'communities/lhkem-3.png',
      'communities/lhkem-4.png',
      'communities/lhkem-profile.jpg',
      'communities/lhkem-banner.png',
    ],
    videos: [],

    location: {
      full_address:
        'บ้านมอญ ซอย 11 ต.สันกลาง อ.สันกำแพง จ.เชียงใหม่ 50130',
      village: 'บ้านมอญ',
      alley: 'ซอย 11',
      sub_district: 'สันกลาง',
      district: 'สันกำแพง',
      province: 'เชียงใหม่',
      postal_code: '50130',
      coordinates: {
        lat: 18.785231894713643,
        lng: 99.0477199711643,
      },
    },

    contact_info: {
      facebook: {
        name: 'โหล่งฮิมคาว',
        link: 'https://www.facebook.com/LoangHimKao',
      },
    },
  }

  const [history_en, hero_title_en, hero_desc_en] = await Promise.all([
    communityService.autoTranslate(thaiData.history),
    communityService.autoTranslate(thaiData.hero_section.title),
    communityService.autoTranslate(thaiData.hero_section.description),
  ]);

  const cultural_en = await Promise.all(
    thaiData.cultural_highlights.map(async (ch) => ({
      ...ch,
      title_en: await communityService.autoTranslate(ch.title),
      desc_en: await communityService.autoTranslate(ch.desc),
    }))
  );

  const seedData = await communityModel.create({
    _id: COMMUNITY_ID,
    ...thaiData,
    location: getEnglishLocation(thaiData.location),
    history_en,
    hero_section: { ...thaiData.hero_section, title_en: hero_title_en, description_en: hero_desc_en },
    cultural_highlights: cultural_en,
  });

  const community = await communityModel.findByIdAndUpdate(
    COMMUNITY_ID,
    { $set: seedData },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  );

  console.log(`--- Community seeded: ${community.name} (${community.slug}) ---`);

  return community;
}

