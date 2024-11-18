import { http, HttpResponse } from 'msw';

export const handlers = [
  // Events endpoints
  http.get('/api/events', async () => {
    return HttpResponse.json([
      {
        id: '1',
        title: 'Mock Conference 2024',
        description: 'A mock event for testing',
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-02'),
        location: {
          venue: 'Mock Venue',
          address: '123 Test Street',
        },
        capacity: 100,
        status: 'published',
        visibility: 'public',
        organizerId: 'user_123',
        coHosts: []
      }
    ]);
  }),

  // Event stats endpoint
  http.get('/api/events/stats', async () => {
    return HttpResponse.json({
      totalEvents: 10,
      upcomingEvents: 5,
      totalAttendees: 150,
      averageAttendance: 85
    });
  }),

  // Event activities endpoint
  http.get('/api/activities', async () => {
    return HttpResponse.json([
      {
        id: '1',
        type: 'event_created',
        eventId: '1',
        userId: 'user_123',
        createdAt: new Date().toISOString()
      }
    ]);
  }),

  // Guest management endpoints
  http.get('/api/events/:eventId/guests', async () => {
    return HttpResponse.json([
      {
        id: '1',
        eventId: '1',
        userId: 'guest_123',
        status: 'confirmed',
        checkedIn: false
      }
    ]);
  })
];