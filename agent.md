# AGENT.md

## Project Overview

This is a production Next.js application for sports broadcasting and tournament management.

Main Features:

* Scoreboard Overlay
* Operator Dashboard
* Live Stream Management
* Match Schedule
* Premier League Module
* Champions League Module
* World Cup Module
* Countdown Timer
* TikTok Overlay
* Authentication & IAM
* Running Text System
* Third Title System

The application is already functional.

Your responsibility is to maintain, improve, and organize the codebase without breaking existing functionality.

---

# Core Rules

## DO

* Follow existing coding patterns.
* Keep changes minimal and focused.
* Organize code by feature.
* Reuse existing components whenever possible.
* Prefer composition over duplication.
* Preserve backward compatibility.
* Refactor only when necessary.
* Keep files close to their feature.

## DO NOT

* Rewrite the entire application.
* Change business logic without request.
* Move files unnecessarily.
* Introduce complex architectures.
* Create generic abstractions without clear usage.
* Add libraries unless explicitly requested.
* Break existing routes.
* Rename Firebase collections without instruction.

---

# Architecture Principles

Use Feature-Based Architecture.

```text
src/
├── app/
├── features/
├── shared/
├── services/
├── assets/
├── data/
└── middleware.js
```

---

# Feature Structure

Each feature should follow:

```text
feature-name/
├── components/
├── hooks/
├── services/
├── utils/
├── types/
├── schemas/
└── index.js
```

Example:

```text
features/
└── overlay/
    ├── components/
    ├── layouts/
    ├── operators/
    ├── overlays/
    ├── hooks/
    ├── services/
    ├── utils/
    └── configs/
```

---

# Route Organization

App Router is the source of truth.

Routes remain inside:

```text
src/app
```

Business logic should live inside features.

Example:

```text
app/(dashboard)/operator/page.jsx
```

Should import from:

```text
features/overlay/*
```

Avoid placing large business logic directly inside route files.

Route files should primarily:

* fetch params
* render page
* connect feature modules

---

# Shared Layer

Only place code in shared if it is used by multiple features.

```text
shared/
├── components/
├── layouts/
├── hooks/
├── providers/
├── utils/
├── configs/
└── constants/
```

Examples:

* Button
* Card
* Sidebar
* Logo
* Modal Base
* Theme Config
* Global Hooks

Feature-specific code should never be placed in shared.

---

# Firebase Rules

All Firebase code belongs to:

```text
services/firebase/
```

Structure:

```text
services/firebase/
├── app.js
├── auth.js
├── firestore.js
├── admin.js
└── index.js
```

Avoid creating duplicate Firebase clients.

Use a single initialization source.

Never create additional firebaseConfig files.

---

# Overlay Module

Overlay is a first-class feature.

Structure:

```text
features/overlay/
├── components/
├── layouts/
├── operators/
├── overlays/
├── hooks/
├── services/
├── configs/
└── utils/
```

Examples:

Operators:

```text
OperatorA
OperatorB
OperatorC
OperatorD
OperatorE
OperatorPildun
```

Layouts:

```text
LayoutA
LayoutB
LayoutC
LayoutD
LayoutE
LayoutPildun
LayoutPildun2
```

Overlay Views:

```text
ScoreboardOverlay
RunningTextOverlay
ThirdTitleOverlay
```

---

# Naming Conventions

Components:

```text
PascalCase.jsx
```

Hooks:

```text
useSomething.js
```

Utils:

```text
camelCase.js
```

Configs:

```text
something.config.js
```

Constants:

```text
UPPER_CASE_CONSTANT
```

---

# Import Rules

Prefer aliases.

Example:

```js
import ScoreboardOverlay from '@/features/overlay/overlays/ScoreboardOverlay'
```

Avoid:

```js
../../../../../../components
```

---

# Refactoring Rules

When refactoring:

1. Identify duplicate code.
2. Verify usage locations.
3. Move code safely.
4. Update imports.
5. Preserve behavior.
6. Remove dead files only after verification.

Never perform large-scale migrations in a single step.

---

# Performance Guidelines

Prefer:

* Dynamic imports for heavy modules.
* Memoization only when necessary.
* Server Components when possible.
* Client Components only when required.

Avoid premature optimization.

---

# Before Any Change

Always ask:

1. Which feature owns this code?
2. Is it reusable?
3. Does it belong in shared?
4. Will this break existing routes?
5. Can the change be smaller?

If unsure, preserve the existing implementation.
