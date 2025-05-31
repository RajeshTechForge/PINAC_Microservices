const http = require("http");
const { jwtVerify, createRemoteJWKSet } = require("jose");

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const JWKS = createRemoteJWKSet(
  new URL(
    `https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`
  )
);

const server = http.createServer(async (req, res) => {
  if (req.method !== "GET" && req.method !== "POST") {
    res.writeHead(405);
    res.end();
    return;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.writeHead(401);
    res.end();
    return;
  }

  const token = authHeader.substring(7);

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    });

    // Add user info to response headers for downstream services
    res.writeHead(200, {
      "X-User-ID": payload.sub,
      "X-User-Email": payload.email || "",
      "X-User-Verified": payload.email_verified || "false",
    });
    res.end();
  } catch (error) {
    res.writeHead(401);
    res.end();
  }
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});
