# Quick Start Guide

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- OpenAI API key
- Twilio account (for voice features)

## Setup Steps

### 1. Clone and Install

```bash
git clone https://github.com/kp123kdk3/HOTEL-AGENT.git
cd HOTEL-AGENT
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/omriq_db"

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4-turbo-preview

# Twilio (optional for voice features)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Database Setup

```bash
# Create database
createdb omriq_db

# Run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### 5. Test the API

```bash
# Health check
curl http://localhost:3000/health

# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hotel.com",
    "password": "password123",
    "firstName": "Admin",
    "lastName": "User",
    "hotelId": "your-hotel-id",
    "role": "ADMIN"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hotel.com",
    "password": "password123"
  }'
```

## Next Steps

1. **Create a Hotel**: Use the API to create your first hotel property
2. **Set up Integrations**: Connect your PMS, PBX, and other systems
3. **Configure AI**: Customize AI responses for your hotel brand
4. **Add Staff**: Create user accounts for your team
5. **Start Using**: Begin handling calls, messages, and tasks

## API Documentation

Once the server is running, you can explore the API endpoints:

- Authentication: `/api/auth/*`
- Hotels: `/api/hotels/*`
- Calls: `/api/calls/*`
- Messages: `/api/messages/*`
- Tasks: `/api/tasks/*`
- Bookings: `/api/bookings/*`
- Analytics: `/api/analytics/*`
- Integrations: `/api/integrations/*`

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists

### OpenAI API Errors
- Verify OPENAI_API_KEY is correct
- Check API quota/limits
- Ensure model name is valid

### Port Already in Use
- Change PORT in .env
- Or kill the process using port 3000

## Support

For issues or questions, please open an issue on GitHub.

