import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import PapersPage from "./PapersPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/papers" element={<PapersPage />} />
      </Routes>
    </BrowserRouter>
  );
}
