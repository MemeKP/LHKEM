import { http, HttpResponse } from 'msw';
import { mockCommunities } from '../data/mockShops';
import { mockShops, mockWorkshops, mockEvents } from '../data/mockShops';

export const communityHandlers = [
  // Get all communities
  http.get('/api/communities', () => {
    return HttpResponse.json({ communities: mockCommunities });
  }),

  // Get community by ID
  http.get('/api/communities/:id', ({ params }) => {
    const community = mockCommunities.find(c => c.id === params.id);
    
    if (!community) {
      return HttpResponse.json({ error: 'Community not found' }, { status: 404 });
    }
    
    return HttpResponse.json({ community });
  }),

  // Get community stats
  http.get('/api/communities/:id/stats', ({ params }) => {
    const shops = mockShops.filter(s => s.communityId === params.id);
    const workshops = mockWorkshops.filter(w => w.communityId === params.id);
    const events = mockEvents.filter(e => e.communityId === params.id);
    
    const stats = {
      totalShops: shops.length,
      totalWorkshops: workshops.length,
      totalEvents: events.length,
      pendingApprovals: workshops.filter(w => w.status === 'PENDING').length,
      totalVisitors: 1250,
      monthlyRevenue: workshops.reduce((sum, w) => sum + (w.seatsBooked * w.price), 0)
    };
    
    return HttpResponse.json({ stats });
  }),

  // Create community (Platform Admin)
  http.post('/api/communities', async ({ request }) => {
    const data = await request.json();
    const newCommunity = {
      id: `comm-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString()
    };
    
    mockCommunities.push(newCommunity);
    return HttpResponse.json({ community: newCommunity }, { status: 201 });
  }),

  // Update community
  http.put('/api/communities/:id', async ({ params, request }) => {
    const data = await request.json();
    const index = mockCommunities.findIndex(c => c.id === params.id);
    
    if (index === -1) {
      return HttpResponse.json({ error: 'Community not found' }, { status: 404 });
    }
    
    mockCommunities[index] = { ...mockCommunities[index], ...data };
    return HttpResponse.json({ community: mockCommunities[index] });
  })
];
