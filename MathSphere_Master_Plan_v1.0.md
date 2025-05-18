# MathSphere: Full Stack Completion - Master Plan & Instructions

**Document Version:** 1.0  
**Date:** [Current Date]  
**Project Lead:** [Your Name/Handle]  
**Target AI Assistant:** AI Code Editor / Developer

---

## I. Project Overview & Vision

### A. What is MathSphere?

MathSphere is envisioned as a comprehensive, AI-enhanced online mathematics learning platform. Its core mission is to provide users (students, educators, lifelong learners) with not just answers to math problems, but also interactive learning experiences, detailed step-by-step solutions, personalized progress tracking, and collaborative learning opportunities. The platform aims to make mathematics more accessible, understandable, and engaging.

### B. Key Pillars & Features:

1. **AI-Powered Math Problem Solver:**

   - Multiple input methods (typed LaTeX, image upload/OCR, voice input).
   - Integration with Wolfram Alpha (or a similar powerful engine) for solving a wide range of math problems (Arithmetic, Algebra, Geometry, Trigonometry, Calculus, etc.).
   - Display of clear, step-by-step solutions and final answers rendered with KaTeX.
   - Solution history for users.

2. **Interactive Learning Content:**

   - Lessons: Curated or admin-created lessons on various math topics, potentially including rich text, KaTeX, images, and embedded media.
   - Practice Sets: Interactive practice problems with various question types (Multiple Choice, Fill-in-the-Blank, Equation Input) linked to lessons. Real-time feedback and scoring.

3. **User Engagement & Personalization:**

   - User authentication and profiles.
   - Personalized dashboard showing progress, recent activity, and recommendations.
   - Progress tracking across lessons and practice sets.
   - Achievements/gamification elements.

4. **Community & Collaboration (Future MVPs):**

   - Forum: For users to ask questions, discuss problems, and share knowledge.
   - Group Study: Facilitate creation and joining of virtual study groups.
   - Calendar: Personal and group event scheduling.

5. **Administration & Content Management:**

   - Secure admin panel for managing users, lessons, practice sets, questions, and reviewing feedback.
   - Rich text editor for lesson creation with KaTeX and media support.

6. **Platform Experience:**
   - Modern, responsive, and accessible user interface built with Material-UI.
   - Themeable (Light/Dark modes).
   - Multilingual support (English, French, Spanish initially).

### C. Technology Stack:

- **Frontend:** React (with Vite), Material-UI (MUI), React Router, Axios (or Fetch API), KaTeX (for math rendering), Recharts (for charts).

  - State Management: React Context API (for Auth, Theme, Language), component state (useState, useReducer).
  - Styling: MUI sx prop, styled-components (if used), global theme.

- **Backend:** Node.js with Express.js.

- **Database:** MongoDB (with Mongoose ODM).

- **Authentication:** JWT (JSON Web Tokens) with password hashing (bcrypt).

- **Math Solver Integration:** Wolfram Alpha API.

- **File Uploads:** Multer (backend), potentially cloud storage (S3/Azure Blob) for production.

- **Development/Build:** Vite (frontend), Nodemon (backend dev).

- **Testing (Target):** Jest, React Testing Library (frontend); Jest, Supertest (backend). Cypress/Playwright (E2E).

---

## II. Current Project Status (Summary of What's Been "Done" or Significantly Progressed)

### Core Frontend Structure:

- `App.jsx` with routing, ThemeContext, LanguageContext, AuthContext.
- `AppBar.jsx` (Top Bar): Includes direct Theme Toggle (Switch), Language Selector (Select), and Settings Menu (IconButton opening SettingsMenu.jsx). Mobile responsive (collapses controls into "More" menu).
- `Drawer.jsx` (Sidebar): Flexible/collapsible design (icons-only default, expands on hover/focus on desktop; temporary/modal on mobile). Includes navigation links: Dashboard, Lessons, Practice, Solver, History, Forum, Group Study, Calendar. Handles protected route visibility.
- `SettingsMenu.jsx`: Provides Login/Signup (logged out) and Profile/Logout (logged in) options.
- `ThemeContext.jsx`: Manages light/dark themes, persists to localStorage with error handling. Comprehensive theme definitions in place.
- `LanguageContext.jsx`: Manages EN/FR/ES, persists to localStorage with error handling. Translation loading (e.g., from JSON, supporting nested keys and interpolation).
- `FullScreenLoader.jsx` and `ErrorBoundary.jsx` implemented and integrated with lazy-loaded routes.
- Helper components like `FormField.jsx` and `validation.js` for consistent forms.

### Key User-Facing Pages (Significantly Polished):

- `DashboardPage.jsx`: Displays learning stats, topic performance (Recharts), recent activity, recommendations. Theme, language, A11y, responsive.
- `SolverPage.jsx`: LaTeX input, image upload UI, voice input UI (integrates with SolverService.js), KaTeX solution display, collapsible history panel. Theme, language, A11y, responsive, error handling.
- `LessonListPage.jsx`: Displays lesson cards, search, category/difficulty filters, rating/time display. Theme, language, A11y, responsive, error handling.
- `LessonDetailPage.jsx`: Displays lesson content (text, KaTeX, code blocks), breadcrumbs, rating, completion tracking, related content, feedback. Theme, language, A11y, responsive.
- `PracticeListPage.jsx`: Displays practice set cards, search, category/difficulty filters, rating/time display. Theme, language, A11y, responsive.
- `PracticeSetPage.jsx`: Implemented with high detail. Supports Multiple Choice, Fill-in-Blank, Equation Input questions. Navigation, submission, feedback, hints, timer, comprehensive results screen with review. Theme, language, A11y, responsive.
- `ProfilePage.jsx`: Displays/edits user info, changes password, profile picture upload UI, learning history summary, achievements, preferences. Theme, language, A11y, validation.
- `LoginPage.jsx` & `SignUpPage.jsx`: Polished with validation and A11y using FormField.jsx.

### Forum Feature (Significant Progress):

- Backend: Robust API for threads and posts (CRUD, likes, solutions, views, categories, tags, pagination, search, validation) using Mongoose schemas (ForumThread, ForumPost) and Express controllers/routes.
- Frontend:
  - `forumService.js` created.
  - `ForumPage.jsx` (thread list with search, filters, sort, pagination, "Create Thread" button).
  - `CreateThreadDialog.jsx` (form for new thread: title, category, tags, markdown content).
  - `ThreadPage.jsx` (view single thread: posts, markdown/KaTeX rendering, like, reply, mark solution, edit/delete).
  - Polished for theme, language, A11y, responsiveness.

### Admin Section Foundation (Backend & Frontend Setup):

- Backend:

  - `Lesson.js` Mongoose model (comprehensive: title, slug, summary, content, category, difficulty, time, tags, published status, author, views, rating, timestamps, validation, indexes, hooks).
  - `adminAuth.js` middleware (isAdmin).
  - `adminLessonController.js` & `adminLessonRoutes.js`: Full CRUD for lessons, advanced filtering/sorting/pagination, media upload endpoint (/api/v1/admin/media/upload) using multer. Robust input validation.

- Frontend:
  - `AdminProtectedRoute.jsx` created.
  - `AdminLayout.jsx` created (with admin sidebar).
  - `adminLessonService.js` created.
  - `AdminLessonListPage.jsx` created (displays lessons in MUI DataGrid, with search, filters, pagination, Edit/Delete actions, "Create New Lesson" button).
  - Admin routes added to `App.jsx` (lazy-loaded, protected, using AdminLayout).
  - "Admin Panel" link in `SettingsMenu.jsx` for admins.

### Backend Hardening (Initial Phase Done):

- Global `errorHandler.js` middleware and `ApiError` class.
- Security middleware setup in `server.js` (Helmet, rate limiting, mongoSanitize, xss, hpp, bodyParser limits).
- Enhanced input validation (express-validator) for Auth and User Profile routes.

### Compilation Errors (Recently Addressed/To Be Verified As Fixed):

- Installation of `date-fns`, `@uiw/react-md-editor` (and KaTeX dependencies), `@mui/x-data-grid`.
- Correction of react-i18next vs LanguageContext usage.
- Creation/correction of `authHeader.js`.
- Creation of placeholder `AdminDashboardPage.jsx`.
- Correction of `LoadingSpinner` to `FullScreenLoader` in `App.jsx`.

---

## III. What Needs To Be Done Next - "Finish Everything" Plan

This plan assumes the compilation errors from the last interaction are fully resolved and the application runs.

### Phase 1: Complete Admin Lesson Form Frontend & Stabilize Admin Lesson Management (Immediate Focus)

1. **AdminLessonFormPage.jsx (Continue Implementation & Polish):**

   - File: `src/pages/admin/AdminLessonFormPage.jsx`.
   - Reference Implementations: `ImageUploadButton.jsx`, `CustomToolbar.jsx` (for MDEditor).
   - Rich Text Editor (MDEditor):
     - KaTeX Support (Critical):
       - Ensure `@uiw/react-md-editor`, `remark-math`, `rehype-katex` are installed and correctly configured as remarkPlugins and rehypePlugins for MDEditor's preview.
       - Ensure global KaTeX CSS (`katex/dist/katex.min.css`) is imported once in `App.jsx` or `index.js`.
       - Test thoroughly by typing LaTeX (`$$...$$`, `$...$`) in the editor and verifying correct rendering in the preview and on the user-facing `LessonDetailPage`.
     - Image Upload Integration:
       - The `CustomToolbar` with `ImageUploadButton` should be integrated with MDEditor.
       - The `useImageUpload` hook should correctly call `adminLessonService.uploadLessonMedia()`.
       - The returned image URL must be correctly inserted into the MDEditor content as Markdown (`![alt](url)`).
       - Preview Modes: Ensure admins can toggle between edit, split (live preview), and preview-only modes for the MDEditor. The default MDEditor toolbar usually provides these; ensure your customCommands setup for the image upload button doesn't remove them, or add them back.
   - Form Fields & Validation:
     - Implement ALL form fields (Title, Slug, Summary, Category, Difficulty, Estimated Time, Tags, Is Published) using `FormField.jsx` or appropriate MUI components.
     - Implement robust client-side validation using `validation.js` for all these fields (e.g., isRequired, validateLength, specific formats).
     - Display validation errors clearly.
   - Create/Edit Logic:
     - Handle `mode="create"` vs. `mode="edit"` (fetch lesson data for edit).
     - Submit logic calls `adminLessonService.createLesson()` or `adminLessonService.updateLesson()`.
     - Handle loading states, success (Snackbar, redirect), and API error messages.
   - Apply Full Polish Protocol: Theme (admin), Language (UI chrome), A11y (editor accessibility), Responsiveness.

2. **Thorough E2E Testing of Admin Lesson Management Flow:**
   - Admin login -> Navigate to Admin Panel -> Lessons.
   - Create a new lesson with rich text, KaTeX, and uploaded images. Publish it.
   - View the lesson on the user-facing `LessonDetailPage` - verify content rendering.
   - Edit the lesson from the admin panel, make changes, save. Verify changes.
   - Change published status. Verify it appears/disappears from user list.
   - Delete a lesson (with confirmation).

### Phase 2: Complete Remaining Admin Sections

1. **Admin Dashboard (`AdminDashboardPage.jsx`):**

   - Backend: API endpoint(s) to provide summary statistics (total users, lessons, practice sets, recent feedback counts).
   - Frontend: Fetch and display these stats using MUI Cards, Typography, and simple Recharts if desired.

2. **User Management (`AdminUserListPage.jsx`, `AdminUserFormPage.jsx` or Modal):**

   - Backend APIs:
     - List users (with search by email/name, pagination).
     - Get single user details.
     - Update user (especially role to promote/demote admin, isBanned status).
   - Frontend:
     - DataGrid to list users.
     - Actions to view details, edit role, ban/unban.
     - Form/modal for editing user details (especially role/status).

3. **Practice Set & Question Management (Complex - Major Sub-Project):**

   - Backend APIs:
     - Full CRUD for PracticeSet (title, description, associated LessonId, difficulty, category).
     - Full CRUD for Question (questionText [with KaTeX], questionType [MCQ, FillBlank, Equation], options [for MCQ], correctAnswer, hints, associated PracticeSetId).
     - API to manage the order of questions within a set.
   - Frontend (`AdminPracticeSetListPage.jsx`, `AdminPracticeSetFormPage.jsx`, `AdminQuestionListPage.jsx` [within a set], `AdminQuestionFormPage.jsx`):
     - List Practice Sets.
     - Form to create/edit Practice Sets.
     - Interface to view questions within a Practice Set.
     - Form (`AdminQuestionFormPage`) to create/edit Questions. This form will need to be dynamic based on questionType to show appropriate fields (e.g., option inputs for MCQ).

4. **Feedback Review Panel (`AdminFeedbackListPage.jsx`):**
   - Backend API: List feedback, filter by status (new, read, resolved), update status.
   - Frontend: DataGrid to display feedback, view details, change status.

### Phase 3: Implement User-Facing Placeholder Features - MVPs (Group Study & Calendar)

1. **Group Study Feature (MVP):**

   - Backend:
     - `StudyGroupSchema` (topic, description, createdBy, members: [ObjectId], meetingTime, meetingLink, maxMembers).
     - API: Create group, list groups (filterable), get group details, join/leave group. Validation & Auth.
   - Frontend (`GroupStudyPage.jsx`, `groupStudyService.js`, sub-components):
     - List available groups (cards with topic, time, member count).
     - "Create Group" button -> Modal/form to create a group.
     - Detail view for a group: shows full info, member list, meeting link (if user is member & time is near), Join/Leave button.
     - Full Polish Protocol.

2. **Calendar Feature (MVP):**
   - Backend:
     - `CalendarEventSchema` (title, description, startTime, endTime, userId [for personal], relatedTo [e.g., studyGroupId], eventType).
     - API: Get events for user for a date range, create personal event. (Study group events auto-created/linked).
   - Frontend (`CalendarPage.jsx`, `calendarService.js`, sub-components):
     - Integrate a calendar library (e.g., react-big-calendar).
     - Display user's events (personal + joined study groups).
     - Allow creating simple personal events (click date -> modal form).
     - Full Polish Protocol.

### Phase 4: Finalize Backend Hardening & Database Optimization

1. Input Validation (express-validator): Ensure 100% coverage for ALL fields on ALL API endpoints (including all Admin and new feature APIs).
2. Mongoose Schema Validation: Final comprehensive review of ALL schemas.
3. Database Indexing Strategy: Final review and optimization based on ALL application queries (user-facing and admin). Use explain().
4. Security Hardening (Final Pass): Helmet, Rate Limiting, CORS, JWT security, secure environment variable management for production, XSS/CSRF considerations, password policies.
5. Advanced Caching (Redis - if performance dictates): For Wolfram Alpha API responses and frequently accessed, computationally expensive read APIs.
6. Logging & Monitoring: Ensure comprehensive logging. Plan for production monitoring tools (Sentry, etc.).
7. Full Suite of Backend Unit & Integration Tests: This is non-negotiable. Cover all services, controllers, and critical API paths.

### Phase 5: Final Overarching Frontend Polish & Full System E2E Testing

1. System-Wide UI/UX Consistency Review: A final pass to ensure consistent design language, spacing, typography, interaction patterns across the entire application (user and admin sides).
2. System-Wide Accessibility (A11y) Audit: Use tools (Lighthouse, Axe) and manual testing (keyboard, screen reader if possible) on ALL pages and user flows. Fix all critical issues.
3. System-Wide Performance Optimization:
   - Final check with React Dev Tools Profiler.
   - Final bundle size analysis.
   - Image optimization review.
   - Ensure all lazy loading is effective.
4. System-Wide Responsiveness Testing: Test all user and admin flows on mobile, tablet, and various desktop sizes.
5. Complete JSDoc Documentation for all components, services, hooks, utils.
6. Code Cleanup: Remove all dead code, commented-out experiments, unused variables/imports. Final linting/formatting pass.
7. Full End-to-End (E2E) Scenario Testing (Manual & Automated):
   - Manual: Test ALL major user flows for ALL roles (User, Admin) from registration/login through all features to logout. This includes happy paths and common error conditions.
   - Automated (Cypress/Playwright): Implement E2E tests for the most critical user flows (e.g., User Registration, Login, Solve a Problem, View a Lesson, Admin Creates a Lesson, User Joins a Study Group).

### Phase 6: Deployment & DevOps

1. Staging Environment: Set up a staging environment that mirrors production as closely as possible. Deploy full application.
2. User Acceptance Testing (UAT): If possible, have a small group of beta testers use the staging environment and provide feedback.
3. Production Environment Setup:
   - Hosting for frontend (Vercel, Netlify, S3/CloudFront).
   - Hosting for backend (Heroku, AWS EC2/Beanstalk, DigitalOcean App Platform, Render).
   - Production MongoDB instance (MongoDB Atlas).
   - Secure management of all production environment variables and API keys.
   - Setup automated database backups.
   - Ensure HTTPS is enforced.
4. CI/CD (Continuous Integration / Continuous Deployment) Pipeline:
   - Automate builds, tests, and deployments to staging (and production after manual approval) using GitHub Actions, GitLab CI, etc.
5. Production Deployment: Carefully execute the deployment plan.
6. Post-Launch Monitoring & Maintenance Plan:
   - Set up error tracking (Sentry) and performance monitoring for production.
   - Monitor logs.
   - Have a plan for bug fixes, security updates, and future enhancements.

---

## Immediate Next Steps for AI (Sequential):

1. **CRITICAL:** Fix ALL Compilation & ESLint Errors from the last message. The application MUST compile and run cleanly before any new feature work.

   - Install missing npm packages (`date-fns`, `@uiw/react-md-editor` + KaTeX deps, `@mui/x-data-grid`).
   - Resolve react-i18next vs LanguageContext import issues.
   - Create/fix `src/utils/authHeader.js` and its import in `adminLessonService.js`.
   - Create placeholder `AdminDashboardPage.jsx`.
   - Fix `LoadingSpinner` to `FullScreenLoader` in `App.jsx`.

2. Once the app runs, proceed to fully implement `AdminLessonFormPage.jsx` (Phase 1 above):
   - Integrate MDEditor.
   - Implement KaTeX support within MDEditor.
   - Implement image upload via CustomToolbar and useImageUpload hook, integrating with `adminLessonService.uploadLessonMedia()`.
   - Implement all form fields, validation (`validation.js`), and submit logic (create/update).
   - Thoroughly test and polish this form (Theme, Language, A11y, Responsiveness, Error Handling).

---

This master plan document provides a comprehensive roadmap for completing MathSphere to a fully polished, production-ready state. Follow the phases sequentially, ensuring quality and stability at each step.
