# Feest - Event Management Platform

A modern, feature-rich event management platform built with Next.js 14, offering comprehensive tools for organizing, managing, and hosting events.

## Features

- **Event Management**
  - Create and manage events
  - Track attendance and registrations
  - Real-time guest list updates
  - Check-in system with QR code support
  - Recurring event scheduling

- **User Features**
  - Authentication with Clerk
  - Role-based access control
  - User profiles and preferences
  - Event organizer dashboard

- **Interactive Components**
  - Real-time chat for event participants
  - Calendar integration
  - Interactive event analytics
  - Guest list management
  - Waitlist system

- **Advanced Features**
  - Google Calendar integration
  - Email notifications via Resend
  - Real-time updates with Pusher
  - Rate limiting
  - Data export (Excel/CSV)

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Authentication**: Clerk
- **Database**: MongoDB with Mongoose
- **Real-time**: Pusher
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **Monitoring**: Sentry
- **Email**: Resend
- **Testing**: Jest + React Testing Library
- **API Mocking**: MSW (Mock Service Worker)

## Prerequisites

Before you begin, ensure you have:
- Node.js 18.0 or later
- MongoDB instance
- npm or yarn package manager
- Required environment variables (see below)

## Getting Started

1. **Clone the repository**
```bash
git clone https://github.com/alani4837/feestApp.git
cd feest
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory with the following variables:
```env
# Database
DATABASE_URL=your_mongodb_url

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Pusher
NEXT_PUBLIC_PUSHER_APP_KEY=your_pusher_app_key
PUSHER_APP_ID=your_pusher_app_id
PUSHER_SECRET=your_pusher_secret
NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster

# Email
RESEND_API_KEY=your_resend_api_key

# Sentry
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

5. **Open [http://localhost:3000](http://localhost:3000)**

## Project Structure

```
src/
├── app/                 # Next.js 14 app directory
├── components/          # Reusable components
├── lib/                 # Utility functions and configurations
├── emails/             # Email templates
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── mocks/              # MSW handlers for testing
```

## Testing

The project uses Jest and React Testing Library for testing. MSW is used for API mocking.

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

## Deployment

The application can be deployed to any platform that supports Next.js applications. Here are some recommended platforms:

- Vercel (recommended)
- AWS
- Google Cloud Platform


## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Clerk](https://clerk.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Pusher](https://pusher.com/)
- [MongoDB](https://www.mongodb.com/)

## Support

For support, email support@feest.com or join our Slack channel.
