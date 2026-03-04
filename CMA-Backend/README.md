# O Class Management App - CMA Backend

A modular monolith backend for the Class Management Application, built with Node.js, Express, and Firebase.

## 🌟 Overview

This is a small project I built to learn about the modular monolith model, focusing on classroom management.


## 🏗️ Architecture

This project follows a **Modular Monolith** architecture:

- **`apps/`**: The entry points of the application (API Gateway, Job Worker, Socket Server).
- **`libs/core/`**: Shared infrastructure code (Database Adapters, Cache, Config, Utilities).
- **`libs/modules/`**: Isolated business domains (Users, Courses, Auth, etc.), implementing the `AppModule` contract.

## 🚀 Quick Start

### Prerequisites

- Node.js (v20+)
- Firebase Admin SDK credentials
- Redis (optional, falls back to in-memory)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration

Create a `.env` file in the root directory:

```env
# Server
PORT=3000

# Firebase
FIREBASE_CREDENTIALS={"type":"service_account",...}

# Cache (Optional)
# REDIS_HOST=
# REDIS_PORT=
# REDIS_PASSWORD=
```

### Running the App

```bash
# Start all services concurrently (Gateway, Worker, Socket)
npm run dev

# Or start services individually:
npm run dev:gateway
npm run dev:worker
npm run dev:socket
```

## 📚 Modules Documentation

[Liệt kê ngắn gọn các chức năng chính của từng module trong business domain]

- **Users**: ...
- **Auth**: ...
- **Courses**: ...

## 🛠️ Core Infrastructure

- **Database**: Adapter pattern for Firebase Firestore.
- **EventBus**: `InMemoryEventBus` for inter-module communication.
- **Cache**: Auto-fallback LRU cache / Redis.
- **Module Loader**: Auto-discovers and registers business modules via the `AppModule` contract.

## 🤝 How to Contribute

[Hướng dẫn cách tạo một module mới: tạo thư mục, implement `AppModule`, v.v.]
