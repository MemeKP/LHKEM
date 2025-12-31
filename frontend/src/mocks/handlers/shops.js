import { http, HttpResponse } from 'msw';
import { mockShops, mockWorkshops, mockReviews } from '../data/mockShops';

export const shopHandlers = [
  // Get all shops
  http.get('/api/shops', ({ request }) => {
    const url = new URL(request.url);
    const communityId = url.searchParams.get('communityId');
    
    let filtered = mockShops;
    if (communityId) {
      filtered = mockShops.filter(shop => shop.communityId === communityId);
    }
    
    return HttpResponse.json({ shops: filtered });
  }),

  // Get shop by ID
  http.get('/api/shops/:id', ({ params }) => {
    const shop = mockShops.find(s => s.id === params.id);
    
    if (!shop) {
      return HttpResponse.json({ error: 'Shop not found' }, { status: 404 });
    }
    
    return HttpResponse.json({ shop });
  }),

  // Create shop
  http.post('/api/shops', async ({ request }) => {
    const data = await request.json();
    const newShop = {
      id: `shop-${Date.now()}`,
      ...data,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString()
    };
    
    mockShops.push(newShop);
    return HttpResponse.json({ shop: newShop }, { status: 201 });
  }),

  // Update shop
  http.put('/api/shops/:id', async ({ params, request }) => {
    const data = await request.json();
    const index = mockShops.findIndex(s => s.id === params.id);
    
    if (index === -1) {
      return HttpResponse.json({ error: 'Shop not found' }, { status: 404 });
    }
    
    mockShops[index] = { ...mockShops[index], ...data };
    return HttpResponse.json({ shop: mockShops[index] });
  }),

  // Get shop reviews
  http.get('/api/shops/:id/reviews', ({ params }) => {
    const reviews = mockReviews.filter(r => r.targetId === params.id && r.targetType === 'SHOP');
    return HttpResponse.json({ reviews });
  }),

  // Get shop workshops
  http.get('/api/shops/:id/workshops', ({ params }) => {
    const workshops = mockWorkshops.filter(w => w.shopId === params.id);
    return HttpResponse.json({ workshops });
  }),

  // Get shop stats
  http.get('/api/shops/:id/stats', ({ params }) => {
    const workshops = mockWorkshops.filter(w => w.shopId === params.id);
    const activeWorkshops = workshops.filter(w => w.status === 'ACTIVE');
    
    const stats = {
      totalWorkshops: workshops.length,
      activeWorkshops: activeWorkshops.length,
      totalBookings: workshops.reduce((sum, w) => sum + w.seatsBooked, 0),
      totalRevenue: workshops.reduce((sum, w) => sum + (w.seatsBooked * w.price), 0),
      averageRating: mockShops.find(s => s.id === params.id)?.rating || 0,
      pendingApprovals: workshops.filter(w => w.status === 'PENDING').length
    };
    
    return HttpResponse.json({ stats });
  })
];
