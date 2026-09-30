import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import Exa from "exa-js";

function getExa() {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) throw new Error("EXA_API_KEY is not set");
  return new Exa(apiKey);
}

export const searchWeb = createTool({
  id: "search-web",
  description:
    "Search the web for information about a person, company, or topic",
  inputSchema: z.object({
    query: z.string().describe("Search query"),
    numResults: z.number().optional().default(5),
  }),
  execute: async (inputData) => {
    const exa = getExa();
    const result = await exa.searchAndContents(inputData.query, {
      numResults: inputData.numResults,
      text: { maxCharacters: 2000 },
      livecrawl: "fallback",
    });

    return result.results.map((r) => ({
      title: r.title,
      url: r.url,
      text: r.text,
    }));
  },
});