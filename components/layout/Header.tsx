"use client"

import { Search, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <header className="h-16 border-b border-dark-audio-border bg-dark-audio-surface flex items-center px-4 sm:px-6">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden mr-3 p-2 rounded-lg text-dark-audio-text-muted hover:bg-dark-audio-surface-elevated hover:text-dark-audio-text transition-colors"
        aria-label="메뉴 열기"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Search Bar */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-audio-text-muted" />
          <Input
            type="search"
            placeholder="Search plugins, developers, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-dark-audio-surface-elevated border-dark-audio-border text-dark-audio-text placeholder:text-dark-audio-text-dim focus-visible:ring-dark-audio-cyan"
          />
        </div>
      </div>
    </header>
  )
}
