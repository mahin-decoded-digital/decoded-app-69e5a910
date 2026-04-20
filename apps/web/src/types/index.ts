export type Role = 'admin' | 'staff' | 'instructor' | 'member' | 'finance';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  joinedAt: string;
}

export interface ClassSession {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  capacity: number;
  startTime: string; // ISO string
  endTime: string; // ISO string
  price: number;
  isRecurring: boolean;
  recurringGroupId?: string;
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'checked-in' | 'waitlisted';

export interface Booking {
  id: string;
  classId: string;
  userId: string;
  status: BookingStatus;
  bookedAt: string;
  paymentStatus: 'paid' | 'pending' | 'refunded';
}

export type MembershipType = 'drop-in' | 'pass' | 'unlimited';

export interface MembershipPlan {
  id: string;
  name: string;
  type: MembershipType;
  price: number;
  credits: number | null; // null for unlimited
  validityDays: number;
}

export interface UserMembership {
  id: string;
  userId: string;
  planId: string;
  creditsRemaining: number | null;
  validUntil: string;
  status: 'active' | 'expired';
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'purchase' | 'refund';
  date: string;
  description: string;
}

export interface StudioSettings {
  bookAdvanceHours: number;
  freeCancelHours: number;
  instantCharge: boolean;
}
