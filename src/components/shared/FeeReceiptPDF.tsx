import React from "react";
import {
  Document, Page, Text, View, StyleSheet, Font,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import type { FeeRecord, FeeTransaction } from "@/types";
import type { Timestamp } from "firebase/firestore";

// Register a clean font
Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjQ.woff2", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hjQ.woff2", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuDyYAZ9hjQ.woff2", fontWeight: 700 },
  ],
});

const s = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    padding: 40,
    fontSize: 10,
    color: "#1a1a2e",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#6366f1",
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#6366f1",
  },
  subtitle: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 3,
  },
  receiptNo: {
    fontSize: 9,
    color: "#64748b",
    textAlign: "right" as const,
  },
  receiptDate: {
    fontSize: 11,
    fontWeight: 600,
    textAlign: "right" as const,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: "#334155",
    marginBottom: 8,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
  },
  label: { color: "#64748b", fontSize: 10 },
  value: { fontWeight: 600, fontSize: 10 },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 4,
  },
  tableHeaderText: {
    fontWeight: 600,
    fontSize: 9,
    color: "#475569",
    textTransform: "uppercase" as const,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
  },
  col1: { width: "15%" },
  col2: { width: "35%" },
  col3: { width: "25%" },
  col4: { width: "25%", textAlign: "right" as const },
  summaryBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  summaryTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1.5,
    borderTopColor: "#6366f1",
  },
  totalLabel: { fontSize: 12, fontWeight: 700 },
  totalValue: { fontSize: 12, fontWeight: 700, color: "#6366f1" },
  footer: {
    position: "absolute" as const,
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 0.5,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 8, color: "#94a3b8" },
});

interface FeeReceiptPDFProps {
  record: FeeRecord;
  generatedAt?: Date;
}

export const FeeReceiptPDF: React.FC<FeeReceiptPDFProps> = ({
  record,
  generatedAt = new Date(),
}) => {
  const remaining = record.totalAmount - record.paidAmount;
  const isPaid = remaining <= 0;
  const receiptId = `RC-${record.id?.slice(-8).toUpperCase() ?? "00000000"}`;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.title}>Campus Connect</Text>
            <Text style={s.subtitle}>Fee Payment Receipt</Text>
          </View>
          <View>
            <Text style={s.receiptNo}>Receipt: {receiptId}</Text>
            <Text style={s.receiptDate}>{format(generatedAt, "dd MMM yyyy, hh:mm a")}</Text>
          </View>
        </View>

        {/* Student Info */}
        <Text style={s.sectionTitle}>Student Information</Text>
        <View style={s.row}>
          <Text style={s.label}>Name</Text>
          <Text style={s.value}>{record.studentName}</Text>
        </View>
        <View style={s.row}>
          <Text style={s.label}>Roll Number</Text>
          <Text style={s.value}>{record.rollNo || "—"}</Text>
        </View>
        <View style={s.row}>
          <Text style={s.label}>Due Date</Text>
          <Text style={s.value}>{format((record.dueDate as Timestamp).toDate(), "dd MMM yyyy")}</Text>
        </View>
        <View style={s.row}>
          <Text style={s.label}>Status</Text>
          <Text style={[s.value, { color: isPaid ? "#16a34a" : "#dc2626" }]}>
            {isPaid ? "PAID IN FULL" : "PENDING"}
          </Text>
        </View>

        {/* Transaction History */}
        {record.transactions && record.transactions.length > 0 && (
          <View style={s.table}>
            <Text style={s.sectionTitle}>Payment History</Text>
            <View style={s.tableHeader}>
              <Text style={[s.tableHeaderText, s.col1]}>#</Text>
              <Text style={[s.tableHeaderText, s.col2]}>Transaction ID</Text>
              <Text style={[s.tableHeaderText, s.col3]}>Date</Text>
              <Text style={[s.tableHeaderText, s.col4]}>Amount</Text>
            </View>
            {record.transactions.map((tx: FeeTransaction, i: number) => (
              <View key={tx.txId || i} style={s.tableRow}>
                <Text style={[{ fontSize: 10 }, s.col1]}>{i + 1}</Text>
                <Text style={[{ fontSize: 9, fontFamily: "Courier" }, s.col2]}>
                  {tx.txId || "—"}
                </Text>
                <Text style={[{ fontSize: 10 }, s.col3]}>
                  {format((tx.date as Timestamp).toDate(), "dd MMM yyyy")}
                </Text>
                <Text style={[{ fontSize: 10, fontWeight: 600, color: "#16a34a" }, s.col4]}>
                  ₹{tx.amount.toLocaleString("en-IN")}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Summary */}
        <View style={s.summaryBox}>
          <Text style={[s.sectionTitle, { marginBottom: 10 }]}>Payment Summary</Text>
          <View style={s.summaryRow}>
            <Text style={s.label}>Total Fee Amount</Text>
            <Text style={s.value}>₹{record.totalAmount.toLocaleString("en-IN")}</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.label}>Total Paid</Text>
            <Text style={[s.value, { color: "#16a34a" }]}>₹{record.paidAmount.toLocaleString("en-IN")}</Text>
          </View>
          <View style={s.summaryTotal}>
            <Text style={s.totalLabel}>Balance Due</Text>
            <Text style={s.totalValue}>
              ₹{remaining > 0 ? remaining.toLocaleString("en-IN") : "0"}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            This is a computer-generated receipt and does not require a signature.
          </Text>
          <Text style={s.footerText}>Campus Connect © {new Date().getFullYear()}</Text>
        </View>
      </Page>
    </Document>
  );
};
