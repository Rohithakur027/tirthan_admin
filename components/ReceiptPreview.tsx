"use client";

import { forwardRef } from "react";
import { ReceiptFormData } from "@/types/receipt";

interface ReceiptPreviewProps {
  data: ReceiptFormData;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatINR(val: string | number): string {
  const n = typeof val === "string" ? parseFloat(val) : val;
  if (!n && n !== 0) return "INR 0";
  return `INR ${n.toLocaleString("en-IN")}`;
}

function val(v: string | undefined | null): string {
  if (!v || v.trim() === "") return "—";
  return v;
}

function calcNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  const diff = Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <tr>
      <td colSpan={2} style={{ padding: "18px 0 0 0" }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#1a4731", paddingBottom: 6, borderBottom: "2px solid #1a4731", marginBottom: 8 }}>
          {title}
        </div>
      </td>
    </tr>
  );
}

function Row({ label, value, index }: { label: string; value: string; index: number }) {
  return (
    <tr style={{ backgroundColor: index % 2 === 0 ? "#f3f4f6" : "#ffffff" }}>
      <td style={{ padding: "6px 12px", fontSize: 14, color: "#6b7280", width: "45%", fontWeight: 500, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>{label}</td>
      <td style={{ padding: "6px 12px", fontSize: 14, color: "#111827", textAlign: "right", fontWeight: 500, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>{value}</td>
    </tr>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <tr>
      <td
        colSpan={2}
        style={{ padding: "12px 28px", fontSize: 13, color: "#9ca3af", fontStyle: "italic", textAlign: "center" }}
      >
        {text}
      </td>
    </tr>
  );
}

const ReceiptPreview = forwardRef<HTMLDivElement, ReceiptPreviewProps>(
  function ReceiptPreview({ data }, ref) {
    const nights = calcNights(data.checkInDate, data.checkOutDate);
    const pricePerNight = parseFloat(data.pricePerNight) || 0;
    const hotelTotal = nights * pricePerNight;
    const totalAmount = parseFloat(data.totalAmount) || 0;
    const advancePaid = parseFloat(data.advancePaid) || 0;
    const balanceDue = totalAmount - advancePaid;
    const guidePrice = parseFloat(data.guidePrice) || 0;

    const statusColor =
      data.status === "CONFIRMED"
        ? "#16a34a"
        : data.status === "CANCELLED"
          ? "#dc2626"
          : "#d97706";

    return (
      <div
        ref={ref}
        style={{
          backgroundColor: "#fff",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          width: 794,
          margin: "0 auto",
          border: "1px solid #d1d5db",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#1a4731",
            color: "#fff",
            padding: "24px 28px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "0.01em", marginBottom: 4 }}>
            The Tirthan Valley
          </div>
          <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 16 }}>
            Your Gateway to Himalayan Paradise
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.12em",
              backgroundColor: "rgba(255,255,255,0.15)",
              display: "inline-block",
              padding: "6px 20px",
              borderRadius: 4,
            }}
          >
            PACKAGE BOOKING RECEIPT
          </div>
        </div>

        {/* Meta bar */}
        <div
          style={{
            backgroundColor: "#f9fafb",
            borderBottom: "1px solid #e5e7eb",
            padding: "10px 28px",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 12, color: "#6b7280" }}>
            {data.generatedAt ? `Receipt generated on: ${data.generatedAt}` : "Receipt generated on: —"}
          </span>
          <span style={{ fontSize: 12, color: "#6b7280" }}>
            Booking ID: <strong style={{ color: "#111827" }}>{val(data.bookingId)}</strong>
          </span>
        </div>

        {/* Table */}
        <table style={{ width: "calc(100% - 56px)", margin: "0 28px", borderCollapse: "collapse" }}>
          <tbody>
            {/* Traveler Details */}
            <SectionHeader title="Traveler Details" />
            <Row index={0} label="Full Name" value={val(data.travelerName)} />
            <Row index={1} label="Phone Number" value={val(data.travelerPhone)} />

            {/* Trip Summary */}
            <SectionHeader title="Trip Summary" />
            <Row index={0} label="Package Name" value={val(data.packageName)} />
            <Row index={1} label="Duration" value={val(data.duration)} />
            <Row index={0} label="Number of Travelers" value={val(data.numberOfTravelers)} />
            <Row index={1} label="Travel Date From" value={formatDate(data.travelDateFrom)} />
            <Row index={0} label="Travel Date To" value={formatDate(data.travelDateTo)} />

            {/* Hotel Details */}
            <SectionHeader title="Hotel Details" />
            {!data.includeHotel ? (
              <EmptyRow text="No Hotel Booking" />
            ) : (
              <>
                <Row index={0} label="Hotel Name" value={val(data.hotelName)} />
                <Row index={1} label="Room Type" value={val(data.roomType)} />
                <Row index={0} label="Check-in Date" value={formatDate(data.checkInDate)} />
                <Row index={1} label="Check-out Date" value={formatDate(data.checkOutDate)} />
                <Row index={0} label="Nights" value={nights > 0 ? `${nights} Night${nights > 1 ? "s" : ""}` : "—"} />
                <Row index={1} label="Guests" value={val(data.numberOfTravelers)} />
                <Row index={0} label="Meal Plan" value={val(data.mealPlan)} />
                <Row index={1} label="Price per Night" value={pricePerNight ? formatINR(pricePerNight) : "INR 0"} />
                <Row index={0} label="Hotel Total" value={`INR ${hotelTotal.toLocaleString("en-IN")}`} />
              </>
            )}

            {/* Activities */}
            <SectionHeader title="Activities & Experiences" />
            {!data.includeActivities ? (
              <EmptyRow text="No Activities Booked" />
            ) : data.activities.length === 0 ? (
              <EmptyRow text="No activities added yet" />
            ) : (
              data.activities.map((activity, idx) => (
                <>
                  {idx > 0 && (
                    <tr key={`spacer-${activity.id}`}>
                      <td colSpan={2} style={{ padding: "4px 0", backgroundColor: "#ffffff" }} />
                    </tr>
                  )}
                  <tr key={`name-${activity.id}`} style={{ backgroundColor: "#f3f4f6", borderTop: "1px solid #d1d5db", borderLeft: "1px solid #d1d5db", borderRight: "1px solid #d1d5db" }}>
                    <td style={{ padding: "6px 12px", fontSize: 14, color: "#6b7280", width: "45%", fontWeight: 500, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>{`Activity ${idx + 1}`}</td>
                    <td style={{ padding: "6px 12px", fontSize: 14, color: "#111827", textAlign: "right", fontWeight: 500, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>{val(activity.name)}</td>
                  </tr>
                  <tr key={`date-${activity.id}`} style={{ backgroundColor: "#ffffff", borderLeft: "1px solid #d1d5db", borderRight: "1px solid #d1d5db" }}>
                    <td style={{ padding: "6px 12px", fontSize: 14, color: "#6b7280", width: "45%", fontWeight: 500, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>Date</td>
                    <td style={{ padding: "6px 12px", fontSize: 14, color: "#111827", textAlign: "right", fontWeight: 500, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>{formatDate(activity.date)}</td>
                  </tr>
                  <tr key={`session-${activity.id}`} style={{ backgroundColor: "#f3f4f6", borderBottom: "1px solid #d1d5db", borderLeft: "1px solid #d1d5db", borderRight: "1px solid #d1d5db" }}>
                    <td style={{ padding: "6px 12px", fontSize: 14, color: "#6b7280", width: "45%", fontWeight: 500, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>Time / Session</td>
                    <td style={{ padding: "6px 12px", fontSize: 14, color: "#111827", textAlign: "right", fontWeight: 500, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>{val(activity.session)}</td>
                  </tr>
                </>
              ))
            )}

            {/* Guide Details */}
            <SectionHeader title="Guide Details" />
            {!data.includeGuide ? (
              <EmptyRow text="No Guide Booked" />
            ) : (
              <>
                <Row index={0} label="Guide Name" value={val(data.guideName)} />
                <Row index={1} label="Guide Price" value={guidePrice ? formatINR(guidePrice) : "INR 0"} />
              </>
            )}

            {/* Payment Details */}
            <SectionHeader title="Payment Details" />
            <Row index={0} label="Total Amount" value={formatINR(data.totalAmount)} />
            <Row index={1} label="Advance Paid" value={formatINR(data.advancePaid)} />
            <Row index={0} label="Balance Due" value={`INR ${balanceDue.toLocaleString("en-IN")}`} />
            <Row index={1} label="Payment Method" value={val(data.paymentMethod)} />
          </tbody>
        </table>

        {/* Payment summary box */}
        <div
          style={{
            margin: "16px",
            border: "2px solid #1a4731",
            borderRadius: 8,
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 3 }}>
              ADVANCE PAID
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#1a4731" }}>
              {formatINR(data.advancePaid)}
            </div>
          </div>
          {data.status && (
            <div
              style={{
                backgroundColor: statusColor,
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: "0.08em",
                padding: "6px 18px",
                borderRadius: 999,
              }}
            >
              {data.status}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            padding: "14px 20px",
            textAlign: "center",
            backgroundColor: "#f9fafb",
          }}
        >
          <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6 }}>
            This is a computer-generated receipt and does not require a signature.
          </p>
          <p style={{ fontSize: 12, color: "#4b5563", fontWeight: 500, marginBottom: 4 }}>
            www.thetirthanvalley.in &nbsp;|&nbsp; exploretirthanvalley@gmail.com &nbsp;|&nbsp; 7807818119
          </p>
          <p style={{ fontSize: 13, color: "#1a4731", fontWeight: 700 }}>
            Thank you for choosing The Tirthan Valley!
          </p>
        </div>
      </div>
    );
  }
);

export default ReceiptPreview;
