import type { AuthState } from '@/lib/types/auth-state-types';
import { create } from 'zustand';

export const useAuthStore = create<AuthState>((set) => ({
	user: { email: '', user_id: '', role: '', isLoggedIn: false },
	login: (state) => set({ user: state }),
	logout: () =>
		set({
			user: { email: '', user_id: '', role: '', isLoggedIn: false },
		}),
}));
