export interface Activity {
  id: string;
  name: string;
  date: string;
  session: string;
}

export interface ReceiptFormData {
  // Booking Meta
  bookingId: string;
  generatedAt: string;

  // Traveler Details
  travelerName: string;
  travelerPhone: string;

  // Trip Summary
  packageName: string;
  duration: string;
  numberOfTravelers: string;
  travelDateFrom: string;
  travelDateTo: string;

  // Hotel Details
  includeHotel: boolean;
  hotelName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  mealPlan: string;
  pricePerNight: string;

  // Activities
  includeActivities: boolean;
  activities: Activity[];

  // Guide
  includeGuide: boolean;
  guideName: string;
  guidePrice: string;

  // Payment
  totalAmount: string;
  advancePaid: string;
  paymentMethod: string;
  status: string;
}
