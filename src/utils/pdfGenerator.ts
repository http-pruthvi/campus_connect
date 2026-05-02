import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateReceiptPDF = (transaction, user, feeRecord) => {
  const doc = new jsPDF();
  
  // Set fonts and colors
  doc.setFont("helvetica");
  
  // Header: University Name
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text("CAMPUS CONNECT", 105, 20, { align: "center" });
  
  doc.setFontSize(14);
  doc.setTextColor(71, 85, 105); // Slate 500
  doc.text("Official Payment Receipt", 105, 28, { align: "center" });
  
  // Divider line
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.5);
  doc.line(14, 35, 196, 35);
  
  // Student Information Section
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont("helvetica", "bold");
  doc.text("Student Details", 14, 45);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${user?.name || "N/A"}`, 14, 52);
  doc.text(`Email: ${user?.email || "N/A"}`, 14, 58);
  doc.text(`Department: ${user?.department || "N/A"}`, 14, 64);
  doc.text(`Year: ${user?.year || "N/A"}`, 14, 70);
  
  // Receipt/Transaction Details Section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Receipt Information", 120, 45);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Receipt No: ${transaction?.referenceNumber || `TXN-${transaction?.id}`}`, 120, 52);
  doc.text(`Date: ${new Date(transaction?.date).toLocaleDateString()}`, 120, 58);
  doc.text(`Time: ${new Date(transaction?.date).toLocaleTimeString()}`, 120, 64);
  doc.text(`Payment Method: ${transaction?.paymentMethod || "Cash"}`, 120, 70);
  
  // Transaction Table
  const tableData = [
    [
      transaction?.type || "Fee Payment",
      transaction?.referenceNumber || `TXN-${transaction?.id}`,
      `Rs. ${transaction?.amount || 0}`
    ]
  ];
  
  autoTable(doc, {
    startY: 85,
    head: [["Description", "Reference", "Amount Paid"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 6 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 60 },
      2: { cellWidth: "auto", halign: "right" }
    }
  });
  
  const finalY = doc.lastAutoTable.finalY + 15;
  
  // Account Summary
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Account Summary", 14, finalY);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Fees Expected: Rs. ${feeRecord?.totalFees || 0}`, 14, finalY + 8);
  doc.text(`Total Amount Paid: Rs. ${feeRecord?.paidFees || 0}`, 14, finalY + 14);
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(244, 63, 94); // Rose 500
  doc.text(`Outstanding Balance: Rs. ${feeRecord?.remainingFees || 0}`, 14, finalY + 20);
  
  // Footer
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text("This is an electronically generated receipt and does not require a physical signature.", 105, 280, { align: "center" });
  
  // Save PDF
  doc.save(`CampusConnect_Receipt_TXN-${transaction?.id}.pdf`);
};
