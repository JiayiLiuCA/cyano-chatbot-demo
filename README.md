# Chatbot Demo

A simple AI chatbot powered by OpenAI's API, built with Next.js and Tailwind CSS.

## Setup

### 1. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Create a new API key

### 2. Configure Environment Variables

1. Open `.env.local` file in the project root
2. Replace `sk-your-api-key-here` with your actual OpenAI API key:

```env
OPENAI_API_KEY=sk-proj-...your-actual-key...
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- Real-time chat with OpenAI
- Message history saved in browser
- Multiple conversations
- Streaming responses
- Mobile responsive

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **OpenAI API** - AI responses
- **LocalStorage** - Client-side data persistence

## Project Structure

```
chatbot/
├── app/
│   ├── api/chat/         # Server-side API endpoint
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Main chat page
│   └── globals.css       # Global styles
├── components/           # React components
├── lib/                  # Utility functions
└── .env.local           # Environment variables (not committed)
```

## Important Security Note

- Your OpenAI API key is stored in `.env.local` and **never** exposed to the browser
- All API calls are made server-side through Next.js API routes
- Never commit `.env.local` to version control
