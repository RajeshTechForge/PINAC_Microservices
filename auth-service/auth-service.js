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
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "METHOD_NOT_ALLOWED",
        message: "Only GET and POST methods are allowed",
      })
    );
    return;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.writeHead(401, {
      "Content-Type": "application/json",
      "X-Auth-Error": "MISSING_TOKEN",
    });
    res.end(
      JSON.stringify({
        error: "MISSING_TOKEN",
        message: "Authorization header with Bearer token is required",
      })
    );
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
      "Content-Type": "application/json",
      "X-User-ID": payload.sub,
      "X-User-Email": payload.email || "",
      "X-User-Verified": payload.email_verified || "false",
    });
    res.end(
      JSON.stringify({ success: true, message: "Authentication successful" })
    );
  } catch (error) {
    let errorCode = "INVALID_TOKEN";
    let errorMessage = "Invalid or malformed token";
    let statusCode = 401;

    // Categorize different types of JWT errors
    if (error.code === "ERR_JWT_EXPIRED") {
      errorCode = "TOKEN_EXPIRED";
      errorMessage = "Token has expired, please refresh your authentication";
    } else if (error.code === "ERR_JWT_INVALID") {
      errorCode = "INVALID_TOKEN";
      errorMessage = "Invalid token format or signature";
    } else if (error.code === "ERR_JWT_CLAIM_VALIDATION_FAILED") {
      errorCode = "INVALID_CLAIMS";
      errorMessage =
        "Token claims validation failed (issuer/audience mismatch)";
    } else if (error.message && error.message.includes("audience")) {
      errorCode = "INVALID_AUDIENCE";
      errorMessage = "Token audience does not match expected value";
    } else if (error.message && error.message.includes("issuer")) {
      errorCode = "INVALID_ISSUER";
      errorMessage = "Token issuer does not match expected value";
    } else if (error.code === "ERR_JWKS_NO_MATCHING_KEY") {
      errorCode = "KEY_NOT_FOUND";
      errorMessage = "No matching key found for token verification";
    } else if (error.code === "ERR_JWKS_MULTIPLE_MATCHING_KEYS") {
      errorCode = "MULTIPLE_KEYS_FOUND";
      errorMessage = "Multiple matching keys found, unable to verify token";
    }

    res.writeHead(statusCode, {
      "Content-Type": "application/json",
      "X-Auth-Error": errorCode,
    });
    res.end(
      JSON.stringify({
        error: errorCode,
        message: errorMessage,
        timestamp: new Date().toISOString(),
      })
    );
  }
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});
