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

# run pip freeze > requirements.txt first
COPY server/requirements.txt .
RUN pip install -r requirements.txt

# copy frontend dist to server
COPY server .
COPY --from=frontend /web/dist ./static

ENV MONGO_URI=mongodb://mongo:27017/dev
ENV MONGO_DB_NAME=dev
ENV UPLOADS_DIR=/app/static/uploads
ENV FERNET_KEY_PATH=/app/data/fernet.key
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
