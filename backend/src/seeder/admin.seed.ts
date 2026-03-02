import { Model } from 'mongoose';
import { UserDocument } from 'src/users/schemas/users.schema';
import { UserRole } from 'src/common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';

export async function seedPlatformAdmin(userModel: Model<UserDocument>) {
  const ADMIN_EMAIL = 'admin@platform.com';

  const exists = await userModel.findOne({ email: ADMIN_EMAIL });
  if (exists) {
    console.log('Platform admin already seeded');
    return exists;
  }

  const hashed = await bcrypt.hash('12345678', 10);

  const admin = await userModel.create({
    _id: new Types.ObjectId('6952c7d7a6db8eb05e1908ee'),
    user_id: 'PLATFORM_ADMIN_001',
    firstname: 'admin',
    lastname: 'platform',
    email: ADMIN_EMAIL,
    password: hashed,
    phone: '0800000000',
    role: UserRole.PLATFORM_ADMIN,
  });

  console.log(`--- Platform admin seeded: ${admin.email} ---`);
  return admin;
}