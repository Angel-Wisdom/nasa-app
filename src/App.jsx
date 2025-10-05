import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import PapersPage from "./PapersPage";
import KeywordExplorer from "./KeywordExplorer";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Existing Papers Page */}
        <Route path="/papers" element={<PapersPage />} />

        {/* New Keyword Explorer Page */}
        <Route path="/explore" element={<KeywordExplorer />} />
      </Routes>
    </BrowserRouter>
  );
}
