import { create } from 'zustand';
import { apiUrl } from '@/lib/api';
import {
  ClassSession,
  Booking,
  User,
  MembershipPlan,
  UserMembership,
  Transaction,
  StudioSettings,
  BookingStatus
} from '../types';

interface StudioState {
  users: User[];
  classes: ClassSession[];
  bookings: Booking[];
  membershipPlans: MembershipPlan[];
  userMemberships: UserMembership[];
  transactions: Transaction[];
  settings: StudioSettings;

  loading: boolean;
  loaded: boolean;
  error: string | null;

  fetchAll: () => Promise<void>;

  // Actions
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  addClass: (session: Omit<ClassSession, 'id'>) => Promise<void>;
  updateClass: (id: string, session: Partial<ClassSession>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;

  bookClass: (classId: string, userId: string, isWaitlist?: boolean) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => Promise<void>;

  addMembershipPlan: (plan: Omit<MembershipPlan, 'id'>) => Promise<void>;
  updateMembershipPlan: (id: string, plan: Partial<MembershipPlan>) => Promise<void>;
  deleteMembershipPlan: (id: string) => Promise<void>;

  purchaseMembership: (userId: string, planId: string) => Promise<void>;

  updateSettings: (settings: Partial<StudioSettings>) => Promise<void>;
}

export const useStudioStore = create<StudioState>((set, get) => ({
  users: [],
  classes: [],
  bookings: [],
  membershipPlans: [],
  userMemberships: [],
  transactions: [],
  settings: {
    bookAdvanceHours: 72,
    freeCancelHours: 12,
    instantCharge: true,
  },
  loading: false,
  loaded: false,
  error: null,

  fetchAll: async () => {
    if (get().loading || get().loaded) return;
    set({ loading: true, error: null });
    try {
      const [
        usersRes,
        classesRes,
        bookingsRes,
        plansRes,
        membershipsRes,
        transactionsRes,
        settingsRes
      ] = await Promise.all([
        fetch(apiUrl('/api/users')),
        fetch(apiUrl('/api/classes')),
        fetch(apiUrl('/api/bookings')),
        fetch(apiUrl('/api/membershipPlans')),
        fetch(apiUrl('/api/userMemberships')),
        fetch(apiUrl('/api/transactions')),
        fetch(apiUrl('/api/settings'))
      ]);

      if (!usersRes.ok || !classesRes.ok) throw new Error('Failed to fetch data');

      const [
        users, classes, bookings, membershipPlans, userMemberships, transactions, settings
      ] = await Promise.all([
        usersRes.json(),
        classesRes.json(),
        bookingsRes.json(),
        plansRes.json(),
        membershipsRes.json(),
        transactionsRes.json(),
        settingsRes.json()
      ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapId = (arr: any[]) => arr.map(item => ({ ...item, id: item._id || item.id }));

      set({
        users: mapId(users),
        classes: mapId(classes),
        bookings: mapId(bookings),
        membershipPlans: mapId(membershipPlans),
        userMemberships: mapId(userMemberships),
        transactions: mapId(transactions),
        settings: settings._id ? { ...settings, id: settings._id } : settings,
        loading: false,
        loaded: true
      });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : 'Failed to load' });
    }
  },

  addUser: async (user) => {
    try {
      const res = await fetch(apiUrl('/api/users'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      if (!res.ok) throw new Error('Failed');
      const created = await res.json();
      set(s => ({ users: [...s.users, { ...created, id: created._id || created.id }] }));
    } catch (e) { console.error(e); }
  },

  updateUser: async (id, userUpdate) => {
    try {
      const res = await fetch(apiUrl(`/api/users/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userUpdate)
      });
      if (!res.ok) throw new Error('Failed');
      const updated = await res.json();
      set(s => ({ users: s.users.map(u => u.id === id ? { ...updated, id: updated._id || updated.id } : u) }));
    } catch (e) { console.error(e); }
  },

  deleteUser: async (id) => {
    try {
      const res = await fetch(apiUrl(`/api/users/${id}`), { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      set(s => ({ users: s.users.filter(u => u.id !== id) }));
    } catch (e) { console.error(e); }
  },

  addClass: async (session) => {
    try {
      const res = await fetch(apiUrl('/api/classes'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session)
      });
      if (!res.ok) throw new Error('Failed');
      const created = await res.json();
      set(s => ({ classes: [...s.classes, { ...created, id: created._id || created.id }] }));
    } catch (e) { console.error(e); }
  },

  updateClass: async (id, sessionUpdate) => {
    try {
      const res = await fetch(apiUrl(`/api/classes/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionUpdate)
      });
      if (!res.ok) throw new Error('Failed');
      const updated = await res.json();
      set(s => ({ classes: s.classes.map(c => c.id === id ? { ...updated, id: updated._id || updated.id } : c) }));
    } catch (e) { console.error(e); }
  },

  deleteClass: async (id) => {
    try {
      const res = await fetch(apiUrl(`/api/classes/${id}`), { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      set(s => ({
        classes: s.classes.filter(c => c.id !== id),
        bookings: s.bookings.filter(b => b.classId !== id)
      }));
    } catch (e) { console.error(e); }
  },

  bookClass: async (classId, userId, isWaitlist = false) => {
    try {
      const state = get();
      const cls = state.classes.find(c => c.id === classId);
      if (!cls) return;

      const existingBookings = state.bookings.filter(b => b.classId === classId && b.status !== 'cancelled');
      const isFull = existingBookings.length >= cls.capacity;

      const status = isWaitlist || isFull ? 'waitlisted' : 'confirmed';

      const newBooking = {
        classId,
        userId,
        status,
        bookedAt: new Date().toISOString(),
        paymentStatus: status === 'confirmed' ? 'paid' : 'pending'
      };

      const res = await fetch(apiUrl('/api/bookings'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking)
      });
      if (!res.ok) throw new Error('Failed');
      const created = await res.json();
      set(s => ({ bookings: [...s.bookings, { ...created, id: created._id || created.id }] }));
    } catch (e) { console.error(e); }
  },

  cancelBooking: async (bookingId) => {
    try {
      const state = get();
      const booking = state.bookings.find(b => b.id === bookingId);
      if (!booking) return;

      const res = await fetch(apiUrl(`/api/bookings/${bookingId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled', paymentStatus: 'refunded' })
      });
      if (!res.ok) throw new Error('Failed');
      const updatedBooking = await res.json();
      updatedBooking.id = updatedBooking._id || updatedBooking.id;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let promotedBooking: any = null;
      const cls = state.classes.find(c => c.id === booking.classId);
      if (cls && booking.status === 'confirmed') {
        const confirmedCount = state.bookings.filter(b => b.classId === cls.id && b.status === 'confirmed').length - 1;
        if (confirmedCount < cls.capacity) {
          const waitlisted = state.bookings
            .filter(b => b.classId === cls.id && b.status === 'waitlisted')
            .sort((a, b) => new Date(a.bookedAt).getTime() - new Date(b.bookedAt).getTime());
          
          if (waitlisted.length > 0) {
            const toPromote = waitlisted[0]!;
            const pRes = await fetch(apiUrl(`/api/bookings/${toPromote.id}`), {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'confirmed', paymentStatus: 'paid' })
            });
            if (pRes.ok) {
              promotedBooking = await pRes.json();
              promotedBooking.id = promotedBooking._id || promotedBooking.id;
            }
          }
        }
      }

      const newTransaction = {
        userId: booking.userId,
        amount: cls?.price || 0,
        type: 'refund',
        date: new Date().toISOString(),
        description: `Refund for class cancellation`
      };
      const tRes = await fetch(apiUrl('/api/transactions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction)
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let createdTransaction: any = null;
      if (tRes.ok) {
        createdTransaction = await tRes.json();
        createdTransaction.id = createdTransaction._id || createdTransaction.id;
      }

      set((s) => {
         let newBookings = s.bookings.map(b => b.id === bookingId ? updatedBooking : b);
         if (promotedBooking) {
           newBookings = newBookings.map(b => b.id === promotedBooking.id ? promotedBooking : b);
         }
         return {
           bookings: newBookings,
           transactions: createdTransaction ? [...s.transactions, createdTransaction] : s.transactions
         };
      });
    } catch (e) { console.error(e); }
  },

  updateBookingStatus: async (bookingId, status) => {
    try {
      const res = await fetch(apiUrl(`/api/bookings/${bookingId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed');
      const updated = await res.json();
      set(s => ({
        bookings: s.bookings.map(b => b.id === bookingId ? { ...updated, id: updated._id || updated.id } : b)
      }));
    } catch (e) { console.error(e); }
  },

  addMembershipPlan: async (plan) => {
    try {
      const res = await fetch(apiUrl('/api/membershipPlans'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan)
      });
      if (!res.ok) throw new Error('Failed');
      const created = await res.json();
      set(s => ({ membershipPlans: [...s.membershipPlans, { ...created, id: created._id || created.id }] }));
    } catch (e) { console.error(e); }
  },

  updateMembershipPlan: async (id, planUpdate) => {
    try {
      const res = await fetch(apiUrl(`/api/membershipPlans/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planUpdate)
      });
      if (!res.ok) throw new Error('Failed');
      const updated = await res.json();
      set(s => ({
        membershipPlans: s.membershipPlans.map(p => p.id === id ? { ...updated, id: updated._id || updated.id } : p)
      }));
    } catch (e) { console.error(e); }
  },

  deleteMembershipPlan: async (id) => {
    try {
      const res = await fetch(apiUrl(`/api/membershipPlans/${id}`), { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      set(s => ({ membershipPlans: s.membershipPlans.filter(p => p.id !== id) }));
    } catch (e) { console.error(e); }
  },

  purchaseMembership: async (userId, planId) => {
    try {
      const plan = get().membershipPlans.find(p => p.id === planId);
      if (!plan) return;

      const newMembership = {
        userId,
        planId,
        creditsRemaining: plan.credits,
        validUntil: new Date(Date.now() + plan.validityDays * 86400000).toISOString(),
        status: 'active'
      };

      const newTransaction = {
        userId,
        amount: plan.price,
        type: 'purchase',
        date: new Date().toISOString(),
        description: `Purchase: ${plan.name}`
      };

      const mRes = await fetch(apiUrl('/api/userMemberships'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMembership)
      });
      if (!mRes.ok) throw new Error('Failed');
      const createdMembership = await mRes.json();
      createdMembership.id = createdMembership._id || createdMembership.id;

      const tRes = await fetch(apiUrl('/api/transactions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction)
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let createdTransaction: any = null;
      if (tRes.ok) {
        createdTransaction = await tRes.json();
        createdTransaction.id = createdTransaction._id || createdTransaction.id;
      }

      set(s => ({
        userMemberships: [...s.userMemberships, createdMembership],
        transactions: createdTransaction ? [...s.transactions, createdTransaction] : s.transactions
      }));
    } catch (e) { console.error(e); }
  },

  updateSettings: async (settings) => {
    try {
      const res = await fetch(apiUrl('/api/settings'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('Failed');
      const updated = await res.json();
      set({ settings: { ...updated, id: updated._id || updated.id } });
    } catch (e) { console.error(e); }
  }
}));