# Social Media Web Application — Full Starter

A complete, production-minded starter codebase for a social media web application with a full feature set. Built with modern technologies and best practices.

## 🏗️ Architecture

- **Frontend**: Next.js 14 (React + TypeScript) with Tailwind CSS
- **Backend API**: NestJS (TypeScript) on Node.js 22
- **Media Service**: FastAPI (Python 3.14) for image processing
- **Database**: MongoDB with Mongoose (NestJS) and Motor (FastAPI)
- **Object Storage**: MinIO (S3-compatible) for media files
- **Cache/Broker**: Redis for caching, rate-limiting, and pub/sub
- **Infrastructure**: Docker Compose for local development

## 📁 Project Structure

```
social-media-pro-zuno/
├── backend/          # NestJS backend API
├── frontend/         # Next.js frontend application
├── media/            # FastAPI media service
├── docker-compose.yml # Infrastructure services
├── Makefile          # Common development tasks
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 22.x
- Python 3.14
- Docker Desktop
- npm

### Option 1: Run Everything with Docker

```bash
# Start infrastructure (MongoDB, Redis, MinIO)
docker compose up -d mongodb redis minio

# Wait for services to be healthy (about 10 seconds)
sleep 10

# Start all services
docker compose up -d --build
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Media Service: http://localhost:8000
- MinIO Console: http://localhost:9001 (minioadmin/minioadmin123)

### Option 2: Run Services Locally (Recommended for Development)

#### 1. Start Infrastructure

```bash
# Start MongoDB, Redis, and MinIO
docker compose up -d mongodb redis minio

# Wait for services to be healthy
sleep 10
```

#### 2. Start Backend (NestJS)

```bash
cd backend
npm install
cp ../.env.example .env  # Edit .env with your values
npm run start:dev
```

Backend will run on http://localhost:3001

#### 3. Start Media Service (FastAPI)

```bash
cd media
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Media service will run on http://localhost:8000

#### 4. Start Frontend (Next.js)

```bash
cd frontend
npm install
cp ../.env.example .env.local  # Edit .env.local with your values
npm run dev
```

Frontend will run on http://localhost:3000

### Using Makefile

```bash
# Start infrastructure
make infra-up

# Start backend (in separate terminal)
make backend-install
make backend-dev

# Start media service (in separate terminal)
make media-install
make media-dev

# Start frontend (in separate terminal)
make frontend-install
make frontend-dev
```

## 🧪 Smoke Tests

Run these commands to verify everything is working:

### 1. Register a User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "displayName": "Test User"
  }'
```

Expected response:
```json
{
  "user": {
    "id": "...",
    "email": "test@example.com",
    "username": "testuser",
    "displayName": "Test User"
  },
  "accessToken": "...",
  "refreshToken": "..."
}
```

### 2. Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the `accessToken` from the response.

### 3. Upload an Image

```bash
# Replace YOUR_ACCESS_TOKEN with the token from step 2
curl -X POST http://localhost:8000/api/media/upload-image \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/your/image.jpg"
```

Expected response:
```json
{
  "file_key": "images/abc123.jpg",
  "presigned_url": "http://localhost:9000/...",
  "public_url": "/api/media/file/images/abc123.jpg",
  "metadata": {
    "original_filename": "image.jpg",
    "content_type": "image/jpeg",
    "file_size": 12345,
    "width": 1920,
    "height": 1080
  }
}
```

Save the `file_key` from the response.

### 4. Create a Post

```bash
# Replace YOUR_ACCESS_TOKEN and FILE_KEY with values from previous steps
curl -X POST http://localhost:3001/api/posts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "caption": "My first post!",
    "mediaUrls": ["images/abc123.jpg"]
  }'
```

Expected response:
```json
{
  "_id": "...",
  "authorId": "...",
  "caption": "My first post!",
  "mediaUrls": ["images/abc123.jpg"],
  "likesCount": 0,
  "commentsCount": 0,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### 5. Fetch Feed

```bash
curl http://localhost:3001/api/posts?page=1&limit=10
```

### 6. View in Frontend

Open http://localhost:3000 in your browser:
- Login with the credentials from step 1
- You should see your post in the feed
- Click "Create Post" to upload images and create new posts

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` in the root directory and configure:

**Backend (.env)**
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

**Media Service (.env)**
```env
MONGODB_URI=mongodb://admin:admin123@localhost:27017/socialmedia?authSource=admin
REDIS_HOST=localhost
REDIS_PORT=6379
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_USE_SSL=false
MINIO_BUCKET_NAME=media
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_MEDIA_URL=http://localhost:8000
```

## 📚 Features

### ✅ Implemented

- **Authentication**: JWT-based auth with access/refresh tokens, secure password hashing
- **Posts**: CRUD operations with pagination, ownership checks, likes
- **Media Upload**: Image upload with validation, MinIO storage, presigned URLs
- **Image Processing**: Thumbnail generation and WebP conversion (background)
- **Caching**: Redis caching for feed with invalidation
- **Rate Limiting**: Redis-based rate limiting middleware
- **WebSockets**: Socket.IO gateway for real-time features (scaffolded)
- **Search**: MongoDB text search (basic, Elasticsearch-ready)
- **Security**: Helmet, CORS, input validation, token blacklisting

### 🚧 Advanced Features (Scaffolded)

- Real-time notifications via WebSocket
- Background job processing for heavy tasks
- Image auto-orientation based on EXIF
- PWA support (manifest ready)
- Monitoring integration (Sentry stub)

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run test:cov      # Coverage
```

### Media Service Tests

```bash
cd media
source venv/bin/activate
pytest
```

### Frontend Tests

```bash
cd frontend
npm run lint
npm run type-check
```

## 🐳 Docker Commands

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Rebuild and restart
docker compose up -d --build

# Stop and remove volumes
docker compose down -v
```

## 📝 Development Workflow

1. **Start infrastructure**: `make infra-up` or `docker compose up -d mongodb redis minio`
2. **Start backend**: `cd backend && npm run start:dev`
3. **Start media service**: `cd media && source venv/bin/activate && uvicorn main:app --reload`
4. **Start frontend**: `cd frontend && npm run dev`
5. **Make changes** - Hot reload is enabled for all services
6. **Run tests** before committing

## 🔒 Security Best Practices

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT tokens with expiration
- ✅ Token blacklisting on logout
- ✅ Input validation with class-validator
- ✅ CORS configuration
- ✅ Helmet.js for security headers
- ✅ Rate limiting
- ✅ File type and size validation
- ✅ SQL injection prevention (MongoDB)
- ✅ XSS protection (React)

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout (blacklist tokens)

### Posts
- `GET /api/posts` - Get paginated feed (query: `page`, `limit`)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create post (auth required)
- `PATCH /api/posts/:id` - Update post (auth required, owner only)
- `DELETE /api/posts/:id` - Delete post (auth required, owner/admin)
- `POST /api/posts/:id/like` - Like/unlike post (auth required)
- `GET /api/posts/search?q=query` - Search posts
- `GET /api/posts/user/:userId` - Get user's posts

### Users
- `GET /api/users/me` - Get current user (auth required)

### Media
- `POST /api/media/upload-image` - Upload image
- `GET /api/media/file/:fileKey` - Get presigned URL
- `GET /api/media/metadata/:fileKey` - Get file metadata

## 🚀 Production Considerations

### Before Deploying

1. **Secrets Management**
   - Use environment variables or secret management service (AWS Secrets Manager, HashiCorp Vault)
   - Never commit secrets to git
   - Rotate JWT secrets regularly

2. **Database**
   - Set up MongoDB replica set for high availability
   - Configure backups (automated daily backups)
   - Use connection pooling
   - Enable authentication and TLS

3. **Object Storage**
   - Use production S3-compatible service (AWS S3, DigitalOcean Spaces, etc.)
   - Configure bucket policies and CORS
   - Set up lifecycle policies for old files
   - Enable versioning

4. **Redis**
   - Use managed Redis service (AWS ElastiCache, Redis Cloud)
   - Configure persistence (AOF or RDB)
   - Set up replication for high availability

5. **HTTPS**
   - Use reverse proxy (Nginx, Traefik) with Let's Encrypt
   - Configure SSL/TLS certificates
   - Enable HSTS

6. **Monitoring & Logging**
   - Set up application monitoring (Sentry, DataDog, New Relic)
   - Configure centralized logging (ELK stack, CloudWatch)
   - Set up health checks and alerts
   - Monitor database and Redis performance

7. **CI/CD**
   - Use GitHub Actions or similar CI/CD platform
   - Run tests on every PR
   - Automated deployments to staging/production
   - Database migrations strategy

8. **Scaling**
   - Use load balancer for multiple backend instances
   - Horizontal scaling for all services
   - CDN for static assets and media
   - Database read replicas
   - Redis cluster for high availability

9. **Security**
   - Regular security audits
   - Dependency updates (Dependabot)
   - Rate limiting per user/IP
   - Content Security Policy (CSP)
   - Regular penetration testing

10. **Performance**
    - Enable Redis caching for frequently accessed data
    - Use CDN for media files
    - Optimize database queries and indexes
    - Implement pagination everywhere
    - Use image optimization (WebP, responsive images)

## 🛠️ Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
docker compose ps mongodb

# Check MongoDB logs
docker compose logs mongodb

# Test connection
mongosh "mongodb://admin:admin123@localhost:27017/socialmedia?authSource=admin"
```

### Redis Connection Issues

```bash
# Check if Redis is running
docker compose ps redis

# Test Redis connection
redis-cli -h localhost -p 6379 ping
```

### MinIO Issues

```bash
# Check if MinIO is running
docker compose ps minio

# Access MinIO console
# Open http://localhost:9001
# Login: minioadmin / minioadmin123
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000  # or :3001, :8000

# Kill process
kill -9 <PID>
```

## 📖 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Redis Documentation](https://redis.io/documentation)
- [MinIO Documentation](https://docs.min.io/)

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

---

**Note**: This is a starter codebase. For production use, implement additional security measures, error handling, monitoring, and scaling strategies as outlined in the Production Considerations section.

# social-media-pro-zuno
