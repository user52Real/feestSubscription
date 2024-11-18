interface Event {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: {
      address: string;
      coordinates: {
        lat: number;
        lng: number;
      };
      venue: string;
    };
    capacity: number;
    status: 'draft' | 'published' | 'cancelled';
    visibility: 'public' | 'private';
    organizerId: string;
    coHosts: string[];
    moderators: string[];
    recurring?: {
      pattern: 'daily' | 'weekly' | 'monthly';
      interval: number;
      endDate: Date;
    };
    createdAt: Date;
    updatedAt: Date;
  }