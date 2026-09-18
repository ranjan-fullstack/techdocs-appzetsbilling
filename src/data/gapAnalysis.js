// The Gap Analysis report is generated from ../gap-analysis (src bodies + build.mjs) into
// public/reports/gap-analysis/. Each part is a standalone HTML page shown inside the docs shell
// through an iframe, so the left sidebar stays visible. Keep ids in sync with the generated files.
export const GAP_BASE = `${import.meta.env.BASE_URL}reports/gap-analysis/`;
export const GAP_COMBINED = `${GAP_BASE}AppZetBilling-Gap-Analysis-Combined.html`;

export const GAP_PARTS = [
  { id: '01-infrastructure', num: '01', label: 'Infrastructure', title: 'Infrastructure — what actually runs in production' },
  { id: '02-codebase-database', num: '02', label: 'Codebase & Database', title: 'Codebase & Database' },
  { id: '03-feature-inventory', num: '03', label: 'Feature Inventory', title: 'AppZetBilling Feature Inventory' },
  { id: '04-petpooja-catalog', num: '04', label: 'Petpooja Catalog', title: 'Petpooja Capability Catalog (with sources)' },
  { id: '05-integration-map', num: '05', label: 'Integration Map', title: 'Integration Ecosystem Map' },
  { id: '06-master-matrix', num: '06', label: 'Master Matrix', title: 'Master Comparison Matrix (111 rows)' },
  { id: '07-blueprint-db-api', num: '07', label: 'Blueprint, DB & API', title: 'Implementation Blueprint, DB & API Gaps' },
  { id: '08-whatsapp-delivery-offline', num: '08', label: 'WhatsApp, Delivery, Offline', title: 'WhatsApp, Delivery & Offline' },
  { id: '09-security', num: '09', label: 'Security Audit', title: 'Security Audit' },
  { id: '10-roadmap-architecture-cost', num: '10', label: 'Roadmap & Cost', title: 'Roadmap, Architecture, Monetization & Cost' },
  { id: '11-odisha-strategy', num: '11', label: 'Odisha Strategy', title: 'Odisha-First Strategy' },
  { id: '12-executive-summary', num: '12', label: 'Executive Summary', title: 'Executive Report & Odisha #1 Roadmap' },
];
