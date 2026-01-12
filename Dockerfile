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

ENV AWS_S3_BUCKET_ID=discord-tool-bucket
ENV AWS_REGION_ID=ap-southeast-2
ENV MONGO_SECRET_ID=discord-tool/mongo-uri
ENV FERNET_SECRET_ID=discord-tool/fernet-key
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
