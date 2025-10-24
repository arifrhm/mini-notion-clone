# Quick Start Guide

This guide will help you get the Mini Notion Clone up and running in minutes.

## Prerequisites Checklist

- [ ] Node.js (v16+) installed
- [ ] PostgreSQL (v12+) installed and running
- [ ] npm or yarn package manager
- [ ] Git installed

## 5-Minute Setup

### 1. Database Setup (2 minutes)

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE mini_notion;

# Exit PostgreSQL
\q
```

### 2. Backend Setup (2 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies (this may take a minute)
npm install

# Configure environment
# Edit .env file and update these values:
# DATABASE_USER=postgres
# DATABASE_PASSWORD=your_postgres_password
# DATABASE_NAME=mini_notion
# JWT_SECRET=change-this-to-a-random-secret-key

# Start backend server
npm run start:dev
```

Backend should now be running on `http://localhost:3001`

### 3. Frontend Setup (1 minute)

Open a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start frontend server
npm run dev
```

Frontend should now be running on `http://localhost:3000`

## First Steps in the Application

1. Open your browser to `http://localhost:3000`
2. Click **Register** to create a new account
3. Enter your email and password (min 6 characters)
4. You'll be redirected to the Notes page
5. Click **+ New Note** to create your first note
6. Add blocks by clicking the block type buttons:
   - 📝 **Text**: Rich text with formatting
   - ✅ **Checklist**: Todo items
   - 🖼️ **Image**: Images via URL
   - 💻 **Code**: Code snippets
7. Drag blocks using the ⋮⋮ handle to reorder them
8. Changes are saved automatically!

## Testing Features

### Test Authentication
- Register a new user
- Logout and login again
- Try accessing `/notes` without logging in (should redirect)

### Test Notes
- Create multiple notes
- Edit note titles
- Delete notes

### Test Blocks
- Add different block types
- Edit block content
- Delete blocks
- Reorder blocks with drag & drop

### Test Autosave
- Edit a block
- Wait 1 second
- Refresh the page
- Changes should be persisted

## Common Issues & Solutions

### Backend won't start
- **Issue**: Database connection error
- **Solution**: Check PostgreSQL is running and credentials in `.env` are correct

### Frontend won't connect to backend
- **Issue**: CORS errors in browser console
- **Solution**: Ensure backend is running on port 3001 and CORS_ORIGIN in backend/.env is `http://localhost:3000`

### Blocks not saving
- **Issue**: Authentication errors
- **Solution**: Clear cookies and login again

### npm install fails
- **Issue**: Node version too old
- **Solution**: Update Node.js to v16 or higher

## Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- Backend: Changes in `backend/src/**` auto-restart the server
- Frontend: Changes in `frontend/src/**` auto-refresh the browser

### Database Reset
If you need to reset the database:
```bash
# In PostgreSQL
DROP DATABASE mini_notion;
CREATE DATABASE mini_notion;

# Restart backend - TypeORM will recreate tables
```

### View API Endpoints
Backend runs on `http://localhost:3001`

Test with curl:
```bash
# Check health
curl http://localhost:3001

# Test registration
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Next Steps

- Read the full [README.md](README.md) for architecture details
- Explore the code in `backend/src` and `frontend/src`
- Customize the UI by editing CSS files in `frontend/src/styles`
- Add new block types by creating components in `frontend/src/components`

## Need Help?

- Check the [README.md](README.md) for detailed documentation
- Review the database schema section
- Check API endpoints documentation
- Look at the code comments for implementation details

Happy coding! 🚀
