import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import * as fs from "fs";
import * as path from "path";

export const generateDocxQuizTool = createTool({
  id: "generate-docx-quiz",
  description: "Generates a downloadable Microsoft Word (.docx) file containing a school quiz or test.",
  inputSchema: z.object({
    title: z.string().describe("Title of the test/quiz (e.g., 'Διαγώνισμα Φυσικής Β\' Γυμνασίου')"),
    subject: z.enum(["Physics", "Chemistry", "Biology", "Geography"]),
    grade: z.string().describe("Gymnasium Grade Level (Α', Β', or Γ' Γυμνασίου)"),
    questions: z.array(
      z.object({
        questionNumber: z.number(),
        questionText: z.string(),
        points: z.number().optional(),
        options: z.array(z.string()).optional(),
      })
    ),
    answerKey: z.array(z.string()).optional(),
    outputFilename: z.string().default("quiz.docx"),
  }),
  outputSchema: z.object({
    downloadUrl: z.string(),
    success: z.boolean(),
  }),
  execute: async ({ title, subject, grade, questions, answerKey, outputFilename }) => {
    const docChildren: Paragraph[] = [
      new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: `Μάθημα: ${subject} | Τάξη: ${grade} | Ημερομηνία: ____________`,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ text: "" }),
    ];

    questions.forEach((q) => {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Θέμα ${q.questionNumber}: `, bold: true }),
            new TextRun({ text: q.questionText }),
            new TextRun({ text: q.points ? ` (${q.points} Μονάδες)` : "", italics: true }),
          ],
        })
      );

      if (q.options && q.options.length > 0) {
        q.options.forEach((opt) => {
          docChildren.push(new Paragraph({ text: `   ${opt}` }));
        });
      }
      docChildren.push(new Paragraph({ text: "" }));
    });

    if (answerKey && answerKey.length > 0) {
      docChildren.push(
        new Paragraph({
          text: "--- Απαντήσεις / Ενδεικτικές Λύσεις (Για τον Εκπαιδευτικό) ---",
          heading: HeadingLevel.HEADING_2,
        })
      );

      answerKey.forEach((ans, idx) => {
        docChildren.push(new Paragraph({ text: `Θέμα ${idx + 1}: ${ans}` }));
      });
    }

    const doc = new Document({
      sections: [{ properties: {}, children: docChildren }],
    });

    const buffer = await Packer.toBuffer(doc);
    
    // 1. Ensure public folder exists
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // 2. Save inside public directory
    const outputPath = path.join(publicDir, outputFilename);
    fs.writeFileSync(outputPath, buffer);

    // 3. Construct public HTTP link using SERVER_URL from .env or fallback
    const baseUrl = process.env.SERVER_URL || "http://localhost:4111";
    const downloadUrl = `${baseUrl}/download/${outputFilename}`;

    return {
      downloadUrl,
      success: true,
    };
  },
});