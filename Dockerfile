FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Expose server port
EXPOSE 8080

# Run FastAPI app with Uvicorn bound to 0.0.0.0 and port 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
