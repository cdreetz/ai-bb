"use server";

import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { Browserbase, BrowserbaseAISDK } from "@browserbasehq/sdk";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

const browserbase = new Browserbase({
  apiKey: process.env.BROWSERBASE_API_KEY,
  projectId: process.env.BROWSERBASE_PROJECT_ID,
});

const browserTool = BrowserbaseAISDK(browserbase, { textContent: true });

export async function continueConversation(history: Message[]) {
  "use server";

  // First, generate text and potentially use tools
  const { text, toolResults } = await generateText({
    model: openai("gpt-3.5-turbo"),
    system: "You are a friendly assistant who can search the internet!",
    messages: history,
    tools: {
      browserTool,
    },
  });

  let toolResponse = "";
  if (toolResults && toolResults.length > 0) {
    toolResponse = toolResults.map(tr => {
      if (typeof tr.result === 'object') {
        return JSON.stringify(tr.result, null, 2);
      }
      return tr.result;
    }).join("\n");

    // If tools were used, make a second call to generate a response based on the tool results
    const secondResponse = await generateText({
      model: openai("gpt-3.5-turbo"),
      system: "You are a friendly assistant. Use the information provided to answer the user's question naturally.",
      messages: [
        ...history,
        { role: "system", content: `Tool response: ${toolResponse}` },
        { role: "user", content: "Based on this information, please provide a natural language response to my original question." }
      ],
    });

    return {
      messages: [
        ...history,
        {
          role: "assistant" as const,
          content: secondResponse.text || "I'm sorry, I couldn't generate a response based on the tool results.",
        },
      ],
    };
  }

  // If no tools were used, return the original response
  return {
    messages: [
      ...history,
      {
        role: "assistant" as const,
        content: text || "I'm sorry, I couldn't generate a response.",
      },
    ],
  };
}
