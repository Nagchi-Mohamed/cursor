import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import AppBar from './components/layout/AppBar';
import Drawer from './components/layout/Drawer';
import ErrorBoundary from './components/common/ErrorBoundary';
import FullScreenLoader from './components/common/FullScreenLoader';
import PrivateRoute from './components/common/PrivateRoute';
import AdminLayout from './components/layout/AdminLayout';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';

// Import pages directly
import Home from './pages/Home';
import LessonsPage from './pages/LessonsPage';
import LessonDetailPage from './pages/LessonDetailPage';
import PracticePage from './pages/PracticePage';
import SolverPage from './pages/SolverPage';
import ForumPage from './pages/ForumPage';
import GroupStudyPage from './pages/GroupStudyPage';
import CalendarPage from './pages/CalendarPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ProfilePage from './pages/ProfilePage';

// Lazy load admin pages
const AdminDashboardPage = React.lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminLessonListPage = React.lazy(() => import('./pages/admin/AdminLessonListPage'));
const AdminLessonFormPage = React.lazy(() => import('./pages/admin/AdminLessonFormPage'));
const AdminUserListPage = React.lazy(() => import('./pages/admin/AdminUserListPage'));
const AdminFeedbackListPage = React.lazy(() => import('./pages/admin/AdminFeedbackListPage'));

// ErrorBoundarySuspense component
const ErrorBoundarySuspense = ({ children }) => (
  <ErrorBoundary>
    <Suspense fallback={<FullScreenLoader />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <CssBaseline />
            <Box sx={{ display: 'flex' }}>
              <AppBar />
              <Drawer />
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  p: 3,
                  mt: 8,
                  backgroundColor: (theme) => theme.palette.background.default,
                  minHeight: '100vh',
                }}
              >
                <ErrorBoundary>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/lessons" element={<LessonsPage />} />
                    <Route path="/lessons/:lessonId" element={<LessonDetailPage />} />
                    <Route path="/practice" element={<PracticePage />} />
                    <Route path="/solver" element={<SolverPage />} />
                    <Route path="/forum" element={<ForumPage />} />
                    <Route path="/group-study" element={<GroupStudyPage />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route
                      path="/profile"
                      element={
                        <PrivateRoute>
                          <ProfilePage />
                        </PrivateRoute>
                      }
                    />

                    {/* Admin Routes */}
                    <Route
                      path="/admin/dashboard"
                      element={
                        <AdminProtectedRoute>
                          <AdminLayout>
                            <ErrorBoundarySuspense>
                              <AdminDashboardPage />
                            </ErrorBoundarySuspense>
                          </AdminLayout>
                        </AdminProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/lessons"
                      element={
                        <AdminProtectedRoute>
                          <AdminLayout>
                            <ErrorBoundarySuspense>
                              <AdminLessonListPage />
                            </ErrorBoundarySuspense>
                          </AdminLayout>
                        </AdminProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/lessons/new"
                      element={
                        <AdminProtectedRoute>
                          <AdminLayout>
                            <ErrorBoundarySuspense>
                              <AdminLessonFormPage />
                            </ErrorBoundarySuspense>
                          </AdminLayout>
                        </AdminProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/lessons/edit/:lessonId"
                      element={
                        <AdminProtectedRoute>
                          <AdminLayout>
                            <ErrorBoundarySuspense>
                              <AdminLessonFormPage />
                            </ErrorBoundarySuspense>
                          </AdminLayout>
                        </AdminProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/users"
                      element={
                        <AdminProtectedRoute>
                          <AdminLayout>
                            <ErrorBoundarySuspense>
                              <AdminUserListPage />
                            </ErrorBoundarySuspense>
                          </AdminLayout>
                        </AdminProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/feedback"
                      element={
                        <AdminProtectedRoute>
                          <AdminLayout>
                            <ErrorBoundarySuspense>
                              <AdminFeedbackListPage />
                            </ErrorBoundarySuspense>
                          </AdminLayout>
                        </AdminProtectedRoute>
                      }
                    />
                  </Routes>
                </ErrorBoundary>
              </Box>
            </Box>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App; 