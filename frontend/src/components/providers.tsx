"use client"

import { ThemeProvider } from "next-themes"

// attribute="class"   → applies .dark / .light class on <html>
// defaultTheme="light" → first-time visitors land on light; user toggles persist
// enableSystem omitted → don't auto-follow OS, since the toggle is a 2-state
//   dark/light switch and "system" isn't a user-selectable option in the UI
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      {children}
    </ThemeProvider>
  )
}
