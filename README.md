# Basic Chatbot + Supabase Vector DB

Minimal Next.js chatbot with:
- Groq for chat completion
- local open-source embeddings (`Xenova/all-MiniLM-L6-v2`)
- Supabase pgvector retrieval

## Setup

1. Create env file and fill values:

```bash
cp .env.example .env.local
```

Required:
- `GROQ_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TELEGRAM_BOT_TOKEN`

2. In Supabase SQL editor, run:

`supabase/vector.sql`

3. Install and run:

```bash
npm install
npm run dev
```

Note: first embedding request downloads the open-source model and may take time.

4. Seed mock data:

```bash
npm run seed:schemes
npm run seed:users
```

## APIs

- `POST /api/vector/upsert`
  - body:
  ```json
  {
    "title": "Scheme A",
    "content": "Long scheme text...",
    "metadata": { "source": "admin-upload" }
  }
  ```
  - response: `{ "success": true, "chunksStored": 4 }`

- `POST /api/chat`
  - body:
  ```json
  {
    "message": "Who can avail PM Kisan Samman Nidhi?",
    "topK": 5,
    "sendMessage": "You are eligible. Please complete your application."
  }
  ```
  - response includes:
    - `answer`
    - `scheme`
    - `eligibleUsers`
    - `prominentUsers` (ranked by eligibility + vulnerability + income)
    - `notifications.queued`
    - `telegramResult` (Telegram delivery attempt metadata)
    - `citations`


