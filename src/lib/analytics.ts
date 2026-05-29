import type { ColumnMapping, SalesResult, RFMResult, RiskResult, EDAResult } from '../types';

// Helper to clean and parse number values
const cleanNumber = (val: any): number => {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[\$,]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

// Helper to parse date strings
const parseDate = (val: any): Date => {
  if (!val) return new Date();
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
};

// Sort array helper
const quantile = (arr: number[], q: number): number => {
  const sorted = [...arr].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
};

/**
 * SALES ANALYTICS
 */
export function runSalesAnalysis(data: any[], mapping: ColumnMapping): SalesResult {
  const dateKey = mapping.salesDate || '';
  const revenueKey = mapping.salesRevenue || '';
  const categoryKey = mapping.salesCategory || '';

  let totalRevenue = 0;
  let totalOrders = data.length;
  const categories: Record<string, number> = {};
  const dailyRev: Record<string, { revenue: number; orders: number }> = {};
  const uniqueMonths = new Set<string>();

  data.forEach((row) => {
    const rev = cleanNumber(row[revenueKey]);
    totalRevenue += rev;

    const dateStr = row[dateKey] ? String(row[dateKey]).substring(0, 10) : 'Unknown Date';
    if (!dailyRev[dateStr]) {
      dailyRev[dateStr] = { revenue: 0, orders: 0 };
    }
    dailyRev[dateStr].revenue += rev;
    dailyRev[dateStr].orders += 1;

    if (row[dateKey]) {
      const month = String(row[dateKey]).substring(0, 7); // YYYY-MM
      uniqueMonths.add(month);
    }

    const cat = row[categoryKey] ? String(row[categoryKey]) : 'Uncategorized';
    categories[cat] = (categories[cat] || 0) + rev;
  });

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const monthCount = uniqueMonths.size || 1;
  const monthlyRunRate = totalRevenue / monthCount;

  // Format revenue trend chart
  const revenueTrend = Object.keys(dailyRev)
    .sort()
    .map((date) => ({
      date,
      revenue: parseFloat(dailyRev[date].revenue.toFixed(2)),
      orders: dailyRev[date].orders,
    }));

  // Format category distribution chart
  const categoryDistribution = Object.keys(categories).map((name) => ({
    name,
    value: parseFloat(categories[name].toFixed(2)),
  }));

  // Generate strategy insights
  const recommendations: string[] = [
    `Optimize pricing & average basket size: The current Average Order Value (AOV) is $${averageOrderValue.toFixed(2)}. Suggest deploying bundling recommendations at checkout to cross-sell lower-performing segments.`,
    `Stabilize Monthly Performance: Your estimated monthly run-rate stands at $${monthlyRunRate.toFixed(2)}. Design monthly subscription tiers to convert transactional clients into recurring revenue lines.`,
  ];

  if (categoryDistribution.length > 0) {
    const sortedCats = [...categoryDistribution].sort((a, b) => b.value - a.value);
    const topCat = sortedCats[0];
    recommendations.push(
      `Leverage high-demand lines: "${topCat.name}" is your leading category contributing $${topCat.value.toFixed(2)} (${((topCat.value / (totalRevenue || 1)) * 100).toFixed(1)}% of sales). Restructure search marketing and inventory focus to double-down on this stream.`
    );
    if (sortedCats.length > 1) {
      const bottomCat = sortedCats[sortedCats.length - 1];
      recommendations.push(
        `Revitalize slow-moving lines: "${bottomCat.name}" represents the lowest sales volume. Plan a flash promotion or coupon discount strategy to clear stagnant shelf inventory.`
      );
    }
  }

  recommendations.push("Implement geographical expansion: Prioritize targeted digital ad spends in regions showing high order frequency spike ratios.");

  return {
    kpis: {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      totalOrders,
      monthlyRunRate: parseFloat(monthlyRunRate.toFixed(2)),
    },
    charts: {
      revenueTrend,
      categoryDistribution,
    },
    tableData: data.map((row) => ({
      orderId: row[mapping.salesTxId || 'Order ID'] || row['Order ID'] || 'N/A',
      date: row[dateKey] || 'N/A',
      revenue: cleanNumber(row[revenueKey]),
      category: row[categoryKey] || 'N/A',
      quantity: cleanNumber(row['Quantity'] || row['quantity'] || 1),
    })),
    recommendations,
  };
}

/**
 * RFM CUSTOMER ANALYTICS
 */
export function runRFMAnalysis(data: any[], mapping: ColumnMapping): RFMResult {
  const custKey = mapping.rfmCustomerId || '';
  const dateKey = mapping.rfmDate || '';
  const amountKey = mapping.rfmAmount || '';

  // 1. Aggregate transactions by Customer ID
  const customerMap: Record<string, { lastDate: Date; txCount: number; totalAmount: number }> = {};
  let globalMaxDate = new Date("1970-01-01");

  data.forEach((row) => {
    const custId = String(row[custKey] || 'Unknown-Customer').trim();
    const dateObj = parseDate(row[dateKey]);
    const amount = cleanNumber(row[amountKey]);

    if (dateObj > globalMaxDate) {
      globalMaxDate = dateObj;
    }

    if (!customerMap[custId]) {
      customerMap[custId] = {
        lastDate: dateObj,
        txCount: 0,
        totalAmount: 0,
      };
    }

    customerMap[custId].txCount += 1;
    customerMap[custId].totalAmount += amount;
    if (dateObj > customerMap[custId].lastDate) {
      customerMap[custId].lastDate = dateObj;
    }
  });

  // Reference date: 1 day after the latest transaction in dataset
  const referenceDate = new Date(globalMaxDate);
  referenceDate.setDate(referenceDate.getDate() + 1);

  // 2. Map metrics
  const profiles = Object.keys(customerMap).map((customerId) => {
    const prof = customerMap[customerId];
    const diffTime = Math.abs(referenceDate.getTime() - prof.lastDate.getTime());
    const recencyDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      customerId,
      recency: recencyDays,
      frequency: prof.txCount,
      monetary: parseFloat(prof.totalAmount.toFixed(2)),
    };
  });

  const recencies = profiles.map(p => p.recency);
  const frequencies = profiles.map(p => p.frequency);
  const monetaries = profiles.map(p => p.monetary);

  // Helper score thresholds based on quintiles
  const getScore = (val: number, arr: number[], inverse = false) => {
    const q20 = quantile(arr, 0.2);
    const q40 = quantile(arr, 0.4);
    const q60 = quantile(arr, 0.6);
    const q80 = quantile(arr, 0.8);

    if (inverse) {
      // Lower is better (Recency: fewer days ago is better)
      if (val <= q20) return 5;
      if (val <= q40) return 4;
      if (val <= q60) return 3;
      if (val <= q80) return 2;
      return 1;
    } else {
      // Higher is better (Frequency, Monetary)
      if (val <= q20) return 1;
      if (val <= q40) return 2;
      if (val <= q60) return 3;
      if (val <= q80) return 4;
      return 5;
    }
  };

  const scoredProfiles = profiles.map((p) => {
    const rScore = getScore(p.recency, recencies, true);
    const fScore = getScore(p.frequency, frequencies, false);
    const mScore = getScore(p.monetary, monetaries, false);

    // Segment determination
    let segment = 'Needs Attention';
    const r = rScore;
    const f = fScore;
    const m = mScore;

    if (r >= 4 && f >= 4 && m >= 4) {
      segment = 'Champions';
    } else if (r >= 3 && f >= 3 && m >= 3) {
      segment = 'Loyal Customers';
    } else if (r >= 4 && f <= 2) {
      segment = 'Promising New';
    } else if (r <= 2 && f >= 3) {
      segment = 'At Risk';
    } else if (r <= 2 && f <= 2) {
      segment = 'Hibernating';
    } else if (r >= 3 && f <= 3) {
      segment = 'Potential Loyalist';
    } else {
      segment = 'About to Sleep';
    }

    return {
      ...p,
      recencyScore: rScore,
      frequencyScore: fScore,
      monetaryScore: mScore,
      rfmScore: `${rScore}${fScore}${mScore}`,
      segment,
    };
  });

  // Calculate KPIs
  const totalCustomers = scoredProfiles.length;
  const avgMonetaryValue = totalCustomers > 0 ? scoredProfiles.reduce((sum, p) => sum + p.monetary, 0) / totalCustomers : 0;
  const championsCount = scoredProfiles.filter(p => p.segment === 'Champions').length;
  const atRiskCount = scoredProfiles.filter(p => p.segment === 'At Risk').length;

  // Segment distributions
  const segmentsMap: Record<string, number> = {};
  scoredProfiles.forEach((p) => {
    segmentsMap[p.segment] = (segmentsMap[p.segment] || 0) + 1;
  });

  const segmentDistribution = Object.keys(segmentsMap).map((segment) => ({
    segment,
    count: segmentsMap[segment],
    percentage: parseFloat(((segmentsMap[segment] / totalCustomers) * 100).toFixed(1)),
  }));

  // Scatter chart data limit to 100 customers for charting clarity
  const rfmScatter = scoredProfiles.slice(0, 100).map((p) => ({
    id: p.customerId,
    recency: p.recency,
    frequency: p.frequency,
    monetary: p.monetary,
    segment: p.segment,
  }));

  // Recommendations
  const hibernatingCount = scoredProfiles.filter(p => p.segment === 'Hibernating').length;
  const potentialCount = scoredProfiles.filter(p => p.segment === 'Potential Loyalist' || p.segment === 'Promising New').length;

  const recommendations: string[] = [
    `Nurture the core: You have ${championsCount} high-value 'Champions' representing ${((championsCount / (totalCustomers || 1)) * 100).toFixed(1)}% of your base. Keep them engaged using VIP access, sneak-peeks, and personalized customer care.`,
    `Launch Win-Back Campaigns: There are ${atRiskCount} 'At Risk' customers. Execute high-value promotional outreach immediately (e.g., offering a 20% discount on their favorite categories) to prevent attrition.`,
  ];

  if (hibernatingCount > 0) {
    recommendations.push(
      `Reactivate Sleepers: ${hibernatingCount} customers are classified as 'Hibernating' (low recency, frequency, and spend). Run automated, low-cost reactivation email flows; if they fail to engage, purge from active marketing budgets.`
    );
  }

  if (potentialCount > 0) {
    recommendations.push(
      `Upsell Potential Loyalists: There are ${potentialCount} customer profiles classified under rising categories (Potential Loyalist / Promising New). Target them with tier-based reward programs to increase purchase frequency.`
    );
  }

  recommendations.push("Establish customer feedback loop: Survey recently acquired users (Promising New) to identify friction in the checkout experience.");

  return {
    kpis: {
      totalCustomers,
      avgMonetaryValue: parseFloat(avgMonetaryValue.toFixed(2)),
      championsCount,
      atRiskCount,
    },
    charts: {
      segmentDistribution,
      rfmScatter,
    },
    tableData: scoredProfiles,
    recommendations,
  };
}

/**
 * PAYMENT RISK ANALYTICS
 */
export function runRiskAnalysis(data: any[], mapping: ColumnMapping): RiskResult {
  const txKey = mapping.riskTxId || '';
  const amountKey = mapping.riskAmount || '';
  const statusKey = mapping.riskStatus || '';
  const ageKey = mapping.riskAccountAge || '';

  const processedData = data.map((row, idx) => {
    const txId = row[txKey] ? String(row[txKey]) : `TX-${1000 + idx}`;
    const amount = cleanNumber(row[amountKey]);
    const status = row[statusKey] ? String(row[statusKey]).trim() : 'Success';
    const age = row[ageKey] !== undefined ? cleanNumber(row[ageKey]) : 90; // Default to 90 days

    // Risk scoring logic (0-100)
    let score = 10; // Base score
    const reasons: string[] = [];

    // Rule 1: High Transaction Amount
    if (amount > 5000) {
      score += 45;
      reasons.push("Extremely High Purchase Value (>$5000)");
    } else if (amount > 1000) {
      score += 25;
      reasons.push("Elevated Purchase Value (>$1000)");
    }

    // Rule 2: Account Age (New accounts are suspicious)
    if (age <= 1) {
      score += 35;
      reasons.push("Zero-Day Account Tenure");
    } else if (age < 7) {
      score += 20;
      reasons.push("New Account (<7 days)");
    } else if (age < 30) {
      score += 10;
      reasons.push("Recent Account (<30 days)");
    }

    // Rule 3: Payment status indicators
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === 'failed') {
      score += 20;
      reasons.push("Prior Processor Declines");
    } else if (normalizedStatus === 'chargeback') {
      score += 55;
      reasons.push("Active Customer Chargeback Dispute");
    }

    // Rule 4: Add Country flag factor (if present in dataset)
    const country = row['Country_Code'] || row['country'] || row['Country'];
    const highRiskCountries = ['UA', 'NG', 'RO', 'RU', 'KY'];
    if (country && highRiskCountries.includes(String(country).toUpperCase())) {
      score += 15;
      reasons.push(`High-Risk Billing Country (${country})`);
    }

    // Cap at 100
    score = Math.min(score, 100);

    let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
    if (score > 80) riskLevel = 'Critical';
    else if (score > 60) riskLevel = 'High';
    else if (score > 30) riskLevel = 'Medium';

    return {
      txId,
      amount,
      status,
      accountAgeDays: age,
      riskScore: score,
      riskLevel,
      flagReason: reasons.length > 0 ? reasons.join(" | ") : "Nominal indicators",
    };
  });

  const totalTransactions = processedData.length;
  const highRiskCount = processedData.filter(d => d.riskLevel === 'High' || d.riskLevel === 'Critical').length;
  const fraudRate = totalTransactions > 0 
    ? (processedData.filter(d => ['failed', 'chargeback'].includes(d.status.toLowerCase())).length / totalTransactions) * 100
    : 0;
  const averageRiskScore = totalTransactions > 0
    ? processedData.reduce((sum, d) => sum + d.riskScore, 0) / totalTransactions
    : 0;

  // Chart: count per level
  const riskLevels = ['Low', 'Medium', 'High', 'Critical'];
  const levelCounts = riskLevels.map((lvl) => ({
    level: lvl,
    count: processedData.filter(d => d.riskLevel === lvl).length,
  }));

  // Status breakdown
  const statusGroup: Record<string, { count: number; sumScore: number }> = {};
  processedData.forEach((d) => {
    if (!statusGroup[d.status]) {
      statusGroup[d.status] = { count: 0, sumScore: 0 };
    }
    statusGroup[d.status].count += 1;
    statusGroup[d.status].sumScore += d.riskScore;
  });

  const statusBreakdown = Object.keys(statusGroup).map((status) => ({
    status,
    count: statusGroup[status].count,
    riskAvg: parseFloat((statusGroup[status].sumScore / statusGroup[status].count).toFixed(1)),
  }));

  // Recommendations
  const recommendations: string[] = [
    `Install 3D-Secure rules: Average risk score is ${averageRiskScore.toFixed(1)}/100. Enforce mandatory 3D-Secure verification on any account returning a Medium/High risk index.`,
    `Flag New Account Volatility: High purchase velocities within the first 7 days contribute heavily to your risk. Suggest setting a temporary $500 hard daily transaction cap for profiles under 7 days old.`,
  ];

  if (highRiskCount > 0) {
    recommendations.push(
      `Escalate Manual Audits: Found ${highRiskCount} transactions flagged as 'High' or 'Critical' risk. Route these immediately to compliance teams for KYC/document verification prior to shipment release.`
    );
  }

  if (fraudRate > 5) {
    recommendations.push(
      `Vulnerability Detected: Your current transaction decline/chargeback rate is ${fraudRate.toFixed(1)}%, which exceeds industry thresholds. Tighten billing-address matching (AVS) rules on checkout forms.`
    );
  } else {
    recommendations.push(
      "Maintain baseline rules: Chargeback/decline rate is healthy. Maintain current automated merchant rules and conduct monthly routine re-evaluations."
    );
  }

  return {
    kpis: {
      totalTransactions,
      highRiskCount,
      fraudRate: parseFloat(fraudRate.toFixed(2)),
      averageRiskScore: parseFloat(averageRiskScore.toFixed(1)),
    },
    charts: {
      riskDistribution: levelCounts,
      statusBreakdown,
    },
    tableData: processedData,
    recommendations,
  };
}

/**
 * GENERIC AUTO-EDA
 */
export function runEDAAnalysis(data: any[], mapping: ColumnMapping): EDAResult {
  const targetCol = mapping.edaTarget || '';
  const rowCount = data.length;
  const headers = data.length > 0 ? Object.keys(data[0]) : [];
  const columnCount = headers.length;

  let numericCount = 0;
  let categoricalCount = 0;

  // Analyze each column
  const columnSummaries = headers.map((colName) => {
    // Collect non-empty values
    const vals = data
      .map(row => row[colName])
      .filter(v => v !== undefined && v !== null && String(v).trim() !== '');
    
    const missingCount = rowCount - vals.length;
    const missingPct = rowCount > 0 ? (missingCount / rowCount) * 100 : 0;

    // Check if column is numeric
    const isNumeric = vals.every((v) => {
      if (typeof v === 'number') return true;
      const parsed = parseFloat(String(v).replace(/[\$,]/g, '').trim());
      return !isNaN(parsed);
    }) && vals.length > 0;

    if (isNumeric) {
      numericCount++;
      const numVals = vals.map(v => typeof v === 'number' ? v : parseFloat(String(v).replace(/[\$,]/g, '').trim()));
      const min = Math.min(...numVals);
      const max = Math.max(...numVals);
      const sum = numVals.reduce((a, b) => a + b, 0);
      const mean = sum / numVals.length;

      // Median
      const sorted = [...numVals].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

      return {
        columnName: colName,
        type: 'numeric' as const,
        missingCount,
        missingPct: parseFloat(missingPct.toFixed(1)),
        min: parseFloat(min.toFixed(2)),
        max: parseFloat(max.toFixed(2)),
        mean: parseFloat(mean.toFixed(2)),
        median: parseFloat(median.toFixed(2)),
      };
    } else {
      categoricalCount++;
      const valCounts: Record<string, number> = {};
      vals.forEach((v) => {
        const strVal = String(v).trim();
        valCounts[strVal] = (valCounts[strVal] || 0) + 1;
      });

      const uniqueCount = Object.keys(valCounts).length;
      const sortedVals = Object.keys(valCounts)
        .map(v => ({ value: v, count: valCounts[v] }))
        .sort((a, b) => b.count - a.count);

      return {
        columnName: colName,
        type: 'categorical' as const,
        missingCount,
        missingPct: parseFloat(missingPct.toFixed(1)),
        uniqueCount,
        topValues: sortedVals.slice(0, 5),
      };
    }
  });

  // Chart data: null values percentages
  const nullValues = columnSummaries.map((c) => ({
    columnName: c.columnName,
    missingPct: c.missingPct,
  }));

  // Recommendations
  const recommendations: string[] = [
    `Data Dimensions Analyzed: Discovered ${columnCount} total dimensions (${numericCount} quantitative, ${categoricalCount} qualitative) across ${rowCount} sample points.`,
  ];

  const columnsWithNulls = columnSummaries.filter(c => c.missingPct > 10);
  if (columnsWithNulls.length > 0) {
    const list = columnsWithNulls.map(c => `"${c.columnName}" (${c.missingPct.toFixed(0)}% missing)`).join(", ");
    recommendations.push(
      `Clean Missing Values: The columns ${list} have over 10% missing fields. Recommend applying mean/median imputation or removing sparse attributes before modeling.`
    );
  } else {
    recommendations.push(
      "High Data Quality: Missing values across all columns are under 10%. The file is structurally complete and ready for deep business intelligence integration."
    );
  }

  // Check unique counts for categories
  const highCardinality = columnSummaries.filter(
    c => c.type === 'categorical' && (c.uniqueCount || 0) > rowCount * 0.5
  );
  if (highCardinality.length > 0) {
    const list = highCardinality.map(c => `"${c.columnName}"`).join(", ");
    recommendations.push(
      `Review High Cardinality fields: Columns like ${list} contain highly unique keys (e.g., ID tokens). Consider converting them to unique identifiers or applying hashes prior to grouping.`
    );
  }

  if (targetCol) {
    recommendations.push(
      `Target Feature Defined: "${targetCol}" is set as the analysis variable. Running a distribution correlation across numeric indicators is recommended to identify predictive weights.`
    );
  } else {
    recommendations.push(
      "Map target variable: No key target classification has been selected. Setting a target variable in Column Mappings enables automated regression analytics recommendations."
    );
  }

  return {
    kpis: {
      rowCount,
      columnCount,
      numericCount,
      categoricalCount,
    },
    columnSummaries,
    charts: {
      nullValues,
    },
    tableData: data.slice(0, 100), // Preview records
    recommendations,
  };
}
