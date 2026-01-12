# build static frontend
FROM node:20-alpine AS frontend

WORKDIR /web

COPY web/package*.json ./
RUN npm install

COPY web .
RUN npm run build

# server
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# run pip freeze > requirements.txt first
COPY server/requirements.txt .
RUN pip install -r requirements.txt

# copy frontend dist to server
COPY server .
COPY --from=frontend /web/dist ./static

ENV S3_BUCKET=discord-tool-bucket
ENV S3_BUCKET_URL=https://discord-tool-bucket.s3.ap-southeast-2.amazonaws.com/

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
