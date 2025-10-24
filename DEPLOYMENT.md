# Deployment Guide

This guide provides instructions for deploying the Mini Notion Clone to production environments.

## Production Environment Variables

### Backend (.env)

```env
NODE_ENV=production
PORT=3001

# Database
DATABASE_HOST=your-production-db-host
DATABASE_PORT=5432
DATABASE_USER=your-db-user
DATABASE_PASSWORD=your-secure-password
DATABASE_NAME=mini_notion_prod

# JWT
JWT_SECRET=generate-a-strong-random-secret-key-here
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://your-frontend-domain.com
```

### Frontend

Update `frontend/src/services/api.ts`:

```typescript
const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'https://your-backend-domain.com',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

Create `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-domain.com
```

## Docker Deployment (Recommended)

### Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
```

### Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml

Create `docker-compose.yml` in root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: mini_notion_prod
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_USER: postgres
      DATABASE_PASSWORD: ${DB_PASSWORD}
      DATABASE_NAME: mini_notion_prod
      JWT_SECRET: ${JWT_SECRET}
      CORS_ORIGIN: ${FRONTEND_URL}
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    environment:
      VITE_API_URL: ${BACKEND_URL}
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Deploy with Docker Compose

```bash
# Create .env file with production values
cat > .env << EOF
DB_PASSWORD=your-secure-db-password
JWT_SECRET=your-jwt-secret
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://api.your-domain.com
EOF

# Build and start services
docker-compose up -d

# Check logs
docker-compose logs -f
```

## Platform-Specific Deployments

### Heroku

#### Backend
```bash
cd backend
heroku create mini-notion-backend
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set JWT_SECRET=your-secret
heroku config:set CORS_ORIGIN=https://your-frontend.herokuapp.com
git push heroku main
```

#### Frontend
```bash
cd frontend
heroku create mini-notion-frontend
heroku config:set VITE_API_URL=https://mini-notion-backend.herokuapp.com
heroku buildpacks:add heroku/nodejs
git push heroku main
```

### Vercel (Frontend)

```bash
cd frontend
npm install -g vercel
vercel --prod
```

Add environment variable in Vercel dashboard:
- `VITE_API_URL`: Your backend URL

### Railway (Backend)

1. Connect GitLab repository
2. Add PostgreSQL service
3. Set environment variables
4. Deploy from main branch

### DigitalOcean App Platform

1. Create new app from GitLab repo
2. Configure build settings:
   - Backend: `npm run build`, `npm run start:prod`
   - Frontend: `npm run build`, serve from `dist/`
3. Add PostgreSQL database
4. Set environment variables

## Database Setup

### Production Database

```bash
# Connect to production database
psql -h your-db-host -U your-db-user -d mini_notion_prod

# Verify tables (TypeORM auto-creates them)
\dt

# Create indexes for performance
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_blocks_note_id ON blocks(note_id);
CREATE INDEX idx_blocks_order ON blocks(note_id, order_index);
```

## Security Checklist

- [ ] Change JWT_SECRET to a strong random value
- [ ] Use strong database password
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS to specific domain
- [ ] Set `secure: true` for cookies in production
- [ ] Enable rate limiting
- [ ] Regular database backups
- [ ] Keep dependencies updated

## Performance Optimization

### Backend

1. **Enable Compression**
```typescript
// In main.ts
import compression from 'compression';
app.use(compression());
```

2. **Database Connection Pooling**
```typescript
// In app.module.ts TypeORM config
extra: {
  max: 10,
  min: 2,
}
```

### Frontend

1. **Code Splitting**
```typescript
// Use lazy loading for routes
const NoteEditor = lazy(() => import('./pages/NoteEditor'));
```

2. **Build Optimization**
Already configured in Vite

## Monitoring

### Health Check Endpoint

Add to `backend/src/app.controller.ts`:

```typescript
@Controller()
export class AppController {
  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
```

### Logging

Consider adding:
- Winston for structured logging
- Sentry for error tracking
- PM2 for process management

## Backup Strategy

```bash
# Daily database backup
pg_dump -h localhost -U postgres mini_notion_prod > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -h localhost -U postgres mini_notion_prod < backup_20231024.sql
```

## Scaling Considerations

1. **Horizontal Scaling**: Use load balancer for multiple backend instances
2. **Database**: Consider read replicas for heavy read loads
3. **Caching**: Add Redis for session/data caching
4. **CDN**: Serve static assets via CDN

## Post-Deployment Testing

```bash
# Test backend health
curl https://api.your-domain.com/health

# Test authentication
curl -X POST https://api.your-domain.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Monitor logs
tail -f /var/log/app.log
```

## Maintenance

- Regular security updates
- Database backups
- Monitor disk space
- Check error logs
- Performance monitoring

## Rollback Procedure

```bash
# Docker rollback
docker-compose down
git checkout previous-stable-tag
docker-compose up -d

# Heroku rollback
heroku rollback
```
