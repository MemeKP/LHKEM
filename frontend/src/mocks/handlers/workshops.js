import { http, HttpResponse } from 'msw';
import { mockWorkshops, mockReviews } from '../data/mockShops';

export const workshopHandlers = [
  // Get all workshops
  http.get('/api/workshops', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const status = url.searchParams.get('status');
    const communityId = url.searchParams.get('communityId');
    
    let filtered = mockWorkshops;
    
    if (category && category !== 'all') {
      filtered = filtered.filter(w => w.category === category);
    }
    
    if (status) {
      filtered = filtered.filter(w => w.status === status);
    }
    
    if (communityId) {
      filtered = filtered.filter(w => w.communityId === communityId);
    }
    
    return HttpResponse.json({ workshops: filtered });
  }),

  // Get workshop by ID
  http.get('/api/workshops/:id', ({ params }) => {
    const workshop = mockWorkshops.find(w => w.id === params.id);
    
    if (!workshop) {
      return HttpResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }
    
    return HttpResponse.json({ workshop });
  }),

  // Create workshop
  http.post('/api/workshops', async ({ request }) => {
    const data = await request.json();
    const newWorkshop = {
      id: `ws-${Date.now()}`,
      ...data,
      seatsBooked: 0,
      status: 'PENDING',
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockWorkshops.push(newWorkshop);
    return HttpResponse.json({ workshop: newWorkshop }, { status: 201 });
  }),

  // Update workshop
  http.put('/api/workshops/:id', async ({ params, request }) => {
    const data = await request.json();
    const index = mockWorkshops.findIndex(w => w.id === params.id);
    
    if (index === -1) {
      return HttpResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }
    
    mockWorkshops[index] = {
      ...mockWorkshops[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    return HttpResponse.json({ workshop: mockWorkshops[index] });
  }),

  // Delete workshop
  http.delete('/api/workshops/:id', ({ params }) => {
    const index = mockWorkshops.findIndex(w => w.id === params.id);
    
    if (index === -1) {
      return HttpResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }
    
    mockWorkshops.splice(index, 1);
    return HttpResponse.json({ success: true });
  }),

  // Approve workshop (Community Admin)
  http.post('/api/workshops/:id/approve', ({ params }) => {
    const index = mockWorkshops.findIndex(w => w.id === params.id);
    
    if (index === -1) {
      return HttpResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }
    
    mockWorkshops[index].status = 'ACTIVE';
    mockWorkshops[index].updatedAt = new Date().toISOString();
    
    return HttpResponse.json({ workshop: mockWorkshops[index] });
  }),

  // Reject workshop (Community Admin)
  http.post('/api/workshops/:id/reject', ({ params }) => {
    const index = mockWorkshops.findIndex(w => w.id === params.id);
    
    if (index === -1) {
      return HttpResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }
    
    mockWorkshops[index].status = 'REJECTED';
    mockWorkshops[index].updatedAt = new Date().toISOString();
    
    return HttpResponse.json({ workshop: mockWorkshops[index] });
  }),

  // Get workshop reviews
  http.get('/api/workshops/:id/reviews', ({ params }) => {
    const reviews = mockReviews.filter(r => r.targetId === params.id && r.targetType === 'WORKSHOP');
    return HttpResponse.json({ reviews });
  }),

  // Enroll in workshop
  http.post('/api/workshops/:id/enroll', async ({ params, request }) => {
    const data = await request.json();
    const workshop = mockWorkshops.find(w => w.id === params.id);
    
    if (!workshop) {
      return HttpResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }
    
    if (workshop.seatsBooked >= workshop.seatLimit) {
      return HttpResponse.json({ error: 'Workshop is full' }, { status: 400 });
    }
    
    workshop.seatsBooked += data.participants || 1;
    
    const enrollment = {
      id: `enroll-${Date.now()}`,
      workshopId: params.id,
      userId: data.userId,
      participants: data.participants || 1,
      totalPrice: workshop.price * (data.participants || 1),
      status: 'CONFIRMED',
      paymentStatus: 'PENDING',
      enrollmentDate: new Date().toISOString(),
      workshopTitle: workshop.title,
      workshopDate: workshop.startDateTime
    };
    
    return HttpResponse.json({ enrollment }, { status: 201 });
  })
];
