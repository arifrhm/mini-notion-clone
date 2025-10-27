# Mini Notion Clone

A full-stack web application that mimics the core functionality of Notion, featuring block-based note editing with drag & drop support, JWT authentication, and autosave functionality.

## 🚀 Features

### Authentication
- JWT-based authentication with HTTP-only cookies
- User registration and login
- Protected routes for authenticated users only

### Notes Management
- Create, read, update, and delete notes
- Each note has a title and block-based content
- Real-time autosave functionality
- History tracking (last edit time and user)

### Block-Based Editor
- **Text Block**: Rich text editor powered by TipTap
- **Checklist Block**: Interactive task lists with checkboxes
- **Image Block**: Insert images via URL
- **Code Block**: Code snippet with monospace formatting

### Drag & Drop
- Reorder blocks within a note using drag & drop
- Smooth animations and visual feedback
- Persistent block order in database

## 🛠️ Tech Stack

### Backend
- **NestJS**: Progressive Node.js framework
- **TypeORM**: ORM for database operations
- **PostgreSQL**: Relational database
- **JWT**: JSON Web Tokens for authentication
- **Passport**: Authentication middleware
- **bcrypt**: Password hashing

### Frontend
- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool
- **React Router**: Client-side routing
- **React Hook Form**: Form validation and management
- **TipTap**: Rich text editor
- **@dnd-kit**: Drag and drop library
- **Axios**: HTTP client

## 📦 Project Structure

```
mini-notion-clone/
├── backend/
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── users/         # User entity
│   │   ├── notes/         # Notes module
│   │   ├── blocks/        # Blocks module
│   │   ├── common/        # Shared utilities
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/    # Reusable components
    │   ├── pages/         # Page components
    │   ├── services/      # API services
    │   ├── hooks/         # Custom hooks
    │   ├── types/         # TypeScript types
    │   ├── styles/        # CSS files
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create PostgreSQL database:
```sql
CREATE DATABASE mini_notion;
```

4. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

5. Update `.env` with your database credentials:
```
PORT=3001
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=mini_notion
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

6. Start the backend server:
```bash
npm run start:dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📊 Database Schema

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| email | VARCHAR | Unique email |
| password | VARCHAR | Hashed password |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

### Notes Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| user_id | INTEGER | Foreign key to Users |
| title | VARCHAR | Note title |
| last_edited_by | INTEGER | Last editor user ID |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

### Blocks Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| note_id | INTEGER | Foreign key to Notes |
| parent_id | INTEGER | Parent block ID (nullable) |
| type | ENUM | text, checklist, image, code |
| content | TEXT | Block content |
| order_index | INTEGER | Display order |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

## 🔐 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user

### Notes
- `GET /notes` - Get all notes for current user
- `GET /notes/:id` - Get specific note with blocks
- `POST /notes` - Create new note
- `PATCH /notes/:id` - Update note title
- `DELETE /notes/:id` - Delete note

### Blocks
- `GET /notes/:noteId/blocks` - Get all blocks for a note
- `POST /notes/:noteId/blocks` - Create new block
- `PATCH /notes/:noteId/blocks/:id` - Update block
- `DELETE /notes/:noteId/blocks/:id` - Delete block
- `POST /notes/:noteId/blocks/reorder` - Reorder blocks

## 🎯 Key Features Implementation

### JWT Authentication with HTTP-Only Cookies
- Tokens stored in HTTP-only cookies for security
- Automatic token validation on protected routes
- Cookie cleared on logout

### React Hook Form
- All forms use React Hook Form for validation
- Email validation on login/register
- Password strength validation
- Error handling and display

### Drag & Drop
- Implemented using @dnd-kit library
- Smooth animations during drag
- Visual feedback with hover states
- Automatic save after reordering

### Autosave
- Debounced save on content changes
- Visual indicator showing save status
- Prevents data loss

### Rich Text Editor
- TipTap integration for text blocks
- Bold, italic, headings support
- Clean and intuitive interface

## 🧪 Testing

To test the application:

1. Start both backend and frontend servers
2. Navigate to `http://localhost:3000`
3. Register a new account
4. Create a note and add different block types
5. Try reordering blocks with drag & drop
6. Test autosave by editing and checking database

## 🚧 Future Enhancements (Bonus Features)

### Collaborative Editing (WebSocket)
- Real-time synchronization between multiple users
- Conflict resolution for simultaneous edits
- User presence indicators

### Additional Features
- Note sharing with other users
- Markdown export/import
- Search functionality
- Tags and categories
- Dark mode

## 👥 Author

Developed as a fullstack assessment project demonstrating:
- NestJS backend architecture
- React frontend with TypeScript
- Authentication and authorization
- Database design and ORM usage
- Modern UI/UX patterns
- Form handling with React Hook Form
- Drag & drop interactions
