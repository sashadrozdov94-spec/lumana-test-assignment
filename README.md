# Lumana Fullstack Assignment

## Preview

![alt text](20260703-1348-57.4455993.gif)

## Technologies

* **Frontend:** Angular, NgRx, Tailwind CSS, HTML5 Canvas (RxJS)
* **Backend:** NestJS, Microservices (Redis Pub/Sub, gRPC), MongoDB, Redis (TimeSeries)
* **Infrastructure:** Docker & Docker Compose

## Key Features

1. **Real-time Typeahead Search:** Instant search with RxJS debouncing and Redis caching.
2. **Virtual Scrolling & Pagination:** CDK virtual scrolling combined with batch-based API pagination.
3. **Interactive 2D Canvas Editor:** Draw, select, move, and rotate polygons dynamically.
4. **Automated Data Seeding:** Backend automatically fetches and bulk-inserts data on startup.
5. **PDF Report Generation (gRPC):** Service B exposes both REST and gRPC endpoints for PDF generation.

---

## Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
* [Docker](https://www.docker.com/) & Docker Compose
* [Node.js](https://nodejs.org/) (v18+)
* [Angular CLI](https://angular.dev/tools/cli) (`npm i -g @angular/cli`)

### 1. Clone the repository

git clone git@github.com:sashadrozdov94-spec/lumana-test-assignment.git
cd lumana-test-assignment

### 2. Start the Backend (Docker)
Open a terminal in the root folder and start the microservices:

cd backend
docker-compose up -d --build
(Note: Wait a few seconds for the containers to spin up and the database to seed itself).

Backend Swagger API Docs: Navigate to http://localhost:3000/api

### 3. Start the Frontend
Open a new terminal window, install dependencies, and run the frontend:

cd frontend
npm install
ng serve