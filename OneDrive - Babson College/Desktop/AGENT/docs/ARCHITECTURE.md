# Omriq Hospitality AI - Architecture Documentation

## System Overview

Omriq Hospitality AI is a comprehensive AI-powered hotel operations platform built with a modern, scalable architecture.

## Tech Stack

- **Backend**: Node.js + TypeScript + Express
- **Database**: PostgreSQL (via Prisma ORM)
- **AI/ML**: OpenAI GPT-4
- **Voice**: Twilio
- **Real-time**: WebSockets (Socket.io)
- **Authentication**: JWT

## Architecture Layers

### 1. API Layer (`src/routes/`, `src/controllers/`)
- RESTful API endpoints
- Request validation and error handling
- Authentication and authorization middleware

### 2. Service Layer (`src/services/`)
- **AI Service**: OpenAI integration for natural language processing
- **Call Service**: Voice call handling and transcription
- **Message Service**: Multi-channel messaging (SMS, WhatsApp, Email, etc.)
- **Task Service**: Task automation and routing
- **Upsell Service**: Revenue optimization engine

### 3. Integration Layer (`src/integrations/`)
- **PMS Integrations**: Opera, Mews, Cloudbeds, RoomRaccoon
- **PBX Integrations**: Twilio, RingCentral, Avaya, Cisco
- **CRS Integrations**: SynXis, SiteMinder, Guestline
- **POS Integrations**: Toast, Checkfront, Lightspeed

### 4. Data Layer (`prisma/schema.prisma`)
- Comprehensive database schema
- Relationships between hotels, guests, bookings, tasks, calls, messages
- Analytics and integration tracking

## Core Modules

### AI Receptionist
- Handles 100% of inbound calls
- Natural language understanding
- Intent detection and sentiment analysis
- Automatic task creation from calls

### Guest Messaging Hub
- Unified interface for all messaging channels
- AI-powered instant responses
- Automatic escalation for complex issues
- Multi-language support

### Task Automation Engine
- Automatic task creation from various sources
- Smart routing based on task type
- Priority-based assignment
- SLA tracking and alerts

### Upsell & Revenue Optimization
- AI-powered upselling suggestions
- Historical pattern analysis
- Real-time availability integration
- Revenue tracking

### Analytics & Insights
- Real-time dashboard statistics
- Call analytics
- Message analytics
- Task performance metrics
- Revenue analytics
- Predictive insights

## Database Schema

### Core Entities
- **Hotel**: Hotel/property information and settings
- **User**: Staff members with roles and departments
- **Guest**: Guest profiles and preferences
- **Room**: Room inventory and status
- **Booking**: Reservations and check-in/out

### Operational Entities
- **Call**: Voice call records with transcripts
- **Message**: Multi-channel message history
- **Task**: Task management and tracking
- **UpsellOpportunity**: Revenue optimization opportunities

### Integration Entities
- **Integration**: Integration configurations and status
- **AnalyticsEvent**: Event tracking for analytics

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Hotels
- `GET /api/hotels` - List hotels
- `GET /api/hotels/:id` - Get hotel details
- `PUT /api/hotels/:id` - Update hotel
- `GET /api/hotels/:id/stats` - Get hotel statistics

### Calls
- `GET /api/calls` - List calls
- `GET /api/calls/:id` - Get call details
- `POST /api/calls/webhook/twilio` - Twilio webhook

### Messages
- `GET /api/messages` - List messages
- `POST /api/messages` - Send message
- `POST /api/messages/webhook/:channel` - Channel webhook

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/status` - Update task status
- `PATCH /api/tasks/:id/assign` - Assign task

### Bookings
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking
- `PATCH /api/bookings/:id/checkin` - Check in
- `PATCH /api/bookings/:id/checkout` - Check out

### Analytics
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/calls` - Call analytics
- `GET /api/analytics/messages` - Message analytics
- `GET /api/analytics/tasks` - Task analytics
- `GET /api/analytics/revenue` - Revenue analytics

### Integrations
- `GET /api/integrations` - List integrations
- `POST /api/integrations` - Create integration
- `POST /api/integrations/:id/test` - Test integration
- `POST /api/integrations/:id/sync` - Sync integration

## Security

- JWT-based authentication
- Role-based access control (Admin, Manager, Staff, Viewer)
- Input validation
- SQL injection prevention (Prisma ORM)
- CORS configuration
- Helmet.js security headers

## Scalability Considerations

- Stateless API design
- Database indexing for performance
- Service layer separation for horizontal scaling
- Integration abstraction for easy extension
- Event-driven architecture for real-time updates

## Future Enhancements

- Real-time WebSocket connections for live updates
- Machine learning models for predictive analytics
- Advanced voice AI with emotion detection
- IoT device integration (smart locks, thermostats)
- Mobile app for staff
- Guest mobile app
- Advanced reporting and BI dashboards

