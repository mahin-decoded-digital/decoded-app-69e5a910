import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ClassSession,
  Booking,
  User,
  MembershipPlan,
  UserMembership,
  Transaction,
  StudioSettings,
  Role,
  BookingStatus
} from '../types';
import { MOCK_USERS } from './authStore';

interface StudioState {
  users: User[];
  classes: ClassSession[];
  bookings: Booking[];
  membershipPlans: MembershipPlan[];
  userMemberships: UserMembership[];
  transactions: Transaction[];
  settings: StudioSettings;

  // Actions
  addUser: (user: User) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;

  addClass: (session: Omit<ClassSession, 'id'>) => void;
  updateClass: (id: string, session: Partial<ClassSession>) => void;
  deleteClass: (id: string) => void;

  bookClass: (classId: string, userId: string, isWaitlist?: boolean) => void;
  cancelBooking: (bookingId: string) => void;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;

  addMembershipPlan: (plan: Omit<MembershipPlan, 'id'>) => void;
  updateMembershipPlan: (id: string, plan: Partial<MembershipPlan>) => void;
  deleteMembershipPlan: (id: string) => void;

  purchaseMembership: (userId: string, planId: string) => void;

  updateSettings: (settings: Partial<StudioSettings>) => void;
}

const INITIAL_MEMBERSHIP_PLANS: MembershipPlan[] = [
  { id: 'p1', name: 'Drop-in Class', type: 'drop-in', price: 20, credits: 1, validityDays: 30 },
  { id: 'p2', name: '10 Class Pass', type: 'pass', price: 150, credits: 10, validityDays: 180 },
  { id: 'p3', name: 'Monthly Unlimited', type: 'unlimited', price: 120, credits: null, validityDays: 30 },
];

const INITIAL_CLASSES: ClassSession[] = [
  {
    id: 'c1',
    title: 'Morning Vinyasa Flow',
    description: 'Start your day with an energizing flow.',
    instructorId: 'u3',
    capacity: 20,
    startTime: new Date(Date.now() + 86400000).toISOString(),
    endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
    price: 20,
    isRecurring: false,
  },
  {
    id: 'c2',
    title: 'Evening Restorative',
    description: 'Wind down your day.',
    instructorId: 'u3',
    capacity: 15,
    startTime: new Date(Date.now() + 172800000).toISOString(),
    endTime: new Date(Date.now() + 172800000 + 3600000).toISOString(),
    price: 20,
    isRecurring: true,
    recurringGroupId: 'rg1',
  }
];

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => ({
      users: MOCK_USERS,
      classes: INITIAL_CLASSES,
      bookings: [],
      membershipPlans: INITIAL_MEMBERSHIP_PLANS,
      userMemberships: [],
      transactions: [],
      settings: {
        bookAdvanceHours: 72,
        freeCancelHours: 12,
        instantCharge: true,
      },

      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      updateUser: (id, userUpdate) => set((state) => ({
        users: state.users.map(u => u.id === id ? { ...u, ...userUpdate } : u)
      })),
      deleteUser: (id) => set((state) => ({
        users: state.users.filter(u => u.id !== id)
      })),

      addClass: (session) => set((state) => ({
        classes: [...state.classes, { ...session, id: Math.random().toString(36).substring(7) }]
      })),
      updateClass: (id, sessionUpdate) => set((state) => ({
        classes: state.classes.map(c => c.id === id ? { ...c, ...sessionUpdate } : c)
      })),
      deleteClass: (id) => set((state) => ({
        classes: state.classes.filter(c => c.id !== id),
        bookings: state.bookings.filter(b => b.classId !== id)
      })),

      bookClass: (classId, userId, isWaitlist = false) => set((state) => {
        const cls = state.classes.find(c => c.id === classId);
        if (!cls) return state;

        const existingBookings = state.bookings.filter(b => b.classId === classId && b.status !== 'cancelled');
        const isFull = existingBookings.length >= cls.capacity;

        // Auto waitlist if full
        const status = isWaitlist || isFull ? 'waitlisted' : 'confirmed';

        const newBooking: Booking = {
          id: Math.random().toString(36).substring(7),
          classId,
          userId,
          status,
          bookedAt: new Date().toISOString(),
          paymentStatus: status === 'confirmed' ? 'paid' : 'pending' // Simplified payment
        };

        return { bookings: [...state.bookings, newBooking] };
      }),

      cancelBooking: (bookingId) => set((state) => {
        const booking = state.bookings.find(b => b.id === bookingId);
        if (!booking) return state;

        const newBookings = state.bookings.map(b => 
          b.id === bookingId ? { ...b, status: 'cancelled' as BookingStatus, paymentStatus: 'refunded' } : b
        );

        // Auto-promote waitlist
        const cls = state.classes.find(c => c.id === booking.classId);
        if (cls && booking.status === 'confirmed') {
          const confirmedCount = newBookings.filter(b => b.classId === cls.id && b.status === 'confirmed').length;
          if (confirmedCount < cls.capacity) {
            // Find first waitlisted
            const waitlisted = newBookings
              .filter(b => b.classId === cls.id && b.status === 'waitlisted')
              .sort((a, b) => new Date(a.bookedAt).getTime() - new Date(b.bookedAt).getTime());
            
            if (waitlisted.length > 0) {
              const toPromote = waitlisted[0];
              const promotedIndex = newBookings.findIndex(b => b.id === toPromote.id);
              if (promotedIndex >= 0) {
                newBookings[promotedIndex] = { 
                  ...newBookings[promotedIndex], 
                  status: 'confirmed',
                  paymentStatus: 'paid'
                };
              }
            }
          }
        }

        // Issue refund transaction
        const newTransaction: Transaction = {
          id: Math.random().toString(36).substring(7),
          userId: booking.userId,
          amount: cls?.price || 0,
          type: 'refund',
          date: new Date().toISOString(),
          description: `Refund for class cancellation`
        };

        return { 
          bookings: newBookings,
          transactions: [...state.transactions, newTransaction]
        };
      }),

      updateBookingStatus: (bookingId, status) => set((state) => ({
        bookings: state.bookings.map(b => b.id === bookingId ? { ...b, status } : b)
      })),

      addMembershipPlan: (plan) => set((state) => ({
        membershipPlans: [...state.membershipPlans, { ...plan, id: Math.random().toString(36).substring(7) }]
      })),
      updateMembershipPlan: (id, planUpdate) => set((state) => ({
        membershipPlans: state.membershipPlans.map(p => p.id === id ? { ...p, ...planUpdate } : p)
      })),
      deleteMembershipPlan: (id) => set((state) => ({
        membershipPlans: state.membershipPlans.filter(p => p.id !== id)
      })),

      purchaseMembership: (userId, planId) => set((state) => {
        const plan = state.membershipPlans.find(p => p.id === planId);
        if (!plan) return state;

        const newMembership: UserMembership = {
          id: Math.random().toString(36).substring(7),
          userId,
          planId,
          creditsRemaining: plan.credits,
          validUntil: new Date(Date.now() + plan.validityDays * 86400000).toISOString(),
          status: 'active'
        };

        const newTransaction: Transaction = {
          id: Math.random().toString(36).substring(7),
          userId,
          amount: plan.price,
          type: 'purchase',
          date: new Date().toISOString(),
          description: `Purchase: ${plan.name}`
        };

        return {
          userMemberships: [...state.userMemberships, newMembership],
          transactions: [...state.transactions, newTransaction]
        };
      }),

      updateSettings: (settings) => set((state) => ({
        settings: { ...state.settings, ...settings }
      })),
    }),
    {
      name: 'studioflow-data'
    }
  )
);
