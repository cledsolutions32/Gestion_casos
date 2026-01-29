import { Navigate, Route, Routes } from "react-router-dom";

import CasesPage from "@/pages/cases";
import LoginPage from "@/pages/login";
import UsersPage from "@/pages/users";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cases" element={<CasesPage />} />
      <Route path="/users" element={<UsersPage />} />
    </Routes>
  );
}

export default App;
