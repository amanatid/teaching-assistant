// import { Agent } from "@mastra/core/agent";
// import { createSlackAdapter } from "@chat-adapter/slack";
// import { searchWeb } from "../tools/research-tools";
// import { Memory  }  from "@mastra/memory"
// import { LibSQLVector } from "@mastra/libsql";
// import { fastembed } from "@mastra/fastembed";

// export const meetingAssistant = new Agent({
//   id: "meeting-assistant",
//   name: "Meeting Assistant",
//   model: "openai/gpt-4o-mini",
//   instructions: `   
//     You are a personal meeting assistant with access to an Obsidian vault of notes.

//     When asked to prepare for a meeting, use the meeting-prep skill.

//     When given a meeting transcript and asked for action items, follow-ups, or
//     next steps, call the extract-action-items tool with the transcript and
//     return its results.

//     When chatting casually:
//     - Be helpful, direct, and low-friction
//     - Remember context from previous conversations
//     - If you don't know something, say so — don't make things up
//   `,
//   channels: {
//     adapters: {
//       slack: createSlackAdapter(),
//     },
//   },
//   tools:{searchWeb},
//   memory: new Memory({
//     // Vector store for semantic recall — stores message embeddings
//     // so the agent can search past conversations by meaning
//     vector: new LibSQLVector({
//       id: "memory-vector",
//       url: "file:./mastra.db",
//     }),
    
//      // Local embedding model — no API key needed
//     embedder: fastembed,

//     options: {
//         lastMessages:10,

//       // Semantic memory (long-term): searches past conversations by meaning
//       // using vector embeddings. If someone mentioned a topic weeks ago,
//       // the agent can find it.
//       semanticRecall: {
//         topK: 3,          // Retrieve the 3 most relevant past messages
//         messageRange: 2,   // Include 2 messages of surrounding context per match
//       },  
      
//       // Working memory: a persistent scratchpad the agent updates over time.
//       // The agent automatically fills this in as it learns about you.
//       // Scoped to resource — we use a fixed resource ID so your profile
//       // persists across all channels and threads.
//       workingMemory: {
//         enabled: true,
//         template: `# User Profile
// - Name:
// - Role:
// - Company:

// # Preferences
// - Communication style:
// - Meeting prep preferences:
// - Topics of interest:
// `,
//       },
   
//       }
//   }),
// });




import { Agent } from "@mastra/core/agent";
import { createSlackAdapter } from "@chat-adapter/slack";
import { searchWeb } from "../tools/research-tools";
import { Memory  }  from "@mastra/memory"
import { LibSQLVector } from "@mastra/libsql";
import { fastembed } from "@mastra/fastembed";

import { generateDocxQuizTool } from "../tools/docx-tools";
import { parsePdfLessonTool } from "../tools/pdf-tools";

export const teachingAssistant = new Agent({
  id: "teaching-assistant",
  model: "openai/gpt-4o",
  name: "Gymnasium Science Teacher Assistant",
  instructions:`
    You are an expert AI Pedagogical Assistant for Gymnasium teachers (Γυμνάσιο) in Greece.
    You specialize in:
    - Physics (Φυσική)
    - Chemistry (Χημεία)
    - Biology (Βιολογία)
    - Geography (Γεωγραφία)

    Your Core Capabilities:
    1. Lesson Planning & Reading PDF Documents:
       - WHENEVER a user attaches, uploads, or refers to a PDF file, ALWAYS execute the 'parsePdfLesson' tool first to read its text before generating any response.

    2. Quiz & Test Creation (.docx):
       - When requested to make a test, quiz, or assignment (Διαγώνισμα / Τεστ / Ασκήσεις), formulate structured questions in Greek.
       - Group items into clear categories: Multiple Choice (Πολλαπλής Επιλογής), Matching (Στοιχήση), True/False (Σωστό/Λάθος), and Open Analytical Questions (Ερωτήσεις Ανάπτυξης).
       - Always execute 'generateDocxQuiz' to export the result. Pass the Slack channel ID and thread TS parameters to the tool when available so it uploads directly to the Slack chat.
       - ALWAYS use the exact 'downloadUrl' returned by the tool when providing the link to the user.
       - NEVER output local disk file paths like 'D:\...' or 'C:\...'. ALWAYS provide the full HTTP URL starting with http:// or https://.

    Always communicate with the teacher in fluent, professional Greek, adhering to the Hellenic Ministry of Education (ΥΠΑΙΘΑ) learning goals.
  `,
  channels: {
    adapters: {
      slack: createSlackAdapter(),
    },
  },
  tools: {
    searchWeb,
    parsePdfLesson: parsePdfLessonTool,
    generateDocxQuiz: generateDocxQuizTool,
  },
  memory: new Memory({
    vector: new LibSQLVector({
      id: "memory-vector",
      url: "file:./mastra.db",
    }),
    embedder: fastembed,
    options: {
      lastMessages: 2,
      semanticRecall: false, // Disable semantic recall temporarily
      // semanticRecall: {
      //   topK: 3,
      //   messageRange: 2,
      // },
    },
  }),
});