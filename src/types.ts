export type ModuleType = 'sales' | 'rfm' | 'risk' | 'eda';

export interface User {
  email: string;
}

export interface ColumnMapping {
  // Sales Module Mappings
  salesTxId?: string;
  salesDate?: string;
  salesRevenue?: string;
  salesCategory?: string;

  // RFM Module Mappings
  rfmCustomerId?: string;
  rfmDate?: string;
  rfmAmount?: string;

  // Risk Module Mappings
  riskTxId?: string;
  riskAmount?: string;
  riskStatus?: string;
  riskAccountAge?: string;

  // EDA Mappings (Optional selections)
  edaTarget?: string;
}

export interface SalesResult {
  kpis: {
    totalRevenue: number;
    averageOrderValue: number;
    totalOrders: number;
    monthlyRunRate: number;
  };
  charts: {
    revenueTrend: { date: string; revenue: number; orders: number }[];
    categoryDistribution: { name: string; value: number }[];
  };
  tableData: any[]; // Processed sales report
  recommendations: string[];
}

export interface RFMResult {
  kpis: {
    totalCustomers: number;
    avgMonetaryValue: number;
    championsCount: number;
    atRiskCount: number;
  };
  charts: {
    segmentDistribution: { segment: string; count: number; percentage: number }[];
    rfmScatter: { id: string; recency: number; frequency: number; monetary: number; segment: string }[];
  };
  tableData: {
    customerId: string;
    recency: number;
    frequency: number;
    monetary: number;
    recencyScore: number;
    frequencyScore: number;
    monetaryScore: number;
    rfmScore: string;
    segment: string;
  }[];
  recommendations: string[];
}

export interface RiskResult {
  kpis: {
    totalTransactions: number;
    highRiskCount: number;
    fraudRate: number; // percentage
    averageRiskScore: number;
  };
  charts: {
    riskDistribution: { level: string; count: number }[];
    statusBreakdown: { status: string; count: number; riskAvg: number }[];
  };
  tableData: {
    txId: string;
    amount: number;
    status: string;
    accountAgeDays: number;
    riskScore: number;
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    flagReason: string;
  }[];
  recommendations: string[];
}

export interface EDAResult {
  kpis: {
    rowCount: number;
    columnCount: number;
    numericCount: number;
    categoricalCount: number;
  };
  columnSummaries: {
    columnName: string;
    type: 'numeric' | 'categorical' | 'other';
    missingCount: number;
    missingPct: number;
    // numeric stats
    min?: number;
    max?: number;
    mean?: number;
    median?: number;
    // categorical stats
    uniqueCount?: number;
    topValues?: { value: string; count: number }[];
  }[];
  charts: {
    nullValues: { columnName: string; missingPct: number }[];
    correlationMatrix?: { x: string; y: string; correlation: number }[];
  };
  tableData: any[];
  recommendations: string[];
}

export type AnalysisResult = SalesResult | RFMResult | RiskResult | EDAResult;

export interface ShopifyOrder {
  customerName: string;
  email: string;
  lastOrderDate: string;
  totalSpent: number;
  daysInactive: number;
  isAtRisk: boolean;
  productName?: string;
  productImageUrl?: string;
  returnCount?: number;
  abandonedCartValue?: number;
  supportTicketTopic?: string;
}

export interface GeneratedEmail {
  customerName: string;
  email: string;
  subject: string;
  body: string;
  status: 'draft' | 'sending' | 'sent' | 'failed';
  productName?: string;
  productImageUrl?: string;
  identifiedProblem?: string;
  htmlBody?: string;
}
