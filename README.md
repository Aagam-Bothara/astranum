# AstraVaani

**Guidance Through Patterns** - A spiritual guidance platform that uses computed astrological and numerological patterns to provide thoughtful guidance.

## Golden Rule

> AstraVaani never predicts. It guides using computed patterns.

## Architecture

```
USER
  ↓
Frontend (Next.js)
  ↓
Product API (FastAPI)
  ↓
┌───────────────────────────┐
│ Deterministic Engines     │
│ - Astrology (Swiss Eph.)  │
│ - Numerology (Math)       │
└───────────────────────────┘
  ↓
LLM (Explanation + Guidance only)
  ↓
Validator (No hallucination)
  ↓
Response to User
```

## Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS, Framer Motion
- **Backend**: FastAPI, Python 3.11+
- **Database**: PostgreSQL
- **Astrology Engine**: pyswisseph (Swiss Ephemeris)
- **Numerology Engine**: Pure mathematics
- **LLM**: Anthropic Claude / OpenAI (configurable)

## Project Structure

```
astranum/
├── backend/
│   ├── app/
│   │   ├── api/routes/       # API endpoints
│   │   ├── core/             # Config, security
│   │   ├── engines/          # Astrology & Numerology
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   └── validators/       # Response validation
│   └── tests/
├── frontend/
│   └── src/
│       ├── app/              # Next.js pages
│       ├── components/       # React components
│       ├── lib/              # API client, utilities
│       └── types/            # TypeScript types
└── docker-compose.yml
```

## Quick Start

### Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Manual Setup

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Subscription Tiers

| Tier | Price | Questions | Daily Limit |
|------|-------|-----------|-------------|
| Free | ₹0 | 2 (lifetime) | - |
| Starter | ₹99/mo | 15/month | 3/day |
| Pro | ₹499/mo | 80/month | 4/day |

## Key Features

1. **Deterministic Computation**: All astrological/numerological data is computed using Swiss Ephemeris and mathematical formulas.

2. **Hallucination Prevention**: Every LLM response is validated against the user's actual chart data.

3. **Guidance, Not Prediction**: The system is designed to provide guidance and explain patterns, not make predictions.

4. **Multilingual**: Supports English, Hindi, and Hinglish.

## API Endpoints

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/guidance/ask` - Ask for guidance
- `GET /api/v1/guidance/check-usage` - Check usage limits
- `GET /api/v1/charts/current` - Get computed chart
- `POST /api/v1/charts/recompute` - Recompute chart
- `GET /api/v1/subscriptions/plans` - Get available plans

## Compliance & Trust

- Footer disclaimer on all pages
- No fear-based language
- No "this will happen" statements
- Encourages user agency
- Does not replace professional advice

## Development

```bash
# Run backend tests
cd backend
pytest

# Run frontend
cd frontend
npm run dev
```

## License

Proprietary - All rights reserved.

---

Built with ❤️ and 🌟
