# Amrutam CareSync - Telemedicine Portal 🏥

CareSync is a production-grade, highly available, secure, and observable backend and frontend system for Amrutam's Telemedicine System. Built to support **100k daily consultations** with sub-200ms read latencies, it features a modular architecture, HTML5 pathname routing, JWT authentication, locking transactions to prevent double booking, cryptographic digital prescriptions, and containerized Docker environments.

---

## 🚀 Quick Start (Docker Compose)

The easiest way to run the entire stack (Database, Backend API, and Frontend web portal) is using Docker Compose:

### 1. Build and Start the Containers
```bash
docker-compose up --build
```
This launches:
* **PostgreSQL Database** on port `5432`
* **Express Backend API** on port `5000`
* **Nginx Frontend Web App** on port `5173`

### 2. Apply Migrations & Seed Database
In a new terminal window, initialize your database schema and run the seeders:
```bash
# Run database migrations
docker-compose exec backend npm run db:migrate

# Seed 15 test accounts (Patients, Doctors, Admins)
docker-compose exec backend node seed.js
```

You can now visit the web portal at **`http://localhost:5173`**!

---

## 🛠️ Native Development Setup

If you wish to run the services locally without Docker:

### Prerequisites:
* **Node.js** (v22 recommended)
* **PostgreSQL** (v15+)

### 1. Database Setup:
Create a database named `caresync_db` in your PostgreSQL server.

### 2. Backend Config:
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a `.env` file from the environment template and insert your database credentials:
   ```env
   PORT=5000
   NODE_ENV=development
   DB_USERNAME=postgres
   DB_PASSWORD=yourpassword
   DB_NAME=caresync_db
   DB_HOST=127.0.0.1
   JWT_SECRET=super_secret_session_jwt_key
   PRESCRIPTION_SECRET=super_secret_hmac_prescription_signing_key
   CLIENT_URL=http://localhost:5173
   ```
3. Install dependencies and initialize:
   ```bash
   npm install
   npm run db:migrate
   node seed.js
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Config:
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   Open **`http://localhost:5173`** in your browser.

---

## 🧪 Running Automated Tests
The repository includes a production-grade automated integration test suite checking JWT authorization, data model validations, and concurrent database row-level locking race conditions.

To execute tests natively:
```bash
cd backend
npm run test
```

---

## 👥 Seeded Login Credentials
All pre-populated seed accounts use the password: **`password123`**

| User Role | Email Address | Password | Name / Profile |
| :--- | :--- | :--- | :--- |
| **PATIENT** | `patient1@caresync.com` | `password123` | Patient 1 |
| **PATIENT** | `patient2@caresync.com` | `password123` | Patient 2 |
| **DOCTOR** | `doctor1@caresync.com` | `password123` | Dr. Doctor 1 (General Medicine) |
| **DOCTOR** | `doctor2@caresync.com` | `password123` | Dr. Doctor 2 (Pediatrics) |
| **ADMIN** | `admin1@caresync.com` | `password123` | Admin 1 |
| **ADMIN** | `admin2@caresync.com` | `password123` | Admin 2 |

*(Seeded up to `patient5`, `doctor5`, and `admin5` respectively).*

---

## 📂 Documentation & Specification Reference
* **API Specification**: Refer to the OpenAPI Swagger schema file at **`backend/openapi.yaml`**.
* **System Architecture & Threat Modeling**: See system design layouts, ER diagrams, data partitioning policies, and security guides at **`docs/architecture_and_security.md`**.
