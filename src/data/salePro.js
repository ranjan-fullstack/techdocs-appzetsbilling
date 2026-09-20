// The SalePro due-diligence report is generated from ../salepro-analysis (src bodies + build.mjs) into
// public/reports/salepro-analysis/. Each part is a standalone HTML page shown inside the docs shell
// through an iframe, so the left sidebar stays visible. Keep ids in sync with the generated files.
export const SP_BASE = `${import.meta.env.BASE_URL}reports/salepro-analysis/`;
export const SP_COMBINED = `${SP_BASE}SalePro-SaaS-Due-Diligence-Combined.html`;

export const SP_PARTS = [
  { id: '01-summary-products-license', num: '01', label: 'Summary & License', title: 'Executive Summary, Products & License' },
  { id: '02-features-saas-techstack-admin', num: '02', label: 'Features & SaaS', title: 'SalePro & SaaS Feature Matrices, Tech Stack, Admin' },
  { id: '03-architecture-infra-cloud', num: '03', label: 'Architecture & Cloud', title: 'Tenant Architecture, Servers & Cloud Cost' },
  { id: '04-competitors-restaurant-retail', num: '04', label: 'Competitors & Fit', title: 'Competitors, Restaurant & Retail Fit' },
  { id: '05-gaps-customization', num: '05', label: 'Gaps & Customization', title: 'Feature Gaps & Customization Effort' },
  { id: '06-pricing-unit-economics', num: '06', label: 'Pricing & Economics', title: 'Pricing Strategy & Unit Economics' },
  { id: '07-market-penetration', num: '07', label: 'Market & Penetration', title: 'Market Size & Penetration Scenarios' },
  { id: '08-security-risks', num: '08', label: 'Security & Risks', title: 'Security, Technical & Business Risks' },
  { id: '09-gtm-roadmap-scaling', num: '09', label: 'GTM & Roadmap', title: 'Go-to-Market, Operations, Roadmap & Scaling' },
  { id: '10-odisha-branding', num: '10', label: 'Odisha Branding', title: 'Odisha Branding, Naming & Positioning' },
  { id: '11-decision-checklist', num: '11', label: 'Decision & Checklist', title: 'Final Decision, Due-Diligence & Purchase Checklist' },
  { id: '12-official-docs-reference', num: '12', label: 'Official Docs Reference', title: 'SalePro Official Documentation Reference' },
];
