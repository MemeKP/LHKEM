const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const isAbsoluteUrl = (path = '') => /^https?:\/\//i.test(path) || path.startsWith('data:');

export const resolveImageUrl = (path) => {
  if (!path || typeof path !== 'string') return null;
  if (isAbsoluteUrl(path)) return path;

  const normalized = path.startsWith('/') ? path : `/${path}`;

  if (normalized.startsWith('/uploads')) {
    return `${API_URL}${normalized}`;
  }

  if (path.startsWith('uploads')) {
    return `${API_URL}/${path}`;
  }

  return `${API_URL}${normalized}`;
};

export const getShopCoverImage = (shop = {}) => {
  const candidates = [
    shop.coverUrl,
    shop.picture,
    Array.isArray(shop.images) ? shop.images[0] : null,
    shop.iconUrl,
  ];

  for (const candidate of candidates) {
    const resolved = resolveImageUrl(candidate);
    if (resolved) return resolved;
  }

  return null;
};
