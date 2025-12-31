import { http, HttpResponse, delay } from 'msw';
import { mockUsers, mockEnrollments } from '../data/mockUsers';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const usersHandlers = [
  http.get(`${API_BASE}/users/:id`, async ({ params }) => {
    await delay(300);
    
    const user = mockUsers.find(u => u.id === params.id);
    
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    const { password: _, ...userWithoutPassword } = user;
    
    return HttpResponse.json({
      user: userWithoutPassword
    });
  }),

  http.put(`${API_BASE}/users/:id`, async ({ params, request }) => {
    await delay(500);
    
    const updates = await request.json();
    const userIndex = mockUsers.findIndex(u => u.id === params.id);
    
    if (userIndex === -1) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...updates,
      id: params.id
    };
    
    const { password: _, ...userWithoutPassword } = mockUsers[userIndex];
    
    return HttpResponse.json({
      user: userWithoutPassword,
      message: 'User updated successfully'
    });
  }),

  http.get(`${API_BASE}/users/:id/enrollments`, async ({ params }) => {
    await delay(400);
    
    const userEnrollments = mockEnrollments.filter(
      e => e.userId === params.id
    );
    
    return HttpResponse.json({
      enrollments: userEnrollments,
      total: userEnrollments.length
    });
  })
];
