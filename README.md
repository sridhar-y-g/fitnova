# FitNova Sales-Call Intelligence Platform

FitNova is an online fitness coaching platform where lead enrollments are finalized over phone calls. This platform serves as an automated call auditing console that analyzes advisor conversations, extracts compliance alerts, scores sales effectiveness, and handles team dashboards and appeals.

---

## 🚀 One-Command Launch (Quick Start)

To start the server immediately (requires Node.js installed):
```bash
npm install && npx prisma db push && npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🛠️ Detailed Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Configure Environment Variables**:
   Create a `.env` file in the root directory (already configured with development details in this workspace):
   ```env
   DATABASE_URL="mysql://<USERNAME>:<PASSWORD>@<HOST>:<PORT>/fitnova?sslaccept=strict"
   GEMINI_API_KEY="<YOUR_GEMINI_API_KEY>"
   ```
3. **Synchronize Cloud Database Schema**:
   Push the Prisma schemas to the live TiDB Serverless cloud instance:
   ```bash
   npx prisma db push
   ```
4. **Seed Database**:
   You can seed the database directly by clicking **RESET** on the top header console in the UI, or by running the seed route:
   ```bash
   curl -X POST http://localhost:3000/api/seed
   ```
5. **Run Development Server**:
   ```bash
   npm run dev
   ```

---

## 📖 Step-by-Step Usage Guide

### 1. Launch the Control Console
- Open your browser to `http://localhost:3000`.
- Click the safety-orange tactile button labeled **`[ LAUNCH CONTROL CONSOLE ]`**.

### 2. Ingest Call Recording (Upload Raw Audio)
- Click the **`INGEST CALL`** button located in the top-right control cluster.
- In the slide-up modal:
  1. Select the target **Advisor Pod** (e.g. Rohan M., Vikram S.).
  2. Select your raw audio file (`.mp3`, `.wav`, or `.aac`) from your local file system.
  3. Click **`CONFIRM INGESTION`**.
- *Processing*: The raw audio is streamed directly to the **Gemini 3.1 Flash-Lite API** (or resolved via template simulation fallback if no key is defined). The engine transcribes Hinglish dialogues, runs safety-compliance scoring, and persists the record to the TiDB cloud database.

### 3. Review Call Transcripts & Analytics
- Select the advisor call in the **Coaching Queue & Audit Registry** table.
- Press **Play** in the audio deck simulator.
- View the speaker-diarized transcript conversation bubbles. The red messages highlight compliance infractions.

### 4. Contest AI Compliance Flags
- View the compliance details card at the bottom right.
- If a flag is incorrect or contextually justified, click **`CONTEST THIS AI FLAG`**. The status will instantly switch to **`APPEALED`** in the live TiDB database to alert the Pod Leader.

---

## ⚙️ Architecture: Real vs. Mocked

| Component | Status | Technical Details |
| :--- | :--- | :--- |
| **Database** | **100% REAL** | Connected to a live cloud **TiDB Serverless** instance at `gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com:4000`. Direct operations are handled via a global Prisma connection singleton to prevent connection pool exhaustion. |
| **Analysis Engine** | **REAL / HYBRID** | Connects to the **Gemini 3.1 Flash-Lite API** using the `@google/genai` client. It transcribes audio and generates compliance tags. If no API key or audio file is provided, it falls back to high-fidelity simulated Hinglish transcripts and scores to guarantee smooth testing. |
| **Dispute & Appeal Loop** | **100% REAL** | Clicking **CONTEST THIS AI FLAG** sends a real `PATCH` request to the database via `/api/flags/[id]/contest`, updating the appeal status flag in real-time. |
| **Audio Playback Deck** | **MOCKED** | The tactile waveform visualization and playback timer mimic active telemetry streaming. The waveform is rendered dynamically via canvas height bars that animate in sync with the simulated playhead. |

---

## 🧠 Design Writeup & Tradeoffs

### 1. The Core Philosophy
The interface balances modern operations telemetry with high-fidelity corporate software. We opted for a **skeuomorphic Neumorphic style** (recessed wells, custom active LEDs, tactile buttons) to give it a premium physical-console look.

### 2. Tradeoffs & Decisive Shortcuts
- **Diarization Representation**: Since audio diarization is done programmatically, we map speaker lines directly into structured message bubbles. Instead of designing a timeline editor, we aligned transcripts in a conversational chat-like thread, which makes scanning much faster for Pod Leaders.
- **Simulator Fallbacks**: Gemini audio transcription requires valid audio file payloads. Because standard local environments might not always have large test wav recordings, we built high-fidelity fallback templates representing actual Hinglish conversations (e.g. Rohan over-promising weight loss, Sridhar excellent client discovery) to allow immediate evaluation.

### 3. What Was Left Unbuilt (And Why)
- **Voice-to-Voice AI Coaching Playback**: We decided against generating dynamic AI text-to-speech audio feedback. Developing a full speech synthesis model stream would exceed dev timelines without adding significant value over written inline recommendations.
- **Bulk Multi-file Background Workers**: We chose not to build background Redis/BullMQ processing queues for audio files. In a production system, analyzing 100+ calls simultaneously requires background jobs. In this demo console, direct serverless route timeouts were mitigated by keeping ingestion processing responsive.

### 4. Critical Failure Modes (Where the System Would Fail)
- **High Audio Noise & Overlapping Talk**: In noisy call environments (e.g., advisors calling from busy railway stations or crowded cafes), the Gemini transcription might merge advisor and customer dialogues, leading to inaccurate compliance flagging.
- **Strict English Compliance in Hinglish Calls**: If advisors use slang or complex local idioms that are not represented in the prompt dictionary, the compliance classification agent might throw false positives or miss subtle pressure tactics.
- **Connection Pool Overload**: Under heavy parallel ingestion loads, even with a global database singleton, Next.js serverless route scaling can run out of concurrent MySQL sockets on the database gateway.

---
