# 🏟️ StadiumFlow AI — FIFA World Cup 2026 Smart Stadium Operations & Navigation

[![Next.js 16](https://img.shields.io/badge/Next.js-16.2.10-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.4-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4.0-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Vitest-4.1.10-yellow?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-green?style=for-the-badge&logo=playwright)](https://playwright.dev/)

StadiumFlow AI is a secure, highly accessible, and resilient GenAI-enabled command shell designed to optimize venue operations and elevate the tournament experience for fans, volunteers, on-ground staff, and emergency dispatchers at the **FIFA World Cup 2026**.

This platform combines **deterministic pathfinding and crowd telemetry** with **grounded Generative AI assistance** to coordinate crowd control, step-free emergency routing, and multilingual assistance in real time.

---

## 📸 Interface Screenshots

Explore the premium UI design and dynamic theme options (Light / Dark Mode):

| Landing Portal | Operations Console |
| :---: | :---: |
| ![Landing Page](/public/screenshots/landing.png) | ![Operations Dashboard](/public/screenshots/operations.png) |

| Smart Routing | AI Copilot Hub |
| :---: | :---: |
| ![Smart Navigation](/public/screenshots/navigation.png) | ![Copilot Assistant](/public/screenshots/assistant.png) |

---

## 🛠️ Key Product Features

### 1. Operations Command Center (HQ)
*   **Concentric Seating Bowl Visualizer:** Replaces abstract seating representation with a curved concentric SVG stadium bowl layout. It maps seat dots across Gate entrances, VIP suites, lower and upper stands, and public plazas.
*   **Real-time Seating Telemetry:** Renders seat dots that dynamically color-code based on simulated load metrics (Green for Vacant, Yellow/Orange/Red for occupied & congested states).
*   **Accessible Seating Indicators (`♿`):** Highlights designated step-free, wheelchair-friendly seats in public plazas, lower VIP boxes, and entry gates.
*   **Dispatcher Escalations & AI Briefs:** Integrates a real-time incident queue. Selecting an alert generates a grounded AI severity briefing and an interactive action checklist (e.g., dispatching volunteers, initiating detours).

### 2. Smart Crowd-Aware Navigation
*   **Deterministic Dijkstra Router:** Computes the fastest walking paths between Points of Interest (Gates, Stand sections, Restrooms, First-Aid stations, Transit Plazas) in $O(V \log V + E)$ time.
*   **Accessibility Constraints:** Selecting the **Step-Free** filter dynamically bypasses stairs-only walkways, routing elderly and disabled fans exclusively through ramps, elevators, and step-free plazas.
*   **Congestion Avoidance Detours:** Automatically recalculates paths to divert fans away from active bottlenecks, applying a mathematical penalty multiplier to congested edges.

### 3. Volunteer & Fan Copilot Hub
*   **Multilingual GenAI Chat:** Supports full conversations in **English**, **Español**, and **Hinglish (Roman Hindi)**.
*   **Grounded RAG Queries:** Prompts are injected with structured live system data (active POI states, closed zones, unresolved incidents) to guarantee zero hallucinations.
*   **Resilient Offline Fallback:** If the Gemini API key is missing or calls time out, the system degrades to a local, rules-based dictionary matcher, keeping the UI fully interactive.

---

## 🏗️ Architecture & Data Flow

```mermaid
graph TD
    A[UI Layout Shell] -->|User Actions / Theme Toggle| B[StadiumContext State]
    B -->|Navigation Settings| C[Dijkstra Pathfinding Engine]
    B -->|Occupancy Sliders| D[Concentric Seating Bowl SVG]
    B -->|User Chat Prompt| E[Next.js API route: /api/ai/copilot]
    E -->|IP Rate Limiter| F{API Key & Network OK?}
    F -->|Yes| G[Grounded Gemini SDK Adapter]
    F -->|No / Timeout| H[Deterministic Fallback Engine]
    G -->|Structured JSON Response| I[User Interface Chat Bubble]
    H -->|Local QA Template Match| I
```

### RAG System Prompt Grounding Diagram
Below is the execution flow of how raw query strings are enriched with active state variables and security tokens before matching:

```mermaid
sequenceDiagram
    participant User as Client Browser
    participant API as Next.js API route (/api/ai/copilot)
    participant Limiter as IP Rate Limiter
    participant context as Stadium Context (Telemetry)
    participant Gemini as Google Gemini SDK

    User->>API: POST /api/ai/copilot (Message, History, Role)
    API->>Limiter: Check Client IP limits
    Limiter-->>API: Limit Check Passed
    API->>context: Read Active telemetry (Zones occupancy, closed gates, incidents)
    context-->>API: Structured Grounding JSON
    API->>API: Compile System Grounding Prompt
    API->>Gemini: sendMessage(Prompt + Grounding Data)
    Gemini-->>API: JSON Structured Response
    API-->>User: Validated Schema JSON Response (Intent + Followups)
```

---

## 📂 Project Directory Structure

The codebase is organized into modular folders separating presentation, state context, static data assets, and domain logic:

```bash
FIFA CHALLENGE/
├── e2e/                     # Playwright automated End-to-End browser tests
│   └── basic.spec.ts        # E2E Smoke and User Journey flows
├── public/                  # Static assets (images, icons, theme logos)
│   └── screenshots/         # UI layout walkthrough screenshots
├── src/
│   ├── app/                 # Next.js App Router pages and API routes
│   │   ├── api/             # REST/JSON endpoints
│   │   │   └── ai/          # Gemini RAG Copilot & explanation routes
│   │   │       ├── copilot/ # Main grounded chatbot route
│   │   │       └── explain-route/ # Dijkstra path AI description route
│   │   ├── assistant/       # AI Copilot chatbot interface
│   │   ├── navigate/        # Smart Navigation & pathfinding map interface
│   │   ├── operations/      # Operations Command Center Dashboard
│   │   │   └── incidents/   # Incidents Log list and audit table
│   │   ├── sustainability/  # Green telemetry & evacuation guides
│   │   ├── layout.tsx       # Root layout configuration
│   │   └── page.tsx         # Main Landing Portal page
│   ├── components/          # Reusable React components
│   │   ├── layout/          # Page layouts (Navbar, Shell)
│   │   └── ui/              # Accessible, reusable UI components (Alerts, Buttons, Tables)
│   ├── context/             # Global Context for Stadium telemetry, pathfinding, and incidents
│   ├── data/                # Static Stadium graph node/edge descriptions
│   ├── lib/
│   │   ├── ai/              # Google Generative AI / Gemini SDK clients
│   │   │   ├── gemini.ts    # AI Singleton & connection utilities
│   │   │   ├── schemas.ts   # Zod request/response validators
│   │   │   └── fallbacks.ts # Deterministic backup response rules
│   │   ├── domain/          # Core business/operational engines
│   │   │   ├── crowd/       # Seating bowl & occupancy calculator
│   │   │   ├── decisions/   # Rules-based Q&A fallback engine
│   │   │   └── routing/     # Dijkstra graph pathfinding algorithm
│   │   └── server/          # Server utilities (IP-based API rate limiter)
│   └── types/               # Type definitions for seating, routing, and alerts
├── tests/                   # Vitest unit tests for components, pages, state, and domain engines
│   ├── components/          # Layout, Shell, and Visuals unit testing
│   ├── context/             # Context state transitions & mutations testing
│   ├── domain/              # Dijkstra, Incident assessments, and crowd load tests
│   └── server/              # In-memory IP Rate Limiter testing
└── package.json             # Build commands and dependency catalog
```

---

## ⚙️ Mathematical & Logical Specifications

### 1. Dijkstra Pathfinding Router
The core routing algorithm calculates the shortest path on a weighted graph $G(V, E)$. The edge weights $W(e)$ represent base walking distances, which are dynamically adjusted based on crowd density and accessibility filters:

$$W_{final}(e) = W_{base}(e) \times (1 + \text{Congestion Penalty}) \times \text{Accessibility Multiplier}$$

*   **Congestion Penalty:** If an edge's destination node lies in a congested zone, its weight scales up:
    $$\text{Congestion Penalty} = \text{Congestion Ratio} \times \text{Multiplier}$$
    
    The congestion multiplier values are categorized by bands:
    - **RED (Occupancy $\ge 90\%$):** 4.0x multiplier
    - **ORANGE (Occupancy $\ge 75\%$):** 2.0x multiplier
    - **YELLOW (Occupancy $\ge 50\%$):** 1.3x multiplier
    - **GREEN (Occupancy $< 50\%$):** 1.0x multiplier (No penalty)
    
*   **Accessibility Filter:** If the **Step-Free** navigation option is selected and the edge type is `stairs`, the Edge is filtered out or its weight is set to infinity ($\infty$).

To maximize computation speed and minimize complexity, the router implements **$O(1)$ Hash Map Lookups** for all dynamic queries. Instead of executing linear scans over arrays inside hot loops (i.e. `Array.prototype.find`), nodes, zones, and edge mappings are pre-cached in constant-time hash tables.

#### Step-by-Step Path Calculation Trace
For a route from **Gate A** to **Section 101**:
1.  Initialize distance table: $D[\text{Gate A}] = 0$, all others $\infty$.
2.  Pre-map all POIs and Zones to $O(1)$ lookup maps.
3.  Evaluate neighbors of **Gate A** (e.g., **North Concourse Link**, distance 60m):
    - Retrieve zone details of North Concourse ($O(1)$).
    - If Concourse occupancy is 3300/4000 ($82.5\%$, **ORANGE**): Apply $2.0\text{x}$ multiplier.
    - Final edge cost $= 60 \times 2.0 = 120\text{m}$.
    - Set $D[\text{North Concourse Link}] = 120$.
4.  Reconstruct the shortest path from the destination once visited.

### 2. Multi-Lingual Grounding & Fallback Engine
When the user chats with the AI Copilot:
1.  **Context Injection (RAG):** The system queries the active `StadiumContext` for live state metrics (e.g. gates closed, incident count, current congestions) and injects this data directly into the system prompt.
2.  **Safety Rate Limiter:** The Next.js API route limits request frequency based on client IP using a sliding-window token bucket in `src/lib/server/rate-limit.ts`.
3.  **Secure IP Resolver:** Implements protection against HTTP header spoofing by resolving client addresses using secure header splitting (extracting the first entry from `X-Forwarded-For` and falling back to `X-Real-IP`).
4.  **Deterministic Fallback:** If the Gemini API is offline, the client invokes `src/lib/domain/decisions/engine.ts` which uses optimized regular expression pattern-matchers to reply with structured, local, and accurate data.

---

## 🔒 Security Specifications & Threat Modeling

Our system maintains strict security controls across endpoints, operations roles, and data access. The table below outlines our threat modeling and safeguards:

| Threat Vector | Severity | Vulnerability Impact | Mitigation Strategy |
| :--- | :---: | :--- | :--- |
| **IP Spoofing / Rate Limiter Bypass** | High | Spammer could fake `x-forwarded-for` to bypass API limits. | Strict IP extraction using `forwardedFor.split(',')[0].trim()` fallback to `x-real-ip`. |
| **CORS Policy Exploits** | Medium | Malicious sites executing client queries on behalf of fans. | Restricts origins to matched host headers and verified `.vercel.app` domains. |
| **Privilege Escalation** | High | General users triggering Operator/Volunteer instructions. | Production authentication headers validated against `process.env.STADIUMFLOW_AUTH_TOKEN`. |
| **LLM Injection / Hallucinations** | Medium | Users tricking chatbot to bypass stadium rules. | Strictly grounded RAG templates restricting models to provided context payloads. |

---

## 💻 CLI Commands & Development

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Run Local Development Server
Launch the next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application in the browser.

### 3. Run Quality Verification Pipeline
Executes eslint linter, TypeScript check, unit tests, and production build:
```bash
npm run verify
```

### 4. Run Unit Tests & Coverage
Runs the suite of Vitest unit tests:
```bash
# Run tests once
npm run test

# Run tests with HTML coverage report
npm run test:coverage
```

### 5. Run Automated E2E Tests
Runs Playwright end-to-end integration tests:
```bash
# Installs browsers if running for the first time
npx playwright install

# Run E2E tests
npm run test:e2e
```

---

## ♿ Accessibility Compliance (a11y)

StadiumFlow AI is built with accessibility in mind, conforming to WCAG 2.1 AA standards:
*   **ARIA Roles & Landmarks:** All pages use semantic HTML (`<main>`, `<nav>`, `<header>`, `<footer>`) with explicit descriptive labels.
*   **Keyboard Navigation:** Accessible pages support full keyboard navigation (`Tab`, `Shift+Tab`, `Enter`).
*   **a11y Testing:** We use `vitest-axe` to run automated accessibility checks inside component unit tests, verifying color contrast, image descriptions, and element nesting.
