import { Navigate, Route, Routes } from "react-router-dom";

import { AdminRoute } from "@/components/AdminRoute";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import CasesPage from "@/pages/cases";
import CreateCasePage from "@/pages/createCase";
import CaseDetailsPage from "@/pages/caseDetails";
import LoginPage from "@/pages/login";
import RecoveryPasswordPage from "@/pages/recoveryPassword";
import ResetPasswordPage from "@/pages/resetPassword";
import UsersPage from "@/pages/users";

function App() {
  return (
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
  );
}

export default App;
