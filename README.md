<div align="center">
  
# 🚀 PINAC Microservices

**A robust, scalable microservices demonstration for the [PINAC Workspace](https://github.com/RajeshTechForge/PINAC_Workspace)**

![Microservices](https://img.shields.io/badge/Architecture-Microservices-blue?style=for-the-badge&logo=microservices)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange?style=for-the-badge&logo=cloudflare)
![Docker](https://img.shields.io/badge/Docker-Container-blue?style=for-the-badge&logo=docker)
![Nginx](https://img.shields.io/badge/Nginx-Gateway-green?style=for-the-badge&logo=nginx)
![Node.js](https://img.shields.io/badge/Node.js-Auth_Service-green?style=for-the-badge&logo=nodedotjs)

</div>

## 📖 Overview

**PINAC Microservices** is a comprehensive demonstration of a modern, distributed architecture designed to power the intelligent features of the PINAC Workspace. This project showcases how to decouple complex AI and search functionalities into independent, scalable, and secure microservices.

By leveraging **Cloudflare Workers** for serverless AI inference and **Dockerized Nginx** for a centralized API Gateway, this project achieves high performance, low latency, and robust security.

## 🏗️ Architecture

The system is composed of three main components:

1.  **API Gateway (Nginx):** The single entry point for all client requests. It handles routing, load balancing, and enforces security by validating requests against the Auth Service.
2.  **Auth Service (Node.js):** A dedicated service for verifying Firebase JWT tokens, ensuring that only authenticated users can access the AI capabilities.
3.  **Serverless Workers (Cloudflare):**
    *   **Cloud LLM:** Provides direct access to advanced Large Language Models (Google Gemma 2).
    *   **AI Web Search:** Combines Tavily search with AI to provide intelligent, context-aware web search results.

<img src="https://github.com/pinacai/PINAC_Workspace/blob/main/assets/system_architechture.png" alt="system design">

## 🧩 Services Breakdown

> [!NOTE]  
> Detailed instructions for each microservice can be found in their individual folder's README file.

### 1. 🛡️ API Gateway & Auth Service
Located in `api_getway/`
*   **API Gateway:** An Nginx server configured as a reverse proxy. It routes traffic to the appropriate downstream services based on the URL path (`/api/ai`, `/api/web-search`).
*   **Auth Service:** A lightweight Node.js application that validates `Authorization: Bearer <token>` headers using Firebase Admin SDK (via `jose` library).

### 2. 🧠 Cloud LLM
Located in `cloud_llm/`
*   **Function:** Provides a direct interface to run AI models.
*   **Features:** Handles chat messages and returns AI-generated responses.

### 3. 🔍 AI Web Search
Located in `ai_web_search/`
*   **Function:** Performs intelligent web searches.
*   **Integration:** Uses **LangChain** and **Tavily** to fetch real-time web data.
*   **Processing:** Summarizes and contextualizes search results using Cloudflare AI.

## 🔌 Usage

Once deployed, you can access the services via the API Gateway (default port `8080`).

**1. AI Chat Completion**
```http
POST http://localhost:8080/api/ai
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "Explain quantum computing." }
  ]
}
```

**2. AI Web Search**
```http
POST http://localhost:8080/api/web-search
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json

{
  "query": "Latest advancements in AI 2025"
}
```

## 📄 License

This project is licensed under the MIT License.

---
<div align="center">

_This project is for demonstration purposes. For production use, review security settings and adapt to your requirements._

<p>
  Built with ❤️ for the PINAC Workspace
</p>
</div>
