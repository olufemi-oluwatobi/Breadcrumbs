# Video Content Creator Application

## Overview

This is a full-stack web application for creating video content through an AI-powered workflow. The application combines script/audio content with media files, processes video frames, and uses AI synthesis to create final video content. Built with React frontend, Express backend, PostgreSQL database, and FFmpeg for video processing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state, React hooks for local state
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Session Management**: Express sessions with PostgreSQL store (connect-pg-simple)
- **API Design**: RESTful API with `/api` prefix
- **Development**: Hot module reloading with Vite integration

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon Database serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Database migrations in `./migrations` directory
- **Session Storage**: PostgreSQL-based session store

## Key Components

### Database Schema
- **users**: User authentication and profile data
- **video_projects**: Main project entities with workflow state tracking
- **chat_messages**: Chat interface messages with metadata support

### Video Processing Pipeline
- **FFmpeg Integration**: Client-side video frame extraction using @ffmpeg/ffmpeg
- **Frame Management**: Automated frame extraction with progress tracking
- **Workflow States**: Draft → Processing → Completed → Error states

### Chat Interface System
- **Multi-step Workflow**: Guided 6-step video creation process
- **Real-time Progress**: Live updates during frame extraction
- **File Upload Zones**: Drag-and-drop support for various media types
- **Message Types**: System, user, progress, success, error, and processing messages

### UI Component System
- **Design System**: shadcn/ui with Radix UI primitives
- **Responsive Design**: Mobile-first approach with breakpoint utilities
- **Theme Support**: CSS custom properties with light/dark mode capability
- **Accessibility**: Full ARIA support through Radix UI components

## Data Flow

### Project Creation Workflow
1. **Script & Audio Upload**: Users upload content files
2. **Media Collection**: Additional video/image/audio files
3. **Frame Extraction**: FFmpeg processes video files client-side
4. **AI Synthesis**: Combines materials (placeholder for AI integration)
5. **Preview & Review**: User reviews generated content
6. **Export & Share**: Final output generation

### Authentication Flow
- Session-based authentication with PostgreSQL storage
- User registration and login through Express routes
- Session persistence across browser sessions

### File Processing Flow
- Client-side file validation and preview
- FFmpeg-based video frame extraction in browser
- Progress tracking with real-time UI updates
- Extracted frames stored as blob URLs with cleanup

## External Dependencies

### Core Dependencies
- **@ffmpeg/ffmpeg**: Client-side video processing
- **@neondatabase/serverless**: PostgreSQL database connection
- **@tanstack/react-query**: Server state management
- **drizzle-orm**: Type-safe database operations

### UI Dependencies
- **@radix-ui/***: Headless UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type safety and development experience
- **tsx**: TypeScript execution for server development

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution with auto-reload
- **Database**: Neon Database serverless PostgreSQL
- **Build Process**: Concurrent frontend and backend development

### Production Build
- **Frontend**: Vite production build to `dist/public`
- **Backend**: esbuild bundle to `dist/index.js`
- **Static Assets**: Served through Express static middleware
- **Database**: Drizzle migrations for schema updates

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment mode (development/production)
- **Session Configuration**: Secure session management in production

### Replit Integration
- **Error Overlay**: Runtime error modal for development
- **Cartographer**: Development tooling integration
- **Dev Banner**: Replit environment indicators

The application uses a monorepo structure with shared TypeScript types and schemas, enabling type safety across the full stack while maintaining clear separation between client and server concerns.