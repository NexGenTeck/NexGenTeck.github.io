# NexGenTeck AI Chatbot - GCP Deployment
# Match the Python version declared by pyproject.toml.
FROM python:3.12-slim

# Set working directory
WORKDIR /app/Chatbot

# Install system dependencies for ML libraries and headless Chrome
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    chromium \
    chromium-driver \
    && rm -rf /var/lib/apt/lists/*

# Tell webdriver-manager / selenium to use the system chromium
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROMEDRIVER_PATH=/usr/bin/chromedriver
ENV WDM_LOCAL=1

# Copy requirements first for better caching
COPY Chatbot/requirements.txt ./requirements.txt

# Install Python dependencies.
RUN pip install --no-cache-dir -r requirements.txt \
    && python -c "import torch; import sentence_transformers; print(torch.__version__)"

# Copy application code
COPY Chatbot/ .

# Create directory for ChromaDB persistence
RUN mkdir -p /app/chroma_db

# Expose port
EXPOSE 8000

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV CHROMA_PERSIST_DIR=/app/chroma_db

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health', timeout=5).read()" || exit 1

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
