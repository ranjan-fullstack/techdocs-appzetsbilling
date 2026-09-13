import { Routes, Route, Navigate } from 'react-router-dom';
import DbArchitecture from './pages/DbArchitecture.jsx';
import ApplicationFlow from './pages/ApplicationFlow.jsx';
import TechStack from './pages/TechStack.jsx';
import KnownIssues from './pages/KnownIssues.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/db-architecture" replace />} />
      <Route path="/db-architecture" element={<DbArchitecture />} />
      <Route path="/application-flow" element={<ApplicationFlow />} />
      <Route path="/tech-stack" element={<TechStack />} />
      <Route path="/known-issues" element={<KnownIssues />} />
    </Routes>
  );
}
