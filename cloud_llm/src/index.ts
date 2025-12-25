function createErrorResponse(
  errorCode: string,
  message: string,
  status: number
) {
  return new Response(
    JSON.stringify({
      error: errorCode,
      message: message,
      timestamp: new Date().toISOString(),
    }),
    {
      status: status,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return createErrorResponse(
        "METHOD_NOT_ALLOWED",
        "Only POST requests are allowed",
        405
      );
    }
    try {
      const contentType = request.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        return createErrorResponse(
          "INVALID_CONTENT_TYPE",
          "Content-Type must be application/json",
          415
        );
      }

      const requestData = (await request.json()) as {
        messages: any[];
      };

      if (!requestData.messages || !Array.isArray(requestData.messages)) {
        return createErrorResponse(
          "BAD_REQUEST",
          "Messages field is required and must be an array",
          400
        );
      }

      const stream = await env.AI.run("@cf/google/gemma-3-12b-it", {
        messages: requestData.messages,
        stream: true,
        max_tokens: 2096,
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } catch (error) {
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : String(error);

      return createErrorResponse(
        "AI_SERVER_ERROR",
        "Error processing request: " + errorMessage,
        500
      );
    }
  },
} satisfies ExportedHandler<Env>;
