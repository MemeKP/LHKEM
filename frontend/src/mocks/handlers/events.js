import { http, HttpResponse } from 'msw';
import { mockEvents } from '../data/mockShops';

export const eventHandlers = [
  // Get all events
  http.get('/api/events', ({ request }) => {
    const url = new URL(request.url);
    const communityId = url.searchParams.get('communityId');
    const status = url.searchParams.get('status');
    
    let filtered = mockEvents;
    
    if (communityId) {
      filtered = filtered.filter(e => e.communityId === communityId);
    }
    
    if (status) {
      filtered = filtered.filter(e => e.status === status);
    }
    
    return HttpResponse.json({ events: filtered });
  }),

  // Get event by ID
  http.get('/api/events/:id', ({ params }) => {
    const event = mockEvents.find(e => e.id === params.id);
    
    if (!event) {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return HttpResponse.json({ event });
  }),

  // Create event
  http.post('/api/events', async ({ request }) => {
    const data = await request.json();
    const newEvent = {
      id: `event-${Date.now()}`,
      ...data,
      status: 'UPCOMING',
      createdAt: new Date().toISOString()
    };
    
    mockEvents.push(newEvent);
    return HttpResponse.json({ event: newEvent }, { status: 201 });
  }),

  // Update event
  http.put('/api/events/:id', async ({ params, request }) => {
    const data = await request.json();
    const index = mockEvents.findIndex(e => e.id === params.id);
    
    if (index === -1) {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    mockEvents[index] = { ...mockEvents[index], ...data };
    return HttpResponse.json({ event: mockEvents[index] });
  }),

  // Delete event
  http.delete('/api/events/:id', ({ params }) => {
    const index = mockEvents.findIndex(e => e.id === params.id);
    
    if (index === -1) {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    mockEvents.splice(index, 1);
    return HttpResponse.json({ success: true });
  })
];
