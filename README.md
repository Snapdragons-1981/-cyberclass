# CYBERCLASS

A cyberpunk-themed student academic task and assignment management system.

## Features

- **Dashboard** - Overview of all tasks, deadlines, and priorities
- **Task Management** - Create, edit, complete, and organize tasks
- **Kanban Board** - Drag-and-drop task organization
- **Calendar** - View tasks by date with month/week views
- **Courses** - Manage courses, instructors, and semesters
- **Statistics** - Track productivity and completion rates
- **Notifications** - In-app notification center
- **Theme Customization** - Cyberpunk theme with customizable accent colors
- **PWA Support** - Installable on mobile devices
- **Responsive Design** - Works on all screen sizes
- **Row Level Security** - Complete data isolation between users

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, React, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage, RLS)
- **Deployment**: Vercel, GitHub
- **PWA**: Service Worker, Web App Manifest

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cyberclass.git
cd cyberclass
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL migration from `supabase/migrations/001_initial_schema.sql`
   - Enable Email Authentication in Authentication settings

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## PWA Installation

### Android Chrome
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home Screen"
4. Confirm installation

### Desktop
1. Open the app in Chrome/Edge
2. Click the install icon in the address bar
3. Confirm installation

## Deployment

### Vercel
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Database Schema

The application uses Supabase PostgreSQL with Row Level Security:

- `profiles` - User profiles
- `semesters` - Academic semesters
- `courses` - Course information
- `instructors` - Instructor details
- `tasks` - All academic tasks
- `tags` - Task tags
- `reminders` - Task reminders
- `notifications` - User notifications
- `attachments` - File attachments

## Security

- All data is isolated per user via Supabase RLS
- Authentication handled by Supabase Auth
- No secrets exposed to client
- Secure file storage with user-scoped access

## License

MIT
