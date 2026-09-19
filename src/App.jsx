import { Routes, Route, Navigate } from 'react-router-dom';
import DbArchitecture from './pages/DbArchitecture.jsx';
import ApplicationFlow from './pages/ApplicationFlow.jsx';
import TechStack from './pages/TechStack.jsx';
import KnownIssues from './pages/KnownIssues.jsx';
import BackupMigration from './pages/BackupMigration.jsx';
import Deployment from './pages/Deployment.jsx';
import TlsCertificate from './pages/TlsCertificate.jsx';
import WhatsAppModule from './pages/WhatsAppModule.jsx';
import PetpoojaComparison from './pages/PetpoojaComparison.jsx';
import GapAnalysis from './pages/GapAnalysis.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/db-architecture" replace />} />
      <Route path="/db-architecture" element={<DbArchitecture />} />
      <Route path="/application-flow" element={<ApplicationFlow />} />
      <Route path="/tech-stack" element={<TechStack />} />
      <Route path="/known-issues" element={<KnownIssues />} />
      <Route path="/backup-migration" element={<BackupMigration />} />
      <Route path="/deployment" element={<Deployment />} />
      <Route path="/tls-certificate" element={<TlsCertificate />} />
      <Route path="/whatsapp-module" element={<WhatsAppModule />} />
      <Route path="/petpooja-comparison" element={<PetpoojaComparison />} />
      <Route path="/gap-analysis" element={<GapAnalysis />} />
      <Route path="/gap-analysis/:part" element={<GapAnalysis />} />
    </Routes>
  );
}
