<p align="center">
  <a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A scalable and extensible NestJS backend for an AI Model Playground</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@nestjs/core" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/package/@nestjs/core" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://github.com/your-username/ai-playground-backend" target="_blank"><img src="https://img.shields.io/github/stars/your-username/ai-playground-backend?style=social" alt="GitHub stars" /></a>
</p>

---

## 🧠 AI Model Playground — Frontend

This is the frontend for the AI Model Playground built using **NextJS** and **Tailwind**, supporting real-time prompt streaming and comparison across different OpenRouter models.

---

## 📦 Features

- Prompt submission & session storage
- Streamed AI model response via Server-Sent Events (SSE)
- Per-model metrics (time, cost, tokens)
- Session history support
- CORS configuration for frontend integration
- Modular NestJS architecture

---

## 📡 Live Deployment

> 🟢 **Backend URL**: [https://ai-playground-model-backend-production.up.railway.app](https://ai-playground-model-backend-production.up.railway.app)

> 🟢 **Frontend URL**: [https://ai-playground-model-frontend.vercel.app/](https://ai-playground-model-frontend.vercel.app/)


---

## 🚀 Getting Started

### 📁 Clone the repository

```bash
git clone https://github.com/kritikakoirala/ai-playground-frontend.git

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```