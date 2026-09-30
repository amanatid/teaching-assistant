#teaching-assistant


# 🏛️ Gymnasium Science Teacher Assistant (Γυμνάσιο)

An AI-powered Pedagogical Assistant built on the [Mastra](https://mastra.ai) framework, designed specifically for Greek Gymnasium (Γυμνάσιο) educators. The assistant helps teachers analyze educational PDF documents, generate structured quizzes and exams, and align lesson plans with the guidelines of the Hellenic Ministry of Education and Religious Affairs (ΥΠΑΙΘΑ).

---

## 🌟 Core Features & Specializations

The assistant specializes in four primary science disciplines for Greek Gymnasium schools:
- ⚛️ **Physics (Φυσική)**
- 🧪 **Chemistry (Χημεία)**
- 🧬 **Biology (Βιολογία)**
- 🌍 **Geography (Γεωγραφία)**

### 🛠️ Key Capabilities

1. **PDF Lesson Parsing (`parsePdfLesson`)**
   - Automatically parses and extracts content from uploaded PDF lesson plans, textbooks, or reference materials.

2. **Automated Exam & Quiz Generation (`generateDocxQuiz`)**
   - Generates structured tests (Διαγωνίσματα / Τεστ / Ασκήσεις) adhering to pedagogical standards.
   - Categorizes questions into:
     - **Multiple Choice** (Πολλαπλής Επιλογής)
     - **Matching** (Στοίχιση)
     - **True/False** (Σωστό/Λάθος)
     - **Open Analytical Questions** (Ερωτήσεις Ανάπτυξης)
   - Exports tests directly into formatted `.docx` Word documents with direct HTTP download URLs.

3. **Slack Integration**
   - Direct integration with Slack channels and threads for uploading generated tests and communicating directly with teachers.

4. **Pedagogical Alignment**
   - Responds in professional, fluent Greek aligned with official Hellenic Ministry of Education (ΥΠΑΙΘΑ) learning goals.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- OpenAI API Key

### Environment Setup

Create a `.env` file in the root directory based on `.env.example`:

```env
OPENAI_API_KEY=your_openai_api_key
SLACK_BOT_TOKEN=your_slack_bot_token
SLACK_SIGNING_SECRET=your_slack_signing_secret
SLACK_CHANNEL_ID=your_slack_channel_id
SERVER_URL=[https://your-public-url.ngrok-free.dev](https://your-public-url.ngrok-free.dev)

🏃 Running the Application
Start the local development server:

Bash
npm run dev
Open http://localhost:4111 in your browser to access Mastra Studio.

💬 Example Prompts
Try these prompts in Mastra Studio or Slack:

Create an Exam:

"Φτιάξε ένα διαγώνισμα Φυσικής B' Γυμνασίου για την ενότητα 'Πίεση'. Συμπεριλάβε ερωτήσεις πολλαπλής επιλογής, Σωστό/Λάθος και ερωτήσεις ανάπτυξης."

Analyze a PDF Lesson Plan:

"Διάβασε το επισυναπτόμενο PDF με το μάθημα της Χημείας και φτιάξε ένα σύντομο τεστ 5 ερωτήσεων."

Biology Exercise Generation:

"Δημιούργησε μια άσκηση αντιστοίχισης για το κύτταρο στη Βιολογία Α' Γυμνασίου και εξαγωγέ το σε αρχείο Word."


├── src/
│   ├── agents/
│   │   └── teaching-assistant.ts   # Core agent instructions and capabilities
│   └── tools/
│       ├── pdf-tools.ts            # PDF parsing tool
│       └── docx-tools.ts           # Word (.docx) generator tool
├── workspace/                      # Local storage and temporary files
├── .env.example                    # Environment variable template
├── mastra.config.ts                # Mastra configuration
└── package.json
