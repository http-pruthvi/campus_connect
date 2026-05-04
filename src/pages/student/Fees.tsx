import React, { useEffect, useState, useCallback } from "react";
import {
  collection, query, where, onSnapshot, orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  CreditCard, IndianRupee, Clock, CheckCircle2,
  AlertTriangle, Receipt, Download, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { pdf } from "@react-pdf/renderer";
import { FeeReceiptPDF } from "@/components/shared/FeeReceiptPDF";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import type { FeeRecord } from "@/types";
import type { Timestamp } from "firebase/firestore";

const FeesPage: React.FC = () => {
  const { profile, isAdmin, isHOD } = useAuth();
  const isStaff = isAdmin || isHOD;

  const [records, setRecords] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.uid) return;
    const col = collection(db, "fees");
    const q = isStaff
      ? query(col, orderBy("dueDate", "asc"))
      : query(col, where("studentId", "==", profile.uid));

    return onSnapshot(q, (snap) => {
      setRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FeeRecord)));
      setLoading(false);
    }, () => { setLoading(false); toast.error("Failed to load fee records."); });
  }, [profile?.uid, isStaff]);

  const totalDue = records.reduce((s, r) => s + (r.totalAmount - r.paidAmount), 0);
  const totalPaid = records.reduce((s, r) => s + r.paidAmount, 0);
  const overdueCount = records.filter((r) => {
    const due = (r.dueDate as Timestamp).toDate();
    return r.paidAmount < r.totalAmount && due < new Date();
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">
          {isStaff ? "Fee Management" : "My Fees"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isStaff ? "View and manage student fee records" : "Track your fee payments and dues"}
        </p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total Paid"
          value={`₹${totalPaid.toLocaleString("en-IN")}`}
          icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
          color="bg-green-500/10 border-green-500/20"
          delay={0}
        />
        <SummaryCard
          label="Remaining Due"
          value={`₹${totalDue.toLocaleString("en-IN")}`}
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          color="bg-amber-500/10 border-amber-500/20"
          delay={0.05}
        />
        <SummaryCard
          label="Overdue"
          value={String(overdueCount)}
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
          color="bg-red-500/10 border-red-500/20"
          delay={0.1}
        />
      </div>

      {/* Records */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl border bg-muted/40 animate-pulse" />)}
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="h-8 w-8" />}
          title="No fee records"
          description={isStaff ? "No fee records have been created yet." : "Your fee records will appear here once assigned."}
        />
      ) : (
        <div className="space-y-3">
          {records.map((rec, i) => (
            <FeeCard key={rec.id} record={rec} index={i} isStaff={isStaff} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Summary Card ─────────────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <SpotlightCard className={`p-5 h-full ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="rounded-lg bg-background/60 p-2.5 backdrop-blur-sm">{icon}</div>
      </div>
    </SpotlightCard>
  </motion.div>
);

// ─── Fee Card ─────────────────────────────────────────────────────────────────

interface FeeCardProps {
  record: FeeRecord;
  index: number;
  isStaff: boolean;
}

const FeeCard: React.FC<FeeCardProps> = ({ record, index, isStaff }) => {
  const remaining = record.totalAmount - record.paidAmount;
  const isPaid = remaining <= 0;
  const dueDate = (record.dueDate as Timestamp).toDate();
  const isOverdue = !isPaid && dueDate < new Date();
  const progressPct = Math.min((record.paidAmount / record.totalAmount) * 100, 100);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadReceipt = useCallback(async () => {
    setDownloading(true);
    try {
      const blob = await pdf(<FeeReceiptPDF record={record} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${record.studentName.replace(/\s+/g, "-").toLowerCase()}-${record.id?.slice(-6) ?? "fee"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Receipt downloaded!");
    } catch {
      toast.error("Failed to generate receipt.");
    } finally {
      setDownloading(false);
    }
  }, [record]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
    >
      <SpotlightCard className="p-5 space-y-3">
        {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isPaid ? "bg-green-500/10" : isOverdue ? "bg-red-500/10" : "bg-blue-500/10"}`}>
            <IndianRupee className={`h-4 w-4 ${isPaid ? "text-green-600" : isOverdue ? "text-red-600" : "text-blue-600"}`} />
          </div>
          <div>
            {isStaff && (
              <p className="text-sm font-medium">{record.studentName}
                {record.rollNo && <span className="text-muted-foreground ml-1">({record.rollNo})</span>}
              </p>
            )}
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" className={`text-xs ${
                isPaid ? "bg-green-500/10 text-green-600 border-green-500/20" :
                isOverdue ? "bg-red-500/10 text-red-600 border-red-500/20" :
                "bg-blue-500/10 text-blue-600 border-blue-500/20"
              }`}>
                {isPaid ? "Paid" : isOverdue ? "Overdue" : "Pending"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Due: {format(dueDate, "dd MMM yyyy")}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">₹{record.totalAmount.toLocaleString("en-IN")}</p>
          {!isPaid && (
            <p className="text-xs text-muted-foreground">
              ₹{remaining.toLocaleString("en-IN")} remaining
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${isPaid ? "bg-green-500" : isOverdue ? "bg-red-500" : "bg-blue-500"}`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          ₹{record.paidAmount.toLocaleString("en-IN")} / ₹{record.totalAmount.toLocaleString("en-IN")} paid ({Math.round(progressPct)}%)
        </p>
      </div>

      {/* Transactions */}
      {record.transactions && record.transactions.length > 0 && (
        <div className="pt-2 border-t space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Payment History</p>
          {record.transactions.map((tx, i) => {
            const txDate = (tx.date as Timestamp).toDate();
            return (
              <div key={tx.txId || i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Receipt className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{format(txDate, "dd MMM yyyy")}</span>
                  <span className="text-xs text-muted-foreground font-mono">#{tx.txId?.slice(-6)}</span>
                </div>
                <span className="font-medium text-green-600">
                  +₹{tx.amount.toLocaleString("en-IN")}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Download Receipt Button */}
      <div className="flex justify-end pt-2 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadReceipt}
          disabled={downloading}
          className="gap-2"
        >
          {downloading ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" />Generating...</>
          ) : (
            <><Download className="h-3.5 w-3.5" />Download Receipt</>
          )}
        </Button>
      </div>
      </SpotlightCard>
    </motion.div>
  );
};

export default FeesPage;
