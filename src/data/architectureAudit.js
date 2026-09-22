// The Architecture Audit report is generated from ../architecture-audit (src bodies + build.mjs)
// into public/reports/architecture-audit/. Each part is a standalone HTML page shown inside the
// docs shell through an iframe, so the left sidebar stays visible. Keep ids in sync with the
// generated files.
export const AA_BASE = `${import.meta.env.BASE_URL}reports/architecture-audit/`;
export const AA_COMBINED = `${AA_BASE}AppZetBilling-Architecture-Audit-Combined.html`;

export const AA_PARTS = [
  { id: '01-executive-summary', num: '01', label: 'Executive Summary', title: 'Executive Summary' },
  { id: '02-current-web-technology-stack', num: '02', label: 'Web Tech Stack', title: 'Current Web Technology Stack' },
  { id: '03-current-mobile-technology-stack', num: '03', label: 'Mobile Tech Stack', title: 'Current Mobile Technology Stack' },
  { id: '04-current-backend-api-architecture', num: '04', label: 'Backend/API Architecture', title: 'Current Backend/API Architecture' },
  { id: '05-database-architecture', num: '05', label: 'Database Architecture', title: 'Database Architecture' },
  { id: '06-mobile-web-synchronization-status', num: '06', label: 'Mobile ↔ Web Sync', title: 'Mobile ↔ Web Synchronization Status' },
  { id: '07-complete-api-mapping', num: '07', label: 'Complete API Mapping', title: 'Complete API Mapping' },
  { id: '08-feature-by-feature-comparison', num: '08', label: 'Feature Comparison', title: 'Feature-by-Feature Comparison' },
  { id: '09-current-architecture-problems', num: '09', label: 'Architecture Problems', title: 'Current Architecture Problems' },
  { id: '10-recommended-target-architecture', num: '10', label: 'Target Architecture', title: 'Recommended Target Architecture' },
  { id: '11-authentication-strategy', num: '11', label: 'Authentication Strategy', title: 'Authentication Strategy' },
  { id: '12-multi-tenant-strategy', num: '12', label: 'Multi-Tenant Strategy', title: 'Multi-Tenant Strategy' },
  { id: '13-realtime-strategy', num: '13', label: 'Realtime Strategy', title: 'Realtime Strategy' },
  { id: '14-offline-strategy', num: '14', label: 'Offline Strategy', title: 'Offline Strategy' },
  { id: '15-security-findings', num: '15', label: 'Security Findings', title: 'Security Findings' },
  { id: '16-environment-strategy', num: '16', label: 'Environment Strategy', title: 'Environment Strategy' },
  { id: '17-api-versioning-strategy', num: '17', label: 'API Versioning Strategy', title: 'API Versioning Strategy' },
  { id: '18-testing-strategy', num: '18', label: 'Testing Strategy', title: 'Testing Strategy' },
  { id: '19-ci-cd-strategy', num: '19', label: 'CI/CD Strategy', title: 'CI/CD Strategy' },
  { id: '20-development-roadmap', num: '20', label: 'Development Roadmap', title: 'Development Roadmap' },
  { id: '21-priority-matrix', num: '21', label: 'Priority Matrix', title: 'Priority Matrix' },
  { id: '22-estimated-development-effort', num: '22', label: 'Estimated Dev Effort', title: 'Estimated Development Effort' },
  { id: '23-recommended-team-workflow', num: '23', label: 'Team Workflow', title: 'Recommended Team Workflow' },
  { id: '24-final-recommendation', num: '24', label: 'Final Recommendation', title: 'Final Recommendation' },
];
