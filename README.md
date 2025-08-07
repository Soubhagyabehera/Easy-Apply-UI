# JobBot Frontend

Modern React TypeScript frontend for JobBot Phase 1.

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icons

## Features

- 🏠 **Home Page** - Landing page with features and stats
- 💼 **Jobs Page** - Browse and search job listings
- 📄 **Job Details** - Detailed job information and application
- 👤 **Profile Page** - User profile management
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- 📱 **Mobile Responsive** - Works on all device sizes

## Project Structure

```
src/
├── components/         # Reusable UI components
│   └── Layout.tsx     # Main layout with navigation
├── pages/             # Page components
│   ├── HomePage.tsx   # Landing page
│   ├── JobsPage.tsx   # Job listings
│   ├── JobDetailPage.tsx # Job details
│   └── ProfilePage.tsx # User profile
├── services/          # API service functions
│   ├── jobService.ts  # Job-related API calls
│   └── userService.ts # User-related API calls
├── types/             # TypeScript type definitions
│   ├── job.ts         # Job-related types
│   └── user.ts        # User-related types
├── hooks/             # Custom React hooks
│   └── useJobs.ts     # Job data management
├── utils/             # Utility functions
│   └── index.ts       # Common utilities
├── styles/            # Global styles
│   └── index.css      # Tailwind CSS imports
├── App.tsx            # Main App component
└── main.tsx           # Entry point
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

The frontend will be available at `http://localhost:5173`

## API Integration

The frontend is configured to work with the FastAPI backend running on `http://localhost:8000`. API calls are proxied through Vite for development.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
