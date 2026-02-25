import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Spinner } from "@heroui/spinner";

import { AdminRoute } from "@/components/AdminRoute";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const LoginPage = lazy(() => import("@/pages/login"));
const CasesPage = lazy(() => import("@/pages/cases"));
const CreateCasePage = lazy(() => import("@/pages/createCase"));
const CaseDetailsPage = lazy(() => import("@/pages/caseDetails"));
const RecoveryPasswordPage = lazy(() => import("@/pages/recoveryPassword"));
const ResetPasswordPage = lazy(() => import("@/pages/resetPassword"));
const UsersPage = lazy(() => import("@/pages/users"));

function App() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#F4F4F5]"><Spinner /></div>}>
    <Routes>
      <Route element={<Navigate replace to="/cases" />} path="/" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<RecoveryPasswordPage />} path="/recovery-password" />
      <Route element={<ResetPasswordPage />} path="/reset-password" />
      <Route
        element={
          <ProtectedRoute>
            <CasesPage />
          </ProtectedRoute>
        }
        path="/cases"
      />
      <Route
        element={
          <AdminRoute>
            <CreateCasePage />
          </AdminRoute>
        }
        path="/cases/new"
      />
      <Route
        element={
          <ProtectedRoute>
            <CaseDetailsPage />
          </ProtectedRoute>
        }
        path="/cases/:id"
      />
      <Route
        element={
          <AdminRoute>
            <UsersPage />
          </AdminRoute>
        }
        path="/users"
      />
    </Routes>
    </Suspense>
  );
}

export default App;
