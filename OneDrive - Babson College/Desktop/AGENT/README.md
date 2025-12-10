# Omriq Hospitality AI

> The AI operating system that runs hotels — automating calls, messages, tasks, and guest operations.

## 🌟 Overview

Omriq Hospitality AI is a next-generation AI operations platform designed specifically for hotels. It replaces traditional front-desk labor and fragmented hotel systems with an autonomous AI receptionist, multi-channel guest communication engine, automated task routing system, predictive analytics suite, and deep integration layer.

## 🚀 Core Features

### 1. AI Receptionist (Inbound & Outbound Calls)
- Answers 100% of hotel calls instantly, 24/7
- Natural, human-like speech trained on hospitality language
- Handles bookings, modifications, cancellations
- Multilingual support (English, Spanish, French, Arabic, Mandarin)
- Emotion recognition & urgency detection
- High-value customer identification & upselling

### 2. AI Guest Messaging Hub
- Unified system for SMS, WhatsApp, Email, Web Chat, In-App Chat
- OTA messaging portals (Booking.com, Expedia, Airbnb)
- Instant responses with personalized recommendations
- Automatic task completion (not just chat)

### 3. Smart Task Automation & Operations Engine
- Automatic task creation and routing
- Priority-based task management
- SLA tracking and alerts
- Replaces WhatsApp groups, manual radios, sticky notes

### 4. AI Upsell & Revenue Optimization
- Predictive upselling opportunities
- Room upgrades, late checkout, add-ons
- Historical pattern analysis
- Real-time availability integration

### 5. Predictive Operations & Data Insights
- Guest behavior analysis
- Operational delay predictions
- Maintenance pattern recognition
- Staffing optimization models
- Revenue insights and bottleneck identification

### 6. Unified AI Dashboard
- Real-time AI conversations (voice + text)
- Task status and SLA monitoring
- Analytics and reporting
- Multi-property management

### 7. Deep Integrations Layer
- **PMS**: Opera, Mews, Cloudbeds, RoomRaccoon, Stayntouch
- **CRS**: SynXis, SiteMinder, Cloudbeds, Guestline
- **Telephony**: Avaya, Cisco, RingCentral, Twilio
- **POS**: Toast, Checkfront, Lightspeed

## 🏗️ Architecture

```
omriq-hospitality-ai/
├── src/
│   ├── server/           # Express API server
│   ├── services/         # Core business logic
│   │   ├── ai/          # AI services (OpenAI, voice, NLP)
│   │   ├── calls/       # Call handling service
│   │   ├── messaging/   # Multi-channel messaging
│   │   ├── tasks/       # Task automation engine
│   │   ├── upselling/   # Revenue optimization
│   │   └── analytics/   # Predictive insights
│   ├── integrations/    # PMS, PBX, CRS integrations
│   ├── models/          # Database models (Prisma)
│   ├── routes/          # API routes
│   ├── middleware/      # Auth, validation, etc.
│   └── utils/           # Helper functions
├── client/              # React dashboard frontend
├── prisma/              # Database schema
└── docs/                # Documentation
```

## 🛠️ Tech Stack

- **Backend**: Node.js, TypeScript, Express
- **Database**: PostgreSQL (via Prisma ORM)
- **AI/ML**: OpenAI GPT-4, Voice APIs (Twilio)
- **Frontend**: React, TypeScript, Tailwind CSS
- **Real-time**: WebSockets (Socket.io)
- **Integrations**: REST APIs, Webhooks

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kp123kdk3/HOTEL-AGENT.git
   cd HOTEL-AGENT
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file (see .env.example for reference)
   # Add your API keys and configuration
   ```

4. **Set up PostgreSQL database**
   - Install PostgreSQL if not already installed
   - Create a new database: `createdb omriq_db`
   - Update `DATABASE_URL` in `.env`

5. **Run database migrations**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

6. **Run development server**
   ```bash
   npm run dev
   ```

   The API server will start on `http://localhost:3000`

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/omriq_db"

# JWT
JWT_SECRET=your-secret-key

# OpenAI
OPENAI_API_KEY=your-openai-key

# Twilio (Voice)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-phone-number

# Integrations
OPERA_API_KEY=your-opera-key
MEWS_API_KEY=your-mews-key
CLOUDBEDS_API_KEY=your-cloudbeds-key
```

## 📚 API Documentation

API documentation will be available at `/api/docs` when the server is running.

## 🧪 Testing

```bash
npm test
```

## 📄 License

MIT

## 🤝 Contributing

This is a proprietary project. For inquiries, contact the development team.

---

**Built with ❤️ by Omriq Hospitality AI**

