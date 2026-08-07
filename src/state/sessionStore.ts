import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TechnicalStaffProfile } from '../types';
import { TECHNICAL_STAFF_USERS } from '../data/mockData';

interface SessionState {
  currentUser: TechnicalStaffProfile;
  isLoggedIn: boolean;
  login: (user: TechnicalStaffProfile) => void;
  logout: () => void;
  switchUser: (user: TechnicalStaffProfile) => void;
  updateAssignedDepartments: (departmentIds: string[]) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      currentUser: TECHNICAL_STAFF_USERS[0],
      isLoggedIn: false,

      login: (user) => set({ currentUser: user, isLoggedIn: true }),
      logout: () => set({ isLoggedIn: false }),
      switchUser: (user) => set({ currentUser: user, isLoggedIn: true }),

      updateAssignedDepartments: (departmentIds) =>
        set((state) => ({
          currentUser: { ...state.currentUser, assignedDepartmentIds: departmentIds },
        })),
    }),
    {
      name: 'ticketsys-session',
      partialize: (state) => ({ currentUser: state.currentUser, isLoggedIn: state.isLoggedIn }),
    }
  )
);