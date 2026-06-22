#!/usr/bin/env bash
set -e

# Load environment configurations if present
if [ -f .env ]; then
  source <(grep -v '^#' .env | sed -e 's/\r//')
fi

# Fallbacks
PROJECT_ID=${GCP_PROJECT:-"$(gcloud config get-value project)"}
REGION=${GCP_REGION:-"us-central1"}

if [ "$REGION" = "global" ]; then
  REGION="us-central1"
fi

SERVICE_NAME="ai-rj-studio"

if [ -z "$PROJECT_ID" ]; then
  echo "Error: GCP_PROJECT is not set in .env or active gcloud config."
  exit 1
fi

echo "Deploying $SERVICE_NAME to Google Cloud Run in project $PROJECT_ID ($REGION)..."

# Enable necessary APIs (including Vertex AI/AI Platform and Text-to-Speech)
gcloud services enable run.googleapis.com cloudbuild.googleapis.com aiplatform.googleapis.com texttospeech.googleapis.com --project "$PROJECT_ID"

# Deploy to Cloud Run
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --allow-unauthenticated \
  --set-env-vars="GCP_PROJECT=$PROJECT_ID,GCP_REGION=${GCP_REGION:-global},GCP_TTS_REGION=${GCP_TTS_REGION:-global},GEMINI_SCRIPT_MODEL=${GEMINI_SCRIPT_MODEL:-gemini-3.5-flash},GEMINI_TTS_MODEL=${GEMINI_TTS_MODEL:-gemini-3.1-flash-tts-preview}"

echo "Deployment successfully triggered!"
