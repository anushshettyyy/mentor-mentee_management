# 🎓 Mentor–Mentee Management System

A production-minded, full-stack web application designed for engineering and collegiate departments to structure, track, and elevate student mentoring, skill development, and institutional endorsements.

Built with **React 19 + TypeScript + Vite + Tailwind CSS v4** on the frontend, and **Node.js + Express + TypeScript + PostgreSQL + Prisma ORM** on the backend.

---

## 🌟 Key Capabilities by Role

### 1. Mentee / Student
- **Holistic Profile Wizard**: Complete self-assessment across 5 intuitive tabs:
  - Identity & Contact (USN, Course, Semester, DOB, Address, Photo)
  - Academic & Learning Pedagogy (VARK Learning Style, Research Interests, Support Requested)
  - Skills & Strengths (Technical skills, strengths, growth areas, languages)
  - Ambitions & Goals (Career targets, short-term and long-term milestones)
  - Activities & Achievements (Extracurricular clubs, certifications, hackathons, sports)
- **Live Quality Meter**: Dynamic profile completion percentage score with save-draft and formal submission for faculty review.
- **Assigned Mentor Card**: Faculty counselor contact, research specialization, office hours, and cabin location.
- **Action Items Tracker**: Interactive task checklist with reflections, progress notes, and mentor feedback.
- **Transparent Privacy**: Student views discussion summaries and action items while internal faculty-only notes remain strictly confidential.

### 2. Mentor / Faculty
- **Mentee Cohort Dashboard**: Search, filter by semester and review status, sort by name, USN, or completion percentage.
- **Flagship Mentee Workspace**: 7 deep tabs per student:
  1. *Overview*: Bio, support requests, and quick action launchpad.
  2. *Profile*: Comprehensive profile review with formal **Approve** or **Request Changes** decisions with mandatory notes.
  3. *Academic Progress*: Semester-by-semester SGPA & CGPA progression and backlog tracking.
  4. *Recommendations*: Formulate targeted goals across 11 categories (Academic Improvement, Career Guidance, Technical Skills, Communication, Soft Skills, Wellbeing/Support, Extracurriculars, Projects, Internships, Certifications, Personal Development) with success criteria and due dates.
  5. *Mentoring Sessions*: Log session date, type, shared discussion summary, next follow-up date, and **Private Faculty Notes** (strictly separated at query and API levels).
  6. *Action Items*: Create and track student task completion, review student notes, and provide feedback.
  7. *Endorsement History*: Track proposals submitted to the Head of Department (HOD) with immutable version snapshots.

### 3. Head of Department (HOD) & Administrator
- **Department Metrics Dashboard**: Live queries for student and faculty counts, mentor assignment coverage percentage, pending endorsements, overdue reviews, and session counts.
- **Endorsements Queue**: Review mentor proposals with full **immutable version snapshots** preserving original mentor content. Record auditable decisions (**Approve / Reject / Changes Requested**) with mandatory justification notes.
- **Mentor Allocation**: Match students with faculty advisors, track faculty mentee loads (e.g. 2 / 20 capacity), and resolve unassigned students.
- **User Directory**: Search and create new student and faculty accounts.
- **Accreditation Reports & Analytics**: NAAC Criterion 2.3 and NBA Tier-1 mentoring compliance indicators with one-click export.
- **Audit & Governance Log**: Tamper-evident trail capturing actors, roles, entity types, mutations, IP addresses, and timestamps.

---

## 🔐 Security & Privacy Architecture

- **Server-Side Scope Validation**: Ownership boundaries verified for every endpoint (students access only their own records, mentors access only their assigned cohort, HOD manages department scope).
- **Private Note Non-Exposure**: `privateFacultyNotes` are strictly excluded from query responses for student accounts.
- **Password Security**: Strong hashing using `bcryptjs` with appropriate salt rounds.
- **HTTP Security**: `helmet` headers, strict `cors` origins, and `express-rate-limit` protection against brute force.
- **Audit Logging**: Structured log trail storing all security events and administrative actions without sensitive credentials.

---

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher (v22+ recommended)
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v14, v15, v16, or v18 running locally or accessible via network

---

## ☁️ Supabase PostgreSQL Setup & Cloud Migration

This application is configured for **Supabase PostgreSQL** out of the box using Prisma ORM with connection pooling support.

### 1. Get Your Supabase Database URLs
1. Create a project at [Supabase](https://supabase.com).
2. In your Supabase Dashboard, go to:
   **Project Settings** (gear icon) ➔ **Database** ➔ **Connection string** (or **Connect** button at the top).
3. Copy the two connection strings:
   - **Transaction Pooler (Port 6543)**: Select **URI**, choose **Transaction** mode.
     This URL uses port `6543` and includes `?pgbouncer=true`.
     👉 Set this as `DATABASE_URL` in `server/.env`.
   - **Direct Connection / Session Mode (Port 5432)**: Select **URI**, choose **Session** mode (or direct `db.[ref].supabase.co:5432`).
     This URL uses port `5432`.
     👉 Set this as `DIRECT_URL` in `server/.env`.

> **Note on Special Characters**: If your Supabase database password contains special characters (like `@`, `#`, `!`, `%`), ensure it is URL-encoded in the connection strings.

### 2. Configure Environment (`server/.env`)
Edit `server/.env` with your Supabase credentials:
```env
# Supabase Transaction Pooler URL (port 6543) - used for application queries
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase Direct Connection URL (port 5432) - used by Prisma for schema push & migrations
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

PORT=5000
JWT_SECRET="super-secure-production-grade-jwt-secret-key-2026-mentor-mentee"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
```

### 3. Push Schema to Supabase
Run the schema sync to create all tables, enums, foreign keys, and indexes directly in your Supabase project:
```bash
npm run migrate
```
*(Or inside `server/`: `npm run prisma:push`)*

### 4. Seed Supabase Database
Populate your Supabase database with realistic demo accounts, departments, and mentoring records:
```bash
npm run seed
```
*(Or inside `server/`: `npm run prisma:seed`)*

---

## 🚀 Local Quick Start (Alternative)

If testing locally before connecting to Supabase:

### 1. Local Database Creation
Ensure local PostgreSQL is running, then create the database:
```sql
CREATE DATABASE mentor_mentee_db;
```

### 2. Environment Configuration
Check `server/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mentor_mentee_db?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/mentor_mentee_db?schema=public"
PORT=5000
JWT_SECRET="super-secure-production-grade-jwt-secret-key-2026-mentor-mentee"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
```

### 3. Push Database Schema & Generate Prisma Client
```bash
npm run migrate
```

### 4. Seed Demo Data
```bash
npm run seed
```

### 5. Launch the Application

In the root directory, run both frontend and backend concurrently:
```bash
npm run dev
```

Or run them individually in separate terminals:
- **Backend API**:
  ```bash
  npm run dev:server   # Starts at http://localhost:5000
  ```
- **Frontend Client**:
  ```bash
  npm run dev:client   # Starts at http://localhost:5173
  ```

---

## 🎭 Pre-Configured Demo Accounts

Use the **"Instant Demo Account Sign-In"** button on the login screen or topbar switcher to test all workflows:

| Persona | Role | Email | Password | Highlights |
| :--- | :--- | :--- | :--- | :--- |
| **Rahul Kumar** | Student / Mentee | `rahul.kumar@student.edu` | `Password@123` | 95% profile completion, AWS certified, active recommendations |
| **Ananya Sen** | Student / Mentee | `ananya.sen@student.edu` | `Password@123` | Submitted profile awaiting mentor verification |
| **Dr. Sneha Sharma** | Faculty / Mentor | `sneha.sharma@college.edu` | `Password@123` | 2 assigned mentees, active sessions & recommendations |
| **Prof. Vikram Verma** | Faculty / Mentor | `vikram.verma@college.edu` | `Password@123` | Systems & hardware lab advisor |
| **Dr. Ramesh Rao** | Head of Dept (HOD) | `hod.cse@college.edu` | `Password@123` | Endorsement queue, allocation matrix, department analytics |
| **Suresh Patel** | System Administrator | `admin@college.edu` | `Password@123` | Full governance and audit inspection access |

---

## 🧪 Automated Testing

Run the Vitest API integration test suite covering authentication, role permissions, private note privacy boundaries, and endorsement workflows:

```bash
cd server
npm run test
```

**Verified Test Scenarios:**
- Authentication rejection of invalid credentials (401)
- Protected route token verification
- Role boundary enforcement (Students denied HOD endpoints)
- Dynamic profile completion calculation
- Student isolation from `privateFacultyNotes`
- Mentor access to confidential session notes
- Recommendation creation with metadata
- HOD endorsement decision recording with version snapshot preservation

---

## 🏗️ Production Build

To compile both backend and frontend for production deployment:

```bash
# Root convenience command:
npm run build

# Or individually:
cd server && npm run build
cd ../client && npm run build
```

---

## 🛠️ Troubleshooting

- **Database Connection Refused**: Verify PostgreSQL service is running (`Get-Service *postgres*` on Windows) and port 5432 is accessible.
- **CORS Error**: Ensure `CORS_ORIGIN` in `server/.env` matches your Vite client origin (`http://localhost:5173`).
- **Prisma Client Stale**: Run `npx prisma generate` in `server/` after modifying `prisma/schema.prisma`.
