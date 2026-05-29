export interface MockDataset {
  name: string;
  headers: string[];
  data: any[];
}

export const mockSalesDataset: MockDataset = {
  name: "Sales_Q1_Report.csv",
  headers: ["Order ID", "Order Date", "Revenue ($)", "Category", "Quantity", "Region"],
  data: [
    { "Order ID": "TX-1001", "Order Date": "2026-01-05", "Revenue ($)": 1250.00, "Category": "Electronics", "Quantity": 2, "Region": "North America" },
    { "Order ID": "TX-1002", "Order Date": "2026-01-08", "Revenue ($)": 85.50, "Category": "Office Supplies", "Quantity": 5, "Region": "Europe" },
    { "Order ID": "TX-1003", "Order Date": "2026-01-12", "Revenue ($)": 450.00, "Category": "Furniture", "Quantity": 1, "Region": "North America" },
    { "Order ID": "TX-1004", "Order Date": "2026-01-18", "Revenue ($)": 2100.00, "Category": "Electronics", "Quantity": 3, "Region": "Asia Pacific" },
    { "Order ID": "TX-1005", "Order Date": "2026-01-22", "Revenue ($)": 35.00, "Category": "Office Supplies", "Quantity": 10, "Region": "North America" },
    { "Order ID": "TX-1006", "Order Date": "2026-02-02", "Revenue ($)": 150.00, "Category": "Office Supplies", "Quantity": 3, "Region": "Europe" },
    { "Order ID": "TX-1007", "Order Date": "2026-02-05", "Revenue ($)": 980.00, "Category": "Furniture", "Quantity": 2, "Region": "Asia Pacific" },
    { "Order ID": "TX-1008", "Order Date": "2026-02-11", "Revenue ($)": 3200.00, "Category": "Electronics", "Quantity": 5, "Region": "North America" },
    { "Order ID": "TX-1009", "Order Date": "2026-02-15", "Revenue ($)": 120.00, "Category": "Office Supplies", "Quantity": 4, "Region": "Europe" },
    { "Order ID": "TX-1010", "Order Date": "2026-02-20", "Revenue ($)": 650.00, "Category": "Furniture", "Quantity": 1, "Region": "Asia Pacific" },
    { "Order ID": "TX-1011", "Order Date": "2026-02-28", "Revenue ($)": 1800.00, "Category": "Electronics", "Quantity": 2, "Region": "Europe" },
    { "Order ID": "TX-1012", "Order Date": "2026-03-04", "Revenue ($)": 95.00, "Category": "Office Supplies", "Quantity": 6, "Region": "North America" },
    { "Order ID": "TX-1013", "Order Date": "2026-03-10", "Revenue ($)": 1150.00, "Category": "Furniture", "Quantity": 3, "Region": "North America" },
    { "Order ID": "TX-1014", "Order Date": "2026-03-15", "Revenue ($)": 4100.00, "Category": "Electronics", "Quantity": 6, "Region": "Asia Pacific" },
    { "Order ID": "TX-1015", "Order Date": "2026-03-18", "Revenue ($)": 280.00, "Category": "Office Supplies", "Quantity": 12, "Region": "Europe" },
    { "Order ID": "TX-1016", "Order Date": "2026-03-22", "Revenue ($)": 1350.00, "Category": "Electronics", "Quantity": 2, "Region": "North America" },
    { "Order ID": "TX-1017", "Order Date": "2026-03-25", "Revenue ($)": 75.00, "Category": "Office Supplies", "Quantity": 2, "Region": "Asia Pacific" },
    { "Order ID": "TX-1018", "Order Date": "2026-03-27", "Revenue ($)": 920.00, "Category": "Furniture", "Quantity": 2, "Region": "Europe" },
    { "Order ID": "TX-1019", "Order Date": "2026-03-29", "Revenue ($)": 50.00, "Category": "Office Supplies", "Quantity": 5, "Region": "North America" },
    { "Order ID": "TX-1020", "Order Date": "2026-03-30", "Revenue ($)": 2400.00, "Category": "Electronics", "Quantity": 3, "Region": "North America" }
  ]
};

export const mockRFMDataset: MockDataset = {
  name: "Customer_Transactions.csv",
  headers: ["Cust_ID", "Tx_Date", "Tx_Amount", "Channel"],
  data: [
    { "Cust_ID": "C-101", "Tx_Date": "2026-05-25", "Tx_Amount": 250.00, "Channel": "Web" },
    { "Cust_ID": "C-101", "Tx_Date": "2026-05-10", "Tx_Amount": 120.00, "Channel": "Mobile" },
    { "Cust_ID": "C-101", "Tx_Date": "2026-04-15", "Tx_Amount": 300.00, "Channel": "Web" },
    { "Cust_ID": "C-102", "Tx_Date": "2026-05-28", "Tx_Amount": 850.00, "Channel": "Web" },
    { "Cust_ID": "C-102", "Tx_Date": "2026-05-20", "Tx_Amount": 600.00, "Channel": "Web" },
    { "Cust_ID": "C-103", "Tx_Date": "2026-01-10", "Tx_Amount": 45.00, "Channel": "Mobile" },
    { "Cust_ID": "C-104", "Tx_Date": "2026-05-22", "Tx_Amount": 15.00, "Channel": "Web" },
    { "Cust_ID": "C-104", "Tx_Date": "2026-05-18", "Tx_Amount": 22.00, "Channel": "Mobile" },
    { "Cust_ID": "C-104", "Tx_Date": "2026-05-10", "Tx_Amount": 18.00, "Channel": "Mobile" },
    { "Cust_ID": "C-104", "Tx_Date": "2026-04-30", "Tx_Amount": 30.00, "Channel": "Web" },
    { "Cust_ID": "C-105", "Tx_Date": "2026-03-12", "Tx_Amount": 1200.00, "Channel": "Web" },
    { "Cust_ID": "C-105", "Tx_Date": "2026-02-05", "Tx_Amount": 950.00, "Channel": "Web" },
    { "Cust_ID": "C-106", "Tx_Date": "2026-05-01", "Tx_Amount": 85.00, "Channel": "Mobile" },
    { "Cust_ID": "C-107", "Tx_Date": "2026-05-27", "Tx_Amount": 410.00, "Channel": "Web" },
    { "Cust_ID": "C-107", "Tx_Date": "2026-05-15", "Tx_Amount": 390.00, "Channel": "Mobile" },
    { "Cust_ID": "C-107", "Tx_Date": "2026-05-02", "Tx_Amount": 500.00, "Channel": "Web" },
    { "Cust_ID": "C-107", "Tx_Date": "2026-04-10", "Tx_Amount": 450.00, "Channel": "Web" },
    { "Cust_ID": "C-108", "Tx_Date": "2025-12-25", "Tx_Amount": 150.00, "Channel": "Retail" },
    { "Cust_ID": "C-109", "Tx_Date": "2026-04-20", "Tx_Amount": 95.00, "Channel": "Mobile" },
    { "Cust_ID": "C-110", "Tx_Date": "2026-05-26", "Tx_Amount": 75.00, "Channel": "Web" },
    { "Cust_ID": "C-110", "Tx_Date": "2026-05-05", "Tx_Amount": 80.00, "Channel": "Web" },
    { "Cust_ID": "C-111", "Tx_Date": "2026-02-18", "Tx_Amount": 320.00, "Channel": "Retail" },
    { "Cust_ID": "C-112", "Tx_Date": "2026-05-19", "Tx_Amount": 1500.00, "Channel": "Web" },
    { "Cust_ID": "C-112", "Tx_Date": "2026-04-25", "Tx_Amount": 2200.00, "Channel": "Web" },
    { "Cust_ID": "C-112", "Tx_Date": "2026-03-30", "Tx_Amount": 1800.00, "Channel": "Web" },
    { "Cust_ID": "C-113", "Tx_Date": "2026-01-15", "Tx_Amount": 60.00, "Channel": "Retail" },
    { "Cust_ID": "C-114", "Tx_Date": "2026-05-12", "Tx_Amount": 190.00, "Channel": "Mobile" },
    { "Cust_ID": "C-115", "Tx_Date": "2026-05-27", "Tx_Amount": 90.00, "Channel": "Web" },
    { "Cust_ID": "C-116", "Tx_Date": "2026-05-28", "Tx_Amount": 110.00, "Channel": "Mobile" },
    { "Cust_ID": "C-117", "Tx_Date": "2026-03-01", "Tx_Amount": 450.00, "Channel": "Retail" }
  ]
};

export const mockRiskDataset: MockDataset = {
  name: "Merchant_Transactions_Risk.csv",
  headers: ["Transaction_ID", "Purchase_Amt", "Account_Age_Days", "Card_Type", "Payment_Status", "Country_Code"],
  data: [
    { "Transaction_ID": "TX-1001", "Purchase_Amt": 4500.00, "Account_Age_Days": 2, "Card_Type": "Visa", "Payment_Status": "Failed", "Country_Code": "UA" },
    { "Transaction_ID": "TX-1002", "Purchase_Amt": 125.00, "Account_Age_Days": 450, "Card_Type": "Mastercard", "Payment_Status": "Success", "Country_Code": "US" },
    { "Transaction_ID": "TX-1003", "Purchase_Amt": 890.00, "Account_Age_Days": 12, "Card_Type": "Amex", "Payment_Status": "Success", "Country_Code": "US" },
    { "Transaction_ID": "TX-1004", "Purchase_Amt": 3200.00, "Account_Age_Days": 1, "Card_Type": "Visa", "Payment_Status": "Success", "Country_Code": "NG" },
    { "Transaction_ID": "TX-1005", "Purchase_Amt": 45.00, "Account_Age_Days": 730, "Card_Type": "Visa", "Payment_Status": "Success", "Country_Code": "CA" },
    { "Transaction_ID": "TX-1006", "Purchase_Amt": 1200.00, "Account_Age_Days": 5, "Card_Type": "Visa", "Payment_Status": "Chargeback", "Country_Code": "GB" },
    { "Transaction_ID": "TX-1007", "Purchase_Amt": 250.00, "Account_Age_Days": 120, "Card_Type": "Mastercard", "Payment_Status": "Success", "Country_Code": "US" },
    { "Transaction_ID": "TX-1008", "Purchase_Amt": 6000.00, "Account_Age_Days": 60, "Card_Type": "Amex", "Payment_Status": "Success", "Country_Code": "DE" },
    { "Transaction_ID": "TX-1009", "Purchase_Amt": 15.00, "Account_Age_Days": 90, "Card_Type": "Visa", "Payment_Status": "Success", "Country_Code": "US" },
    { "Transaction_ID": "TX-1010", "Purchase_Amt": 2800.00, "Account_Age_Days": 3, "Card_Type": "Mastercard", "Payment_Status": "Failed", "Country_Code": "US" },
    { "Transaction_ID": "TX-1011", "Purchase_Amt": 150.00, "Account_Age_Days": 180, "Card_Type": "Visa", "Payment_Status": "Success", "Country_Code": "FR" },
    { "Transaction_ID": "TX-1012", "Purchase_Amt": 310.00, "Account_Age_Days": 240, "Card_Type": "Discover", "Payment_Status": "Success", "Country_Code": "US" },
    { "Transaction_ID": "TX-1013", "Purchase_Amt": 5200.00, "Account_Age_Days": 8, "Card_Type": "Visa", "Payment_Status": "Success", "Country_Code": "RO" },
    { "Transaction_ID": "TX-1014", "Purchase_Amt": 90.00, "Account_Age_Days": 365, "Card_Type": "Mastercard", "Payment_Status": "Success", "Country_Code": "CA" },
    { "Transaction_ID": "TX-1015", "Purchase_Amt": 7500.00, "Account_Age_Days": 15, "Card_Type": "Visa", "Payment_Status": "Chargeback", "Country_Code": "US" },
    { "Transaction_ID": "TX-1016", "Purchase_Amt": 180.00, "Account_Age_Days": 600, "Card_Type": "Amex", "Payment_Status": "Success", "Country_Code": "US" },
    { "Transaction_ID": "TX-1017", "Purchase_Amt": 12.00, "Account_Age_Days": 30, "Card_Type": "Visa", "Payment_Status": "Success", "Country_Code": "US" },
    { "Transaction_ID": "TX-1018", "Purchase_Amt": 950.00, "Account_Age_Days": 4, "Card_Type": "Mastercard", "Payment_Status": "Failed", "Country_Code": "BR" },
    { "Transaction_ID": "TX-1019", "Purchase_Amt": 2100.00, "Account_Age_Days": 75, "Card_Type": "Visa", "Payment_Status": "Success", "Country_Code": "AU" },
    { "Transaction_ID": "TX-1020", "Purchase_Amt": 35.00, "Account_Age_Days": 50, "Card_Type": "Mastercard", "Payment_Status": "Success", "Country_Code": "GB" },
    { "Transaction_ID": "TX-1021", "Purchase_Amt": 8500.00, "Account_Age_Days": 1, "Card_Type": "Visa", "Payment_Status": "Success", "Country_Code": "KY" },
    { "Transaction_ID": "TX-1022", "Purchase_Amt": 110.00, "Account_Age_Days": 150, "Card_Type": "Visa", "Payment_Status": "Success", "Country_Code": "US" },
    { "Transaction_ID": "TX-1023", "Purchase_Amt": 1400.00, "Account_Age_Days": 9, "Card_Type": "Amex", "Payment_Status": "Success", "Country_Code": "SG" },
    { "Transaction_ID": "TX-1024", "Purchase_Amt": 290.00, "Account_Age_Days": 420, "Card_Type": "Mastercard", "Payment_Status": "Success", "Country_Code": "US" },
    { "Transaction_ID": "TX-1025", "Purchase_Amt": 9800.00, "Account_Age_Days": 0, "Card_Type": "Visa", "Payment_Status": "Failed", "Country_Code": "RU" }
  ]
};
