[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/text-to-image-template)

# Pinac Cloud LLM Service

A Cloudflare Workers-based LLM API server that provides streaming chat completions.

## Features

- 🤖 AI-powered chat completions
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
cd PINAC_Microservices/cloud_llm
```

2. Install dependencies:

```bash
npm install
```

3. Configure Wrangler:

```bash
npx wrangler login
```

4. Deploy to Cloudflare Workers:

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
  "https://api-getway-url/api/ai",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_USER_ID_TOKEN",
    },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: "Write a short poem about coding",
        },
      ],
    }),
  }
);

// Handle streaming response
const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = new TextDecoder().decode(value);
  console.log(chunk);
}
```

## Configuration

The server uses the following AI model configuration:

- Model: `@cf/google/gemma-3-12b-it`
- Max tokens: 2096
- Streaming: Always enabled

## Error Codes

| Error Code              | Description                                | Status Code |
| ----------------------- | ------------------------------------------ | ----------- |
| `METHOD_NOT_ALLOWED`    | Only POST requests are allowed             | 405         |
| `INVALID_CONTENT_TYPE`  | Request missing required JSON content-type | 415         |
| `BAD_REQUEST`           | Messages field missing or invalid          | 400         |
| `AI_SERVER_ERROR`       | Server processing error                    | 500         |

---

<div align="center">

_This project is for demonstration purposes. For production use, review security settings and adapt to your requirements._

</div>