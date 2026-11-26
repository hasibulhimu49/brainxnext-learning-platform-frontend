# BrainXNext Learning Platform - Frontend

A modern and responsive Learning Management System (LMS) frontend built with React. It provides an intuitive interface for students, instructors, and administrators to access courses, manage learning content, and track progress.

## 🚀 Features

- User Authentication (JWT)
- Role-Based Access Control
- Course Listing & Details
- Video Lesson Interface
- Quiz & Assignment Pages
- Student Dashboard
- Responsive Design
- Modern UI/UX
- REST API Integration

## 🛠️ Tech Stack

- React 19 + TypeScript (strict mode)
- Vite
- React Router (lazy-loaded routes)
- Tailwind CSS + shadcn/ui
- Axios (one centralized API client, common response envelope)
- TanStack Query (server state)
- Zustand (client state: auth session, theme)
- React Hook Form + Zod (forms and validation)
- Vitest + React Testing Library, Playwright (end-to-end)
- ESLint + Prettier

See [CLAUDE.md](CLAUDE.md) and [docs/project](docs/project) for the architecture rules.

## 📁 Project Structure

```text
src/
├── api/          # Axios client, response envelope, mock API
├── services/     # one function per endpoint
├── queries/      # TanStack Query hooks + query keys
├── stores/       # Zustand stores (auth, ui)
├── schemas/      # Zod schemas for forms and requests
├── types/        # API contract types
├── constants/    # UI copy and config
├── components/   # ui/ (shadcn), common/, auth/, course/, marketing/, layout/
├── layouts/
├── pages/
├── routes/
├── test/         # Vitest setup and helpers
├── App.tsx
└── main.tsx
e2e/              # Playwright tests
```

## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/your-username/brainxnext-learning-platform-frontend.git
```

Navigate to the project:

```bash
cd brainxnext-learning-platform-frontend
```

Install dependencies:

```bash
npm install
```

## ▶️ Run the Development Server

```bash
npm run dev
```

The application will be available at:

```
http://localhost:5173
```

## 🏗️ Build for Production

```bash
npm run build
```

## 🔍 Preview Production Build

```bash
npm run preview
```

## 🌐 Environment Variables

Copy `.env.example` to `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_USE_MOCK_API=true
```

With `VITE_USE_MOCK_API=true` (the default) the app runs against a built-in mock API that speaks the same response envelope as the backend. Set it to `false` to call `VITE_API_BASE_URL`.

Demo login for the mock API: `hasibulx26@gmail.com` / `12345678`.

## 📦 Available Scripts

| Command             | Description                                                                     |
| ------------------- | ------------------------------------------------------------------------------- |
| `npm run dev`       | Starts the development server                                                   |
| `npm run build`     | Type-checks and builds for production                                           |
| `npm run preview`   | Previews the production build                                                   |
| `npm run typecheck` | Runs the TypeScript compiler                                                    |
| `npm run lint`      | Runs ESLint                                                                     |
| `npm run format`    | Formats the code with Prettier                                                  |
| `npm test`          | Runs unit and component tests (Vitest)                                          |
| `npm run test:e2e`  | Runs end-to-end tests (Playwright; first run `npx playwright install chromium`) |

## 🤝 Contributing

Contributions are welcome! Feel free to fork the repository, create a feature branch, and submit a pull request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Mohammad Hasibul Hasan**

Backend Developer | Java | Spring Boot | React | PostgreSQL

---

If you like this project, consider giving it a ⭐ on GitHub.
