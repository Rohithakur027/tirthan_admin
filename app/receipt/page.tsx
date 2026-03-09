"use client";

import { useState, useRef, useCallback } from "react";
import ReceiptForm from "@/components/ReceiptForm";
import ReceiptPreview from "@/components/ReceiptPreview";
import { ReceiptFormData } from "@/types/receipt";

function getNow(): string {
  const d = new Date();
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

const initialData: ReceiptFormData = {
  bookingId: "",
  generatedAt: getNow(),
  travelerName: "",
  travelerPhone: "",
  packageName: "",
  duration: "",
  numberOfTravelers: "",
  travelDateFrom: "",
  travelDateTo: "",
  includeHotel: true,
  hotelName: "",
  roomType: "",
  checkInDate: "",
  checkOutDate: "",
  mealPlan: "",
  pricePerNight: "",
  includeActivities: true,
  activities: [],
  includeGuide: true,
  guideName: "",
  guidePrice: "",
  totalAmount: "",
  advancePaid: "",
  paymentMethod: "",
  status: "",
};

export default function ReceiptPage() {
  const [data, setData] = useState<ReceiptFormData>(initialData);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = useCallback(async () => {
    if (!previewRef.current) return;
    setPdfLoading(true);
    try {
      const { generatePDF } = await import("@/lib/pdf");
      await generatePDF(previewRef.current, data.bookingId, data.travelerName, data);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("PDF generation failed. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  }, [data]);

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Receipt Generator</h1>
          <p className="text-xs text-gray-400 mt-0.5">Fill in the form to generate a booking receipt</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Mobile: toggle preview */}
          <button
            type="button"
            onClick={() => setShowMobilePreview(true)}
            className="md:hidden px-4 py-2 text-sm font-medium text-[#1a4731] border border-[#1a4731] rounded-md hover:bg-[#1a4731]/5 transition-colors"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#1a4731] text-white rounded-md hover:bg-[#1a4731]/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pdfLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Form panel */}
        <div className="w-full md:w-[420px] lg:w-[460px] shrink-0 overflow-y-auto border-r border-gray-200 p-5 space-y-4">
          <ReceiptForm data={data} onChange={setData} />
        </div>

        {/* Desktop preview panel */}
        <div className="hidden md:block flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-2xl mx-auto">
            <p className="text-xs text-gray-400 mb-4 text-center uppercase tracking-widest font-medium">Live Preview</p>
            <ReceiptPreview ref={previewRef} data={data} />
          </div>
        </div>
      </div>

      {/* Mobile preview modal */}
      {showMobilePreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white md:hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <span className="font-semibold text-gray-800">Receipt Preview</span>
            <button
              type="button"
              onClick={() => setShowMobilePreview(false)}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
            <ReceiptPreview ref={previewRef} data={data} />
          </div>
          <div className="p-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium bg-[#1a4731] text-white rounded-md hover:bg-[#1a4731]/90 transition-colors disabled:opacity-60"
            >
              {pdfLoading ? "Generating..." : "Download PDF"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
