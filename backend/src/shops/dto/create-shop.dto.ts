// src/shop/dto/create-shop.dto.ts
export class CreateShopDto {
  shopName: string;
  description?: string;
  picture?: string;
  openTime?: string;
  contact?: {
    line?: string;
    facebook?: string;
    phone?: string;
  };
  communityId: string;
}
