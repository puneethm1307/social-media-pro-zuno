# Frontend Service

Next.js frontend application for the social media platform.

## Features

- User authentication (login/register)
- Feed with paginated posts
- Create posts with image uploads
- User profiles
- Real-time updates (WebSocket ready)
- Responsive design with Tailwind CSS

## Setup

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_MEDIA_URL=http://localhost:8000
```

## Running

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production

```bash
npm run build
npm start
```

## Project Structure

- `app/` - Next.js app directory (pages and layouts)
- `components/` - React components
- `lib/` - Utility functions and API clients
- `store/` - Zustand state management

