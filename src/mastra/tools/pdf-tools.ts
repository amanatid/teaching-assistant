import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfModule = require("pdf-parse");
const pdf = typeof pdfModule === "function" ? pdfModule : pdfModule.default;

// Limit maximum characters passed to the LLM context (approx 12,000 words ~ 16k tokens)
const MAX_TEXT_LENGTH = 50000; 

export const parsePdfLessonTool = createTool({
  id: "parse-pdf-lesson",
  description: "Extracts full raw text from a PDF textbook chapter or Slack PDF attachment.",
  inputSchema: z.object({
    pdfFilePath: z.string().describe("Local file path or Slack download URL to the uploaded PDF lesson document"),
  }),
  outputSchema: z.object({
    text: z.string(),
    pageCount: z.number(),
  }),
  execute: async ({ pdfFilePath }) => {
    console.log("=== [parsePdfLessonTool] Executing path:", pdfFilePath);

    let dataBuffer: Buffer;

    if (pdfFilePath.startsWith("http://") || pdfFilePath.startsWith("https://")) {
      const token = process.env.SLACK_BOT_TOKEN || process.env.SLACK_TOKEN;

      const response = await fetch(pdfFilePath, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download Slack file: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      dataBuffer = Buffer.from(arrayBuffer);
    } else {
      dataBuffer = fs.readFileSync(path.resolve(pdfFilePath));
    }

    const pdfData = await pdf(dataBuffer);
    let extractedText = pdfData.text || "";

    console.log(`=== Total Raw PDF Text Length: ${extractedText.length} characters across ${pdfData.numpages} pages.`);

    // Truncate text if it exceeds context limit safety window
    if (extractedText.length > MAX_TEXT_LENGTH) {
      console.log(`=== Truncating text to ${MAX_TEXT_LENGTH} characters to prevent context window overflow.`);
      extractedText = extractedText.slice(0, MAX_TEXT_LENGTH) + "\n\n[Note: Content truncated to fit LLM context limit.]";
    }

    return {
      text: extractedText,
      pageCount: pdfData.numpages,
    };
  },
});