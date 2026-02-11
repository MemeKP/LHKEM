// src/shop/dto/update-shop.dto.ts
export class UpdateShopDto {
  shopName?: string;
  description?: string;
  picture?: string;
  openTime?: string;
  contact?: {
    line?: string;
    facebook?: string;
    phone?: string;
  };
}
