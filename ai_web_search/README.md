[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/text-to-image-template)

# Pinac AI Search Service

A Cloudflare Workers-based AI-powered Web Search service that provides information retrieval capabilities using Tavily API.

## Features

- 🔍 AI-powered Web Search service
- 📡 Server-sent events (SSE) streaming responses
- 🛡️ Robust error handling with structured JSON responses
- ⚡ Built on Cloudflare Workers for global edge deployment
- 🔒 Input validation and content-type enforcement

## Setup

### Prerequisites

- Node.js 18+
- Cloudflare account with Workers AI enabled
- Wrangler CLI

### Installation

1. Clone the repository:

```bash
git clone https://github.com/RajeshTechForge/PINAC_Microservices.git
cd PINAC_Microservices/ai_web_search
```

2. Install dependencies:

```bash
npm install
```

3. Configure Environment Variables:

Add your Tavily API key as credentials to your `wrangler.toml` or Cloudflare dashboard:

```toml
[vars]
TAVILY_API_KEY = "your_tavily_api_key"
```

4. Configure Wrangler:

```bash
npx wrangler login
```

5. Deploy to Cloudflare Workers:

```bash
npm run deploy
```

### Development

Run locally with Wrangler:

```bash
npm run dev
```

## Usage Example

> [!NOTE]
> It will be accessed through API-Getway and need user ID-Token for authentication

```javascript
// Using fetch API
const response = await fetch(
  "https://api-getway-url/api/search",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_USER_ID_TOKEN",
    },
    body: JSON.stringify({
      prompt: "What about mumbai ?",
      messages: [
        {
          role: "user",
          content: "What is the current weather in Delhi?",
        },
        {
          role: "assistant",
          content: "The current weather in Delhi is sunny and warm.",
        }
      ],
    }),
  }
);
```

## Error Codes

| Error Code              | Description                                             | Status Code |
| ----------------------- | ------------------------------------------------------- | ----------- |
| `METHOD_NOT_ALLOWED`    | Only POST requests are allowed                          | 405         |
| `INVALID_CONTENT_TYPE`  | Request missing required JSON content-type              | 415         |
| `BAD_REQUEST`           | Request body must include 'prompt' and 'messages' fields| 400         |
| `AI_SEARCH_SERVER_ERROR`| Server processing error                                 | 500         |

---

<div align="center">

_This project is for demonstration purposes. For production use, review security settings and adapt to your requirements._

</div>