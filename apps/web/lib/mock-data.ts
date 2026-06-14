export type RiskSeverity = "critical" | "high" | "medium" | "low";

export const dashboardMetrics = [
  {
    label: "Monitored exposure",
    value: "₹286.4 Cr",
    change: "8.2%",
    changeTone: "up" as const,
    note: "since last month"
  },
  {
    label: "High-risk exposure",
    value: "₹42.8 Cr",
    change: "₹6.4 Cr",
    changeTone: "up" as const,
    note: "newly elevated"
  },
  {
    label: "Open alerts",
    value: "38",
    change: "12 urgent",
    changeTone: "flat" as const,
    note: "7 beyond SLA"
  },
  {
    label: "Evidence coverage",
    value: "91.6%",
    change: "2.4%",
    changeTone: "up" as const,
    note: "verified this week"
  }
] as const;

export const maturityBuckets = [
  { label: "< 6 months", value: "₹38.2 Cr", percent: 34, tone: "critical" },
  { label: "6–12 months", value: "₹64.5 Cr", percent: 58, tone: "high" },
  { label: "1–3 years", value: "₹112.8 Cr", percent: 100, tone: "primary" },
  { label: "> 3 years", value: "₹70.9 Cr", percent: 63, tone: "neutral" }
] as const;

export const portfolioRows: Array<{
  entityId: string;
  evidenceAge: string;
  id: string;
  isin: string;
  issuer: string;
  maturity: string;
  outstanding: string;
  rating: string;
  risk: RiskSeverity;
  sector: string;
  security: string;
}> = [
  {
    id: "exp-001",
    entityId: "suryodaya-finance",
    issuer: "Suryodaya Finance Limited",
    isin: "INE982X07124",
    sector: "NBFC",
    outstanding: "₹36.0 Cr",
    maturity: "14 Feb 2027",
    rating: "BBB- / Negative",
    security: "Secured",
    risk: "critical",
    evidenceAge: "Today"
  },
  {
    id: "exp-002",
    entityId: "maitri-infra",
    issuer: "Maitri Infrastructure Pvt Ltd",
    isin: "INE0MIP07018",
    sector: "Infrastructure",
    outstanding: "₹28.5 Cr",
    maturity: "30 Sep 2026",
    rating: "BBB / Watch",
    security: "Secured",
    risk: "high",
    evidenceAge: "2 days"
  },
  {
    id: "exp-003",
    entityId: "aashray-housing",
    issuer: "Aashray Housing Finance Ltd",
    isin: "INE07ZH07036",
    sector: "Housing finance",
    outstanding: "₹24.8 Cr",
    maturity: "22 Jun 2028",
    rating: "A- / Stable",
    security: "Secured",
    risk: "medium",
    evidenceAge: "Today"
  },
  {
    id: "exp-004",
    entityId: "navjeevan-textiles",
    issuer: "Navjeevan Textiles Limited",
    isin: "INE614T07029",
    sector: "Textiles",
    outstanding: "₹21.2 Cr",
    maturity: "18 Dec 2026",
    rating: "BBB+ / Stable",
    security: "Secured",
    risk: "medium",
    evidenceAge: "9 days"
  },
  {
    id: "exp-005",
    entityId: "pragati-logistics",
    issuer: "Pragati Logistics Pvt Ltd",
    isin: "INE0PLS07011",
    sector: "Logistics",
    outstanding: "₹18.6 Cr",
    maturity: "02 Mar 2029",
    rating: "A / Stable",
    security: "Secured",
    risk: "low",
    evidenceAge: "3 days"
  },
  {
    id: "exp-006",
    entityId: "vistar-energy",
    issuer: "Vistar Renewable Energy Ltd",
    isin: "INE0VRE07042",
    sector: "Renewable energy",
    outstanding: "₹16.4 Cr",
    maturity: "12 Aug 2028",
    rating: "A- / Stable",
    security: "Secured",
    risk: "low",
    evidenceAge: "Today"
  }
];

export const alertRows: Array<{
  age: string;
  counterparty: string;
  entityId: string;
  exposure: string;
  id: string;
  isin: string;
  owner: string;
  severity: RiskSeverity;
  source: string;
  status: string;
  trigger: string;
}> = [
  {
    id: "ALT-2048",
    entityId: "suryodaya-finance",
    counterparty: "Suryodaya Finance Limited",
    isin: "INE982X07124",
    severity: "critical",
    trigger: "Rating moved to default",
    exposure: "₹18.4 Cr",
    owner: "Ananya Rao",
    status: "Escalated",
    age: "2h",
    source: "Rating action"
  },
  {
    id: "ALT-2045",
    entityId: "maitri-infra",
    counterparty: "Maitri Infrastructure Pvt Ltd",
    isin: "INE0MIP07018",
    severity: "high",
    trigger: "New material MCA charge",
    exposure: "₹28.5 Cr",
    owner: "Unassigned",
    status: "Open",
    age: "5h",
    source: "MCA"
  },
  {
    id: "ALT-2039",
    entityId: "aashray-housing",
    counterparty: "Aashray Housing Finance Ltd",
    isin: "INE07ZH07036",
    severity: "high",
    trigger: "GST filing delayed repeatedly",
    exposure: "₹24.8 Cr",
    owner: "Rohit Sen",
    status: "Acknowledged",
    age: "1d",
    source: "GST"
  },
  {
    id: "ALT-2031",
    entityId: "navjeevan-textiles",
    counterparty: "Navjeevan Textiles Limited",
    isin: "INE614T07029",
    severity: "medium",
    trigger: "Key director resigned",
    exposure: "₹21.2 Cr",
    owner: "Meera Shah",
    status: "Investigating",
    age: "2d",
    source: "MCA"
  },
  {
    id: "ALT-2022",
    entityId: "pragati-logistics",
    counterparty: "Pragati Logistics Pvt Ltd",
    isin: "INE0PLS07011",
    severity: "low",
    trigger: "Registered office updated",
    exposure: "₹18.6 Cr",
    owner: "Vikram Das",
    status: "Open",
    age: "3d",
    source: "MCA"
  }
];

export const counterparties = [
  {
    id: "suryodaya-finance",
    name: "Suryodaya Finance Limited",
    type: "Issuer",
    cin: "U65929MH2012PLC231890",
    gstin: "27AAQCS4821B1Z6",
    sector: "NBFC",
    exposure: "₹36.0 Cr",
    rating: "BBB- / Negative",
    risk: "critical" as const,
    verified: "GST, MCA, PAN"
  },
  {
    id: "maitri-infra",
    name: "Maitri Infrastructure Pvt Ltd",
    type: "Issuer",
    cin: "U45203GJ2010PTC061429",
    gstin: "24AAHCM9014C1ZP",
    sector: "Infrastructure",
    exposure: "₹28.5 Cr",
    rating: "BBB / Watch",
    risk: "high" as const,
    verified: "GST, MCA"
  },
  {
    id: "aashray-housing",
    name: "Aashray Housing Finance Ltd",
    type: "Issuer",
    cin: "U65922DL2015PLC284001",
    gstin: "07AAQCA1128A1ZM",
    sector: "Housing finance",
    exposure: "₹24.8 Cr",
    rating: "A- / Stable",
    risk: "medium" as const,
    verified: "GST, MCA, PAN, Udyam"
  },
  {
    id: "navjeevan-textiles",
    name: "Navjeevan Textiles Limited",
    type: "Issuer",
    cin: "L17120GJ1998PLC034442",
    gstin: "24AAACN8172F1ZR",
    sector: "Textiles",
    exposure: "₹21.2 Cr",
    rating: "BBB+ / Stable",
    risk: "medium" as const,
    verified: "GST, MCA, PAN"
  },
  {
    id: "pragati-logistics",
    name: "Pragati Logistics Pvt Ltd",
    type: "Guarantor",
    cin: "U63030MH2014PTC255901",
    gstin: "27AAICP7418H1Z2",
    sector: "Logistics",
    exposure: "₹18.6 Cr",
    rating: "A / Stable",
    risk: "low" as const,
    verified: "GST, MCA"
  },
  {
    id: "vistar-energy",
    name: "Vistar Renewable Energy Ltd",
    type: "Issuer",
    cin: "U40106KA2016PLC098214",
    gstin: "29AAFCV4821P1ZQ",
    sector: "Renewable energy",
    exposure: "₹16.4 Cr",
    rating: "A- / Stable",
    risk: "low" as const,
    verified: "GST, MCA, PAN"
  }
];

export const relationshipLinks = [
  {
    source: "Suryodaya Finance Limited",
    target: "Suryodaya Capital Services",
    type: "Common director",
    confidence: "High",
    exposure: "₹9.4 Cr"
  },
  {
    source: "Suryodaya Finance Limited",
    target: "Maitri Infrastructure Pvt Ltd",
    type: "Shared promoter address",
    confidence: "Medium",
    exposure: "₹28.5 Cr"
  },
  {
    source: "Maitri Infrastructure Pvt Ltd",
    target: "Maitri Projects LLP",
    type: "Parent / subsidiary",
    confidence: "High",
    exposure: "₹7.2 Cr"
  },
  {
    source: "Suryodaya Capital Services",
    target: "Pragati Logistics Pvt Ltd",
    type: "Common director",
    confidence: "High",
    exposure: "₹18.6 Cr"
  }
] as const;
