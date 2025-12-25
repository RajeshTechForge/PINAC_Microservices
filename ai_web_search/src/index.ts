import { TavilySearch } from "@langchain/tavily";

interface ChatMessage {
  role: string;
  content: string;
}

const createErrorResponse = (
  errorCode: string,
  message: string,
  status: number
) => {
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
};

const tavilySearch = async (env: any, searchQuery: string) => {
  try {
    const tool = new TavilySearch({
      tavilyApiKey: env.TAVILY_API_KEY,
      maxResults: 3,
      topic: "general",
    });
    const response = await tool.invoke({ query: searchQuery });
    let answer = "";
    for (const item of response.results) {
      answer += `URL: ${item.url}\nPage Content: ${item.content}\n\n`;
    }
    return answer;
  } catch {
    return createErrorResponse(
      "AI_SEARCH_SERVER_ERROR",
      "Failed to perform web search",
      500
    );
  }
};

const runModel = async (env: any, messages: ChatMessage[]) => {
  const result = await env.AI.run("@cf/google/gemma-3-12b-it", {
    messages: messages,
    stream: false,
    max_tokens: 50,
  });
  return result.response;
};

class WebSearchAssistant {
  private env: any;
  private conversationHistory: ChatMessage[];
  private currentDate: string = "";

  constructor(
    env: any,
    conversationHistory: ChatMessage[],
    currentDate: string = ""
  ) {
    this.env = env;
    this.conversationHistory = [...conversationHistory];
    this.currentDate = currentDate;
    // Initialize with system instruction
    this.conversationHistory.unshift({
      role: "system",
      content:
        "You are a helpful AI assistant that can search the web for information. For factual questions, you'll provide up-to-date information in brief by searching the web.",
    });
  }

  private _shouldSearch(prompt: string): boolean {
    // Check for factual question indicators
    const factualIndicators: string[] = [
      "what",
      "who",
      "when",
      "where",
      "how",
      "why",
      "which",
      "is",
      "are",
      "was",
      "were",
      "did",
      "do",
      "does",
      "can",
    ];

    const lowerQuery = prompt.toLowerCase();

    // Check if query is a question or contains factual keywords
    const isQuestion =
      prompt.includes("?") ||
      factualIndicators.some((word) => lowerQuery.startsWith(word));

    // Check if it might be a follow-up question
    const isShortQuery = prompt.split(" ").length <= 5;
    const pronouns = ["it", "this", "that", "they", "these", "those"];
    const containsPronoun = pronouns.some((pronoun) =>
      lowerQuery.split(" ").includes(pronoun)
    );

    // If short query with pronouns and we have conversation history, likely a follow-up
    const previousQuestions = this.conversationHistory
      .filter((msg) => msg.role === "user")
      .map((msg) => msg.content);
    const isFollowUp =
      isShortQuery && containsPronoun && previousQuestions.length > 0;

    // Check if query is asking for factual information
    const containsEntity = /[A-Z][a-z]+/.test(prompt);

    return isQuestion || isFollowUp || containsEntity;
  }

  private async _generateLlmSearchQuery(prompt: string): Promise<string> {
    try {
      // Create a copy of conversation history
      const tempHistory = [...this.conversationHistory];
      const searchInstruction = {
        role: "system",
        content: `Today is ${this.currentDate}. Your task is to generate the most effective web search query based on the conversation history and the latest user question. For follow-up questions, include necessary context from previous messages. Respond ONLY with the search query text - no explanations, no quotation marks, just the query itself.`,
      };

      // Add the instruction as a temporary system message
      tempHistory.push(searchInstruction);

      // Generate the search query
      let generatedQuery = await runModel(this.env, tempHistory);

      if (typeof generatedQuery !== "string") {
        generatedQuery = prompt; // Fallback
      }

      generatedQuery = generatedQuery.trim();

      // Remove any marks or prefixes
      generatedQuery = generatedQuery
        .replace(/^(search query:|query:|searching for:)\s*/i, "")
        .trim();
      generatedQuery = generatedQuery.replace(/^["']|["']$/g, "");

      // If the generated query is too short, fall back to original query
      if (generatedQuery.split(" ").length <= 1) {
        return prompt;
      }

      return generatedQuery;
    } catch {
      return prompt;
    }
  }

  public async processPrompt(prompt: string): Promise<string | any> {
    this.conversationHistory.push({ role: "user", content: prompt });
    if (this._shouldSearch(prompt)) {
      // Perform web search
      try {
        const searchQuery = await this._generateLlmSearchQuery(prompt);
        const searchResults = await tavilySearch(this.env, searchQuery);
        return [
          { role: "user", content: prompt },
          {
            role: "system",
            content: `You are an expert assistant. Using the following up-to-date web search results about '${searchQuery}', provide a concise, accurate, and helpful answer to the user's question. ONLY use the information provided below—do not make up facts.\n\nWeb Search Results:\n${searchResults}`,
          },
        ];
      } catch (error) {
        return [{ role: "error", content: `Failed: ${error}` }];
      }
    } else {
      // No search needed
      return [{ role: "user", content: prompt }];
    }
  }
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
        prompt: string;
        messages: ChatMessage[];
      };

      if (!requestData.messages) {
        return createErrorResponse(
          "BAD_REQUEST",
          "Request body must include 'prompt' and 'messages' fields",
          400
        );
      }

      const webAgent = new WebSearchAssistant(env, requestData.messages);
      const finalPrompt = await webAgent.processPrompt(requestData.prompt);
      return new Response(JSON.stringify(finalPrompt), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      return createErrorResponse(
        "AI_SEARCH_SERVER_ERROR",
        `An unexpected error occurred: ${error.message || error}`,
        500
      );
    }
  },
} satisfies ExportedHandler<Env>;
