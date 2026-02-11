import { http, HttpResponse, delay } from 'msw';
import { mockUsers } from '../data/mockUsers';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const authHandlers = [
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    await delay(500);
    
    const { email, password } = await request.json();
    
    const user = mockUsers.find(
      u => u.email === email && u.password === password
    );
    
    if (!user) {
      return HttpResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    const { password: _, ...userWithoutPassword } = user;
    const token = `mock_token_${user.id}_${Date.now()}`;
    
    return HttpResponse.json({
      user: userWithoutPassword,
      token,
      message: 'Login successful'
    });
  }),

  http.post(`${API_BASE}/auth/register`, async ({ request }) => {
    await delay(800);
    
    const userData = await request.json();
    
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      return HttpResponse.json(
        { message: 'Email already exists' },
        { status: 409 }
      );
    }
    
    const newUser = {
      id: `${Date.now()}`,
      ...userData,
      role: userData.role || 'tourist',
      createdAt: new Date().toISOString()
    };
    
    mockUsers.push(newUser);
    
    const { password: _, ...userWithoutPassword } = newUser;
    const token = `mock_token_${newUser.id}_${Date.now()}`;
    
    return HttpResponse.json({
      user: userWithoutPassword,
      token,
      message: 'Registration successful'
    });
  }),

  http.post(`${API_BASE}/auth/verify-otp`, async ({ request }) => {
    await delay(300);
    
    const { otp } = await request.json();
    
    if (otp === '123456') {
      return HttpResponse.json({
        verified: true,
        message: 'OTP verified successfully'
      });
    }
    
    return HttpResponse.json(
      { message: 'Invalid OTP' },
      { status: 400 }
    );
  }),

  http.get(`${API_BASE}/auth/me`, async ({ request }) => {
    await delay(200);
    
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    const userId = token.split('_')[2];
    
    const user = mockUsers.find(u => u.id === userId);
    
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

  http.post(`${API_BASE}/auth/logout`, async () => {
    await delay(200);
    
    return HttpResponse.json({
      message: 'Logout successful'
    });
  })
];
