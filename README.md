# 📄 Statement Parser Backend

This backend service powers the **Statement Parser** application — an API system for uploading and parsing PDF bank statements using OCR and Tabula-based services.
It is fully containerized using **Docker** and exposes REST APIs for PDF upload, user management, and statement parsing.

---

## 🚀 Features

- Upload and parse PDF bank statements.
- Extract structured data using **Tabula** and OCR microservices.
- RESTful API built with **Express + TypeScript**.
- Uses **Docker Compose** for containerized setup.
- Ready for deployment on any server or cloud.

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB
- **PDF Parsing:** `pdf-parse`, Tabula
- **Containerization:** Docker, Docker Compose
- **Authentication:** JWT (JSON Web Tokens)

---

## 🗂️ Folder Structure

```
Backend/
├── docker-compose.yml
├── package.json
├── nodemon.json
├── .env
├── src/
│   ├── model/
│   ├── route/
│   ├── service/
│   ├── controller/
│   ├── middleware/
│   ├── config/
│   ├── utils/
│   └── uploads/
└── .env
```

---

## 🐳 Running with Docker

This project uses Docker Compose to run the required services:

- `backend` — The Node.js + Express + TypeScript application.
- `mongo` — The MongoDB database instance.
- `tabula` — The Tabula PDF service for table extraction.

To build and start all services, run:
```bash
docker-compose up --build -d
```

---

## 🌐 API Endpoints

**Base URL:** `http://localhost:5000/api`

| Endpoint             | Method | Description             |
| -------------------- | ------ | ----------------------- |
| `/users/register`    | `POST` | Register a new user     |
| `/users/login`       | `POST` | Login and receive token |
| `/pdf/upload`        | `POST` | Upload and parse a PDF  |
