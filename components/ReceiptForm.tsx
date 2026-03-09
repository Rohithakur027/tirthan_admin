"use client";

import { useEffect } from "react";
import SectionToggle from "./SectionToggle";
import { ReceiptFormData, Activity } from "@/types/receipt";

interface ReceiptFormProps {
  data: ReceiptFormData;
  onChange: (data: ReceiptFormData) => void;
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
        checked ? "bg-[#1a4731]" : "bg-gray-300"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1a4731]/30 focus:border-[#1a4731] placeholder:text-gray-400";
const readonlyCls =
  "w-full border border-gray-100 rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50 cursor-not-allowed";
const selectCls =
  "w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1a4731]/30 focus:border-[#1a4731] bg-white";

function calcNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  const diff = Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

function newActivity(): Activity {
  return { id: crypto.randomUUID(), name: "", date: "", session: "" };
}

export default function ReceiptForm({ data, onChange }: ReceiptFormProps) {
  const set = (field: keyof ReceiptFormData, value: unknown) => {
    onChange({ ...data, [field]: value });
  };

  const nights = calcNights(data.checkInDate, data.checkOutDate);
  const pricePerNight = parseFloat(data.pricePerNight) || 0;
  const hotelTotal = nights * pricePerNight;

  const totalAmount = parseFloat(data.totalAmount) || 0;
  const advancePaid = parseFloat(data.advancePaid) || 0;
  const balanceDue = totalAmount - advancePaid;

  // Sync guests from numberOfTravelers (read-only display)
  const guests = data.numberOfTravelers;

  const addActivity = () => {
    onChange({ ...data, activities: [...data.activities, newActivity()] });
  };

  const updateActivity = (id: string, field: keyof Activity, value: string) => {
    onChange({
      ...data,
      activities: data.activities.map((a) =>
        a.id === id ? { ...a, [field]: value } : a
      ),
    });
  };

  const removeActivity = (id: string) => {
    onChange({
      ...data,
      activities: data.activities.filter((a) => a.id !== id),
    });
  };

  return (
    <div className="space-y-4">
      {/* 1. Booking Meta */}
      <SectionToggle title="Booking Meta">
        <Field label="Booking ID">
          <input
            type="text"
            className={inputCls}
            placeholder="e.g. TV-2026-0042"
            value={data.bookingId}
            onChange={(e) => set("bookingId", e.target.value)}
          />
        </Field>
        <Field label="Generated Timestamp">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              className={readonlyCls + " flex-1"}
              value={`Receipt generated on: ${data.generatedAt}`}
              readOnly
            />
            <button
              type="button"
              onClick={() => {
                const d = new Date();
                const ts = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
                onChange({ ...data, generatedAt: ts });
              }}
              className="p-2 rounded-md border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-[#1a4731] transition-colors"
              title="Refresh timestamp"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </Field>
      </SectionToggle>

      {/* 2. Traveler Details */}
      <SectionToggle title="Traveler Details">
        <Field label="Full Name">
          <input
            type="text"
            className={inputCls}
            placeholder="e.g. Rohit Sharma"
            value={data.travelerName}
            onChange={(e) => set("travelerName", e.target.value)}
          />
        </Field>
        <Field label="Phone Number">
          <input
            type="tel"
            className={inputCls}
            placeholder="e.g. +91 98765 43210"
            value={data.travelerPhone}
            onChange={(e) => set("travelerPhone", e.target.value)}
          />
        </Field>
      </SectionToggle>

      {/* 3. Trip Summary */}
      <SectionToggle title="Trip Summary">
        <Field label="Package Name">
          <input
            type="text"
            className={inputCls}
            placeholder="Tirthan Valley Getaway Package"
            value={data.packageName}
            onChange={(e) => set("packageName", e.target.value)}
          />
        </Field>
        <Field label="Duration">
          <input
            type="text"
            className={inputCls}
            placeholder="e.g. 2 Nights / 3 Days"
            value={data.duration}
            onChange={(e) => set("duration", e.target.value)}
          />
        </Field>
        <Field label="Number of Travelers">
          <input
            type="text"
            className={inputCls}
            placeholder="e.g. 4 Guests"
            value={data.numberOfTravelers}
            onChange={(e) => set("numberOfTravelers", e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Travel Date From">
            <input
              type="date"
              className={inputCls}
              value={data.travelDateFrom}
              onChange={(e) => set("travelDateFrom", e.target.value)}
            />
          </Field>
          <Field label="Travel Date To">
            <input
              type="date"
              className={inputCls}
              value={data.travelDateTo}
              onChange={(e) => set("travelDateTo", e.target.value)}
            />
          </Field>
        </div>
      </SectionToggle>

      {/* 4. Hotel Details */}
      <SectionToggle title="Hotel Details">
        <div className="flex items-center gap-3">
          <Toggle
            checked={data.includeHotel}
            onChange={(v) => set("includeHotel", v)}
          />
          <span className="text-sm text-gray-600">Include Hotel Booking</span>
        </div>

        {!data.includeHotel && (
          <input
            type="text"
            className={readonlyCls}
            value="No Hotel Booking"
            readOnly
          />
        )}

        {data.includeHotel && (
          <>
            <Field label="Hotel Name">
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. Tirthan River Camp"
                value={data.hotelName}
                onChange={(e) => set("hotelName", e.target.value)}
              />
            </Field>
            <Field label="Room Type">
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. Deluxe Cottage"
                value={data.roomType}
                onChange={(e) => set("roomType", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Check-in Date">
                <input
                  type="date"
                  className={inputCls}
                  value={data.checkInDate}
                  onChange={(e) => set("checkInDate", e.target.value)}
                />
              </Field>
              <Field label="Check-out Date">
                <input
                  type="date"
                  className={inputCls}
                  value={data.checkOutDate}
                  onChange={(e) => set("checkOutDate", e.target.value)}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nights (auto)">
                <input
                  type="text"
                  className={readonlyCls}
                  value={nights > 0 ? `${nights} Night${nights > 1 ? "s" : ""}` : "—"}
                  readOnly
                />
              </Field>
              <Field label="Guests (auto)">
                <input
                  type="text"
                  className={readonlyCls}
                  value={guests || "—"}
                  readOnly
                />
              </Field>
            </div>
            <Field label="Meal Plan">
              <select
                className={selectCls}
                value={data.mealPlan}
                onChange={(e) => set("mealPlan", e.target.value)}
              >
                <option value="">Select meal plan</option>
                <option value="Breakfast Included">Breakfast Included</option>
                <option value="Lunch Included">Lunch Included</option>
                <option value="All Meals">All Meals</option>
                <option value="Room Only">Room Only</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price per Night (INR)">
                <input
                  type="number"
                  className={inputCls}
                  placeholder="0"
                  min="0"
                  value={data.pricePerNight}
                  onChange={(e) => set("pricePerNight", e.target.value)}
                />
              </Field>
              <Field label="Hotel Total (auto)">
                <input
                  type="text"
                  className={readonlyCls}
                  value={`INR ${hotelTotal.toLocaleString("en-IN")}`}
                  readOnly
                />
              </Field>
            </div>
          </>
        )}
      </SectionToggle>

      {/* 5. Activities */}
      <SectionToggle title="Activities & Experiences">
        <div className="flex items-center gap-3">
          <Toggle
            checked={data.includeActivities}
            onChange={(v) => set("includeActivities", v)}
          />
          <span className="text-sm text-gray-600">Include Activities</span>
        </div>

        {!data.includeActivities && (
          <input
            type="text"
            className={readonlyCls}
            value="No Activities Booked"
            readOnly
          />
        )}

        {data.includeActivities && (
          <>
            {data.activities.map((activity, idx) => (
              <div
                key={activity.id}
                className="border border-gray-200 rounded-md p-3 space-y-2 relative"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Activity {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeActivity(activity.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove activity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <Field label="Activity Name">
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="e.g. Trout Fishing"
                    value={activity.name}
                    onChange={(e) => updateActivity(activity.id, "name", e.target.value)}
                  />
                </Field>
                <Field label="Date">
                  <input
                    type="date"
                    className={inputCls}
                    value={activity.date}
                    onChange={(e) => updateActivity(activity.id, "date", e.target.value)}
                  />
                </Field>
                <Field label="Time / Session">
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="e.g. Morning Session: 6:00 AM - 9:00 AM"
                    value={activity.session}
                    onChange={(e) => updateActivity(activity.id, "session", e.target.value)}
                  />
                </Field>
              </div>
            ))}
            <button
              type="button"
              onClick={addActivity}
              className="flex items-center gap-2 text-sm font-medium text-[#1a4731] hover:text-[#1a4731]/80 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Activity
            </button>
          </>
        )}
      </SectionToggle>

      {/* 6. Guide Details */}
      <SectionToggle title="Guide Details">
        <div className="flex items-center gap-3">
          <Toggle
            checked={data.includeGuide}
            onChange={(v) => set("includeGuide", v)}
          />
          <span className="text-sm text-gray-600">Include Guide</span>
        </div>

        {!data.includeGuide && (
          <input
            type="text"
            className={readonlyCls}
            value="No Guide Booked"
            readOnly
          />
        )}

        {data.includeGuide && (
          <>
            <Field label="Guide Name">
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. Ramesh Kumar"
                value={data.guideName}
                onChange={(e) => set("guideName", e.target.value)}
              />
            </Field>
            <Field label="Guide Price (INR)">
              <input
                type="number"
                className={inputCls}
                placeholder="0"
                min="0"
                value={data.guidePrice}
                onChange={(e) => set("guidePrice", e.target.value)}
              />
            </Field>
          </>
        )}
      </SectionToggle>

      {/* 7. Payment Details */}
      <SectionToggle title="Payment Details">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Total Amount (INR)">
            <input
              type="number"
              className={inputCls}
              placeholder="0"
              min="0"
              value={data.totalAmount}
              onChange={(e) => set("totalAmount", e.target.value)}
            />
          </Field>
          <Field label="Advance Paid (INR)">
            <input
              type="number"
              className={inputCls}
              placeholder="0"
              min="0"
              value={data.advancePaid}
              onChange={(e) => set("advancePaid", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Balance Due (auto)">
          <input
            type="text"
            className={readonlyCls}
            value={`INR ${balanceDue.toLocaleString("en-IN")}`}
            readOnly
          />
        </Field>
        <Field label="Payment Method">
          <select
            className={selectCls}
            value={data.paymentMethod}
            onChange={(e) => set("paymentMethod", e.target.value)}
          >
            <option value="">Select method</option>
            <option value="Advance Payment">Advance Payment</option>
            <option value="Full Payment">Full Payment</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
          </select>
        </Field>
        <Field label="Status">
          <select
            className={selectCls}
            value={data.status}
            onChange={(e) => set("status", e.target.value)}
          >
            <option value="">Select status</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PENDING">PENDING</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </Field>
      </SectionToggle>
    </div>
  );
}
