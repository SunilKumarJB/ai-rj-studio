# AI Radio Jockey Studio | FM Broadcast & Analytics Suite

A full-stack, enterprise-grade AI Radio Jockey platform powered by **Google Gemini** and **Google Cloud Text-to-Speech**. AI RJ Studio combines vintage radio broadcast aesthetics with generative AI to create, voice, cue music, and analyze full radio shows in real-time across multiple languages and host personas.

---

## Key Features

### 1. Vintage FM Broadcast Console
- **Interactive FM Dial & Presets**: Authentic retro radio tuner interface with frequency presets.
- **Persona & Mood Engine**: Tailor broadcasts with diverse host personas (Energetic, Quirky, Chill, Sarcastic, Soulful, Romantic, Late Night, Festive).
- **Regional Language & Script Support**: Full bilingual and native script support across Hindi, Hinglish, Tamil, Telugu, Malayalam, Kannada, Bengali, Punjabi, Marathi, and English with dedicated Unicode typography.

### 2. Multi-Segment Script Generation
- **Structured Broadcast Flow**: Generates segmented broadcast blocks:
  - **Segment 1**: Opening monologue, show hook, and music lead-in.
  - **Music Interlude**: Automated song cueing with title, artist, and playback timing.
  - **Segment 2**: Post-song reaction, listener shout-outs, trivia, and outro.
- **Talk Show & Celebrity Dialogue Mode**: Co-hosted conversational format featuring dynamic turn-based banter between an RJ and a guest.

### 3. Neural Multi-Speaker Text-to-Speech (TTS)
- **High-Fidelity Synthetic Voices**: Powered by Google Cloud Text-to-Speech and Gemini audio capabilities.
- **Multi-Speaker Dialogue Synthesis**: Seamlessly coordinates distinct male and female voice configurations (`MultiSpeakerVoiceConfig`) with turn-taking SSML markup.
- **Acoustic Guardian Protection**: Automatically normalizes scripts, handles syllable phrasing, and safely partitions text at natural punctuation boundaries to respect Cloud TTS byte limits.

### 4. YouTube Music Integration
- **Real-Time Music Search**: Integrated with `ytmusicapi` to search, preview, and cue authentic YouTube Music tracks into show playlists.
- **Direct Cue & Player Integration**: Automatically maps song cues to YouTube video IDs for in-browser playback.

### 5. Persistent Station Favorites (Local & GCS)
- **Cloud Storage Sync**: Automatically synchronizes favorite radio broadcast tracks, metadata, and high-fidelity `.wav` audio segments to Google Cloud Storage (`GCS_FAVORITE_BUCKET`).
- **Resilient Persistence**: Survives container recycles, instance restarts, and scale-to-zero events on Google Cloud Run with local disk fallback.

### 6. Executive Audio Ingestion & Analytics Dashboard
- **Multimodal Show Analysis**: Dedicated analytics suite (`/analytics.html`) to ingest local recordings, GCS paths (`gs://...`), or YouTube links.
- **Performance & Pacing Insights**: Evaluates playlist coherence, speech-to-music balance, sentiment flow, topic transitions, and audience engagement metrics.

---

## System Architecture

```
                                  +-----------------------------+
                                  |    Web Client (Browser)     |
                                  |   HTML5 / CSS3 / ES6 JS     |
                                  +--------------+--------------+
                                                 |
                                         HTTP / REST APIs
                                                 |
                                                 v
+-----------------------------------------------------------------------------------------------+
| FastAPI Application Server (`main.py`)                                                         |
|                                                                                               |
|  +---------------------+   +---------------------+   +---------------------+   +-----------+  |
|  | Script Generator    |   | TTS Dialogue Engine |   | Music Search Engine |   | Analytics |  |
|  | (Gemini Flash / Pro)|   | (Cloud TTS Studio)  |   | (ytmusicapi)        |   | (Gemini)  |  |
|  +----------+----------+   +----------+----------+   +----------+----------+   +-----+-----+  |
+-------------|-------------------------|-------------------------|--------------------|--------+
              |                         |                         |                    |
              v                         v                         v                    v
     +-----------------+       +-----------------+       +-----------------+   +---------------+
     | Google Vertex AI|       | Google Cloud    |       | YouTube Music   |   | GCS Bucket    |
     | Gemini API      |       | Text-to-Speech  |       | API             |   | & Local Cache |
     +-----------------+       +-----------------+       +-----------------+   +---------------+
```

---

## Repository Structure

```
AI_RJ/
├── Dockerfile                  # Production container definition (Python 3.11-slim)
├── README.md                   # Project documentation
├── requirements.txt            # Python package dependencies
├── deploy.sh                   # Automated Cloud Run deployment script
├── favorite_storage.py         # Favorite station persistence & GCS sync manager
├── main.py                     # Core FastAPI application & REST endpoints
├── .env.example                # Sample environment variables configuration
├── .dockerignore               # Container build exclusions
├── .gitignore                  # Git repository ignore rules
├── data/                       # Local runtime storage (ignored by git)
│   └── favorite/               # Cached favorite station data & generated audio
└── static/                     # Frontend client assets
    ├── index.html              # Main Radio Jockey studio interface
    ├── styles.css              # Glassmorphic retro theme & responsive styling
    ├── app.js                  # Frontend audio player, tuner, and studio controller
    ├── analytics.html          # Show analytics & audio ingestion dashboard
    └── analytics.js            # Dashboard visualization & analysis controller
```

---

## API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Serves the main AI Radio Jockey broadcast studio web UI. |
| `POST` | `/generate-script` | Generates a 2-segment RJ script with song cues based on persona and topic. |
| `POST` | `/generate-speech` | Synthesizes high-fidelity single or multi-speaker voice audio (`.wav`). |
| `GET/POST`| `/search-music` | Searches YouTube Music for matching tracks and returns video IDs. |
| `POST` | `/tag-script` | Parses entity tags and speech roles from generated scripts. |
| `GET` | `/favorite` | Retrieves the currently saved favorite show metadata. |
| `POST` | `/favorite` | Saves/overwrites the favorite station data and uploads audio to GCS. |
| `DELETE`| `/favorite` | Clears the saved favorite station. |
| `GET` | `/favorite/audio/{segment}` | Streams saved audio segment 1 or 2. |
| `POST` | `/analyze-audio` | Ingests audio files, GCS URIs, or YouTube links for Gemini show analysis. |

---

## Getting Started

### 1. Prerequisites
- **Python**: Version 3.10 or higher.
- **Google Cloud Platform**: A GCP project with the following APIs enabled:
  - Vertex AI API (`aiplatform.googleapis.com`)
  - Cloud Text-to-Speech API (`texttospeech.googleapis.com`)
  - Cloud Storage API (`storage.googleapis.com`)
  - Cloud Run Admin API (`run.googleapis.com`) *(for deployment)*

### 2. Installation

1. **Clone the repository and enter the directory**:
   ```bash
   git clone <repository-url>
   cd AI_RJ
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

### 3. Environment Setup

Create a `.env` file from the provided template:
```bash
cp .env.example .env
```

Configure your `.env` parameters:
```env
# Google Cloud Configuration
GCP_PROJECT=your-gcp-project-id
GCP_REGION=us-central1
GCP_TTS_REGION=global

# Model Settings
GEMINI_SCRIPT_MODEL=gemini-3.5-flash
GEMINI_TTS_MODEL=gemini-3.1-flash-tts-preview

# Persistent Storage (Optional)
GCS_FAVORITE_BUCKET=your-gcs-bucket-name
```

Authenticate with Google Cloud credentials:
```bash
gcloud auth application-default login
gcloud config set project your-gcp-project-id
```

### 4. Running the Application Locally

Start the development server with hot-reloading:
```bash
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Open your browser and navigate to:
- **Radio Studio**: [http://localhost:8000](http://localhost:8000)
- **Analytics Dashboard**: [http://localhost:8000/static/analytics.html](http://localhost:8000/static/analytics.html)

---

## Deployment

### Deploy to Google Cloud Run

An automated deployment script is included to enable APIs, package container artifacts, and deploy to Cloud Run:

```bash
# Ensure execution permissions
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

### Deploy using Docker

Build and run the container locally or on any container orchestration platform:

```bash
# Build the Docker image
docker build -t ai-rj-studio .

# Run container locally
docker run -p 8080:8080 --env-file .env ai-rj-studio
```

---

## Technologies Used

- **Backend**: [FastAPI](https://fastapi.tiangolo.com/), [Uvicorn](https://www.uvicorn.org/), [Pydantic](https://docs.pydantic.dev/)
- **Generative AI & Speech**: [Google GenAI SDK](https://github.com/google/generative-ai-python), [Google Cloud Text-to-Speech](https://cloud.google.com/text-to-speech)
- **Cloud & Storage**: [Google Cloud Storage](https://cloud.google.com/storage), [Google Cloud Run](https://cloud.google.com/run)
- **Music Catalog**: [ytmusicapi](https://github.com/sigma67/ytmusicapi)
- **Frontend**: Vanilla HTML5, Modern CSS3 (Glassmorphism), JavaScript ES6+

---

## License

This project is licensed under the Apache 2.0 License. See the LICENSE file for details.

---

<div align="center">

[**Sunil Kumar**](https://www.linkedin.com/in/sunilkumar88/)

<sub>A Gemini use-case demonstration. Not an official Google product.</sub>

</div>
