# AI Radio Jockey Studio | Powered by Gemini

A stunning, premium web application built with Python FastAPI and Vanilla HTML5/CSS/JS (Glassmorphic aesthetics) that allows users to seamlessly broadcast custom Radio Jockey shows using state-of-the-art Google GenAI models.

## Features
- **Script Generation**: Uses Gemini Pro to draft immersive, persona-based opening monologues, talk shows, and custom playlist cues.
- **Advanced Text-To-Speech (TTS)**: Leverages Gemini Flash audio generation capabilities for naturalistic single or multi-speaker synthetic vocal outputs.
- **Talk Show Dialogue Mode**: Supports co-hosted interviews featuring turn-based interactions with one female host (`RJ`) and one male celebrity guest (`Guest`) using `MultiSpeakerVoiceConfig`.
- **Indian Regional Fonts & Locales**: Enhanced font configuration rendering Tamil, Malayalam, Kannada, Telugu, Bengali, and Devanagari scripts properly without Unicode rendering failure.
- **Acoustic Guardians**: Defensively parses and truncates scripts down cleanly at sentence/word boundaries if the text exceeds strict 4000-byte Cloud TTS limits.
- **Management Ingestion & Analytics**: A dedicated dashboard to upload local show recordings, GCS bucket paths (`gs://...`), or YouTube links to analyze show flows, playlist coherence, sentiment timelines, and business metrics.
- **Premium Glassmorphic UI**: Highly responsive visual setup featuring navigation tabs, dynamic dark ambient neons, and smooth loading visualizations.

---

## Repository Setup

### 1. Prerequisites
- Python 3.10+
- Google Cloud Project with Vertex AI API enabled

### 2. Local Installation

```bash
# Clone or navigate to repository directory
cd AI_RJ

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install package dependencies
pip install -r requirements.txt
```

### 3. Environment Configuration
Copy `.env.example` to `.env` and fill in your details:
```env
GCP_PROJECT=your-google-cloud-project-id
GCP_REGION=us-central1
GCP_TTS_REGION=global
GEMINI_SCRIPT_MODEL=gemini-2.5-flash
GEMINI_TTS_MODEL=gemini-3.1-flash-tts-preview
```

### 4. Running Locally
```bash
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Visit `http://localhost:8000` in your web browser.

---

## Cloud Run Deployment

Deploy your application effortlessly to Google Cloud Run using the provided setup script.

```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```
---

<div align="center">

### Authors

[**Sunil Kumar**](https://www.linkedin.com/in/sunilkumar88/)

<sub>Built with Gemini, Veo, Imagen &amp; FFmpeg on Google Cloud.</sub>
<sub> A Gemini use-case demonstration. Not an official Google product.</sub>

</div>
