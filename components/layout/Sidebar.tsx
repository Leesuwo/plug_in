"use client"

import { Home, Search } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Plugins", href: "/plugins", icon: Search },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-dark-audio-surface border-r border-dark-audio-border flex flex-col">
      {/* Logo/Brand */}
      <div className="h-16 flex items-center px-6 border-b border-dark-audio-border">
        <h2 className="text-xl font-bold text-dark-audio-cyan">
          Plugin Archive
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-dark-audio-surface-elevated text-dark-audio-cyan border border-dark-audio-border-light"
                  : "text-dark-audio-text-muted hover:bg-dark-audio-surface-elevated hover:text-dark-audio-text"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-dark-audio-border text-xs text-dark-audio-text-dim">
        <p>Audio Plugin Archive</p>
        <p className="mt-1">v0.1.0</p>
      </div>
    </aside>
  )
}
