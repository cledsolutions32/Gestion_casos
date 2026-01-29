import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import CasesPage from "@/pages/cases";
import LoginPage from "@/pages/login";
import RecoveryPasswordPage from "@/pages/recoveryPassword";
import ResetPasswordPage from "@/pages/resetPassword";
import UsersPage from "@/pages/users";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/cases" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/recovery-password" element={<RecoveryPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/cases"
        element={
          <ProtectedRoute>
            <CasesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
