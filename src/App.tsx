import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import TeacherLayout from "./layouts/TeacherLayout";
import AdminLayout from "./layouts/AdminLayout";
import StudentLayout from "./layouts/StudentLayout";

// Routes Protection
import ProtectedRoute from "./components/routes/ProtectedRoute";
import AuthRoute from "./components/routes/AuthRoute";

// Admin Components
import AdminDashboard from "./page/Admin/AdminDashboard";
import AdminUsers from "./page/Admin/AdminUsers";
import AdminDepartments from "./page/Admin/AdminDepartments";
import AdminCourses from "./page/Admin/AdminCourses";
import AdminProfile from "./page/Admin/AdminProfile";
import AdminSchedule from "./page/Admin/AdminSchedule";
import AdminConcernPage from "./page/Admin/AdminConcernPage";
import AdminResources from "./page/Admin/AdminResources";
import AdminAnnouncements from "./page/Admin/AdminAnnouncements";

// Teacher Components
import TeacherDashboard from "./page/teacher/TeacherDashboard";
import TeacherProfile from "./page/teacher/TeacherProfile";
import AssignmentsPage from "./page/teacher/AssignmentsPage";
import AssignmentDetailsPage from "./page/teacher/AssignmentDetailsPage";
import ClassesPage from "./page/teacher/ClassesPage";
import StudentsPage from "./page/teacher/StudentsPage";
import AddGrade from "./page/teacher/AddGrade";
import TeacherChattingPage from "./page/teacher/ChattingPage";
import TeacherAiAssistent from "./page/teacher/AiPage";
import TeacherConcernPage from "./page/teacher/TeacherConcernPage";
import TeacherNotificationsPage from "./page/teacher/NotificationsPage";
import TeacherResources from "./page/teacher/TeacherResources";

// Student Components
import StudentDashboard from "./page/student/StudentDashboard";
import StudentProfile from "./page/student/Profile";
import StudentAssignmentsPage from "./page/student/StudentAssignmentsPage";
import StudentClassesPage from "./page/student/StudentClassesPage";
import Grade from "./page/student/Grade";
import StudentChattingPage from "./page/student/ChattingPage";
import StudentAiAssistent from "./page/student/AiPage";
import StudentConcernPage from "./page/student/StudentConcernPage";
import StudentNotificationsPage from "./page/student/NotificationsPage";
import StudentResources from "./page/student/StudentResources";
import StudentCalendar from "./page/student/StudentCalendar";

// Auth Components
import AdminLogin from "./page/Authentication/AdminLogin";
import TeacherLogin from "./page/Authentication/TeacherLogin";
import StudentLogin from "./page/Authentication/StudentLogin";
import ForgotPassword from "./page/Authentication/ForgotPassword";
import ResetPassword from "./page/Authentication/ResetPassword";

const App: React.FC = () => {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            style: {
              background: "#3b82f6",
            },
          },
          error: {
            style: {
              background: "#ef4444",
            },
          },
        }}
      />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        {/* Public Auth Routes */}
        <Route
          path="/"
          element={<Navigate to="/auth/student-login" replace />}
        />
        <Route
          path="/auth/admin-login"
          element={<AuthRoute element={<AdminLogin />} />}
        />
        <Route
          path="/auth/teacher-login"
          element={<AuthRoute element={<TeacherLogin />} />}
        />
        <Route
          path="/auth/student-login"
          element={<AuthRoute element={<StudentLogin />} />}
        />
        <Route
          path="/auth/forgot-password"
          element={<AuthRoute element={<ForgotPassword />} />}
        />
        <Route
          path="/auth/reset-password/:token"
          element={<AuthRoute element={<ResetPassword />} />}
        />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/departments" element={<AdminDepartments />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/schedule" element={<AdminSchedule />} />
            <Route path="/admin/concerns" element={<AdminConcernPage />} />
            <Route path="/admin/resources" element={<AdminResources />} />
            <Route
              path="/admin/announcements"
              element={<AdminAnnouncements />}
            />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["Teacher"]} />}>
          <Route element={<TeacherLayout />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/profile" element={<TeacherProfile />} />
            <Route path="/teacher/assignments" element={<AssignmentsPage />} />
            <Route
              path="/teacher/assignments/:assignmentId"
              element={<AssignmentDetailsPage />}
            />
            <Route path="/teacher/my-classes" element={<ClassesPage />} />
            <Route
              path="/teacher/my-classes/:id/students"
              element={<StudentsPage />}
            />
            <Route path="/teacher/students" element={<StudentsPage />} />
            <Route path="/teacher/grades" element={<AddGrade />} />
            <Route path="/teacher/chat" element={<TeacherChattingPage />} />
            <Route
              path="/teacher/ai-assistant"
              element={<TeacherAiAssistent />}
            />
            <Route path="/teacher/concerns" element={<TeacherConcernPage />} />
            <Route
              path="/teacher/notifications"
              element={<TeacherNotificationsPage />}
            />
            <Route path="/teacher/resources" element={<TeacherResources />} />
          </Route>
        </Route>

        {/* Protected Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Student"]} />}>
          <Route element={<StudentLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route
              path="/student/assignments"
              element={<StudentAssignmentsPage />}
            />
            <Route path="/student/classPage" element={<StudentClassesPage />} />
            <Route path="/student/grades" element={<Grade />} />
            <Route path="/student/chat" element={<StudentChattingPage />} />
            <Route
              path="/student/ai-assistant"
              element={<StudentAiAssistent />}
            />
            <Route path="/student/concerns" element={<StudentConcernPage />} />
            <Route
              path="/student/notifications"
              element={<StudentNotificationsPage />}
            />
            <Route path="/student/resources" element={<StudentResources />} />
            <Route path="/student/calendar" element={<StudentCalendar />} />
          </Route>
        </Route>

        {/* Catch All - Redirect */}
        <Route
          path="*"
          element={<Navigate to="/auth/student-login" replace />}
        />
      </Routes>
    </>
  );
};

export default App;
