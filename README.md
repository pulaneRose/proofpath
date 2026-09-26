# ProofPath — AI-Powered Evidence Vault & Case Builder

> **Your Evidence. Your Timeline. Your Case.**
> 
> *Securely preserve important evidence and organize it into a clear, factual, AI-assisted case when you need it.*

---

## 1. Overview & Problem Statement

In workplace disputes, housing disagreements, consumer fraud, and contract breaches, workers and consumers routinely find themselves at a disadvantage because critical evidence is scattered across messaging apps, photo galleries, and email threads. Often, people only attempt to gather evidence *after* a dispute occurs, by which time files are lost, timestamps corrupted, or files accidentally modified.

**ProofPath** solves this by establishing a secure evidence-preservation and case-building platform:
1. **Preserve First:** Users store high-resolution photos, PDF records, access logs, and communications before a dispute occurs.
2. **Cryptographic Integrity:** Files are assigned a SHA-256 hash immediately upon upload. Users can verify byte-for-byte consistency at any time.
3. **Automated Metadata Extraction:** ProofPath extracts embedded EXIF camera dates, device makes/models, and GPS coordinates without ever fabricating missing metadata.
4. **AI Case Builder:** When a dispute arises, users select existing items directly from their Evidence Vault without re-uploading. Modular AI organizes the selected records into an objective chronological timeline with precise source citations.
5. **Audit-Ready PDF Export:** Export a structured, professional Case Report formatted with an indexed evidence ledger (`E-001`, `E-002`), source markers, SHA-256 hashes, and legal disclaimers.

---

## 2. Core Architecture & Tech Stack

ProofPath is built with a modern **MERN** stack and designed according to zero-trust private storage principles:

- **Frontend:**
  - React 18, Vite 6, Tailwind CSS
  - React Router v6, Lucide Icons, Axios
  - Dark futuristic legal-tech / cybersecurity dashboard theme (`#070b14`, `#0b1120`, `#06b6d4`)
- **Backend:**
  - Node.js & Express REST API
  - Authentication: JWT (`jsonwebtoken`) & password hashing (`bcryptjs`)
  - File Uploads: Multer with private disk storage (`server/storage/evidence`) outside the public web root
  - Cryptographic Hashing: Node.js `crypto` streaming SHA-256
  - Metadata Extraction: `exifr` (high-performance EXIF/TIFF/GPS extraction)
  - PDF Generation: `pdfkit` (vector-sharp case reports)
- **Database:**
  - MongoDB Atlas via Mongoose
  - **Zero-Friction Dev Fallback:** Seamless in-memory MongoDB fallback (`mongodb-memory-server`) if `MONGODB_URI` is omitted or unavailable, ensuring tests and dev runs work 100% out of the box.
- **AI Service:**
  - Modular AI provider architecture supporting Google Gemini API, OpenAI, or an embedded deterministic factual analysis engine fallback for offline and local testing.

---

## 3. Key Workflows & Features

```
[ PRESERVE ] ───► [ ORGANIZE ] ───► [ BUILD ] ───► [ REVIEW ] ───► [ EXPORT ]
Upload original    Extract EXIF      Select vault    Edit narrative    Download PDF
photos & PDFs      & SHA-256         records & run   & inspect event   Case Report
to vault           tamper-evidence   AI synthesis    source tags       with hashes
```

### 1. Evidence Vault
- **Grid and List views** with instant filtering by category (Attendance, Employment, Communication, Payment, Contract, Housing, etc.) and format (Images, Documents).
- Full-text search over titles, descriptions, original filenames, and tags.
- Integrity badges indicating tamper-evident SHA-256 status.

### 2. Evidence Processing & Metadata Extraction
- Supported formats: **JPG, PNG, HEIC, PDF** (up to 25MB).
- Extracts: `DateTimeOriginal`, `CreateDate`, `GPSLatitude`, `GPSLongitude`, `Make`, `Model`, `Orientation`, `ImageWidth`, `ImageHeight`.
- **Strict Anti-Fabrication Rule:** If GPS or timestamps are missing from file headers, ProofPath displays `Not available`. It *never* invents or guesses coordinates.
- Strictly separates **File Metadata** (camera headers) from **ProofPath Records** (upload timestamp, vault storage key, hash).

### 3. Cryptographic Tamper-Evidence
- Every file calculates a 64-character SHA-256 hash upon upload.
- The **Verify Integrity** action recalculates the hash directly from the private stored file and compares it with the database record, returning `Integrity check passed` or flagging any alteration.

### 4. Case Builder & Chronological Timeline
- Multi-step wizard: Describe Situation → Select Evidence from Vault (without re-uploading) → Run AI Synthesis.
- Generates a chronological timeline where every single event is attributed to a specific source badge:
  - `Metadata`: Derived from EXIF camera or file headers.
  - `Evidence`: File preserved in vault.
  - `User statement`: User's account of what happened.
  - `AI observation`: Neutral synthesis of corroborate facts or discrepancies.
- Each event references its indexed evidence code (e.g. `Ref: E-001`).

### 5. Professional Case Report (PDF Export)
- Prepared with Case Reference ID, generation timestamp, and user details.
- Structured sections:
  1. Header & Case Summary
  2. User Account (verbatim statement)
  3. Chronological Timeline of Events (with source citations)
  4. Preserved Evidence Index (`E-001`, `E-002`...) with SHA-256 hashes & metadata summaries
  5. Missing information & Suggested questions
  6. Evidentiary and legal disclaimers

---

## 4. End-to-End Test Suite

ProofPath includes an automated test suite verifying all 11 required workflow steps:
1. **User Registration**
2. **User Login & Session Authentication**
3. **Upload Photograph with EXIF metadata** (Apple make/model, timestamps)
4. **Upload Photograph without GPS metadata** (verifies `gpsLatitude === null`, no fabrication)
5. **Evidence Vault retrieval & listing**
6. **Evidence details & SHA-256 integrity verification** (`Integrity check passed`)
7. **Case creation**
8. **Direct evidence linking from vault** (no re-upload)
9. **AI timeline generation** adhering to safety rules
10. **PDF export** (verifies valid `%PDF-` document stream)
11. **Cross-User Authorization Isolation** (User 2 is denied access `403/404` to User 1's files and cases)

Run the test suite anytime:
```bash
npm test
```

---

## 5. Getting Started & Installation

### Prerequisites
- Node.js v18+ (tested on Node v22.16)
- npm v10+

### Setup

1. **Clone or navigate to the repository:**
   ```bash
   cd ProofPath
   ```

2. **Install all dependencies (both backend and frontend):**
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables:**
   A template is provided in `.env.example`.
   ```bash
   cp .env.example server/.env
   ```
   *Note: If `MONGODB_URI` is left blank, the server automatically starts a local in-memory MongoDB instance for seamless testing!*

4. **Seed Sample Workplace Dispute Demo:**
   ```bash
   npm run seed
   ```
   *Populates demo user `demo@proofpath.app` with sample photos, supervisor WhatsApp screenshots, attendance access records, and a structured case draft for the September 23 attendance dispute.*

5. **Run the Application:**
   Open two terminals:

   **Terminal 1 (Backend API):**
   ```bash
   npm run dev:server
   ```
   *Runs on `http://localhost:5000`*

   **Terminal 2 (Frontend Client):**
   ```bash
   npm run dev:client
   ```
   *Runs on `http://localhost:5173`*

---

## 6. Environment Variables Reference

| Variable | Description | Default in Dev |
| :--- | :--- | :--- |
| `PORT` | API server port | `5000` |
| `MONGODB_URI` | MongoDB Atlas URI | *(In-memory fallback if omitted)* |
| `JWT_SECRET` | Secret key for JWT signing | `proofpath_super_secret_jwt_key_2026_dev_env` |
| `AI_PROVIDER` | AI provider (`local`, `gemini`, `openai`) | `local` |
| `AI_API_KEY` | API key for external LLM | Optional |
| `STORAGE_PROVIDER`| Storage provider (`local`, `s3`) | `local` |

---

## 7. Security & Authorization Model

Because ProofPath preserves sensitive personal and legal dispute evidence, the following safeguards are implemented:

- **Private Vault Storage:** Uploaded files are stored in `server/storage/evidence/` with random UUID storage keys. They are **never** placed in the public web root (`client/public`).
- **Owner-Scoped Verification:** Every request to retrieve evidence details, list evidence, download files, or view cases scopes strictly to the authenticated `userId`.
- **Stream Authorization:** The route `GET /api/evidence/:id/file` checks ownership before streaming. Unauthorized users receive `403 Forbidden`.
- **Sanitized Filenames:** Original filenames are recorded for display and PDF indexing, while physical storage uses UUIDs to prevent directory traversal or file execution attacks.

---

## 8. Evidence Integrity Limitations

ProofPath uses **SHA-256 cryptographic digests** to provide tamper-evident records. However, users and evaluators should understand the precise scope and limits of this guarantee:

- **What SHA-256 Proves:**
  A cryptographic hash proves that the file currently stored in ProofPath is byte-for-byte identical to the version that was hashed at the moment of upload. It proves file consistency and detects any subsequent alteration, corruption, or tampering.
- **What SHA-256 Does NOT Prove:**
  - It does **not** prove who originally created the file.
  - It does **not** prove whether the file or its metadata was edited, altered, or staged *prior* to upload.
  - It does **not** guarantee that a court, arbitrator, or employer will accept the evidence as conclusive.
  - ProofPath does not claim "blockchain verified" or "authenticity guaranteed".

---

## 9. Future Roadmap

- Automated audio transcript extraction and forensic voice analysis.
- Video frame extraction with per-frame integrity hashes.
- S3 / Google Cloud Storage multi-region bucket connectors.
- Attorney collaboration portal with time-limited read-only access links.
- Export formats conforming to legal electronic discovery standards (E-Discovery / Concordance load files).
