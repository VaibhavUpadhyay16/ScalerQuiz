# 🤖 ScalarQuiz — AI-Powered Quiz & Code Analysis Platform

ScalarQuiz is a full-stack **MERN** (MongoDB, Express, React, Node.js) web application that generates **AI-powered multiple-choice quizzes** on demand and lets users write and get AI feedback on code solutions to programming problems. It is a browser-based re-imagining of an original **Java Swing + Gemini AI desktop application**, rebuilt as a modern client-server web app.

Under the hood, every quiz question and every code review is generated live by **Google's Gemini API**, so no static question bank is required — pick a topic and difficulty, and a fresh, unique quiz is generated in seconds.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [Authentication Flow](#authentication-flow)
- [The AI Quiz Generation Flow](#the-ai-quiz-generation-flow)
- [The Code Workspace & AI Analysis Flow](#the-code-workspace--ai-analysis-flow)
- [Frontend Routing](#frontend-routing)
- [Achievements & Gamification](#achievements--gamification)
- [Security Notes](#security-notes)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Roadmap Ideas](#roadmap-ideas)
- [License](#license)

---

## Features

- **AI-generated quizzes** — Questions, options, correct answers, and explanations are generated live by Gemini AI for any of 20 built-in domains (Java, Python, DSA, DBMS, Web Dev, Math, Science, General Knowledge, and more).
- **Three difficulty levels** (Easy / Medium / Hard), each with its own prompt-engineered question style (recall vs. applied reasoning vs. multi-step problem solving).
- **Configurable quiz rules** — question count, per-question timer, whether to allow answer review, and whether to show explanations after each answer.
- **Live countdown timer per question** with auto-submit when time runs out.
- **Results & review modals** — see your score, time taken, and step back through every question with the correct answer and Gemini's explanation.
- **Coding Workspace** — a Monaco-powered in-browser code editor (the same editor that powers VS Code) for solving programming problems in JavaScript, Python, Java, C++, or C.
- **AI Code Analysis** — submit your solution and Gemini reviews your **approach, time/space complexity, code quality (scored out of 10), potential improvements, and whether a better approach exists** — all without ever executing your code.
- **User accounts & JWT authentication** — register/login with email + password, secure access/refresh token rotation via httpOnly cookies, and automatic silent token refresh on the frontend.
- **Persistent user profiles** — quiz history, total quizzes taken, and per-domain average scores are stored in MongoDB.
- **Achievements & badges** — automatically awarded for milestones like "First Quiz," "Quiz Enthusiast," and perfect scores per domain, each worth achievement points.
- **User preferences** — preferred difficulty and UI theme are saved per profile.
- **Hardened Express API** — Helmet security headers, CORS with credentials, rate limiting, centralized error handling, and input validation.
- **Graceful AI fallback** — if the Gemini API key isn't configured or a request fails after retries, the app serves clearly-labeled sample questions instead of crashing the quiz flow.

---

## Tech Stack

| Layer          | Technology                                                                 |
|----------------|------------------------------------------------------------------------------|
| Frontend       | React 18, React Router v6 (HashRouter), Vite 5, Tailwind CSS 3               |
| Code Editor    | Monaco Editor (`@monaco-editor/react`)                                       |
| HTTP Client    | Axios (with request/response interceptors for auth)                          |
| Icons          | lucide-react                                                                  |
| Backend        | Node.js, Express 4                                                            |
| Database       | MongoDB with Mongoose ODM                                                     |
| Auth           | JSON Web Tokens (access + refresh), bcryptjs password hashing, httpOnly cookies |
| AI Provider    | Google Gemini API (`gemini-2.5-flash`)                                       |
| Security       | Helmet, express-rate-limit, express-validator, CORS                          |
| Dev Tooling    | Nodemon (backend), Vite dev server + proxy (frontend)                        |

---

## Project Structure

```
ScalarQuiz-main/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # register/login/logout/refresh/me
│   │   ├── codeController.js      # code submission → Gemini analysis
│   │   ├── problemController.js   # list/get coding problems
│   │   ├── quizController.js      # domains, question generation, result submission
│   │   └── userController.js      # profile lookup, stats, preferences
│   ├── middlewares/
│   │   ├── authMiddleware.js      # verifyJWT, authorizeRoles
│   │   └── errorHandler.js        # notFound + centralized errorHandler
│   ├── models/
│   │   ├── UserProfile.js         # user + embedded quiz history + achievements
│   │   ├── Problem.js             # coding problem schema
│   │   ├── TestCase.js            # public/hidden test cases per problem
│   │   └── LanguageTemplate.js    # starter code templates per language
│   ├── repositories/
│   │   └── problemRepository.js   # data-access layer for problems/test cases
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── codeRoutes.js
│   │   ├── problemRoutes.js
│   │   ├── quizRoutes.js
│   │   └── userRoutes.js
│   ├── services/
│   │   ├── geminiService.js       # prompt building + Gemini API calls (quiz + code review)
│   │   ├── questionService.js     # domain list, retries, fallback questions
│   │   └── problemService.js      # business logic for coding problems
│   ├── utils/
│   │   └── generateTokens.js      # JWT access/refresh token issuance
│   ├── .env.example
│   ├── package.json
│   └── server.js                  # Express app entry point
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── api.js             # Axios instance, interceptors, all API calls
    │   │   ├── codeService.js     # code submission API wrapper
    │   │   └── problemService.js  # problems API wrapper
    │   ├── components/
    │   │   ├── ExplanationModal.jsx
    │   │   ├── Modal.jsx
    │   │   ├── ResultsModal.jsx
    │   │   ├── ReviewModal.jsx
    │   │   ├── StatisticsModal.jsx
    │   │   └── workspace/
    │   │       ├── ActionButtons.jsx
    │   │       ├── CodeAnalysisPanel.jsx
    │   │       ├── CodeEditor.jsx      # Monaco editor wrapper
    │   │       ├── LanguageSelector.jsx
    │   │       ├── LoadingOverlay.jsx
    │   │       └── ThemeToggle.jsx
    │   ├── context/
    │   │   └── QuizContext.jsx    # global auth/profile/quiz state (React Context)
    │   ├── pages/
    │   │   ├── Login.jsx          # login/signup + quiz setup
    │   │   ├── Rules.jsx          # quiz rules/config, triggers question generation
    │   │   ├── Quiz.jsx           # the live quiz screen
    │   │   └── Workspace.jsx      # coding problem + editor + AI analysis
    │   ├── App.jsx                # HashRouter route definitions
    │   ├── main.jsx                # React entry point
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js             # dev server + /api proxy to backend
    └── tailwind.config.js         # custom color palette & fonts
```

---

## Architecture Overview

```
┌──────────────────┐        HTTPS / JSON        ┌───────────────────┐        HTTPS        ┌─────────────────┐
│   React (Vite)    │  ───────────────────────▶  │  Express REST API │  ─────────────────▶ │  Google Gemini   │
│  Login/Rules/Quiz/ │  ◀───────────────────────  │  (JWT-protected)  │  ◀───────────────── │  API             │
│  Workspace         │      access/refresh        └─────────┬─────────┘   generated JSON    └─────────────────┘
└──────────────────┘         JWT cookies                    │
                                                              ▼
                                                      ┌───────────────┐
                                                      │   MongoDB      │
                                                      │ (Mongoose ODM) │
                                                      └───────────────┘
```

- The **frontend** never talks to Gemini directly — all AI calls are proxied and validated through the Express backend, keeping the Gemini API key server-side only.
- **Access tokens** (short-lived JWTs) are stored in `localStorage` on the client and attached as `Authorization: Bearer <token>` headers.
- **Refresh tokens** (longer-lived JWTs) are stored in an httpOnly, `sameSite=strict` cookie and are used to silently mint new access tokens when a request returns `401`.
- MongoDB persists user profiles (with embedded quiz history), coding problems, and test cases. Quiz **questions themselves are never persisted** — they're generated fresh from Gemini on every "Start Quiz."

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x and npm
- A running **MongoDB** instance (local install or a hosted cluster, e.g. MongoDB Atlas)
- A **Google Gemini API key** — get one for free at [Google AI Studio](https://makersuite.google.com/app/apikey)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env and fill in MONGODB_URI, GEMINI_API_KEY, JWT secrets, etc.
npm run dev      # starts with nodemon on http://localhost:5000
# or
npm start        # plain node
```

The server prints a startup banner and connects to MongoDB automatically. Visiting `http://localhost:5000/` should return:

```
🤖 AI-Powered Quiz Application API is running securely
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev       # starts Vite dev server on http://localhost:5173
```

The Vite dev server proxies any request to `/api/*` to `http://localhost:5000` (see `vite.config.js`), so the two servers work together out of the box during local development.

> ⚠️ **Note:** `frontend/src/api/api.js` currently hardcodes `BASE_URL` to a deployed backend (`https://scalarquiz.onrender.com/api`) rather than reading from an environment variable. For local development against your own backend, either change `BASE_URL` to `http://localhost:5000/api` or rely on the Vite proxy by changing it to a relative path (`/api`).

Once both servers are running, open **http://localhost:5173** in your browser.

---

## Environment Variables

Configured in `backend/.env` (see `backend/.env.example`):

| Variable               | Description                                                            | Example                                          |
|------------------------|--------------------------------------------------------------------------|---------------------------------------------------|
| `MONGODB_URI`          | MongoDB connection string                                               | `mongodb://127.0.0.1:27017/quiz_app`               |
| `GEMINI_API_KEY`       | Google Gemini API key used for quiz/code generation                      | `YOUR_GEMINI_API_KEY_HERE`                         |
| `PORT`                 | Port the Express server listens on                                       | `5000`                                             |
| `FRONTEND_URL`         | Allowed CORS origin for the deployed frontend                            | `https://scalarquiz.netlify.app`                   |
| `JWT_SECRET`           | Secret used to sign access tokens                                        | *(change in production)*                           |
| `JWT_REFRESH_SECRET`   | Secret used to sign refresh tokens                                       | *(change in production)*                           |
| `ACCESS_TOKEN_EXPIRY`  | Access token lifetime                                                    | `15m`                                              |
| `REFRESH_TOKEN_EXPIRY` | Refresh token lifetime                                                   | `7d`                                               |
| `COOKIE_SECRET`        | Reserved for cookie signing                                              | *(change in production)*                           |
| `DUMMY_API_KEY`        | Placeholder for future integrations                                      | —                                                   |

> 🔐 Never commit a real `.env` file — it's already excluded via `backend/.gitignore`.

---

## Available Scripts

**Backend** (`backend/package.json`):

| Script        | Description                              |
|---------------|-------------------------------------------|
| `npm start`   | Runs the server with plain `node`          |
| `npm run dev` | Runs the server with `nodemon` (auto-reload) |

**Frontend** (`frontend/package.json`):

| Script          | Description                          |
|-----------------|----------------------------------------|
| `npm run dev`   | Starts the Vite development server      |
| `npm run build` | Builds a production bundle to `dist/`  |
| `npm run preview` | Serves the production build locally   |

---

## API Reference

All endpoints are prefixed with `/api`. Endpoints marked 🔒 require a valid `Authorization: Bearer <accessToken>` header.

### Auth — `/api/auth`

| Method | Endpoint         | Access | Description                                        |
|--------|------------------|--------|------------------------------------------------------|
| POST   | `/register`      | Public | Create a new account (`name`, `email`, `password`, `role?`) |
| POST   | `/login`         | Public | Log in with `email` + `password`                     |
| POST   | `/logout`        | Public | Clears the refresh-token cookie and revokes it server-side |
| POST   | `/refresh`       | Public (cookie) | Rotates and returns a new access token         |
| GET    | `/me`            | 🔒     | Returns the currently authenticated user's profile   |

### Users — `/api/users` (all routes 🔒)

| Method | Endpoint                        | Description                                      |
|--------|----------------------------------|---------------------------------------------------|
| GET    | `/`                              | List all existing usernames                       |
| GET    | `/:username`                     | Get a user's stats (badges, points, domain averages) |
| PATCH  | `/:username/preferences`         | Update `preferredDifficulty` / `preferredTheme`    |

### Quiz — `/api/quiz`

| Method | Endpoint      | Access | Description                                                             |
|--------|---------------|--------|----------------------------------------------------------------------------|
| GET    | `/domains`    | Public | Returns the list of the 20 supported quiz domains                          |
| GET    | `/status`     | 🔒     | Checks whether Gemini is configured and reachable                          |
| POST   | `/questions`  | 🔒     | Generates fresh questions — body: `{ domain, difficulty, count }`          |
| POST   | `/submit`     | 🔒     | Submits a completed quiz result and updates achievements — body: `{ username, domain, difficulty, correctAnswers, totalQuestions, timeTakenSeconds, totalScore }` |

### Problems — `/api/problems` (all routes 🔒)

| Method | Endpoint | Description                                                    |
|--------|----------|-------------------------------------------------------------------|
| GET    | `/`      | List all coding problems (without full description/starter code) |
| GET    | `/:id`   | Get full problem details + visible (non-hidden) test cases       |

### Code — `/api/code` (all routes 🔒)

| Method | Endpoint  | Description                                                                 |
|--------|-----------|---------------------------------------------------------------------------------|
| POST   | `/submit` | Sends `{ problem, constraints, language, code }` to Gemini for static analysis |

---

## Data Models

### `UserProfile`
Stores account credentials, role, refresh token, and an embedded `quizHistory` array. Includes instance methods:
- `addQuizResult(domain, result)` — appends a result and checks for new achievements
- `checkForAchievements(domain)` — awards "First Quiz," "Quiz Enthusiast," and perfect-score badges
- `getResultsForDomain(domain)` / `getAverageScores()` — per-domain analytics

Also exposes static helpers `findOrCreate(username)` and `getAllUsernames()`.

### `Problem`
Coding problem definition: `title`, `slug`, `difficulty` (`Easy`/`Medium`/`Hard`), `description`, `constraints`, `examples`, `tags`, and a `starterCode` map keyed by language.

### `TestCase`
Linked to a `Problem` via `problemId`; has `input`, `expectedOutput`, and a `hidden` flag to separate public examples from graded hidden cases.

### `LanguageTemplate`
Simple `language` → `starterCode` mapping, usable to seed default starter code independent of a specific problem.

---

## Authentication Flow

1. **Register/Login** — `authController` hashes passwords with bcrypt and issues an access token (short-lived, returned in the JSON body) and a refresh token (long-lived, set as an httpOnly cookie).
2. **Authenticated requests** — the frontend's Axios instance (`api.js`) automatically attaches `Authorization: Bearer <accessToken>` from `localStorage`.
3. **Silent refresh** — if any request returns `401`, an Axios response interceptor calls `/auth/refresh` (using the httpOnly cookie), stores the new access token, and retries the original request once.
4. **Refresh-token reuse detection** — if a refresh token isn't found in the database when presented (e.g., it was already rotated/stolen), the server clears all tokens for that user and returns `403`, forcing re-login.
5. **Logout** — clears the refresh token both in MongoDB and via the cookie.

---

## The AI Quiz Generation Flow

1. On the **Login** page, the app fetches the list of domains from `GET /quiz/domains` and lets the user pick a domain, difficulty, and (for new profiles) preferences.
2. On the **Rules** page, the user configures question count, per-question timer, and review/explanation toggles, then triggers `POST /quiz/questions`.
3. `questionService.getQuestionsForDomain()` calls `geminiService.generateQuestions()`, which sends a heavily prompt-engineered request to `gemini-2.5-flash` demanding:
   - Exactly N questions, each with 4 plausible options and exactly one correct answer
   - Difficulty-specific reasoning depth (recall → applied → multi-step/edge-case)
   - No "All/None of the above," no answer-length "tells," and no repeated concepts
   - Properly indented, multi-line code blocks for any programming questions
   - A strict JSON-only response (no markdown/code fences)
4. The service retries up to 3 times on partial/failed generations, and **shuffles each question's options** server-side (re-mapping `correctIndex`) so the correct answer position is never predictable.
5. If no API key is configured, or all retries fail, the app returns clearly-labeled **fallback sample questions** so the UI never breaks.
6. The **Quiz** page runs a live per-question countdown timer, awards points based on difficulty (`Easy: 10`, `Medium: 20`, `Hard: 30`), and shows an explanation modal after each answer (if enabled).
7. On completion, `POST /quiz/submit` persists the result to the user's `quizHistory`, which triggers achievement checks and returns updated badges/points.

---

## The Code Workspace & AI Analysis Flow

1. Navigating to `/problems/:id` loads a problem's description, constraints, examples, and starter code via `GET /problems/:id`.
2. The **Monaco Editor** (`CodeEditor.jsx`) provides a full IDE-like experience with syntax highlighting for JavaScript, Python, Java, C++, and C, plus light/dark theming.
3. On **Submit**, the frontend calls `POST /code/submit` with the problem text, constraints, chosen language, and the user's code.
4. `geminiService.analyzeCodeWithGemini()` builds a strict prompt instructing Gemini to:
   - **Not execute the code** and **not claim pass/fail** (since there's no sandboxed execution engine wired in yet — see [Roadmap Ideas](#roadmap-ideas))
   - Identify the algorithmic **approach**, **time/space complexity** (with explanations)
   - Determine whether a **meaningfully better approach** exists
   - Score **code quality** (1–10) with explicit strengths/improvements
   - Summarize the **key learning concept**
5. The response is strictly validated (required fields, types, and value ranges) before being returned to the client and rendered in the `CodeAnalysisPanel`.

---

## Frontend Routing

The app uses `HashRouter` (so it can be deployed on static hosts like Netlify without server-side rewrite rules):

| Route            | Page              | Purpose                                             |
|-------------------|-------------------|--------------------------------------------------------|
| `/`               | `Login.jsx`       | Login/signup + domain/difficulty/theme selection        |
| `/rules`          | `Rules.jsx`       | Configure quiz settings, triggers AI question generation |
| `/quiz`           | `Quiz.jsx`        | Live quiz with timer, scoring, and review                |
| `/problems/:id`   | `Workspace.jsx`   | Coding problem workspace with Monaco editor + AI review   |
| `*`               | —                 | Redirects to `/`                                          |

Global state (authenticated profile, chosen domain/difficulty, quiz config, and generated questions) lives in `QuizContext.jsx` and is available anywhere via `useQuizContext()`.

---

## Achievements & Gamification

Achievements are computed server-side inside `UserProfile.checkForAchievements()` whenever a quiz result is added:

| Badge                        | Trigger                                             | Points |
|-------------------------------|------------------------------------------------------|--------|
| 🥇 First Quiz                 | Completing your very first quiz                      | +10    |
| 🏅 Quiz Enthusiast             | Completing your 5th quiz                              | +25    |
| 💯 Perfect Score: `<Domain>`   | Getting every question right in a given domain        | +50    |

`achievementPoints` and `earnedBadges` accumulate on the user's profile and are surfaced in the Statistics modal and login response.

---

## Security Notes

- **Helmet** sets sane security-related HTTP headers by default.
- **CORS** is locked to a single configurable origin (`FRONTEND_URL`) with `credentials: true` to allow the refresh cookie.
- **Rate limiting** caps each IP to 100 requests per 15-minute window across all `/api/` routes.
- **Passwords** are hashed with bcrypt (10 salt rounds) — plaintext passwords are never stored.
- **Refresh tokens** are httpOnly + `sameSite=strict` cookies, invisible to client-side JavaScript, with reuse detection that revokes all sessions if a stale/stolen token is replayed.
- The **Gemini API key never reaches the browser** — all AI calls are proxied through the backend.
- In production, stack traces are hidden from error responses (`err.stack` replaced with `🥞`).

> ⚠️ The shipped `.env.example` contains placeholder/dummy secrets (`JWT_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_SECRET`). **Always replace these with strong, unique values before deploying to production.**

---

## Deployment

The codebase is already wired for a typical split deployment:

- **Backend** — designed to run on a Node host such as **Render** (default CORS origin is set to `https://scalarquiz.netlify.app`, and the production build references `https://scalarquiz.onrender.com/api`).
- **Frontend** — a static Vite build (`npm run build` → `frontend/dist/`) suited for **Netlify**, Vercel, GitHub Pages, or any static host, since `HashRouter` avoids the need for server-side URL rewriting.

To point the frontend at your own backend deployment, update `BASE_URL` in `frontend/src/api/api.js` (and `FRONTEND_URL` in the backend's `.env`) accordingly.

---

## Troubleshooting

- **"Could not load quiz domains from the server"** on the Login page → the backend isn't running or isn't reachable at the URL configured in `api.js`.
- **Questions come back as "Sample question... configure the Gemini API key"** → `GEMINI_API_KEY` is missing/invalid in `backend/.env`, or Gemini requests are failing after 3 retries (check server logs).
- **`504` / "Gemini is taking too long to respond"** → the Gemini request exceeded the 60-second timeout; this is surfaced to the user with a friendly retry message.
- **`401` loops or being logged out unexpectedly** → check that `JWT_SECRET`/`JWT_REFRESH_SECRET` are set consistently and that cookies aren't being blocked (the refresh cookie requires the frontend and backend to share a compatible CORS/cookie configuration).
- **MongoDB connection errors on startup** → verify `MONGODB_URI` is correct and that MongoDB is running/accessible; the server will exit if the initial connection fails.

---

## Roadmap Ideas

These aren't implemented yet, but are natural next steps given the existing structure:

- Wire up a real **sandboxed code execution engine** (e.g., Judge0, Piston) so `TestCase` records can actually grade submissions, rather than relying solely on Gemini's static analysis.
- Move the frontend's hardcoded `BASE_URL` into a Vite environment variable (`import.meta.env.VITE_API_URL`).
- Add an admin UI/endpoints for creating and managing `Problem`/`TestCase`/`LanguageTemplate` documents (currently there's no create/update/delete route for these models).
- Add automated tests (unit/integration) for controllers, services, and React components.

---

## License

No license file is currently included in this repository. Add a `LICENSE` file to clarify usage rights if you intend to distribute or open-source this project.
