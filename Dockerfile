# React
FROM node:20-alpine AS frontend
WORKDIR /web
COPY web/package*.json ./
RUN npm install
COPY web .
RUN npm run build

# Server
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY server .
COPY --from=frontend /web/dist ./static
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
