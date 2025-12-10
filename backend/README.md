# Backend Service

NestJS backend API for the social media application.

## Features

- JWT-based authentication with refresh tokens
- User management
- Posts CRUD operations
- Redis caching for feed
- WebSocket support for real-time features
- Rate limiting
- MongoDB for data storage

## Setup

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
MONGODB_URI=mongodb://admin:admin123@localhost:27017/socialmedia?authSource=admin
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000
```

## Running

### Development

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### Posts
- `GET /api/posts` - Get paginated feed
- `GET /api/posts/:id` - Get a post
- `POST /api/posts` - Create a post (auth required)
- `PATCH /api/posts/:id` - Update a post (auth required, owner only)
- `DELETE /api/posts/:id` - Delete a post (auth required, owner/admin)
- `POST /api/posts/:id/like` - Like/unlike a post (auth required)

### Users
- `GET /api/users/me` - Get current user (auth required)

