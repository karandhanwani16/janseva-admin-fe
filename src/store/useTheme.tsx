import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
    isDarkMode: boolean
    toggleTheme: () => void
}

export const useTheme = create<ThemeState>()(
    persist(
        (set) => ({
            isDarkMode: false,
            toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
        }),
        {
            name: 'theme-storage',
        }
    )
)