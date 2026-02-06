"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeLogo() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return default logo to avoid hydration mismatch
    return (
      <img
        src="/derived.svg"
        alt="Derived"
        className="h-8 w-auto"
      />
    )
  }

  return (
    <img
      src="/derived.svg"
      alt="Derived"
      className="h-8 w-auto"
    />
  )
}
