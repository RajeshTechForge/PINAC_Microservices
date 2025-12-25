This project demonstrates _microservices architecture_ of **PINAC Workspace** using Google Cloud Run, NGINX as an API Gateway, and a custom authentication service for Firebase JWT verification. It provides secure, authenticated access to downstream services such as AI response and web search APIs.

## Project Structure

```
.
├── deploy.sh
├── api-gateway/
│   ├── Dockerfile
│   └── nginx.conf
└── auth-service/
    ├── auth-service.js
    ├── Dockerfile
    └── package.json
```

- **auth-service/**: Node.js service that verifies Firebase JWT tokens and exposes user info via HTTP headers.
- **api-gateway/**: NGINX-based gateway that routes requests, performs authentication, and proxies to backend services.
- **deploy.sh**: Bash script to deploy both services to Google Cloud Run.

## Features

- **JWT Authentication**: Validates Firebase-issued JWTs using the `auth-service`.
- **API Gateway**: Uses NGINX to route and protect endpoints, forwarding authenticated user info to downstream services.
- **Cloud Native**: Designed for deployment on Google Cloud Run.
- **Easy Deployment**: Automated deployment script for both services.

## Prerequisites

- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
- [Docker](https://www.docker.com/)
- A Google Cloud project with [Cloud Run](https://cloud.google.com/run) enabled
- A Firebase project for JWT authentication

## Setup

1. **Clone the repository**

   ```sh
   git clone https://github.com/RajeshTechForge/PINAC_Microservices.git
   cd PINAC_Microservices/api_getway
   ```

2. **Configure Environment Variables**

   Edit deploy.sh and set your actual GCP and Firebase project IDs:

   ```sh
   GCP_PROJECT_ID="your-gcp-project-id"
   FIREBASE_PROJECT_ID="your-firebase-project-id"
   ```

3. **Deploy to Google Cloud Run**

   Run the deployment script:

   ```sh
   bash deploy.sh
   ```

   This will:
   - Deploy the `auth-service` to Cloud Run
   - Update the `nginx.conf` with the deployed Auth Service URL
   - Deploy the `api-gateway` to Cloud Run

## How It Works

- **Authentication Flow**:
  1. Client sends a request with a Firebase JWT in the `Authorization` header.
  2. NGINX forwards the token to the internal `/auth` endpoint.
  3. `auth-service` validates the token and returns user info in headers.
  4. NGINX proxies the request to the appropriate backend, attaching user info headers.

- **Endpoints**:
  - `/api/ai`: Proxies to the AI response service (requires authentication)
  - `/api/search`: Proxies to the web search service (requires authentication)
  - `/health`: Health check endpoint (no authentication required)

## Customization

- Update backend service URLs in `nginx.conf` as needed.
- Extend `auth-service` to include more user info or custom logic.

---

<div align="center">

_This project is for demonstration purposes. For production use, review security settings and adapt to your requirements._

</div>