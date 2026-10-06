"use client"

import * as React from "react"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

// the icons are CSS-toggled, but the aria-label depends on the resolved theme,
// which only the client knows. render a generic label until mounted so server
// and client agree on first paint, then swap to the dynamic label.


//allowing ThemeToggle to accpet className class of typeScript
type ThemeToggleProps = {
  className: string
}

export function ThemeToggle( {className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  const next = resolvedTheme === "dark" ? "light" : "dark"

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={mounted ? `Switch to ${next} mode` : "Toggle theme"}
      onClick={() => setTheme(next)}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
