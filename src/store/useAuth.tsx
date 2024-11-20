import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean; 
    isForgotVerified: boolean;
    setIsForgotVerified: (isForgotVerified: boolean) => void;
    setUser: (user: User) => void;
    login: (user: User, token: string) => void;
    logout: () => void;
    resetState: () => void;
}

const useAuthStore = create<AuthState>()(
    devtools(
        persist(
            (set) => ({
                user: null,
                token: null,
                isAuthenticated: false,
                isForgotVerified: false,
                setIsForgotVerified: (isForgotVerified: boolean) => set({ isForgotVerified }, false, 'setIsForgotVerified'),
                setUser: (user: User) => set({ user }, false, 'setUser'),
                login: (user: User, token: string) => set({ user, token, isAuthenticated: true }, false, 'login'),
                logout: () => set({ user: null, token: null, isAuthenticated: false }, false, 'logout'),
                resetState: () => set({ user: null, token: null, isAuthenticated: false }, false, 'resetState'),
            }),
            {
                name: 'auth-storage',
                storage: createJSONStorage(() => localStorage),
                partialize: (state: AuthState) => ({
                    user: state.user,
                    token: state.token,
                    isAuthenticated: state.isAuthenticated,
                }),
            }
        )
    )
);

export default useAuthStore;