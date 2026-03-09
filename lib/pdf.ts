import jsPDF from "jspdf";
import { ReceiptFormData } from "@/types/receipt";

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatINR(val: string | number): string {
  const n = typeof val === "string" ? parseFloat(val) : val;
  if (!n && n !== 0) return "INR 0";
  return `INR ${n.toLocaleString("en-IN")}`;
}

function v(val: string | undefined | null): string {
  if (!val || val.trim() === "") return "-";
  return val;
}

function calcNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  const diff = Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

export async function generatePDF(
  _element: HTMLElement,
  bookingId: string,
  name: string,
  data: ReceiptFormData
): Promise<void> {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageW = 210;
  const marginX = 14;
  const contentW = pageW - marginX * 2;
  const darkGreen: [number, number, number] = [26, 71, 49];
  const lightGray: [number, number, number] = [243, 244, 246];
  const white: [number, number, number] = [255, 255, 255];
  const borderGray: [number, number, number] = [209, 213, 219];

  let y = 0;

  // ── Header ──────────────────────────────────────────────
  pdf.setFillColor(...darkGreen);
  pdf.rect(0, 0, pageW, 36, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text("The Tirthan Valley", pageW / 2, 12, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("Your Gateway to Himalayan Paradise", pageW / 2, 18, { align: "center" });

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.text("PACKAGE BOOKING RECEIPT", pageW / 2, 25, { align: "center" });

  y = 36;

  // ── Meta bar ─────────────────────────────────────────────
  pdf.setFillColor(249, 250, 251);
  pdf.rect(0, y, pageW, 8, "F");
  pdf.setDrawColor(...borderGray);
  pdf.line(0, y + 8, pageW, y + 8);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(107, 114, 128);
  pdf.text(data.generatedAt ? `Receipt generated on: ${data.generatedAt}` : "Receipt generated on: -", marginX, y + 5.5);
  pdf.text(`Booking ID: ${v(bookingId)}`, pageW - marginX, y + 5.5, { align: "right" });

  y += 8;

  // ── Helper: draw a section ────────────────────────────────
  const ROW_H = 7;
  const PAGE_H = 297;
  const BOTTOM_MARGIN = 20;

  function checkPageBreak(neededH: number) {
    if (y + neededH > PAGE_H - BOTTOM_MARGIN) {
      pdf.addPage();
      y = 10;
    }
  }

  function drawSectionHeader(title: string) {
    checkPageBreak(14);
    y += 6;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...darkGreen);
    pdf.text(title, marginX, y + 5);
    y += 7;
    pdf.setDrawColor(...darkGreen);
    pdf.setLineWidth(0.5);
    pdf.line(marginX, y, marginX + contentW, y);
    y += 3;
  }

  function drawRow(label: string, value: string, isGray: boolean) {
    checkPageBreak(ROW_H);
    if (isGray) {
      pdf.setFillColor(...lightGray);
    } else {
      pdf.setFillColor(...white);
    }
    pdf.rect(marginX, y, contentW, ROW_H, "F");

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(107, 114, 128);
    pdf.text(label, marginX + 3, y + 4.8);

    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(17, 24, 39);
    pdf.text(value, marginX + contentW - 3, y + 4.8, { align: "right" });

    y += ROW_H;
  }

  function drawEmptyRow(text: string) {
    checkPageBreak(ROW_H);
    pdf.setFillColor(...white);
    pdf.rect(marginX, y, contentW, ROW_H, "F");
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(9);
    pdf.setTextColor(156, 163, 175);
    pdf.text(text, marginX + contentW / 2, y + 4.8, { align: "center" });
    y += ROW_H;
  }

  // ── Traveler Details ──────────────────────────────────────
  drawSectionHeader("Traveler Details");
  drawRow("Full Name", v(data.travelerName), true);
  drawRow("Phone Number", v(data.travelerPhone), false);

  // ── Trip Summary ──────────────────────────────────────────
  drawSectionHeader("Trip Summary");
  drawRow("Package Name", v(data.packageName), true);
  drawRow("Duration", v(data.duration), false);
  drawRow("Number of Travelers", v(data.numberOfTravelers), true);
  drawRow("Travel Date From", formatDate(data.travelDateFrom), false);
  drawRow("Travel Date To", formatDate(data.travelDateTo), true);

  // ── Hotel Details ─────────────────────────────────────────
  const nights = calcNights(data.checkInDate, data.checkOutDate);
  const pricePerNight = parseFloat(data.pricePerNight) || 0;
  const hotelTotal = nights * pricePerNight;

  drawSectionHeader("Hotel Details");
  if (!data.includeHotel) {
    drawEmptyRow("No Hotel Booking");
  } else {
    drawRow("Hotel Name", v(data.hotelName), true);
    drawRow("Room Type", v(data.roomType), false);
    drawRow("Check-in Date", formatDate(data.checkInDate), true);
    drawRow("Check-out Date", formatDate(data.checkOutDate), false);
    drawRow("Nights", nights > 0 ? `${nights} Night${nights > 1 ? "s" : ""}` : "-", true);
    drawRow("Guests", v(data.numberOfTravelers), false);
    drawRow("Meal Plan", v(data.mealPlan), true);
    drawRow("Price per Night", pricePerNight ? formatINR(pricePerNight) : "INR 0", false);
    drawRow("Hotel Total", `INR ${hotelTotal.toLocaleString("en-IN")}`, true);
  }

  // ── Activities ────────────────────────────────────────────
  drawSectionHeader("Activities & Experiences");
  if (!data.includeActivities) {
    drawEmptyRow("No Activities Booked");
  } else if (data.activities.length === 0) {
    drawEmptyRow("No activities added yet");
  } else {
    data.activities.forEach((activity, idx) => {
      if (idx > 0) y += 4;
      const boxStartY = y;
      drawRow(`Activity ${idx + 1}`, v(activity.name), true);
      drawRow("Date", formatDate(activity.date), false);
      drawRow("Time / Session", v(activity.session), true);
      pdf.setDrawColor(209, 213, 219);
      pdf.setLineWidth(0.3);
      pdf.rect(marginX, boxStartY, contentW, y - boxStartY, "S");
    });
  }

  // ── Guide Details ─────────────────────────────────────────
  const guidePrice = parseFloat(data.guidePrice) || 0;
  drawSectionHeader("Guide Details");
  if (!data.includeGuide) {
    drawEmptyRow("No Guide Booked");
  } else {
    drawRow("Guide Name", v(data.guideName), true);
    drawRow("Guide Price", guidePrice ? formatINR(guidePrice) : "INR 0", false);
  }

  // ── Payment Details ───────────────────────────────────────
  const totalAmount = parseFloat(data.totalAmount) || 0;
  const advancePaid = parseFloat(data.advancePaid) || 0;
  const balanceDue = totalAmount - advancePaid;

  drawSectionHeader("Payment Details");
  drawRow("Total Amount", formatINR(data.totalAmount), true);
  drawRow("Advance Paid", formatINR(data.advancePaid), false);
  drawRow("Balance Due", `INR ${balanceDue.toLocaleString("en-IN")}`, true);
  drawRow("Payment Method", v(data.paymentMethod), false);

  // ── Payment summary box ───────────────────────────────────
  y += 6;
  checkPageBreak(22);
  pdf.setDrawColor(...darkGreen);
  pdf.setLineWidth(0.6);
  pdf.roundedRect(marginX, y, contentW, 18, 2, 2, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(107, 114, 128);
  pdf.text("ADVANCE PAID", marginX + 6, y + 6);

  pdf.setFontSize(14);
  pdf.setTextColor(...darkGreen);
  pdf.text(formatINR(data.advancePaid), marginX + 6, y + 13);

  if (data.status) {
    const statusColor =
      data.status === "CONFIRMED" ? hexToRgb("#16a34a")
      : data.status === "CANCELLED" ? hexToRgb("#dc2626")
      : hexToRgb("#d97706");
    pdf.setFillColor(...statusColor);
    pdf.roundedRect(marginX + contentW - 36, y + 5, 32, 8, 2, 2, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(255, 255, 255);
    pdf.text(data.status, marginX + contentW - 20, y + 10.5, { align: "center" });
  }

  y += 22;

  // ── Footer ────────────────────────────────────────────────
  checkPageBreak(20);
  y += 4;
  pdf.setDrawColor(...borderGray);
  pdf.setLineWidth(0.3);
  pdf.line(marginX, y, marginX + contentW, y);
  y += 5;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(156, 163, 175);
  pdf.text("This is a computer-generated receipt and does not require a signature.", pageW / 2, y, { align: "center" });
  y += 4;

  pdf.setFontSize(8);
  pdf.setTextColor(75, 85, 99);
  pdf.text("www.thetirthanvalley.in  |  exploretirthanvalley@gmail.com  |  7807818119", pageW / 2, y, { align: "center" });
  y += 4;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...darkGreen);
  pdf.text("Thank you for choosing The Tirthan Valley!", pageW / 2, y, { align: "center" });

  // ── Save ──────────────────────────────────────────────────
  const safeName = name.replace(/[^a-zA-Z0-9]/g, "_") || "receipt";
  const safeId = bookingId.replace(/[^a-zA-Z0-9]/g, "_") || "unknown";
  pdf.save(`receipt-${safeId}-${safeName}.pdf`);
}
