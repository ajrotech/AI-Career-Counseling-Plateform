export interface BookingDetails {
  id: string;
  date: string;
  time: string;
  duration: number; // in minutes
  mentorName: string;
  mentorEmail: string;
  type: string; // e.g., "1-on-1 Session", "Group Session"
  meetingLink?: string;
  notes?: string;
  price: number;
  currency: string;
}

export interface PaymentDetails {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  description: string;
  service: string; // e.g., "Mentoring Session", "Assessment"
  date: string;
  bookingId?: string;
  createdAt: Date;
}