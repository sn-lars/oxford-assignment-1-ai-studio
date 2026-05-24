import { BriefingPackage } from "./types";

export const PRELOADED_PACKAGES: BriefingPackage[] = [
  {
    id: "q4-strategic",
    title: "Q4 Strategy Review",
    time: "Oct 24, 2023 • 10:00 AM",
    notes: `Confidential Notes for Q4 Strategic Review.
Primary objective is to map out the international expansion and address key logistics constraints identified during our latest operational audit. We must resolve performance discrepancies and align on hiring expansion budgets across our Western-Europe (EMEA) branches. Priority is tactical execution.`,
    files: [
      {
        id: "q3-financials",
        name: "Q3_Financial_Performance_Summary.pdf",
        size: "2.4 MB",
        uploadedAt: "10 mins ago",
        status: "Scanned",
        content: `EXECUTIVE AUDIT SECTION 3: Financial Performance
- Core operational variance calculated at exactly 12% in Q3 due to excessive shipping surcharges.
- Budget allocation for international expansion to be negotiated, but EMEA hiring must remain capped at 14 engineering roles until next fiscal audit.`
      },
      {
        id: "logistics-ops",
        name: "Logistics_Operations_Dept_Report.docx",
        size: "1.2 MB",
        uploadedAt: "30 mins ago",
        status: "Processed",
        content: `LOGISTICS RISK EVALUATION:
- Southeast Asian semiconductor market logistics is experiencing congestion.
- According to the Logistics Operations Dept, supply chain disruptions will delay hardware component integration by 8-10 weeks. This will prevent timely assembly of our analytics hardware.`
      },
      {
        id: "supply-roadmap",
        name: "Main_Hardware_Supply_Roadmap_Final.pptx",
        size: "15.8 MB",
        uploadedAt: "1 hour ago",
        status: "Processed",
        content: `GLOBAL LOGISTICS ALIGNMENT MATRIX:
- Central supply routes for Southeast Asian semiconductor lines are fully normalized.
- Hardware supply roadmap predicts a lag of under 2 weeks because backup suppliers have accepted the full delivery queue. All assembly centers are ready.`
      },
      {
        id: "legal-whitepaper",
        name: "Legal_&_Compliance_Whitepaper.pdf",
        size: "845 KB",
        uploadedAt: "2 hours ago",
        status: "Processed",
        content: `REGULATORY MANDATES BRIEFING:
- Pending regulatory modifications regarding GDPR Phase 3 compliance dictate auditing of external data proxies.
- Compliance updates may require a 15% increase in legal compliance budget from current baseline to cover multi-territory litigation and audits.`
      },
      {
        id: "competitor-intel",
        name: "Market_Intelligence_Briefing_Oct_2023.docx",
        size: "1.1 MB",
        uploadedAt: "3 hours ago",
        status: "Processed",
        content: `COMPETITOR OUTLOOK PANEL:
- Competitor X acquired Alpha-Tech last week.
- This creates immediate pricing risks. They will likely push highly aggressive pricing model updates targeting the mid-market intelligence segments. We need to stay competitive on cost.`
      }
    ]
  },
  {
    id: "merger-alignment",
    title: "Merger & Acquisition Deep Dive",
    time: "Nov 12, 2023 • 2:00 PM",
    notes: `Executive Notes for AetherSoft Acquisition Audit.
We are reviewing the final acquisition terms for organic cloud service provider 'AetherSoft'. Need clarity on outstanding legal disputes, final liability caps, and technology redundancies. Priority is to present board risks.`,
    files: [
      {
        id: "due-diligence",
        name: "AetherSoft_Due_Diligence_Finances.pdf",
        size: "3.8 MB",
        uploadedAt: "Just now",
        status: "Processed",
        content: `AETHERSOFT AUDITED ACCOUNTING:
- Document outlines detailed accounts and indemnities.
- Section 4.2: Total legal liability cap and pending lawsuit reserves are structured at exactly $5,000,000.`
      },
      {
        id: "legal-strategy",
        name: "Corporate_Legal_Strategy_Memo.docx",
        size: "2.1 MB",
        uploadedAt: "15 mins ago",
        status: "Processed",
        content: `M&A TRIAL COUNSEL ANALYSIS:
- Review of class-action history of AetherSoft reveals secondary environmental assessments.
- Real liability exposure shows the legal liability cap must be structured at $20,000,000 to cover pending patent disputes.`
      },
      {
        id: "integration-review",
        name: "Product_Integration_Redundancy_Review.pptx",
        size: "8.4 MB",
        uploadedAt: "1 hour ago",
        status: "Processed",
        content: `TECHNICAL ARCHITECTURE INTEGRATION PANEL:
- System audit identified highly overlapping data nodes.
- Redundancy rate calculated at 35% across transactional services, requiring targeted software team layouts.`
      }
    ]
  },
  {
    id: "horizon-launch",
    title: "Product Launch Plan",
    time: "Dec 05, 2023 • 9:00 AM",
    notes: `Notes for Launch Readiness of 'Horizon AI Dashboard' project.
Reviewing critical timelines before announcing release publicly. Core conflicts between Product roadmap and Engineering Sprint capability need to be addressed.`,
    files: [
      {
        id: "product-timeline",
        name: "Product_Management_Timeline.pdf",
        size: "1.9 MB",
        uploadedAt: "2 mins ago",
        status: "Processed",
        content: `PRODUCT STRATEGIC TARGETS:
- High-level commercial rollout of Project Horizon is scheduled globally for September 15. Marketing has purchased banner media for this week.`
      },
      {
        id: "engineering-sprint",
        name: "Engineering_Sprint_Outlook.docx",
        size: "3.2 MB",
        uploadedAt: "10 mins ago",
        status: "Processed",
        content: `ENGINEERING LOGISTICS REPORT:
- Security testing identified a critical session validation vulnerability.
- Horizon Dashboard sprint outlines demonstrate that launch cannot proceed earlier than November 11 due to mandatory cryptographic refactoring.`
      },
      {
        id: "creative-brief",
        name: "Marketing_Campaign_Creative_Brief.pptx",
        size: "6.5 MB",
        uploadedAt: "2 hours ago",
        status: "Processed",
        content: `CREATIVE AND CHANNELS MIX:
- Marketing has allocation of $250,000 for launch ads.
- Target division is $100,000 for tech influencer packages and $150,000 for enterprise programmatic search.`
      }
    ]
  }
];
